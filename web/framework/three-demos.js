import * as THREE from "three";

const PAPER = 0xf6f6f2;
const INK = 0x111111;
const MUTED = 0xb9b9b2;
const ACCENT = 0xe84a2a;

function shell(host, controlLabel, value = 50, { overlay = false } = {}) {
  host.innerHTML = `
    <div class="framework-stage" data-framework-stage>
      <canvas data-framework-canvas aria-label="Interactive Three.js demonstration"></canvas>
      ${overlay ? '<svg class="framework-overlay" data-framework-overlay aria-hidden="true"></svg>' : ""}
      <span class="framework-badge">Three.js</span>
    </div>
    <div class="demo-controls">
      <label>${controlLabel}</label>
      <input data-range type="range" min="0" max="100" value="${value}">
      <span class="demo-readout" data-readout></span>
    </div>`;
  return {
    stage: host.querySelector("[data-framework-stage]"),
    canvas: host.querySelector("[data-framework-canvas]"),
    overlay: host.querySelector("[data-framework-overlay]"),
    range: host.querySelector("[data-range]"),
    readout: host.querySelector("[data-readout]"),
  };
}

function context(host, controlLabel, value = 50, options = {}) {
  const ui = shell(host, controlLabel, value, options);
  const renderer = new THREE.WebGLRenderer({
    canvas: ui.canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(PAPER, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  const size = { width: 0, height: 240 };

  const resize = () => {
    const width = Math.max(280, Math.round(ui.stage.getBoundingClientRect().width || host.clientWidth || 520));
    const height = 240;
    if (width === size.width && height === size.height) return;
    size.width = width;
    size.height = height;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    if (ui.overlay) ui.overlay.setAttribute("viewBox", `0 0 ${width} ${height}`);
  };

  const render = () => {
    resize();
    renderer.render(scene, camera);
  };

  const resizeObserver = new ResizeObserver(render);
  resizeObserver.observe(ui.stage);

  const dispose = () => {
    resizeObserver.disconnect();
    scene.traverse((object) => {
      object.geometry?.dispose?.();
      if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose?.());
      else object.material?.dispose?.();
    });
    renderer.dispose();
  };

  return { ...ui, renderer, scene, camera, size, render, dispose };
}

function lights(scene) {
  scene.add(new THREE.HemisphereLight(0xffffff, 0x7a7a74, 2.4));
  const key = new THREE.DirectionalLight(0xffffff, 3.3);
  key.position.set(4, 6, 5);
  scene.add(key);
}

function outlinedBox(width, height, depth, fill = 0xffffff) {
  const group = new THREE.Group();
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ color: fill, roughness: 0.72, metalness: 0.02 })
  );
  group.add(mesh);
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry),
    new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.78 })
  );
  group.add(edges);
  return group;
}

export function cameraDolly(host) {
  const ctx = context(host, "camera position", 28);
  lights(ctx.scene);

  const grid = new THREE.GridHelper(8, 8, MUTED, 0xd8d8d2);
  grid.position.y = -1.15;
  ctx.scene.add(grid);

  const front = outlinedBox(1.45, 1.45, 1.45, INK);
  front.position.set(-1.15, -0.32, 1.45);
  ctx.scene.add(front);

  const back = outlinedBox(1.25, 1.25, 1.25, 0xf6f6f2);
  back.position.set(1.2, -0.2, -1.55);
  ctx.scene.add(back);

  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 20, 14),
    new THREE.MeshBasicMaterial({ color: ACCENT })
  );
  marker.position.set(1.2, 0.65, -0.8);
  ctx.scene.add(marker);

  ctx.camera.position.set(0, 1.35, 8.2);
  ctx.camera.lookAt(0, -0.05, 0);

  const update = () => {
    const p = Number(ctx.range.value) / 100;
    ctx.camera.position.z = 8.7 - p * 4.55;
    ctx.camera.position.y = 1.5 - p * 0.3;
    ctx.camera.lookAt(0, -0.05, 0);
    ctx.readout.textContent = p < 0.35 ? "wide" : p < 0.72 ? "near" : "close";
    ctx.render();
  };

  ctx.range.addEventListener("input", update);
  update();
  return () => {
    ctx.range.removeEventListener("input", update);
    ctx.dispose();
  };
}

