import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as foley from "../src/foley.js";
import { build } from "../scripts/build-standalone.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

/* ---------- cue & family metadata integrity ---------- */

test("exactly 28 cues", () => {
  assert.equal(Object.keys(foley.cues).length, 28);
});

test("exactly 7 families, 4 cues each", () => {
  const fams = Object.keys(foley.families);
  assert.equal(fams.length, 7);
  for (const f of fams) {
    const n = Object.values(foley.cues).filter((c) => c.family === f).length;
    assert.equal(n, 4, `family "${f}" has ${n} cues, expected 4`);
  }
});

test("every cue's family exists in families", () => {
  for (const [name, c] of Object.entries(foley.cues)) {
    assert.ok(foley.families[c.family], `cue "${name}" has unknown family "${c.family}"`);
  }
});

test("keyboard keys are unique and single-character", () => {
  const keys = Object.values(foley.cues).map((c) => c.key);
  assert.equal(new Set(keys).size, keys.length, "duplicate keyboard keys");
  for (const k of keys) assert.equal(k.length, 1);
});

test("every cue has a non-empty description", () => {
  for (const [name, c] of Object.entries(foley.cues)) {
    assert.ok(c.description && c.description.length > 3, `cue "${name}" description missing`);
  }
});

test("metadata is frozen", () => {
  assert.ok(Object.isFrozen(foley.cues));
  assert.ok(Object.isFrozen(foley.cues.tick));
  assert.ok(Object.isFrozen(foley.families));
});

/* ---------- settings ---------- */

test("set/get round-trips every setting", () => {
  foley.set({ volume: 0.42, transpose: 3, space: 0.5, muted: true, hover: false, theme: "mechanical" });
  const g = foley.get();
  assert.equal(g.volume, 0.42);
  assert.equal(g.transpose, 3);
  assert.equal(g.space, 0.5);
  assert.equal(g.muted, true);
  assert.equal(g.hover, false);
  assert.equal(g.theme, "mechanical");
});

test("get() returns a snapshot, not a live reference", () => {
  const g = foley.get();
  g.volume = 999;
  assert.notEqual(foley.get().volume, 999);
});

test("invalid theme is ignored", () => {
  foley.set({ theme: "glass" });
  foley.set({ theme: "vaporwave" });
  assert.equal(foley.get().theme, "glass");
});

test("themes export lists all four", () => {
  assert.deepEqual([...foley.themes].sort(), ["default", "glass", "mechanical", "soft"]);
});

test("play() with an unknown cue is a safe no-op", () => {
  assert.doesNotThrow(() => foley.play("not-a-cue"));
});

test("on() returns a working unsubscribe", () => {
  let calls = 0;
  const off = foley.on("play", () => calls++);
  assert.equal(typeof off, "function");
  off(); /* must not throw, and must remove the listener */
});

/* ---------- types & docs stay in sync with the code ---------- */

test("d.ts CueName union matches the actual cues", () => {
  const dts = read("src/foley.d.ts");
  const m = dts.match(/export type CueName =([\s\S]*?);/);
  assert.ok(m, "CueName union not found in d.ts");
  const declared = [...m[1].matchAll(/"([a-z]+)"/g)].map((x) => x[1]).sort();
  const actual = Object.keys(foley.cues).sort();
  assert.deepEqual(declared, actual);
});

test("version is consistent across module, package.json, and demo badge", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.equal(foley.version, pkg.version);
  const page = read("index.html");
  assert.ok(page.includes("v" + pkg.version), "demo version badge out of date");
});

test("README and demo use the published package name", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.ok(read("README.md").includes("npm install " + pkg.name));
  assert.ok(read("index.html").includes("npm install " + pkg.name));
});

test("demo page only imports names the module exports", () => {
  const page = read("index.html");
  const m = page.match(/import \{([^}]*)\} from "\.\/src\/foley\.js"/);
  assert.ok(m, "demo import not found");
  for (const name of m[1].split(",").map((x) => x.trim())) {
    assert.ok(name in foley, `demo imports "${name}" but the module does not export it`);
  }
});

test("marketing cue count matches reality", () => {
  const page = read("index.html");
  const n = Object.keys(foley.cues).length;
  assert.ok(page.includes(n + " cues"), `demo should advertise "${n} cues"`);
  assert.ok(!page.match(/\b(24|26|30) cues\b/), "stale cue count in demo copy");
});

/* ---------- the standalone build ---------- */

test("standalone build succeeds and is self-contained", () => {
  const out = join(root, "dist", "test-standalone.html");
  const html = build(out);
  assert.ok(html.length > 50000);
  assert.ok(!html.includes('from "./src/foley.js"'), "import statement survived the build");
  assert.ok(!html.includes("localStorage"), "localStorage survived the build");
  assert.ok(html.includes("const CUES"), "library was not inlined");
  rmSync(out, { force: true });
});
