# Changelog

## 2.3.0
- New `toBuffer(name)` export: offline-render any cue to an AudioBuffer for envelopes, meters, or custom encoding.
- Demo: real per-cue envelope drawings on every chip, computed from offline renders and redrawn on theme change.
- Demo: waveform/spectrum toggle on the oscilloscope (96-bar FFT view).
- Demo: settings persistence (volume, transpose, space, theme, hover) via localStorage; the single-file build falls back to in-memory.
- Demo: touch devices hide keyboard hints and get touch-appropriate copy.
- Framework recipes: `recipes/react.js` (`useFoley` hook), `recipes/vue.js` (`v-foley` directive), and `agents.md` for AI coding assistants.
- Tooling: `scripts/build-standalone.mjs`, a `node --test` suite, CI, and GitHub Pages deployment.

## 2.2.0
- Four sound themes — `default`, `soft`, `mechanical`, `glass` — applied as engine-level transforms so every cue (and every WAV export) inherits them. `set({ theme })`.
- Themed export filenames (`foley-glass-chime.wav`, `foley-cues-mechanical.zip`).

## 2.1.0
- Master limiter (brick-wall DynamicsCompressor) so overlapping cues never clip; also applied to offline exports for tonal parity.
- 60ms per-cue cooldown so event storms stay musical.
- Humanization: ±30 cents pitch and ±8% level per performance, whole-cue coherent. Exports remain deterministic.
- Demo: picture-in-picture mini scope; main scope relocated into the cue board and made sticky.

## 2.0.0
- **Breaking:** renamed from `tactone` to **Foley**. All attributes changed from `data-tactone-*` to `data-foley-*`.
- New tagline and identity: "Sound effects for the interface, performed live."

## 1.1.0
- WAV export: per-cue offline rendering to 16-bit 44.1 kHz stereo, trimmed and peak-normalized; zip export of the full set.
- Corrected the cue count: 28 cues in 7 families (the copy previously claimed 24 in 6).

## 1.0.1
- Tour now plays all cues in board order and scrolls each into view before it fires.
- Removed experimental vibration/haptics support: unreliable across platforms (no iOS web API, blocked in sandboxed embeds).

## 1.0.0
- Initial release (as `tactone`): 28 synthesized interaction cues, declarative `data-*` binding, live oscilloscope demo, inspector with volume/transpose/reverb.
