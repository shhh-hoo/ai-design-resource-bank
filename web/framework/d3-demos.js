import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
} from "d3-force";

const INK = "#111";
const MUTED = "#bdbdb7";
const ACCENT = "#e84a2a";

function computeLayout(mode) {
  const nodes = [
    { id: "A", level: 0, column: 0 },
    { id: "B", level: 1, column: -1 },
    { id: "C", level: 1, column: 1 },
    { id: "D", level: 2, column: -1.4 },
    { id: "E", level: 2, column: 0 },
    { id: "F", level: 2, column: 1.4 },
  ];
  const links = [
    { source: "A", target: "B" },
    { source: "A", target: "C" },
    { source: "B", target: "D" },
    { source: "B", target: "E" },
    { source: "C", target: "E" },
    { source: "C", target: "F" },
  ];

  const simulation = forceSimulation(nodes)
    .force("link", forceLink(links).id((d) => d.id).distance(mode === "network" ? 86 : 70).strength(0.9))
    .force("charge", forceManyBody().strength(mode === "network" ? -190 : -90))
    .force("collide", forceCollide(24))
    .stop();

  if (mode === "network") {
    simulation.force("center", forceCenter(280, 125));
  } else {
    simulation
      .force("x", forceX((d) => 280 + d.column * 100).strength(0.95))
      .force("y", forceY((d) => 48 + d.level * 82).strength(1));
  }

  simulation.tick(220);
  simulation.stop();

  return {
    nodes: nodes.map((node) => ({ id: node.id, x: node.x, y: node.y })),
    links: links.map((link) => ({ source: link.source.id, target: link.target.id })),
  };
}

export function graphRelayout(host) {
  const network = computeLayout("network");
  const hierarchy = computeLayout("hierarchy");
  const ids = network.nodes.map((node) => node.id);
  const linkPairs = network.links;

  host.innerHTML = `
    <div class="framework-stage" data-framework-stage>
      <svg data-graph viewBox="0 0 560 250" role="img" aria-label="D3 force graph re-layout preserving node identity"></svg>
      <span class="framework-badge">D3 force</span>
    </div>
    <div class="demo-controls">
      <button class="demo-button" data-toggle type="button">Change layout</button>
      <span class="demo-readout" data-readout>network</span>
    </div>`;

  const svg = host.querySelector("[data-graph]");
  svg.innerHTML = `
    <g data-links>${linkPairs.map((_, index) => `<line data-link="${index}" stroke="${MUTED}" stroke-width="1.5"/>`).join("")}</g>
    <g data-nodes>${ids.map((id, index) => `
      <g data-node="${id}">
        <circle r="16" fill="${index === 0 ? ACCENT : "#fff"}" stroke="${INK}" stroke-width="1.5"/>
        <text text-anchor="middle" y="4" font-size="9" fill="${INK}" font-family="ui-monospace, monospace">${id}</text>
      </g>`).join("")}</g>`;

  const nodeEls = new Map(ids.map((id) => [id, svg.querySelector(`[data-node="${id}"]`)]));
  const linkEls = Array.from(svg.querySelectorAll("[data-link]"));
  const button = host.querySelector("[data-toggle]");
  const readout = host.querySelector("[data-readout]");
  let current = network;
  let raf = 0;

  const positions = (layout) => new Map(layout.nodes.map((node) => [node.id, node]));

  const draw = (layout) => {
    const pos = positions(layout);
    ids.forEach((id) => {
      const node = pos.get(id);
      nodeEls.get(id).setAttribute("transform", `translate(${node.x.toFixed(2)} ${node.y.toFixed(2)})`);
    });
    linkPairs.forEach((link, index) => {
      const source = pos.get(link.source);
      const target = pos.get(link.target);
      const edge = linkEls[index];
      edge.setAttribute("x1", source.x);
      edge.setAttribute("y1", source.y);
      edge.setAttribute("x2", target.x);
      edge.setAttribute("y2", target.y);
    });
  };

  const animate = (from, to) => {
    cancelAnimationFrame(raf);
    const fromPos = positions(from);
    const toPos = positions(to);
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      draw(to);
      return;
    }
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / 520);
      const eased = 1 - Math.pow(1 - t, 3);
      const frame = {
        nodes: ids.map((id) => {
          const a = fromPos.get(id);
          const b = toPos.get(id);
          return {
            id,
            x: a.x + (b.x - a.x) * eased,
            y: a.y + (b.y - a.y) * eased,
          };
        }),
        links: linkPairs,
      };
      draw(frame);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };

  const toggle = () => {
    const next = current === network ? hierarchy : network;
    animate(current, next);
    current = next;
    readout.textContent = current === network ? "network" : "hierarchy";
  };

  button.addEventListener("click", toggle);
  draw(network);

  return () => {
    cancelAnimationFrame(raf);
    button.removeEventListener("click", toggle);
  };
}
