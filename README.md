# ClinTrainers CT1 — System Site (v3.6, Oct 31 2026)

A three-page site for the CT1 system (one reusable base, drop-in skill cartridges), built around an interactive 3D model. Light studio look with defined color roles: navy primary (also the Request a Demo button), teal secondary, coral accent for small marks, on cool neutrals, with a charcoal trainer (Decision Log W9–W33; see `../design/DESIGN-DIRECTION.md`). Color comes from tints, solid shapes and limited liquid glass: no glowing edges, light halos or neon. The landing page sells the system; the Cric/Trach Starter Kit has its own product page (W15) and the cartridge library has its own page (W14). The hero fills one screen at every desktop size; headline and calls to action sit beside the model on desktop and stack above it on phones. Earlier versions are in `../_archive/`.

**Bottom line:** the website is the `public/` folder. It is published to GitHub Pages at https://rodneysagmit.github.io/CT/ (see "GitHub" below). Everything else here is tooling.

```
site/
├── public/                     ← THE WEBSITE (deploy this folder)
│   ├── index.html              ← landing page text
│   ├── cric-trach.html         ← Cric/Trach Starter Kit product page: specs, gallery, documents (W15)
│   ├── cartridges.html         ← cartridge library page (W14)
│   └── assets/
│       ├── css/site.css        ← colors (tokens at the top), fonts, layout
│       ├── js/config.js        ← demo email, inquiry mode, 3D model paths and lighting  ← edit here first
│       ├── js/main.js          ← header, reveals, gallery, demo links, optional form
│       ├── js/viewer.bundle.js ← built 3D viewer (Three.js r169, don't edit by hand)
│       ├── js/src/viewer.js    ← viewer source (rebuild after edits)
│       ├── models/             ← ct1.glb (desktop, 655 KB) and ct1-mobile.glb (430 KB)
│       ├── img/                ← CAD renders (WebP), favicon, share image
│       └── fonts/              ← Nevo + Outfit digits
├── tools/                      ← model conversion and render scripts
└── package.json                ← build commands (Node)
```

## Headline (W12, Marco to review)

Hero: **"Train with Purpose. Prepare for What Matters."** Subhead: "An adaptable simulation task trainer designed to help healthcare professionals practice clinical skills, build confidence, and prepare for real-world scenarios." A "Coming Q1 2027: Cricothyrotomy & Tracheostomy" tag sits under it (W20).

"Rare airway. Routine practice." now heads the Cric/Trach Starter Kit section.

## Page structure (W10, W14, W15)

**Landing page (`index.html`):**

1. **Hero** (one full screen, W21): headline, subhead, Coming Q1 2027 tag, "Explore the Trainer" and "Request a Demo"; the three highlights sit in a strip along the bottom edge with a scroll arrow. As the page scrolls, the trainer drifts slower than the text (W23; `--hp` is set in `main.js`). The 3D trainer turns slowly while the cartridge lowers into the base, holds, lifts out and repeats. Drag or use the arrow keys to rotate. Pause stops the turning and the cartridge loop.
2. **How it works** (`#system`): three steps with renders (set up the base, drop in a cartridge, train then swap).
3. **Benefits** (`#benefits`): six qualitative benefits for simulation programs (W11). Add measured numbers only after tester sessions.
4. **Cric/Trach Starter Kit summary** (`#starter-kit`): heading, paragraph, kit contents, render and "See the full Starter Kit".
5. **Cartridges teaser** (`#cartridges`): one line, the four group names and a "See all cartridges" link to `cartridges.html` (W14).
6. **FAQ**, then 7. the dark closing demo band and footer.

**Starter Kit page (`cric-trach.html`):** intro with jump links, Features (`#features`), Applications (`#applications`), Gallery (`#gallery`), Specifications (`#specs`), Documents (`#documents`), demo band. Link people straight to a section, e.g. `cric-trach.html#specs`. Pills mark prototype or in-development items; unconfirmed values show as amber italic placeholders.

