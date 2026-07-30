import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as foley from "../src/foley.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("duck: clamped, applied, and reported", () => {
  foley.set({ duck: 0.3 });
  assert.equal(foley.get().duck, 0.3);
  foley.set({ duck: 5 });
  assert.equal(foley.get().duck, 1, "duck must clamp to 0..1");
  foley.set({ duck: -1 });
  assert.equal(foley.get().duck, 0);
  foley.set({ duck: 1 });
});

test("custom theme objects: accepted, clamped, reported as 'custom'", () => {
  foley.set({ theme: { pitch: 0.8, decay: 99, shimmer: 1, bogus: "x" } });
  assert.equal(foley.get().theme, "custom");
  foley.set({ theme: "vaporwave" }); /* invalid name after custom: stays custom */
  assert.equal(foley.get().theme, "custom");
  foley.set({ theme: "default" });
  assert.equal(foley.get().theme, "default");
});

test("toSprite is exported", () => {
  assert.equal(typeof foley.toSprite, "function");
});

test("play/playSpec still no-throw for invalid input, returning no handle", () => {
  assert.equal(foley.play("not-a-cue"), undefined);
  assert.equal(foley.playSpec([]), undefined);
});

test("d.ts documents the new surface", () => {
  const dts = readFileSync(join(root, "src/foley.d.ts"), "utf8");
  for (const name of ["PlayHandle", "ThemeTransform", "toSprite", "duck", "loop?"]) {
    assert.ok(dts.includes(name), "d.ts missing " + name);
  }
});

test("demo ships the sprite button and designer extras", () => {
  const page = readFileSync(join(root, "index.html"), "utf8");
  for (const id of ['id="export-sprite"', 'id="dz-code"', 'id="dz-presets"']) {
    assert.ok(page.includes(id), "demo missing " + id);
  }
});
