/* Builds the single-file demo (dist/foley-demo.html) from the repo sources:
   inlines src/foley.js into index.html and swaps localStorage persistence
   for in-memory (the single file is often viewed in sandboxed iframes
   where browser storage is blocked). One codebase, two artifacts. */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

export function build(outFile = join(root, "dist", "foley-demo.html")) {
  let lib = readFileSync(join(root, "src", "foley.js"), "utf8");
  /* strip module syntax; names resolve from shared scope after inlining */
  lib = lib.replace(/^export (async function|function|const)/gm, "$1");

  const page = readFileSync(join(root, "index.html"), "utf8");
  const m = page.match(/<script type="module">([\s\S]*)<\/script>/);
  if (!m) throw new Error("index.html: module script not found");

  let script = m[1];
  const beforeImport = script.length;
  script = script.replace(/import \{[^}]*\} from "\.\/src\/foley\.js";\n/, "");
  if (script.length === beforeImport) throw new Error("index.html: library import not found");

  const stub = `/* single-file build: settings persist for the session only */
const _mem = {};
const store = { load() { return _mem; }, save(patch) { Object.assign(_mem, patch); } };`;
  const beforeStore = script.length;
  script = script.replace(/\/\* BEGIN-STORE[\s\S]*?\/\* END-STORE \*\//, stub);
  if (script.length === beforeStore) throw new Error("index.html: STORE markers not found");

  let out =
    page.slice(0, m.index) +
    '<script type="module">\n' + lib + "\n" + script + "</script>" +
    page.slice(m.index + m[0].length);

  out = out.replace(/^.*data-goatcounter.*\n/m, "");
  if (out.includes("localStorage")) throw new Error("standalone must not reference localStorage");
  if (out.includes("goatcounter")) throw new Error("standalone must not include analytics");
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, out);
  return out;
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  const html = build();
  console.log("built dist/foley-demo.html (" + html.length + " bytes)");
}
