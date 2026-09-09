(() => {
  const state = {
    mechanisms: [],
    tools: [],
    references: [],
    packages: [],
    items: [],
    query: "",
    view: "explore",
    indexType: "all",
    openUid: null,
    demoCleanup: null,
  };

  const els = {
    search: document.getElementById("searchInput"),
    chapterNav: document.getElementById("chapterNav"),
    explore: document.getElementById("exploreView"),
    chapters: document.getElementById("mechanismChapters"),
    searchResults: document.getElementById("searchResults"),
    index: document.getElementById("indexView"),
    indexList: document.getElementById("indexList"),
    indexType: document.getElementById("indexType"),
    summary: document.getElementById("resultSummary"),
    clearSearch: document.getElementById("clearSearch"),
    loadError: document.getElementById("loadError"),
    loadErrorMessage: document.getElementById("loadErrorMessage"),
    drawer: document.getElementById("detailDrawer"),
    drawerBackdrop: document.getElementById("drawerBackdrop"),
    drawerClose: document.getElementById("drawerClose"),
    drawerContent: document.getElementById("drawerContent"),
    drawerKind: document.getElementById("drawerKind"),
    mechanismTemplate: document.getElementById("mechanismCardTemplate"),
    viewButtons: Array.from(document.querySelectorAll("[data-view]")),
  };

  const domainMeta = {
    math: { label: "Mathematics", blurb: "Turn abstract relationships into objects that can be manipulated." },
    physics: { label: "Physics", blurb: "Keep state, force, motion, and time visible in the same explanation." },
    chemistry: { label: "Chemistry", blurb: "Show change without losing the chemical meaning carried by structure and space." },
    animation: { label: "Motion", blurb: "Use movement to establish sequence, hierarchy, and comparison—not decoration." },
    graphs: { label: "Graphs & space", blurb: "Preserve orientation while revealing structure, focus, and scale." },
  };

  const domainOrder = ["math", "physics", "chemistry", "animation", "graphs"];
  const typeOrder = ["mechanism", "tool", "reference", "package"];

  async function loadYaml(path) {
    if (!window.jsyaml) throw new Error("The YAML parser did not load.");
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    return window.jsyaml.load(await response.text()) || {};
  }

  async function loadData() {
    if (window.__BOARD_DATA__) return window.__BOARD_DATA__;
    const [mechanisms, tools, references, catalog] = await Promise.all([
      loadYaml("./registries/frontend-mechanisms.yaml"),
      loadYaml("./registries/frontend-tools.yaml"),
      loadYaml("./registries/reference-galleries.yaml"),
      loadYaml("./catalog.yaml"),
    ]);
    return { mechanisms, tools, references, catalog };
  }

  function normalize(data) {
    state.mechanisms = (data.mechanisms?.mechanisms || []).map((item) => ({
      uid: `mechanism:${item.id}`,
      sourceId: item.id,
      type: "mechanism",
      name: item.name,
      domain: item.domain || "other",
      summary: item.summary || "",
      useWhen: item.use_when || "",
      tools: item.tools || [],
      demo: item.demo || "",
      primitives: item.primitives || [],
      implementation: item.implementation_note || "",
      status: item.status || "seed",
    }));

    state.tools = (data.tools?.tools || []).map((item) => ({
      uid: `tool:${item.id}`,
      sourceId: item.id,
      type: "tool",
      name: item.name,
      domain: item.domains?.[0] || "other",
      domains: item.domains || [],
      summary: item.use_when || "",
      avoidWhen: item.avoid_when || "",
      capabilities: item.capabilities || [],
      ecosystem: item.ecosystem || [],
      tags: item.tags || [],
      priority: item.tier || "secondary",
      kind: item.kind || "tool",
      license: item.license || "",
      rights: item.rights_note || "",
      notes: item.agent_notes || "",
      maintenance: item.maintenance_note || "",
      links: { homepage: item.homepage || "", docs: item.docs || "", examples: item.examples || "" },
    }));

    state.references = (data.references?.galleries || []).map((item) => ({
      uid: `reference:${item.id}`,
      sourceId: item.id,
      type: "reference",
      name: item.name,
      domain: item.categories?.[0] || "other",
      domains: item.categories || [],
      summary: item.best_for || "",
      notes: item.reference_mode || "",
      tags: item.tags || [],
      priority: item.priority || "secondary",
      rights: item.rights_note || "",
      links: { homepage: item.url || "", docs: "", examples: "" },
    }));

    state.packages = (data.catalog?.resources || []).map((item) => ({
      uid: `package:${item.id}`,
      sourceId: item.id,
      type: "package",
      name: item.title || item.id,
      domain: item.domain || "other",
      domains: item.domain ? [item.domain] : [],
      summary: item.hint || "Reusable Resource Package.",
      tags: item.tags || [],
      status: item.status || "",
      path: item.path || "",
      links: {
        homepage: item.path ? `https://github.com/shhh-hoo/ai-design-resource-bank/tree/main/${item.path}` : "",
        docs: "",
        examples: "",
      },
    }));

    state.items = [...state.mechanisms, ...state.tools, ...state.references, ...state.packages];
  }

  function labelDomain(domain) {
    return domainMeta[domain]?.label || domain.split("-").map((part) => part ? part[0].toUpperCase() + part.slice(1) : part).join(" ");
  }

  function itemText(item) {
    return [
      item.name, item.sourceId, item.type, item.domain, item.summary, item.useWhen, item.avoidWhen,
      item.implementation, item.notes, item.maintenance, item.license,
      ...(item.domains || []), ...(item.capabilities || []), ...(item.tags || []),
      ...(item.ecosystem || []), ...(item.primitives || []), ...(item.tools || []),
    ].filter(Boolean).join(" ").toLowerCase();
  }

  function escapeHtml(value = "") {
    return String(value).replace(/[&<>'"]/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
    }[char]));
  }

  function renderChapterNav() {
    els.chapterNav.replaceChildren();
    domainOrder.forEach((domain) => {
      if (!state.mechanisms.some((item) => item.domain === domain)) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "chapter-link";
      button.textContent = labelDomain(domain);
      button.addEventListener("click", () => {
        setView("explore");
        state.query = "";
        els.search.value = "";
        renderExplore();
        document.getElementById(`chapter-${domain}`)?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
      });
      els.chapterNav.append(button);
    });
  }

  function createMechanismCard(item, index) {
    const card = els.mechanismTemplate.content.firstElementChild.cloneNode(true);
    card.dataset.id = item.uid;
    card.querySelector(".mechanism-number").textContent = String(index + 1).padStart(2, "0");
    card.querySelector(".mechanism-title").textContent = item.name;
    card.querySelector(".mechanism-summary").textContent = item.summary;
    const open = () => openDrawer(item.uid, true);
    card.addEventListener("click", open);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
    return card;
  }

  function renderExplore() {
    const query = state.query.trim().toLowerCase();
    els.clearSearch.hidden = !query;
    els.chapters.hidden = Boolean(query);
    els.searchResults.hidden = !query;

    if (query) {
      const matches = state.items.filter((item) => itemText(item).includes(query));
      els.summary.textContent = matches.length ? `${matches.length} result${matches.length === 1 ? "" : "s"} for “${state.query.trim()}”` : `No result for “${state.query.trim()}”`;
      renderSearchResults(matches);
      return;
    }

    els.summary.textContent = "Start with a mechanism. Details stay out of the way until you ask for them.";
    els.chapters.replaceChildren();
    domainOrder.forEach((domain, chapterIndex) => {
      const mechanisms = state.mechanisms.filter((item) => item.domain === domain);
      if (!mechanisms.length) return;
      const section = document.createElement("section");
      section.className = "chapter";
      section.id = `chapter-${domain}`;
      section.innerHTML = `
        <div class="chapter-heading">
          <span class="chapter-index">${String(chapterIndex + 1).padStart(2, "0")} / SUBJECT</span>
          <h2>${escapeHtml(labelDomain(domain))}</h2>
          <p class="chapter-blurb">${escapeHtml(domainMeta[domain]?.blurb || "")}</p>
        </div>`;
      const list = document.createElement("div");
      list.className = "mechanism-list";
      mechanisms.forEach((item, index) => list.append(createMechanismCard(item, index)));
      section.append(list);
      els.chapters.append(section);
    });
  }

  function renderSearchResults(matches) {
    els.searchResults.replaceChildren();
    if (!matches.length) return;
    typeOrder.forEach((type) => {
      const items = matches.filter((item) => item.type === type).slice(0, 24);
      if (!items.length) return;
      const block = document.createElement("section");
      block.className = "search-block";
      block.innerHTML = `<h2>${escapeHtml(pluralType(type))}</h2>`;
      const list = document.createElement("div");
      list.className = "result-list";
      items.forEach((item) => list.append(createResultRow(item)));
      block.append(list);
      els.searchResults.append(block);
    });
  }

  function createResultRow(item) {
    const row = document.createElement("article");
    row.className = "result-row";
    row.tabIndex = 0;
    row.innerHTML = `
      <span class="result-kind">${escapeHtml(item.type)}</span>
      <span class="result-name">${escapeHtml(item.name)}</span>
      <span class="result-summary">${escapeHtml(item.summary || "")}</span>
      <span class="result-arrow">↗</span>`;
    const open = () => openDrawer(item.uid, true);
    row.addEventListener("click", open);
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); }
    });
    return row;
  }

  function renderIndex() {
    els.indexList.replaceChildren();
    const query = state.query.trim().toLowerCase();
    const filtered = state.items.filter((item) => {
      if (state.indexType !== "all" && item.type !== state.indexType) return false;
      return !query || itemText(item).includes(query);
    });

    typeOrder.forEach((type) => {
      const items = filtered.filter((item) => item.type === type).sort((a, b) => a.name.localeCompare(b.name));
      if (!items.length) return;
      const group = document.createElement("section");
      group.className = "index-group";
      group.innerHTML = `<div class="index-group-title"><h2>${escapeHtml(pluralType(type))}</h2><small>${items.length}</small></div>`;
      const rows = document.createElement("div");
      rows.className = "index-rows";
      items.forEach((item, index) => {
        const row = document.createElement("article");
        row.className = "index-row";
        row.tabIndex = 0;
        row.innerHTML = `
          <span class="index-no">${String(index + 1).padStart(2, "0")}</span>
          <span class="index-name">${escapeHtml(item.name)}</span>
          <span class="index-use">${escapeHtml(item.summary || "")}</span>
          <span class="index-arrow">↗</span>`;
        const open = () => openDrawer(item.uid, true);
        row.addEventListener("click", open);
        row.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); }
        });
        rows.append(row);
      });
      group.append(rows);
      els.indexList.append(group);
    });
  }

  function pluralType(type) {
    return ({ mechanism: "Mechanisms", tool: "Tools", reference: "References", package: "Packages" })[type] || type;
  }

  function setView(view) {
    state.view = view;
    els.explore.hidden = view !== "explore";
    els.index.hidden = view !== "index";
    els.viewButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.view === view));
    if (view === "index") renderIndex();
    else renderExplore();
  }

  function getItem(uid) {
    return state.items.find((item) => item.uid === uid);
  }

  function getTool(id) {
    return state.tools.find((tool) => tool.sourceId === id);
  }

  function linkedMechanisms(toolId) {
    return state.mechanisms.filter((mechanism) => mechanism.tools.includes(toolId));
  }

  function openDrawer(uid, push = false) {
    const item = getItem(uid);
    if (!item) return;
    if (state.demoCleanup) {
      state.demoCleanup();
      state.demoCleanup = null;
    }
    state.openUid = uid;
    els.drawerKind.textContent = item.type;
    els.drawerContent.replaceChildren();
    els.drawerContent.append(item.type === "mechanism" ? renderMechanismDetail(item) : renderResourceDetail(item));
    els.drawer.classList.add("is-open");
    els.drawer.setAttribute("aria-hidden", "false");
    els.drawerBackdrop.hidden = false;
    document.body.style.overflow = "hidden";
    if (push) history.pushState({ uid }, "", `#${uid}`);
    requestAnimationFrame(() => {
      if (item.type === "mechanism" && item.demo) state.demoCleanup = initDemo(item.demo, els.drawerContent.querySelector("[data-demo]"));
    });
  }

  function closeDrawer(updateHistory = true) {
    if (state.demoCleanup) {
      state.demoCleanup();
      state.demoCleanup = null;
    }
    state.openUid = null;
    els.drawer.classList.remove("is-open");
    els.drawer.setAttribute("aria-hidden", "true");
    els.drawerBackdrop.hidden = true;
    document.body.style.overflow = "";
    if (updateHistory && location.hash) history.pushState({}, "", location.pathname + location.search);
  }

  function renderMechanismDetail(item) {
    const wrapper = document.createElement("div");
    const tools = item.tools.map(getTool).filter(Boolean);
    wrapper.innerHTML = `
      <p class="drawer-eyebrow">${escapeHtml(labelDomain(item.domain))} / mechanism</p>
      <h2 id="drawerTitle">${escapeHtml(item.name)}</h2>
      <p class="drawer-summary">${escapeHtml(item.summary)}</p>
      <div class="demo-stage" data-demo="${escapeHtml(item.demo)}"></div>
      <section class="drawer-section">
        <h3>Use this when</h3>
        <p>${escapeHtml(item.useWhen)}</p>
      </section>
      <section class="drawer-section">
        <h3>Good with</h3>
        <div class="related-list" data-related-tools></div>
      </section>
      <details class="drawer-details">
        <summary>Technical notes</summary>
        <dl class="detail-grid">
          <dt>Primitives</dt><dd>${escapeHtml(item.primitives.join(", "))}</dd>
          <dt>Implementation</dt><dd>${escapeHtml(item.implementation)}</dd>
          <dt>Status</dt><dd>${escapeHtml(item.status)}</dd>
        </dl>
      </details>
      <button class="copy-brief" type="button">Copy AI brief</button>`;

    const related = wrapper.querySelector("[data-related-tools]");
    tools.forEach((tool) => related.append(relatedButton(tool)));
    if (!tools.length) related.innerHTML = `<p>No preferred tool recorded yet.</p>`;
    wrapper.querySelector(".copy-brief").addEventListener("click", (event) => copyBrief(item, event.currentTarget));
    return wrapper;
  }

  function renderResourceDetail(item) {
    const wrapper = document.createElement("div");
    const related = item.type === "tool" ? linkedMechanisms(item.sourceId) : [];
    const sourceLinks = Object.entries(item.links || {}).filter(([, url]) => url);
    wrapper.innerHTML = `
      <p class="drawer-eyebrow">${escapeHtml(item.type)}${item.domain ? ` / ${escapeHtml(labelDomain(item.domain))}` : ""}</p>
      <h2 id="drawerTitle">${escapeHtml(item.name)}</h2>
      <p class="drawer-summary">${escapeHtml(item.summary || "")}</p>
      ${sourceLinks.length ? `<section class="drawer-section"><h3>Open source</h3><div class="source-links">${sourceLinks.map(([name, url]) => `<a class="source-link" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(name)} ↗</a>`).join("")}</div></section>` : ""}
      ${related.length ? `<section class="drawer-section"><h3>Mechanisms in this bank</h3><div class="related-list" data-related-mechanisms></div></section>` : ""}
      <details class="drawer-details">
        <summary>Technical details</summary>
        <dl class="detail-grid">
          ${item.kind ? `<dt>Kind</dt><dd>${escapeHtml(item.kind)}</dd>` : ""}
          ${item.priority ? `<dt>Priority</dt><dd>${escapeHtml(item.priority)}</dd>` : ""}
          ${item.capabilities?.length ? `<dt>Capabilities</dt><dd>${escapeHtml(item.capabilities.join(", "))}</dd>` : ""}
          ${item.ecosystem?.length ? `<dt>Ecosystem</dt><dd>${escapeHtml(item.ecosystem.join(", "))}</dd>` : ""}
          ${item.license ? `<dt>License</dt><dd>${escapeHtml(item.license)}</dd>` : ""}
          ${item.avoidWhen ? `<dt>Avoid when</dt><dd>${escapeHtml(item.avoidWhen)}</dd>` : ""}
          ${item.rights ? `<dt>Rights</dt><dd>${escapeHtml(item.rights)}</dd>` : ""}
          ${item.notes ? `<dt>Agent note</dt><dd>${escapeHtml(item.notes)}</dd>` : ""}
          ${item.maintenance ? `<dt>Maintenance</dt><dd>${escapeHtml(item.maintenance)}</dd>` : ""}
        </dl>
      </details>
      <button class="copy-brief" type="button">Copy AI brief</button>`;

    const host = wrapper.querySelector("[data-related-mechanisms]");
    if (host) related.forEach((mechanism) => host.append(relatedButton(mechanism)));
    wrapper.querySelector(".copy-brief").addEventListener("click", (event) => copyBrief(item, event.currentTarget));
    return wrapper;
  }

  function relatedButton(item) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "related-link";
    button.innerHTML = `<span>${escapeHtml(item.name)}</span><span>↗</span>`;
    button.addEventListener("click", () => openDrawer(item.uid, true));
    return button;
  }

  async function copyBrief(item, button) {
    const brief = item.type === "mechanism"
      ? `Use the AI Design Resource Bank mechanism “${item.name}” (${item.sourceId}). Goal: ${item.useWhen} Mechanism: ${item.summary} Preferred tools: ${item.tools.join(", ")}. Implementation note: ${item.implementation}`
      : `Use the AI Design Resource Bank ${item.type} “${item.name}” (${item.sourceId}). Best use: ${item.summary}${item.avoidWhen ? ` Avoid when: ${item.avoidWhen}` : ""}. Inspect its first-party source/examples before implementing.`;
    try {
      await navigator.clipboard.writeText(brief);
      button.textContent = "Copied";
      setTimeout(() => { button.textContent = "Copy AI brief"; }, 1200);
    } catch {
      button.textContent = "Copy unavailable";
    }
  }

  function reducedMotion() {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  }

  function svgHost(host, content, controls = "") {
    host.innerHTML = `${content}${controls}`;
    return host.querySelector("svg");
  }

  function initDemo(name, host) {
    if (!host) return () => {};
    const demos = {
      "movable-tangent": demoMovableTangent,
      "area-under-curve": demoArea,
      "vector-decomposition": demoVector,
      "force-vector-overlay": demoForce,
      "wave-propagation": demoWave,
      "reaction-coordinate": demoReaction,
      "orbital-overlap": demoOrbital,
      "electron-pushing": demoElectron,
      "mask-transition": demoMask,
      "pinned-reveal": demoPinned,
      "focus-context": demoFocus,
      "semantic-zoom": demoSemanticZoom,
    };
    return (demos[name] || demoUnavailable)(host);
  }

  function demoMovableTangent(host) {
    const svg = svgHost(host, `<svg viewBox="0 0 560 250" role="img" aria-label="Draggable tangent on a curve">
      <line x1="32" y1="125" x2="530" y2="125" stroke="#d9d9d2"/>
      <line x1="280" y1="20" x2="280" y2="230" stroke="#d9d9d2"/>
      <path data-curve fill="none" stroke="#111" stroke-width="2"/>
      <line data-tangent stroke="#111" stroke-width="1.5"/>
      <circle data-point r="6" fill="#e84a2a"/>
      <text data-label x="34" y="28" font-size="11" fill="#6f6f6a" font-family="monospace"></text>
    </svg>`);
    const curve = svg.querySelector("[data-curve]");
    const tangent = svg.querySelector("[data-tangent]");
    const point = svg.querySelector("[data-point]");
    const label = svg.querySelector("[data-label]");
    const yFor = (x) => 125 - 70 * Math.sin((x - 32) / 75);
    const slopeAt = (x) => -(70 / 75) * Math.cos((x - 32) / 75);
    let d = "";
    for (let x = 32; x <= 530; x += 3) d += `${x === 32 ? "M" : "L"}${x.toFixed(1)},${yFor(x).toFixed(1)} `;
    curve.setAttribute("d", d);
    let x = 340;
    const update = () => {
      const y = yFor(x); const m = slopeAt(x); const span = 90;
      point.setAttribute("cx", x); point.setAttribute("cy", y);
      tangent.setAttribute("x1", x - span); tangent.setAttribute("x2", x + span);
      tangent.setAttribute("y1", y - m * span); tangent.setAttribute("y2", y + m * span);
      label.textContent = `local slope ${(-m).toFixed(2)}`;
    };
    const move = (event) => {
      const rect = svg.getBoundingClientRect();
      x = Math.max(32, Math.min(530, (event.clientX - rect.left) / rect.width * 560));
      update();
    };
    svg.addEventListener("pointerdown", move);
    svg.addEventListener("pointermove", (event) => { if (event.buttons) move(event); });
    update();
    return () => {};
  }

  function demoArea(host) {
    const svg = svgHost(host, `<svg viewBox="0 0 560 250" role="img" aria-label="Variable area under a curve">
      <line x1="32" y1="208" x2="530" y2="208" stroke="#d9d9d2"/>
      <path data-area fill="#e84a2a" opacity=".16"/>
      <path data-curve fill="none" stroke="#111" stroke-width="2"/>
      <line data-boundary y1="35" y2="208" stroke="#e84a2a" stroke-width="1.5"/>
    </svg>`, `<div class="demo-controls"><label>boundary</label><input data-range type="range" min="0" max="100" value="60"><span class="demo-readout" data-readout></span></div>`);
    const curve = svg.querySelector("[data-curve]"); const area = svg.querySelector("[data-area]"); const boundary = svg.querySelector("[data-boundary]");
    const range = host.querySelector("[data-range]"); const readout = host.querySelector("[data-readout]");
    const yFor = (x) => 208 - 118 * (0.25 + 0.62 * Math.sin((x - 20) / 150) ** 2);
    let curveD = "";
    for (let x = 32; x <= 530; x += 3) curveD += `${x === 32 ? "M" : "L"}${x.toFixed(1)},${yFor(x).toFixed(1)} `;
    curve.setAttribute("d", curveD);
    const update = () => {
      const end = 32 + (Number(range.value) / 100) * 498;
      let d = `M32,208 L32,${yFor(32).toFixed(1)} `;
      for (let x = 32; x <= end; x += 3) d += `L${x.toFixed(1)},${yFor(x).toFixed(1)} `;
      d += `L${end.toFixed(1)},208 Z`;
      area.setAttribute("d", d); boundary.setAttribute("x1", end); boundary.setAttribute("x2", end);
      readout.textContent = `${range.value}%`;
    };
    range.addEventListener("input", update); update();
    return () => {};
  }

  function demoVector(host) {
    const svg = svgHost(host, `<svg viewBox="0 0 560 250" role="img" aria-label="Draggable vector decomposition">
      <defs><marker id="arrowBlack" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7Z" fill="#111"/></marker><marker id="arrowAccent" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7Z" fill="#e84a2a"/></marker></defs>
      <line x1="40" y1="200" x2="520" y2="200" stroke="#d9d9d2"/><line x1="90" y1="25" x2="90" y2="225" stroke="#d9d9d2"/>
      <line data-x x1="90" y1="200" stroke="#e84a2a" stroke-width="1.5" marker-end="url(#arrowAccent)"/>
      <line data-y stroke="#e84a2a" stroke-width="1.5" marker-end="url(#arrowAccent)"/>
      <line data-v x1="90" y1="200" stroke="#111" stroke-width="2" marker-end="url(#arrowBlack)"/>
      <circle data-point r="7" fill="#111"/>
    </svg>`);
    const v = svg.querySelector("[data-v]"); const xLine = svg.querySelector("[data-x]"); const yLine = svg.querySelector("[data-y]"); const point = svg.querySelector("[data-point]");
    let px = 390, py = 75;
    const update = () => {
      v.setAttribute("x2", px); v.setAttribute("y2", py);
      xLine.setAttribute("x2", px); xLine.setAttribute("y2", 200);
      yLine.setAttribute("x1", px); yLine.setAttribute("x2", px); yLine.setAttribute("y1", 200); yLine.setAttribute("y2", py);
      point.setAttribute("cx", px); point.setAttribute("cy", py);
    };
    const move = (event) => {
      const rect = svg.getBoundingClientRect();
      px = Math.max(120, Math.min(510, (event.clientX - rect.left) / rect.width * 560));
      py = Math.max(30, Math.min(190, (event.clientY - rect.top) / rect.height * 250));
      update();
    };
    svg.addEventListener("pointerdown", move); svg.addEventListener("pointermove", (event) => { if (event.buttons) move(event); }); update();
    return () => {};
  }

  function demoForce(host) {
    const svg = svgHost(host, `<svg viewBox="0 0 560 250" role="img" aria-label="Force vector overlay">
      <defs><marker id="forceArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#111"/></marker><marker id="forceAccent" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#e84a2a"/></marker></defs>
      <line x1="30" y1="195" x2="530" y2="195" stroke="#111"/>
      <rect x="225" y="135" width="110" height="60" fill="#fff" stroke="#111" stroke-width="2"/>
      <line x1="280" y1="135" x2="280" y2="62" stroke="#111" stroke-width="2" marker-end="url(#forceArrow)"/><text x="292" y="72" font-size="11" fill="#6f6f6a">N</text>
      <line x1="280" y1="194" x2="280" y2="232" stroke="#111" stroke-width="2" marker-end="url(#forceArrow)"/><text x="292" y="226" font-size="11" fill="#6f6f6a">mg</text>
      <line data-push x1="335" y1="165" x2="430" y2="165" stroke="#e84a2a" stroke-width="3" marker-end="url(#forceAccent)"/><text x="390" y="151" font-size="11" fill="#e84a2a">push</text>
    </svg>`, `<div class="demo-controls"><label>applied force</label><input data-range type="range" min="20" max="150" value="95"></div>`);
    const line = svg.querySelector("[data-push]"); const range = host.querySelector("[data-range]");
    const update = () => line.setAttribute("x2", 335 + Number(range.value));
    range.addEventListener("input", update); update();
    return () => {};
  }

  function demoWave(host) {
    const svg = svgHost(host, `<svg viewBox="0 0 560 250" role="img" aria-label="Animated wave propagation"><line x1="24" y1="125" x2="536" y2="125" stroke="#d9d9d2"/><path data-wave fill="none" stroke="#111" stroke-width="2"/></svg>`, `<div class="demo-controls"><label>wavelength</label><input data-range type="range" min="45" max="120" value="78"><span class="demo-readout" data-readout></span></div>`);
    const path = svg.querySelector("[data-wave]"); const range = host.querySelector("[data-range]"); const readout = host.querySelector("[data-readout]");
    let phase = 0, raf = 0, stopped = false;
    const draw = () => {
      const wavelength = Number(range.value); let d = "";
      for (let x = 24; x <= 536; x += 4) {
        const y = 125 - 48 * Math.sin((x / wavelength) * Math.PI * 2 - phase);
        d += `${x === 24 ? "M" : "L"}${x},${y.toFixed(1)} `;
      }
      path.setAttribute("d", d); readout.textContent = `${wavelength}px`;
      if (!reducedMotion()) phase += .045;
      if (!stopped) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { stopped = true; cancelAnimationFrame(raf); };
  }

  function demoReaction(host) {
    const svg = svgHost(host, `<svg viewBox="0 0 560 250" role="img" aria-label="Reaction coordinate scrubber">
      <line x1="30" y1="210" x2="530" y2="210" stroke="#d9d9d2"/><line x1="30" y1="30" x2="30" y2="210" stroke="#d9d9d2"/>
      <path data-path fill="none" stroke="#111" stroke-width="2"/><circle data-marker r="7" fill="#e84a2a"/><text x="38" y="45" font-size="10" fill="#6f6f6a">energy</text><text x="440" y="232" font-size="10" fill="#6f6f6a">progress</text>
    </svg>`, `<div class="demo-controls"><label>reaction</label><input data-range type="range" min="0" max="100" value="0"><span class="demo-readout" data-readout>reactants</span></div>`);
    const path = svg.querySelector("[data-path]"); const marker = svg.querySelector("[data-marker]"); const range = host.querySelector("[data-range]"); const readout = host.querySelector("[data-readout]");
    const energy = (t) => 178 - 112 * Math.exp(-((t - .48) ** 2) / .035) + 30 * t;
    let d = ""; for (let i = 0; i <= 100; i += 1) { const t = i / 100; const x = 55 + 450 * t; const y = energy(t); d += `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)} `; } path.setAttribute("d", d);
    const update = () => {
      const t = Number(range.value) / 100; marker.setAttribute("cx", 55 + 450 * t); marker.setAttribute("cy", energy(t));
      readout.textContent = t < .33 ? "reactants" : t < .66 ? "transition state" : "products";
    };
    range.addEventListener("input", update); update(); return () => {};
  }

  function demoOrbital(host) {
    const svg = svgHost(host, `<svg viewBox="0 0 560 250" role="img" aria-label="Orbital overlap">
      <ellipse data-left cx="190" cy="125" rx="92" ry="48" fill="#111" opacity=".10" stroke="#111"/><ellipse data-right cx="370" cy="125" rx="92" ry="48" fill="#111" opacity=".10" stroke="#111"/>
      <ellipse data-overlap cx="280" cy="125" rx="38" ry="44" fill="#e84a2a" opacity=".25"/>
      <circle cx="160" cy="125" r="7" fill="#111"/><circle cx="400" cy="125" r="7" fill="#111"/>
    </svg>`, `<div class="demo-controls"><label>separation</label><input data-range type="range" min="80" max="220" value="180"></div>`);
    const left = svg.querySelector("[data-left]"); const right = svg.querySelector("[data-right]"); const overlap = svg.querySelector("[data-overlap]"); const range = host.querySelector("[data-range]");
    const update = () => {
      const sep = Number(range.value); const lx = 280 - sep / 2; const rx = 280 + sep / 2;
      left.setAttribute("cx", lx); right.setAttribute("cx", rx);
      const width = Math.max(0, 184 - sep); overlap.setAttribute("rx", Math.max(1, width / 2)); overlap.style.opacity = width > 0 ? String(Math.min(.42, .12 + width / 220)) : "0";
    };
    range.addEventListener("input", update); update(); return () => {};
  }

  function demoElectron(host) {
    svgHost(host, `<svg viewBox="0 0 560 250" role="img" aria-label="Electron pushing step">
      <defs><marker id="electronArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#e84a2a"/></marker></defs>
      <g data-before><circle cx="165" cy="135" r="30" fill="none" stroke="#111" stroke-width="2"/><circle cx="365" cy="135" r="30" fill="none" stroke="#111" stroke-width="2"/><line x1="195" y1="135" x2="335" y2="135" stroke="#111" stroke-width="2"/><circle cx="230" cy="98" r="4" fill="#111"/><circle cx="243" cy="98" r="4" fill="#111"/></g>
      <path data-arrow d="M236 94 C275 42 340 55 365 104" fill="none" stroke="#e84a2a" stroke-width="2.5" marker-end="url(#electronArrow)" stroke-dasharray="190" stroke-dashoffset="190"/>
      <line data-newbond x1="197" y1="126" x2="333" y2="126" stroke="#e84a2a" stroke-width="2" opacity="0"/>
    </svg>`, `<div class="demo-controls"><button class="demo-button" data-step type="button">Push electrons</button><span class="demo-readout" data-readout>before</span></div>`);
    const arrow = host.querySelector("[data-arrow]"); const bond = host.querySelector("[data-newbond]"); const button = host.querySelector("[data-step]"); const readout = host.querySelector("[data-readout]"); let active = false;
    const update = () => { arrow.style.transition = reducedMotion() ? "none" : "stroke-dashoffset .65s ease"; arrow.style.strokeDashoffset = active ? "0" : "190"; bond.style.opacity = active ? "1" : "0"; readout.textContent = active ? "bond formed" : "before"; button.textContent = active ? "Reset" : "Push electrons"; };
    button.addEventListener("click", () => { active = !active; update(); }); update(); return () => {};
  }

  function demoMask(host) {
    const svg = svgHost(host, `<svg viewBox="0 0 560 250" role="img" aria-label="Mask transition">
      <rect width="560" height="250" fill="#111"/><circle cx="165" cy="125" r="62" fill="#fff" opacity=".88"/><rect x="305" y="72" width="120" height="105" fill="#fff" opacity=".88"/>
      <clipPath id="maskClip"><rect data-mask x="0" y="0" width="280" height="250"/></clipPath>
      <g clip-path="url(#maskClip)"><rect width="560" height="250" fill="#f6f6f2"/><circle cx="165" cy="125" r="44" fill="#e84a2a"/><rect x="305" y="92" width="150" height="65" fill="#e84a2a"/></g>
    </svg>`, `<div class="demo-controls"><label>reveal</label><input data-range type="range" min="0" max="100" value="50"></div>`);
    const mask = svg.querySelector("[data-mask]"); const range = host.querySelector("[data-range]"); const update = () => mask.setAttribute("width", 5.6 * Number(range.value)); range.addEventListener("input", update); update(); return () => {};
  }

  function demoPinned(host) {
    host.innerHTML = `<div class="demo-scroll" data-scroll><div class="demo-scroll-stage" data-stage>Anchor</div><div class="demo-scroll-step">1 — establish the object</div><div class="demo-scroll-step">2 — change one relationship</div><div class="demo-scroll-step">3 — resolve the comparison</div></div>`;
    const scroll = host.querySelector("[data-scroll]"); const stage = host.querySelector("[data-stage]"); const words = ["Anchor", "Compare", "Resolve"];
    const update = () => { const progress = scroll.scrollTop / Math.max(1, scroll.scrollHeight - scroll.clientHeight); stage.textContent = words[Math.min(2, Math.floor(progress * 3))]; stage.style.color = progress > .34 && progress < .68 ? "#e84a2a" : "#111"; };
    scroll.addEventListener("scroll", update, { passive: true }); update(); return () => scroll.removeEventListener("scroll", update);
  }

  function demoFocus(host) {
    const nodes = [
      [90,125], [190,72], [190,178], [295,125], [405,70], [405,180], [485,125],
    ];
    const edges = [[0,1],[0,2],[1,3],[2,3],[3,4],[3,5],[4,6],[5,6]];
    const edgeSvg = edges.map(([a,b], i) => `<line data-edge="${i}" x1="${nodes[a][0]}" y1="${nodes[a][1]}" x2="${nodes[b][0]}" y2="${nodes[b][1]}" stroke="#cfcfc8" stroke-width="1.5"/>`).join("");
    const nodeSvg = nodes.map(([x,y], i) => `<g data-node="${i}" tabindex="0"><circle cx="${x}" cy="${y}" r="13" fill="#fff" stroke="#111" stroke-width="1.5"/><text x="${x}" y="${y+4}" text-anchor="middle" font-size="9" fill="#111">${i+1}</text></g>`).join("");
    const svg = svgHost(host, `<svg viewBox="0 0 560 250" role="img" aria-label="Focus plus context graph">${edgeSvg}${nodeSvg}</svg>`);
    const nodeEls = Array.from(svg.querySelectorAll("[data-node]")); const edgeEls = Array.from(svg.querySelectorAll("[data-edge]"));
    const focus = (id) => {
      const connected = new Set([id]); edges.forEach(([a,b]) => { if (a === id) connected.add(b); if (b === id) connected.add(a); });
      nodeEls.forEach((node) => { const i = Number(node.dataset.node); node.style.opacity = connected.has(i) ? "1" : ".18"; node.querySelector("circle").setAttribute("fill", i === id ? "#e84a2a" : "#fff"); });
      edgeEls.forEach((edge, i) => { const [a,b] = edges[i]; const active = a === id || b === id; edge.style.opacity = active ? "1" : ".14"; edge.setAttribute("stroke", active ? "#111" : "#cfcfc8"); });
    };
    nodeEls.forEach((node) => node.addEventListener("click", () => focus(Number(node.dataset.node)))); focus(3); return () => {};
  }

  function demoSemanticZoom(host) {
    const svg = svgHost(host, `<svg viewBox="0 0 560 250" role="img" aria-label="Semantic zoom detail levels">
      <g data-low><circle cx="135" cy="125" r="50" fill="#111"/><circle cx="280" cy="125" r="50" fill="#111"/><circle cx="425" cy="125" r="50" fill="#111"/></g>
      <g data-mid opacity="0"><circle cx="120" cy="112" r="17" fill="#111"/><circle cx="150" cy="138" r="17" fill="#111"/><circle cx="265" cy="108" r="17" fill="#111"/><circle cx="300" cy="140" r="17" fill="#111"/><circle cx="410" cy="110" r="17" fill="#111"/><circle cx="445" cy="142" r="17" fill="#111"/></g>
      <g data-high opacity="0" fill="#111" font-size="10" font-family="monospace"><text x="102" y="84">concept A</text><text x="247" y="80">concept B</text><text x="392" y="82">concept C</text><path d="M150 125L265 125M300 125L410 125" stroke="#e84a2a" stroke-width="2"/></g>
    </svg>`, `<div class="demo-controls"><label>semantic zoom</label><input data-range type="range" min="0" max="100" value="10"><span class="demo-readout" data-readout>overview</span></div>`);
    const low = svg.querySelector("[data-low]"); const mid = svg.querySelector("[data-mid]"); const high = svg.querySelector("[data-high]"); const range = host.querySelector("[data-range]"); const readout = host.querySelector("[data-readout]");
    const update = () => { const v = Number(range.value); low.style.opacity = v < 40 ? "1" : ".12"; mid.style.opacity = v >= 30 ? "1" : "0"; high.style.opacity = v >= 70 ? "1" : "0"; readout.textContent = v < 30 ? "overview" : v < 70 ? "groups" : "meaning"; };
    range.addEventListener("input", update); update(); return () => {};
  }

  function demoUnavailable(host) {
    host.innerHTML = `<p style="margin:0;color:#6f6f6a;font-size:12px;line-height:1.5">A live demo has not been added yet.</p>`;
    return () => {};
  }

  function handleHash() {
    const hash = decodeURIComponent(location.hash.replace(/^#/, ""));
    if (!hash || !hash.includes(":")) return;
    if (getItem(hash)) openDrawer(hash, false);
  }

  function bindEvents() {
    els.search.addEventListener("input", () => {
      state.query = els.search.value;
      if (state.view === "index") renderIndex(); else renderExplore();
    });
    els.clearSearch.addEventListener("click", () => {
      state.query = ""; els.search.value = ""; renderExplore(); els.search.focus();
    });
    els.indexType.addEventListener("change", () => { state.indexType = els.indexType.value; renderIndex(); });
    els.viewButtons.forEach((button) => button.addEventListener("click", () => setView(button.dataset.view)));
    els.drawerClose.addEventListener("click", () => closeDrawer(true));
    els.drawerBackdrop.addEventListener("click", () => closeDrawer(true));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && state.openUid) closeDrawer(true);
      if (event.key === "/" && document.activeElement !== els.search && !state.openUid) { event.preventDefault(); els.search.focus(); }
    });
    window.addEventListener("popstate", () => {
      if (!location.hash) closeDrawer(false); else handleHash();
    });
  }

  async function init() {
    try {
      const data = await loadData();
      normalize(data);
      renderChapterNav();
      renderExplore();
      renderIndex();
      bindEvents();
      handleHash();
    } catch (error) {
      console.error(error);
      els.explore.hidden = true;
      els.index.hidden = true;
      els.loadError.hidden = false;
      els.loadErrorMessage.textContent = error instanceof Error ? error.message : String(error);
    }
  }

  init();
})();
