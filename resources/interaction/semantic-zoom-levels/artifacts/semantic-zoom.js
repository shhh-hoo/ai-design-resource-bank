function normalize(levels) {
  if (!Array.isArray(levels) || !levels.length) throw new TypeError("levels must be a non-empty array");
  const sorted = [...levels].sort((a, b) => a.minScale - b.minScale);
  if (sorted.some((level, index) => !level.id || !Number.isFinite(level.minScale) || (index && level.minScale === sorted[index - 1].minScale))) {
    throw new TypeError("levels need unique ids and finite unique minScale values");
  }
  return sorted;
}

export function levelForScale(levels, scale) {
  if (!Number.isFinite(scale)) throw new TypeError("scale must be finite");
  const sorted = normalize(levels);
  let active = sorted[0];
  for (const level of sorted) if (scale >= level.minScale) active = level;
  return active;
}

export function createSemanticZoom(levels, { hysteresis = 0 } = {}) {
  const sorted = normalize(levels);
  if (!Number.isFinite(hysteresis) || hysteresis < 0) throw new TypeError("hysteresis must be a non-negative number");
  let current = null;

  return {
    select(scale) {
      if (!Number.isFinite(scale)) throw new TypeError("scale must be finite");
      const candidate = levelForScale(sorted, scale);
      if (!current) return (current = candidate);
      const currentIndex = sorted.findIndex((level) => level.id === current.id);
      const candidateIndex = sorted.findIndex((level) => level.id === candidate.id);
      if (candidateIndex > currentIndex && scale < candidate.minScale + hysteresis) return current;
      if (candidateIndex < currentIndex && scale >= current.minScale - hysteresis) return current;
      current = candidate;
      return current;
    },
    reset() {
      current = null;
    },
  };
}
