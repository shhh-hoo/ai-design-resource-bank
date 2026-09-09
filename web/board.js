(() => {
  const state = {
    resources: [],
    filtered: [],
    query: "",
    type: "all",
    tier: "all",
    domain: "all",
    view: "board",
    openId: null,
  };

  const els = {
    board: document.getElementById("boardView"),
    index: document.getElementById("indexView"),
    search: document.getElementById("searchInput"),
    typeFilters: document.getElementById("typeFilters"),
    tier: document.getElementById("tierSelect"),
    domainNav: document.getElementById("domainNav"),
    summary: document.getElementById("resultSummary"),
    clear: document.getElementById("clearFilters"),
    stats: document.getElementById("heroStats"),
    error: document.getElementById("loadError"),
    errorMessage: document.getElementById("loadErrorMessage"),
    drawer: document.getElementById("detailDrawer"),
    drawerBackdrop: document.getElementById("drawerBackdrop"),
    drawerClose: document.getElementById("drawerClose"),
    drawerContent: document.getElementById("drawerContent"),
    drawerKind: document.getElementById("drawerKind"),
    cardTemplate: document.getElementById("resourceCardTemplate"),
    viewButtons: Array.from(document.querySelectorAll("[data-view]")),
  };

  const domainLabels = {
    math: "Mathematics",
    education: "Learning",
    "data-visualization": "Data Viz",
    "scientific-visualization": "Scientific Viz",
    chemistry: "Chemistry",
    cheminformatics: "Chem Informatics",
    "structural-biology": "Molecular / Bio",
    physics: "Physics",
    simulation: "Simulation",
    "creative-coding": "Creative Coding",
    animation: "Motion",
    "ui-animation": "UI Motion",
    "creative-web": "Creative Web",
    "2d-gpu": "2D / GPU",
    "3d": "3D / WebGL",
    webgl: "3D / WebGL",
    graphs: "Graphs",
    graph: "Graphs",
    networks: "Networks",
    diagrams: "Diagrams",
    maps: "Maps",
    mapping: "Maps",
    geography: "Maps",
    spatial: "Spatial",
    "node-editor": "Node Editors",
    "infinite-canvas": "Infinite Canvas",
    typography: "Typography",
    shaders: "Shaders",
    experiments: "Experiments",
    "reference-gallery": "References",
    other: "Other",
  };

  const preferredDomainOrder = [
    "math", "data-visualization", "scientific-visualization", "chemistry", "physics",
    "simulation", "creative-coding", "animation", "creative-web", "2d-gpu", "3d",
    "graphs", "diagrams", "maps", "spatial", "education", "other"
  ];

  function domainLabel(value) {
    if (!value) return "Other";
    if (domainLabels[value]) return domainLabels[value];
    return value.split("-").map((part) => part ? part[0].toUpperCase() + part.slice(1) : part).join(" ");
  }

  function hueFor(value = "other") {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
    return Math.abs(hash) % 330;
  }

  async function loadYaml(path) {
    if (!window.jsyaml) throw new Error("The YAML parser did not load.");
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    return window.jsyaml.load(await response.text()) || {};
  }

  async function loadData() {
    if (window.__BOARD_DATA__) return window.__BOARD_DATA__;
    const [tools, references, catalog] = await Promise.all([
      loadYaml("./registries/frontend-tools.yaml"),
      loadYaml("./registries/reference-galleries.yaml"),
      loadYaml("./catalog.yaml"),
    ]);
    return { tools, references, catalog };
  }

  function normalizeData(data) {
    const tools = (data.tools?.tools || []).map((item) => ({
      uid: `tool:${item.id}`,
      sourceId: item.id,
      type: "tool",
      typeLabel: item.kind ? item.kind.replaceAll("-", " ") : "tool",
      name: item.name,
      primaryDomain: item.domains?.[0] || "other",
      domains: item.domains || [],
      summary: item.use_when || "",
      secondary: item.avoid_when || "",
      capabilities: item.capabilities || [],
      tags: item.tags || [],
      ecosystem: item.ecosystem || [],
      priority: item.tier || "secondary",
      license: item.license || "",
      rights: item.rights_note || "",
      notes: item.agent_notes || "",
      maintenance: item.maintenance_note || "",
      links: {
        homepage: item.homepage || "",
        docs: item.docs || "",
        examples: item.examples || "",
      },
    }));

    const references = (data.references?.galleries || []).map((item) => ({
      uid: `reference:${item.id}`,
      sourceId: item.id,
      type: "reference",
      typeLabel: "reference gallery",
      name: item.name,
      primaryDomain: item.categories?.[0] || "reference-gallery",
      domains: item.categories || [],
      summary: item.best_for || "",
      secondary: item.reference_mode || "",
      capabilities: item.categories || [],
      tags: item.tags || [],
      ecosystem: [],
      priority: item.priority || "secondary",
      license: "",
      rights: item.rights_note || "",
      notes: item.reference_mode || "",
      links: { homepage: item.url || "", docs: "", examples: "" },
    }));

    const packages = (data.catalog?.resources || []).map((item) => ({
      uid: `package:${item.id}`,
      sourceId: item.id,
      type: "package",
      typeLabel: "resource package",
      name: item.title || item.id,
      primaryDomain: item.domain || "other",
      domains: item.domain ? [item.domain] : [],
      summary: item.hint || "Reusable resource package.",
      secondary: "",
      capabilities: [],
      tags: item.tags || [],
      ecosystem: [],
      priority: item.status === "verified" ? "core" : item.status || "distilled",
      status: item.status || "",
      license: "",
      rights: "",
      notes: "",
      path: item.path || "",
      links: {
        homepage: item.path ? `https://github.com/shhh-hoo/ai-design-resource-bank/tree/main/${item.path}` : "",
        docs: "",
        examples: "",
      },
    }));

    return [...tools, ...references, ...packages];
  }

  function searchableText(resource) {
    return [
      resource.name, resource.sourceId, resource.type, resource.typeLabel, resource.summary,
      resource.secondary, resource.notes, resource.maintenance, resource.license,
      ...(resource.domains || []), ...(resource.capabilities || []), ...(resource.tags || []),
      ...(resource.ecosystem || []),
    ].filter(Boolean).join(" ").toLowerCase();
  }

  function applyFilters() {
    const query = state.query.trim().toLowerCase();
    state.filtered = state.resources.filter((resource) => {
      if (state.type !== "all" && resource.type !== state.type) return false;
      if (state.tier !== "all" && resource.priority !== state.tier) return false;
      if (state.domain !== "all" && !resource.domains.includes(state.domain) && resource.primaryDomain !== state.domain) return false;
      if (query && !searchableText(resource).includes(query)) return false;
      return true;
    });
    render();
  }

  function uniqueDomains(resources = state.resources) {
    const counts = new Map();
    resources.forEach((resource) => {
      const domains = resource.domains.length ? resource.domains : [resource.primaryDomain || "other"];
      domains.forEach((domain) => counts.set(domain, (counts.get(domain) || 0) + 1));
    });
    return Array.from(counts.entries()).sort(([a, countA], [b, countB]) => {
      const ai = preferredDomainOrder.indexOf(a);
      const bi = preferredDomainOrder.indexOf(b);
      if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      if (countA !== countB) return countB - countA;
      return domainLabel(a).localeCompare(domainLabel(b));
    });
  }

  function renderDomainNav() {
    const domains = uniqueDomains();
    els.domainNav.replaceChildren();

    const all = document.createElement("button");
    all.className = `domain-chip ${state.domain === "all" ? "is-active" : ""}`;
    all.type = "button";
    all.dataset.domain = "all";
    all.style.setProperty("--domain-hue", 24);
    all.innerHTML = `All domains <span class="domain-count">${state.resources.length}</span>`;
    els.domainNav.append(all);

    domains.forEach(([domain, count]) => {
      const button = document.createElement("button");
      button.className = `domain-chip ${state.domain === domain ? "is-active" : ""}`;
      button.type = "button";
      button.dataset.domain = domain;
      button.style.setProperty("--domain-hue", hueFor(domain));
      button.innerHTML = `${escapeHtml(domainLabel(domain))} <span class="domain-count">${count}</span>`;
      els.domainNav.append(button);
    });
  }

  function laneSortKey(domain) {
    const i = preferredDomainOrder.indexOf(domain);
    return i === -1 ? 999 : i;
  }

  function groupForBoard(resources) {
    const map = new Map();
    resources.forEach((resource) => {
      const domain = state.domain === "all" ? resource.primaryDomain || "other" : state.domain;
      if (!map.has(domain)) map.set(domain, []);
      map.get(domain).push(resource);
    });
    return Array.from(map.entries()).sort(([a, itemsA], [b, itemsB]) => {
      const order = laneSortKey(a) - laneSortKey(b);
      if (order !== 0) return order;
      if (itemsA.length !== itemsB.length) return itemsB.length - itemsA.length;
      return domainLabel(a).localeCompare(domainLabel(b));
    });
  }

  function createCard(resource) {
    const card = els.cardTemplate.content.firstElementChild.cloneNode(true);
    card.dataset.id = resource.uid;
    card.style.setProperty("--domain-hue", hueFor(resource.primaryDomain));
    card.querySelector(".card-kind").textContent = resource.type === "tool" ? resource.typeLabel : resource.type;
    const priority = card.querySelector(".card-priority");
    priority.textContent = resource.priority || "—";
    priority.dataset.priority = resource.priority || "";
    card.querySelector(".card-title").textContent = resource.name;
    card.querySelector(".card-summary").textContent = resource.summary || "No summary yet.";
    card.querySelector(".card-domain").textContent = domainLabel(resource.primaryDomain);

    const tagHost = card.querySelector(".card-tags");
    const tags = [...new Set([...(resource.capabilities || []), ...(resource.tags || [])])].slice(0, 3);
    tags.forEach((tag) => {
      const span = document.createElement("span");
      span.className = "card-tag";
      span.textContent = tag;
      tagHost.append(span);
    });
    const allTagsCount = new Set([...(resource.capabilities || []), ...(resource.tags || [])]).size;
    if (allTagsCount > tags.length) {
      const more = document.createElement("span");
      more.className = "card-tag more";
      more.textContent = `+${allTagsCount - tags.length}`;
      tagHost.append(more);
    }

    const open = () => openDrawer(resource.uid, true);
    card.addEventListener("click", open);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
    return card;
  }

  function renderBoard() {
    els.board.replaceChildren();
    if (!state.filtered.length) {
      els.board.innerHTML = `<div class="load-error"><span class="error-index">NO / MATCH</span><h2>No resource matches this filter.</h2><p>Try a broader capability term or clear one of the filters.</p></div>`;
      return;
    }
    const groups = groupForBoard(state.filtered);
    groups.forEach(([domain, resources], laneIndex) => {
      const lane = document.createElement("section");
      lane.className = "lane";
      lane.dataset.domainLane = domain;
      lane.style.setProperty("--domain-hue", hueFor(domain));
      const header = document.createElement("header");
      header.className = "lane-header";
      header.innerHTML = `
        <div class="lane-title-wrap">
          <span class="lane-index">${String(laneIndex + 1).padStart(2, "0")} / DOMAIN</span>
          <h2>${escapeHtml(domainLabel(domain))}</h2>
        </div>
        <span class="lane-count">${resources.length}</span>`;
      const cards = document.createElement("div");
      cards.className = "lane-cards";
      resources.sort((a, b) => priorityScore(a.priority) - priorityScore(b.priority) || a.name.localeCompare(b.name));
      resources.forEach((resource) => cards.append(createCard(resource)));
      lane.append(header, cards);
      els.board.append(lane);
    });
  }

  function renderIndex() {
    els.index.replaceChildren();
    const grouped = new Map();
    state.filtered.forEach((resource) => {
      const key = resource.type;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(resource);
    });

    ["tool", "reference", "package"].forEach((type) => {
      const resources = grouped.get(type);
      if (!resources?.length) return;
      const group = document.createElement("section");
      group.className = "index-group";
      const header = document.createElement("div");
      header.className = "index-group-header";
      header.innerHTML = `<span>#</span><span>${escapeHtml(type)} · ${resources.length}</span><span>Description</span><span class="domain-col">Domain</span><span></span>`;
      group.append(header);
      resources.sort((a, b) => a.name.localeCompare(b.name)).forEach((resource, index) => {
        const row = document.createElement("article");
        row.className = "index-row";
        row.tabIndex = 0;
        row.style.setProperty("--domain-hue", hueFor(resource.primaryDomain));
        row.innerHTML = `
          <span class="index-row-index">${String(index + 1).padStart(2, "0")}</span>
          <span class="index-row-name">${escapeHtml(resource.name)}</span>
          <span class="index-row-summary">${escapeHtml(resource.summary)}</span>
          <span class="index-row-domain">${escapeHtml(domainLabel(resource.primaryDomain))}</span>
          <span class="index-row-kind">${escapeHtml(resource.priority || "")}</span>`;
        const open = () => openDrawer(resource.uid, true);
        row.addEventListener("click", open);
        row.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); }
        });
        group.append(row);
      });
      els.index.append(group);
    });
  }

  function priorityScore(value) {
    return ({ core: 0, specialized: 1, implemented: 1, verified: 0, secondary: 2, distilled: 2, raw: 3 }[value] ?? 4);
  }

  function renderStats() {
    const counts = { tool: 0, reference: 0, package: 0 };
    state.resources.forEach((r) => { counts[r.type] = (counts[r.type] || 0) + 1; });
    els.stats.innerHTML = `
      <span><strong>${counts.tool}</strong> implementation tools</span>
      <span><strong>${counts.reference}</strong> reference galleries</span>
      <span><strong>${counts.package}</strong> banked packages</span>`;
  }

  function renderSummary() {
    const active = [];
    if (state.type !== "all") active.push(state.type);
    if (state.tier !== "all") active.push(state.tier);
    if (state.domain !== "all") active.push(domainLabel(state.domain));
    if (state.query.trim()) active.push(`“${state.query.trim()}”`);
    els.summary.textContent = `${state.filtered.length} of ${state.resources.length} resources${active.length ? ` · ${active.join(" · ")}` : ""}`;
    els.clear.hidden = active.length === 0;
  }

  function render() {
    renderSummary();
    renderDomainNav();
    renderBoard();
    renderIndex();
    els.board.hidden = state.view !== "board";
    els.index.hidden = state.view !== "index";
    els.viewButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.view === state.view));
  }

  function detailSection(title, content) {
    if (!content) return "";
    return `<section class="drawer-section"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(content)}</p></section>`;
  }

  function tokenSection(title, tokens) {
    if (!tokens?.length) return "";
    return `<section class="drawer-section"><h3>${escapeHtml(title)}</h3><div class="drawer-token-list">${tokens.map((token) => `<span class="drawer-token">${escapeHtml(token)}</span>`).join("")}</div></section>`;
  }

  function openDrawer(uid, updateHash = false) {
    const resource = state.resources.find((item) => item.uid === uid);
    if (!resource) return;
    state.openId = uid;
    els.drawerKind.textContent = `${resource.type} / ${resource.sourceId}`;
    els.drawerContent.style.setProperty("--domain-hue", hueFor(resource.primaryDomain));
    const links = [
      resource.links.homepage ? `<a class="drawer-action primary" href="${escapeAttr(resource.links.homepage)}" target="_blank" rel="noreferrer">Open source ↗</a>` : "",
      resource.links.docs ? `<a class="drawer-action" href="${escapeAttr(resource.links.docs)}" target="_blank" rel="noreferrer">Docs ↗</a>` : "",
      resource.links.examples ? `<a class="drawer-action" href="${escapeAttr(resource.links.examples)}" target="_blank" rel="noreferrer">Examples ↗</a>` : "",
      `<button class="drawer-action" type="button" id="copyAiBrief">Copy AI brief</button>`,
    ].filter(Boolean).join("");

    els.drawerContent.innerHTML = `
      <div class="drawer-eyebrow"><span class="dot"></span>${escapeHtml(domainLabel(resource.primaryDomain))} · ${escapeHtml(resource.priority || "unranked")}</div>
      <h2 id="drawerTitle">${escapeHtml(resource.name)}</h2>
      <p class="drawer-lead">${escapeHtml(resource.summary || "No summary yet.")}</p>
      <div class="drawer-actions">${links}</div>
      ${detailSection(resource.type === "reference" ? "How to use this reference" : "Use this when", resource.type === "reference" ? resource.notes : resource.summary)}
      ${detailSection(resource.type === "tool" ? "Avoid when" : "Reuse method", resource.secondary)}
      ${tokenSection("Capabilities", resource.capabilities)}
      ${tokenSection("Ecosystem", resource.ecosystem)}
      ${tokenSection("Tags", resource.tags)}
      ${detailSection("Agent notes", resource.type === "reference" ? "" : resource.notes)}
      ${detailSection("Maintenance note", resource.maintenance)}
      ${detailSection("Rights / licensing note", resource.rights)}
      <section class="drawer-section">
        <h3>Metadata</h3>
        <div class="drawer-meta">
          <div class="meta-block"><span class="meta-label">ID</span><span class="meta-value">${escapeHtml(resource.sourceId)}</span></div>
          <div class="meta-block"><span class="meta-label">Kind</span><span class="meta-value">${escapeHtml(resource.typeLabel || resource.type)}</span></div>
          ${resource.license ? `<div class="meta-block"><span class="meta-label">License</span><span class="meta-value">${escapeHtml(resource.license)}</span></div>` : ""}
          ${resource.status ? `<div class="meta-block"><span class="meta-label">Status</span><span class="meta-value">${escapeHtml(resource.status)}</span></div>` : ""}
        </div>
      </section>`;

    els.drawer.classList.add("is-open");
    els.drawer.setAttribute("aria-hidden", "false");
    els.drawerBackdrop.hidden = false;
    document.body.style.overflow = "hidden";
    document.getElementById("copyAiBrief")?.addEventListener("click", () => copyAiBrief(resource));
    if (updateHash) history.pushState(null, "", `#${encodeURIComponent(resource.uid)}`);
  }

  function closeDrawer(updateHash = false) {
    state.openId = null;
    els.drawer.classList.remove("is-open");
    els.drawer.setAttribute("aria-hidden", "true");
    els.drawerBackdrop.hidden = true;
    document.body.style.overflow = "";
    if (updateHash && location.hash) history.pushState(null, "", location.pathname + location.search);
  }

  async function copyAiBrief(resource) {
    const brief = [
      `Resource: ${resource.name} (${resource.sourceId})`,
      `Type: ${resource.typeLabel || resource.type}`,
      `Use when: ${resource.summary}`,
      resource.secondary ? `Avoid / reference method: ${resource.secondary}` : "",
      resource.capabilities?.length ? `Capabilities: ${resource.capabilities.join(", ")}` : "",
      resource.ecosystem?.length ? `Ecosystem: ${resource.ecosystem.join(", ")}` : "",
      resource.notes ? `Agent notes: ${resource.notes}` : "",
      resource.links.homepage ? `Source: ${resource.links.homepage}` : "",
      "Use the reusable mechanism; do not copy unrelated visual styling or third-party assets.",
    ].filter(Boolean).join("\n");

    const button = document.getElementById("copyAiBrief");
    try {
      await navigator.clipboard.writeText(brief);
      if (button) {
        button.textContent = "Copied";
        button.classList.add("copy-state");
        setTimeout(() => {
          button.textContent = "Copy AI brief";
          button.classList.remove("copy-state");
        }, 1400);
      }
    } catch {
      window.prompt("Copy this AI brief:", brief);
    }
  }

  function clearFilters() {
    state.query = "";
    state.type = "all";
    state.tier = "all";
    state.domain = "all";
    els.search.value = "";
    els.tier.value = "all";
    Array.from(els.typeFilters.querySelectorAll("[data-type]")).forEach((button) => button.classList.toggle("is-active", button.dataset.type === "all"));
    applyFilters();
  }

  function bindEvents() {
    els.search.addEventListener("input", (event) => { state.query = event.target.value; applyFilters(); });
    els.typeFilters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-type]");
      if (!button) return;
      state.type = button.dataset.type;
      Array.from(els.typeFilters.querySelectorAll("[data-type]")).forEach((item) => item.classList.toggle("is-active", item === button));
      applyFilters();
    });
    els.tier.addEventListener("change", (event) => { state.tier = event.target.value; applyFilters(); });
    els.domainNav.addEventListener("click", (event) => {
      const button = event.target.closest("[data-domain]");
      if (!button) return;
      const domain = button.dataset.domain;
      if (state.view === "board" && state.domain === "all" && domain !== "all") {
        const lane = els.board.querySelector(`[data-domain-lane="${CSS.escape(domain)}"]`);
        if (lane) {
          lane.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
          return;
        }
      }
      state.domain = domain;
      applyFilters();
    });
    els.clear.addEventListener("click", clearFilters);
    els.viewButtons.forEach((button) => button.addEventListener("click", () => { state.view = button.dataset.view; render(); }));
    els.drawerClose.addEventListener("click", () => closeDrawer(true));
    els.drawerBackdrop.addEventListener("click", () => closeDrawer(true));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && state.openId) closeDrawer(true);
      if (event.key === "/" && !/input|textarea|select/i.test(document.activeElement?.tagName || "")) {
        event.preventDefault();
        els.search.focus();
      }
    });
    window.addEventListener("popstate", syncHash);
    window.addEventListener("hashchange", syncHash);
  }

  function syncHash() {
    const uid = decodeURIComponent(location.hash.replace(/^#/, ""));
    if (!uid) {
      if (state.openId) closeDrawer(false);
      return;
    }
    if (state.resources.some((resource) => resource.uid === uid)) openDrawer(uid, false);
  }

  function escapeHtml(value = "") {
    return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }

  function escapeAttr(value = "") {
    return escapeHtml(value);
  }

  async function init() {
    bindEvents();
    try {
      const data = await loadData();
      state.resources = normalizeData(data);
      state.filtered = state.resources.slice();
      renderStats();
      render();
      syncHash();
    } catch (error) {
      console.error(error);
      els.board.hidden = true;
      els.index.hidden = true;
      els.error.hidden = false;
      els.summary.textContent = "Registry data unavailable";
      els.errorMessage.textContent = error instanceof Error ? error.message : String(error);
      els.stats.innerHTML = `<span><strong>—</strong> data unavailable</span>`;
    }
  }

  init();
})();
