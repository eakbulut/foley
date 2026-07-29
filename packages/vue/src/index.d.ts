import type { Directive, Plugin } from "vue";
import type { CueName, Settings } from "@foleyjs/core";

/** v-foley directive: v-foley="'success'", v-foley:hover="'tick'", v-foley:press="'thock'". */
export declare const vFoley: Directive<HTMLElement, CueName>;

/** app.use(FoleyPlugin, settings?) — registers v-foley, applies settings, and calls bind(). */
export declare const FoleyPlugin: Plugin<[Partial<Settings>?]>;

export * from "@foleyjs/core";