function orbitalLobe(color, opacity = 0.32) {
  const geometry = new THREE.SphereGeometry(0.78, 32, 20);
  const material = new THREE.MeshPhysicalMaterial({
    color,
    transparent: true,
    opacity,
    roughness: 0.7,
    metalness: 0,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.scale.set(1.42, 0.72, 0.72);
  return mesh;
}

function atomOrbital() {
  const group = new THREE.Group();
  const nucleus = new THREE.Mesh(
    new THREE.SphereGeometry(0.19, 24, 16),
    new THREE.MeshStandardMaterial({ color: INK, roughness: 0.8 })
  );
  group.add(nucleus);

  const left = orbitalLobe(0x4a4a46, 0.72);
  left.position.x = -0.72;
  group.add(left);

  const right = orbitalLobe(0xd8d8d2, 0.78);
  right.position.x = 0.72;
  group.add(right);
  return group;
}

export function orbitalOverlap(host) {
  const ctx = context(host, "separation", 58);
  lights(ctx.scene);

  const pair = new THREE.Group();
  pair.rotation.x = -0.18;
  pair.rotation.y = 0.38;
  ctx.scene.add(pair);

  const leftAtom = atomOrbital();
  const rightAtom = atomOrbital();
  rightAtom.rotation.y = Math.PI;
  pair.add(leftAtom, rightAtom);

  const overlap = new THREE.Mesh(
    new THREE.SphereGeometry(0.84, 32, 20),
    new THREE.MeshPhysicalMaterial({
      color: ACCENT,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      roughness: 0.5,
    })
  );
  overlap.scale.set(0.45, 0.72, 0.72);
  pair.add(overlap);

  ctx.camera.position.set(0, 0.8, 5.15);
  ctx.camera.lookAt(0, 0, 0);

  const update = () => {
    const p = Number(ctx.range.value) / 100;
    const separation = 4.2 - p * 2.65;
    leftAtom.position.x = -separation / 2;
    rightAtom.position.x = separation / 2;
    const overlapStrength = Math.max(0, Math.min(1, (3.4 - separation) / 1.5));
    overlap.scale.x = 0.18 + overlapStrength * 1.18;
    overlap.material.opacity = 0.08 + overlapStrength * 0.32;
    ctx.readout.textContent = overlapStrength < 0.12 ? "apart" : overlapStrength < 0.68 ? "overlap" : "strong overlap";
    ctx.render();
  };

  ctx.range.addEventListener("input", update);
  update();
  return () => {
    ctx.range.removeEventListener("input", update);
    ctx.dispose();
  };
}

export function explodeAssemble(host) {
  const ctx = context(host, "assembly", 18);
  lights(ctx.scene);

  const assembly = new THREE.Group();
  assembly.rotation.set(-0.25, 0.58, 0.04);
  ctx.scene.add(assembly);

  const assembled = [
    [-0.88, 0.48, 0], [0, 0.48, 0], [0.88, 0.48, 0],
    [-0.88, -0.44, 0], [0, -0.44, 0], [0.88, -0.44, 0],
  ];
  const exploded = [
    [-2.2, 1.35, 1.0], [0, 1.9, -0.65], [2.25, 1.18, 0.75],
    [-2.25, -1.12, -0.72], [0, -1.82, 0.95], [2.2, -1.2, -0.9],
  ];

  const pieces = assembled.map((position, index) => {
    const piece = outlinedBox(0.82, 0.82, 0.82, index === 2 ? ACCENT : 0xffffff);
    piece.position.fromArray(exploded[index]);
    assembly.add(piece);
    return piece;
  });

  ctx.camera.position.set(0.15, 1.2, 5.55);
  ctx.camera.lookAt(0, 0, 0);

  const update = () => {
    const p = Number(ctx.range.value) / 100;
    pieces.forEach((piece, index) => {
      const from = exploded[index];
      const to = assembled[index];
      piece.position.set(
        THREE.MathUtils.lerp(from[0], to[0], p),
        THREE.MathUtils.lerp(from[1], to[1], p),
        THREE.MathUtils.lerp(from[2], to[2], p)
      );
    });
    assembly.rotation.y = 0.35 + (1 - p) * 0.22;
    ctx.readout.textContent = p < 0.18 ? "exploded" : p > 0.86 ? "assembled" : "aligning";
    ctx.render();
  };

  ctx.range.addEventListener("input", update);
  update();
  return () => {
    ctx.range.removeEventListener("input", update);
    ctx.dispose();
  };
}

export function anchoredCallout(host) {
  const ctx = context(host, "object rotation", 38, { overlay: true });
  lights(ctx.scene);

  const object = outlinedBox(2.5, 1.7, 1.5, 0xffffff);
  ctx.scene.add(object);

  const localAnchor = new THREE.Vector3(1.25, 0.85, 0.75);
  const anchorDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 20, 14),
    new THREE.MeshBasicMaterial({ color: ACCENT })
  );
  anchorDot.position.copy(localAnchor);
  object.add(anchorDot);

  ctx.camera.position.set(3.0, 2.0, 4.3);
  ctx.camera.lookAt(0, 0, 0);

  ctx.overlay.innerHTML = `
    <line data-callout-line stroke="#e84a2a" stroke-width="1.8"/>
    <circle data-callout-point r="4" fill="#e84a2a"/>
    <rect data-callout-box width="128" height="44" rx="2" fill="#f8f8f5" stroke="#111"/>
    <text data-callout-title font-size="11" fill="#111" font-family="system-ui, sans-serif">same feature</text>
    <text data-callout-note font-size="9" fill="#6f6f6a" font-family="ui-monospace, monospace">3D → screen</text>`;

  const line = ctx.overlay.querySelector("[data-callout-line]");
  const point = ctx.overlay.querySelector("[data-callout-point]");
  const box = ctx.overlay.querySelector("[data-callout-box]");
  const title = ctx.overlay.querySelector("[data-callout-title]");
  const note = ctx.overlay.querySelector("[data-callout-note]");
  const world = new THREE.Vector3();

  const updateOverlay = () => {
    ctx.render();
    world.copy(localAnchor);
    object.localToWorld(world);
    world.project(ctx.camera);
    const x = (world.x * 0.5 + 0.5) * ctx.size.width;
    const y = (-world.y * 0.5 + 0.5) * ctx.size.height;
    const boxX = Math.max(8, ctx.size.width - 150);
    const boxY = 28;
    line.setAttribute("x1", x);
    line.setAttribute("y1", y);
    line.setAttribute("x2", boxX);
    line.setAttribute("y2", boxY + 22);
    point.setAttribute("cx", x);
    point.setAttribute("cy", y);
    box.setAttribute("x", boxX);
    box.setAttribute("y", boxY);
    title.setAttribute("x", boxX + 12);
    title.setAttribute("y", boxY + 18);
    note.setAttribute("x", boxX + 12);
    note.setAttribute("y", boxY + 34);
  };

  const update = () => {
    const p = Number(ctx.range.value) / 100;
    object.rotation.y = -0.9 + p * 1.8;
    object.rotation.x = 0.16 + Math.sin(p * Math.PI) * 0.26;
    ctx.readout.textContent = `${Math.round((-52 + p * 104))}°`;
    updateOverlay();
  };

  const resizeObserver = new ResizeObserver(updateOverlay);
  resizeObserver.observe(ctx.stage);
  ctx.range.addEventListener("input", update);
  update();

  return () => {
    resizeObserver.disconnect();
    ctx.range.removeEventListener("input", update);
    ctx.dispose();
  };
}