**Documents:** when a file is ready, put it in `assets/docs/`, turn its title into a link and remove the "Coming before release" pill.

## Cartridge library (`cartridges.html`)

The full library has its own page (W14): cards by group with a Cards / List toggle (W13), plus the same header, demo band, footer and inquiry form as the landing page. Its nav links point back to `index.html#…`. If you change the header, footer or demo band, change both pages. If a new group is added, add its name to the teaser chips on `index.html` too.

The list follows `ClinTrainers/Departments/Research and Development/Cartridge Research/CT1 Cartridge Pipeline.md` ("Public group" and "Public label" columns). Update the pipeline first, then the page.

- Status pill classes: `status status-available` (Coming Q1 2027, the Cric/Trach release; change the text when it ships), `status status-dev` (In development), `status status-planned` (Planned).
- Cards are alphabetical within each group. Never show priority order, dates or vendor names. The one exception is the Cric/Trach release quarter (W20). Urinary catheterization stays off the page.
- When a cartridge has real CAD, render it (see below) and replace the icon `<svg>` inside its `.cart-media` with an `<img>`.
- To drop the cards and keep only the list, add `is-list` to the `<div class="lib" data-lib>` element and delete the `.view-toggle` block.

## The demo button (static hosting can't process forms)

Set in `assets/js/config.js` under `inquiry`:

- **`mode: 'email'`:** every "Request a Demo" button is an email link to `email`, with `subject` and a short `body` template filled in. Nothing to connect.
- **`mode: 'form'` (current, W27):** the buttons open an on-page form: inquiry type (question, demo, quote), first and last name, organization, job title, organization type, email, phone, message and "how did you hear about us". Choosing "Request a quote" reveals quote details (Starter Kits needed, learners per year, timeline, payment method, ship-to, tax-exempt). Field names in the HTML are what the form service receives. Until an endpoint is set, Send opens the visitor's email app with everything filled in. To receive submissions directly, connect a form service:
  1. Create a form at **Formspree** (formspree.io) with the destination set to inquiry@clintrainers.com. Netlify Forms, Basin or Getform also work.
  2. Paste its endpoint (for example `https://formspree.io/f/abcdwxyz`) into `endpoint`.
  3. Send a test inquiry and confirm it arrives. If the service fails, the form offers an email link instead.

## Everyday edits

- **Text:** `public/index.html`, `public/cric-trach.html` and `public/cartridges.html`. The header, demo band and footer are repeated on all three; change them everywhere. Sections are marked `HERO`, `THE SYSTEM`, `BENEFITS`, `CRIC/TRACH STARTER KIT`, `CARTRIDGES TEASER`, `FAQ` on the landing page; `PRODUCT INTRO`, `FEATURES`, `APPLICATIONS`, `GALLERY`, `SPECS + INCLUDED`, `DOCUMENTS` on the Starter Kit page, `CTA`, `FOOTER`.
- **Placeholders:** search for `class="tbd"`. Status pills are `class="status"` (prototype) and `class="status status-dev"` (in development).
- **Colors:** the tokens at the top of `assets/css/site.css`. Shadows are `--shadow` and `--shadow-hover`; corners are `--radius` (20 px) and `--radius-panel` for the floating color panels (W24). Navy (primary) is `--accent` and `--deep`; teal (secondary) is `--teal`, `--teal-band`, `--stage-grad`, `--hero-grad` and `--disc`; demo buttons use `--cta` (navy `#1C3558`, W28); coral is `--pop` for small marks and the arrow hover and `--pop` for small marks (never text). Keep text at 4.5:1 contrast or better against `--bg`.
- **Glass (W29):** only on the floating header, the 3D viewer controls and hint, the hero tag, and dialog backdrops. Never put glass behind long text.
- **Motion and interactions (W30, W31):** page cross-fades use `@view-transition` in `site.css`; staggered reveals, dialog close fades, smooth FAQ and the reading-progress line live in `main.js`. Everything respects reduced-motion settings.
- **Hero 3D framing (W33):** the 3D stage is drawn 50% larger than its column, with no edge fade, so lifted and exploded parts are never cut. `data-cam-dist` is 0.411 and the poster inset is 13.5% (poster box = 0.3 / cam-dist of the stage). If you change the stage size, scale both. On desktop the trainer is capped by screen height so the hero fits one screen.
- **Images:** replace files in `assets/img/` and keep the names. Each has a small and a large version (700/1200, or 900/1600 for the hero and exploded view). `ct1-base-*` is the empty base. The share image (`og-image.jpg`, 1200 × 630) is generated by `tools/make_og_image.py`; re-run it after a color or headline change.
- **Gallery labels:** hotspot positions are percentages of the exploded image, set inline in `cric-trach.html`.
- **3D model:** paths, speed, edge-light colors and shadow strength are in `config.js`. Set `model: ''` to show a clearly labeled placeholder.

