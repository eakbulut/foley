import { test } from "node:test";
import assert from "node:assert/strict";
import { set, get, getSpec, getSet, cues } from "../src/foley.js";

function reset() { set({ theme: "default" }); }

test("a sound set applies per-cue overrides without touching other cues", () => {
  const custom = getSpec("tick");
  custom[0].f = 3333;
  set({ theme: { name: "Acme", cues: { tick: custom } } });
  assert.equal(getSpec("tick")[0].f, 3333);
  assert.notEqual(getSpec("pop")[0].f, 3333);
  assert.equal(get().theme, "Acme");
  reset();
});

test("getSet round-trips through set() and returns isolated copies", () => {
  const custom = getSpec("chime");
  custom[0].f = 777;
  set({ theme: { name: "Brand", transform: { pitch: 0.9 }, cues: { chime: custom } } });
  const snap = getSet();
  assert.equal(snap.name, "Brand");
  assert.equal(snap.transform.pitch, 0.9);
  assert.equal(snap.cues.chime[0].f, 777);
  snap.cues.chime[0].f = 1; /* mutating the snapshot must not affect the engine */
  assert.equal(getSpec("chime")[0].f, 777);
  set({ theme: getSet() }); /* feeding a snapshot back is lossless */
  assert.equal(get().theme, "Brand");
  assert.equal(getSpec("chime")[0].f, 777);
  reset();
});

test("assigning any named theme clears the whole identity, overrides included", () => {
  const custom = getSpec("tap");
  custom[0].f = 999;
  set({ theme: { cues: { tap: custom } } });
  assert.equal(getSpec("tap")[0].f, 999);
  set({ theme: "soft" });
  assert.notEqual(getSpec("tap")[0].f, 999);
  assert.equal(Object.keys(getSet().cues).length, 0);
  reset();
});

test("legacy plain transform objects still work and carry no overrides", () => {
  set({ theme: { pitch: 0.8, decay: 1.2 } });
  assert.equal(get().theme, "custom");
  assert.equal(Object.keys(getSet().cues).length, 0);
  assert.equal(getSet().transform.pitch, 0.8);
  reset();
});

test("invalid override targets and empty specs are dropped; names are bounded", () => {
  const ok = getSpec("on");
  set({ theme: { name: "  " + "x".repeat(80), cues: { on: ok, "not-a-cue": ok, hover: [], press: "garbage" } } });
  const snap = getSet();
  assert.deepEqual(Object.keys(snap.cues), ["on"]);
  assert.ok(get().theme.length <= 40);
  reset();
});

test("every override target in a full-coverage set is honored", () => {
  const all = {};
  for (const n of Object.keys(cues)) all[n] = getSpec(n);
  set({ theme: { name: "Everything", cues: all } });
  assert.equal(Object.keys(getSet().cues).length, 28);
  reset();
});
