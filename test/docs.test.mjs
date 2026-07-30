import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDocs } from "../scripts/build-docs.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("docs page builds from the README and covers the current API", () => {
  const out = join(root, "dist", "test-docs.html");
  const html = buildDocs(out);
  assert.ok(html.length > 8000);
  /* the page is derived, so API coverage here is really README coverage - same guard, one source */
  for (const name of ["playSpec", "toSprite", "getSpec", "duck", "loop", "data-foley-toggle", "@foleyjs/react"]) {
    assert.ok(html.includes(name), "docs missing " + name);
  }
  rmSync(out, { force: true });
});

test("README's size claim matches the demo badge", () => {
  const page = readFileSync(join(root, "index.html"), "utf8");
  const badge = page.match(/v[\d.]+ \u00b7 ([\d.]+ kB)/);
  assert.ok(badge, "version badge with size not found in demo");
  const readme = readFileSync(join(root, "README.md"), "utf8");
  assert.ok(readme.includes(badge[1]),
    "README must claim the same size as the badge (" + badge[1] + ") \u2014 it went stale once already");
});

test("docs page is shipped by the deploy and linked from the demo", () => {
  const deploy = readFileSync(join(root, ".github/workflows/deploy.yml"), "utf8");
  assert.ok(deploy.includes("docs.html"), "deploy must ship docs.html");
  const page = readFileSync(join(root, "index.html"), "utf8");
  assert.ok(page.includes("usefoley.dev/docs.html"), "demo nav must link the docs");
});
