import { build } from "esbuild";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";

const outdir = process.env.BOARD_FRAMEWORK_OUTDIR || "dist/framework";
await mkdir(outdir, { recursive: true });

const entries = [
  ["web/framework/three-demos.js", "three-demos.js"],
  ["web/framework/d3-demos.js", "d3-demos.js"],
];

for (const [entry, filename] of entries) {
  const outfile = path.join(outdir, filename);
  await build({
    entryPoints: [entry],
    outfile,
    bundle: true,
    format: "esm",
    platform: "browser",
    target: ["es2020"],
    minify: true,
    sourcemap: false,
    legalComments: "none",
    treeShaking: true,
  });
  const size = (await stat(outfile)).size;
  console.log(`${filename}: ${size.toLocaleString()} bytes`);
}
