(() => {
  const assetsById = new Map();

  async function loadYaml(path) {
    if (!window.jsyaml) throw new Error("The YAML parser did not load.");
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    return window.jsyaml.load(await response.text()) || {};
  }

  function termIdForDrawer() {
    const title = document.getElementById("dictDrawerTitle")?.textContent?.trim();
    if (!title) return null;
    const card = Array.from(document.querySelectorAll(".dict-card[data-term]"))
      .find((item) => item.querySelector(".dict-card-title")?.textContent?.trim() === title);
    return card?.dataset.term || null;
  }

  function applyAsset(host, asset, detail = false) {
    if (!host || asset?.status !== "available" || !asset.asset) return;
    if (host.dataset.studyAsset === asset.asset) return;

    host.replaceChildren();
    host.classList.add("is-generated-study");
    host.dataset.studyAsset = asset.asset;
    host.dataset.label = asset.label || "GENERATED STUDY";

    const image = document.createElement("img");
    image.src = asset.asset;
    image.alt = asset.alt || `Generated teaching study for ${asset.id}`;
    image.decoding = "async";
    image.loading = detail ? "eager" : "lazy";
    host.append(image);
  }

  function decorateCards() {
    document.querySelectorAll(".dict-card[data-term]").forEach((card) => {
      const asset = assetsById.get(card.dataset.term);
      if (asset) applyAsset(card.querySelector(".dict-preview"), asset, false);
    });
  }

  function decorateDrawer() {
    const id = termIdForDrawer();
    const asset = assetsById.get(id);
    if (!asset) return;
    applyAsset(document.querySelector("#dictDrawerContent .dict-detail-preview"), asset, true);
  }

  async function init() {
    try {
      const data = await loadYaml("./dictionary/artifacts/manifest.yaml");
      (data.assets || []).forEach((asset) => assetsById.set(asset.id, asset));

      const grid = document.getElementById("dictGrid");
      const drawer = document.getElementById("dictDrawerContent");
      if (grid) new MutationObserver(decorateCards).observe(grid, { childList: true });
      if (drawer) new MutationObserver(decorateDrawer).observe(drawer, { childList: true });

      decorateCards();
      decorateDrawer();
    } catch (error) {
      console.warn("Dictionary generated-study assets unavailable", error);
    }
  }

  init();
})();
