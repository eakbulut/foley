/* Background-tab silence for looping cues. The gate itself needs an AudioContext and
   a real document.hidden, so behavior is verified in a browser; these guards pin the
   two decisions that are easy to undo by accident. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const src = read("src/foley.js");

test("loop repetitions are gated on tab visibility, not just mute", () => {
  const gate = src.match(/function loopAudible\(\)[\s\S]*?\n\}/);
  assert.ok(gate, "loopAudible() not found");
  assert.ok(/document\.hidden/.test(gate[0]), "the gate must consult document.hidden");
  assert.ok(/T\.settings\.muted/.test(gate[0]), "the gate must still honor mute");
  assert.ok(/typeof document/.test(gate[0]),
    "guard the document reference - the module is imported in node by this very suite");
});

test("the loop interval actually uses the gate", () => {
  assert.ok(/setInterval\(\(\) => \{ if \(loopAudible\(\)\) once\(\); \}/.test(src),
    "the loop must call loopAudible(), or the gate is dead code");
});

test("one-shots are NOT gated: a background ping is the whole point of a ping", () => {
  /* only the loop's setInterval may consult the gate; the initial once() must not */
  const perform = src.match(/function perform\([\s\S]*?\n\}\n/);
  assert.ok(perform, "perform() not found");
  const beforeLoop = perform[0].slice(0, perform[0].indexOf("if (opts.loop)"));
  assert.ok(!/loopAudible/.test(beforeLoop),
    "the first performance must fire regardless of visibility");
});

test("the behavior is documented where users and agents will look", () => {
  assert.ok(/background tab/i.test(read("README.md")),
    "README must mention background-tab silence");
  assert.ok(/hidden/i.test(read("agents.md")),
    "agents.md must say loops go quiet while hidden, so agents stop hand-rolling it");
});
