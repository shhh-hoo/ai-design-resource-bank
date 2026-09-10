import test from "node:test";
import assert from "node:assert/strict";
import {
  profile,
  profileState,
} from "../resources/chemistry/reaction-profile/artifacts/profile.js";
import {
  pressure,
  concentration,
  gibbs,
  hess,
  titrationPH,
} from "../app/models.js";
test("Reaction endpoints, unique maximum, signs and exact transition state", () => {
  assert.equal(profile(0), 20);
  assert.equal(profile(1), -20);
  assert.equal(profile(0.5), 90);
  assert.equal(profileState(0.49).label, "Reaction path");
  assert.equal(profileState(0.5).label, "Transition state");
  for (let i = 1; i < 50; i++) {
    assert.ok(profile(i / 100) > profile((i - 1) / 100));
    assert.ok(profile(0.5 + i / 100) < profile(0.5 + (i - 1) / 100));
  }
  assert.throws(() => profile(-1), RangeError);
  assert.throws(() => profile(NaN), RangeError);
});
test("Boyle invariant and first order half life", () => {
  for (const v of [5, 15, 50])
    assert.ok(Math.abs(pressure(v) * v - 24.6) < 1e-10);
  assert.ok(Math.abs(concentration(Math.log(2) / 0.1) - 0.5) < 1e-12);
});
test("Hess route closure and Gibbs crossover", () => {
  assert.equal(hess(), -110.5);
  assert.equal(gibbs(400), 0);
  assert.ok(gibbs(300) > 0);
  assert.ok(gibbs(500) < 0);
});
test("Titration dilution, water equilibrium and monotonicity", () => {
  assert.ok(Math.abs(titrationPH(0) - 1) < 1e-8);
  assert.ok(Math.abs(titrationPH(25) - 7) < 1e-8);
  assert.ok(Math.abs(titrationPH(50) - 12.522878745) < 1e-8);
  for (let i = 1; i <= 500; i++)
    assert.ok(titrationPH(i / 10) > titrationPH((i - 1) / 10));
});
