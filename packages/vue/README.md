# @foleyjs/vue

Vue 3 bindings for [Foley](https://github.com/eakbulut/foley) — sound effects for the interface, performed live.

```sh
npm install @foleyjs/core @foleyjs/vue
```

```js
import { createApp } from "vue";
import { FoleyPlugin } from "@foleyjs/vue";

createApp(App).use(FoleyPlugin, { volume: 0.7, theme: "soft" }).mount("#app");
```

```html
<button v-foley="'success'">Save</button>
<a v-foley:hover="'tick'">Docs</a>
<button v-foley:press="'thock'">Key</button>
```

The plugin registers the `v-foley` directive, applies your settings, and wires any `data-foley-*` attributes. Everything from `@foleyjs/core` is also re-exported.

[Full documentation →](https://github.com/eakbulut/foley#readme) · [Live demo →](https://eakbulut.github.io/foley/)

MIT © eakbulut and Foley contributors.
