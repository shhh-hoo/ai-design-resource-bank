const MEDIUM_GROUPS = {
  cinema: new Set(["title-sequence"]),
  editorial: new Set(["website"]),
  identity: new Set(["identity-system", "experiential-identity", "live-visual-system"]),
  spatial: new Set([
    "installation",
    "interactive-installation",
    "kinetic-installation",
    "audiovisual-installation",
    "digital-art-museum",
    "stage-performance",
    "concert-environment",
  ]),
  interactive: new Set([
    "interactive-essay",
    "interactive-explainer",
    "interactive-data-visualization",
    "interactive-geospatial-visualization",
    "audiovisual-instrument",
    "3d-website",
    "3d-data-visualization",
  ]),
};

export function presentationType(example) {
  if (example.kind === "GAP") return "gap";
  if (example.kind === "LIVE") return "live";
  const medium = example.medium || "";
  for (const [type, values] of Object.entries(MEDIUM_GROUPS)) {
    if (values.has(medium)) return type;
  }
  return "external";
}

export function creativeDomain(example) {
  if (example.subject_id) return "Academic / live studies";
  const type = presentationType(example);
  if (type === "editorial") return "Editorial / web";
  if (type === "cinema") return "Cinema / title";
  if (type === "identity") return "Identity / motion";
  if (type === "spatial") return "Spatial / stage";
  if (type === "interactive") return "Interactive / HCI";
  return "Other references";
}

export function presentationLabel(type) {
  return (
    {
      live: "Local live example",
      gap: "Coverage gap",
      editorial: "External editorial reference",
      cinema: "External moving-image reference",
      identity: "External identity reference",
      spatial: "External spatial reference",
      interactive: "External interactive reference",
      external: "External reference",
    }[type] || "External reference"
  );
}

export function resourceDemoPath(resource) {
  const demo = (resource.artifacts || []).find(
    (artifact) =>
      artifact.kind === "example" &&
      typeof artifact.path === "string" &&
      artifact.path.endsWith(".html"),
  );
  return demo && resource.package_path
    ? `${resource.package_path}/${demo.path}`
    : null;
}

export function humanize(value) {
  return String(value || "")
    .replace(/^[a-z]+:/, "")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
