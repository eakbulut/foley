/* observe() guards. Node has no DOM and this repo has no test dependencies, so
   behavior is verified in a browser; these pin the decisions that are easy to
   undo and expensive to rediscover. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as foley from "../src/foley.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const src = read("src/foley.js");
const body = src.match(/export function observe\(root\) \{[\s\S]*?\n\}/);

test("observe is exported and returns a stop function without a DOM", () => {
  assert.equal(typeof foley.observe, "function");
  /* no MutationObserver in node: must degrade to a no-op, not throw */
  const stop = foley.observe({});
  assert.equal(typeof stop, "function");
  assert.doesNotThrow(() => stop());
});

test("observe() is opt-in - bind() must not start it", () => {
  const bindBody = src.match(/export function bind\(root\) \{[\s\S]*?\n\}/)[0];
  assert.ok(!/MutationObserver|observe\(/.test(bindBody),
    "bind() must not start the observer; it watches for the life of the page " +
    "and most callers only want interaction sounds");
});

test("exits play centered, because a removed element has no position", () => {
  /* panFor on a detached node reads a zeroed rect, which resolves to hard left -
     every exit would swing to the left speaker. Found while writing this. */
  assert.ok(/data-foley-exit[\s\S]{0,160}?"whoosh", 0\)/.test(body[0]),
    "the exit path must pass an explicit 0 pan, never panFor(el)");
});

test("attribute watching is filtered to state, never class", () => {
  const filter = src.match(/const STATE_ATTRS = \[([^\]]*)\]/);
  assert.ok(filter, "STATE_ATTRS not found");
  assert.ok(!/["']class["']/.test(filter[1]),
    "watching class would fire on every hover and focus");
  for (const a of ["aria-expanded", "open", "data-state"]) {
    assert.ok(filter[1].includes(a), `STATE_ATTRS should cover ${a}`);
  }
  assert.ok(/attributeFilter: STATE_ATTRS/.test(body[0]),
    "the observer must pass attributeFilter, or it wakes on every attribute");
});

test("a nested match inside an added subtree is still found", () => {
  /* MutationObserver reports the subtree root only; querySelectorAll is what
     catches <div><toast data-foley-enter></toast></div> */
  assert.ok(/matches\(sel\)/.test(body[0]) && /querySelectorAll\(sel\)/.test(body[0]),
    "each() must check the node itself AND its descendants");
  assert.ok(/nodeType !== 1/.test(body[0]), "text nodes and comments must be skipped");
});

test("observing the same root twice is a no-op", () => {
  assert.ok(/_fyObserve/.test(body[0]), "observe() needs an idempotence latch like bind()");
});

test("the three attributes are documented in README and agents.md", () => {
  /* freshness.test.mjs enforces this for every data-foley-* in src; this states
     the intent for the observe trio specifically, with the cue defaults. */
  const readme = read("README.md"), agents = read("agents.md");
  for (const attr of ["data-foley-enter", "data-foley-exit", "data-foley-change"]) {
    assert.ok(readme.includes(attr), `README missing ${attr}`);
    assert.ok(agents.includes(attr), `agents.md missing ${attr}`);
  }
  for (const doc of [readme, agents]) {
    assert.ok(/initial render/i.test(doc),
      "both docs must say the initial render is silent - it is the first thing people ask");
  }
});
