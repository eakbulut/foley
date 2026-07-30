/* Documentation freshness guards. Philosophy: enumerate reality from the code
   itself, then require the docs to cover it - so the tests never need updating
   when the API grows; only the docs do. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as foley from "../src/foley.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const readme = readFileSync(join(root, "README.md"), "utf8");
const agents = readFileSync(join(root, "agents.md"), "utf8");
const dts = readFileSync(join(root, "src/foley.d.ts"), "utf8");
const src = readFileSync(join(root, "src/foley.js"), "utf8");

test("every public export is documented in the README", () => {
  for (const name of Object.keys(foley)) {
    assert.ok(readme.includes(name),
      `export "${name}" exists but the README never mentions it`);
  }
});

test("every public export is declared in the type definitions", () => {
  for (const name of Object.keys(foley)) {
    const re = new RegExp("export declare (?:function|const) " + name + "\\b");
    assert.ok(re.test(dts),
      `export "${name}" exists but src/foley.d.ts does not declare it`);
  }
});

test("the type definitions declare nothing the module doesn't export", () => {
  for (const m of dts.matchAll(/export declare (?:function|const) (\w+)/g)) {
    assert.ok(m[1] in foley,
      `d.ts declares "${m[1]}" but the module does not export it`);
  }
});

test("every data-foley-* attribute in bind() is documented in README and agents.md", () => {
  const attrs = new Set([...src.matchAll(/data-foley-(\w+)/g)].map((m) => "data-foley-" + m[1]));
  assert.ok(attrs.size >= 6, "expected to find the attributes in bind()");
  for (const attr of attrs) {
    assert.ok(readme.includes(attr), `README missing ${attr}`);
    assert.ok(agents.includes(attr), `agents.md missing ${attr}`);
  }
});

test("the demo never advertises a data-foley-* attribute bind() doesn't implement", () => {
  const page = readFileSync(join(root, "index.html"), "utf8");
  const real = new Set([...src.matchAll(/data-foley-(\w+)/g)].map((m) => m[1]));
  for (const m of page.matchAll(/data-foley-(\w+)/g)) {
    assert.ok(real.has(m[1]),
      `demo mentions data-foley-${m[1]} but bind() does not implement it`);
  }
});

test("every cue and family name appears in the README", () => {
  for (const name of Object.keys(foley.cues)) {
    assert.ok(readme.includes("`" + name + "`"), `README cue table missing "${name}"`);
  }
  for (const fam of Object.values(foley.families)) {
    assert.ok(readme.includes(fam.name), `README missing family "${fam.name}"`);
  }
});

test("CHANGELOG has an entry for the current version", () => {
  const log = readFileSync(join(root, "CHANGELOG.md"), "utf8");
  assert.ok(log.includes("## " + foley.version),
    `CHANGELOG.md has no "## ${foley.version}" entry - write the release notes`);
});
