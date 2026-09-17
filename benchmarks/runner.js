/* Browser-only benchmark adapter. The production parser, GA and workers are unchanged. */
window.runClassicCorpusCase = function(job) {
  return new Promise(function(resolve, reject) {
    var records = [], best = null, geometry = null, pending = null;
    var evaluationStarted, started, finished = false, lastSnapshot = null;
    var seed = job.seed >>> 0;
    Math.random = function() {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    function fail(error) {
      if(finished) return;
      finished = true;
      SvgNest.stop();
      clearTimeout(watchdog);
      reject(error instanceof Error ? error : new Error(error && error.message ? error.message : String(error)));
    }
    var watchdog = setTimeout(function() { fail(new Error('Case exceeded '+job.timeoutMs+' ms')); },job.timeoutMs);
    window.addEventListener('error',function(e) { fail(e.error || e.message); });
    window.addEventListener('unhandledrejection',function(e) { fail(e.reason); });
    function partCopy(part) {
      return {id:part.id, source:part.source, points:part.map(function(p) {return {x:p.x,y:p.y};}),
        children:(part.children || []).map(partCopy)};
    }
    function resultSummary(result) {
      return {fitness:result.fitness, area:result.area,
        placements:result.placements.map(function(bin) {return bin.map(function(p) {
          return {id:p.id,x:p.x,y:p.y,rotation:p.rotation};
        });}), unplaced:result.paths.map(function(p) {return {id:p.id,rotation:p.rotation};})};
    }
    var launch = SvgNest.launchWorkers;
    SvgNest.launchWorkers = function() {
      evaluationStarted = performance.now();
      return launch.apply(this,arguments);
    };
    var map = Parallel.prototype.map;
    Parallel.prototype.map = function(fn, env) {
      this.options.maxWorkers = job.maxWorkers;
      this.options.synchronous = false;
      var worker = this.options.env.self;
      if(worker && !geometry) {
        geometry = {bin:partCopy(worker.binPolygon), parts:worker.paths.map(partCopy), config:worker.config};
      }
      var operation = map.call(this,fn,env);
      operation.then(function(results) {
        if(!worker) return;
        if(!results || !results[0]) throw new Error('Placement worker returned no result');
        // Stop this timer before copying results or rendering/exporting any output.
        pending = {evaluation:records.length, evaluationRuntimeMs:performance.now()-evaluationStarted,
          result:resultSummary(results[0]), inputOrder:worker.paths.map(function(p) {
            return {id:p.id,rotation:p.rotation};
          })};
      },fail);
      return operation;
    };
    SvgNest.onPlacementEvaluation = function(snapshot) { lastSnapshot = snapshot; };
    try {
      SvgNest.config(Object.assign({},job.config,{captureCandidates:job.capture}));
      var svg = SvgNest.parsesvg(job.svg);
      var bin = svg.querySelector('[id="'+job.binId+'"]');
      if(!bin) throw new Error('SVG is missing bin #'+job.binId);
      SvgNest.setbin(bin);
      started = performance.now();
      var result = SvgNest.start(function(){},function(layouts,utilisation,placedParts,totalParts) {
        var rendered = layouts ? layouts.map(function(el) {return new XMLSerializer().serializeToString(el);}) : null;
        // SVGnest's callback occurs before working=false and instrumentation dispatch.
        // Finish at the microtask boundary, before the next 100 ms scheduling tick.
        queueMicrotask(function() {
          try {
            if(finished) return;
            if(!pending) throw new Error('Missing worker result at display callback');
            var record = pending;
            pending = null;
            if(job.capture) {
              if(!lastSnapshot || lastSnapshot.evaluationId !== record.evaluation) throw new Error('Missing/misaligned decision snapshot');
              record.snapshot = lastSnapshot;
              lastSnapshot = null;
            }
            records.push(record);
            if(!best || record.result.fitness < best.result.fitness) {
              if(!rendered) throw new Error('Improved fitness has no rendered SVG');
              best = {evaluation:record.evaluation,result:record.result,svgs:rendered,
                utilisation:utilisation,placedParts:placedParts,totalParts:totalParts};
            }
            if(records.length === job.evaluations) {
              SvgNest.stop();
              var wallRuntimeMs = performance.now()-started;
              var validation = validateGeometry(best.result,geometry);
              finished = true;
              clearTimeout(watchdog);
              resolve({records:records,best:best,geometry:geometry,validation:validation,
                wallRuntimeMs:wallRuntimeMs,workerCount:window.benchmarkWorkerCount || 0});
            }
          } catch(error) { fail(error); }
        });
      });
      if(result === false) throw new Error('SVGnest rejected the SVG/bin');
    } catch(error) { fail(error); }
  });
};

// Independent final-layout checks using the same integer polygon kernel. These
// run after timing and test containment/intersection, not just bounding boxes.
function validateGeometry(result,geometry) {
  var scale = geometry.config.clipperScale, tolerance = 0.0001;
  function clip(points) {return points.map(function(p) {return {X:Math.round(p.x*scale),Y:Math.round(p.y*scale)};});}
  function areaOf(paths) {return Math.abs(paths.reduce(function(sum,p) {return sum+ClipperLib.Clipper.Area(p);},0))/(scale*scale);}
  function booleanArea(a,b,type) {
    var c = new ClipperLib.Clipper(), out = new ClipperLib.Paths();
    c.AddPath(a,ClipperLib.PolyType.ptSubject,true);
    c.AddPath(b,ClipperLib.PolyType.ptClip,true);
    if(!c.Execute(type,out,ClipperLib.PolyFillType.pftNonZero,ClipperLib.PolyFillType.pftNonZero)) throw new Error('Validation clipping failed');
    return areaOf(out);
  }
  var bin = clip(geometry.bin.points), seen = {}, violations = [], checks = 0;
  result.placements.forEach(function(placements,binIndex) {
    var polygons = placements.map(function(p) {
      if(seen[p.id]) violations.push('Duplicate part '+p.id);
      seen[p.id] = true;
      var part = geometry.parts.find(function(part) {return part.id === p.id;});
      if(!part) throw new Error('Unknown placed part '+p.id);
      return clip(rotatePolygon(part.points,p.rotation).map(function(v) {return {x:v.x+p.x,y:v.y+p.y};}));
    });
    polygons.forEach(function(poly,i) {
      checks++;
      var outside = booleanArea(poly,bin,ClipperLib.ClipType.ctDifference);
      if(outside > tolerance) violations.push('Bin '+binIndex+' part '+placements[i].id+' outside area '+outside);
      for(var j=0;j<i;j++) {
        checks++;
        var overlap = booleanArea(poly,polygons[j],ClipperLib.ClipType.ctIntersection);
        if(overlap > tolerance) violations.push('Bin '+binIndex+' parts '+placements[i].id+'/'+placements[j].id+' overlap area '+overlap);
      }
    });
  });
  result.unplaced.forEach(function(p) {
    if(seen[p.id]) violations.push('Part both placed and unplaced '+p.id);
    seen[p.id] = true;
  });
  if(Object.keys(seen).length !== geometry.parts.length) violations.push('Part accounting mismatch');
  return {valid:violations.length === 0,checks:checks,areaTolerance:tolerance,violations:violations};
}
