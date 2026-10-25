---
name: Foley
description: UI sound effects, performed live. Every cue lettered as it plays.
colors:
  paper: "#FFFFFF"
  ink: "#121212"
  ink-soft: "#3B3B3B"
  ink-faint: "#666663"
  rule: "#DADAD6"
  yellow: "#FFE01B"
  yellow-deep: "#F5C800"
  cyan: "#0EA5D9"
  magenta: "#E0137F"
  night: "#121212"
  night-ink: "#F4F4F0"
  c-pointer: "#F5B700"
  c-press: "#E8362B"
  c-toggle: "#2563EB"
  c-feedback: "#13A04F"
  c-notify: "#E0137F"
  c-motion: "#0EA5D9"
  c-state: "#7C3AED"
  err: "#D7261E"
typography:
  display:
    fontFamily: "Bangers, Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "clamp(52px, 6.4vw, 92px)"
    fontWeight: 400
    lineHeight: 0.92
    letterSpacing: "0.01em"
  headline:
    fontFamily: "Bangers, Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "clamp(40px, 4.6vw, 64px)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "0.01em"
  title:
    fontFamily: "Bangers, Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.02em"
  sfx-tile:
    fontFamily: "Bangers, Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.03em"
  lede:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  control:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "14.5px"
    fontWeight: 700
    lineHeight: 1
  caption:
    fontFamily: "Patrick Hand SC, Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "16.5px"
    fontWeight: 400
    lineHeight: 1.2
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "13.5px"
    fontWeight: 400
    lineHeight: 1.75
rounded:
  panel: "0px"
  sm: "6px"
  md: "8px"
  lg: "10px"
  toast: "18px"
  balloon: "26px"
  pill: "999px"
spacing:
  gut: "14px"
  gut-compact: "10px"
  wrap: "24px"
  wrap-compact: "12px"
  panel: "20px"
  block: "64px"
  block-compact: "44px"
components:
  button:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "13px 20px"
  button-hover:
    backgroundColor: "{colors.yellow}"
  button-primary:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "13px 20px"
  button-primary-hover:
    backgroundColor: "{colors.yellow-deep}"
  button-sm:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "38px"
    padding: "0 13px"
  seg-option-on:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    padding: "9px 14px"
  caption-box:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.panel}"
    padding: "4px 9px"
  cue-tile:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "12px"
  hero-pill:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "9px 14px 7px"
  text-input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "11px 12px"
  code-panel:
    backgroundColor: "{colors.night}"
    textColor: "{colors.night-ink}"
    typography: "{typography.mono}"
    rounded: "{rounded.panel}"
    padding: "52px 20px 18px"
---

# Design System: Foley

## Overview

**Creative North Star: "Sound Words"**

Comics solved silent sound by lettering it. Foley's cues are already onomatopoeia, so the page is a comic page: bright white stock, square panels drawn in a 3px ink line, one 14px gutter between every panel, and Bangers lettering with an ink outline and extrusion that names each cue as it plays. Colour is printed, not glowed: process yellow is the page's signal, seven flat family plates mark the cue families, and Ben-Day halftone dots are the only texture.

The page reads as panels laid on a grid, never as cards in a dashboard. Sections are unframed bands of paper; the framed things inside them are panels, and a panel is never put inside another framed section. Hand-lettered captions (Patrick Hand SC) sit in yellow boxes pinned to panel corners or as panel notes; speech balloons carry testimonials and toasts; code lives in night panels. Depth comes from line weight and halftone, not shadow.

The world is light only. There is no dark theme; night is a panel type, not a mode.

**Key Characteristics:**
- Bright white paper, ink line art, square panel corners, one gutter.
- Bangers SFX lettering, outlined and extruded in ink, shaped per letter by the cue's real envelope.
- Process yellow as the single signal colour; seven family plates appear only where a family is named or playing.
- Halftone dots as hover texture and as the flood when a cue plays.
- Caption boxes and balloons in Patrick Hand SC carry the narrator's voice.
- Night panels with a labelled header strip for every code sample.
- Self-hosted fonts from `assets/fonts`; nothing loads from a font CDN.

## Colors

A printed palette: white stock, near-black ink, one process yellow, and seven flat spot plates for the cue families.

### Primary
- **Process Yellow** (`yellow`): the page's signal. Primary buttons, caption boxes, selected toggles and range fills, inline code chips, version and attribute tags, hover fills on secondary controls, text selection, the theme colour, the lettered logo.
- **Deep Yellow** (`yellow-deep`): pressed or hovered yellow only (primary button hover, the halftone dots of the yellow closing panel).

