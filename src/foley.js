/* ============================================================
   foley — sound effects for the interface, performed live.
   28 interaction cues synthesized with Web Audio.
   Zero dependencies. Zero audio files. MIT.
   https://github.com/eakbulut/foley
   ============================================================ */

export const version = "2.2.0";

/* ---------------- engine ---------------- */
const T = {
  ctx: null, master: null, limiter: null, analyser: null, dry: null, verb: null, wet: null,
  settings: { volume: 0.7, transpose: 0, space: 0.22, muted: false, hover: true, theme: "default" },
  _scale: 1, _cool: {}, _noise: null, _unlocked: false,

  ensure() {
    if (this.ctx) { if (this.ctx.state === "suspended") this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    const ctx = new AC();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = this.settings.muted ? 0 : this.settings.volume;
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.4;
    /* brick-wall safety: overlapping arpeggios and hover storms never clip */
    this.limiter = ctx.createDynamicsCompressor();
    this.limiter.threshold.value = -10;
    this.limiter.knee.value = 4;
    this.limiter.ratio.value = 12;
    this.limiter.attack.value = 0.002;
    this.limiter.release.value = 0.12;
    this.master.connect(this.limiter);
    this.limiter.connect(this.analyser);
    this.analyser.connect(ctx.destination);
    this.dry = ctx.createGain();
    this.dry.connect(this.master);
    this.verb = ctx.createConvolver();
    this.verb.buffer = this.makeIR(1.4, 3.2);
    this.wet = ctx.createGain();
    this.wet.gain.value = this.settings.space;
    this.verb.connect(this.wet);
    this.wet.connect(this.master);
    if (!this._unlocked) { this._unlocked = true; emit("unlock", {}); }
  },

  makeIR(dur, decay) {
    const rate = this.ctx.sampleRate, len = Math.floor(rate * dur);
    const buf = this.ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    return buf;
  },

  noiseBuf() {
    if (this._noise) return this._noise;
    const rate = this.ctx.sampleRate, len = rate;
    const buf = this.ctx.createBuffer(1, len, rate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this._noise = buf;
    return buf;
  },

  pitch(f, extraSemis) {
    return f * Math.pow(2, (this.settings.transpose + (extraSemis || 0)) / 12);
  },
};

/* ---------------- events ---------------- */
const listeners = {};
function emit(ev, payload) {
  (listeners[ev] || []).forEach((cb) => { try { cb(payload); } catch (e) { /* listener errors stay theirs */ } });
}

/** Subscribe to engine events: "play" ({name, family}) and "unlock" ({}). Returns an unsubscribe function. */
export function on(ev, cb) {
  (listeners[ev] = listeners[ev] || []).push(cb);
  return () => {
    const a = listeners[ev];
    const i = a.indexOf(cb);
    if (i >= 0) a.splice(i, 1);
  };
}

/* ---------------- themes: one transform reshapes all 28 cues ---------------- */
function mkTheme(o) {
  return Object.assign({ label: "", wave: null, pitch: 1, attack: 1, decay: 1, send: 1, noiseLvl: 1, noiseF: 1, q: 1, shimmer: false }, o);
}
const THEMES = {
  default:    mkTheme({ label: "Default" }),
  soft:       mkTheme({ label: "Soft",       wave: { sawtooth: "triangle", square: "sine", triangle: "sine" },
                        pitch: 0.8, attack: 2.6, decay: 1.45, send: 1.5, noiseLvl: 0.5, noiseF: 0.7, q: 0.7 }),
  mechanical: mkTheme({ label: "Mechanical", attack: 0.55, decay: 0.5, send: 0.25, noiseLvl: 1.6, noiseF: 1.25, q: 1.6 }),
  glass:      mkTheme({ label: "Glass",      pitch: 1.45, attack: 0.7, decay: 1.6, send: 1.7,
                        noiseLvl: 0.45, noiseF: 1.9, q: 3.2, shimmer: true }),
};
let theme = THEMES.default;

export const themes = Object.freeze(Object.keys(THEMES));

/* ---------------- synth helpers ---------------- */
function tone(o) {
  const th = theme, ctx = T.ctx, t0 = o.t0;
  const osc = ctx.createOscillator();
  osc.type = (th.wave && th.wave[o.type || "sine"]) || o.type || "sine";
  const f = T.pitch(o.f, o.semis) * th.pitch;
  osc.frequency.setValueAtTime(f, t0);
  if (o.f2) osc.frequency.exponentialRampToValueAtTime(Math.max(20, T.pitch(o.f2, o.semis) * th.pitch), t0 + (o.glide || 0.06));
  const g = ctx.createGain();
  const a = (o.a != null ? o.a : 0.004) * th.attack;
  const d = (o.d != null ? o.d : 0.15) * th.decay;
  const peak = (o.peak != null ? o.peak : 0.18) * T._scale;
  /* glass grows a quiet inharmonic partial on every pitched voice */
  if (th.shimmer && !o._plain) tone(Object.assign({}, o, { f: o.f * 2.99, f2: o.f2 ? o.f2 * 2.99 : null, peak: (o.peak != null ? o.peak : 0.18) * 0.16, d: (o.d != null ? o.d : 0.15) * 0.8, _plain: true }));
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  osc.connect(g);
  g.connect(T.dry);
  const sendAmt = (o.send || 0) * th.send;
  if (sendAmt > 0.01) {
    const s = ctx.createGain();
    s.gain.value = sendAmt;
    g.connect(s); s.connect(T.verb);
  }
  osc.start(t0);
  osc.stop(t0 + a + d + 0.15);
}

function noise(o) {
  const th = theme, ctx = T.ctx, t0 = o.t0;
  const src = ctx.createBufferSource();
  src.buffer = T.noiseBuf();
  src.loop = true;
  const fl = ctx.createBiquadFilter();
  fl.type = o.type || "bandpass";
  fl.frequency.setValueAtTime((o.f || 2000) * th.noiseF, t0);
  if (o.f2) fl.frequency.exponentialRampToValueAtTime(o.f2 * th.noiseF, t0 + (o.glide || 0.1));
  fl.Q.value = (o.q != null ? o.q : 1) * th.q;
  const g = ctx.createGain();
  const a = (o.a != null ? o.a : 0.002) * th.attack;
  const d = (o.d != null ? o.d : 0.05) * (th.decay * 0.7 + 0.3);
  const peak = (o.peak != null ? o.peak : 0.15) * T._scale * th.noiseLvl;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  src.connect(fl); fl.connect(g); g.connect(T.dry);
  const sendAmt = (o.send || 0) * th.send;
  if (sendAmt > 0.01) {
    const s = ctx.createGain();
    s.gain.value = sendAmt;
    g.connect(s); s.connect(T.verb);
  }
  src.start(t0);
  src.stop(t0 + a + d + 0.1);
}

function bellPartials(t0, f, peak, decay, send) {
  const ratios = [1, 2.76, 5.40, 8.93];
  const gains = [1, 0.42, 0.18, 0.07];
  for (let i = 0; i < ratios.length; i++) {
    tone({ t0, f: f * ratios[i], peak: peak * gains[i], a: 0.002, d: decay * (1 - i * 0.16), send });
  }
}

/* ---------------- the 28 cues ---------------- */
const CUES = {
  /* pointer */
  tick:    { cat: "pointer", key: "1", ds: "a grain as the pointer crosses", fn(t) { noise({ t0: t, f: 5200, q: 2.5, d: 0.018, peak: 0.10 }); tone({ t0: t, f: 2400, d: 0.02, peak: 0.05 }); } },
  hover:   { cat: "pointer", key: "2", ds: "a breath of pitch, barely there", fn(t) { tone({ t0: t, f: 880, f2: 1150, glide: 0.05, d: 0.07, peak: 0.06 }); } },
  glide:   { cat: "pointer", key: "3", ds: "a longer sweep for big targets", fn(t) { tone({ t0: t, f: 420, f2: 940, glide: 0.11, d: 0.13, peak: 0.09, send: 0.2 }); } },
  pop:     { cat: "pointer", key: "4", ds: "a bubble bursting under the cursor", fn(t) { tone({ t0: t, f: 640, f2: 190, glide: 0.05, d: 0.06, peak: 0.2 }); noise({ t0: t, f: 3000, q: 1, d: 0.012, peak: 0.06 }); } },

  /* press */
  press:   { cat: "press", key: "5", ds: "the down-stroke, weighted", fn(t) { tone({ t0: t, type: "triangle", f: 190, f2: 150, glide: 0.03, d: 0.06, peak: 0.28 }); noise({ t0: t, f: 1800, q: 0.8, d: 0.012, peak: 0.12 }); } },
  release: { cat: "press", key: "6", ds: "the up-stroke, lighter", fn(t) { tone({ t0: t, type: "triangle", f: 300, f2: 250, glide: 0.02, d: 0.045, peak: 0.18 }); noise({ t0: t, f: 3200, q: 0.8, d: 0.01, peak: 0.08 }); } },
  tap:     { cat: "press", key: "7", ds: "a neutral single click", fn(t) { noise({ t0: t, f: 2200, q: 1.4, d: 0.02, peak: 0.16 }); tone({ t0: t, f: 1100, d: 0.025, peak: 0.07 }); } },
  thock:   { cat: "press", key: "8", ds: "mechanical keyboard, lubed", fn(t) { tone({ t0: t, type: "sine", f: 120, f2: 95, glide: 0.03, d: 0.055, peak: 0.3 }); noise({ t0: t, type: "lowpass", f: 900, d: 0.02, peak: 0.2 }); } },

  /* toggle */
  on:      { cat: "toggle", key: "9", ds: "two notes stepping up", fn(t) { tone({ t0: t, f: 660, d: 0.05, peak: 0.14 }); tone({ t0: t + 0.07, f: 990, d: 0.09, peak: 0.16, send: 0.15 }); } },
  off:     { cat: "toggle", key: "0", ds: "the same figure, descending", fn(t) { tone({ t0: t, f: 990, d: 0.05, peak: 0.14 }); tone({ t0: t + 0.07, f: 620, d: 0.09, peak: 0.15 }); } },
  switch:  { cat: "toggle", key: "Q", ds: "a hard mode-change snap", fn(t) { noise({ t0: t, f: 2600, q: 3, d: 0.015, peak: 0.18 }); tone({ t0: t + 0.01, f: 520, d: 0.05, peak: 0.12 }); } },
  latch:   { cat: "toggle", key: "W", ds: "a low clunk that stays put", fn(t) { tone({ t0: t, type: "triangle", f: 140, f2: 110, glide: 0.04, d: 0.09, peak: 0.3 }); noise({ t0: t, type: "lowpass", f: 500, d: 0.03, peak: 0.18 }); } },

  /* feedback */
  success: { cat: "feedback", key: "E", ds: "a small major lift", fn(t) { tone({ t0: t, f: 523.25, d: 0.1, peak: 0.13 }); tone({ t0: t + 0.09, f: 659.25, d: 0.12, peak: 0.13 }); tone({ t0: t + 0.18, f: 783.99, d: 0.22, peak: 0.15, send: 0.3 }); } },
  error:   { cat: "feedback", key: "R", ds: "two flat buzzes, no drama", fn(t) { tone({ t0: t, type: "sawtooth", f: 220, d: 0.09, peak: 0.09 }); tone({ t0: t + 0.13, type: "sawtooth", f: 185, d: 0.13, peak: 0.09 }); } },
  warning: { cat: "feedback", key: "T", ds: "the same note twice, raised brow", fn(t) { tone({ t0: t, type: "triangle", f: 493.88, d: 0.07, peak: 0.13 }); tone({ t0: t + 0.15, type: "triangle", f: 493.88, d: 0.1, peak: 0.13 }); } },
  denied:  { cat: "feedback", key: "Y", ds: "a dull thud against the limit", fn(t) { tone({ t0: t, type: "triangle", f: 160, f2: 120, glide: 0.05, d: 0.08, peak: 0.26 }); noise({ t0: t, type: "lowpass", f: 400, d: 0.04, peak: 0.14 }); } },

  /* notify */
  chime:   { cat: "notify", key: "U", ds: "a struck bar with real partials", fn(t) { bellPartials(t, 880, 0.14, 0.7, 0.45); } },
  ping:    { cat: "notify", key: "I", ds: "one bright point of light", fn(t) { tone({ t0: t, f: 1318.5, d: 0.28, peak: 0.12, send: 0.35 }); tone({ t0: t, f: 1324, d: 0.24, peak: 0.05, send: 0.3 }); } },
  bell:    { cat: "notify", key: "O", ds: "lower, rounder, further away", fn(t) { bellPartials(t, 523.25, 0.13, 0.9, 0.55); } },
  bubble:  { cat: "notify", key: "P", ds: "a message surfacing", fn(t) { tone({ t0: t, f: 320, f2: 900, glide: 0.09, d: 0.1, peak: 0.14, send: 0.2 }); } },

  /* motion */
  swoosh:  { cat: "motion", key: "A", ds: "air moving forward", fn(t) { noise({ t0: t, f: 350, f2: 3400, glide: 0.22, q: 1.6, a: 0.03, d: 0.22, peak: 0.14, send: 0.25 }); } },
  whoosh:  { cat: "motion", key: "S", ds: "the same air, leaving", fn(t) { noise({ t0: t, f: 3200, f2: 320, glide: 0.22, q: 1.6, a: 0.03, d: 0.2, peak: 0.13 }); } },
  drop:    { cat: "motion", key: "D", ds: "something set down", fn(t) { tone({ t0: t, f: 620, f2: 130, glide: 0.16, d: 0.18, peak: 0.16 }); noise({ t0: t + 0.15, type: "lowpass", f: 700, d: 0.03, peak: 0.12 }); } },
  rise:    { cat: "motion", key: "F", ds: "something lifting off", fn(t) { tone({ t0: t, f: 210, f2: 860, glide: 0.18, d: 0.2, peak: 0.13, send: 0.25 }); noise({ t0: t + 0.1, f: 2400, f2: 5200, glide: 0.1, d: 0.1, peak: 0.05 }); } },

  /* state */
  loading:  { cat: "state", key: "G", ds: "three patient ticks", fn(t) { for (let i = 0; i < 3; i++) tone({ t0: t + i * 0.12, f: 700 + i * 120, d: 0.035, peak: 0.09 }); } },
  ready:    { cat: "state", key: "H", ds: "a warm open third", fn(t) { tone({ t0: t, f: 440, d: 0.3, peak: 0.1, send: 0.25 }); tone({ t0: t, f: 554.37, d: 0.3, peak: 0.09, send: 0.25 }); } },
  complete: { cat: "state", key: "J", ds: "the arrival \u2014 arpeggio and shimmer", fn(t) { const seq = [523.25, 659.25, 783.99, 1046.5]; seq.forEach((f, i) => tone({ t0: t + i * 0.08, f, d: 0.16 + i * 0.05, peak: 0.12, send: 0.3 })); for (let i = 0; i < 4; i++) tone({ t0: t + 0.34 + i * 0.03, f: 2000 + Math.random() * 2500, d: 0.09, peak: 0.03, send: 0.5 }); } },
  sparkle:  { cat: "state", key: "K", ds: "a handful of glitter", fn(t) { for (let i = 0; i < 6; i++) tone({ t0: t + i * 0.035, f: 1600 + Math.random() * 3000, d: 0.1, peak: 0.045, send: 0.5 }); } },
};

/** Cue metadata: { family, key, description } per cue name. Synth functions stay private. */
export const cues = Object.freeze(Object.fromEntries(
  Object.entries(CUES).map(([n, c]) => [n, Object.freeze({ family: c.cat, key: c.key, description: c.ds })])
));

/** The seven cue families. */
export const families = Object.freeze({
  pointer:  Object.freeze({ name: "Pointer",  description: "grains and breaths for hover and focus" }),
  press:    Object.freeze({ name: "Press",    description: "weight for down-strokes and keys" }),
  toggle:   Object.freeze({ name: "Toggle",   description: "paired figures for binary state" }),
  feedback: Object.freeze({ name: "Feedback", description: "verdicts \u2014 lifted, flat, or blocked" }),
  notify:   Object.freeze({ name: "Notify",   description: "bells and pings for the unasked-for" }),
  motion:   Object.freeze({ name: "Motion",   description: "air and travel for transitions" }),
  state:    Object.freeze({ name: "State",    description: "loading, ready, and the arrival" }),
});

/* ---------------- public API ---------------- */

/** Resume/create the AudioContext. Call from a user gesture, or let play()/bind() handle it. */
export function unlock() { T.ensure(); }

/** The engine's AnalyserNode (2048-point), or null before the first unlock. For scopes and meters. */
export function getAnalyser() { return T.analyser; }

/** Update engine settings: volume (0\u20131), transpose (semitones), space (0\u20131 reverb), muted, hover, theme. */
export function set(opts) {
  if (!opts) return;
  if (opts.volume != null) {
    T.settings.volume = opts.volume;
    if (T.ctx && !T.settings.muted) T.master.gain.setTargetAtTime(opts.volume, T.ctx.currentTime, 0.02);
  }
  if (opts.space != null) {
    T.settings.space = opts.space;
    if (T.ctx) T.wet.gain.setTargetAtTime(opts.space, T.ctx.currentTime, 0.02);
  }
  if (opts.muted != null) {
    T.settings.muted = opts.muted;
    if (T.ctx) T.master.gain.setTargetAtTime(opts.muted ? 0 : T.settings.volume, T.ctx.currentTime, 0.02);
  }
  if (opts.transpose != null) T.settings.transpose = opts.transpose;
  if (opts.hover != null) T.settings.hover = opts.hover;
  if (opts.theme != null && THEMES[opts.theme]) {
    T.settings.theme = opts.theme;
    theme = THEMES[opts.theme];
  }
}

/** A snapshot of the current settings. */
export function get() { return Object.assign({}, T.settings); }

/** Play a cue by name. Options: { pitch: semitones, volume: 0\u20131 multiplier }. */
export function play(name, opts) {
  const cue = CUES[name];
  if (!cue) return;
  /* per-cue cooldown: a cue re-fires at most every 60ms, so event storms stay musical */
  const nowMs = performance.now();
  if (nowMs - (T._cool[name] || 0) < 60) return;
  T._cool[name] = nowMs;
  T.ensure();
  opts = opts || {};
  const t0 = T.ctx.currentTime + 0.015;
  const prevT = T.settings.transpose;
  /* humanization: \u00b130 cents and \u00b18% level per performance \u2014 whole cue shifts together */
  const drift = Math.random() * 0.6 - 0.3;
  T.settings.transpose = prevT + (opts.pitch || 0) + drift;
  T._scale = (opts.volume != null ? opts.volume : 1) * (0.92 + Math.random() * 0.16);
  cue.fn(t0);
  T._scale = 1;
  T.settings.transpose = prevT;
  emit("play", { name, family: cue.cat });
}

/** Wire every data-foley-* attribute under root (default: document).
    Attributes: data-foley-hover, -press, -release, -click, -toggle, -type. Safe to call again. */
export function bind(root) {
  root = root || document;
  root.querySelectorAll("[data-foley-hover]").forEach((el) => {
    if (el._fyH) return; el._fyH = 1;
    el.addEventListener("pointerenter", () => { if (T.settings.hover) play(el.getAttribute("data-foley-hover") || "tick"); });
  });
  root.querySelectorAll("[data-foley-press]").forEach((el) => {
    if (el._fyP) return; el._fyP = 1;
    el.addEventListener("pointerdown", () => play(el.getAttribute("data-foley-press") || "press"));
  });
  root.querySelectorAll("[data-foley-release]").forEach((el) => {
    if (el._fyR) return; el._fyR = 1;
    el.addEventListener("pointerup", () => play(el.getAttribute("data-foley-release") || "release"));
  });
  root.querySelectorAll("[data-foley-click]").forEach((el) => {
    if (el._fyC) return; el._fyC = 1;
    el.addEventListener("click", () => play(el.getAttribute("data-foley-click") || "tap"));
  });
  root.querySelectorAll("[data-foley-toggle]").forEach((el) => {
    if (el._fyT) return; el._fyT = 1;
    el.addEventListener("click", () => {
      const pressed = el.getAttribute("aria-pressed") === "true";
      play(pressed ? "on" : "off");
    });
  });
  root.querySelectorAll("[data-foley-type]").forEach((el) => {
    if (el._fyY) return; el._fyY = 1;
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { play("complete"); return; }
      if (e.key.length === 1 || e.key === "Backspace") play(el.getAttribute("data-foley-type") || "thock", { pitch: (Math.random() * 2 - 1) });
    });
  });
  /* first gesture anywhere unlocks audio */
  ["pointerdown", "keydown"].forEach((ev) =>
    document.addEventListener(ev, () => T.ensure(), { once: true, capture: true })
  );
}

