/* bind() delegation guards. There is no DOM in node and no test dependencies here,
   so these assert the shape of bind() itself; the behavior is verified in a browser.
   The failure they exist to catch: bind() walking the DOM once, which leaves every
   element rendered after startup silent. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const src = read("src/foley.js");
const bindBody = src.match(/export function bind\(root\) \{[\s\S]*?\n\}/);

test("bind() exists and is extractable for these guards", () => {
  assert.ok(bindBody, "bind(root) not found in src/foley.js");
});

test("bind() delegates instead of walking the DOM once", () => {
  const body = bindBody[0];
  assert.ok(!/querySelectorAll/.test(body),
    "bind() must delegate from root, not querySelectorAll at call time - " +
    "markup rendered after startup would be silent");
  assert.ok(!/_fy[HPRCTY]\b/.test(body),
    "per-element _fy* flags mean per-element listeners; delegation needs neither");
  assert.ok(/closest\(/.test(body), "delegation resolves targets with closest()");
});

test("every data-foley-* attribute still has a delegated handler", () => {
  const body = bindBody[0];
  for (const attr of ["hover", "press", "release", "click", "toggle", "type"]) {
    assert.ok(body.includes("[data-foley-" + attr + "]"),
      `bind() lost its handler for data-foley-${attr}`);
  }
});

test("bind() is idempotent, so a second call cannot double-wire a root", () => {
  const body = bindBody[0];
  assert.ok(/_fyBound/.test(body), "bind() must no-op on a root it already delegates from");
});

test("hover survives delegation: pointerover latched, pointerout released", () => {
  const body = bindBody[0];
  /* pointerenter does not bubble, so hover must be built from pointerover plus a
     latch - otherwise sliding across a button's children re-fires the cue. */
  assert.ok(body.includes("pointerover"), "hover must delegate via pointerover");
  assert.ok(body.includes("pointerout"), "the hover latch must be released on pointerout");
  assert.ok(/relatedTarget/.test(body),
    "pointerout must ignore moves into a child, or re-entry re-fires");
});

test("keyboard users get the hover cue too", () => {
  assert.ok(bindBody[0].includes("focusin"),
    "data-foley-hover must also fire on focus, or keyboard users hear nothing " +
    "that mouse users hear");
});

test("the docs stopped telling people to re-bind after render", () => {
  const react = read("packages/react/src/index.js");
  assert.ok(!/call bind\(\) again/.test(react),
    "the React package still documents the re-bind workaround that delegation removes");
  for (const [file, text] of [["README.md", read("README.md")], ["agents.md", read("agents.md")]]) {
    assert.ok(/delegat/i.test(text), `${file} should explain that bind() delegates`);
  }
});