### Secondary
- **Family plates** (`c-pointer` marigold, `c-press` fire red, `c-toggle` cobalt, `c-feedback` go green, `c-notify` magenta, `c-motion` cyan, `c-state` violet): one per cue family, in fixed order. They tint the family head (16% over paper), flood a tile or the stage while its cue plays, fill a hero pill on hover, and colour the family dots. They are identifiers, not decoration.

### Tertiary
- **Cyan** (`cyan`): the focus ring (3px outline, 2px offset), on every surface.
- **Magenta** (`magenta`): the text caret.
- **Alarm Red** (`err`): destructive text actions only (the designer's kill link).

### Neutral
- **Paper** (`paper`): every surface. Pure white, modern process stock, not newsprint.
- **Ink** (`ink`): all line art, borders, lettering outline, headings, and body emphasis.
- **Soft Ink** (`ink-soft`): body prose, ledes, descriptions, captions in muted roles.
- **Faint Ink** (`ink-faint`): placeholders only.
- **Rule** (`rule`): gridlines inside instruments (canvases), never panel borders.
- **Night** (`night`) and **Night Ink** (`night-ink`): code panels and the install line.

### Named Rules
**The One Signal Rule.** Yellow is the only interface accent. Hover, selected, and primary states all resolve to yellow (or ink-on-paper inversion for segmented choices); a family plate never stands in for UI state.

**The Plate Discipline Rule.** A family colour appears only where its family is named or its cue is sounding. Canvases read plates through the page's `cssVar()` helper; no hex is hardcoded in script except as a fallback argument.

**The Flood Rule.** When a cue plays, its family plate floods the surface as halftone over a tint: dots at 70-75% plate over a 22-30% plate tint (stage 22% with 11px dots, tiles 30% with 9px dots). Floods are state, never resting decoration.

## Typography

**Display Font:** Bangers (with Schibsted Grotesk, system-ui)
**Body Font:** Schibsted Grotesk (variable 400-900, with system-ui)
**Label/Mono Font:** Patrick Hand SC for captions and balloons; JetBrains Mono for code, values, and tags

**Character:** Bangers is the SFX letterer, loud and tilted; Schibsted Grotesk is the plain-spoken narrator that keeps the product legible; Patrick Hand SC is the hand-lettered caption voice. All four are self-hosted woff2 files in `assets/fonts`, preloaded for Bangers and Schibsted.

### Hierarchy
- **Display** (Bangers 400, clamp(52px, 6.4vw, 92px), 0.92): the H1 only; its lettered second line is 1.08em in full SFX treatment.
- **Headline** (Bangers 400, clamp(40px, 4.6vw, 64px), 0.95): section heads, paired on a 7:5 grid with a 17px sub at 52ch.
- **Title** (Bangers 400, 28px, 1, 0.02em): step titles, family names, toast heads at 22px.
- **SFX tile** (Bangers 400, 34px, 1, 0.03em; 28px under 600px): cue names on tiles.
- **Lede** (Schibsted 400, 19px, 1.5, max 44ch): the splash lede only.
- **Body** (Schibsted 400, 16px, 1.55): prose; answers cap at 62ch.
- **Control** (Schibsted 700-800, 14-16px): buttons, segmented options, labels. Weight, not size, carries control hierarchy.
- **Caption** (Patrick Hand SC, 16-19px, 1.2): caption boxes, balloon text (18px), sub-notes, status lines.
- **Mono** (JetBrains Mono, 12-15px, weight 600 for tags): code, knob values, attribute tags, the version box.

### Named Rules
**The Lettering Rule.** SFX lettering is one construction: Bangers in a fill colour (`--fc`, default yellow) with an eight-direction 0.035em ink outline plus a two-step extrusion (0.05em/0.06em, 0.065em/0.08em), all in `text-shadow` so it renders on every engine. Because it is in em, it scales with the word. Lettered cue words split into per-letter spans sized by the cue's real envelope (`--v` = 0.56 + 0.44 x envelope) and tilted by its slope (`--tilt`, rotated from the letter's baseline).

**The Headings Are Lettered Rule.** H1, H2, and H3 are Bangers at weight 400 with tight line-height (0.9-1). Only the logo, the H1's second line, the stage word, pop-words, and the closing word get the full outline-and-extrusion treatment; section heads stay flat ink.

