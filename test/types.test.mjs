/* The published type surface is a product, and until now nothing checked it: the
   other guards assert declarations *exist* (by grepping the d.ts), never that they
   are correct. A contributor had to report a type problem that CI could not see.

   Two layers here, because they catch different failures:
   - tsc over test/types/consumer.ts proves the types work for real usage, and that
     the @ts-expect-error negatives still error (a d.ts of `any` would pass otherwise).
   - the shape guard below catches the regression tsc CANNOT see: method-shorthand
     signatures compile identically to property signatures, but only the property
     form is safe to detach under typescript-eslint's unbound-method rule. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const DTS = [
  "src/foley.d.ts",
  "packages/react/src/index.d.ts",
  "packages/vue/src/index.d.ts",
];

test("the type definitions compile, and every @ts-expect-error still errors", () => {
  const tsc = join(root, "node_modules", ".bin", "tsc");
  try {
    execFileSync(tsc, [
      "--noEmit", "--strict",
      "--moduleResolution", "bundler", "--module", "esnext",
      "--target", "es2022", "--lib", "es2022,dom",
      join(root, "types", "consumer.ts"),   /* outside test/, which node --test walks */
    ], { encoding: "utf8", stdio: "pipe" });
  } catch (e) {
    assert.fail("tsc rejected the public types:\n" + (e.stdout || "") + (e.stderr || ""));
  }
});

test("no d.ts interface uses method shorthand - it breaks destructuring", () => {
  /* `stop(): void` and `stop: () => void` compile the same, but the first tells
     TypeScript the member may depend on `this`, so unbound-method fires on
     `const { stop } = play(...)` - a pattern the README documents. Reported by
     a contributor in PR #6; this is the guard that keeps it fixed. */
  for (const file of DTS) {
    const dts = readFileSync(join(root, file), "utf8");
    for (const m of dts.matchAll(/export interface (\w+) \{([\s\S]*?)\n\}/g)) {
      for (const line of m[2].split("\n")) {
        const method = line.match(/^\s{2,}(\w+)\??\s*\(/);
        assert.ok(!method,
          `${file}: ${m[1]}.${method ? method[1] : ""} uses method shorthand; ` +
          `write it as \`${method ? method[1] : "name"}: (...) => T\` so it can be detached`);
      }
    }
  }
});

test("every d.ts that ships is covered by the compile check", () => {
  /* enumerate reality: a new package's d.ts must be added to DTS above */
  const found = ["src/foley.d.ts"];
  for (const pkg of readdirSync(join(root, "packages"))) {
    found.push(`packages/${pkg}/src/index.d.ts`);
  }
  assert.deepEqual(found.sort(), [...DTS].sort(),
    "a d.ts exists that these type guards do not cover");
});
