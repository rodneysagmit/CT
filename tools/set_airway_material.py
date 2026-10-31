"""Set the airway insert's material (material 2) in the CT1 GLB files.
Usage: python tools/set_airway_material.py <hex color> <roughness> public/assets/models/ct1.glb public/assets/models/ct1-mobile.glb
"""
import json, struct, sys

def lin(h):
    c = int(h, 16) / 255
    return round(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4, 4)

hexs, rough, paths = sys.argv[1].lstrip('#'), float(sys.argv[2]), sys.argv[3:]
for path in paths:
    b = open(path, 'rb').read()
    magic, ver, _ = struct.unpack('<III', b[:12])
    jl, jt = struct.unpack('<II', b[12:20])
    j = json.loads(b[20:20 + jl]); rest = b[20 + jl:]
    p = j['materials'][2]['pbrMetallicRoughness']
    p['baseColorFactor'] = [lin(hexs[i:i + 2]) for i in (0, 2, 4)] + [1.0]
    p['roughnessFactor'] = rough; p['metallicFactor'] = 0.0
    s = json.dumps(j, separators=(',', ':')).encode(); s += b' ' * ((4 - len(s) % 4) % 4)
    open(path, 'wb').write(struct.pack('<III', magic, ver, 20 + len(s) + len(rest)) + struct.pack('<II', len(s), jt) + s + rest)
    print('airway material set', path, hexs, rough)