**The Narrator Rule.** Patrick Hand SC is for the narrator (captions, balloons, notes). It never sets a heading, a button, or a label above a heading.

## Layout

A comic page on a 1280px max-width `wrap` with 24px side padding (12px under 600px). Every gap between panels, at every level, is the one gutter `--gut` (14px; 10px under 600px). The splash is two panels at 5:7; the letters strip is a 220px caption panel beside the balloon track; the cue board is a 190px family head plus four tiles per row, seven rows; the playground is a 4x2 page; the closing spread is 7:5. Section bands sit one gutter apart with 64px top padding (44px compact).

Columns are explicit counts that divide the item count (4 to 2 to 1 for eight demos; four tiles per family become two with the head spanning the row at 960px). Every grid track is `minmax(0, ...)` and every panel carries `min-width: 0`.

Breakpoints shed, they do not wrap: at 1040px the agents.md link leaves the masthead, at 920px the nav collapses into a menu, at 960px two-column spreads stack, at 600px the gutter tightens and family descriptions drop, at 380px the version box goes.

### Named Rules
**The One Gutter Rule.** Panel-to-panel spacing is `--gut` and nothing else. If two framed things touch, they are separated by the gutter or they share a 2px inner divider inside one panel (the mixing desk); never an ad-hoc gap.

**The Flat Page Rule.** Panels are never nested inside framed sections. Sections are unframed bands; panels sit directly on paper.

**The Divisible Grid Rule.** Never `repeat(auto-fit, minmax())` for panels with uneven content. Choose a column count that divides the item count, reserve text zones, and bottom-anchor metadata with `margin-top: auto`.

## Elevation & Depth

Flat. Nothing on the page casts a box-shadow. Depth is printed: the 3px ink line separates panels from paper, halftone dots (ink at 16% on hover, family plate when sounding) give surfaces texture, and the only "lift" is the lettering's own text-shadow extrusion. Press feedback is a 2-3px downward translate, not a shadow. The single shadow in the build is an inset 2.5px ink ring on the switch thumb, which is line art, not elevation.

### Named Rules
**The Printed Depth Rule.** Depth comes from line weight and halftone. No box-shadows, no blur, no glow; hard offset slabs (`0 2px 0 #000`) are banned. Extrusion belongs to lettering only.

## Shapes

Two shape families. Panels are square: framed in a 3px ink line (`--line`), radius 0, including code panels. Controls are softly rounded in a 2-2.5px ink line: 6px for key caps and small icon buttons, 8px for compact buttons, nav hovers and selects, 10px for buttons, segmented controls, inputs and steppers, 999px for pills, switches and range tracks. Balloons are the third, narrative form: 26px radius with a clipped ink tail for testimonials, 18px for toasts. The stage starburst is a hand-drawn polygon in a 2.2px non-scaling ink stroke. Dashed 2-2.5px ink borders mark drop zones and optional strips (upload, MIDI).

### Named Rules
**The Line Weight Rule.** 3px is the panel line; 2-2.5px is control chrome; 2px is an inner divider; 1.5px is a chip or value tag. Never mix a panel at control weight.

## Components

### Buttons
Tactile and inked, they press down rather than light up.
- **Shape:** 10px radius, 2.5px ink border, 800 weight 16px, 13px 20px padding.
- **Primary:** process yellow fill; hover adds the ink halftone over deep yellow.
- **Default:** paper fill; hover becomes halftone over yellow.
- **Active:** translate 2px down (0.12s, cubic-bezier(.2,.9,.3,1)). Disabled at 50% opacity.
- **Small:** 38px tall, 2px border, 8px radius, 14px.
- **Copy button (night):** transparent with a night-ink 2px outline, 7px radius; hover fills yellow with ink text.
- **Text actions:** 800 weight with a 2px underline at 4px offset; destructive ones in alarm red.

### Segmented Control and Switches
- **Segmented:** 2.5px ink frame, 10px radius, options split by 2px ink dividers; hover is halftone; the pressed option inverts to ink on paper. Reuse it; never invent new control chrome.
- **Pill toggle / switch:** 999px track in 2.5px ink with an ink thumb; on fills yellow (or the toggle plate in the playground demo).
- **Range:** 12px pill track in 2px ink, yellow fill up to `--fill`, paper thumb in 2.5px ink that turns yellow while held.
- **Knob:** label in 800 weight, value in a mono yellow tag at the right, caption-voice sub-line. The mixing desk lays knobs inside one 3px panel split by 2px dividers.

