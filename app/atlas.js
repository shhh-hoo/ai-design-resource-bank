import { visual, escape as esc } from "./visuals.js";
const main = document.querySelector("main");
const json = async (path) => {
  const r = await fetch(path);
  if (!r.ok) throw new Error(`Unable to load ${path}`);
  return r.json();
};
let indexPromise;
const indexRecords = () => (indexPromise ||= json("catalog/index.json"));
const data = await json("catalog/web-index.json");
const examples = new Map(data.examples.map((e) => [e.id, e]));
const topics = new Map(data.topics.map((t) => [t.id, t]));
const selected = new Map();
let committed = null,
  routeVersion = 0;
const card = (e) =>
  `<a class="card" href="#example/${e.id}"><div class="preview ${e.kind === "GAP" ? "gap-preview" : ""}">${e.kind === "GAP" ? '<span class="gap-sign">＋</span><span>Example needed</span>' : visual(e.preview.renderer, e.title)}</div><h3>${esc(e.title)}</h3><div class="card-meta"><span class="kind-${e.kind.toLowerCase()}">${e.kind}</span><span>·</span><span>${e.kind === "LIVE" ? "Try the diagram" : e.kind === "GAP" ? "Missing coverage" : "Diagram study"}</span></div></a>`;
const heading = (tag, title, copy) =>
  `<div class="page-heading"><div><p class="eyebrow">${tag}</p><h1>${title}</h1><p class="intro">${copy}</p></div><span class="subject-label">Subject pack / Chemistry</span></div>`;
