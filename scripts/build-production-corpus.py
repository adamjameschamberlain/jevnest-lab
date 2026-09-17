#!/usr/bin/env python3
"""Rebuild bundled ESICUP-derived jobs. Run only to refresh sources, not to benchmark.
Pinned upstream; discard supplied NFPs. No third-party Python dependencies.
"""
import concurrent.futures,hashlib,json,pathlib,tempfile,urllib.request,xml.etree.ElementTree as ET
ROOT=pathlib.Path(__file__).resolve().parents[1]/'experiments/jev/production/corpus'
SHA='154a8f006a8e72f65d734f2d1e36777f678f31f8'
SOURCES={'shirts':'shirts','albano':'albano','blaz':'blaz','swim':'swim','shapes':'shapes0','mao':'mao','dagli':'dagli','dighe':'dighe1','fu':'fu','han':'han','jakobs':'jakobs1','marques':'marques','poly':'poly1a','trousers':'trousers'}
NS={'n':'http://www.fe.up.pt/~esicup/nesting.xsd'}
ROOT.mkdir(parents=True,exist_ok=True);(ROOT/'sources').mkdir(exist_ok=True);(ROOT/'jobs').mkdir(exist_ok=True)
def fetch(p):
 cache=pathlib.Path(tempfile.gettempdir())/'jevnest-esicup'/SHA/p
 if cache.exists():return cache.read_bytes()
 data=urllib.request.urlopen(f'https://raw.githubusercontent.com/ESICUP/datasets/{SHA}/{p}',timeout=45).read()
 cache.parent.mkdir(parents=True,exist_ok=True);cache.write_bytes(data);return data
def one(item):
 family,name=item;p=f'2d_irregular/{family}/{name}.xml';data=fetch(p);root=ET.fromstring(data)
 NS={'n':root.tag.split('}')[0][1:]}
 needed={c.attrib['idPolygon'] for c in root.findall('n:problem//n:component',NS)}
 polys={}
 for poly in root.findall('n:polygons/n:polygon',NS):
  if poly.attrib['id'] not in needed:continue
  segments=poly.findall('n:lines/n:segment',NS);points=[]
  for i,s in enumerate(segments):
   pt=[float(s.attrib['x0']),float(s.attrib['y0'])];end=[float(s.attrib['x1']),float(s.attrib['y1'])];nxt=segments[(i+1)%len(segments)]
   assert end==[float(nxt.attrib['x0']),float(nxt.attrib['y0'])],f'Disconnected contour {family}'
   if not points or points[-1]!=pt:points.append(pt)
  if points[-1]==points[0]:points.pop()
  polys[poly.attrib['id']]=points
 board=root.find('n:problem/n:boards/n:piece/n:component',NS);bp=polys[board.attrib['idPolygon']];cross=max(p[1] for p in bp)-min(p[1] for p in bp);factor=1600/cross
 parts=[];original=[]
 for piece in root.findall('n:problem/n:lot/n:piece',NS):
  comps=piece.findall('n:component',NS);assert len(comps)==1 and comps[0].attrib['type']=='0','Unsupported hole/multipart'
  c=comps[0];rot=[float(e.attrib['angle'])%360 for e in piece.findall('n:orientation/n:enumeration',NS)];assert rot,'Missing explicit angles'
  pts=polys[c.attrib['idPolygon']];parts.append({'key':piece.attrib['id'],'quantity':int(piece.attrib['quantity']),'rotations':rot,'points':[[round(x*factor,7),round(y*factor,7)] for x,y in pts]});original.append(int(piece.attrib['quantity']))
 # Preserve only original problem and contours, not megabytes of supplied NFPs.
 reduced=ET.Element(root.tag)
 for tag in ['name','author','date','description','verticesOrientation','coordinatesOrigin','problem','polygons']:
  el=root.find('n:'+tag,NS)
  if tag=='polygons' and el is not None:
   for child in list(el):
    if child.attrib['id'] not in needed:el.remove(child)
  if el is not None:reduced.append(el)
 ET.ElementTree(reduced).write(ROOT/'sources'/f'{family}.xml',encoding='utf-8',xml_declaration=True)
 readme=fetch(f'2d_irregular/{family}/readme.txt');(ROOT/'sources'/f'{family}-readme.txt').write_bytes(readme)
 split='development' if family in ['shirts','albano','blaz'] else 'evaluation'
 provenance={'kind':'rescaled-public-reference','family':family,'repository':'https://github.com/ESICUP/datasets','revision':SHA,'sourcePath':p,'originalSha256':hashlib.sha256(data).hexdigest(),'licence':'CC0-1.0 (repository licence)','sourceUnitsToMm':factor,'originalQuantities':original,'description':root.findtext('n:description',default='',namespaces=NS),'adaptation':'Uniform scaling to 1600 mm source strip width; quantities resampled proportionally to target count; 3 mm spacing and 10 mm border margin added. Sheet variants are derived, not original benchmark instances.'}
 jobs=[]
 for count in [100,250,500]:
  cycle=[i for i,p in enumerate(parts) for _ in range(p['quantity'])];quantities=[0]*len(parts)
  # Systematic sampling preserves source mixture rather than truncating early types.
  for j in range(count):quantities[cycle[int(j*len(cycle)/count)%len(cycle)]]+=1
  for media in ['sheet','roll']:
   job={'schemaVersion':2,'id':f'{family}-{media}-{count}','split':split,'units':'mm','spacing':3,'margin':10,'media':{'type':media,'width':2440,'height':1640} if media=='sheet' else {'type':media,'width':1640},'provenance':provenance,'parts':[{**p,'quantity':q} for p,q in zip(parts,quantities) if q]}
   fn='jobs/'+job['id']+'.json';(ROOT/fn).write_text(json.dumps(job,indent=2)+'\n');jobs.append({'id':job['id'],'file':fn,'split':split,'family':family,'parts':count,'media':media})
 return jobs
alljobs=[]
with concurrent.futures.ThreadPoolExecutor(6) as pool:
 for jobs in pool.map(one,SOURCES.items()):alljobs.extend(jobs);print(jobs[0]['family'],len(jobs))
(ROOT/'sources'/'LICENSE').write_bytes(fetch('LICENSE'))
(ROOT/'manifest.json').write_text(json.dumps({'version':2,'upstreamRevision':SHA,'jobs':alljobs},indent=2)+'\n')
