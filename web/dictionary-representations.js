(() => {
  const representationById = new Map();

  async function loadYaml(path) {
    if (!window.jsyaml) throw new Error("The YAML parser did not load.");
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    return window.jsyaml.load(await response.text()) || {};
  }

  function humanize(value = "") {
    return value.split("-").map((part) => part ? part[0].toUpperCase() + part.slice(1) : part).join(" ");
  }

  function termIdForDrawer() {
    const title = document.getElementById("dictDrawerTitle")?.textContent?.trim();
    if (!title) return null;
    const cards = Array.from(document.querySelectorAll(".dict-card[data-term]"));
    const card = cards.find((item) => item.querySelector(".dict-card-title")?.textContent?.trim() === title);
    return card?.dataset.term || null;
  }

  function applyStudy(host, representation, detail = false) {
    const study = representation?.study;
    if (!host || study?.status !== "available" || !study.asset) return false;
    if (host.dataset.studyAsset === study.asset) return true;

    host.replaceChildren();
    host.classList.add("is-generated-study");
    host.dataset.studyAsset = study.asset;
    host.dataset.label = study.label || "GENERATED STUDY";

    const image = document.createElement("img");
    image.src = study.asset;
    image.alt = study.alt || `Generated teaching study for ${representation.id}`;
    image.decoding = "async";
    image.loading = detail ? "eager" : "lazy";
    host.append(image);
    return true;
  }

  function decorateCards() {
    document.querySelectorAll(".dict-card[data-term]").forEach((card) => {
      const representation = representationById.get(card.dataset.term);
      if (!representation) return;
      card.dataset.learningMedium = representation.preferred;
      const preview = card.querySelector(".dict-preview");
      if (preview && !preview.dataset.label) preview.dataset.label = "MNEMONIC";
      applyStudy(preview, representation, false);
    });
  }

  function decorateDrawer() {
    const content = document.getElementById("dictDrawerContent");
    if (!content?.children.length) return;
    const id = termIdForDrawer();
    const representation = representationById.get(id);
    if (!representation) return;

    const preview = content.querySelector(".dict-detail-preview");
    if (preview && !preview.dataset.label) preview.dataset.label = "MNEMONIC";
    applyStudy(preview, representation, true);

    const wrapper = content.firstElementChild;
    if (!wrapper || wrapper.querySelector("[data-representation-note]")) return;

    const section = document.createElement("section");
    section.className = "dict-detail-section dict-representation-note";
    section.dataset.representationNote = "true";

    const heading = document.createElement("h3");
    heading.textContent = "Best learned as";

    const medium = document.createElement("p");
    medium.className = "dict-representation-medium";
    medium.textContent = humanize(representation.preferred);

    const rationale = document.createElement("p");
    rationale.className = "dict-representation-rationale";
    rationale.textContent = representation.rationale;

    section.append(heading, medium, rationale);

    const classification = Array.from(wrapper.querySelectorAll(".dict-detail-section"))
      .find((item) => item.querySelector("h3")?.textContent === "Classification");
    if (classification) wrapper.insertBefore(section, classification);
    else wrapper.append(section);
  }

  function bindObservers() {
    const grid = document.getElementById("dictGrid");
    const drawer = document.getElementById("dictDrawerContent");
    if (grid) new MutationObserver(decorateCards).observe(grid, { childList: true });
    if (drawer) new MutationObserver(decorateDrawer).observe(drawer, { childList: true });
  }

  async function init() {
    try {
      const registry = await loadYaml("./dictionary/index.yaml");
      const sources = Array.isArray(registry.representations)
        ? registry.representations
        : registry.representations ? [registry.representations] : [];
      if (!sources.length) return;

      const docs = await Promise.all(sources.map(loadYaml));
      docs.forEach((data) => {
        (data.representations || []).forEach((item) => {
          if (representationById.has(item.id)) throw new Error(`duplicate representation id: ${item.id}`);
          representationById.set(item.id, item);
        });
      });

      window.DesignDictionaryRepresentations = { get: (id) => representationById.get(id) || null };
      bindObservers();
      decorateCards();
      decorateDrawer();
    } catch (error) {
      console.warn("Dictionary representation routing unavailable", error);
    }
  }

  init();
})();