## Performance and accessibility

- The hero still image loads first (preloaded, about 30 KB). The 3D viewer script (about 150 KB gzipped) loads only after the page finishes loading, and only if WebGL is available. Without WebGL the still image stays.
- The still image is rendered from the same camera and lighting as the live model, so the swap is seamless.
- Phones get the lighter model, lower pixel ratio and smaller shadow maps. Rendering stops when the hero is off screen or the tab is hidden.
- `prefers-reduced-motion`: no auto-rotation, no cartridge loop, no background or reveal animation.
- Keyboard: skip link, visible focus rings, arrow keys rotate the model, Pause and Reset are real buttons, FAQ uses native `<details>`.

## 3D model and renders

The GLB files come from the CT1 CAD (3MF) files in `ClinTrainers/assets/models/`. In v3.0 the base material is set to `#16181B` (roughness 0.62) and the pad to `#0E0F11`, which render as matte charcoal under the neutral studio lights, close to the black ASA print. The airway insert is `#7E776D` at roughness 0.8 (Oct 31): it renders as a light bone color with visible ring shading instead of washing out to flat white. Change it with `python tools/set_airway_material.py <hex> <roughness> public/assets/models/ct1.glb public/assets/models/ct1-mobile.glb`, then re-render the stills. The source CAD is unchanged. Lighting is neutral white (`rimColor` / `rim2Color` in `config.js`); the stills use the same lights at exposure 1.0.

**Rebuild the model** (needs Python and Node):

```
pip install trimesh numpy
python tools/convert.py "<path to the models folder>/" tools/ct1-raw.glb 87.5
npm install
npm run pack:model && npm run pack:model:mobile
```

Named parts: `base`, `pad`, `nameplate`, `cartridge`, `airway`, `cartridge_cover`, `storage_cover` (hidden on this page). Without `cartridge`, `airway` and `cartridge_cover`, the drop-in animation is skipped.

**Re-render the still images (no Node needed).** From the `site` folder run `python tools/render_server.py`, then open in a browser:

```
http://localhost:8811/tools/render-web.html?out=hero.png&w=1600&h=1200
```

The PNG lands in `tools/out/`. Useful parameters: `az`, `el`, `d` (camera angle and distance), `hide=base,pad`, `explode=0.045`, `lift=0.03`, `stored=1`, `rimc` / `rim2c` (edge-light colors). Convert to WebP at the two sizes listed above.

**Viewer source.** After editing `assets/js/src/viewer.js`, run `npm install` then `npm run build:viewer`.

## Previewing locally

Serve over http(s). Opening `index.html` directly shows the still image but not the 3D model. To preview: `python -m http.server 8080` inside `public/`, then open http://localhost:8080.

The live site is hosted on GitHub Pages (below). Any static host also works if that changes: deploy only the `public/` folder, set long cache headers on `assets/` and serve `.glb` as `model/gltf-binary`.

