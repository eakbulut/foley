import type { CueName, Settings, PlayOptions, PlayEvent } from "@foleyjs/core";

export interface FoleyHandle {
  play(name: CueName, opts?: PlayOptions): void;
  set(opts: Partial<Settings>): void;
  get(): Settings;
  toWav(name: CueName): Promise<Blob>;
  toBuffer(name: CueName): Promise<AudioBuffer>;
  on(event: "play", cb: (e: PlayEvent) => void): () => void;
  on(event: "unlock", cb: () => void): () => void;
  bind(root?: ParentNode): void;
}

/** Wires data-foley-* attributes on mount and applies initial settings. */
export declare function useFoley(options?: Partial<Settings>): FoleyHandle;

export * from "@foleyjs/core";