/* ---------------- offline render & WAV export ---------------- */

/** Render a cue to a 16-bit 44.1kHz stereo WAV Blob, honoring the current transpose, space, and theme.
    Deterministic: no humanization drift is applied to exports. */
export async function toWav(name) {
  const cue = CUES[name];
  if (!cue) return null;
  const rate = 44100;
  const off = new OfflineAudioContext(2, Math.ceil(rate * 2.8), rate);
  /* temporarily point the engine at the offline graph; scheduling is synchronous */
  const saved = { ctx: T.ctx, dry: T.dry, verb: T.verb, wet: T.wet, master: T.master, noise: T._noise };
  T.ctx = off; T._noise = null;
  T.master = off.createGain(); T.master.gain.value = 1;
  const lim = off.createDynamicsCompressor();
  lim.threshold.value = -10; lim.knee.value = 4; lim.ratio.value = 12;
  lim.attack.value = 0.002; lim.release.value = 0.12;
  T.master.connect(lim); lim.connect(off.destination);
  T.dry = off.createGain(); T.dry.connect(T.master);
  T.verb = off.createConvolver(); T.verb.buffer = T.makeIR(1.4, 3.2);
  T.wet = off.createGain(); T.wet.gain.value = T.settings.space;
  T.verb.connect(T.wet); T.wet.connect(T.master);
  try { cue.fn(0.03); }
  finally {
    T.ctx = saved.ctx; T.dry = saved.dry; T.verb = saved.verb;
    T.wet = saved.wet; T.master = saved.master; T._noise = saved.noise;
  }
  const buf = await off.startRendering();
  return encodeWav(trimAndNormalize(buf), rate);
}

