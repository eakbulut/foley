import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));

const corePkg = readJson("package.json");
const reactPkg = readJson("packages/react/package.json");
const vuePkg = readJson("packages/vue/package.json");

/* ---------- package metadata ---------- */

test("framework packages share the core's version", () => {
  assert.equal(reactPkg.version, corePkg.version);
  assert.equal(vuePkg.version, corePkg.version);
});

test("framework packages declare core as a compatible peer", () => {
  for (const pkg of [reactPkg, vuePkg]) {
    const peer = pkg.peerDependencies["@foleyjs/core"];
    assert.ok(peer, pkg.name + " missing @foleyjs/core peer dependency");
    assert.equal(peer, "^" + corePkg.version, pkg.name + " peer range out of sync");
  }
});

test("framework packages are public, scoped, and MIT", () => {
  for (const pkg of [reactPkg, vuePkg]) {
    assert.ok(pkg.name.startsWith("@foleyjs/"));
    assert.equal(pkg.publishConfig.access, "public");
    assert.equal(pkg.license, "MIT");
    assert.ok(pkg.repository.directory.startsWith("packages/"));
  }
});

/* ---------- actual imports ---------- */

test("@foleyjs/react exports a working useFoley and re-exports the core", async () => {
  const mod = await import("../packages/react/src/index.js");
  assert.equal(typeof mod.useFoley, "function");
  assert.equal(typeof mod.play, "function", "core re-export missing");
  assert.equal(Object.keys(mod.cues).length, 28);
});

test("@foleyjs/vue exports a well-formed directive and plugin", async () => {
  const mod = await import("../packages/vue/src/index.js");
  assert.equal(typeof mod.vFoley.mounted, "function");
  assert.equal(typeof mod.vFoley.unmounted, "function");
  assert.equal(typeof mod.FoleyPlugin.install, "function");
  assert.equal(typeof mod.play, "function", "core re-export missing");
});

test("vue directive attaches and removes its listener", async () => {
  const { vFoley } = await import("../packages/vue/src/index.js");
  const events = [];
  const el = {
    addEventListener: (ev) => events.push(["add", ev]),
    removeEventListener: (ev) => events.push(["remove", ev]),
  };
  vFoley.mounted(el, { value: "tick", arg: "hover" });
  vFoley.unmounted(el);
  assert.deepEqual(events, [["add", "pointerenter"], ["remove", "pointerenter"]]);
});

/* ---------- demo stays honest about the packages ---------- */

test("demo's recipes step references the published packages", () => {
  const page = readFileSync(join(root, "index.html"), "utf8");
  assert.ok(page.includes("@foleyjs/react"), "demo should mention @foleyjs/react");
  assert.ok(page.includes("@foleyjs/vue"), "demo should mention @foleyjs/vue");
  assert.ok(!page.includes("recipes/react"), "demo still references the retired recipes folder");
});
