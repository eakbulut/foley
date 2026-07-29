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
  /** Active sound theme. Default "default". */
  theme: ThemeName;
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

/** Play a cue. Applies the per-cue 60ms cooldown and ±30-cent humanization. */
export declare function play(name: CueName, opts?: PlayOptions): void;

/** Wire every data-foley-* attribute under root (default: document). Idempotent. */
export declare function bind(root?: ParentNode): void;

/** Update engine settings. Only the provided keys change. */
export declare function set(opts: Partial<Settings>): void;

/** A snapshot of the current settings. */
export declare function get(): Settings;

/** Render a cue to a 16-bit 44.1 kHz stereo WAV Blob, honoring transpose, space, and theme.
    Deterministic: exports skip humanization. */
export declare function toWav(name: CueName): Promise<Blob>;

/** Resume/create the AudioContext. Call from a user gesture, or let play()/bind() handle it. */
export declare function unlock(): void;

/** The engine's AnalyserNode (fftSize 2048), or null before the first unlock. */
export declare function getAnalyser(): AnalyserNode | null;

/** Subscribe to "play" or "unlock" events. Returns an unsubscribe function. */
export declare function on(event: "play", cb: (e: PlayEvent) => void): () => void;
export declare function on(event: "unlock", cb: (e: Record<string, never>) => void): () => void;
