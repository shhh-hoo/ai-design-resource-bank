// Original schematic previews. No curriculum or AI metadata is loaded by this module.
export const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const text = (x, y, s, size = 16) =>
  `<text x="${x}" y="${y}" font-size="${size}">${s}</text>`;
const line = (x, y, a, b, extra = "") =>
  `<line x1="${x}" y1="${y}" x2="${a}" y2="${b}" ${extra}/>`;
const path = (d, extra = "") => `<path d="${d}" fill="none" ${extra}/>`;
const circle = (x, y, r = 15, extra = "") =>
  `<circle cx="${x}" cy="${y}" r="${r}" ${extra}/>`;
export function frame(body, title = "Chemistry schematic") {
  return `<svg viewBox="0 0 600 320" role="img" aria-label="${escape(title)}" xmlns="http://www.w3.org/2000/svg"><g stroke="currentColor" stroke-width="2" fill="none">${body}</g></svg>`;
}
export function visual(key, title) {
  const axes = (label) =>
    line(65, 35, 65, 265) + line(65, 265, 550, 265) + text(75, 35, label, 14);
  let s = "";
  switch (key) {
    case "reaction":
      s =
        axes("Enthalpy") +
        path(
          "M85 190 C190 190 200 65 300 65 C400 65 415 230 535 230",
          'class="accent" stroke-width="4"',
        ) +
        text(80, 217, "Reactants") +
        text(435, 256, "Products") +
        text(270, 47, "‡", 24) +
        line(320, 70, 320, 190, 'stroke-dasharray="5 5"') +
        text(335, 137, "Eₐ") +
        text(400, 305, "Reaction coordinate →", 13);
      break;
    case "hess":
      s =
        text(42, 90, "C(s) + O₂(g)") +
        text(365, 90, "CO(g) + ½O₂(g)") +
        text(228, 250, "CO₂(g)") +
        line(220, 83, 347, 83) +
        text(264, 63, "ΔH?") +
        line(150, 108, 270, 215) +
        line(455, 108, 330, 215) +
        text(72, 177, "−393.5", 15) +
        text(407, 177, "−283.0", 15) +
        text(206, 294, "ΔH / kJ mol⁻¹", 14);
      break;
    case "gas":
      s =
        axes("P / atm") +
        path(
          "M110 62 C125 133 180 211 515 240",
          'class="accent" stroke-width="4"',
        ) +
        text(335, 105, "PV = constant", 23) +
        text(470, 298, "V / L", 14);
      break;
    case "kinetics":
      s =
        axes("[A] / mol L⁻¹") +
        path(
          "M80 65 C180 200 260 240 535 251",
          'class="accent" stroke-width="4"',
        ) +
        text(300, 98, "[A] = [A]₀e⁻ᵏᵗ", 23) +
        text(473, 300, "Time / s", 14);
      break;
    case "gibbs":
      s =
        axes("ΔG / kJ mol⁻¹") +
        line(65, 160, 545, 160, 'stroke-dasharray="5 5"') +
        line(100, 68, 510, 246, 'class="accent" stroke-width="4"') +
        text(345, 105, "ΔG = ΔH − TΔS", 19) +
        text(445, 298, "Temperature / K", 13);
      break;
    case "titration":
      s =
        axes("pH") +
        path(
          "M80 243 C290 240 298 230 303 150 C308 65 315 55 540 52",
          'class="accent" stroke-width="4"',
        ) +
        line(303, 40, 303, 265, 'stroke-dasharray="5 5"') +
        text(340, 171, "Equivalence", 16) +
        text(350, 197, "25.0 mL · pH 7", 16) +
        text(355, 300, "NaOH added / mL", 14);
      break;
    case "orbital-boxes":
      s = text(58, 65, "N", 44) + text(118, 62, "1s² 2s² 2p³", 25);
      [85, 220, 345, 410, 475].forEach((x, i) => {
        s +=
          `<rect x="${x}" y="130" width="54" height="60"/>` +
          text(x + 11, 171, i < 2 ? "↑↓" : "↑", 27);
      });
      s +=
        text(95, 221, "1s") +
        text(230, 221, "2s") +
        text(420, 221, "2p") +
        text(165, 275, "Hund’s rule · unpaired first", 17);
      break;
    case "isotopes":
      s =
        axes("Relative abundance") +
        line(230, 265, 230, 70, 'class="accent" stroke-width="14"') +
        line(420, 265, 420, 200, 'stroke-width="14"') +
        text(201, 296, "35") +
        text(397, 296, "37") +
        text(445, 90, "≈ 3 : 1", 24) +
        text(430, 319, "m/z", 12);
      break;
    case "water":
      s =
        line(295, 127, 155, 235, 'stroke-width="6"') +
        line(310, 128, 445, 235, 'stroke-width="6"') +
        text(280, 128, "O", 40) +
        text(112, 260, "H", 38) +
        text(448, 260, "H", 38) +
        path("M240 175 Q300 213 362 175") +
        text(265, 235, "104.5°", 18) +
        text(200, 62, "Bent molecular geometry", 17);
      break;
    case "lattice":
      for (let i = 0; i < 4; i++)
        for (let j = 0; j < 3; j++)
          s +=
            circle(
              160 + i * 90,
              70 + j * 80,
              27,
              `class="${(i + j) % 2 ? "accent" : "muted-fill"}"`,
            ) +
            text(143 + i * 90, 76 + j * 80, (i + j) % 2 ? "Cl⁻" : "Na⁺", 14);
      s += text(210, 306, "2D lattice slice", 16);
      break;
    case "stoichiometry":
      s =
        text(62, 98, "3 H₂  +  O₂", 30) +
        text(290, 158, "↓", 40) +
        text(270, 240, "2 H₂O + H₂", 30) +
        text(75, 282, "O₂ limits the reaction · H₂ remains", 17);
      break;
    case "moles":
      s =
        text(75, 132, "18.0 g", 30) +
        text(274, 132, "1.00 mol", 30) +
        text(112, 230, "≈ 6.02 × 10²³ molecules", 27) +
        line(196, 125, 260, 125) +
        line(340, 152, 340, 191) +
        text(177, 74, "Water · M = 18.0 g mol⁻¹", 18);
      break;
    case "hydrogen-bond":
      s =
        text(100, 172, "H—O—H", 30) +
        text(371, 172, "O—H", 30) +
        text(373, 115, "H", 28) +
        line(385, 127, 385, 144) +
        line(
          254,
          162,
          365,
          162,
          'class="accent" stroke-dasharray="5 5" stroke-width="4"',
        ) +
        text(163, 237, "Hydrogen bond · O···H", 20);
      break;
    case "catalyst":
      s =
        axes("Enthalpy") +
        path("M85 215 C180 215 190 60 290 60 C390 60 420 240 530 240") +
        path(
          "M85 215 C180 215 200 145 290 145 C390 145 420 240 530 240",
          'class="accent" stroke-width="4"',
        ) +
        text(330, 82, "Uncatalysed", 14) +
        text(190, 175, "Alternative pathway", 14) +
        text(338, 302, "Same ΔH · lower barrier", 15);
      break;
    case "equilibrium":
      s =
        axes("Reaction rate") +
        path("M85 60 C195 148 220 155 530 155") +
        path(
          "M85 252 C190 163 220 155 530 155",
          'class="accent" stroke-width="4"',
        ) +
        text(84, 56, "Forward", 14) +
        text(84, 234, "Reverse", 14) +
        text(365, 126, "Equal rates", 18) +
        text(475, 301, "Time", 14);
      break;
    case "haber":
      s =
        text(74, 107, "N₂ + 3 H₂ ⇌ 2 NH₃", 30) +
        text(124, 216, "Kc = [NH₃]² / ([N₂][H₂]³)", 27) +
        text(103, 275, "At a specified temperature", 17);
      break;
    case "acid-base":
      s =
        text(42, 130, "NH₃ + H₂O ⇌ NH₄⁺ + OH⁻", 28) +
        path("M93 149 Q228 240 367 149", 'class="accent"') +
        text(180, 251, "One proton apart", 19) +
        text(100, 70, "Base", 16) +
        text(355, 70, "Conjugate acid", 16);
      break;
    case "cell":
      s =
        path("M105 135 V252 H250 V135 M355 135 V252 H500 V135") +
        line(155, 175, 155, 72) +
        line(450, 175, 450, 72) +
        line(155, 72, 450, 72, 'class="accent"') +
        text(255, 57, "e⁻ →", 23) +
        text(124, 202, "Zn", 26) +
        text(415, 202, "Cu", 26) +
        path("M225 177 V113 H383 V177", 'stroke-width="8"') +
        text(237, 105, "Salt bridge", 14) +
        text(80, 288, "Anode (−)") +
        text(394, 288, "Cathode (+)");
      break;
    case "oxidation":
      s =
        text(230, 94, "MnO₄⁻", 43) +
        text(100, 190, "x + 4(−2) = −1", 31) +
        text(246, 258, "x = +7", 30);
      break;
    case "periodic":
      s =
        axes("First ionisation energy · qualitative") +
        path(
          "M98 240 L160 184 L222 213 L284 148 L346 100 L408 123 L470 72 L532 48",
          'class="accent" stroke-width="4"',
        );
      ["Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar"].forEach(
        (e, i) => (s += text(86 + i * 62, 297, e, 15)),
      );
      break;
    case "organic":
      s =
        text(80, 108, "CH₃–CH₂–OH", 31) +
        text(80, 161, "Alcohol", 18) +
        text(298, 233, "CH₃–COOH", 31) +
        text(298, 279, "Carboxylic acid", 18);
      break;
    case "chromatography":
      s =
        `<rect x="140" y="40" width="170" height="240"/>` +
        line(150, 242, 300, 242) +
        line(150, 70, 300, 70, 'stroke-dasharray="5 5"') +
        circle(225, 139, 9, 'class="accent-fill"') +
        line(339, 242, 339, 139) +
        line(385, 242, 385, 70) +
        text(408, 159, "Rf = 0.60", 24) +
        text(155, 305, "Baseline", 14) +
        text(154, 30, "Solvent front", 14);
      break;
    default:
      s = text(155, 165, "Preview unavailable", 24);
  }
  return frame(s, title);
}