### Caption Box
The narrator's box: Patrick Hand SC 16.5px, yellow fill, 2px ink border, square, 4px 9px padding. It sits in a panel's top-left corner at 14px (stage, closing word, the latter on paper) or as a note at the foot of a panel (audio unlock hint, designer note). It never sits above a section heading as an eyebrow or kicker.

### Cue Tile
A square panel (3px ink, paper) with a key cap in its top-left (mono 12px, 2px border, 6px radius), a download icon top-right, the cue name in SFX tile type, a 28px envelope canvas, and a 13.5px description bottom-anchored. Hover lays ink halftone; while playing, the family flood fills it and the name scales 1.12 and tilts -3deg. Family heads are panels tinted 16% with a 16px family dot.

### Stage
The splash's right panel: family flood (halftone over 22% tint) behind a paper starburst rotated -4deg, the last cue's word lettered by its envelope at up to 10rem (container-sized by letter count), a corner caption, and a footer strip of hero pills behind a 3px top line. On play the word slams in from 1.35 scale and -11deg over 0.5s (cubic-bezier(.16,1,.3,1)).

### Hero Pill
Bangers 24px in a 999px pill, 2.5px ink, each set at its own small tilt (`--r`, -3 to 3deg). Hover straightens it, scales 1.06, and fills it with its family plate.

### Balloons and Toasts
Testimonial balloons: Patrick Hand SC 18px on paper, 2.5px ink, 26px radius, a clipped ink tail at the lower left, attribution in caption voice indented under the tail. Toasts: 18px-radius balloons arriving bottom-right with a family dot and a Bangers 22px head, entering with a 14px rise and 2deg tilt.

### Night Code Panel
Every code sample is a night panel: night fill, 3px ink frame, square, mono 13.5px at 1.75. A 40px header strip, separated by a 2px dark rule, carries the file or context label (`data-label`) in caption voice, with the copy button pinned top-right. Syntax uses yellow strings; comments, keywords, and attributes take muted grey, pink, and sky tints. The install line is the same panel compressed to one row with a yellow prompt.

### Inputs
Paper field, 2.5px ink border, 10px radius, 11px 12px padding, faint-ink placeholder; the cyan focus ring is global. Selects match at 2px and 8px with an inked chevron.

### Navigation
Sticky masthead on paper with a 3px bottom line, 68px tall (60px compact): lettered logo at 38px, a mono version-and-size box in a 2px square frame, then 700-weight links that hover to yellow at 8px radius and a framed GitHub link. Items shed at breakpoints; below 920px the links drop into a full-width panel under the masthead.

### FAQ
One column of 3px square panels (max 920px) so an opened answer never stretches a neighbour. Summary in 800 weight 17px with a 22px yellow plus box at the right that turns to a paper minus when open; hover is halftone.

### Docs Page (reduced)
The generated docs share the tokens on an 860px column: sticky masthead with the lettered logo and a yellow issue tag, Bangers H1-H3 with a 3px ink rule over each H2, yellow inline code chips, night `pre` panels, and tables framed in 3px ink with yellow header rows.

## Do's and Don'ts

### Do:
- **Do** separate every panel by `--gut` (14px, 10px compact) and frame it in the 3px ink `--line` with square corners.
- **Do** letter cue words with the shared `.sfx` construction (em-based outline and extrusion) and per-letter `--v` and `--tilt` from the cue's envelope.
- **Do** flood a surface with its family plate while its cue sounds: halftone at 70-75% over a 22-30% tint.
- **Do** pin caption boxes into panel corners or panel feet, in Patrick Hand SC on yellow.
- **Do** put every code sample in a night panel with a labelled 40px header strip.
- **Do** read colours in canvases through `cssVar()`, with hex only as the fallback argument.
- **Do** load fonts from `assets/fonts` and keep the page light.
- **Do** honour reduced motion: the slam, burst, pop-word, marquee, and toasts collapse to instant.

### Don't:
- **Don't** nest a panel inside a framed section, or frame a section band.
- **Don't** use `repeat(auto-fit, minmax())` for panels; pick column counts that divide the item count.
- **Don't** add box-shadows, glows, or hard offset slabs; depth is line and halftone.
- **Don't** put a caption box, kicker, or eyebrow label above a heading.
- **Don't** use a family plate as UI state or decoration; state is yellow or ink inversion.
- **Don't** invent new control chrome; reuse the button, segmented control, and knob.
- **Don't** ship a dark theme or load fonts from a CDN.
