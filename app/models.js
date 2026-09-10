export const pressure = (v) => 24.6 / v; // P in atm, V in L; fixed nRT = 24.6 L atm.
export const concentration = (t, k = 0.1) => Math.exp(-k * t); // initial concentration 1 mol/L
export const gibbs = (t) => 40 - t * 0.1; // kJ/mol; ΔH=40 kJ/mol, ΔS=0.100 kJ/(mol K)
export const hess = () => -393.5 - -283.0; // kJ/mol, standard illustrative values
export function titrationPH(v) {
  const excess = (0.1 * 0.025 - (0.1 * v) / 1000) / (0.025 + v / 1000);
  // Stable solution of [H+] - Kw/[H+] = excess; includes water at equivalence.
  const root = Math.sqrt(excess * excess + 4e-14);
  const h = excess >= 0 ? (excess + root) / 2 : 2e-14 / (root - excess);
  return -Math.log10(h);
}
