/** foley — sound effects for the interface, performed live. */

export type CueName =
  | "tick" | "hover" | "glide" | "pop"
  | "press" | "release" | "tap" | "thock"
  | "on" | "off" | "switch" | "latch"
  | "success" | "error" | "warning" | "denied"
  | "chime" | "ping" | "bell" | "bubble"
  | "swoosh" | "whoosh" | "drop" | "rise"
  | "loading" | "ready" | "complete" | "sparkle";

export type FamilyName =
  | "pointer" | "press" | "toggle" | "feedback" | "notify" | "motion" | "state";

export type ThemeName = "default" | "soft" | "mechanical" | "glass";

export interface PlayOptions {
  /** Extra transpose for this play only, in semitones. */
  pitch?: number;
  /** Level multiplier for this play only, 0–1. */
  volume?: number;
  /** Repeat until .stop() is called — for loading states. */
  loop?: boolean;
  /** Loop period in seconds (default: the sound's own duration). */
  every?: number;
  /** Stereo placement for this play only, -1 (left) to 1 (right). Fixed at trigger. */
  pan?: number;
  /** 3D placement for this play only, [x, y, z] (HRTF, inverse distance).
      Wins over `pan`. Fixed at trigger — cues are one-shots, nothing repositions. */
  pos?: [number, number, number];
}

export interface ThemeTransform {
  pitch?: number; attack?: number; decay?: number; send?: number;
  noiseLvl?: number; noiseF?: number; q?: number; shimmer?: boolean;
  wave?: Partial<Record<WaveName, WaveName>> | null;
}

/** A portable sonic identity: a global transform plus per-cue spec overrides.
    Load one with set({ theme: soundSet }); snapshot the current one with getSet(). */
export interface SoundSet {
  /** Display name; becomes get().theme. */
  name?: string;
  /** Global character transform applied to every cue. */
  transform?: ThemeTransform;
  /** Full replacement specs for individual cues. */
  cues?: Partial<Record<CueName, Spec>>;
}

export interface PlayHandle {
  /** Fade this performance out (~20ms) and, if looping, stop the loop. */
  stop(): void;
}

export interface Settings {
  /** Global loudness, 0–1. Default 0.7. */
  volume: number;
  /** Global transpose in semitones. Default 0. */
  transpose: number;
  /** Reverb send, 0–1. Default 0.22. */
  space: number;
  /** Silences the whole engine when true. */
  muted: boolean;
  /** Whether data-foley-hover elements play on pointerenter. Default true. */
  hover: boolean;
  /** Active sound theme name; "custom" when a ThemeTransform object was set. */
  theme: ThemeName | "custom";
  /** Temporary attenuation multiplier (0-1), e.g. while a video plays. Default 1. */
  duck: number;
  /** Stereo spread for bind()'s cues, 0–1: each one pans to its element's place
      on screen. 0 (default) keeps everything centered. */
  localize: number;
}

export interface CueMeta {
  family: FamilyName;
  /** Suggested keyboard key for playground UIs. */
  key: string;
  description: string;
}

export interface PlayEvent {
  name: CueName;
  family: FamilyName;
}

/** Library version. */
export declare const version: string;

/** Metadata for all 28 cues, keyed by name. */
export declare const cues: Readonly<Record<CueName, Readonly<CueMeta>>>;

/** The seven cue families. */
export declare const families: Readonly<Record<FamilyName, Readonly<{ name: string; description: string }>>>;

/** Available theme names. */
export declare const themes: readonly ThemeName[];

/** Play a cue. Applies the per-cue 60ms cooldown and ±30-cent humanization.
    Returns a handle whose stop() fades the performance out. */
export declare function play(name: CueName, opts?: PlayOptions): PlayHandle | undefined;

/** Wire every data-foley-* attribute under root (default: document). Idempotent.
    With a nonzero `localize` setting, each cue pans to its element's screen position. */
export declare function bind(root?: ParentNode): void;

/** The pan (-1..1) the current `localize` setting derives for an element, or 0 when
    localize is off. bind() applies it automatically; use it for your own play() calls. */
export declare function panFor(el: Element | null): number;

/** Update engine settings. Only the provided keys change.
    theme accepts a name or a custom ThemeTransform object. */
export declare function set(opts: Partial<Omit<Settings, "theme">> & { theme?: ThemeName | ThemeTransform | SoundSet }): void;

/** A snapshot of the current settings. */
export declare function get(): Settings;

/** Render a cue to a 16-bit 44.1 kHz stereo WAV Blob, honoring transpose, space, and theme.
    Deterministic: exports skip humanization. */
export declare function toWav(name: CueName): Promise<Blob>;

/** Offline-render a cue to an AudioBuffer for envelopes, meters, or custom encoding. */
export declare function toBuffer(name: CueName): Promise<AudioBuffer>;

export type WaveName = "sine" | "triangle" | "square" | "sawtooth";
export type FilterName = "bandpass" | "lowpass" | "highpass";

export interface ToneLayer {
  kind: "tone"; at: number; wave: WaveName; f: number; f2: number | null;
  glide: number; a: number; d: number; peak: number; send: number;
}
export interface NoiseLayer {
  kind: "noise"; at: number; filter: FilterName; f: number; f2: number | null;
  glide: number; q: number; a: number; d: number; peak: number; send: number;
}
export interface ClusterLayer {
  kind: "cluster"; at: number; n: number; step: number; fMin: number; fMax: number;
  d: number; peak: number; send: number; seed: number;
}
export type Layer = ToneLayer | NoiseLayer | ClusterLayer;
export type Spec = Layer[];

export interface PlaySpecOptions extends PlayOptions {
  /** Keys the 60ms per-cue cooldown. Default "custom". */
  id?: string;
}

/** A deep, editable copy of the cue's effective spec (the active sound set's override, or the built-in). */
export declare function getSpec(name: CueName): Spec;

/** Snapshot the active sonic identity as a portable SoundSet. */
export declare function getSet(): SoundSet;

/** Validate and clamp a spec into a safe, playable copy (max 8 layers). */
export declare function normalizeSpec(spec: unknown): Spec;

/** Play a custom spec through the engine (normalized first). */
export declare function playSpec(spec: Spec, opts?: PlaySpecOptions): PlayHandle | undefined;

/** Offline-render a custom spec to an AudioBuffer (normalized first). */
export declare function toBufferSpec(spec: Spec): Promise<AudioBuffer | null>;

/** Render a custom spec to a 16-bit 44.1 kHz stereo WAV Blob (normalized first). */
export declare function toWavSpec(spec: Spec): Promise<Blob | null>;

/** Render all 28 cues into one audio sprite: a WAV Blob plus { name: { start, duration } } offsets in seconds. */
export declare function toSprite(gap?: number): Promise<{ blob: Blob; map: Record<CueName, { start: number; duration: number }> }>;

/** Resume/create the AudioContext. Call from a user gesture, or let play()/bind() handle it. */
export declare function unlock(): void;

/** The engine's AnalyserNode (fftSize 2048), or null before the first unlock. */
export declare function getAnalyser(): AnalyserNode | null;

/** Subscribe to "play" or "unlock" events. Returns an unsubscribe function. */
export declare function on(event: "play", cb: (e: PlayEvent) => void): () => void;
export declare function on(event: "unlock", cb: (e: Record<string, never>) => void): () => void;
