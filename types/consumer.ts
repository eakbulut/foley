/* Compiled by test/types.test.mjs with `tsc --noEmit --strict`. Two jobs:

   1. Real usage must compile — including detaching every member, since
      `const { play } = useFoley()` is the documented pattern.
   2. Every `@ts-expect-error` must ACTUALLY error. tsc fails the build if one
      of them stops erroring, which is what keeps the types from going vacuous:
      a d.ts full of `any` would pass job 1 alone. */

import { play, set, get, on, bind, panFor, getSpec, playSpec, toWav, toSprite } from "../src/foley.js";
import { useFoley } from "../packages/react/src/index.js";

/* ---------- detaching: the pattern unbound-method complains about ---------- */

const foley = useFoley({ volume: 0.7 });
const { play: p, set: s, get: g, on: o, bind: b, toWav: w } = foley;
p("success");
s({ muted: true });
const settings = g();
b();
void w;
const unsub = o("play", (e) => { const n: string = e.name; void n; });
unsub();
o("unlock", () => {})();

/* passed around as bare references, never called as methods */
function callLater(fn: (name: "tick") => void): void { fn("tick"); }
callLater(p);

const handle = play("loading", { loop: true });
if (handle) {
  const { stop } = handle;   /* PlayHandle.stop must detach too */
  stop();
}

/* ---------- the surface, used the way the README documents it ---------- */

const vol: number = settings.volume;
const loc: number = settings.localize;
void vol; void loc;

play("tick", { pitch: 4, volume: 0.3, pan: -0.7 });
play("ping", { pos: [1, 0, -0.5] });
set({ localize: 0.6, duck: 0.3, theme: "glass" });
set({ theme: { name: "Acme", transform: { pitch: 0.9 }, cues: { success: getSpec("success") } } });
bind(document);
const pan: number = panFor(document.body);
void pan;

const spec = getSpec("success");
/* Spec is a union of layer kinds, so TS wants a narrow before touching `f` -
   cluster layers have fMin/fMax instead. The README says so for this reason. */
const first = spec[0];
if (first.kind === "tone") first.f = 880;
spec.push({ kind: "noise", at: 0.2, filter: "highpass", f: 6000, f2: null,
            glide: 0.1, q: 1, a: 0.01, d: 0.2, peak: 0.05, send: 0.4 });
playSpec(spec, { id: "custom", pan: 0.5 });

// @ts-expect-error `f` is not on every layer kind - narrow on `kind` first
spec[0].f = 880;

async function exports_(): Promise<void> {
  const blob: Blob = await toWav("chime");
  const sprite = await toSprite(0.05);
  const start: number = sprite.map.tick.start;
  void blob; void start;
}
void exports_;

/* ---------- negatives: each of these MUST error ---------- */

// @ts-expect-error unknown cue name
play("not-a-cue");
// @ts-expect-error the React handle must be as strict as the core, not widened
p("not-a-cue");
// @ts-expect-error ...including its overloaded on()
o("bogus", () => {});
// @ts-expect-error ...and its settings
s({ loudness: 1 });
// @ts-expect-error unknown event name
on("bogus", () => {});
// @ts-expect-error PlayEvent.name is a string, not a number
on("play", (e) => { const x: number = e.name; void x; });
// @ts-expect-error pos is a 3-tuple
play("ping", { pos: [1, 0] });
// @ts-expect-error unknown theme name
set({ theme: "vaporwave" });
// @ts-expect-error unknown setting
set({ loudness: 1 });
// @ts-expect-error panFor takes an element
panFor("#id");
// @ts-expect-error layer kind is a fixed union
playSpec([{ kind: "bogus" }]);