function trimAndNormalize(buf) {
  const L = buf.getChannelData(0), R = buf.getChannelData(1);
  let end = L.length - 1, peak = 0;
  for (let i = 0; i < L.length; i++) {
    const m = Math.max(Math.abs(L[i]), Math.abs(R[i]));
    if (m > peak) peak = m;
    if (m > 0.001) end = i;
  }
  const len = Math.min(L.length, end + Math.floor(buf.sampleRate * 0.08));
  const scale = peak > 0 ? 0.891 / peak : 1; /* about -1 dBFS */
  return {
    left: Float32Array.prototype.slice.call(L, 0, len).map((v) => v * scale),
    right: Float32Array.prototype.slice.call(R, 0, len).map((v) => v * scale),
    length: len,
  };
}

function encodeWav(d, rate) {
  const n = d.length, bytes = 44 + n * 4;
  const ab = new ArrayBuffer(bytes), v = new DataView(ab);
  function str(o, x) { for (let i = 0; i < x.length; i++) v.setUint8(o + i, x.charCodeAt(i)); }
  str(0, "RIFF"); v.setUint32(4, bytes - 8, true); str(8, "WAVE");
  str(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true);
  str(36, "data"); v.setUint32(40, n * 4, true);
  let o = 44;
  for (let i = 0; i < n; i++) {
    v.setInt16(o, Math.max(-1, Math.min(1, d.left[i])) * 0x7FFF, true); o += 2;
    v.setInt16(o, Math.max(-1, Math.min(1, d.right[i])) * 0x7FFF, true); o += 2;
  }
  return new Blob([ab], { type: "audio/wav" });
}
