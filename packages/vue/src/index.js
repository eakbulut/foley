/* @foleyjs/vue — Vue 3 bindings for Foley */
import { bind, play, set } from "@foleyjs/core";

/**
 * v-foley directive.
 *
 *   <button v-foley="'success'">Save</button>       click → success
 *   <a v-foley:hover="'tick'">Docs</a>              pointerenter → tick
 *   <button v-foley:press="'thock'">Key</button>    pointerdown → thock
 */
export const vFoley = {
  mounted(el, binding) {
    const cue = binding.value || "tap";
    const arg = binding.arg || "click";
    const event = { click: "click", hover: "pointerenter", press: "pointerdown", release: "pointerup" }[arg] || arg;
    el._foleyHandler = () => play(cue);
    el._foleyEvent = event;
    el.addEventListener(event, el._foleyHandler);
  },
  unmounted(el) {
    if (el._foleyHandler) el.removeEventListener(el._foleyEvent, el._foleyHandler);
  },
};

/**
 * App plugin: registers the directive, applies settings, wires data-foley-* markup.
 *
 *   import { FoleyPlugin } from "@foleyjs/vue";
 *   app.use(FoleyPlugin, { volume: 0.7, theme: "soft" });
 */
export const FoleyPlugin = {
  install(app, options) {
    if (options) set(options);
    app.directive("foley", vFoley);
    if (typeof document !== "undefined") bind();
  },
};

/* everything from the core, so one import covers both */
export * from "@foleyjs/core";
