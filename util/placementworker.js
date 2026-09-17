
// jsClipper uses X/Y instead of x/y...
function toClipperCoordinates(polygon){
	var clone = [];
	for(var i=0; i<polygon.length; i++){
		clone.push({
			X: polygon[i].x,
			Y: polygon[i].y
		});
	}
	
	return clone;
};

function toNestCoordinates(polygon, scale){
	var clone = [];
	for(var i=0; i<polygon.length; i++){
		clone.push({
			x: polygon[i].X/scale,
			y: polygon[i].Y/scale
		});
	}
	
	return clone;
};

function rotatePolygon(polygon, degrees){
	var rotated = [];
	var angle = degrees * Math.PI / 180;
	for(var i=0; i<polygon.length; i++){
		var x = polygon[i].x;
		var y = polygon[i].y;
		var x1 = x*Math.cos(angle)-y*Math.sin(angle);
		var y1 = x*Math.sin(angle)+y*Math.cos(angle);
						
		rotated.push({x:x1, y:y1});
	}
	
	if(polygon.children && polygon.children.length > 0){
		rotated.children = [];
		for(var j=0; j<polygon.children.length; j++){
			rotated.children.push(rotatePolygon(polygon.children[j], degrees));
		}
	}
	
	return rotated;
};

function PlacementWorker(binPolygon, paths, ids, rotations, config, nfpCache){
	this.binPolygon = binPolygon;
	this.paths = paths;
	this.ids = ids;
	this.rotations = rotations;
	this.config = config;
	this.nfpCache = nfpCache || {};
	
	// return a placement for the paths/rotations given
	// happens inside a webworker
	this.placePaths = function(paths){

		var self = global.env.self;
		if(!self.binPolygon){
			return null;
		}
		var capture = self.config.captureCandidates === true;
		var started = capture ? clock() : null;
		var decisions = capture ? [] : null;
		var inputParts = capture ? paths.map(partSummary) : null;

		// Keep helpers inside placePaths: Parallel serializes this function.
		function clock(){
			return typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
		}

		function partSummary(part){
			return {id: part.id, source: part.source, rotation: part.rotation,
				area: Math.abs(GeometryUtil.polygonArea(part))};
		}

		function placementSummary(p){
			return {id: p.id, rotation: p.rotation, x: p.x, y: p.y};
		}

		function beginDecision(path, placed, placements, paths, binIndex){
			var points = [];
			var placedArea = 0;
			for(var p=0; p<placed.length; p++){
				placedArea += Math.abs(GeometryUtil.polygonArea(placed[p]));
				for(var v=0; v<placed[p].length; v++){
					points.push({x: placed[p][v].x+placements[p].x, y: placed[p][v].y+placements[p].y});
				}
			}
			var bounds = points.length ? GeometryUtil.getPolygonBounds(points) : {x:0, y:0, width:0, height:0};
			var decision = {
				id: 'd'+decisions.length, binIndex: binIndex,
				partId: path.id, rotation: path.rotation,
				policy: placed.length ? 'width2-plus-height-then-x' : 'minimum-x-first-encountered',
				placedPartCount: placed.length, currentBounds: bounds, placedArea: placedArea,
				partArea: Math.abs(GeometryUtil.polygonArea(path)),
				placed: placements.map(placementSummary),
				remaining: paths.filter(function(p){ return placed.indexOf(p) < 0; }).map(partSummary),
				candidates: [], selectedCandidateId: null
			};
			decisions.push(decision);
			return decision;
		}

		function recordCandidate(decision, x, y, bounds, score, polygonIndex, vertexIndex){
			var candidate = {
				id: decision.id+':c'+decision.candidates.length,
				partId: decision.partId, rotation: decision.rotation, x: x, y: y,
				polygonIndex: polygonIndex, vertexIndex: vertexIndex,
				width: bounds.width, height: bounds.height, score: score,
				selectionScore: decision.placedPartCount ? score : x,
				widthGrowth: bounds.width-decision.currentBounds.width,
				heightGrowth: bounds.height-decision.currentBounds.height,
				partArea: decision.partArea,
				binUtilisation: binarea ? (decision.placedArea+decision.partArea)/binarea : null,
				selected: false
			};
			decision.candidates.push(candidate);
			return candidate.id;
		}

		function finishDecision(decision){
			for(var c=0; c<decision.candidates.length; c++){
				decision.candidates[c].selected = decision.candidates[c].id === decision.selectedCandidateId;
			}
		}

		var i, j, k, m, n, path;
		
		// rotate paths by given rotation
		var rotated = [];
		for(i=0; i<paths.length; i++){
			var r = rotatePolygon(paths[i], paths[i].rotation);
			r.rotation = paths[i].rotation;
			r.source = paths[i].source;
			r.id = paths[i].id;
			rotated.push(r);
		}
		
		paths = rotated;
		
		var allplacements = [];
		var fitness = 0;
		var binarea = Math.abs(GeometryUtil.polygonArea(self.binPolygon));
		var key, nfp;
		
		while(paths.length > 0){
			
			var placed = [];
			var placements = [];
			fitness += 1; // add 1 for each new bin opened (lower fitness is better)

			for(i=0; i<paths.length; i++){
				path = paths[i];
				
				// inner NFP
				key = JSON.stringify({A:-1,B:path.id,inside:true,Arotation:0,Brotation:path.rotation});
				var binNfp = self.nfpCache[key];
				
				// part unplaceable, skip
				if(!binNfp || binNfp.length == 0){
					continue;
				}
				
				// ensure all necessary NFPs exist
				var error = false;
				for(j=0; j<placed.length; j++){			
					key = JSON.stringify({A:placed[j].id,B:path.id,inside:false,Arotation:placed[j].rotation,Brotation:path.rotation});
					nfp = self.nfpCache[key];
										
					if(!nfp){
						error = true;
						break;
					}	
				}
				
				// part unplaceable, skip
				if(error){
					continue;
				}
				
				var position = null;
				if(placed.length == 0){
					var decision = capture ? beginDecision(path, placed, placements, paths, allplacements.length) : null;
					var firstBounds = capture ? GeometryUtil.getPolygonBounds(path) : null;
					// first placement, put it on the left
					for(j=0; j<binNfp.length; j++){
						for(k=0; k<binNfp[j].length; k++){
							if(capture){
								var candidateId = recordCandidate(decision, binNfp[j][k].x-path[0].x,
									binNfp[j][k].y-path[0].y, firstBounds, firstBounds.width*2+firstBounds.height, j, k);
							}
							if(position === null || binNfp[j][k].x-path[0].x < position.x ){
								if(capture){ decision.selectedCandidateId = candidateId; }
								position = {
									x: binNfp[j][k].x-path[0].x,
									y: binNfp[j][k].y-path[0].y,
									id: path.id,
									rotation: path.rotation
								}
							}
						}
					}
					
					if(capture){ finishDecision(decision); }
					placements.push(position);
					placed.push(path);
					
					continue;
				}
				
				var clipperBinNfp = [];
				for(j=0; j<binNfp.length; j++){
					clipperBinNfp.push(toClipperCoordinates(binNfp[j]));
				}
				
				ClipperLib.JS.ScaleUpPaths(clipperBinNfp, self.config.clipperScale);
				
				var clipper = new ClipperLib.Clipper();
				var combinedNfp = new ClipperLib.Paths();
				
				
				for(j=0; j<placed.length; j++){			
					key = JSON.stringify({A:placed[j].id,B:path.id,inside:false,Arotation:placed[j].rotation,Brotation:path.rotation});
					nfp = self.nfpCache[key];
										
					if(!nfp){
						continue;
					}
					
					for(k=0; k<nfp.length; k++){
						var clone = toClipperCoordinates(nfp[k]);
						for(m=0; m<clone.length; m++){
							clone[m].X += placements[j].x;
							clone[m].Y += placements[j].y;
						}
						
						ClipperLib.JS.ScaleUpPath(clone, self.config.clipperScale);
						clone = ClipperLib.Clipper.CleanPolygon(clone, 0.0001*self.config.clipperScale);
						var area = Math.abs(ClipperLib.Clipper.Area(clone));
						if(clone.length > 2 && area > 0.1*self.config.clipperScale*self.config.clipperScale){
							clipper.AddPath(clone, ClipperLib.PolyType.ptSubject, true);
						}
					}		
				}
				
				if(!clipper.Execute(ClipperLib.ClipType.ctUnion, combinedNfp, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero)){
					continue;
				}
				
				// difference with bin polygon
				var finalNfp = new ClipperLib.Paths();
				clipper = new ClipperLib.Clipper();
				
				clipper.AddPaths(combinedNfp, ClipperLib.PolyType.ptClip, true);
				clipper.AddPaths(clipperBinNfp, ClipperLib.PolyType.ptSubject, true);
				if(!clipper.Execute(ClipperLib.ClipType.ctDifference, finalNfp, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero)){
					continue;
				}
				
				finalNfp = ClipperLib.Clipper.CleanPolygons(finalNfp, 0.0001*self.config.clipperScale);
				
				for(j=0; j<finalNfp.length; j++){
					var area = Math.abs(ClipperLib.Clipper.Area(finalNfp[j]));
					if(finalNfp[j].length < 3 || area < 0.1*self.config.clipperScale*self.config.clipperScale){
						finalNfp.splice(j,1);
						j--;
					}
				}
				
				if(!finalNfp || finalNfp.length == 0){
					continue;
				}
				
				var f = [];
				for(j=0; j<finalNfp.length; j++){
					// back to normal scale
					f.push(toNestCoordinates(finalNfp[j], self.config.clipperScale));
				}
				finalNfp = f;
				
				// choose placement that results in the smallest bounding box
				// could use convex hull instead, but it can create oddly shaped nests (triangles or long slivers) which are not optimal for real-world use
				// todo: generalize gravity direction
				var minwidth = null;
				var minarea = null;
				var minx = null;
				var nf, area, shiftvector;
				var decision = capture ? beginDecision(path, placed, placements, paths, allplacements.length) : null;

				for(j=0; j<finalNfp.length; j++){
					nf = finalNfp[j];
					if(Math.abs(GeometryUtil.polygonArea(nf)) < 2){
						continue;
					}
					
					for(k=0; k<nf.length; k++){
						var allpoints = [];
						for(m=0; m<placed.length; m++){
							for(n=0; n<placed[m].length; n++){
								allpoints.push({x:placed[m][n].x+placements[m].x, y: placed[m][n].y+placements[m].y});
							}
						}
						
						shiftvector = {
							x: nf[k].x-path[0].x,
							y: nf[k].y-path[0].y,
							id: path.id,
							rotation: path.rotation,
							nfp: combinedNfp
						};
						
						for(m=0; m<path.length; m++){
							allpoints.push({x: path[m].x+shiftvector.x, y:path[m].y+shiftvector.y});
						}
						
						var rectbounds = GeometryUtil.getPolygonBounds(allpoints);
						
						// weigh width more, to help compress in direction of gravity
						area = rectbounds.width*2 + rectbounds.height;
						if(capture){
							var candidateId = recordCandidate(decision, shiftvector.x, shiftvector.y, rectbounds, area, j, k);
						}
						
						if(minarea === null || area < minarea || (GeometryUtil.almostEqual(minarea, area) && (minx === null || shiftvector.x < minx))){
							if(capture){ decision.selectedCandidateId = candidateId; }
							minarea = area;
							minwidth = rectbounds.width;
							position = shiftvector;
							minx = shiftvector.x;
						}
					}
				}
				if(capture){ finishDecision(decision); }
				if(position){
					placed.push(path);
					placements.push(position);
				}
			}
			
			if(minwidth){
				fitness += minwidth/binarea;
			}
			
			for(i=0; i<placed.length; i++){
				var index = paths.indexOf(placed[i]);
				if(index >= 0){
					paths.splice(index,1);
				}
			}
			
			if(placements && placements.length > 0){
				allplacements.push(placements);
			}
			else{
				break; // something went wrong
			}
		}
		
		// there were parts that couldn't be placed
		fitness += 2*paths.length;
		
		var result = {placements: allplacements, fitness: fitness, paths: paths, area: binarea };
		if(capture){
			var placedArea = 0;
			var placedCount = 0;
			for(i=0; i<decisions.length; i++){
				if(decisions[i].selectedCandidateId !== null){
					placedArea += decisions[i].partArea;
					placedCount++;
				}
			}
			result.instrumentation = {
				schemaVersion: 1, policy: 'classic',
				candidateScope: 'existing-enumerated-vertices-at-assigned-rotation',
				areaConvention: 'worker-outer-polygons-including-spacing-without-hole-subtraction',
				config: JSON.parse(JSON.stringify(self.config)),
				bin: {bounds: GeometryUtil.getPolygonBounds(self.binPolygon), area: binarea},
				inputParts: inputParts, decisions: decisions,
				placements: allplacements.map(function(bin){ return bin.map(placementSummary); }),
				metrics: {partCount: inputParts.length, placedPartCount: placedCount,
					unplacedPartCount: paths.length, binsUsed: allplacements.length,
					placedArea: placedArea, utilisation: allplacements.length && binarea ? placedArea/(allplacements.length*binarea) : null,
					fitness: fitness, placementRuntimeMs: clock()-started}
			};
		}
		return result;
	};

}
(typeof window !== 'undefined' ? window : self).PlacementWorker = PlacementWorker;

// clipperjs uses alerts for warnings
function alert(message) { 
    console.log('alert: ', message);
}
