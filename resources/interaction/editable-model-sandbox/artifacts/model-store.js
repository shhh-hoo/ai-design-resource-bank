const clone = (value) =>
  typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));

export function createModelStore(initial, { derive = (state) => state, validate = () => [] } = {}) {
  const baseline = clone(initial);
  let state = clone(initial);
  const listeners = new Set();

  const snapshot = () => {
    const current = clone(state);
    return {
      state: current,
      derived: derive(clone(current)),
      errors: [...validate(clone(current))],
    };
  };

  const publish = () => {
    const value = snapshot();
    for (const listener of listeners) listener(value);
    return value;
  };

  const set = (patch) => {
    const candidate = { ...state, ...clone(patch) };
    const errors = [...validate(clone(candidate))];
    if (errors.length) return { accepted: false, state: clone(state), errors };
    state = candidate;
    return { accepted: true, ...publish() };
  };

  return {
    get: snapshot,
    set,
    update(fn) {
      return set(fn(clone(state)));
    },
    reset() {
      state = clone(baseline);
      return publish();
    },
    subscribe(listener) {
      listeners.add(listener);
      listener(snapshot());
      return () => listeners.delete(listener);
    },
  };
}
