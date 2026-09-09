const nativeFetch = window.fetch.bind(window);
const startedAt = performance.now();

function syntheticResponse(body = "") {
  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

async function boot() {
  const dataUrl = new URL("../data/board.json", import.meta.url);
  const response = await nativeFetch(dataUrl, { cache: "force-cache" });
  if (!response.ok) throw new Error(`Board data: HTTP ${response.status}`);

  const data = await response.json();
  window.__BOARD_DATA__ = data;

  // Compatibility shim for the existing workbench extension. The public site no longer
  // downloads js-yaml or the mechanism YAML at runtime; both resolve from compiled JSON.
  window.jsyaml = {
    load() {
      return data.mechanisms;
    },
  };
  window.fetch = (input, init) => {
    const url = typeof input === "string" ? input : input?.url || String(input);
    if (url.includes("registries/frontend-mechanisms.yaml")) {
      return Promise.resolve(syntheticResponse());
    }
    return nativeFetch(input, init);
  };

  await import("./board.js");
  await import("./mechanism-workbench.js");

  document.documentElement.dataset.rbReady = "true";
  performance.measure("rb-boot", { start: startedAt, end: performance.now() });
}

boot().catch((error) => {
  console.error("Resource Bank failed to boot", error);
  const errorPanel = document.getElementById("loadError");
  const message = document.getElementById("loadErrorMessage");
  const explore = document.getElementById("exploreView");
  const index = document.getElementById("indexView");
  if (explore) explore.hidden = true;
  if (index) index.hidden = true;
  if (message) message.textContent = error instanceof Error ? error.message : String(error);
  if (errorPanel) errorPanel.hidden = false;
});