## GitHub

The site is published to the repository **rodneysagmit/CT** (currently public; make it private until the font license and VA ethics items below are cleared). Edit the site here in `site/`. Push only from the GitHub copy at `Documents/GitHub/CT`:

1. From the `Website` folder: `python sync_to_github.py` shows what changed; `python sync_to_github.py --apply` copies it into the GitHub copy.
2. Review and commit in the GitHub copy (GitHub Desktop or git), then push.

The script never deletes files in the GitHub copy; it lists anything that exists only there so you can remove it on purpose.

**GitHub Pages:** `.github/workflows/pages.yml` publishes only the `public/` folder on every push to `main`, so the site appears at the main address (`rodneysagmit.github.io/CT/`, later clintrainers.com) and the README, tools and project files are never published. One-time setting on GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**. Every push after that goes live, so hold pushes until the launch items below are cleared or you've decided the draft can be public.

## Launch on clintrainers.com (W34)

The site is built for **www.clintrainers.com**: canonical tags, share links, `sitemap.xml`, `robots.txt` and structured data all use it. Relative links mean the same files work at the github.io address in the meantime.

1. **Cloudflare (Marco's account), DNS for clintrainers.com.** Set each record to **DNS only** (gray cloud) so GitHub can issue the HTTPS certificate:
   - `www` → CNAME → `rodneysagmit.github.io`
   - `@` (apex) → A → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `@` (apex) → AAAA → `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
2. **GitHub, CT repository → Settings → Pages → Custom domain:** `www.clintrainers.com`. Wait for the DNS check, then tick **Enforce HTTPS**. The bare domain then redirects to www automatically.
3. **Optional but recommended:** verify the domain in GitHub (your profile → Settings → Pages → Add a domain), which adds one TXT record in Cloudflare and stops anyone else claiming it on GitHub Pages.
4. **Email:** Cloudflare → Email → Email Routing: create `inquiry@clintrainers.com` forwarding to the inbox that should receive inquiries. Then create the Formspree form for that address and put its endpoint in `config.js`.
5. **Search:** add www.clintrainers.com to Google Search Console and Bing Webmaster Tools, submit `https://www.clintrainers.com/sitemap.xml`, and use Google's Rich Results Test on the landing and Starter Kit pages.

**SEO in the code:** page titles and descriptions target cricothyrotomy / tracheostomy task trainer and modular simulation task trainer searches. Structured data: Organization, WebSite, Product and FAQPage on the landing page (the FAQ entries are generated from the visible FAQ, so update both together), Product and breadcrumbs on the Starter Kit page, breadcrumbs on the cartridges page. No prices anywhere until O3. When a page changes, update its `lastmod` in `sitemap.xml`.

**Privacy notice:** `privacy.html`, linked from every footer and the inquiry form. Plain-language draft for the attorney to review; update its date when it changes.

## Before launch

- [ ] Marco's copy review, including the new headline (Decision Log W12). The Q1 2027 date (W20) is confirmed.
- [ ] Replace every `tbd` placeholder (weight, uses per cartridge, cleaning, storage, included quantities, base storage lid, guide).
- [ ] Attorney review of the "not intended for clinical or diagnostic use" wording and the "a ClinCatalyst company" footer.
- [ ] VA ethics guidance in writing before the site goes public.
- [ ] Confirm the Nevo web-font license (commercial typeface). The font files are in the public GitHub repository until it is made private.
- [ ] Confirm clintrainers.com ownership; canonical and share URLs point to www.clintrainers.com.
- [ ] Connect the inquiry form to Formspree (paste the endpoint into `config.js`) and send a test of each inquiry type.
- [ ] Marco reviews the inquiry form fields (W27).
- [x] Privacy notice page added (`privacy.html`, W34). Attorney to review.
- [ ] Add privacy-friendly analytics (e.g., Plausible) if you want to measure demo clicks.
