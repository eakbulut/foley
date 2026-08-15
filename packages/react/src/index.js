/* @foleyjs/react — React bindings for Foley */
import { useEffect, useMemo } from "react";
import { bind, play, set, get, toWav, toBuffer, on } from "@foleyjs/core";

/**
 * Wires data-foley-* attributes once on mount and applies initial settings.
 *
 *   const { play, set } = useFoley({ volume: 0.7, theme: "soft" });
 *   <button onClick={() => play("success")}>Save</button>
 *
 * bind() is idempotent, so StrictMode's double-invoke is harmless. It also delegates,
 * so markup rendered after mount is covered - no re-binding on every render.
 */
export function useFoley(options) {
  useEffect(() => {
    if (options) set(options);
    bind();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return useMemo(() => ({ play, set, get, toWav, toBuffer, on, bind }), []);
}

/* everything from the core, so one import covers both */
export * from "@foleyjs/core";
