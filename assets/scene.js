/* ==========================================================================
   scene.js — three.js container film
   A 40ft container: lifted by crane → measured → doors opened → set into a
   ship's slot → flown → set down on a truck → delivered.
   Reads window.__beatFloat (0..6, continuous) written by film.js.
   ========================================================================== */
import * as THREE from "./vendor/three.module.min.js";

const canvas = document.getElementById("scene");
if (canvas && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  try { init(); } catch (e) { console.warn("3D scene unavailable:", e); canvas.style.display = "none"; }
}

function init() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0a121c, 16, 40);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 120);
  camera.position.set(0, 0.35, 10.5);
  camera.lookAt(0, 0, 0);

  /* ---------------- lights ---------------------------------------------- */
  scene.add(new THREE.HemisphereLight(0x8fb8e0, 0x1a2028, 0.65));
  scene.add(new THREE.AmbientLight(0xffffff, 0.22));
  const key = new THREE.DirectionalLight(0xffffff, 1.7);
  key.position.set(5, 7, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fc4e8, 0.5);
  rim.position.set(-5, 3, -4);
  scene.add(rim);

  /* ---------------- root (screen placement) ------------------------------ */
  const root = new THREE.Group();
  scene.add(root);

  /* ---------------- textures -------------------------------------------- */
  function corrugated(base, ribCount = 42, grime = 0.55) {
    const c = document.createElement("canvas");
    c.width = 512; c.height = 256;
    const g = c.getContext("2d");
    g.fillStyle = base; g.fillRect(0, 0, 512, 256);
    const w = 512 / ribCount;
    for (let i = 0; i < ribCount; i++) {
      const x = i * w;
      const grad = g.createLinearGradient(x, 0, x + w, 0);
      grad.addColorStop(0, "rgba(0,0,0,0.34)");
      grad.addColorStop(0.42, "rgba(255,255,255,0.16)");
      grad.addColorStop(0.6, "rgba(255,255,255,0.05)");
      grad.addColorStop(1, "rgba(0,0,0,0.30)");
      g.fillStyle = grad; g.fillRect(x, 0, w, 256);
    }
    // grime toward the floor edge + random weathering
    const gr = g.createLinearGradient(0, 150, 0, 256);
    gr.addColorStop(0, "rgba(30,22,14,0)");
    gr.addColorStop(1, `rgba(28,20,12,${grime})`);
    g.fillStyle = gr; g.fillRect(0, 150, 512, 106);
    for (let i = 0; i < 340; i++) {
      g.fillStyle = `rgba(${20 + Math.random() * 40 | 0},${16 + Math.random() * 26 | 0},10,${Math.random() * 0.22})`;
      g.fillRect(Math.random() * 512, Math.random() * 256, 1 + Math.random() * 3, 1 + Math.random() * 2);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }

  function shadowTex() {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    const rad = g.createRadialGradient(64, 64, 4, 64, 64, 62);
    rad.addColorStop(0, "rgba(0,0,0,0.85)");
    rad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = rad; g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }

  /* ---------------- container ------------------------------------------- */
  const L = 6, H = 1.5, W = 1.35;                 // 40ft proportions
  const paint = corrugated("#1e3a5f");
  const paintDoor = corrugated("#183052", 26, 0.5);
  const paintRoof = corrugated("#162a48", 60, 0.35);

  const matSide  = new THREE.MeshStandardMaterial({ map: paint, roughness: 0.78, metalness: 0.12 });
  const matRoof  = new THREE.MeshStandardMaterial({ map: paintRoof, roughness: 0.8, metalness: 0.1 });
  const matDoor  = new THREE.MeshStandardMaterial({ map: paintDoor, roughness: 0.75, metalness: 0.14, side: THREE.DoubleSide });
  const matSteel = new THREE.MeshStandardMaterial({ color: 0xb9bec4, roughness: 0.4, metalness: 0.7 });

  const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);

  const container = new THREE.Group();
  {
    const sideL = box(L, H, 0.07, matSide); sideL.position.z =  W / 2;
    const sideR = box(L, H, 0.07, matSide); sideR.position.z = -W / 2;
    const roof  = box(L, 0.07, W, matRoof); roof.position.y = H / 2;
    const floor = box(L, 0.07, W, matRoof); floor.position.y = -H / 2;
    const back  = box(0.07, H, W, matSide); back.position.x = -L / 2;
    container.add(sideL, sideR, roof, floor, back);

    // dark interior liner (visible only through the open doors)
    const liner = new THREE.Mesh(
      new THREE.BoxGeometry(L - 0.1, H - 0.1, W - 0.1),
      new THREE.MeshStandardMaterial({ color: 0x272d35, roughness: 0.95, side: THREE.BackSide })
    );
    container.add(liner);

    // cargo inside
    const cargoMats = [0x8a6a3f, 0x6b7280, 0xa3763f, 0x5b6b52].map(
      c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.9 })
    );
    [[1.6, -0.27, -0.3, 1.5, 0.9, 0.55],
     [1.6, -0.27,  0.34, 1.5, 0.9, 0.5],
     [0.0, -0.31,  0.0, 1.2, 0.82, 1.0],
     [-1.7, -0.2, -0.1, 1.4, 1.04, 0.9]].forEach((c, i) => {
      const m = box(c[3], c[4], c[5], cargoMats[i % 4]);
      m.position.set(c[0], c[1], c[2]);
      container.add(m);
    });

    // warm light that comes on when the doors open
    const inner = new THREE.PointLight(0xffb066, 0, 6);
    inner.position.set(0.9, 0.1, 0);
    container.add(inner);
    container.userData.inner = inner;

    // doors — two panels hinged at the outer edges of the +X end
    const mkDoor = (side) => {
      const pivot = new THREE.Group();
      pivot.position.x = L / 2;
      pivot.position.z = side * W / 2;
      const panel = box(0.09, H * 0.985, W / 2 - 0.02, matDoor);
      panel.position.z = -side * (W / 4 - 0.01);
      pivot.add(panel);
      // lock bars + handles
      [-0.16, 0.16].forEach(o => {
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, H * 0.88, 10), matSteel);
        bar.position.set(0.06, 0, -side * (W / 4) + o * side);
        pivot.add(bar);
        const handle = box(0.05, 0.05, 0.3, matSteel);
        handle.position.set(0.07, -H * 0.3, bar.position.z);
        pivot.add(handle);
      });
      container.add(pivot);
      return pivot;
    };
    container.userData.doors = [mkDoor(1), mkDoor(-1)];
  }

  const containerRig = new THREE.Group();          // carries transforms + sway
  containerRig.add(container);
  root.add(containerRig);

  /* ---------------- hook + spreader ------------------------------------- */
  const hookGroup = new THREE.Group();
  {
    const spreader = box(6.15, 0.16, 1.5,
      new THREE.MeshStandardMaterial({ color: 0xe0a800, roughness: 0.55, metalness: 0.45 }));
    hookGroup.add(spreader);
    // twistlocks
    [[-3, -0.7], [-3, 0.7], [3, -0.7], [3, 0.7]].forEach(([x, z]) => {
      const tl = box(0.18, 0.12, 0.18, new THREE.MeshStandardMaterial({ color: 0xd2451a, roughness: 0.6 }));
      tl.position.set(x, -0.13, z);
      hookGroup.add(tl);
    });
    // four cables up to the hook block
    const cableMat = new THREE.MeshStandardMaterial({ color: 0x23272c, roughness: 0.6, metalness: 0.5 });
    const top = new THREE.Vector3(0, 2.3, 0);
    [[-2.9, -0.62], [-2.9, 0.62], [2.9, -0.62], [2.9, 0.62]].forEach(([x, z]) => {
      const from = new THREE.Vector3(x, 0.08, z);
      const dir = top.clone().sub(from);
      const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, dir.length(), 6), cableMat);
      cable.position.copy(from).addScaledVector(dir, 0.5);
      cable.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
      hookGroup.add(cable);
    });
    const block = box(0.5, 0.5, 0.34,
      new THREE.MeshStandardMaterial({ color: 0xe0a800, roughness: 0.5, metalness: 0.5 }));
    block.position.y = 2.45;
    hookGroup.add(block);
    const hook = new THREE.Mesh(
      new THREE.TorusGeometry(0.19, 0.055, 10, 22, Math.PI * 1.55),
      new THREE.MeshStandardMaterial({ color: 0xcfd4da, roughness: 0.35, metalness: 0.8 })
    );
    hook.position.y = 2.8; hook.rotation.z = Math.PI * 0.12;
    hookGroup.add(hook);
  }
  root.add(hookGroup);

  /* ---------------- ship deck + slot ------------------------------------ */
  const deckGroup = new THREE.Group();
  {
    const hull = new THREE.Mesh(
      new THREE.BoxGeometry(30, 0.5, 10),
      new THREE.MeshStandardMaterial({ color: 0x232a33, roughness: 0.9 })
    );
    hull.position.set(0, -2.9, -6.4);
    deckGroup.add(hull);

    const palette = [0x33465a, 0x6b4a3a, 0x4a5a4a, 0x5a5f6b, 0x7a3f35, 0x2f4a5e, 0x6a7078];
    const stackMat = i => new THREE.MeshStandardMaterial({
      map: corrugated("#" + palette[i % palette.length].toString(16).padStart(6, "0"), 30, 0.3),
      roughness: 0.85, metalness: 0.1
    });
    // two rows behind the empty slot (slot at x≈0, z≈-4.5)
    let i = 0;
    [-10.4, -4, 4, 10.4].forEach(x => {
      [-7.6, -9.4].forEach(z => {
        const c = box(L - 0.2, H, W, stackMat(i++));
        c.position.set(x, -2.4, z);
        deckGroup.add(c);
        const c2 = box(L - 0.2, H, W, stackMat(i++));
        c2.position.set(x, -0.85, z);
        deckGroup.add(c2);
      });
    });
    // bow-ward far row for depth
    [-7.2, -0.6, 6].forEach(x => {
      const c = box(L - 0.2, H, W, stackMat(i++));
      c.position.set(x, -2.4, -11.6);
      deckGroup.add(c);
    });
  }
  root.add(deckGroup);

  /* ---------------- truck ------------------------------------------------ */
  const truckGroup = new THREE.Group();
  {
    const dark = new THREE.MeshStandardMaterial({ color: 0x1b2634, roughness: 0.7, metalness: 0.3 });
    const cabM = new THREE.MeshStandardMaterial({ color: 0x16202c, roughness: 0.5, metalness: 0.45 });
    const chassis = box(8.4, 0.18, 1.5, dark);
    chassis.position.set(-0.6, -1.99, 0);
    truckGroup.add(chassis);
    // legs connecting container to chassis
    const leg = box(6.4, 0.14, 1.1, dark);
    leg.position.set(-0.6, -1.86, 0);
    truckGroup.add(leg);
    const cab = box(1.7, 1.15, 1.45, cabM);
    cab.position.set(4.15, -1.325, 0);
    truckGroup.add(cab);
    const wind = box(0.1, 0.5, 1.3,
      new THREE.MeshStandardMaterial({ color: 0x0c141d, roughness: 0.2, metalness: 0.6 }));
    wind.position.set(3.34, -1.1, 0);
    truckGroup.add(wind);
    const wheelM = new THREE.MeshStandardMaterial({ color: 0x0c1117, roughness: 0.95 });
    const hubM = new THREE.MeshStandardMaterial({ color: 0x565e68, roughness: 0.4, metalness: 0.7 });
    [-3.4, -2.4, -1.4, 3.0].forEach(x => {
      [-0.62, 0.62].forEach(z => {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.26, 20), wheelM);
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(x, -2.5, z);
        truckGroup.add(wheel);
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.28, 14), hubM);
        hub.rotation.x = Math.PI / 2;
        hub.position.copy(wheel.position);
        truckGroup.add(hub);
      });
    });
    truckGroup.scale.setScalar(0.9);
  }
  root.add(truckGroup);

  /* ---------------- shadows --------------------------------------------- */
  const shTex = shadowTex();
  const mkShadow = (w, d) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, d),
      new THREE.MeshBasicMaterial({ map: shTex, transparent: true, opacity: 0, depthWrite: false })
    );
    m.rotation.x = -Math.PI / 2;
    return m;
  };
  const truckShadow = mkShadow(9.5, 3);
  truckShadow.position.set(-0.6, -2.88, 0.6);
  const deckShadow = mkShadow(7, 2.4);
  deckShadow.position.set(0, -2.63, -7.6);
  root.add(truckShadow, deckShadow);

  /* ---------------- cargo aircraft (IN THE AIR beat) ---------------------- */
  const planeGroup = new THREE.Group();
  {
    const pMat = new THREE.MeshStandardMaterial({ color: 0x1e2a38, roughness: 0.6, metalness: 0.45, emissive: 0x0a121c, emissiveIntensity: 0.4 });
    const pDark = new THREE.MeshStandardMaterial({ color: 0x141c26, roughness: 0.7, metalness: 0.3 });
    const fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.42, 9, 18), pMat);
    fuse.rotation.z = Math.PI / 2;
    planeGroup.add(fuse);
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.7, 18), pMat);
    nose.rotation.z = -Math.PI / 2;
    nose.position.x = 5.35;
    planeGroup.add(nose);
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1.3, 12), pMat);
    tail.rotation.z = Math.PI / 2;
    tail.position.x = -5.15;
    planeGroup.add(tail);
    const wing = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.12, 7.2), pMat);
    wing.position.set(0.6, -0.15, 0);
    planeGroup.add(wing);
    const hstab = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.08, 3.4), pMat);
    hstab.position.set(-4.3, 0.18, 0);
    planeGroup.add(hstab);
    const vstab = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.5, 1.7), pMat);
    vstab.position.set(-4.7, 0.85, 0);
    planeGroup.add(vstab);
    // engines
    [-2.6, 2.6].forEach(z => {
      const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 1.0, 12), pDark);
      eng.rotation.z = Math.PI / 2;
      eng.position.set(0.9, -0.55, z);
      planeGroup.add(eng);
      const intake = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 12), pDark);
      intake.rotation.z = Math.PI / 2;
      intake.position.set(1.4, -0.55, z);
      planeGroup.add(intake);
    });
    // cargo door (slightly open)
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.04, 1.9), pDark);
    door.position.set(2.2, -0.52, 0);
    door.rotation.x = -0.35;
    planeGroup.add(door);
    planeGroup.position.set(0, 3.2, 0);
    planeGroup.rotation.z = 0.03;
  }
  root.add(planeGroup);

  /* ---------------- speed streaks (IN THE AIR beat) ---------------------- */
  const streaks = new THREE.Group();
  const streakMats = [];
  for (let i = 0; i < 6; i++) {
    const m = new THREE.MeshBasicMaterial({ color: 0xdfe9f4, transparent: true, opacity: 0, depthWrite: false });
    streakMats.push(m);
    const s = new THREE.Mesh(new THREE.BoxGeometry(2.4 + Math.random() * 2.4, 0.03, 0.03), m);
    s.position.set((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 4.4, -2 - Math.random() * 4);
    s.userData.speed = 10 + Math.random() * 10;
    streaks.add(s);
  }
  root.add(streaks);

  /* ---------------- beat keyframes --------------------------------------- */
  // Each beat puts the container in a distinct place so the film reads as a journey.
  // px py pz rx ry rz | sc | hook truck deck streak | open
  const KF = [
    { px: 0.6,  py: 0.35, pz: 0,   rx: 0,   ry: 0.22,  rz: 0.03, sc: 1,    hook: 1, truck: 0, deck: 0, streak: 0, open: 0 }, // 0 LIFTED   (hanging from crane)
    { px: 0.6,  py: 0.2,  pz: 0,   rx: 0,   ry: -0.12, rz: 0,    sc: 1,    hook: 1, truck: 0, deck: 0, streak: 0, open: 0 }, // 1 MEASURED (steady, checked)
    { px: 0.6,  py: 0.1,  pz: 0,   rx: 0,   ry: -1.35, rz: 0,    sc: 1,    hook: 1, truck: 0, deck: 0, streak: 0, open: 1 }, // 2 OPENED   (doors open to camera)
    { px: 0,    py: -1.95,pz: -7.6,rx: 0,   ry: 0,     rz: 0,    sc: 0.88, hook: 0, truck: 0, deck: 1, streak: 0, open: 0 }, // 3 ON BOARD (slotted into ship)
    { px: 0,    py: 1.6,  pz: 0.4, rx: 0.08,ry: 1.05,  rz: -0.12,sc: 0.95, hook: 0, truck: 0, deck: 0, streak: 1, open: 0 }, // 4 IN THE AIR (flying)
    { px: -0.6, py: -1.15,pz: 0.6, rx: 0,   ry: 0.1,   rz: 0,    sc: 1,    hook: 0, truck: 1, deck: 0, streak: 0, open: 0 }, // 5 ON THE ROAD (on the truck)
    { px: -0.6, py: -1.15,pz: 0.6, rx: 0,   ry: 0.28,  rz: 0,    sc: 1,    hook: 0, truck: 1, deck: 0, streak: 0, open: 1 }  // 6 DELIVERED (doors open at dock)
  ];

  // camera framing per beat (dolly + look target)
  const CKF = [
    { z: 10.5, y: 0.35, x: 0 },   // 0
    { z: 10.5, y: 0.35, x: 0 },   // 1
    { z: 9.6,  y: 0.3,  x: 0 },   // 2 closer on open doors
    { z: 13.5, y: 0.6,  x: 0 },   // 3 pull back to see the ship
    { z: 10,   y: 1.0,  x: 0 },   // 4 look up into the air
    { z: 10.5, y: 0.35, x: 0 },   // 5
    { z: 10.5, y: 0.35, x: 0 }    // 6
  ];
  const FIELDS = Object.keys(KF[0]);
  const smooth = t => t * t * (3 - 2 * t);
  const lerp = (a, b, t) => a + (b - a) * t;

  function sample(raw) {
    const i = Math.max(0, Math.min(KF.length - 1, Math.floor(raw)));
    const j = Math.min(KF.length - 1, i + 1);
    const t = smooth(Math.max(0, Math.min(1, raw - i)));
    const out = {};
    FIELDS.forEach(f => { out[f] = lerp(KF[i][f], KF[j][f], t); });
    return out;
  }

  /* ---------------- group opacity helper --------------------------------- */
  const setGroupOpacity = (group, o) => {
    group.visible = o > 0.01;
    group.traverse(n => {
      if (n.isMesh) {
        const m = n.material;
        if (!m.userData._init) { m.transparent = true; m.userData._base = m.opacity; m.userData._init = true; }
        m.opacity = (m.userData._base ?? 1) * o;
      }
    });
  };

  /* ---------------- layout / resize -------------------------------------- */
  let mobile = false;
  function resize() {
    const w = canvas.clientWidth || innerWidth;
    const h = canvas.clientHeight || innerHeight;
    mobile = w < 760;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = mobile ? 44 : 34;
    camera.updateProjectionMatrix();
    root.position.x = mobile ? 0 : Math.min(1.35, (w / h) * 0.62);
    root.position.y = mobile ? 0.5 : 0;
    root.scale.setScalar(mobile ? 0.72 : 1);
  }
  addEventListener("resize", resize);
  resize();

  /* ---------------- visibility gate -------------------------------------- */
  let filmVisible = true;
  const filmEl = document.querySelector(".film");
  new IntersectionObserver(es => { filmVisible = es[0].isIntersecting; },
    { threshold: 0 }).observe(filmEl);

  /* ---------------- render loop ------------------------------------------ */
  const clock = new THREE.Clock();
  let lastT = 0;

  function frame2() {
    requestAnimationFrame(frame2);
    if (!filmVisible) return;
    const t = clock.getElapsedTime();
    const dt = Math.min(0.05, t - lastT); lastT = t;
    const raw = window.__beatFloat ?? 0;
    const s = sample(raw);

    // camera dolly per beat
    const ci = Math.max(0, Math.min(CKF.length - 1, Math.floor(raw)));
    const cj = Math.min(CKF.length - 1, ci + 1);
    const ct = smooth(Math.max(0, Math.min(1, raw - ci)));
    camera.position.set(
      lerp(CKF[ci].x, CKF[cj].x, ct),
      lerp(CKF[ci].y, CKF[cj].y, ct),
      lerp(CKF[ci].z, CKF[cj].z, ct)
    );
    camera.lookAt(0, 0.1, 0);

    const sway = Math.max(0, Math.min(1, 1.4 - raw * 0.7));
    containerRig.position.set(s.px, s.py + Math.sin(t * 0.7 + 0.6) * 0.045 * sway, s.pz);
    containerRig.rotation.set(
      s.rx,
      s.ry + Math.sin(t * 0.55 + 1.3) * 0.03 * sway,
      s.rz + Math.sin(t * 0.8) * 0.024 * sway
    );
    containerRig.scale.setScalar(s.sc);

    const angle = s.open * 1.95;
    container.userData.doors[0].rotation.y = -angle;
    container.userData.doors[1].rotation.y = angle;
    container.userData.inner.intensity = s.open * 3.2;

    const rise = (1 - s.hook) * 2.4;
    hookGroup.position.set(s.px, s.py + 0.75 * s.sc + 0.14 + rise, s.pz);
    hookGroup.rotation.y = s.ry;
    setGroupOpacity(hookGroup, s.hook);

    setGroupOpacity(truckGroup, s.truck);
    setGroupOpacity(deckGroup, s.deck);
    truckShadow.material.opacity = s.truck * 0.5;
    truckShadow.visible = s.truck > 0.02;
    deckShadow.material.opacity = s.deck * 0.42;
    deckShadow.visible = s.deck > 0.02;

    setGroupOpacity(streaks, s.streak);
    setGroupOpacity(planeGroup, s.streak);
    if (s.streak > 0.02) {
      streaks.children.forEach(p => {
        p.position.x += p.userData.speed * dt;
        if (p.position.x > 9) p.position.x = -9;
      });
      streakMats.forEach(m => { m.opacity = s.streak * 0.45; });
    }

    renderer.render(scene, camera);
  }
  frame2();
}
