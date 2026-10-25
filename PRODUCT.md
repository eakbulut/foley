# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## What it is

Foley (`@foleyjs/core`, plus `@foleyjs/react` and `@foleyjs/vue`) is a tiny,
dependency-free JavaScript library of 28 UI interaction sounds in 7 families
(pointer, press, toggle, feedback, notify, motion, state). Every cue is
synthesized live with Web Audio at the instant of the action: no audio files, no
network requests, no build step. Named for film foley artists, who perform sound
in sync with the picture.

Mechanism that sets it apart: sounds are data, not samples. Cues are layer specs
that can be re-themed (default, soft, mechanical, glass), transposed, placed in
space, edited in the Cue Designer, exported as WAV or an audio sprite, and
shipped as a sound set (a product's sonic identity as JSON).

## Users

Two audiences, weighted equally:

- **Frontend developers** arriving from npm, GitHub, or podcasts (Syntax). Job:
  hear it within seconds, trust that it is small and safe, copy the install.
- **Design engineers and product designers.** Job: shape cues in the Cue
  Designer, build a sound set, export WAVs for Figma, video, or native apps.
- Secondary: users' coding agents, served by `agents.md`.

## Product facts to preserve

- 28 cues, 7 families, 4 themes. Marketing says "28 cues" exactly (tested).
- Size claim lives in the version badge (`vX.Y.Z · N kB`, min+gzip) and is
  mirrored in the README; both are test-guarded.
- Declarative `data-foley-*` attributes + `bind()` (delegated, keyboard focus),
  `observe()` for things the interface does on its own, imperative `play()`,
  `set()`, spatial `pan`/`pos`/`localize`, master limiter, cooldown,
  humanization, background-tab silence, WAV/sprite export, sound sets.
- MIT licensed. Sibling library: Dolly (usedolly.dev), scroll-driven motion.
- Site: usefoley.dev (GitHub Pages), docs.html generated from README,
  agents.md shipped alongside, GoatCounter analytics.

## Voice and brand commitments

- Copy is playful and built on jokes that are also the premise; dry spec-sheet
  copy is rejected. It must still define the product for a stranger.
- The fictional testimonials stay, intentionally absurd.
- Sentence case, no marketing adjectives, prose blocks ~19-45 words.

## Constraints

See CLAUDE.md: one module script in index.html, localStorage only inside the
STORE markers, analytics stripped from the standalone build, tests enumerate
docs/UI freshness. Accessibility: reduced-motion fallbacks are test-guarded;
audio must never be required to understand the page.
