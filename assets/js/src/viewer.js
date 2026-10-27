/*
 * ClinTrainers CT1 — interactive 3D hero viewer
 * ------------------------------------------------------------------
 * Source file. The page loads the bundled build: assets/js/viewer.bundle.js
 * (rebuild instructions in README.md). To change the model, colors or speed,
 * edit assets/js/config.js — not this file.
 *
 * What it does
 *  - Loads a GLB/glTF model (smaller "mobile" file on phones).
 *  - Soft studio lighting, contact shadow, slow auto-rotation.
 *  - Drag (or arrow keys) to rotate; Pause/Play and Reset buttons.
 *  - Cartridge drop-in animation (once, or looping with config cartridgeLoop).
 *  - Optional view buttons ([data-viewer-view="assembled|parts|stored"]) animate the parts:
 *      assembled  base + seated cartridge
 *      parts      cartridge and its lid lift out of the base
 *      stored     the storage cover drops over the base
 *  - Honors prefers-reduced-motion (no auto-rotation; views switch instantly).
 *  - Stops rendering when off screen or when the tab is hidden.
 *  - If no model is configured or it fails to load, shows a clearly labeled
 *    PLACEHOLDER shape instead of pretending to be the product.
 *
 * Named parts the views use: "cartridge", "airway", "cartridge_cover", "storage_cover".
 * Optional per-page framing on the host element: data-cam-dist, data-cam-dist-small,
 * data-cam-az, data-cam-el, data-view-shift, data-view-rise.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const cfg = (window.CT_CONFIG && window.CT_CONFIG.viewer) || {};
const host = document.querySelector('[data-viewer]');
if (host) mount(host);

function mount(host) {
  const stage = host.querySelector('.viewer-stage');
  const btnPause = host.querySelector('[data-viewer-pause]');
  const btnReset = host.querySelector('[data-viewer-reset]');
  const viewBtns = Array.prototype.slice.call(document.querySelectorAll('[data-viewer-view]'));
  const status = host.querySelector('[data-viewer-status]');
  const say = (t) => { if (status) status.textContent = t; };

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = window.matchMedia('(max-width: 900px)').matches;
  const mobile = window.matchMedia('(max-width: 760px), (pointer: coarse)').matches;

  // ---------- renderer ----------
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: !mobile || window.devicePixelRatio < 2, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { host.classList.add('is-static'); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = cfg.exposure ?? 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const canvas = renderer.domElement;
  canvas.className = 'viewer-canvas';
  canvas.setAttribute('tabindex', '0');
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', host.dataset.label || 'Interactive 3D model. Drag or use arrow keys to rotate.');
  stage.appendChild(canvas);

  // ---------- scene ----------
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = cfg.environment ?? 1.0;

  // Camera matches the poster render (az 38°, el 22°, distance 0.30) so the hand-off is seamless.
  const ds = host.dataset;
  const camera = new THREE.PerspectiveCamera(30, 4 / 3, 0.005, 10);
  const az = THREE.MathUtils.degToRad(+(ds.camAz || 38)), el = THREE.MathUtils.degToRad(+(ds.camEl || 22));
  const dist = +((small && ds.camDistSmall) || ds.camDist || 0.3);
  const shift = small ? 0 : +(ds.viewShift || 0);
  const rise = small ? 0 : +(ds.viewRise || 0); // fraction of stage height to move the model up
  const dir = new THREE.Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
  const target = new THREE.Vector3(0, 0.026, 0);
  camera.position.copy(dir).multiplyScalar(dist).add(target);

  const key = new THREE.DirectionalLight(0xffffff, 2.6);
  key.position.set(0.25, 0.45, 0.3);
  key.castShadow = true;
  key.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -0.2, right: 0.2, top: 0.2, bottom: -0.2, near: 0.05, far: 1.5 });
  key.shadow.radius = 6; key.shadow.bias = -0.0004;
  scene.add(key);
  const rim = new THREE.DirectionalLight(new THREE.Color(cfg.rimColor || '#d9e6ea'), 2.6); rim.position.set(-0.3, 0.2, -0.3); scene.add(rim);
  const rim2 = new THREE.DirectionalLight(new THREE.Color(cfg.rim2Color || '#ffc08a'), 1.2); rim2.position.set(0.35, 0.15, -0.25); scene.add(rim2);
  const fill = new THREE.DirectionalLight(0xffffff, 0.7); fill.position.set(-0.3, 0.1, 0.35); scene.add(fill);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShadowMaterial({ opacity: cfg.shadow ?? 0.38 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

  // ---------- controls ----------
  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(target);
  controls.enableZoom = false; controls.enablePan = false;
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.minPolarAngle = THREE.MathUtils.degToRad(35);
  controls.maxPolarAngle = THREE.MathUtils.degToRad(82);
  controls.autoRotate = !reduce;
  controls.autoRotateSpeed = cfg.rotateSpeed ?? 0.6;
  controls.update();

  // ---------- render-on-demand ----------
  let needs = true;
  const requestRender = () => { needs = true; };

  // Keyboard: arrow keys rotate the model when the canvas has focus.
  const sph = new THREE.Spherical();
  canvas.addEventListener('keydown', (e) => {
    const step = THREE.MathUtils.degToRad(e.shiftKey ? 20 : 8);
    const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
    if (!d) return;
    e.preventDefault();
    sph.setFromVector3(camera.position.clone().sub(controls.target));
    sph.theta += d[0];
    sph.phi = THREE.MathUtils.clamp(sph.phi + d[1], controls.minPolarAngle, controls.maxPolarAngle);
    camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(sph));
    host.classList.add('has-interacted');
    controls.update(); requestRender();
  });

  // ---------- pause / reset ----------
  let paused = reduce;
  const setPaused = (p) => {
    paused = p; controls.autoRotate = !p;
    if (btnPause) {
      btnPause.setAttribute('aria-pressed', String(p));
      const l = btnPause.querySelector('[data-label]'); if (l) l.textContent = p ? 'Play rotation' : 'Pause rotation';
      btnPause.setAttribute('aria-label', p ? 'Play rotation' : 'Pause rotation');
      btnPause.classList.toggle('is-paused', p);
    }
    requestRender();
  };
  if (btnPause) btnPause.addEventListener('click', () => setPaused(!paused));
  if (btnReset) btnReset.addEventListener('click', () => {
    camera.position.copy(dir).multiplyScalar(camDistNow).add(controls.target); controls.update(); requestRender();
  });
  setPaused(paused);

  // ---------- resize ----------
  const resize = () => {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    if (shift || rise) camera.setViewOffset(w, h, -shift * w, rise * h, w, h); else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    requestRender();
  };
  new ResizeObserver(resize).observe(stage);

  // ---------- views (assembled / parts / stored) ----------
  // Offsets are meters above each part's seated position; target/dist frame the view.
  const VIEWS = {
    assembled: { cartridge: 0, airway: 0, cartridge_cover: 0, storage_cover: null, ty: 0.026, d: 1.0 },
    parts:     { cartridge: 0.045, airway: 0.045, cartridge_cover: 0.085, storage_cover: null, ty: 0.05, d: 1.18 },
    stored:    { cartridge: 0, airway: 0, cartridge_cover: 0, storage_cover: 0, ty: 0.028, d: 1.02 },
  };
  const LIFT_IN = 0.09; // storage cover starts this far above when dropping in
  let parts = {}, base = {}, anim = null, camDistNow = dist, current = 'assembled';

  const lerp = THREE.MathUtils.lerp;
  const ease = (k) => 1 - Math.pow(1 - k, 3);
  function setView(name, instant) {
    const v = VIEWS[name]; if (!v || !parts.cartridge) return;
    current = name; intro = null;
    viewBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.getAttribute('data-viewer-view') === name)));
    const from = {}; const to = {};
    Object.keys(parts).forEach((n) => {
      const p = parts[n]; if (!p) return;
      from[n] = p.visible ? p.position.y - base[n] : (n === 'storage_cover' ? LIFT_IN : 0);
      to[n] = v[n] === null ? (n === 'storage_cover' ? LIFT_IN : 0) : v[n];
      if (v[n] !== null) p.visible = true;
    });
    const fromT = controls.target.y, toT = v.ty;
    const off = camera.position.clone().sub(controls.target);
    const fromD = off.length(), toD = dist * v.d;
    const hideAfter = Object.keys(parts).filter((n) => parts[n] && v[n] === null);
    const t0 = performance.now(), D = instant || reduce ? 0 : 900;
    anim = () => {
      const k = D ? Math.min((performance.now() - t0) / D, 1) : 1, e = ease(k);
      Object.keys(to).forEach((n) => { parts[n].position.y = base[n] + lerp(from[n], to[n], e); });
      controls.target.y = lerp(fromT, toT, e);
      camDistNow = lerp(fromD, toD, e);
      off.setLength(camDistNow);
      camera.position.copy(controls.target).add(off);
      if (k >= 1) { anim = null; hideAfter.forEach((n) => { parts[n].visible = false; }); }
    };
    say({ assembled: 'Showing the assembled trainer.', parts: 'Showing the parts: base, cartridge and cartridge lid.', stored: 'Showing the trainer with its storage cover on.' }[name]);
    requestRender();
  }
  viewBtns.forEach((b) => b.addEventListener('click', () => setView(b.getAttribute('data-viewer-view'))));

  // ---------- render loop (on demand) ----------
  let visible = true, intro = null;
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; }, { threshold: 0.01 }).observe(host);
  controls.addEventListener('change', requestRender);
  canvas.addEventListener('pointerdown', () => host.classList.add('has-interacted'), { once: true });

  const tick = () => {
    requestAnimationFrame(tick);
    if (!visible || document.hidden) return;
    if (intro) intro();
    if (anim) anim();
    const moving = controls.update();
    if (moving || needs || (intro && !paused) || anim) { renderer.render(scene, camera); needs = false; }
  };

  // ---------- model ----------
  const url = mobile ? (cfg.modelMobile || cfg.model) : cfg.model;
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const ready = (root, isPlaceholder) => {
    root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    ['cartridge', 'airway', 'cartridge_cover', 'storage_cover'].forEach((n) => {
      const o = root.getObjectByName(n); if (o) { parts[n] = o; base[n] = o.position.y; }
    });
    if (parts.storage_cover) parts.storage_cover.visible = false;
    scene.add(root);
    if (isPlaceholder) host.classList.add('is-placeholder');
    else if (parts.cartridge) host.classList.add('has-views');
    if (!reduce && !isPlaceholder) intro = makeIntro();
    resize();
    renderer.render(scene, camera);
    requestAnimationFrame(() => { host.classList.add('is-live'); say(isPlaceholder ? 'Placeholder model shown.' : '3D model loaded. Drag or use arrow keys to rotate.'); });
    tick();
  };
  if (!url) { ready(placeholder(), true); return; }
  loader.load(url, (g) => ready(g.scene, false), undefined, (err) => {
    console.warn('[viewer] Model failed to load; showing placeholder.', err);
    ready(placeholder(), true);
  });

  // Cartridge animation: the cartridge (with its insert and lid) lowers into the base
  // from above. With cfg.cartridgeLoop it then holds, lifts back out and repeats;
  // otherwise it plays once. Pausing rotation pauses this too.
  function makeIntro() {
    const names = ['cartridge', 'airway', 'cartridge_cover'].filter((n) => parts[n]);
    if (!names.length) return null;
    const lift = cfg.introLift ?? 0.06;
    const loop = !!cfg.cartridgeLoop;
    const DROP = 1.6, HOLD = cfg.loopHold ?? 5, RISE = 1.3, AWAY = 0.9; // seconds
    const CYCLE = DROP + HOLD + RISE + AWAY;
    let t = -0.35, last = performance.now();
    const place = (k) => names.forEach((n, i) => { parts[n].position.y = base[n] + k * lift * (i === 2 ? 1.5 : 1); });
    place(1);
    return function () {
      const now = performance.now(); const dt = Math.min((now - last) / 1000, 0.05); last = now;
      if (!paused) t += dt;
      if (!loop) {
        const k = Math.min(Math.max(t / DROP, 0), 1); place(1 - ease(k));
        if (k >= 1) intro = null;
        return;
      }
      const c = ((t % CYCLE) + CYCLE) % CYCLE;
      let k; // 1 = lifted, 0 = seated
      if (t < 0) k = 1;
      else if (c < DROP) k = 1 - ease(c / DROP);
      else if (c < DROP + HOLD) k = 0;
      else if (c < DROP + HOLD + RISE) { const u = (c - DROP - HOLD) / RISE; k = u * u * (3 - 2 * u); }
      else k = 1;
      place(k);
    };
  }
}

// Clearly labeled stand-in used only when no model is available.
function placeholder() {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x2a3a40, roughness: 0.6 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.105, 0.045, 0.124), mat);
  body.position.y = 0.0225;
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(body.geometry), new THREE.LineBasicMaterial({ color: 0x62a8cb }));
  edges.position.copy(body.position);
  g.add(body, edges);
  g.name = 'placeholder';
  return g;
}
