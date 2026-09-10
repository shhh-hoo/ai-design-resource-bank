import { frame, escape } from "./visuals.js";
import { pressure, concentration, gibbs, hess, titrationPH } from "./models.js";
import {
  profile,
  profileState,
} from "../resources/chemistry/reaction-profile/artifacts/profile.js";
export function mountLive(host, key, title) {
  const settings = {
    reaction: [0, 100, 50, "Reaction coordinate", "%"],
    gas: [5, 50, 25, "Volume", "L"],
    kinetics: [0, 60, 10, "Time", "s"],
    gibbs: [200, 600, 400, "Temperature", "K"],
    titration: [0, 50, 25, "NaOH added", "mL"],
    hess: [0, 1, 0, "Route", ""],
  };
  const [min, max, value, label, unit] = settings[key];
  host.innerHTML = `<div class="live-visual"></div><div class="controls"><label for="parameter">${label} <span data-value></span></label><input id="parameter" type="range" min="${min}" max="${max}" step="${key === "titration" ? 0.1 : 1}" value="${value}"><output aria-live="polite"></output></div>`;
  const input = host.querySelector("input"),
    stage = host.querySelector(".live-visual"),
    output = host.querySelector("output");
  const update = () => {
    const v = Number(input.value);
    host.querySelector("[data-value]").textContent = `${v} ${unit}`;
    let f,
      xmax,
      ymin,
      ymax,
      ylabel,
      xlabel,
      readout,
      markerX,
      markerY,
      extra = "";
    if (key === "hess") {
      stage.innerHTML = frame(
        `<text x="38" y="70" font-size="20">C(s) + O₂(g)</text><text x="355" y="70" font-size="20">CO(g) + ½O₂(g)</text><path d="M120 95 L300 215 L475 95" stroke="${v ? "#b74c2c" : "#aaa"}"/><path d="M120 95 H475" stroke="${v ? "#aaa" : "#b74c2c"}" stroke-width="4"/><text x="218" y="246" font-size="24">CO₂(g)</text><text x="76" y="176" font-size="15">−393.5</text><text x="425" y="176" font-size="15">+283.0</text><text x="209" y="305" font-size="17">kJ mol⁻¹ · reverse CO combustion</text>`,
        title,
      );
      output.textContent = `${v ? "Indirect route: −393.5 + 283.0" : "Direct route"} = ${hess().toFixed(1)} kJ mol⁻¹. Add ½O₂ on C→CO₂ route after C→CO; cancel equal O₂ terms.`;
      return;
    }
    if (key === "reaction") {
      f = profile;
      xmax = 1;
      ymin = -40;
      ymax = 110;
      ylabel = "Enthalpy / kJ mol⁻¹";
      xlabel = "Reaction coordinate (not time)";
      markerX = v / 100;
      const s = profileState(markerX);
      readout = `${s.label} · H = ${s.energy.toFixed(1)} kJ mol⁻¹ · Eₐ = 70 · ΔH = −40`;
      extra =
        '<text x="340" y="55" font-size="16">Illustrative single-step profile</text>';
    }
    if (key === "gas") {
      f = pressure;
      xmax = 50;
      ymin = 0;
      ymax = 5.5;
      ylabel = "Pressure / atm";
      xlabel = "Volume / L";
      markerX = v;
      readout = `P = ${f(v).toFixed(3)} atm · PV = 24.6 L atm · fixed amount and temperature`;
    }
    if (key === "kinetics") {
      f = concentration;
      xmax = 60;
      ymin = 0;
      ymax = 1.1;
      ylabel = "[A] / mol L⁻¹";
      xlabel = "Time / s";
      markerX = v;
      readout = `[A] = ${f(v).toFixed(4)} mol L⁻¹ · k = 0.100 s⁻¹ · t½ = 6.93 s`;
    }
    if (key === "gibbs") {
      f = gibbs;
      xmax = 600;
      ymin = -25;
      ymax = 45;
      ylabel = "ΔG / kJ mol⁻¹";
      xlabel = "Temperature / K";
      markerX = v;
      readout = `ΔG = ${f(v).toFixed(1)} kJ mol⁻¹ · ΔH = 40 kJ mol⁻¹ · ΔS = 100 J mol⁻¹ K⁻¹`;
    }
    if (key === "titration") {
      f = titrationPH;
      xmax = 50;
      ymin = 0;
      ymax = 14;
      ylabel = "pH";
      xlabel = "0.100 M NaOH added / mL";
      markerX = v;
      readout = `pH = ${f(v).toFixed(2)} · 25.0 mL 0.100 M HCl · 25 °C · equivalence at 25.0 mL`;
    }
    const xmin = key === "gas" ? 5 : key === "gibbs" ? 200 : 0;
    const px = (x) => 75 + ((x - xmin) / (xmax - xmin)) * 455,
      py = (y) => 260 - ((y - ymin) / (ymax - ymin)) * 205;
    const points = Array.from({ length: 401 }, (_, i) => {
      const x = xmin + ((xmax - xmin) * i) / 400;
      return `${i ? "L" : "M"}${px(x)},${py(f(x))}`;
    }).join(" ");
    markerY = f(markerX);
    if (key === "reaction")
      extra += `<text x="80" y="${py(20) + 24}" font-size="13">Reactants</text><text x="450" y="${py(-20) + 20}" font-size="13">Products</text><path d="M380 ${py(90)} V${py(20)} M375 ${py(90)} H385 M375 ${py(20)} H385" stroke-dasharray="4 3"/><text x="392" y="${py(55)}" font-size="14">Eₐ = 70</text><path d="M550 ${py(20)} V${py(-20)}"/><text x="493" y="${py(0)}" font-size="12">ΔH −40</text>`;
    const ticks = (
      key === "reaction"
        ? [-20, 20, 90]
        : Array.from({ length: 5 }, (_, i) => ymin + ((ymax - ymin) * i) / 4)
    )
      .map((y) => {
        return `<text x="21" y="${py(y) + 5}" font-size="12">${y.toFixed(key === "gas" || key === "kinetics" ? 1 : 0)}</text>`;
      })
      .join("");
    stage.innerHTML = frame(
      `<path d="M75 45 V260 H540"/>${ticks}<text x="75" y="25" font-size="14">${escape(ylabel)}</text><text x="260" y="310" font-size="14">${escape(xlabel)}</text><text x="70" y="282" font-size="12">${xmin}</text><text x="514" y="282" font-size="12">${xmax}</text><path d="${points}" class="accent" stroke-width="3"/><circle data-marker cx="${px(markerX)}" cy="${py(markerY)}" r="7" class="accent-fill"/>${extra}`,
      title,
    );
    output.textContent = readout;
  };
  input.addEventListener("input", update);
  update();
}
