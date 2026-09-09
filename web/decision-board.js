const PROGRAM_LABELS = {
  "cambridge-international-as-a-level": "A Level",
  ap: "AP",
};

const PRIORITY_COPY = {
  high: "Visualization often carries the core explanation here.",
  medium: "Visualization is useful, but should support symbolic or verbal reasoning.",
  selective: "Visualize only the relationships that genuinely become clearer spatially or comparatively.",
};

const GRAMMAR_SIGNALS = {
  "functional-graph": ["graph", "curve", "function", "rate", "slope", "derivative", "integral", "equilibrium", "cost", "revenue", "trend", "plot", "model"],
  "dynamic-geometry": ["geometry", "angle", "loci", "locus", "construction", "transformation", "coordinate", "vector", "shape", "projection"],
  "statistical-distribution": ["distribution", "sample", "probability", "uncertainty", "confidence", "regression", "residual", "frequency", "variation", "data"],
  "vector-field": ["vector", "force", "field", "flux", "direction", "magnitude", "wind", "electric", "magnetic", "gradient"],
  "dynamic-system": ["motion", "dynamic", "simulation", "collision", "oscillation", "feedback", "population", "evolving", "trajectory", "cycle"],
  "state-process": ["process", "step", "sequence", "transition", "mechanism", "pathway", "cycle", "workflow", "reaction", "state"],
  "3d-spatial": ["3d", "spatial", "shape", "orientation", "stereochemical", "molecule", "terrain", "object", "camera", "rotation"],
  "structure-anatomy": ["anatomy", "structure", "part", "organelle", "molecule", "device", "layer", "component", "system", "assembly"],
  "micro-macro-bridge": ["particle", "microscopic", "macroscopic", "molecular", "bulk", "pressure", "concentration", "observable", "scale"],
  "field-flow": ["flow", "circulation", "transport", "gradient", "current", "pathway", "source", "receptor", "transfer", "movement"],
  "spatial-map": ["map", "geographic", "spatial", "location", "terrain", "choropleth", "migration", "region", "country", "land use"],
  "network-relation": ["network", "dependency", "food", "relationship", "influence", "association", "hierarchy", "exchange", "topology", "graph"],
  "time-sequence": ["time", "timeline", "stage", "history", "change", "trajectory", "sequence", "evolution", "chronology"],
  "evidence-comparison": ["evidence", "source", "claim", "comparison", "provenance", "conflict", "case", "argument", "study"],
  "image-comparison": ["image", "artwork", "visual", "compare", "crop", "overlay", "annotation", "style", "composition"],
  "composition-layer": ["composition", "layer", "material", "design", "hierarchy", "production", "assembly", "component", "media"],
  "symbolic-notation": ["notation", "syntax", "logic", "score", "formula", "symbol", "grammar", "technical", "diagram"],
  "audio-time": ["sound", "pitch", "rhythm", "spectrum", "waveform", "harmony", "voice", "meter", "audio", "music"],
  "optimization-tradeoff": ["trade-off", "tradeoff", "feasible", "constraint", "marginal", "objective", "surplus", "cost", "benefit", "optimization"],
  "code-execution": ["code", "algorithm", "memory", "stack", "heap", "execution", "packet", "protocol", "processor", "program"],
};

let atlasPromise = null;
let activeHost = null;
let data = null;
let state = {
  mode: null,
  program: "ap",
  subjectQuery: "",
  showAllSubjects: false,
  subjectId: null,
  topicIndex: 0,
  grammarQuery: "",
  grammarId: null,
};

const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
}[char]));

function titleCase(value = "") {
  return String(value).split("-").map((part) => part ? part[0].toUpperCase() + part.slice(1) : part).join(" ");
}

