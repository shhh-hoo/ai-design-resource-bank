(() => {
  const chapterLabels = new Map();
  const demoMap = {
    "camera-dolly": demoCameraDolly,
    "depth-parallax": demoDepthParallax,
    "split-text-reveal": demoSplitText,
    "particle-attractor": demoParticleAttractor,
    "noise-threshold-wipe": demoNoiseWipe,
    "explode-assemble": demoExplodeAssemble,
    "scroll-scrub": demoScrollScrub,
    "stage-spotlight": demoStageSpotlight,
    "bond-morph": demoBondMorph,
    "graph-relayout": demoGraphRelayout,
    "canvas-focus-lens": demoFocusLens,
    "anchored-callout": demoAnchoredCallout,
  };

  let registry = null;
  let renderQueued = false;
  let activeDemoHost = null;
  let pendingDemoHost = null;
  let activeCleanup = null;

  const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const escapeHtml = (value = "") => String(value).replace(/[&<>'\"]/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  }[char]));

  async function loadRegistry() {
    if (!window.jsyaml) return null;
    const response = await fetch("./registries/frontend-mechanisms.yaml", { cache: "no-store" });
    if (!response.ok) return null;
    return window.jsyaml.load(await response.text()) || {};
  }

  function expectedChapterIds() {
    return (registry?.chapters || []).filter((chapter) =>
      (registry?.mechanisms || []).some((item) => item.domain === chapter.id)
    ).map((chapter) => `chapter-${chapter.id}`);
  }

  function chaptersAreCurrent() {
    const host = document.getElementById("mechanismChapters");
    if (!host || !registry?.chapters) return false;
    const expected = expectedChapterIds();
    const actual = Array.from(host.querySelectorAll(":scope > .chapter")).map((node) => node.id);
    return expected.length === actual.length && expected.every((id, index) => actual[index] === id);
  }

  function queueChapterRender() {
    if (renderQueued || !registry) return;
    renderQueued = true;
    requestAnimationFrame(() => {
      renderQueued = false;
      if (!chaptersAreCurrent()) renderRegistryChapters();
    });
  }

  function renderRegistryChapters() {
    const host = document.getElementById("mechanismChapters");
    const template = document.getElementById("mechanismCardTemplate");
    if (!host || !template || !registry) return;

    host.replaceChildren();
    const mechanisms = registry.mechanisms || [];
    let visibleIndex = 0;

    (registry.chapters || []).forEach((chapter) => {
      const items = mechanisms.filter((item) => item.domain === chapter.id);
      if (!items.length) return;
      visibleIndex += 1;
      chapterLabels.set(chapter.id, chapter.label || chapter.id);

      const section = document.createElement("section");
      section.className = "chapter";
      section.id = `chapter-${chapter.id}`;
      section.innerHTML = `
        <div class="chapter-heading">
          <span class="chapter-index">${String(visibleIndex).padStart(2, "0")} / SUBJECT</span>
          <h2>${escapeHtml(chapter.label || chapter.id)}</h2>
          <p class="chapter-blurb">${escapeHtml(chapter.blurb || "")}</p>
        </div>`;

      const list = document.createElement("div");
      list.className = "mechanism-list";
      items.forEach((item, index) => list.append(createMechanismCard(template, item, index)));
      section.append(list);
      host.append(section);
    });
  }

  function createMechanismCard(template, item, index) {
    const card = template.content.firstElementChild.cloneNode(true);
    const uid = `mechanism:${item.id}`;
    card.dataset.id = uid;
    card.querySelector(".mechanism-number").textContent = String(index + 1).padStart(2, "0");
    card.querySelector(".mechanism-title").textContent = item.name || item.id;
    card.querySelector(".mechanism-summary").textContent = item.summary || "";
    const open = () => openViaBoard(uid);
    card.addEventListener("click", open);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
    return card;
  }

  function openViaBoard(uid) {
    history.pushState({ uid }, "", `#${uid}`);
    window.dispatchEvent(new PopStateEvent("popstate", { state: { uid } }));
  }

  function renderChapterNav() {
    const nav = document.getElementById("chapterNav");
    const search = document.getElementById("searchInput");
    if (!nav || !registry) return;
    nav.replaceChildren();
    const mechanisms = registry.mechanisms || [];
    (registry.chapters || []).forEach((chapter) => {
      if (!mechanisms.some((item) => item.domain === chapter.id)) return;
      chapterLabels.set(chapter.id, chapter.label || chapter.id);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "chapter-link";
      button.textContent = chapter.label || chapter.id;
      button.addEventListener("click", () => {
        if (search?.value) {
          search.value = "";
          search.dispatchEvent(new Event("input", { bubbles: true }));
        }
        queueChapterRender();
        requestAnimationFrame(() => requestAnimationFrame(() => {
          document.getElementById(`chapter-${chapter.id}`)?.scrollIntoView({
            behavior: reducedMotion() ? "auto" : "smooth",
            block: "start",
          });
        }));
      });
      nav.append(button);
    });
  }

  function prettyDrawerEyebrow() {
    const drawer = document.getElementById("detailDrawer");
    const content = document.getElementById("drawerContent");
    if (!drawer?.classList.contains("is-open") || !content || !registry) return;
    const eyebrow = content.querySelector(".drawer-eyebrow");
    if (!eyebrow || !/\/ mechanism\s*$/i.test(eyebrow.textContent || "")) return;
    const hash = decodeURIComponent(location.hash.replace(/^#mechanism:/, ""));
    const item = (registry.mechanisms || []).find((mechanism) => mechanism.id === hash);
    if (!item) return;
    const label = chapterLabels.get(item.domain);
    if (label) eyebrow.textContent = `${label} / mechanism`;
  }

  function observeChapters() {
    const host = document.getElementById("mechanismChapters");
    if (!host) return;
    new MutationObserver(() => queueChapterRender()).observe(host, { childList: true });
  }

  function observeDrawer() {
    const content = document.getElementById("drawerContent");
    const drawer = document.getElementById("detailDrawer");
    if (!content || !drawer) return;

    new MutationObserver(() => {
      prettyDrawerEyebrow();
      const host = content.querySelector("[data-demo]");
      if (!host) return;
      const demo = demoMap[host.dataset.demo];
      if (!demo || host === activeDemoHost || host === pendingDemoHost) return;
      pendingDemoHost = host;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (!host.isConnected || !drawer.classList.contains("is-open")) {
          pendingDemoHost = null;
          return;
        }
        cleanupDemo();
        pendingDemoHost = null;
        activeDemoHost = host;
        activeCleanup = demo(host) || (() => {});
      }));
    }).observe(content, { childList: true, subtree: true });

    new MutationObserver(() => {
      if (!drawer.classList.contains("is-open")) cleanupDemo();
    }).observe(drawer, { attributes: true, attributeFilter: ["class"] });
  }

  function cleanupDemo() {
    if (activeCleanup) activeCleanup();
    activeCleanup = null;
    activeDemoHost = null;
    pendingDemoHost = null;
  }

  function svgHost(host, content, controls = "") {
    host.innerHTML = `${content}${controls}`;
    return host.querySelector("svg");
  }

  function control(label, value = 50, readout = false) {
    return `<div class="demo-controls"><label>${label}</label><input data-range type="range" min="0" max="100" value="${value}">${readout ? '<span class="demo-readout" data-readout></span>' : ""}</div>`;
  }

  function demoCameraDolly(host) {
    const svg = svgHost(host, `<svg viewBox="0 0 560 250" role="img" aria-label="Camera dolly changes depth relationships">
      <line x1="34" y1="205" x2="526" y2="205" stroke="#d7d7d0"/>
      <rect data-back x="340" y="88" width="72" height="72" fill="#fff" stroke="#111" stroke-width="2"/>
      <rect data-front x="150" y="112" width="96" height="96" fill="#111"/>
      <circle data-camera cx="55" cy="205" r="7" fill="#e84a2a"/>
      <path data-ray d="M55 205L190 150M55 205L376 124" fill="none" stroke="#d7d7d0" stroke-dasharray="4 4"/>
      <text x="37" y="231" font-size="10" fill="#6f6f6a">camera</text>
    </svg>`, control("dolly", 35, true));
    const front = svg.querySelector("[data-front]");
    const back = svg.querySelector("[data-back]");
    const camera = svg.querySelector("[data-camera]");
    const range = host.querySelector("[data-range]");
    const readout = host.querySelector("[data-readout]");
    const update = () => {
      const p = Number(range.value) / 100;
      const frontScale = 1 + p * .8;
      const backScale = 1 + p * .32;
      front.setAttribute("transform", `translate(${198 - 198 * frontScale} ${160 - 160 * frontScale}) scale(${frontScale})`);
      back.setAttribute("transform", `translate(${376 - 376 * backScale} ${124 - 124 * backScale}) scale(${backScale})`);
      camera.setAttribute("cx", 55 + 80 * p);
      readout.textContent = p < .4 ? "wide" : p < .75 ? "near" : "close";
    };
    range.addEventListener("input", update); update();
    return () => {};
  }

  function demoDepthParallax(host) {
    const svg = svgHost(host, `<svg viewBox="0 0 560 250" role="img" aria-label="Depth parallax layers move at different rates">
      <g data-far fill="#d7d7d0"><circle cx="92" cy="65" r="7"/><circle cx="210" cy="48" r="5"/><circle cx="450" cy="72" r="6"/><circle cx="320" cy="92" r="4"/></g>
      <g data-mid fill="#7a7a74"><rect x="115" y="112" width="86" height="70"/><rect x="352" y="102" width="94" height="82"/></g>
      <g data-near><rect x="230" y="135" width="110" height="75" fill="#111"/><circle cx="285" cy="124" r="9" fill="#e84a2a"/></g>
    </svg>`, control("viewpoint", 50, false));
    const far = svg.querySelector("[data-far]"); const mid = svg.querySelector("[data-mid]"); const near = svg.querySelector("[data-near]"); const range = host.querySelector("[data-range]");
    const update = () => {
      const dx = Number(range.value) - 50;
      far.setAttribute("transform", `translate(${dx * .18} 0)`);
      mid.setAttribute("transform", `translate(${dx * .52} 0)`);
      near.setAttribute("transform", `translate(${dx * 1.05} 0)`);
    };
    range.addEventListener("input", update); update(); return () => {};
  }

  function demoSplitText(host) {
    host.innerHTML = `<div style="height:210px;display:grid;place-items:center;border-bottom:1px solid #d7d7d0;overflow:hidden">
      <div data-copy style="font:700 clamp(28px,6vw,54px)/.95 Georgia,serif;letter-spacing:-.05em;text-align:center">
        ${["Make", "the", "idea", "move."].map((word, index) => `<span data-word style="display:inline-block;margin:.05em .08em;opacity:0;transform:translateY(1em);transition:opacity .42s ease ${index * 75}ms, transform .42s cubic-bezier(.2,.8,.2,1) ${index * 75}ms">${word}</span>`).join("")}
      </div>
    </div><div class="demo-controls"><button class="demo-button" data-play type="button">Reveal text</button><span class="demo-readout" data-readout>hidden</span></div>`;
    const words = Array.from(host.querySelectorAll("[data-word]")); const button = host.querySelector("[data-play]"); const readout = host.querySelector("[data-readout]"); let shown = false;
    const update = () => {
      words.forEach((word) => { word.style.opacity = shown ? "1" : "0"; word.style.transform = shown ? "translateY(0)" : "translateY(1em)"; });
      button.textContent = shown ? "Reset" : "Reveal text"; readout.textContent = shown ? "resolved" : "hidden";
    };
    button.addEventListener("click", () => { shown = !shown; update(); }); update(); return () => {};
  }

  function demoParticleAttractor(host) {
    const points = Array.from({ length: 26 }, (_, i) => ({
      x: 45 + ((i * 83) % 470), y: 35 + ((i * 47) % 180), vx: 0, vy: 0,
    }));
    const circles = points.map((point, i) => `<circle data-p="${i}" cx="${point.x}" cy="${point.y}" r="${i % 5 === 0 ? 4.5 : 3}" fill="${i % 7 === 0 ? "#e84a2a" : "#111"}"/>`).join("");
    const svg = svgHost(host, `<svg viewBox="0 0 560 250" role="img" aria-label="Particles attracted to a movable point">${circles}<circle data-attractor cx="280" cy="125" r="15" fill="none" stroke="#e84a2a" stroke-width="2"/></svg>`);
    const els = Array.from(svg.querySelectorAll("[data-p]")); const attractor = svg.querySelector("[data-attractor]"); let ax = 280, ay = 125, raf = 0, stopped = false;
    const move = (event) => { const rect = svg.getBoundingClientRect(); ax = (event.clientX - rect.left) / rect.width * 560; ay = (event.clientY - rect.top) / rect.height * 250; attractor.setAttribute("cx", ax); attractor.setAttribute("cy", ay); };
    svg.addEventListener("pointermove", move);
    const frame = () => {
      points.forEach((p, i) => {
        const dx = ax - p.x, dy = ay - p.y, d = Math.max(24, Math.hypot(dx, dy)); const force = 42 / (d * d);
        p.vx = (p.vx + dx * force) * .96; p.vy = (p.vy + dy * force) * .96;
        if (!reducedMotion()) { p.x += p.vx; p.y += p.vy; }
        els[i].setAttribute("cx", p.x.toFixed(2)); els[i].setAttribute("cy", p.y.toFixed(2));
      });
      if (!stopped) raf = requestAnimationFrame(frame);
    };
    frame(); return () => { stopped = true; cancelAnimationFrame(raf); svg.removeEventListener("pointermove", move); };
  }

  function demoNoiseWipe(host) {
    const cols = 16, rows = 8, cellW = 35, cellH = 31.25;
    const cells = [];
    for (let y = 0; y < rows; y += 1) for (let x = 0; x < cols; x += 1) {
      const score = ((x * 37 + y * 71 + x * y * 13) % 101) / 100;
      cells.push(`<rect data-score="${score}" x="${x * cellW}" y="${y * cellH}" width="${cellW + .5}" height="${cellH + .5}" fill="#e84a2a" opacity="0"/>`);
    }
    const svg = svgHost(host, `<svg viewBox="0 0 560 250" role="img" aria-label="Noise threshold wipe"><rect width="560" height="250" fill="#111"/><text x="280" y="134" text-anchor="middle" fill="#fff" font-size="42" font-family="Georgia,serif">NEXT</text>${cells.join("")}</svg>`, control("threshold", 42, true));
    const rects = Array.from(svg.querySelectorAll("[data-score]")); const range = host.querySelector("[data-range]"); const readout = host.querySelector("[data-readout]");
    const update = () => { const t = Number(range.value) / 100; rects.forEach((rect) => { rect.style.opacity = Number(rect.dataset.score) <= t ? ".92" : "0"; }); readout.textContent = `${Math.round(t * 100)}%`; };
    range.addEventListener("input", update); update(); return () => {};
  }

  function demoExplodeAssemble(host) {
    const pieces = [
      [220,85,-120,-60,60,50], [280,85,0,-85,60,50], [340,85,120,-60,60,50],
      [220,135,-135,45,60,50], [280,135,0,95,60,50], [340,135,135,45,60,50],
    ];
    const svg = svgHost(host, `<svg viewBox="0 0 560 250" role="img" aria-label="Exploded parts assemble into one object"><g data-pieces>${pieces.map(([x,y,dx,dy,w,h], i) => `<rect data-piece="${i}" x="${x}" y="${y}" width="${w}" height="${h}" fill="${i === 2 ? "#e84a2a" : "#fff"}" stroke="#111" stroke-width="1.5"/>`).join("")}</g></svg>`, control("assembly", 0, true));
    const rects = Array.from(svg.querySelectorAll("[data-piece]")); const range = host.querySelector("[data-range]"); const readout = host.querySelector("[data-readout]");
    const update = () => { const t = Number(range.value) / 100; pieces.forEach((piece, i) => { const [, , dx, dy] = piece; rects[i].setAttribute("transform", `translate(${dx * (1 - t)} ${dy * (1 - t)})`); }); readout.textContent = t < .2 ? "exploded" : t > .8 ? "assembled" : "aligning"; };
    range.addEventListener("input", update); update(); return () => {};
  }

  function demoScrollScrub(host) {
    host.innerHTML = `<div data-scroll style="height:220px;overflow:auto;border-bottom:1px solid #d7d7d0;position:relative">
      <div style="height:720px;position:relative">
        <div data-stage style="position:sticky;top:0;height:205px;display:grid;place-items:center;overflow:hidden;background:#f6f6f2">
          <div data-object style="width:90px;height:90px;background:#111;transform:translateX(-170px) rotate(0deg)"></div>
          <div data-progress style="position:absolute;left:0;bottom:0;height:3px;width:0;background:#e84a2a"></div>
        </div>
      </div>
    </div><div class="demo-controls"><span class="demo-readout" data-readout>0%</span><span style="margin-left:auto;color:#6f6f6a;font-size:11px">scroll inside the frame</span></div>`;
    const scroll = host.querySelector("[data-scroll]"); const object = host.querySelector("[data-object]"); const progress = host.querySelector("[data-progress]"); const readout = host.querySelector("[data-readout]");
    const update = () => { const p = scroll.scrollTop / Math.max(1, scroll.scrollHeight - scroll.clientHeight); object.style.transform = `translateX(${(-170 + 340 * p).toFixed(1)}px) rotate(${(180 * p).toFixed(1)}deg)`; progress.style.width = `${p * 100}%`; readout.textContent = `${Math.round(p * 100)}%`; };
    scroll.addEventListener("scroll", update, { passive: true }); update(); return () => scroll.removeEventListener("scroll", update);
  }

  function demoStageSpotlight(host) {
    const svg = svgHost(host, `<svg viewBox="0 0 560 250" role="img" aria-label="Spotlight directs attention on a stage"><rect width="560" height="250" fill="#111"/><path data-cone d="M280 0L180 215H380Z" fill="#fff" opacity=".16"/><circle data-spot cx="280" cy="190" r="62" fill="#fff" opacity=".12"/><g fill="#fff"><circle cx="155" cy="178" r="20"/><rect x="260" y="150" width="40" height="55"/><path d="M390 205L420 150L450 205Z"/></g><circle data-hit cx="280" cy="178" r="28" fill="none" stroke="#e84a2a" stroke-width="3"/></svg>`, control("spotlight", 50, false));
    const cone = svg.querySelector("[data-cone]"); const spot = svg.querySelector("[data-spot]"); const hit = svg.querySelector("[data-hit]"); const range = host.querySelector("[data-range]");
    const update = () => { const x = 95 + Number(range.value) * 3.7; cone.setAttribute("d", `M280 0L${x - 78} 215H${x + 78}Z`); spot.setAttribute("cx", x); hit.setAttribute("cx", x); };
    range.addEventListener("input", update); update(); return () => {};
  }

  function demoBondMorph(host) {
    const svg = svgHost(host, `<svg viewBox="0 0 560 250" role="img" aria-label="Bond breaking and bond forming transition">
      <circle cx="120" cy="125" r="30" fill="#fff" stroke="#111" stroke-width="2"/><circle cx="240" cy="125" r="30" fill="#fff" stroke="#111" stroke-width="2"/><circle cx="440" cy="125" r="30" fill="#fff" stroke="#111" stroke-width="2"/>
      <line data-old x1="150" y1="125" x2="210" y2="125" stroke="#111" stroke-width="3"/><line data-new x1="270" y1="125" x2="410" y2="125" stroke="#e84a2a" stroke-width="3" opacity="0"/>
      <text x="113" y="130" font-size="14">A</text><text x="233" y="130" font-size="14">B</text><text x="433" y="130" font-size="14">C</text>
    </svg>`, control("reaction step", 0, true));
    const oldBond = svg.querySelector("[data-old]"); const newBond = svg.querySelector("[data-new]"); const range = host.querySelector("[data-range]"); const readout = host.querySelector("[data-readout]");
    const update = () => { const p = Number(range.value) / 100; oldBond.style.opacity = String(Math.max(0, 1 - p * 1.5)); newBond.style.opacity = String(Math.max(0, (p - .28) / .72)); newBond.setAttribute("x1", 270 + 80 * (1 - p)); readout.textContent = p < .35 ? "A—B" : p < .72 ? "transition" : "B—C"; };
    range.addEventListener("input", update); update(); return () => {};
  }

  function demoGraphRelayout(host) {
    const nodes = [0,1,2,3,4,5];
    const layoutA = [[105,72],[280,60],[450,78],[120,178],[285,170],[445,182]];
    const layoutB = [[280,42],[175,102],[385,102],[115,190],[280,190],[445,190]];
    const edges = [[0,1],[1,2],[0,3],[1,4],[2,5],[3,4],[4,5]];
    const svg = svgHost(host, `<svg viewBox="0 0 560 250" role="img" aria-label="Graph nodes preserve identity while layout changes"><g data-edges>${edges.map((_, i) => `<line data-edge="${i}" stroke="#bdbdb7" stroke-width="1.5"/>`).join("")}</g><g>${nodes.map((i) => `<g data-node="${i}"><circle r="15" fill="${i === 1 ? "#e84a2a" : "#fff"}" stroke="#111" stroke-width="1.5"/><text text-anchor="middle" y="4" font-size="9">${i + 1}</text></g>`).join("")}</g></svg>`, `<div class="demo-controls"><button class="demo-button" data-toggle type="button">Change layout</button><span class="demo-readout" data-readout>wide</span></div>`);
    const nodeEls = Array.from(svg.querySelectorAll("[data-node]")); const edgeEls = Array.from(svg.querySelectorAll("[data-edge]")); const button = host.querySelector("[data-toggle]"); const readout = host.querySelector("[data-readout]"); let radial = false, raf = 0;
    const draw = (positions) => { positions.forEach(([x,y], i) => nodeEls[i].setAttribute("transform", `translate(${x} ${y})`)); edges.forEach(([a,b], i) => { edgeEls[i].setAttribute("x1", positions[a][0]); edgeEls[i].setAttribute("y1", positions[a][1]); edgeEls[i].setAttribute("x2", positions[b][0]); edgeEls[i].setAttribute("y2", positions[b][1]); }); };
    const animate = (from, to) => { cancelAnimationFrame(raf); if (reducedMotion()) { draw(to); return; } const start = performance.now(); const step = (now) => { const t = Math.min(1, (now - start) / 420); const e = 1 - (1 - t) ** 3; const pos = from.map(([x,y], i) => [x + (to[i][0] - x) * e, y + (to[i][1] - y) * e]); draw(pos); if (t < 1) raf = requestAnimationFrame(step); }; raf = requestAnimationFrame(step); };
    button.addEventListener("click", () => { const from = radial ? layoutB : layoutA; const to = radial ? layoutA : layoutB; radial = !radial; animate(from, to); readout.textContent = radial ? "hierarchy" : "wide"; }); draw(layoutA); return () => cancelAnimationFrame(raf);
  }

  function demoFocusLens(host) {
    const svg = svgHost(host, `<svg viewBox="0 0 560 250" role="img" aria-label="Movable focus lens reveals local detail"><defs><clipPath id="lensClip"><circle data-clip cx="280" cy="125" r="68"/></clipPath></defs><g opacity=".28" fill="#111">${Array.from({ length: 28 }, (_, i) => `<circle cx="${35 + (i * 91) % 500}" cy="${30 + (i * 53) % 190}" r="5"/>`).join("")}</g><g clip-path="url(#lensClip)">${Array.from({ length: 12 }, (_, i) => `<g><circle cx="${70 + (i * 127) % 430}" cy="${55 + (i * 79) % 145}" r="9" fill="#111"/><text x="${80 + (i * 127) % 430}" y="${58 + (i * 79) % 145}" font-size="9" fill="#111">${String.fromCharCode(65 + i)}</text></g>`).join("")}</g><circle data-ring cx="280" cy="125" r="68" fill="none" stroke="#e84a2a" stroke-width="2"/></svg>`);
    const clip = svg.querySelector("[data-clip]"); const ring = svg.querySelector("[data-ring]"); const move = (event) => { const rect = svg.getBoundingClientRect(); const x = Math.max(70, Math.min(490, (event.clientX - rect.left) / rect.width * 560)); const y = Math.max(70, Math.min(180, (event.clientY - rect.top) / rect.height * 250)); clip.setAttribute("cx", x); clip.setAttribute("cy", y); ring.setAttribute("cx", x); ring.setAttribute("cy", y); };
    svg.addEventListener("pointermove", move); return () => svg.removeEventListener("pointermove", move);
  }

  function demoAnchoredCallout(host) {
    const svg = svgHost(host, `<svg viewBox="0 0 560 250" role="img" aria-label="Callout stays anchored while object moves"><rect data-object x="105" y="110" width="90" height="62" fill="#111"/><line data-line x1="195" y1="110" x2="395" y2="68" stroke="#e84a2a" stroke-width="2"/><rect x="395" y="40" width="118" height="56" fill="#fff" stroke="#111"/><text x="411" y="63" font-size="11" fill="#111">same feature</text><text x="411" y="80" font-size="9" fill="#6f6f6a">screen-space label</text><circle data-anchor cx="195" cy="110" r="5" fill="#e84a2a"/></svg>`, control("object position", 18, false));
    const object = svg.querySelector("[data-object]"); const line = svg.querySelector("[data-line]"); const anchor = svg.querySelector("[data-anchor]"); const range = host.querySelector("[data-range]");
    const update = () => { const p = Number(range.value) / 100; const x = 75 + 270 * p; const y = 135 - 55 * Math.sin(p * Math.PI); object.setAttribute("x", x); object.setAttribute("y", y); const ax = x + 90, ay = y; line.setAttribute("x1", ax); line.setAttribute("y1", ay); anchor.setAttribute("cx", ax); anchor.setAttribute("cy", ay); };
    range.addEventListener("input", update); update(); return () => {};
  }

  async function init() {
    registry = await loadRegistry();
    if (!registry) return;
    (registry.chapters || []).forEach((chapter) => chapterLabels.set(chapter.id, chapter.label || chapter.id));

    observeChapters();
    observeDrawer();

    const waitForBoard = () => {
      const summary = document.getElementById("resultSummary");
      const error = document.getElementById("loadError");
      if (error && !error.hidden) return;
      if (!summary || /Loading/i.test(summary.textContent || "")) {
        requestAnimationFrame(waitForBoard);
        return;
      }
      renderRegistryChapters();
      renderChapterNav();
    };
    waitForBoard();
  }

  init().catch((error) => console.error("Mechanism workbench extension failed", error));
})();
