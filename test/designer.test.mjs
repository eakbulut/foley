import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { cues, getSpec, normalizeSpec, playSpec } from "../src/foley.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/* ---------- specs: every built-in cue is valid, canonical data ---------- */

test("every cue has a spec that survives normalization unchanged", () => {
  for (const name of Object.keys(cues)) {
    const spec = getSpec(name);
    assert.ok(Array.isArray(spec) && spec.length > 0, name + " has no spec");
    const norm = normalizeSpec(spec);
    assert.equal(norm.length, spec.length, name + ": normalization dropped a layer");
    assert.equal(JSON.stringify(norm), JSON.stringify(spec),
      name + ": spec is not canonical (a param is out of range or misordered)");
  }
});

test("converted specs preserve the original synthesis parameters (spot checks)", () => {
  const on = getSpec("on");
  assert.equal(on[1].at, 0.07);
  assert.equal(on[1].f, 990);
  assert.equal(on[1].send, 0.15);

  const thock = getSpec("thock");
  assert.equal(thock[1].kind, "noise");
  assert.equal(thock[1].filter, "lowpass");
  assert.equal(thock[1].f, 900);

  const chime = getSpec("chime");
  assert.equal(chime.length, 4);
  assert.ok(Math.abs(chime[1].f - 880 * 2.76) < 0.01, "bell partial ratio lost");

  const complete = getSpec("complete");
  const cluster = complete[complete.length - 1];
  assert.equal(cluster.kind, "cluster");
  assert.equal(cluster.n, 4);
  assert.equal(cluster.seed, 7, "shimmer must be seeded for deterministic exports");

  const swoosh = getSpec("swoosh");
  assert.equal(swoosh[0].f2, 3400);
  assert.equal(swoosh[0].glide, 0.22);
});

test("getSpec returns isolated copies", () => {
  const a = getSpec("tick");
  a[0].f = 1;
  assert.notEqual(getSpec("tick")[0].f, 1);
});

test("getSpec of an unknown cue is null", () => {
  assert.equal(getSpec("not-a-cue"), null);
});

/* ---------- normalizeSpec: the safety net for imports and the URL hash ---------- */

test("normalizeSpec clamps out-of-range values", () => {
  const [t] = normalizeSpec([{ kind: "tone", f: 99999, peak: 5, d: -3, a: "x" }]);
  assert.equal(t.f, 8000);
  assert.equal(t.peak, 0.4);
  assert.equal(t.d, 0.005);
  assert.equal(t.a, 0.004); /* non-numeric falls back to the default */
});

test("normalizeSpec drops garbage and caps at 8 layers", () => {
  const twelve = Array.from({ length: 12 }, () => ({ kind: "tone", f: 440 }));
  assert.equal(normalizeSpec(twelve).length, 8);
  assert.equal(normalizeSpec([{ kind: "bogus" }, null, "x", 42]).length, 0);
  assert.equal(normalizeSpec("not an array").length, 0);
});

test("normalizeSpec keeps cluster fMax >= fMin", () => {
  const [c] = normalizeSpec([{ kind: "cluster", fMin: 3000, fMax: 100 }]);
  assert.ok(c.fMax >= c.fMin);
});

test("playSpec with empty or invalid input is a safe no-op", () => {
  assert.doesNotThrow(() => playSpec([]));
  assert.doesNotThrow(() => playSpec(null));
  assert.doesNotThrow(() => playSpec([{ kind: "bogus" }]));
});

/* ---------- the demo ships the designer ---------- */

test("demo page contains the designer section wired to the API", () => {
  const page = readFileSync(join(root, "index.html"), "utf8");
  assert.ok(page.includes('id="designer"'), "designer section missing");
  for (const name of ["getSpec", "playSpec", "toWavSpec", "toBufferSpec", "normalizeSpec"]) {
    assert.ok(page.includes(name), "demo does not use " + name);
  }
});
