// Original qualitative energy model. MIT. Coordinate is not time.
export function profile(t) {
  if (!Number.isFinite(t) || t < 0 || t > 1)
    throw new RangeError("Progress must be in [0, 1]");
  const smooth = (x) => x * x * (3 - 2 * x);
  return t <= 0.5 ? 20 + 70 * smooth(t * 2) : 90 - 110 * smooth((t - 0.5) * 2);
}
export function profileState(t) {
  const energy = profile(t);
  return {
    progress: t,
    energy,
    deltaH: -40,
    activationEnergy: 70,
    label:
      t === 0
        ? "Reactants"
        : t === 0.5
          ? "Transition state"
          : t === 1
            ? "Products"
            : "Reaction path",
  };
}
