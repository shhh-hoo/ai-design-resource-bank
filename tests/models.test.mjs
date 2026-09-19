import { groupArchive, filterArchive } from "../resources/layout/archive-as-interface/artifacts/archive-index.js";
import { createModelStore } from "../resources/interaction/editable-model-sandbox/artifacts/model-store.js";
import { inspectKernel } from "../resources/interaction/linked-computation-inspector/artifacts/linked-inspector.js";
import { createSemanticZoom, levelForScale } from "../resources/interaction/semantic-zoom-levels/artifacts/semantic-zoom.js";
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


test("Archive resource groups and filters without losing corpus structure", () => {
  const items=[
    {title:"B",year:2024,kind:"Study"},
    {title:"A",year:2025,kind:"Essay"},
    {title:"C",year:2025,kind:"Prototype"}
  ];
  assert.deepEqual(groupArchive(items).map(([year,rows])=>[year,rows.map(x=>x.title)]),[
    ["2025",["A","C"]],["2024",["B"]]
  ]);
  assert.deepEqual(filterArchive(items,"proto").map(x=>x.title),["C"]);
});

test("Editable model store keeps one accepted state across derived views", () => {
  const store=createModelStore({a:2,b:3},{
    validate:s=>s.a<0?["a must be non-negative"]:[],
    derive:s=>({sum:s.a+s.b})
  });
  assert.equal(store.get().derived.sum,5);
  assert.equal(store.set({a:4}).derived.sum,7);
  const rejected=store.set({a:-1});
  assert.equal(rejected.accepted,false);
  assert.equal(store.get().state.a,4);
  assert.equal(store.reset().derived.sum,5);
});

test("Linked computation inspector derives input products and output from one selection", () => {
  const grid=[[1,2,3],[4,5,6],[7,8,9]];
  const kernel=[[0,1,0],[1,-4,1],[0,1,0]];
  const result=inspectKernel(grid,kernel,1,1);
  assert.deepEqual(result.selection,{row:1,column:1});
  assert.deepEqual(result.input.neighborhood,grid);
  assert.equal(result.output,0);
  assert.throws(()=>inspectKernel(grid,kernel,5,5),RangeError);
});

test("Semantic zoom changes information levels with stable hysteresis", () => {
  const levels=[
    {id:"overview",minScale:0,fields:["title"]},
    {id:"context",minScale:1.5,fields:["title","context"]},
    {id:"detail",minScale:2.8,fields:["title","context","detail"]}
  ];
  assert.equal(levelForScale(levels,2).id,"context");
  const zoom=createSemanticZoom(levels,{hysteresis:0.1});
  assert.equal(zoom.select(1).id,"overview");
  assert.equal(zoom.select(1.55).id,"overview");
  assert.equal(zoom.select(1.61).id,"context");
  assert.equal(zoom.select(1.45).id,"context");
  assert.equal(zoom.select(1.39).id,"overview");
});
