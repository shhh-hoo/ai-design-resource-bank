const text = (value) => String(value ?? "").trim();

export function filterArchive(items, query = "") {
  const q = text(query).toLocaleLowerCase();
  if (!q) return [...items];
  return items.filter((item) =>
    Object.values(item).some((value) => text(value).toLocaleLowerCase().includes(q)),
  );
}

export function groupArchive(items, groupBy = "year") {
  const groups = new Map();
  for (const item of items) {
    const key = text(item[groupBy]) || "Other";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => b.localeCompare(a, undefined, { numeric: true }))
    .map(([key, rows]) => [
      key,
      [...rows].sort((a, b) => text(a.title).localeCompare(text(b.title))),
    ]);
}

function cell(value, className) {
  const node = document.createElement("span");
  node.className = className;
  node.textContent = text(value);
  return node;
}

export function renderArchive(root, items, { groupBy = "year" } = {}) {
  root.replaceChildren();
  for (const [group, rows] of groupArchive(items, groupBy)) {
    const section = document.createElement("section");
    section.className = "archive-group";
    const heading = document.createElement("h2");
    heading.textContent = group;
    section.append(heading);
    for (const item of rows) {
      const row = document.createElement(item.href ? "a" : "div");
      row.className = "archive-row";
      if (item.href) row.href = item.href;
      row.append(
        cell(item.title, "archive-title"),
        cell(item.kind, "archive-kind"),
        cell(item.note, "archive-note"),
      );
      section.append(row);
    }
    root.append(section);
  }
}