const list = (arr) =>
  `<ul>${arr.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
const busy = () => '<p class="loading">Loading…</p>';
function atlas(topicId = "topic:chemistry-energetics") {
  const topic = topics.get(topicId);
  if (!topic || !topic.parent) throw new Error("Unknown Chemistry topic");
  main.innerHTML =
    heading(
      "THE KNOWLEDGE ATLAS",
      "Chemistry, in view.",
      "Browse a knowledge point. See the relationship. Try an example.",
    ) +
    `<div class="atlas-layout"><aside class="topic-nav" aria-label="Chemistry topics"><p class="eyebrow">Chemistry</p>${data.topics
      .filter((t) => t.parent === "topic:chemistry")
      .sort((a, b) => a.order - b.order)
      .map(
        (t) =>
          `<a href="#atlas/${t.id}" ${t.id === topicId ? 'aria-current="page"' : ""}>${esc(t.title)}<span>↗</span></a>`,
      )
      .join(
        "",
      )}</aside><section aria-label="${esc(topic.title)} examples"><div class="topic-heading"><h2>${esc(topic.title)}</h2><small>Visual example inventory</small></div><div class="grid">${topic.example_ids.map((id) => card(examples.get(id))).join("")}</div></section></div>`;
}
function explore() {
  const filter = (id, title, values) =>
    `<label>${title}<select id="${id}" aria-label="${title}"><option value="">All</option>${values.map(([v, n]) => `<option value="${esc(v)}">${esc(n)}</option>`).join("")}</select></label>`;
  main.innerHTML =
    heading(
      "VISUAL DISCOVERY",
      "Follow your curiosity.",
      "Discover examples by what they show and how they respond.",
    ) +
    `<div class="filters">${filter(
      "intent",
      "Intent",
      data.intents.map((x) => [x.id, x.title]),
    )}${filter("medium", "Medium", [
      ["diagram", "Diagram"],
      ["interactive-diagram", "Interactive diagram"],
    ])}${filter("interaction", "Interaction", [
      ["inspect", "Inspect"],
      ["parameter-control", "Parameter control"],
    ])}${filter("trait", "Visual trait", [
      ["schematic", "Schematic"],
      ["quantitative", "Quantitative"],
      ["labeled", "Labeled"],
    ])}${filter(
      "collection",
      "Collection",
      data.collections.map((x) => [x.id, x.title]),
    )}${filter("availability", "Coverage", [
      ["LIVE", "LIVE"],
      ["REFERENCE", "REFERENCE"],
      ["GAP", "GAP"],
    ])}</div><div class="grid explore" id="results"></div>`;
  const update = () => {
    const value = (id) => document.getElementById(id).value;
    const result = data.examples.filter(
      (e) =>
        (!value("intent") || e.intent_ids.includes(value("intent"))) &&
        (!value("medium") || e.medium === value("medium")) &&
        (!value("interaction") || e.interaction === value("interaction")) &&
        (!value("trait") || e.visual_traits.includes(value("trait"))) &&
        (!value("collection") ||
          e.collection_ids.includes(value("collection"))) &&
        (!value("availability") || e.kind === value("availability")),
    );
    const rank = { LIVE: 0, REFERENCE: 1, GAP: 2 };
    result.sort((a, b) => rank[a.kind] - rank[b.kind] || a.title.localeCompare(b.title));
    document.getElementById("results").innerHTML = result.length
      ? result.map(card).join("")
      : '<p class="empty">No examples match these filters.</p>';
  };
  main
    .querySelectorAll("select")
    .forEach((s) => s.addEventListener("change", update));
  update();
}
function sourceLabel(source) {
  // Locator types describe provenance; local filenames and prompts are plain text.
  const linkable = ["url", "repository", "paper", "image", "video"].includes(source.locator_type)
    && /^https?:\/\//i.test(source.locator);
  const label = linkable
    ? `<a class="external" href="${esc(source.locator)}" target="_blank" rel="noreferrer">${esc(source.title)} ↗</a>`
    : `<strong>${esc(source.title)}</strong>`;
  return `${label}<br><span class="source-locator">${esc(source.locator_type)} · ${esc(source.locator)}</span>`;
}
async function detail(id, version) {
  const e = examples.get(id);
  if (!e) throw new Error("Unknown Example");
  main.innerHTML = `<article class="detail"><a class="back" href="#atlas/${e.topic_ids[0]}">← ${esc(topics.get(e.topic_ids[0]).title)}</a><div class="detail-stage ${e.kind === "GAP" ? "gap-preview" : ""}" id="stage">${e.kind === "GAP" ? '<span class="gap-sign">＋</span><span>GAP · A concrete example is still needed</span>' : visual(e.preview.renderer, e.title)}</div><div class="detail-identification"><div><p class="eyebrow">${e.kind} / Chemistry</p><h1>${esc(e.title)}</h1><p id="context">${e.kind === "GAP" ? esc(e.gap_reason) : ""}</p><span class="data-id">${e.id}</span></div><button id="select-example" ${e.kind === "GAP" ? "disabled" : ""}>${selected.has(id) ? "Selected ✓" : "Add to selection"}</button></div><details id="ai-build"><summary>AI Build</summary><div class="details-body">${busy()}</div></details><details id="implementation"><summary>Implementation & model limits</summary><div class="details-body">${busy()}</div></details><details id="provenance"><summary>Provenance & curriculum crosswalks</summary><div class="details-body">${busy()}</div></details></article>`;
  document.getElementById("select-example").onclick = (event) => {
    selected.set(
      id,
      selected.get(id) || { id, aspect_notes: "", constraints: [] },
    );
    committed = null;
    event.target.textContent = "Selected ✓";
    count();
  };
  if (e.kind === "LIVE") {
    const { mountLive } = await import("./live.js");
    if (version !== routeVersion) return;
    mountLive(document.getElementById("stage"), e.preview.renderer, e.title);
  }
  const resolved = await json(e.resolve_path);
  if (version !== routeVersion) return;
  const r = resolved.record,
    b = resolved.ai_build;
  document.getElementById("context").textContent = r.summary;
  document.querySelector("#ai-build .details-body").innerHTML =
    `<p>${r.kind === "GAP" ? "Coverage gap: no implementation is claimed." : "Generated from this exact Example. Proposed alternatives are distinguished from observed implementation."}</p><h3>Method</h3><p>${esc(b.method.grammar.join(" · "))} / ${esc(r.interaction)}</p>${list(b.method.transfer_constraints)}<h3>Mechanism evidence</h3>${b.method.mechanisms.length ? list(b.method.mechanisms.map((x) => `${x.id}: ${x.implementation_note} (${x.evidence})`)) : "<p>No legacy mechanism required.</p>"}<h3>Tools</h3>${b.tools.map((t) => `<p><strong>${esc(t.record.title)}</strong> · ${t.evidence}<br>${esc(t.reason)}</p><p>Use when: ${esc(t.record.use_when)}<br>Avoid when: ${esc(t.record.avoid_when)}</p>`).join("") || "<p>No tool implementation claim.</p>"}<h3>Resources</h3>${b.resources.length ? list(b.resources.map((x) => `${x.title} · ${x.id} · ${x.status}`)) : "<p>No extracted Resource Package.</p>"}<p class="gap-note">Commit your selection before locking IDs and fetching full build resources.</p>`;
  document.querySelector("#implementation .details-body").innerHTML =
    `<h3>State model</h3><p>${esc(r.state_model.model)} · deterministic: ${r.state_model.deterministic}</p><p>${esc(r.interaction_model.response)}</p><h3>Fidelity constraints</h3>${list(r.fidelity_constraints)}<h3>Avoid</h3>${list(r.failure_modes)}<h3>Lifecycle</h3><p>${Object.entries(
      r.lifecycle,
    )
      .map(([k, v]) => `${k}: ${v ? "yes" : "no"}`)
      .join(" · ")}</p>`;
  document.querySelector("#provenance .details-body").innerHTML =
    `<p>Canonical topic → curriculum node. These editorial mappings describe scope, not approval by a curriculum board.</p>${resolved.crosswalks.map((c) => `<p><strong>${esc(c.node.label)}</strong> · ${esc(c.node.section)}<br>Canonical topic is <strong>${c.relation}</strong> relative to this source node.<br>${esc(c.rationale)}</p>`).join("")}<h3>Sources</h3>${resolved.sources.map((s) => `<p>${sourceLabel(s)}<br>${esc(s.publisher)} · checked ${esc(s.checked_at || "not independently checked")}<br><span class="gap-note">${esc(s.check_scope)}</span></p>`).join("")}`;
}
async function dictionary(version) {
  main.innerHTML =
    heading(
      "THE DICTIONARY",
      "A name for what you see.",
      "Concept vocabulary, grounded in concrete examples.",
    ) +
    '<div class="filters"><label>Find a concept<input id="concept-search" type="search" placeholder="Reaction, geometry, equilibrium…"></label></div><div id="dictionary-results">' +
    busy() +
    "</div>";
  const concepts = await json("catalog/dictionary.json");
  if (version !== routeVersion) return;
  const render = () => {
    const q = document.getElementById("concept-search").value.toLowerCase();
    const matches = concepts
      .filter((c) => (c.title + " " + c.summary).toLowerCase().includes(q))
      .sort(
        (a, b) =>
          Number(b.example_ids.some(id => examples.get(id).kind !== "GAP")) -
            Number(a.example_ids.some(id => examples.get(id).kind !== "GAP")) ||
          a.title.localeCompare(b.title),
      );
    document.getElementById("dictionary-results").innerHTML =
      matches
        .map(
          (c) =>
            `<section class="dictionary-entry"><div><h2><a href="#record/${c.id}">${esc(c.title)}</a></h2><p>${esc(c.summary)}</p>${c.adjacent_ids.length ? `<p>Adjacent: ${c.adjacent_ids.map((id) => `<a class="external" href="#record/${id}">${esc(id.replace("concept:", "").replaceAll("-", " "))}</a>`).join(" · ")}</p>` : ""}</div><div class="grid">${c.example_ids.length ? c.example_ids.map((id) => card(examples.get(id))).join("") : '<p class="gap-note">Legacy vocabulary · no curated Example yet.</p>'}</div></section>`,
        )
        .join("") || '<p class="empty">No matching concepts.</p>';
  };
  document.getElementById("concept-search").addEventListener("input", render);
  render();
}
async function index(version) {
  main.innerHTML =
    heading(
      "THE INDEX",
      "Everything, by name.",
      "Compact retrieval across content, organization and provenance.",
    ) +
    '<div class="filters"><label>Search name or stable ID<input id="index-search" type="search" placeholder="Name or stable ID"></label><label>Entity type<select id="entity-type"><option value="">All types</option>' +
    [
      "Concept",
      "Example",
      "Tool",
      "Resource",
      "SubjectTopic",
      "Intent",
      "Collection",
      "Source",
    ]
      .map((t) => `<option>${t}</option>`)
      .join("") +
    '</select></label></div><table class="index-table"><thead><tr><th>Type</th><th>Name</th><th>Stable ID</th></tr></thead><tbody id="index-results"></tbody></table>';
  const records = await indexRecords();
  if (version !== routeVersion) return;
  const render = () => {
    const q = document.getElementById("index-search").value.toLowerCase(),
      kind = document.getElementById("entity-type").value;
    document.getElementById("index-results").innerHTML = records
      .filter(
        (r) =>
          (!kind || r.type === kind) &&
          (r.id + " " + r.title).toLowerCase().includes(q),
      )
      .map(
        (r) =>
          `<tr><td>${r.type}</td><td><a href="#${r.type === "Example" ? "example" : "record"}/${r.id}">${esc(r.title)}</a></td><td class="data-id">${r.id}</td></tr>`,
      )
      .join("");
  };
  main
    .querySelectorAll("input,select")
    .forEach((x) => x.addEventListener("input", render));
  render();
}
function count() {
  document.getElementById("selection-count").textContent = selected.size;
}
function download(value, name) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2) + "\n"], {
      type: "application/json",
    }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function selection(version) {
  main.innerHTML =
    heading(
      "SHARED SELECTION",
      "Choose what to carry forward.",
      "Candidates stay editable. Commit preserves your exact references and notes.",
    ) +
    ([...selected.values()]
      .map(
        (s) =>
          `<section class="selection-item"><h3><a href="#example/${s.id}">${esc(examples.get(s.id).title)}</a></h3><label>Aspect notes<textarea data-notes="${s.id}" placeholder="What should be borrowed? What should be avoided?">${esc(s.aspect_notes)}</textarea></label><label>Constraints · one per line<textarea data-constraints="${s.id}">${esc(s.constraints.join("\n"))}</textarea></label><button data-remove="${s.id}">Remove</button></section>`,
      )
      .join("") ||
      '<p class="empty">Open an Example and add it to your selection.</p>') +
    `<div class="selection-actions"><button class="primary" id="commit" ${selected.size ? "" : "disabled"}>Commit selection</button><button id="export-selection" disabled>Download committed selection</button></div><p class="notice" id="commit-status"></p>`;
  main.querySelectorAll("[data-notes],[data-constraints]").forEach(
    (x) =>
      (x.oninput = () => {
        const s = selected.get(x.dataset.notes || x.dataset.constraints);
        if (x.dataset.notes) s.aspect_notes = x.value;
        else s.constraints = x.value.split("\n").filter(Boolean);
        committed = null;
        document.getElementById("export-selection").disabled = true;
        document.getElementById("commit-status").textContent =
          "Selection changed. Commit again to freeze these choices.";
      }),
  );
  main.querySelectorAll("[data-remove]").forEach(
    (x) =>
      (x.onclick = () => {
        selected.delete(x.dataset.remove);
        committed = null;
        count();
        selection(version);
      }),
  );
  document.getElementById("commit").onclick = async () => {
    try {
      const { fingerprint } = await json("catalog/manifest.json");
      if (version !== routeVersion) return;
      const body = {
        version: 1,
        state: "committed",
        selection: {
          selector: "human",
          selections: structuredClone([...selected.values()]),
        },
        catalog_fingerprint: fingerprint,
      };
      const canonical = (v) =>
        Array.isArray(v)
          ? v.map(canonical)
          : v && typeof v === "object"
            ? Object.fromEntries(
                Object.keys(v)
                  .sort()
                  .map((k) => [k, canonical(v[k])]),
              )
            : v;
      const bytes = new TextEncoder().encode(
        JSON.stringify(canonical(body), null, 2) + "\n",
      );
      const digest = await crypto.subtle.digest("SHA-256", bytes);
      committed = {
        ...body,
        commit_digest: [...new Uint8Array(digest)]
          .map((x) => x.toString(16).padStart(2, "0"))
          .join(""),
      };
      document.getElementById("export-selection").disabled = false;
      document.getElementById("commit-status").textContent =
        "Committed. Download this selection, then use the retrieval CLI to lock these exact IDs and fetch build resources. Selections stay in this tab until reload.";
    } catch (e) {
      document.getElementById("commit-status").textContent = e.message;
    }
  };
  document.getElementById("export-selection").onclick = () =>
    download(committed, "aidrb-selection.json");
}
async function record(id, version) {
  if (!/^[a-z]+:[a-z0-9-]+$/.test(id)) throw new Error("Invalid stable ID");
  main.innerHTML = busy();
  const entry = (await indexRecords()).find((r) => r.id === id);
  if (!entry) throw new Error("Unknown stable ID");
  const r = await json(entry.resolve_path);
  if (version !== routeVersion) return;
  main.innerHTML = `<article class="record"><a class="back" href="#index">← Index</a><p class="eyebrow">${r.record.type}</p><h1>${esc(r.record.title)}</h1><p class="intro">${esc(r.record.summary || r.record.scope || "")}</p><p class="data-id">${r.record.id}</p><pre>${esc(JSON.stringify(r, null, 2))}</pre></article>`;
}
async function route() {
  const version = ++routeVersion;
  const [rawView, id] = location.hash.slice(1).split("/");
  const view = rawView || "atlas";
  document.querySelectorAll("nav a").forEach((a) => {
    if (a.hash === "#" + view || (view === "example" && a.hash === "#atlas"))
      a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  try {
    if (view === "atlas" || view === "") atlas(id);
    else if (view === "explore") explore();
    else if (view === "example") await detail(id, version);
    else if (view === "dictionary") await dictionary(version);
    else if (view === "index") await index(version);
    else if (view === "selection") await selection(version);
    else if (view === "record") await record(id, version);
    else throw new Error("Unknown page");
    if (version === routeVersion) {
      document.title = `AIDRB — ${view === "example" ? examples.get(id).title : view === "atlas" ? "Knowledge Atlas" : view[0].toUpperCase() + view.slice(1)}`;
      window.scrollTo(0, 0);
    }
  } catch (e) {
    if (version === routeVersion)
      main.innerHTML = `<h1>Unable to open this view.</h1><p>${esc(e.message)}</p><a href="#atlas">Return to Atlas</a>`;
  }
}
window.addEventListener("hashchange", route);
route();
