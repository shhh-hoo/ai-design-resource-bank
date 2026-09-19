import { visual, escape as esc } from "./visuals.js";
import {
  creativeDomain,
  humanize,
  presentationLabel,
  presentationType,
  resourceDemoPath,
} from "./presentation.js";

const main = document.querySelector("main");
const json = async (path) => {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Unable to load ${path}`);
  return response.json();
};

let indexPromise;
let dictionaryPromise;
let relationsPromise;
let mediaPromise;
const indexRecords = () => (indexPromise ||= json("catalog/index.json"));
const dictionaryRecords = () =>
  (dictionaryPromise ||= json("catalog/dictionary.json"));
const relationRecords = () =>
  (relationsPromise ||= json("catalog/relations.json"));
const mediaRecords = () => (mediaPromise ||= json("app/media.json"));

const data = await json("catalog/web-index.json");
const examples = new Map(data.examples.map((example) => [example.id, example]));
const topics = new Map(data.topics.map((topic) => [topic.id, topic]));
let routeVersion = 0;

const busy = () => '<p class="loading">Loading…</p>';
const list = (items, className = "") =>
  items?.length
    ? `<ul class="${className}">${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`
    : '<p class="quiet">None recorded.</p>';

const heading = (title, label = "") =>
  `<div class="page-heading"><h1>${esc(title)}</h1>${label ? `<span class="subject-label">${esc(label)}</span>` : ""}</div>`;

function referencePlate(example, detail = false) {
  const type = presentationType(example);
  const domain = creativeDomain(example);
  const traits = (example.visual_traits || []).slice(0, detail ? 4 : 2);
  return `<div class="reference-plate reference-plate--${type}" data-presentation="${type}">
    <div class="reference-plate__field" aria-hidden="true">
      <span>${esc(presentationLabel(type).replace(/^External /, ""))}</span>
      <i></i><i></i><i></i>
    </div>
    <div class="reference-plate__copy">
      <span class="reference-plate__domain">${esc(domain)}</span>
      <strong>${esc(humanize(example.medium || type))}</strong>
      <small>${esc(example.interaction || "inspect")} ${traits.length ? `· ${traits.map(esc).join(" · ")}` : ""}</small>
    </div>
  </div>`;
}

const previewMarkup = (example, detail = false) => {
  if (example.kind === "GAP") {
    return '<span class="gap-sign">＋</span><span>Example needed</span>';
  }
  if (example.preview) return visual(example.preview.renderer, example.title);
  return referencePlate(example, detail);
};

const previewClass = (example) =>
  example.kind === "GAP"
    ? "gap-preview"
    : example.preview
      ? "local-preview"
      : "reference-preview";

function exampleTile(example, index = 0) {
  const type = presentationType(example);
  const size =
    type === "spatial" || type === "cinema"
      ? "wide"
      : index % 5 === 0
        ? "wide"
        : "standard";
  return `<a class="example-tile card example-tile--${type}" data-size="${size}" href="#example/${example.id}">
    <div class="preview ${previewClass(example)}">${previewMarkup(example)}</div>
    <div class="example-tile__caption">
      <div><h3>${esc(example.title)}</h3><p>${esc(humanize(example.medium || example.kind))}</p></div>
      <span class="kind-${example.kind.toLowerCase()}">${example.kind}</span>
    </div>
  </a>`;
}

function compactExample(example) {
  return `<a class="compact-example" href="#example/${example.id}">
    <span class="compact-example__type">${esc(humanize(example.medium || example.kind))}</span>
    <strong>${esc(example.title)}</strong>
    <span>${esc(example.interaction || "")} →</span>
  </a>`;
}

function subjectAtlas(topicId = "topic:chemistry-energetics") {
  const topic = topics.get(topicId);
  if (!topic || !topic.parent) throw new Error("Unknown Chemistry topic");
  main.innerHTML =
    `<a class="back" href="#atlas">← References</a>` +
    heading("Chemistry", "Academic") +
    `<div class="atlas-layout"><aside class="topic-nav" aria-label="Chemistry topics"><p class="eyebrow">Chemistry</p>${data.topics
      .filter((item) => item.parent === "topic:chemistry")
      .sort((a, b) => a.order - b.order)
      .map(
        (item) =>
          `<a href="#atlas/${item.id}" ${item.id === topicId ? 'aria-current="page"' : ""}>${esc(item.title)}<span>↗</span></a>`,
      )
      .join("")}</aside><section aria-label="${esc(topic.title)} examples"><div class="topic-heading"><h2>${esc(topic.title)}</h2></div><div class="grid academic-grid">${topic.example_ids
      .map((id, index) => exampleTile(examples.get(id), index))
      .join("")}</div></section></div>`;
}

function atlas(topicId) {
  if (topicId) return subjectAtlas(topicId);
  const creative = data.examples.filter(
    (example) => !example.subject_id && example.kind !== "GAP",
  );
  const domains = [
    "Editorial / web",
    "Cinema / title",
    "Identity / motion",
    "Spatial / stage",
    "Interactive / HCI",
    "Other references",
  ];
  const groups = domains
    .map((domain) => [
      domain,
      creative.filter((example) => creativeDomain(example) === domain),
    ])
    .filter(([, items]) => items.length);

  main.innerHTML =
    heading("References", `${creative.length} items`) +
    `<div class="library-switch"><a class="academic-handoff" href="#atlas/topic:chemistry-energetics"><strong>Chemistry</strong><span>12 topics →</span></a></div>` +
    groups
      .map(
        ([domain, items]) =>
          `<section class="creative-group"><header><p class="eyebrow">${esc(domain)}</p><span>${items.length.toString().padStart(2, "0")}</span></header><div class="atlas-shelf">${items
            .map(exampleTile)
            .join("")}</div></section>`,
      )
      .join("");
}

async function explore(version) {
  main.innerHTML =
    heading("Explore") +
    `<div class="explore-tools">
      <label class="search-field">Search references<input id="explore-search" type="search" placeholder="Archive, spatial, kinetic, probability…"></label>
      <details class="refine" id="refine"><summary>Refine <span aria-hidden="true">＋</span></summary><div class="filters" id="refine-fields">${busy()}</div></details>
      <p class="result-count" id="result-count"></p>
    </div><div class="explore-stream" id="results">${busy()}</div>`;

  const [concepts, relations] = await Promise.all([
    dictionaryRecords(),
    relationRecords(),
  ]);
  if (version !== routeVersion) return;

  const conceptMap = new Map(concepts.map((concept) => [concept.id, concept]));
  const usedConceptIds = [
    ...new Set(data.examples.flatMap((example) => example.concept_ids || [])),
  ].sort((a, b) =>
    (conceptMap.get(a)?.title || a).localeCompare(conceptMap.get(b)?.title || b),
  );
  const resourceExamples = new Set(
    relations
      .filter(
        (relation) =>
          relation.type === "yields" &&
          relation.source.startsWith("ex:") &&
          relation.target.startsWith("resource:"),
      )
      .map((relation) => relation.source),
  );
  const filter = (id, title, values, defaultValue = "") =>
    `<label>${title}<select id="${id}" aria-label="${title}">${values
      .map(
        ([value, label]) =>
          `<option value="${esc(value)}" ${value === defaultValue ? "selected" : ""}>${esc(label)}</option>`,
      )
      .join("")}</select></label>`;

  document.getElementById("refine-fields").innerHTML =
    filter(
      "scope",
      "World",
      [
        ["creative", "Creative"],
        ["academic", "Academic"],
        ["all", "All"],
      ],
      "creative",
    ) +
    filter("domain", "Creative domain", [
      ["", "All domains"],
      ...[
        ...new Set(
          data.examples
            .filter((example) => !example.subject_id)
            .map(creativeDomain),
        ),
      ]
        .sort()
        .map((value) => [value, value]),
    ]) +
    filter("concept", "Concept", [
      ["", "All concepts"],
      ...usedConceptIds.map((id) => [id, conceptMap.get(id)?.title || humanize(id)]),
    ]) +
    filter("medium", "Medium", [
      ["", "All media"],
      ...[...new Set(data.examples.map((example) => example.medium).filter(Boolean))]
        .sort()
        .map((value) => [value, humanize(value)]),
    ]) +
    filter("interaction", "Interaction", [
      ["", "All interactions"],
      ...[
        ...new Set(
          data.examples.map((example) => example.interaction).filter(Boolean),
        ),
      ]
        .sort()
        .map((value) => [value, humanize(value)]),
    ]) +
    filter("trait", "Visual trait", [
      ["", "All traits"],
      ...[
        ...new Set(data.examples.flatMap((example) => example.visual_traits || [])),
      ]
        .sort()
        .map((value) => [value, humanize(value)]),
    ]) +
    filter("resource", "Demo", [
      ["", "Any"],
      ["yes", "Available"],
      ["no", "None"],
    ]) +
    filter("availability", "Coverage", [
      ["", "Any"],
      ["LIVE", "LIVE"],
      ["REFERENCE", "REFERENCE"],
      ["GAP", "GAP"],
    ]);

  const value = (id) => document.getElementById(id)?.value || "";
  const render = () => {
    const query = document
      .getElementById("explore-search")
      .value.trim()
      .toLowerCase();
    const result = data.examples
      .filter((example) => {
        const scope = value("scope");
        const worldMatch =
          scope === "all" ||
          (scope === "creative" && !example.subject_id && example.kind !== "GAP") ||
          (scope === "academic" && Boolean(example.subject_id));
        const resourceMatch =
          !value("resource") ||
          (value("resource") === "yes" && resourceExamples.has(example.id)) ||
          (value("resource") === "no" && !resourceExamples.has(example.id));
        const searchHaystack = [
          example.title,
          example.medium,
          example.interaction,
          ...(example.visual_traits || []),
          ...(example.concept_ids || []).flatMap((id) => [
            id,
            conceptMap.get(id)?.title || "",
          ]),
        ]
          .join(" ")
          .toLowerCase();
        return (
          worldMatch &&
          resourceMatch &&
          (!query || searchHaystack.includes(query)) &&
          (!value("domain") || creativeDomain(example) === value("domain")) &&
          (!value("concept") || example.concept_ids.includes(value("concept"))) &&
          (!value("medium") || example.medium === value("medium")) &&
          (!value("interaction") ||
            example.interaction === value("interaction")) &&
          (!value("trait") || example.visual_traits.includes(value("trait"))) &&
          (!value("availability") || example.kind === value("availability"))
        );
      })
      .sort(
        (a, b) =>
          creativeDomain(a).localeCompare(creativeDomain(b)) ||
          a.title.localeCompare(b.title),
      );

    document.getElementById("result-count").textContent =
      `${result.length} ${result.length === 1 ? "reference" : "references"}`;
    document.getElementById("results").innerHTML = result.length
      ? result
          .map((example, index) => {
            const type = presentationType(example);
            const conceptsMarkup = (example.concept_ids || [])
              .map(
                (id) =>
                  `<a href="#concept/${id}">${esc(conceptMap.get(id)?.title || humanize(id))}</a>`,
              )
              .join(" · ");
            return `<article class="explore-row explore-row--${type}" data-presentation="${type}" data-flip="${index % 4 === 2 ? "true" : "false"}">
              <a class="explore-row__visual ${previewClass(example)}" href="#example/${example.id}">${previewMarkup(example)}</a>
              <div class="explore-row__copy">
                <p class="eyebrow">${esc(creativeDomain(example))} / ${esc(humanize(example.medium || example.kind))}</p>
                <h2><a href="#example/${example.id}">${esc(example.title)}</a></h2>
                <p>${esc(humanize(example.interaction || "inspect"))} · ${(example.visual_traits || []).map(humanize).map(esc).join(" · ")}</p>
                <p class="concept-line">${conceptsMarkup || "No Concept mapping yet."}</p>
                <div class="row-flags">${example.kind === "LIVE" ? "<span>Live</span>" : ""}${resourceExamples.has(example.id) ? "<span>Demo</span>" : ""}</div>
              </div>
            </article>`;
          })
          .join("")
      : '<p class="empty">No references match the current refinement.</p>';
  };

  document
    .querySelectorAll("#explore-search, #refine-fields select")
    .forEach((input) => input.addEventListener("input", render));
  render();
}

function sourceLinkable(source) {
  return (
    ["url", "repository", "paper", "image", "video"].includes(
      source.locator_type,
    ) && /^https?:\/\//i.test(source.locator)
  );
}

function sourceLabel(source) {
  const label = sourceLinkable(source)
    ? `<a class="external" href="${esc(source.locator)}" target="_blank" rel="noreferrer">${esc(source.title)} ↗</a>`
    : `<strong>${esc(source.title)}</strong>`;
  return `${label}<br><span class="source-locator">${esc(source.locator_type)} · ${esc(source.locator)}</span>`;
}

function originalFrame(example, media) {
  const url = media.embed_url || media.source_url;
  return `<div class="original-media">
    <iframe class="original-frame" src="${esc(url)}" title="${esc(example.title)} — original" loading="eager"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
      referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; fullscreen" allowfullscreen></iframe>
    <div class="media-credit"><span>Original · ${esc(media.attribution)}</span><a href="${esc(media.source_url)}" target="_blank" rel="noreferrer">Open ↗</a></div>
  </div>`;
}

function originalPoster(example, media) {
  return `<figure class="original-media original-media--poster">
    <img class="original-poster" src="${esc(media.poster_url)}" alt="${esc(example.title)}" loading="eager" referrerpolicy="no-referrer">
    <figcaption class="media-credit"><span>Original preview · ${esc(media.attribution)}</span><a href="${esc(media.source_url)}" target="_blank" rel="noreferrer">Open ↗</a></figcaption>
  </figure>`;
}

function applyOriginalMedia(example, media) {
  if (!media || example.kind !== "REFERENCE" || example.preview) return;
  const stage = document.getElementById("stage");
  if (!stage) return;

  if (media.mode === "embed") {
    stage.className = "detail-stage original-media-stage";
    stage.innerHTML = originalFrame(example, media);
    return;
  }

  if (media.mode === "poster" && media.poster_url) {
    stage.className = "detail-stage original-media-stage";
    stage.innerHTML = originalPoster(example, media);
    return;
  }

  if (media.mode === "on-demand-embed") {
    const access = stage.querySelector(".reference-access");
    if (!access) return;
    access.innerHTML = `<button class="load-original" type="button">Load original</button><a href="${esc(media.source_url)}" target="_blank" rel="noreferrer">Open ↗</a>`;
    access.querySelector(".load-original").addEventListener("click", () => {
      stage.className = "detail-stage original-media-stage";
      stage.innerHTML = originalFrame(example, media);
    });
  }
}

async function detail(id, version) {
  const example = examples.get(id);
  if (!example) throw new Error("Unknown Example");
  const primaryTopic = example.topic_ids?.[0];
  const backHref = primaryTopic ? `#atlas/${primaryTopic}` : "#explore";
  const backLabel = primaryTopic ? topics.get(primaryTopic)?.title || "Atlas" : "Explore";
  const subjectLabel = example.subject_id
    ? topics.get(example.subject_id)?.title || "Subject"
    : creativeDomain(example);

  main.innerHTML = `<article class="detail">
    <a class="back" href="${backHref}">← ${esc(backLabel)}</a>
    <header class="detail-identification">
      <div><p class="eyebrow">${esc(subjectLabel)} · ${esc(humanize(example.medium || example.kind))}</p><h1>${esc(example.title)}</h1><p class="detail-deck">${esc(humanize(example.interaction || "inspect"))}</p><span class="data-id">${example.id}</span></div>
    </header>
    <div class="detail-stage ${previewClass(example)}" id="stage">${example.kind === "GAP" ? '<span class="gap-sign">＋</span><span>Example needed</span>' : previewMarkup(example, true)}</div>
    <section class="detail-section detail-section--lead"><p class="detail-summary" id="context">${example.kind === "GAP" ? esc(example.gap_reason || "Coverage gap") : "Loading…"}</p><div class="concept-pills" id="concepts"></div></section>
    <section class="detail-section detail-columns" id="observations">${busy()}</section>
    <section class="detail-section" id="related">${busy()}</section>
    <section class="detail-section resource-zone" id="resources"></section>
    <details id="implementation"><summary>Technical notes</summary><div class="details-body">${busy()}</div></details>
    <details id="provenance"><summary>Provenance${example.subject_id ? " & curriculum crosswalks" : ""}</summary><div class="details-body">${busy()}</div></details>
  </article>`;


  if (example.kind === "LIVE") {
    const { mountLive } = await import("./live.js");
    if (version !== routeVersion) return;
    mountLive(document.getElementById("stage"), example.preview.renderer, example.title);
  }

  const [resolved, concepts, mediaIndex] = await Promise.all([
    json(example.resolve_path),
    dictionaryRecords(),
    mediaRecords(),
  ]);
  if (version !== routeVersion) return;
  const record = resolved.record;
  const build = resolved.ai_build;
  const conceptMap = new Map(concepts.map((concept) => [concept.id, concept]));
  document.getElementById("context").textContent =
    record.summary || record.gap_reason || "";

  document.getElementById("concepts").innerHTML = (record.concept_ids || [])
    .map(
      (conceptId) =>
        `<a href="#concept/${conceptId}">${esc(conceptMap.get(conceptId)?.title || humanize(conceptId))}</a>`,
    )
    .join("");

  if (example.kind === "REFERENCE" && !example.preview) {
    const source = resolved.sources.find(sourceLinkable);
    if (source) {
      document
        .getElementById("stage")
        .insertAdjacentHTML(
          "beforeend",
          `<div class="reference-access"><a href="${esc(source.locator)}" target="_blank" rel="noreferrer">Open ↗</a></div>`,
        );
    }
    applyOriginalMedia(example, mediaIndex.examples?.[example.id]);
  }

  document.getElementById("observations").innerHTML = `
    <div><p class="eyebrow">USE</p>${list(record.transfer_constraints || [], "observation-list")}</div>
    <div><p class="eyebrow">WATCH FOR</p>${list([...(record.fidelity_constraints || []), ...(record.failure_modes || [])], "constraint-list")}</div>`;

  const related = data.examples
    .filter(
      (candidate) =>
        candidate.id !== example.id &&
        candidate.kind !== "GAP" &&
        candidate.concept_ids.some((conceptId) =>
          (record.concept_ids || []).includes(conceptId),
        ),
    )
    .slice(0, 5);
  document.getElementById("related").innerHTML = `<div class="section-heading"><p class="eyebrow">RELATED</p><span>${related.length || "—"}</span></div>${
    related.length
      ? `<div class="compact-example-list">${related.map(compactExample).join("")}</div>`
      : '<p class="quiet">No other Example currently shares this Concept mapping.</p>'
  }`;

  document.getElementById("resources").innerHTML = build.resources.length
    ? `<div class="section-heading"><p class="eyebrow">RESOURCES</p></div><div class="resource-callouts">${build.resources
        .map(
          (resource) =>
            `<a class="resource-callout" href="#resource/${resource.id}"><span>AIDRB implementation</span><h3>${esc(resource.title)}</h3><p>${esc(resource.status)}</p><strong>Open →</strong></a>`,
        )
        .join("")}</div>`
    : "";


  document.querySelector("#implementation .details-body").innerHTML =
    `<h3>State model</h3><p>${esc(record.state_model.model)} · deterministic: ${record.state_model.deterministic}</p><p>${esc(record.interaction_model.response)}</p><h3>Lifecycle</h3><p>${Object.entries(
      record.lifecycle,
    )
      .map(([key, value]) => `${key}: ${value ? "yes" : "no"}`)
      .join(" · ")}</p>`;

  const crosswalkMarkup = resolved.crosswalks.length
    ? `${resolved.crosswalks.map((crosswalk) => `<p><strong>${esc(crosswalk.node.label)}</strong> · ${esc(crosswalk.node.section)}<br>${esc(crosswalk.rationale)}</p>`).join("")}`
    : "";
  const media = mediaIndex.examples?.[example.id];
  const mediaMarkup = media
    ? `<h3>Presentation media</h3><p>${esc(media.mode)} · ${esc(media.rights_status)}${media.license ? ` · ${esc(media.license)}` : ""}<br>${esc(media.attribution)}${media.rights_evidence_url ? ` · <a class="external" href="${esc(media.rights_evidence_url)}" target="_blank" rel="noreferrer">evidence ↗</a>` : ""}</p>`
    : "";
  document.querySelector("#provenance .details-body").innerHTML =
    `${crosswalkMarkup}${mediaMarkup}<h3>Sources</h3>${resolved.sources.map((source) => `<p>${sourceLabel(source)}<br>${esc(source.publisher)} · checked ${esc(source.checked_at || "not independently checked")}<br><span class="gap-note">${esc(source.check_scope)}</span></p>`).join("")}`;
}

async function dictionary(version) {
  main.innerHTML =
    heading("Dictionary") +
    '<div class="dictionary-tools"><label class="search-field">Find a Concept<input id="concept-search" type="search" placeholder="Archive, semantic zoom, kinetic identity…"></label><p id="dictionary-count" class="result-count"></p></div><div id="dictionary-results">' +
    busy() +
    "</div>";

  const [concepts, relations] = await Promise.all([
    dictionaryRecords(),
    relationRecords(),
  ]);
  if (version !== routeVersion) return;
  const resourceConcepts = new Set(
    relations
      .filter(
        (relation) =>
          relation.type === "implements" &&
          relation.source.startsWith("resource:") &&
          relation.target.startsWith("concept:"),
      )
      .map((relation) => relation.target),
  );

  const render = () => {
    const query = document.getElementById("concept-search").value.toLowerCase();
    const matches = concepts
      .filter((concept) =>
        `${concept.title} ${concept.summary} ${concept.id}`
          .toLowerCase()
          .includes(query),
      )
      .sort(
        (a, b) =>
          Number(resourceConcepts.has(b.id)) - Number(resourceConcepts.has(a.id)) ||
          Number(b.example_ids.some((id) => examples.get(id)?.kind !== "GAP")) -
            Number(a.example_ids.some((id) => examples.get(id)?.kind !== "GAP")) ||
          a.title.localeCompare(b.title),
      );
    document.getElementById("dictionary-count").textContent =
      `${matches.length} Concepts`;
    document.getElementById("dictionary-results").innerHTML =
      matches
        .map(
          (concept) =>
            `<a class="dictionary-term" href="#concept/${concept.id}">
              <div class="dictionary-term__name"><span>${concept.id}</span><h2>${esc(concept.title)}</h2></div>
              <p>${esc(concept.summary)}</p>
              <div class="dictionary-term__meta"><span>${concept.example_ids.length} Example${concept.example_ids.length === 1 ? "" : "s"}</span>${resourceConcepts.has(concept.id) ? "<span>Demo</span>" : ""}<strong>Open →</strong></div>
            </a>`,
        )
        .join("") || '<p class="empty">No matching Concepts.</p>';
  };
  document.getElementById("concept-search").addEventListener("input", render);
  render();
}

async function resolveById(id) {
  const entry = (await indexRecords()).find((item) => item.id === id);
  if (!entry) throw new Error(`Unknown stable ID: ${id}`);
  return json(entry.resolve_path);
}

async function conceptDetail(id, version) {
  const [resolved, concepts, records] = await Promise.all([
    resolveById(id),
    dictionaryRecords(),
    indexRecords(),
  ]);
  if (version !== routeVersion) return;
  if (resolved.record.type !== "Concept") throw new Error("Not a Concept");
  const record = resolved.record;
  const conceptIndex = new Map(concepts.map((concept) => [concept.id, concept]));
  const indexMap = new Map(records.map((item) => [item.id, item]));

  const exampleIds = resolved.relations
    .filter(
      (relation) =>
        relation.type === "demonstrates" &&
        relation.target === id &&
        relation.source.startsWith("ex:"),
    )
    .map((relation) => relation.source)
    .filter((exampleId) => examples.has(exampleId));
  const resourceIds = resolved.relations
    .filter(
      (relation) =>
        relation.type === "implements" &&
        relation.target === id &&
        relation.source.startsWith("resource:"),
    )
    .map((relation) => relation.source);
  const toolIds = resolved.relations
    .filter(
      (relation) =>
        relation.type === "implemented_with" &&
        relation.source === id &&
        relation.target.startsWith("tool:"),
    )
    .map((relation) => relation.target);

  const exampleResolved = await Promise.all(
    exampleIds.map((exampleId) => json(examples.get(exampleId).resolve_path)),
  );
  if (version !== routeVersion) return;
  const transfer = [
    ...new Set(
      exampleResolved.flatMap(
        (item) => item.record.transfer_constraints || [],
      ),
    ),
  ].slice(0, 6);
  const failures = [
    ...new Set(
      exampleResolved.flatMap((item) => item.record.failure_modes || []),
    ),
  ].slice(0, 6);
  const coConceptIds = [
    ...new Set(
      exampleIds.flatMap((exampleId) => examples.get(exampleId).concept_ids || []),
    ),
  ].filter((conceptId) => conceptId !== id);
  const explicitAdjacent = conceptIndex.get(id)?.adjacent_ids || [];
  const relatedConceptIds = [...new Set([...explicitAdjacent, ...coConceptIds])].slice(
    0,
    8,
  );

  const resources = await Promise.all(resourceIds.map(resolveById));
  if (version !== routeVersion) return;

  main.innerHTML = `<article class="concept-detail">
    <a class="back" href="#dictionary">← Dictionary</a>
    <header class="concept-hero">
      <p class="eyebrow">${esc((record.subtypes || []).map(humanize).join(" · ") || "Concept")}</p>
      <h1>${esc(record.title)}</h1>
      <p class="concept-definition">${esc(record.summary)}</p>
      <span class="data-id">${record.id}</span>
    </header>
    <section class="concept-usage">
      <div><p class="eyebrow">${record.use_when ? "USE WHEN" : "TRANSFER PATTERNS"}</p>${record.use_when ? `<p>${esc(record.use_when)}</p>` : list(transfer)}</div>
      <div><p class="eyebrow">WATCH FOR</p>${list(failures)}</div>
    </section>
    <section class="concept-section">
      <div class="section-heading"><p class="eyebrow">EXAMPLES</p><span>${exampleIds.length}</span></div>
      <div class="comparison-list">${
        exampleIds.length
          ? exampleIds
              .map((exampleId) => {
                const example = examples.get(exampleId);
                return `<a class="comparison-row" href="#example/${example.id}">
                  <div class="comparison-row__visual ${previewClass(example)}">${previewMarkup(example)}</div>
                  <div><strong>${esc(example.title)}</strong><p>${esc(humanize(example.medium))} · ${esc(humanize(example.interaction))}</p></div>
                  <p>${(example.visual_traits || []).map(humanize).map(esc).join(" · ")}</p>
                  <span>Open →</span>
                </a>`;
              })
              .join("")
          : '<p class="quiet">No curated Example demonstrates this Concept yet.</p>'
      }</div>
    </section>
    <section class="concept-section implementation-path">
      <div class="section-heading"><p class="eyebrow">RESOURCES & TOOLS</p></div>
      <div class="implementation-grid">
        <div><h3>Resources</h3>${
          resources.length
            ? resources
                .map(
                  (resource) =>
                    `<a class="implementation-link" href="#resource/${resource.record.id}"><strong>${esc(resource.record.title)}</strong><span>${esc(resource.record.mechanism?.summary || resource.record.summary || "")}</span><em>Open →</em></a>`,
                )
                .join("")
            : '<p class="quiet">—</p>'
        }</div>
        <div><h3>Tools</h3>${
          toolIds.length
            ? toolIds
                .map(
                  (toolId) =>
                    `<a class="implementation-link" href="#record/${toolId}"><strong>${esc(indexMap.get(toolId)?.title || humanize(toolId))}</strong><span>${esc(toolId)}</span><em>Open →</em></a>`,
                )
                .join("")
            : '<p class="quiet">—</p>'
        }</div>
      </div>
    </section>
    <section class="concept-section"><p class="eyebrow">RELATED CONCEPTS</p><div class="concept-pills">${
      relatedConceptIds.length
        ? relatedConceptIds
            .map(
              (conceptId) =>
                `<a href="#concept/${conceptId}">${esc(conceptIndex.get(conceptId)?.title || humanize(conceptId))}</a>`,
            )
            .join("")
        : '<span class="quiet">No adjacent Concept is currently recorded.</span>'
    }</div></section>
    <details id="provenance"><summary>Concept provenance</summary><div class="details-body"><h3>Sources</h3>${resolved.sources.map((source) => `<p>${sourceLabel(source)}<br>${esc(source.check_scope || "")}</p>`).join("")}</div></details>
  </article>`;
}

async function resourceDetail(id, version) {
  const resolved = await resolveById(id);
  if (version !== routeVersion) return;
  if (resolved.record.type !== "Resource") throw new Error("Not a Resource");
  const record = resolved.record;
  const demo = resourceDemoPath(record);
  const related = (record.related || [])
    .map((exampleId) => examples.get(exampleId))
    .filter(Boolean);

  main.innerHTML = `<article class="resource-detail">
    <a class="back" href="#dictionary">← Dictionary</a>
    <header class="resource-hero">
      <div><p class="eyebrow">RESOURCE</p><h1>${esc(record.title)}</h1><p class="intro">${esc(record.summary || record.selection_reason || "")}</p><span class="data-id">${record.id}</span></div>
      <span class="resource-status">AIDRB implementation · ${esc(record.status)}</span>
    </header>
    <section class="resource-demo-section">
      <div class="resource-demo-label"><p class="eyebrow">DEMO</p>${demo ? `<a href="${esc(demo)}" target="_blank" rel="noreferrer">Open ↗</a>` : ""}</div>
      ${
        demo
          ? `<iframe class="resource-demo" title="${esc(record.title)} runnable Resource demo" src="${esc(demo)}" sandbox="allow-scripts allow-same-origin"></iframe>`
          : '<div class="resource-demo-missing">No runnable HTML demo is declared for this Resource.</div>'
      }
    </section>
    <section class="resource-mechanism">
      <div><p class="eyebrow">MECHANISM</p><h2>${esc(record.mechanism?.summary || record.summary || "")}</h2></div>
      <div class="mechanism-spec"><div><h3>Primitives</h3>${list(record.mechanism?.primitives || [])}</div><div><h3>States</h3>${list(record.mechanism?.states || [])}</div><div><h3>Parameters</h3>${list(record.mechanism?.parameters || [])}</div><div><h3>Failure modes</h3>${list(record.mechanism?.failure_modes || [])}</div></div>
    </section>
    <section class="detail-section">
      <div class="section-heading"><p class="eyebrow">REFERENCES</p><span>${related.length}</span></div>
      <div class="compact-example-list">${related.length ? related.map(compactExample).join("") : '<p class="quiet">No related Example is declared.</p>'}</div>
    </section>
    <section class="detail-section"><p class="eyebrow">ARTIFACTS</p><div class="artifact-list">${(record.artifacts || []).map((artifact) => `<div><strong>${esc(artifact.kind)}</strong><span>${esc(artifact.path)}</span><p>${esc(artifact.purpose || "")}</p></div>`).join("")}</div></section>
    <details id="resource-provenance"><summary>Rights, fidelity & provenance</summary><div class="details-body"><h3>Rights</h3><p>${esc(record.rights?.basis || "")}</p><p>${esc(record.rights?.license || "")} · source assets stored: ${record.rights?.source_assets_stored ? "yes" : "no"}</p><h3>Fidelity</h3>${list(record.fidelity || [])}<h3>Sources</h3>${resolved.sources.map((source) => `<p>${sourceLabel(source)}<br>${esc(source.check_scope || "")}</p>`).join("")}</div></details>
  </article>`;
}

async function index(version) {
  main.innerHTML =
    heading("Index") +
    '<div class="filters index-filters"><label>Search name or stable ID<input id="index-search" type="search" placeholder="Name or stable ID"></label><label>Entity type<select id="entity-type"><option value="">All types</option>' +
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
      .map((type) => `<option>${type}</option>`)
      .join("") +
    '</select></label></div><table class="index-table"><thead><tr><th>Type</th><th>Name</th><th>Stable ID</th></tr></thead><tbody id="index-results"></tbody></table>';
  const records = await indexRecords();
  if (version !== routeVersion) return;
  const render = () => {
    const query = document.getElementById("index-search").value.toLowerCase();
    const kind = document.getElementById("entity-type").value;
    document.getElementById("index-results").innerHTML = records
      .filter(
        (record) =>
          (!kind || record.type === kind) &&
          `${record.id} ${record.title}`.toLowerCase().includes(query),
      )
      .map((record) => {
        const route =
          record.type === "Example"
            ? "example"
            : record.type === "Concept"
              ? "concept"
              : record.type === "Resource"
                ? "resource"
                : "record";
        return `<tr><td>${esc(record.type)}</td><td><a href="#${route}/${record.id}">${esc(record.title)}</a></td><td class="data-id">${esc(record.id)}</td></tr>`;
      })
      .join("");
  };
  main
    .querySelectorAll("input,select")
    .forEach((input) => input.addEventListener("input", render));
  render();
}

async function record(id, version) {
  if (!/^[a-z]+:[a-z0-9-]+$/.test(id)) throw new Error("Invalid stable ID");
  const resolved = await resolveById(id);
  if (version !== routeVersion) return;
  const record = resolved.record;
  if (record.type === "Concept") return conceptDetail(id, version);
  if (record.type === "Resource") return resourceDetail(id, version);
  if (record.type === "Example") return detail(id, version);

  const visibleFields = Object.entries(record).filter(
    ([key, value]) =>
      !["type", "title", "summary", "canonical_path"].includes(key) &&
      value !== null &&
      value !== "" &&
      !Array.isArray(value) &&
      typeof value !== "object",
  );
  main.innerHTML = `<article class="record">
    <a class="back" href="#index">← Index</a>
    <p class="eyebrow">${esc(record.type)}</p>
    <h1>${esc(record.title)}</h1>
    <p class="intro">${esc(record.summary || record.scope || record.check_scope || "")}</p>
    <p class="data-id">${esc(record.id)}</p>
    <dl class="record-fields">${visibleFields.map(([key, value]) => `<div><dt>${esc(humanize(key))}</dt><dd>${esc(value)}</dd></div>`).join("")}</dl>
    ${resolved.sources?.length ? `<details><summary>Provenance</summary><div class="details-body">${resolved.sources.map((source) => `<p>${sourceLabel(source)}<br>${esc(source.check_scope || "")}</p>`).join("")}</div></details>` : ""}
  </article>`;
}

async function route() {
  const version = ++routeVersion;
  const [rawView, id] = location.hash.slice(1).split("/");
  const view = rawView || "atlas";
  document.querySelectorAll("nav a").forEach((anchor) => {
    const current =
      anchor.hash === `#${view}` ||
      (view === "example" &&
        anchor.hash ===
          (examples.get(id)?.subject_id ? "#atlas" : "#explore")) ||
      (view === "concept" && anchor.hash === "#dictionary");
    if (current) anchor.setAttribute("aria-current", "page");
    else anchor.removeAttribute("aria-current");
  });

  try {
    if (view === "atlas" || view === "") atlas(id);
    else if (view === "explore") await explore(version);
    else if (view === "example") await detail(id, version);
    else if (view === "dictionary") await dictionary(version);
    else if (view === "concept") await conceptDetail(id, version);
    else if (view === "resource") await resourceDetail(id, version);
    else if (view === "index") await index(version);
    else if (view === "record") await record(id, version);
    else throw new Error("Unknown page");

    if (version === routeVersion) {
      const title =
        view === "example"
          ? examples.get(id)?.title || "Example"
          : view === "atlas"
            ? id
              ? topics.get(id)?.title || "Knowledge Atlas"
              : "Creative Atlas"
            : view === "concept" || view === "resource"
              ? humanize(id)
              : view[0].toUpperCase() + view.slice(1);
      document.title = `AIDRB — ${title}`;
      window.scrollTo(0, 0);
    }
  } catch (error) {
    if (version === routeVersion) {
      main.innerHTML = `<h1>Unable to open this view.</h1><p>${esc(error.message)}</p><a href="#atlas">Return to Atlas</a>`;
    }
  }
}

window.addEventListener("hashchange", route);
route();