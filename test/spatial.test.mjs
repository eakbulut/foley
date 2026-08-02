/* Spatial audio (2.7.0). The engine paths need an AudioContext, but the pan
   derivation and the clamping are pure - so they are extracted and tested here,
   alongside the usual enumerate-reality doc guards. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as foley from "../src/foley.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

/* panFor reads window.innerWidth; node has no window, so stand one up */
globalThis.window = Object.assign(globalThis.window || {}, { innerWidth: 1000 });
const elAt = (left, width) => ({ getBoundingClientRect: () => ({ left, width }) });

test("panFor is 0 while localize is off, wherever the element is", () => {
  foley.set({ localize: 0 });
  assert.equal(foley.panFor(elAt(0, 100)), 0);
  assert.equal(foley.panFor(elAt(980, 20)), 0);
});

test("panFor derives the pan from horizontal position, scaled by localize", () => {
  foley.set({ localize: 1 });
  assert.equal(foley.panFor(elAt(450, 100)), 0, "a centered element stays center");
  assert.equal(foley.panFor(elAt(0, 0)), -1, "left edge is hard left");
  assert.equal(foley.panFor(elAt(1000, 0)), 1, "right edge is hard right");
  foley.set({ localize: 0.6 });
  assert.equal(foley.panFor(elAt(0, 0)), -0.6, "localize scales the spread");
  assert.equal(foley.panFor(elAt(750, 0)), 0.3);
});

test("panFor clamps off-screen elements and survives junk", () => {
  foley.set({ localize: 1 });
  assert.equal(foley.panFor(elAt(-9000, 0)), -1, "scrolled-off-left must not exceed -1");
  assert.equal(foley.panFor(elAt(9000, 0)), 1, "scrolled-off-right must not exceed 1");
  assert.equal(foley.panFor(null), 0);
  assert.equal(foley.panFor({}), 0, "a non-element is center, not a crash");
  foley.set({ localize: 0 });
});

test("localize is clamped to 0..1 and reported by get()", () => {
  foley.set({ localize: 0.6 });
  assert.equal(foley.get().localize, 0.6);
  foley.set({ localize: 9 });
  assert.equal(foley.get().localize, 1, "localize must clamp to 0..1");
  foley.set({ localize: -3 });
  assert.equal(foley.get().localize, 0);
  foley.set({ localize: "sideways" });
  assert.equal(foley.get().localize, 0, "non-numeric localize falls back to center");
  foley.set({ localize: 0 });
});

test("play accepts pan and pos without an AudioContext to fail into", () => {
  /* no context in node: the guard is that option handling never throws before it */
  assert.doesNotThrow(() => foley.play("not-a-cue", { pan: 0.5 }));
  assert.doesNotThrow(() => foley.play("not-a-cue", { pos: [1, 2, 3] }));
  assert.equal(foley.playSpec([], { pan: 2 }), undefined);
});

/* ---------- docs enumerate reality ---------- */

test("every settings key is documented in the README and the d.ts Settings interface", () => {
  const dts = read("src/foley.d.ts"), readme = read("README.md");
  const iface = dts.match(/export interface Settings \{([\s\S]*?)\n\}/);
  assert.ok(iface, "Settings interface not found in d.ts");
  for (const k of Object.keys(foley.get())) {
    assert.ok(new RegExp("\\b" + k + "\\??:").test(iface[1]), `d.ts Settings is missing "${k}"`);
    assert.ok(readme.includes(k + "?") || readme.includes("`" + k + "`"),
      `README never documents the "${k}" setting`);
  }
});

test("every play option in the d.ts is documented in the README's play() signature", () => {
  const dts = read("src/foley.d.ts");
  const m = dts.match(/export interface PlayOptions \{([\s\S]*?)\n\}/);
  assert.ok(m, "PlayOptions not found in d.ts");
  const keys = [...m[1].matchAll(/^\s*(\w+)\?:/gm)].map((x) => x[1]);
  for (const required of ["pan", "pos"]) {
    assert.ok(keys.includes(required), `PlayOptions must declare "${required}"`);
  }
  const sig = read("README.md").match(/\*\*`play\(name, \{([^}]*)\}\)`\*\*/);
  assert.ok(sig, "README play() signature not found");
  for (const k of keys) assert.ok(sig[1].includes(k + "?"), `README play() signature missing ${k}?`);
});

test("agents.md covers placement, since agents will be asked for it", () => {
  const agents = read("agents.md");
  for (const t of ["pan", "pos", "localize", "panFor"]) {
    assert.ok(agents.includes(t), `agents.md missing ${t}`);
  }
});

test("demo exposes localize and persists it through the store adapter", () => {
  const page = read("index.html");
  assert.ok(page.includes('id="localize-toggle"'), "demo missing the localize toggle");
  assert.ok(page.includes("store.save({ localize"), "localize must persist like the other settings");
  assert.ok(page.includes('class="pill-toggle" id="localize-toggle"'),
    "the toggle must reuse the existing pill-toggle chrome, not invent new controls");
});

test("the reverb send stays center: rooms don't pan, sources do", () => {
  const src = read("src/foley.js");
  assert.ok(/const sendBus = ctx\.createGain\(\); sendBus\.connect\(T\.verb\);/.test(src),
    "the send bus must connect straight to the reverb, with no panner in between");
});
