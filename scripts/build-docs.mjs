/* Renders README.md into docs.html with the site's design language.
   The README is the single source of truth; this page is derived, never edited. */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

export function buildDocs(outFile = join(root, "dist", "docs.html")) {
  const md = readFileSync(join(root, "README.md"), "utf8");
  /* README-relative links only exist on GitHub; on usefoley.dev they 404 (Search Console caught it).
     agents.md is the one file the deploy also ships, so it stays local. */
  const body = marked.parse(md).replace(/href="\.\/(?!agents\.md")/g,
    'href="https://github.com/eakbulut/foley/blob/main/');
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Foley docs: UI sound effects API, cues, themes, and sound sets</title>
<meta name="description" content="Documentation for Foley, the JavaScript library of 28 UI sound effects synthesized with Web Audio: attributes, bind(), observe(), play(), themes, sound sets, React and Vue.">
<link rel="canonical" href="https://usefoley.dev/docs.html">
<meta property="og:title" content="Foley docs">
<meta property="og:description" content="API, cues, themes, sound sets, and framework bindings for Foley.">
<meta property="og:url" content="https://usefoley.dev/docs.html">
<meta property="og:image" content="https://usefoley.dev/assets/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#FFE01B">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cpath d='M16 1l3.6 7.4 8-2.6-2.6 8L32 16l-7 2.2 2.6 8-8-2.6L16 31l-3.6-7.4-8 2.6 2.6-8L0 16l7-2.2-2.6-8 8 2.6z' fill='%23FFE01B' stroke='%23121212' stroke-width='2' stroke-linejoin='round'/%3E%3C/svg%3E">
<style>
@font-face{font-family:'Bangers';src:url(assets/fonts/bangers.woff2) format('woff2');font-display:swap}
@font-face{font-family:'Schibsted Grotesk';src:url(assets/fonts/schibsted-grotesk.woff2) format('woff2');font-weight:400 900;font-display:swap}
@font-face{font-family:'JetBrains Mono';src:url(assets/fonts/jetbrains-mono.woff2) format('woff2');font-weight:100 800;font-display:swap}
:root{--paper:#FFFFFF;--ink:#121212;--ink-soft:#3B3B3B;--ink-faint:#666663;--yellow:#FFE01B;--cyan:#0EA5D9;--magenta:#E0137F;--night:#121212;--night-ink:#F4F4F0;
--sfx:'Bangers','Schibsted Grotesk',system-ui,sans-serif;--body:'Schibsted Grotesk',system-ui,sans-serif;--mono:'JetBrains Mono',ui-monospace,monospace}
*{box-sizing:border-box}
body{margin:0;font-family:var(--body);background:var(--paper);color:var(--ink);line-height:1.6;caret-color:var(--magenta)}
::selection{background:var(--yellow);color:var(--ink)}
:focus-visible{outline:3px solid var(--cyan);outline-offset:2px}
header{position:sticky;top:0;background:var(--paper);border-bottom:3px solid var(--ink);z-index:5}
.bar{max-width:860px;margin:0 auto;padding:0 20px;height:62px;display:flex;align-items:center;gap:14px}
.logo{font-family:var(--sfx);font-size:34px;line-height:1;letter-spacing:.02em;color:var(--yellow);text-decoration:none;
text-shadow:-1.2px -1.2px 0 var(--ink),1.2px -1.2px 0 var(--ink),1.2px 1.2px 0 var(--ink),-1.2px 1.2px 0 var(--ink),2px 2.4px 0 var(--ink),2.6px 3.2px 0 var(--ink)}
.bar span{font-size:13px;font-weight:700;background:var(--yellow);border:2px solid var(--ink);padding:2px 8px;white-space:nowrap}
@media (max-width:520px){.bar span{display:none}}
.bar a.back{margin-left:auto;font-weight:700;font-size:14.5px;color:var(--ink);text-decoration:none;border:2px solid var(--ink);border-radius:8px;padding:6px 11px;white-space:nowrap}
.bar a.back:hover{background:var(--yellow)}
main{max-width:860px;margin:0 auto;padding:32px 20px 90px}
h1,h2,h3{font-family:var(--sfx);font-weight:400;letter-spacing:.02em;line-height:1}
h1{font-size:56px;margin:.3em 0 .3em}
h2{font-size:38px;margin:1.6em 0 .5em;padding-top:.7em;border-top:3px solid var(--ink)}
h3{font-size:26px;margin:1.4em 0 .4em}
p,li{font-size:16px;color:var(--ink-soft)}
strong{color:var(--ink)}
a{color:var(--ink);text-decoration-thickness:2px;text-underline-offset:3px}
code{font-family:var(--mono);font-size:.86em;background:var(--yellow);border:1.5px solid var(--ink);border-radius:4px;padding:0 4px}
pre{background:var(--night);border:3px solid var(--ink);padding:16px 18px;overflow-x:auto}
pre code{background:none;border:none;color:var(--night-ink);font-size:13.5px;line-height:1.7;padding:0}
table{border-collapse:collapse;font-size:14.5px;border:3px solid var(--ink);display:block;width:fit-content;max-width:100%;overflow-x:auto}
th,td{text-align:left;padding:9px 12px;border-bottom:2px solid var(--ink)}
th{font-weight:800;font-size:13px;background:var(--yellow)}
blockquote{margin:1em 0;padding:12px 16px;border:3px solid var(--ink);font-size:14.5px}
blockquote p{margin:0}
img{max-width:100%}
</style>
<script data-goatcounter="https://foley.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>
</head>
<body>
<header><div class="bar">
  <a class="logo" href="https://usefoley.dev/">FOLEY</a>
  <span>docs \u00b7 from the README</span>
  <a class="back" href="https://usefoley.dev/">Back to the demo</a>
</div></header>
<main>
${body}
</main>
</body>
</html>
`;
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, html);
  return html;
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  const html = buildDocs();
  console.log("built dist/docs.html (" + html.length + " bytes)");
}
