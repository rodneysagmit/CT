"""Share image (1200x630) in the v3.4 colors: teal hero tint, teal circle, navy type, coral dash.
Usage (needs Pillow): python tools/make_og_image.py "<ClinTrainers folder>" public/assets/img/og-image.jpg
"""
import sys
from PIL import Image, ImageDraw, ImageFont

root, out = sys.argv[1], sys.argv[2]
F = root + '/assets/Nevo/OTF/'
IMG = root + '/Departments/Sales and Marketing/Website/site/public/assets/img/'
W, H = 1200, 630
hx = lambda h: tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))

def vgrad(w, h, stops):
    im = Image.new('RGB', (w, h)); px = im.load()
    for y in range(h):
        t = y / (h - 1)
        for (t0, c0), (t1, c1) in zip(stops, stops[1:]):
            if t0 <= t <= t1:
                k = (t - t0) / (t1 - t0); c = tuple(round(a + (b - a) * k) for a, b in zip(c0, c1)); break
        for x in range(w): px[x, y] = c
    return im

def hgrad(w, h, c0, c1):
    im = Image.new('RGB', (w, h)); d = ImageDraw.Draw(im)
    for x in range(w):
        k = x / max(w - 1, 1); d.line([(x, 0), (x, h)], fill=tuple(round(a + (b - a) * k) for a, b in zip(c0, c1)))
    return im

S = 2  # supersample
img = vgrad(W * S, H * S, [(0, hx('#D7EAEC')), (.55, hx('#E8F3F4')), (1, hx('#F5F7FA'))])
d = ImageDraw.Draw(img)

# Teal circle behind the trainer (solid two-tone shape, crisp edge)
cx, cy, r = 915 * S, 315 * S, 245 * S
disc = vgrad(2 * r, 2 * r, [(0, hx('#E4F0F1')), (1, hx('#C8E0E2'))])
mask = Image.new('L', (2 * r, 2 * r), 0); ImageDraw.Draw(mask).ellipse([0, 0, 2 * r - 1, 2 * r - 1], fill=255)
img.paste(disc, (cx - r, cy - r), mask)

# Trainer render (transparent background)
tr = Image.open(IMG + 'ct1-hero-1600.webp').convert('RGBA')
bb = tr.getbbox(); tr = tr.crop(bb)
tw = 470 * S; th = round(tr.height * tw / tr.width)
tr = tr.resize((tw, th), Image.LANCZOS)
img.paste(tr, (cx - tw // 2, cy - th // 2 + 20 * S), tr)

f_eye = ImageFont.truetype(F + 'Nevo Semi Bold.otf', 22 * S)
f_h1 = ImageFont.truetype(F + "Nevo Semi Bold.otf", 72 * S)
f_sub = ImageFont.truetype(F + 'Nevo Light.otf', 26 * S)
x = 64 * S
# Eyebrow: coral dash + navy label
d.rectangle([x, 101 * S, x + 22 * S, 104 * S], fill=hx('#E8502A'))
d.text((x + 34 * S, 103 * S), 'CLINTRAINERS', font=f_eye, fill=hx('#1C3558'), anchor='lm')
# Headline
y = 132 * S; lh = 80 * S
for line in ('Train with', 'Purpose.'):
    d.text((x, y), line, font=f_h1, fill=hx('#0C1729')); y += lh
# Second line: teal -> navy fade, same as the site
for line in ('Prepare for', 'What Matters.'):
    m = Image.new('L', img.size, 0); ImageDraw.Draw(m).text((x, y), line, font=f_h1, fill=255)
    bw = int(d.textlength('What Matters.', font=f_h1))
    g = hgrad(bw, img.height, hx('#0B7C83'), hx('#1C3558'))
    layer = Image.new('RGB', img.size); layer.paste(g, (x, 0))
    img.paste(layer, (0, 0), m); y += lh
d.text((x, y + 22 * S), 'One base. Drop-in skill cartridges.', font=f_sub, fill=hx('#43526A'))

img.resize((W, H), Image.LANCZOS).save(out, 'JPEG', quality=90, optimize=True, progressive=True)
print('saved', out)
