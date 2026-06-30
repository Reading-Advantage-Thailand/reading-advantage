import os from "node:os";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");
const projectRoot = fileURLToPath(new URL("../", import.meta.url));

// Avoid reporting stale TypeScript diagnostics or accepting a build that only
// passes because it reused output produced from a different source revision.
for (const buildArtifact of [".next", "tsconfig.tsbuildinfo"]) {
  rmSync(new URL(buildArtifact, new URL("../", import.meta.url)), {
    recursive: true,
    force: true,
  });
}
console.log("Removed stale Next.js and TypeScript build caches.");

const bytesPerMB = 1024 * 1024;
const totalMemoryMB = os.totalmem() / bytesPerMB;
const freeMemoryMB = os.freemem() / bytesPerMB;

// Keep enough memory available for Windows, SWC, TypeScript, and other native
// processes. V8's heap is only one part of the build's total memory usage.
const heapSizeMB = Math.max(
  2048,
  Math.floor(Math.min(totalMemoryMB * 0.4, freeMemoryMB * 0.7, 8192)),
);

console.log(
  [
    `System RAM: ${(totalMemoryMB / 1024).toFixed(1)} GB`,
    `Free RAM: ${(freeMemoryMB / 1024).toFixed(1)} GB`,
    `Node heap limit: ${heapSizeMB} MB`,
  ].join(" | "),
);

const result = spawnSync(
  process.execPath,
  [`--max-old-space-size=${heapSizeMB}`, nextBin, "build"],
  {
    stdio: "inherit",
    env: process.env,
    cwd: projectRoot,
  },
);

if (result.error) {
  console.error("Unable to start the Next.js build:", result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