function matchesQuery(value, query) {
  const tokens = String(query || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return true;
  const haystack = String(value || "").toLowerCase().replace(/[-_/]+/g, " ");
  return tokens.every((token) => haystack.includes(token));
}

function rawBank() {
  return window.__BOARD_DATA__ || {};
}

function toolById(id) {
  return (rawBank().tools?.tools || []).find((item) => item.id === id);
}

function mechanismById(id) {
  return (rawBank().mechanisms?.mechanisms || []).find((item) => item.id === id);
}

function subjectById(id) {
  return (data?.subjects?.subjects || []).find((item) => item.id === id);
}

function familyById(id) {
  return data?.atlas?.families?.[id] || null;
}

function grammarById(id) {
  return data?.atlas?.grammars?.[id] || null;
}

function familyIdsForGrammar(grammarId) {
  return Object.entries(data?.atlas?.families || {})
    .filter(([, family]) => (family.grammars || []).includes(grammarId))
    .map(([id]) => id);
}

function rankMechanismsForGrammar(grammarId, limit = 5) {
  const signals = GRAMMAR_SIGNALS[grammarId] || [];
  return (rawBank().mechanisms?.mechanisms || [])
    .map((item, index) => {
      const text = [item.id, item.name, item.summary, item.use_when, ...(item.primitives || [])]
        .filter(Boolean).join(" ").toLowerCase().replace(/[-_/]+/g, " ");
      const score = signals.reduce((total, signal) => total + (text.includes(signal) ? 1 : 0), 0);
      return { item, score, index };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(({ item }) => item);
}

async function loadDecisionStyles() {
  const id = "decision-board-styles";
  if (document.getElementById(id)) return;
  const href = new URL("./decision-board.css", import.meta.url).href;
  await new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = href;
    link.onload = resolve;
    link.onerror = () => reject(new Error("Decision styles failed to load."));
    document.head.append(link);
  });
}

async function loadAtlas() {
  if (!atlasPromise) {
    const url = new URL("../data/subject-atlas.json", import.meta.url);
    atlasPromise = fetch(url, { cache: "default" }).then(async (response) => {
      if (!response.ok) throw new Error(`Subject atlas: HTTP ${response.status}`);
      return response.json();
    });
  }
  return atlasPromise;
}

function pushDecisionHash(kind, id) {
  history.pushState({ decision: `${kind}:${id}` }, "", `#${kind}:${encodeURIComponent(id)}`);
}

function openBankItem(uid) {
  history.pushState({ uid }, "", `#${uid}`);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function renderLoading(host) {
  host.innerHTML = `<div class="decision-loading"><span>Loading subject atlas…</span></div>`;
}

function renderLanding(host) {
  state.mode = null;
  host.innerHTML = `
    <div class="decision-start">
      <div class="decision-start-copy">
        <p class="decision-kicker">Master decision board</p>
        <h2>Start from what you know.</h2>
        <p>Choose the curriculum if you know the subject. Choose the relationship if you already know what must become visible.</p>
      </div>
      <div class="decision-paths" role="list">
        <button class="decision-path" type="button" data-decision-path="subject">
          <span class="decision-path-no">01</span>
          <span><strong>I know the subject</strong><small>A-Level or AP → topic → representation → engine</small></span>
          <span aria-hidden="true">→</span>
        </button>
        <button class="decision-path" type="button" data-decision-path="grammar">
          <span class="decision-path-no">02</span>
          <span><strong>I know what I need to show</strong><small>Relationship → visualization grammar → engine → reusable mechanism</small></span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
      <p class="decision-route-line">curriculum / visual problem → relationship → visualization grammar → engine → bank</p>
    </div>`;
}

function renderTopbar(label) {
  return `
    <div class="decision-topbar">
      <button class="decision-back" type="button" data-decision-home>← Start over</button>
      <span>${escapeHtml(label)}</span>
    </div>`;
}

function subjectsForProgram() {
  const query = state.subjectQuery.trim().toLowerCase();
  return (data?.subjects?.subjects || [])
    .filter((subject) => subject.program === state.program)
    .filter((subject) => matchesQuery([subject.name, subject.code, subject.family].filter(Boolean).join(" "), query))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function renderSubjectList(host) {
  const subjects = subjectsForProgram();
  const visible = state.showAllSubjects || state.subjectQuery ? subjects : subjects.slice(0, 14);
  const selected = subjectById(state.subjectId);
  host.innerHTML = `
    ${renderTopbar("Start from a subject")}
    <div class="decision-workspace">
      <aside class="decision-picker">
        <div class="decision-programs" aria-label="Curriculum">
          <button type="button" data-program="cambridge-international-as-a-level" class="${state.program === "cambridge-international-as-a-level" ? "is-active" : ""}">A Level</button>
          <button type="button" data-program="ap" class="${state.program === "ap" ? "is-active" : ""}">AP</button>
        </div>
        <label class="decision-search">
          <span>Find subject</span>
          <input type="search" data-subject-search value="${escapeHtml(state.subjectQuery)}" placeholder="Chemistry, History, Calculus…" autocomplete="off" />
        </label>
        <div class="decision-list" data-subject-list>
          ${visible.map((subject) => `
            <button type="button" class="decision-list-row ${subject.id === state.subjectId ? "is-selected" : ""}" data-subject-id="${escapeHtml(subject.id)}">
              <span>${escapeHtml(subject.name)}</span>
              <small>${subject.code ? escapeHtml(subject.code) : escapeHtml(PROGRAM_LABELS[subject.program] || subject.program)}</small>
            </button>`).join("")}
        </div>
        ${!state.subjectQuery && !state.showAllSubjects && subjects.length > visible.length ? `<button type="button" class="decision-show-all" data-show-all>Show all ${subjects.length}</button>` : ""}
      </aside>
      <section class="decision-detail" data-subject-detail>
        ${selected ? subjectDetailHtml(selected) : emptySubjectDetailHtml()}
      </section>
    </div>`;
}

function emptySubjectDetailHtml() {
  return `
    <div class="decision-empty">
      <p class="decision-kicker">Choose a subject</p>
      <h2>We’ll route the topic before naming a tool.</h2>
      <p>The subject only gets us into the right semantic family. The actual decision starts with the relationship a learner needs to see.</p>
    </div>`;
}

function rankGrammars(family, topic) {
  const text = `${topic?.topic || ""} ${topic?.visualize_as || ""}`.toLowerCase();
  const ordered = family?.grammars || [];
  return ordered
    .map((id, index) => {
      const signals = GRAMMAR_SIGNALS[id] || [];
      const signalScore = signals.reduce((sum, signal) => sum + (text.includes(signal) ? 1 : 0), 0);
      return { id, score: signalScore, index };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 3)
    .map((item) => item.id);
}

function subjectDetailHtml(subject) {
  const family = familyById(subject.family);
  if (!family) return emptySubjectDetailHtml();
  const topics = family.topic_seeds || [];
  const topic = topics[Math.min(state.topicIndex, Math.max(0, topics.length - 1))] || null;
  const routes = rankGrammars(family, topic);
  const mechanisms = (family.mechanisms || []).map(mechanismById).filter(Boolean).slice(0, 4);
  const routeTools = (family.tools || []).map(toolById).filter(Boolean).slice(0, 4);
  const gaps = routes.map((id) => grammarById(id)?.gap_note).filter(Boolean);
  return `
    <div class="decision-subject-head">
      <p class="decision-kicker">${escapeHtml(PROGRAM_LABELS[subject.program] || subject.program)}${subject.code ? ` / ${escapeHtml(subject.code)}` : ""}</p>
      <h2>${escapeHtml(subject.name)}</h2>
      <p class="decision-family-line"><span>${escapeHtml(family.label || titleCase(subject.family))}</span> ${escapeHtml(PRIORITY_COPY[family.visual_priority] || "")}</p>
    </div>

    <section class="decision-section">
      <div class="decision-section-head"><span>01</span><h3>Choose the topic relationship</h3></div>
      <div class="decision-topic-list">
        ${topics.map((item, index) => `
          <button type="button" class="decision-topic ${index === state.topicIndex ? "is-selected" : ""}" data-topic-index="${index}">
            <strong>${escapeHtml(item.topic)}</strong>
            <span>${escapeHtml(item.visualize_as)}</span>
          </button>`).join("")}
      </div>
    </section>

    ${topic ? `<section class="decision-section">
      <div class="decision-section-head"><span>02</span><h3>Recommended representation routes</h3></div>
      <p class="decision-relationship">${escapeHtml(topic.visualize_as)}</p>
      <div class="decision-route-list">
        ${routes.map((id, index) => grammarRowHtml(id, index === 0)).join("")}
      </div>
    </section>` : ""}

    <section class="decision-section decision-bank-section">
      <div class="decision-section-head"><span>03</span><h3>Reuse what the bank already knows</h3></div>
      ${mechanisms.length ? `<div class="decision-bank-group"><h4>Mechanisms</h4>${mechanisms.map((item) => bankRowHtml("mechanism", item)).join("")}</div>` : ""}
      ${routeTools.length ? `<div class="decision-bank-group"><h4>Engines</h4>${routeTools.map((item) => bankRowHtml("tool", item)).join("")}</div>` : ""}
      ${gaps.length ? `<div class="decision-gap"><strong>Capability gap</strong><span>${escapeHtml(gaps.join(" "))}</span></div>` : ""}
    </section>

    <button type="button" class="copy-brief decision-copy" data-copy-subject>Copy build brief</button>`;
}

function grammarRowHtml(id, primary = false) {
  const grammar = grammarById(id);
  if (!grammar) return "";
  const tools = (grammar.default_tools || []).map(toolById).filter(Boolean).slice(0, 3);
  return `
    <button type="button" class="decision-route-row ${primary ? "is-primary" : ""}" data-grammar-id="${escapeHtml(id)}">
      <span class="decision-route-mark">${primary ? "●" : "○"}</span>
      <span><strong>${escapeHtml(titleCase(id))}</strong><small>${escapeHtml(grammar.description || "")}</small></span>
      <span class="decision-route-tools">${escapeHtml(tools.map((tool) => tool.name).join(" / "))}</span>
    </button>`;
}

function bankRowHtml(type, item) {
  return `
    <button type="button" class="decision-bank-row" data-bank-uid="${escapeHtml(`${type}:${item.id}`)}">
      <span>${escapeHtml(item.name || item.id)}</span>
      <small>${escapeHtml(type === "tool" ? (item.use_when || "") : (item.summary || ""))}</small>
      <span aria-hidden="true">↗</span>
    </button>`;
}

function renderGrammarList(host) {
  const query = state.grammarQuery.trim().toLowerCase();
  const grammars = Object.entries(data?.atlas?.grammars || {})
    .map(([id, grammar]) => ({ id, ...grammar }))
    .filter((item) => matchesQuery(`${item.id} ${item.description}`, query))
    .sort((a, b) => titleCase(a.id).localeCompare(titleCase(b.id)));
  const selected = state.grammarId ? grammarById(state.grammarId) : null;
  host.innerHTML = `
    ${renderTopbar("Start from a visual problem")}
    <div class="decision-workspace">
      <aside class="decision-picker">
        <label class="decision-search">
          <span>Find relationship</span>
          <input type="search" data-grammar-search value="${escapeHtml(state.grammarQuery)}" placeholder="flow, map, distribution, 3D…" autocomplete="off" />
        </label>
        <div class="decision-list">
          ${grammars.map((grammar) => `
            <button type="button" class="decision-list-row ${grammar.id === state.grammarId ? "is-selected" : ""}" data-grammar-id="${escapeHtml(grammar.id)}">
              <span>${escapeHtml(titleCase(grammar.id))}</span>
              <small>grammar</small>
            </button>`).join("")}
        </div>
      </aside>
      <section class="decision-detail">
        ${selected ? grammarDetailHtml(state.grammarId, selected) : emptyGrammarDetailHtml()}
      </section>
    </div>`;
}

function emptyGrammarDetailHtml() {
  return `
    <div class="decision-empty">
      <p class="decision-kicker">Choose a relationship</p>
      <h2>Name the thing that needs to become visible.</h2>
      <p>“A map,” “a simulation,” or “a graph” is still too early. Choose the explanatory relationship first; the engine follows.</p>
    </div>`;
}

function grammarDetailHtml(grammarId, grammar) {
  const familyIds = familyIdsForGrammar(grammarId);
  const families = familyIds.map((id) => ({ id, ...familyById(id) })).filter((item) => item.label);
  const tools = (grammar.default_tools || []).map(toolById).filter(Boolean);
  const mechanisms = rankMechanismsForGrammar(grammarId, 5);
  const subjectExamples = (data?.subjects?.subjects || [])
    .filter((subject) => familyIds.includes(subject.family))
    .slice(0, 10);
  return `
    <div class="decision-subject-head">
      <p class="decision-kicker">Visualization grammar</p>
      <h2>${escapeHtml(titleCase(grammarId))}</h2>
      <p class="decision-family-line">${escapeHtml(grammar.description || "")}</p>
    </div>

    <section class="decision-section">
      <div class="decision-section-head"><span>01</span><h3>Use it across</h3></div>
      <div class="decision-family-strip">${families.map((family) => `<span>${escapeHtml(family.label)}</span>`).join("")}</div>
      ${subjectExamples.length ? `<p class="decision-examples">Examples: ${escapeHtml(subjectExamples.map((subject) => subject.name).join(" · "))}</p>` : ""}
    </section>

    <section class="decision-section decision-bank-section">
      <div class="decision-section-head"><span>02</span><h3>Start with these engines</h3></div>
      <div class="decision-bank-group">${tools.map((item) => bankRowHtml("tool", item)).join("")}</div>
      ${grammar.gap_note ? `<div class="decision-gap"><strong>Capability gap</strong><span>${escapeHtml(grammar.gap_note)}</span></div>` : ""}
    </section>

    ${mechanisms.length ? `<section class="decision-section decision-bank-section">
      <div class="decision-section-head"><span>03</span><h3>Related mechanisms already banked</h3></div>
      <div class="decision-bank-group">${mechanisms.map((item) => bankRowHtml("mechanism", item)).join("")}</div>
    </section>` : ""}

    <button type="button" class="copy-brief decision-copy" data-copy-grammar>Copy build brief</button>`;
}

function selectSubject(id, push = true) {
  const subject = subjectById(id);
  if (!subject) return;
  state.mode = "subject";
  state.subjectId = id;
  state.program = subject.program;
  state.topicIndex = 0;
  if (push) pushDecisionHash("subject", id);
  renderSubjectList(activeHost);
}

function selectGrammar(id, push = true) {
  if (!grammarById(id)) return;
  state.mode = "grammar";
  state.grammarId = id;
  if (push) pushDecisionHash("grammar", id);
  renderGrammarList(activeHost);
}

function syncFromHash() {
  if (!activeHost || !data) return false;
  const raw = decodeURIComponent(location.hash.replace(/^#/, ""));
  if (raw.startsWith("subject:")) {
    selectSubject(raw.slice("subject:".length), false);
    return true;
  }
  if (raw.startsWith("grammar:")) {
    selectGrammar(raw.slice("grammar:".length), false);
    return true;
  }
  return false;
}

async function copySubjectBrief(button) {
  const subject = subjectById(state.subjectId);
  const family = familyById(subject?.family);
  const topic = family?.topic_seeds?.[state.topicIndex];
  if (!subject || !family || !topic) return;
  const routes = rankGrammars(family, topic);
  const tools = [...new Set(routes.flatMap((id) => grammarById(id)?.default_tools || []))];
  const brief = [
    `Use the AI Design Resource Bank master decision system for ${subject.name}${subject.code ? ` (${subject.code})` : ""}.`,
    `Curriculum: ${PROGRAM_LABELS[subject.program] || subject.program}.`,
    `Topic relationship: ${topic.topic}.`,
    `Make visible: ${topic.visualize_as}`,
    `Recommended visualization grammars: ${routes.join(", ")}.`,
    `Start with engines: ${tools.join(", ")}.`,
    `Reuse mechanisms where useful: ${(family.mechanisms || []).join(", ")}.`,
    `Do not choose a renderer before checking the subject semantics and the existing bank mechanisms.`,
  ].join(" ");
  await copyText(brief, button);
}

async function copyGrammarBrief(button) {
  const grammar = grammarById(state.grammarId);
  if (!grammar) return;
  const families = familyIdsForGrammar(state.grammarId).map((id) => familyById(id)?.label).filter(Boolean);
  const brief = [
    `Use the AI Design Resource Bank visualization grammar “${state.grammarId}”.`,
    `Relationship: ${grammar.description}`,
    `Start with engines: ${(grammar.default_tools || []).join(", ")}.`,
    `Common subject families: ${families.join(", ")}.`,
    grammar.gap_note ? `Known capability gap: ${grammar.gap_note}` : "",
    `Prefer an existing bank mechanism or a minimal semantic spike before hand-building a custom renderer.`,
  ].filter(Boolean).join(" ");
  await copyText(brief, button);
}

async function copyText(text, button) {
  try {
    await navigator.clipboard.writeText(text);
    const original = button.textContent;
    button.textContent = "Copied";
    setTimeout(() => { button.textContent = original; }, 1200);
  } catch {
    button.textContent = "Copy unavailable";
  }
}

function bindHost(host) {
  if (host.dataset.decisionBound === "true") return;
  host.dataset.decisionBound = "true";

  host.addEventListener("click", (event) => {
    const target = event.target.closest("button");
    if (!target || !host.contains(target)) return;
    if (target.dataset.decisionHome !== undefined) {
      history.pushState({}, "", location.pathname + location.search);
      renderLanding(host);
      return;
    }
    if (target.dataset.decisionPath === "subject") {
      state.mode = "subject";
      renderSubjectList(host);
      return;
    }
    if (target.dataset.decisionPath === "grammar") {
      state.mode = "grammar";
      renderGrammarList(host);
      return;
    }
    if (target.dataset.program) {
      state.program = target.dataset.program;
      state.subjectId = null;
      state.subjectQuery = "";
      state.showAllSubjects = false;
      renderSubjectList(host);
      return;
    }
    if (target.dataset.subjectId) {
      selectSubject(target.dataset.subjectId, true);
      return;
    }
    if (target.dataset.topicIndex !== undefined) {
      state.topicIndex = Number(target.dataset.topicIndex) || 0;
      renderSubjectList(host);
      return;
    }
    if (target.dataset.grammarId) {
      selectGrammar(target.dataset.grammarId, true);
      return;
    }
    if (target.dataset.bankUid) {
      openBankItem(target.dataset.bankUid);
      return;
    }
    if (target.dataset.showAll !== undefined) {
      state.showAllSubjects = true;
      renderSubjectList(host);
      return;
    }
    if (target.dataset.copySubject !== undefined) copySubjectBrief(target);
    if (target.dataset.copyGrammar !== undefined) copyGrammarBrief(target);
  });

  host.addEventListener("input", (event) => {
    if (event.target.matches("[data-subject-search]")) {
      state.subjectQuery = event.target.value;
      state.showAllSubjects = false;
      renderSubjectList(host);
      requestAnimationFrame(() => host.querySelector("[data-subject-search]")?.focus());
    }
    if (event.target.matches("[data-grammar-search]")) {
      state.grammarQuery = event.target.value;
      renderGrammarList(host);
      requestAnimationFrame(() => host.querySelector("[data-grammar-search]")?.focus());
    }
  });
}

export async function mountDecisionBoard(host) {
  if (!host) return;
  activeHost = host;
  await loadDecisionStyles();
  bindHost(host);
  if (!data) {
    renderLoading(host);
    try {
      data = await loadAtlas();
    } catch (error) {
      host.innerHTML = `<div class="decision-empty"><p class="decision-kicker">Atlas unavailable</p><h2>The subject decision data could not load.</h2><p>${escapeHtml(error instanceof Error ? error.message : String(error))}</p></div>`;
      return;
    }
  }
  if (!syncFromHash()) {
    if (state.mode === "subject") renderSubjectList(host);
    else if (state.mode === "grammar") renderGrammarList(host);
    else renderLanding(host);
  }
}

window.addEventListener("popstate", () => {
  if (!activeHost || activeHost.hidden || !data) return;
  if (!syncFromHash() && !location.hash) renderLanding(activeHost);
});
