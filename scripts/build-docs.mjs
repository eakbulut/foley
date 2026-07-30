/* Renders README.md into docs.html with the site's design language.
   The README is the single source of truth; this page is derived, never edited. */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

export function buildDocs(outFile = join(root, "dist", "docs.html")) {
  const md = readFileSync(join(root, "README.md"), "utf8");
  const body = marked.parse(md);
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Foley docs</title>
<meta name="description" content="Documentation for Foley - sound effects for the interface, performed live.">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='14' fill='%23171B19'/%3E%3Ccircle cx='16' cy='16' r='5.5' fill='%23E8EAE7'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
:root{--panel:#E8EAE7;--card:#F7F8F6;--card-edge:#D8DBD6;--ink:#171B19;--ink-soft:#4C534F;--ink-faint:#8A918D;
--disp:'Bricolage Grotesque',system-ui,sans-serif;--body:'Instrument Sans',system-ui,sans-serif;--mono:'Space Mono',ui-monospace,monospace}
*{box-sizing:border-box}
body{margin:0;font-family:var(--body);background:var(--panel);color:var(--ink);line-height:1.6}
header{position:sticky;top:0;background:color-mix(in srgb,var(--panel) 88%,transparent);backdrop-filter:blur(10px);border-bottom:1px solid var(--card-edge)}
.bar{max-width:820px;margin:0 auto;padding:0 24px;height:56px;display:flex;align-items:center;gap:12px}
.logo{display:flex;align-items:center;gap:9px;font-family:var(--disp);font-weight:800;font-size:18px;color:var(--ink);text-decoration:none}
.jack{width:16px;height:16px;border-radius:50%;background:var(--ink);position:relative}
.jack::after{content:"";position:absolute;inset:4.5px;border-radius:50%;background:var(--panel)}
.bar span{font-family:var(--mono);font-size:11px;color:var(--ink-faint)}
.bar a.back{margin-left:auto;font-size:13.5px;color:var(--ink-soft);text-decoration:none}
.bar a.back:hover{color:var(--ink)}
main{max-width:820px;margin:0 auto;padding:36px 24px 90px}
h1,h2,h3{font-family:var(--disp);letter-spacing:-.02em;line-height:1.15}
h1{font-size:38px;margin:.4em 0 .3em}
h2{font-size:26px;margin:1.8em 0 .5em;padding-top:.6em;border-top:1px solid var(--card-edge)}
h3{font-size:19px;margin:1.4em 0 .4em}
p,li{font-size:15.5px;color:var(--ink-soft)}
strong{color:var(--ink)}
a{color:var(--ink)}
code{font-family:var(--mono);font-size:.88em;background:var(--card);border:1px solid var(--card-edge);border-radius:5px;padding:1px 5px}
pre{background:#141816;border-radius:12px;padding:16px 18px;overflow-x:auto}
pre code{background:none;border:none;color:#DCE5E0;font-size:13px;line-height:1.7;padding:0}
table{border-collapse:collapse;width:100%;font-size:14px}
th,td{text-align:left;padding:8px 12px;border-bottom:1px solid var(--card-edge)}
th{font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-faint)}
blockquote{margin:1em 0;padding:10px 16px;border-left:3px solid var(--card-edge);color:var(--ink-faint);font-size:14px}
img{max-width:100%}
</style>
</head>
<body>
<header><div class="bar">
  <a class="logo" href="https://usefoley.dev/"><span class="jack"></span>foley</a>
  <span>docs \u00b7 generated from the README</span>
  <a class="back" href="https://usefoley.dev/">\u2190 back to the demo</a>
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
