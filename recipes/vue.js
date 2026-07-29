/* v-foley — Vue 3 directive for @foleyjs/core */
import { play } from "@foleyjs/core";

/**
 * app.directive("foley", vFoley);
 *
 *   <button v-foley="'success'">Save</button>     click → success
 *   <a v-foley:hover="'tick'">Docs</a>            pointerenter → tick
 *   <button v-foley:press="'thock'">Key</button>  pointerdown → thock
 */
export const vFoley = {
  mounted(el, binding) {
    const cue = binding.value || "tap";
    const arg = binding.arg || "click";
    const event = { click: "click", hover: "pointerenter", press: "pointerdown", release: "pointerup" }[arg] || arg;
    el._foleyHandler = () => play(cue);
    el.addEventListener(event, el._foleyHandler);
    el._foleyEvent = event;
  },
  unmounted(el) {
    if (el._foleyHandler) el.removeEventListener(el._foleyEvent, el._foleyHandler);
  },
};
