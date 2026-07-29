/* useFoley — React hook for @foleyjs/core */
import { useEffect, useMemo } from "react";
import { bind, play, set, get, toWav, on } from "@foleyjs/core";

/**
 * Wires data-foley-* attributes once on mount and applies initial settings.
 *   const { play, set } = useFoley({ volume: 0.7, theme: "soft" });
 */
export function useFoley(options) {
  useEffect(() => {
    if (options) set(options);
    bind(); // idempotent: safe under StrictMode double-invoke
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return useMemo(() => ({ play, set, get, toWav, on }), []);
}
