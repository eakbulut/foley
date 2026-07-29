# @foleyjs/react

React bindings for [Foley](https://github.com/eakbulut/foley) — sound effects for the interface, performed live.

```sh
npm install @foleyjs/core @foleyjs/react
```

```jsx
import { useFoley } from "@foleyjs/react";

function App() {
  const { play } = useFoley({ volume: 0.7, theme: "soft" });
  return (
    <>
      <button data-foley-press data-foley-release onClick={() => play("success")}>
        Save
      </button>
      <a data-foley-hover="tick">Docs</a>
    </>
  );
}
```

`useFoley()` calls `bind()` once on mount (StrictMode-safe — it's idempotent) and returns `{ play, set, get, toWav, toBuffer, on, bind }`. Everything from `@foleyjs/core` is also re-exported, so one import covers both.

[Full documentation →](https://github.com/eakbulut/foley#readme) · [Live demo →](https://usefoley.dev/)

MIT © eakbulut and Foley contributors.
