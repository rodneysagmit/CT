import sys, trimesh, numpy as np, xml.etree.ElementTree as ET
W=sys.argv[1]; OUT=sys.argv[2]; NX=float(sys.argv[3]) if len(sys.argv)>3 else 102.5
def one(f): return list(trimesh.load(W+f,force='scene').dump())  # world-transformed meshes
def mesh(f):
    ms=one(f); m=trimesh.util.concatenate(ms); return m
def mat(rgb, rough, metal=0.0, alpha=1.0):
    return trimesh.visual.material.PBRMaterial(baseColorFactor=[*rgb,alpha], roughnessFactor=rough, metallicFactor=metal, alphaMode='BLEND' if alpha<1 else 'OPAQUE', doubleSided=False)
C=lambda h:[(lambda c: c/12.92 if c<=0.04045 else ((c+0.055)/1.055)**2.4)(int(h[i:i+2],16)/255) for i in (1,3,5)]
parts={}
parts['base']=(mesh('CT1 - Base.3mf'), mat(C('#161616'),0.5,0.0))
parts['pad']=(mesh('CT1 - Rubber Pad.3mf'), mat(C('#0b0b0c'),0.85))
parts['cartridge']=(mesh('CT1 - Cartridge.3mf'), mat(C('#161616'),0.5))
cov=mesh('CT1 - Cartridge Cover.3mf'); cov.apply_translation([0,0,-(130.0-36.9)])
parts['cartridge_cover']=(cov, mat(C('#161616'),0.5))
aw=mesh('Cartridge Trainers/Cric Trach.3mf'); aw.apply_translation([-130.0,0,7.0])
parts['airway']=(aw, mat(C('#dfe8ee'),0.35,0.0))
# nameplate: plate + text from Complete object_5
ns={'m':'http://schemas.microsoft.com/3dmanufacturing/core/2015/02'}
t=ET.parse(W+'complete/3D/Objects/object_5.model').getroot()
objs={}
for o in t.find('m:resources',ns).findall('m:object',ns):
    v=np.array([[float(x.get(k)) for k in 'xyz'] for x in o.find('m:mesh/m:vertices',ns)])
    f=np.array([[int(x.get(k)) for k in ('v1','v2','v3')] for x in o.find('m:mesh/m:triangles',ns)])
    objs[o.get('id')]=trimesh.Trimesh(v,f,process=False)
def tf(s):
    a=[float(x) for x in s.split()]; M=np.eye(4); R=np.array(a[:9]).reshape(3,3); M[:3,:3]=R.T; M[:3,3]=a[9:12]; return M
plate=objs['1'].copy(); plate.apply_transform(tf("1 0 -1.09476443e-47 0 1 0 0 0 1 4.00931732e-17 -0.126353811 -0.1805636"))
text=objs['2'].copy(); text.apply_transform(tf("2.18952885e-47 -1 2.22044605e-16 -4.93038066e-32 -2.22044605e-16 -1 1 1.09476443e-47 4.93038066e-32 0.500001609 -0.0741103712 -0.290217876"))
off=[NX+0.5, 60.0, 13.0]
plate.apply_translation(off); text.apply_translation(off)
text.apply_transform(trimesh.transformations.rotation_matrix(np.pi,[1,0,0],point=[0,60.0,13.0]))
parts['nameplate']=(plate, mat(C('#161616'),0.5))
parts['nameplate_text']=(text, mat(C('#ffffff'),0.4))
# storage cover (CT1 - Base Lid): open-top shell printed upside down; flipped over the base, resting on the pad
lid=mesh('CT1 - Base Lid.3mf')
lid.apply_transform(trimesh.transformations.rotation_matrix(np.pi,[1,0,0]))
lid.apply_transform(trimesh.transformations.rotation_matrix(np.pi,[0,0,1],point=lid.bounds.mean(axis=0)))  # logo reads from the front
lb=lid.bounds; bb=parts['base'][0].bounds
lid.apply_translation([(bb[0][0]+bb[1][0])/2-(lb[0][0]+lb[1][0])/2, (bb[0][1]+bb[1][1])/2-(lb[0][1]+lb[1][1])/2, 0.0-lb[0][2]])
parts['storage_cover']=(lid, mat(C('#161616'),0.5))
sc=trimesh.Scene()
R=trimesh.transformations.rotation_matrix(-np.pi/2,[1,0,0])
# center on base footprint (x,y center), floor at pad bottom
bmin=parts['base'][0].bounds[0]; bmax=parts['base'][0].bounds[1]
cx,cy=(bmin[0]+bmax[0])/2,(bmin[1]+bmax[1])/2; z0=parts['pad'][0].bounds[0][2]
for n,(m,mt) in parts.items():
    m=m.copy(); m.merge_vertices(); m.apply_translation([-cx,-cy,-z0]); m.apply_transform(R); m.apply_scale(0.001)  # meters
    m=trimesh.graph.smooth_shade(m, angle=np.radians(35))
    m.visual=trimesh.visual.TextureVisuals(material=mt)
    sc.add_geometry(m, node_name=n, geom_name=n)
    print(n, len(m.faces), (m.extents*1000).round(1))
open(OUT,'wb').write(trimesh.exchange.gltf.export_glb(sc, include_normals=True))
