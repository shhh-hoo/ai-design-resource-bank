(() => {
  const STORAGE_KEY = "ai-design-resource-bank:dictionary-selection:v0.1";

  const state = {
    terms: [],
    query: "",
    domain: "all",
    kind: "all",
    selection: new Set(),
    openId: null,
  };

  const els = {
    search: document.getElementById("dictSearch"),
    domainFilters: document.getElementById("domainFilters"),
    kindFilters: document.getElementById("kindFilters"),
    grid: document.getElementById("dictGrid"),
    summary: document.getElementById("dictSummary"),
    clear: document.getElementById("dictClear"),
    empty: document.getElementById("dictEmpty"),
    drawer: document.getElementById("dictDrawer"),
    drawerContent: document.getElementById("dictDrawerContent"),
    backdrop: document.getElementById("dictBackdrop"),
    drawerClose: document.getElementById("dictDrawerClose"),
    selectionTray: document.getElementById("selectionTray"),
    selectionToggle: document.getElementById("selectionToggle"),
    selectionBody: document.getElementById("selectionBody"),
    selectionCount: document.getElementById("selectionCount"),
    selectionList: document.getElementById("selectionList"),
    selectionEmpty: document.getElementById("selectionEmpty"),
    copySelection: document.getElementById("copySelection"),
    clearSelection: document.getElementById("clearSelection"),
    loadError: document.getElementById("dictLoadError"),
    loadErrorMessage: document.getElementById("dictLoadErrorMessage"),
  };

  const domainOrder = [
    "art", "graphic-design", "typography", "print", "photography", "cinema",
    "animation", "motion-design", "game", "hci", "ui", "interaction",
    "material", "texture", "lighting", "stage", "spatial", "architecture",
  ];

  const kindOrder = [
    "style", "movement", "composition", "technique", "typography", "printing",
    "material", "texture", "lighting", "camera", "focus", "editing", "transition",
    "blocking", "motion", "animation-principle", "rendering", "game-feel",
    "feedback", "interaction", "hci-principle", "ui-pattern", "navigation",
    "narrative-device",
  ];

  async function loadYaml(path) {
    if (!window.jsyaml) throw new Error("The YAML parser did not load.");
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    return window.jsyaml.load(await response.text()) || {};
  }

  function restoreSelection() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      state.selection = new Set(Array.isArray(saved) ? saved : []);
    } catch {
      state.selection = new Set();
    }
  }

  function persistSelection() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.selection]));
  }

  function termText(term) {
    return [
      term.id,
      term.term?.en,
      term.term?.zh,
      term.definition?.zh,
      ...(term.aliases || []),
      ...(term.domains || []),
      ...(term.kinds || []),
      ...(term.recognition || []),
      ...(term.looks_like || []),
      ...(term.not_to_confuse_with || []),
      ...(term.related || []),
      ...(term.examples || []).flatMap((example) => [example.title, example.annotation]),
    ].filter(Boolean).join(" ").toLocaleLowerCase();
  }

  function uniqueValues(field) {
    return [...new Set(state.terms.flatMap((term) => term[field] || []))];
  }

  function sortFacet(values, order) {
    return values.sort((a, b) => {
      const ai = order.indexOf(a);
      const bi = order.indexOf(b);
      if (ai >= 0 && bi >= 0) return ai - bi;
      if (ai >= 0) return -1;
      if (bi >= 0) return 1;
      return a.localeCompare(b);
    });
  }

  function humanize(value) {
    return value.split("-").map((part) => part ? part[0].toUpperCase() + part.slice(1) : part).join(" ");
  }

  function renderFacet(host, field, values, active) {
    host.replaceChildren();
    const all = makeFilterButton("All", "all", active === "all", () => {
      state[field] = "all";
      render();
    });
    host.append(all);

    values.forEach((value) => {
      host.append(makeFilterButton(humanize(value), value, active === value, () => {
        state[field] = value;
        render();
      }));
    });
  }

  function makeFilterButton(label, value, active, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `dict-filter${active ? " is-active" : ""}`;
    button.dataset.value = value;
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
  }

  function filteredTerms() {
    const query = state.query.trim().toLocaleLowerCase();
    return state.terms.filter((term) => {
      if (state.domain !== "all" && !(term.domains || []).includes(state.domain)) return false;
      if (state.kind !== "all" && !(term.kinds || []).includes(state.kind)) return false;
      return !query || termText(term).includes(query);
    });
  }

  function render() {
    renderFacet(els.domainFilters, "domain", sortFacet(uniqueValues("domains"), domainOrder), state.domain);
    renderFacet(els.kindFilters, "kind", sortFacet(uniqueValues("kinds"), kindOrder), state.kind);

    const matches = filteredTerms();
    els.grid.replaceChildren();
    matches.forEach((term) => els.grid.append(createCard(term)));

    const filtered = Boolean(state.query.trim()) || state.domain !== "all" || state.kind !== "all";
    els.clear.hidden = !filtered;
    els.empty.hidden = matches.length !== 0;

    if (!filtered) {
      els.summary.textContent = `${state.terms.length} seed terms across art, cinema, games, HCI, material, type, motion, and adjacent fields.`;
    } else if (matches.length) {
      els.summary.textContent = `${matches.length} matching term${matches.length === 1 ? "" : "s"}.`;
    } else {
      els.summary.textContent = "No matching term.";
    }

    renderSelection();
  }

  function createCard(term) {
    const card = document.createElement("article");
    card.className = "dict-card";
    card.tabIndex = 0;
    card.dataset.term = term.id;
    card.setAttribute("aria-label", `${term.term.en}, ${term.term.zh}`);

    const add = document.createElement("button");
    add.type = "button";
    add.className = `dict-add${state.selection.has(term.id) ? " is-selected" : ""}`;
    add.textContent = state.selection.has(term.id) ? "✓" : "+";
    add.setAttribute("aria-label", state.selection.has(term.id) ? `Remove ${term.term.en} from selection` : `Add ${term.term.en} to selection`);
    add.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleSelection(term.id);
    });

    const preview = document.createElement("div");
    preview.className = "dict-preview";
    preview.innerHTML = previewSvg(term.preview?.type);

    const meta = document.createElement("div");
    meta.className = "dict-card-meta";
    const kind = document.createElement("span");
    kind.className = "dict-card-kind";
    kind.textContent = humanize(term.kinds?.[0] || "term");
    const domain = document.createElement("span");
    domain.className = "dict-card-domain";
    domain.textContent = (term.domains || []).slice(0, 2).map(humanize).join(" · ");
    meta.append(kind, domain);

    const title = document.createElement("h2");
    title.className = "dict-card-title";
    title.textContent = term.term.en;

    const zh = document.createElement("p");
    zh.className = "dict-card-zh";
    zh.textContent = term.term.zh;

    const definition = document.createElement("p");
    definition.className = "dict-card-definition";
    definition.textContent = term.definition.zh;

    card.append(add, preview, meta, title, zh, definition);

    const open = () => openTerm(term.id);
    card.addEventListener("click", open);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
    return card;
  }

  function toggleSelection(id) {
    if (state.selection.has(id)) state.selection.delete(id);
    else state.selection.add(id);
    persistSelection();
    render();
    if (state.openId === id) openTerm(id, false);
  }

  function selectedTerms() {
    const map = new Map(state.terms.map((term) => [term.id, term]));
    return [...state.selection].map((id) => map.get(id)).filter(Boolean);
  }

  function renderSelection() {
    const terms = selectedTerms();
    els.selectionCount.textContent = String(terms.length);
    els.selectionList.replaceChildren();
    els.selectionEmpty.hidden = terms.length !== 0;
    els.copySelection.disabled = terms.length === 0;
    els.clearSelection.disabled = terms.length === 0;

    terms.forEach((term) => {
      const row = document.createElement("div");
      row.className = "selection-item";

      const copy = document.createElement("div");
      const strong = document.createElement("strong");
      strong.textContent = term.term.en;
      const small = document.createElement("small");
      small.textContent = `${term.term.zh} · ${humanize(term.kinds?.[0] || "term")}`;
      copy.append(strong, small);

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "selection-remove";
      remove.textContent = "×";
      remove.setAttribute("aria-label", `Remove ${term.term.en}`);
      remove.addEventListener("click", () => toggleSelection(term.id));

      row.append(copy, remove);
      els.selectionList.append(row);
    });
  }

  function getTerm(id) {
    return state.terms.find((term) => term.id === id);
  }

  function openTerm(id, focusDrawer = true) {
    const term = getTerm(id);
    if (!term) return;
    state.openId = id;
    els.drawerContent.replaceChildren();
    els.drawerContent.append(renderDetail(term));
    els.drawer.classList.add("is-open");
    els.drawer.setAttribute("aria-hidden", "false");
    els.backdrop.hidden = false;
    document.body.style.overflow = "hidden";
    if (focusDrawer) els.drawerClose.focus({ preventScroll: true });
  }

  function closeTerm() {
    state.openId = null;
    els.drawer.classList.remove("is-open");
    els.drawer.setAttribute("aria-hidden", "true");
    els.backdrop.hidden = true;
    document.body.style.overflow = "";
  }

  function renderDetail(term) {
    const wrapper = document.createElement("div");

    const preview = document.createElement("div");
    preview.className = "dict-detail-preview";
    preview.innerHTML = previewSvg(term.preview?.type);

    const titleRow = document.createElement("div");
    titleRow.className = "dict-detail-title-row";
    const titleBox = document.createElement("div");
    const title = document.createElement("h2");
    title.id = "dictDrawerTitle";
    title.textContent = term.term.en;
    const zh = document.createElement("p");
    zh.className = "dict-detail-zh";
    zh.textContent = term.term.zh;
    titleBox.append(title, zh);

    const add = document.createElement("button");
    add.type = "button";
    add.className = `dict-detail-add${state.selection.has(term.id) ? " is-selected" : ""}`;
    add.textContent = state.selection.has(term.id) ? "Selected ✓" : "Add to selection";
    add.addEventListener("click", () => toggleSelection(term.id));
    titleRow.append(titleBox, add);

    const definition = document.createElement("p");
    definition.className = "dict-detail-definition";
    definition.textContent = term.definition.zh;

    wrapper.append(preview, titleRow, definition);
    wrapper.append(makeListSection("Look for", term.recognition));

    const looks = document.createElement("section");
    looks.className = "dict-detail-section";
    const looksTitle = document.createElement("h3");
    looksTitle.textContent = "If you don't know the name";
    const looksBody = document.createElement("div");
    looksBody.className = "dict-looks-like";
    (term.looks_like || []).forEach((line) => {
      const p = document.createElement("p");
      p.textContent = `“${line}”`;
      looksBody.append(p);
    });
    looks.append(looksTitle, looksBody);
    wrapper.append(looks);

    const examples = document.createElement("section");
    examples.className = "dict-detail-section";
    const examplesTitle = document.createElement("h3");
    examplesTitle.textContent = "Example references";
    examples.append(examplesTitle);
    (term.examples || []).forEach((example) => {
      const item = document.createElement("div");
      item.className = "dict-reference";
      const strong = document.createElement("strong");
      strong.textContent = example.title;
      const note = document.createElement("p");
      note.textContent = example.annotation;
      item.append(strong, note);
      examples.append(item);
    });
    wrapper.append(examples);

    if ((term.not_to_confuse_with || []).length) {
      const confuse = document.createElement("section");
      confuse.className = "dict-detail-section";
      const heading = document.createElement("h3");
      heading.textContent = "Not to confuse with";
      const list = document.createElement("div");
      list.className = "dict-confusions";
      term.not_to_confuse_with.forEach((name) => {
        const span = document.createElement("span");
        span.textContent = humanize(name);
        list.append(span);
      });
      confuse.append(heading, list);
      wrapper.append(confuse);
    }

    if ((term.related || []).length) {
      const related = document.createElement("section");
      related.className = "dict-detail-section";
      const heading = document.createElement("h3");
      heading.textContent = "Related in this dictionary";
      const list = document.createElement("div");
      list.className = "dict-related";
      term.related.map(getTerm).filter(Boolean).forEach((relatedTerm) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = `${relatedTerm.term.en} · ${relatedTerm.term.zh}`;
        button.addEventListener("click", () => openTerm(relatedTerm.id, false));
        list.append(button);
      });
      related.append(heading, list);
      wrapper.append(related);
    }

    const facts = document.createElement("section");
    facts.className = "dict-detail-section";
    const factsTitle = document.createElement("h3");
    factsTitle.textContent = "Classification";
    const dl = document.createElement("dl");
    dl.className = "dict-detail-facts";
    appendFact(dl, "Domains", (term.domains || []).map(humanize).join(", "));
    appendFact(dl, "Kinds", (term.kinds || []).map(humanize).join(", "));
    appendFact(dl, "Naming", humanize(term.naming || ""));
    appendFact(dl, "Entry", humanize(term.entry_status || ""));
    if ((term.aliases || []).length) appendFact(dl, "Aliases", term.aliases.join(", "));
    facts.append(factsTitle, dl);
    wrapper.append(facts);

    return wrapper;
  }

  function makeListSection(title, items) {
    const section = document.createElement("section");
    section.className = "dict-detail-section";
    const heading = document.createElement("h3");
    heading.textContent = title;
    const list = document.createElement("ul");
    (items || []).forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.append(li);
    });
    section.append(heading, list);
    return section;
  }

  function appendFact(dl, label, value) {
    if (!value) return;
    const dt = document.createElement("dt");
    dt.textContent = label;
    const dd = document.createElement("dd");
    dd.textContent = value;
    dl.append(dt, dd);
  }

  async function copySelection() {
    const terms = selectedTerms();
    if (!terms.length) return;
    const text = [
      "Creative vocabulary selection:",
      ...terms.map((term) => `- ${term.term.en} (${term.term.zh}) — ${term.definition.zh}`),
      "",
      "Use these as vocabulary/references to reason about a direction. Do not assume they automatically form one coherent style; inspect compatibility and choose intentionally.",
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      const before = els.copySelection.textContent;
      els.copySelection.textContent = "Copied";
      setTimeout(() => { els.copySelection.textContent = before; }, 1200);
    } catch {
      els.copySelection.textContent = "Copy unavailable";
    }
  }

  function previewSvg(type = "default") {
    if (!window.DesignDictionaryPreviews?.render) {
      return `<svg viewBox="0 0 320 200" role="img" aria-label="Mnemonic unavailable"><rect width="320" height="200" fill="#efefe9"/><circle cx="160" cy="100" r="58" fill="none" stroke="#111"/></svg>`;
    }
    return window.DesignDictionaryPreviews.render(type);
  }

  function bindEvents() {
    els.search.addEventListener("input", () => {
      state.query = els.search.value;
      render();
    });

    els.clear.addEventListener("click", () => {
      state.query = "";
      state.domain = "all";
      state.kind = "all";
      els.search.value = "";
      render();
      els.search.focus();
    });

    els.drawerClose.addEventListener("click", closeTerm);
    els.backdrop.addEventListener("click", closeTerm);

    els.selectionToggle.addEventListener("click", () => {
      const opening = els.selectionBody.hidden;
      els.selectionBody.hidden = !opening;
      els.selectionToggle.setAttribute("aria-expanded", String(opening));
    });

    els.copySelection.addEventListener("click", copySelection);
    els.clearSelection.addEventListener("click", () => {
      state.selection.clear();
      persistSelection();
      render();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && state.openId) {
        closeTerm();
        return;
      }
      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const target = event.target;
        if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable) return;
        event.preventDefault();
        els.search.focus();
      }
    });
  }

  async function init() {
    try {
      restoreSelection();
      const registry = await loadYaml("./dictionary/index.yaml");
      const sources = Array.isArray(registry.sources) ? registry.sources : [];
      const batches = await Promise.all(sources.map(loadYaml));
      state.terms = batches.flatMap((batch) => Array.isArray(batch.terms) ? batch.terms : []);
      const known = new Set(state.terms.map((term) => term.id));
      state.selection = new Set([...state.selection].filter((id) => known.has(id)));
      persistSelection();
      bindEvents();
      render();
    } catch (error) {
      els.loadError.hidden = false;
      els.loadErrorMessage.textContent = error instanceof Error ? error.message : String(error);
      els.summary.textContent = "Dictionary failed to load.";
    }
  }

  init();
})();
