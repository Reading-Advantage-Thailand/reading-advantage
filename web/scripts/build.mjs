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

// Base the heap limit on installed RAM. Free RAM is only a momentary snapshot
// and using it as a hard limit can give an otherwise capable 16 GB machine a
// heap too small to compile the application.
const minimumHeapMB = totalMemoryMB >= 12 * 1024 ? 4096 : 2048;
const heapSizeMB = Math.max(
  minimumHeapMB,
  Math.floor(Math.min(totalMemoryMB * 0.75, 8192)),
);

console.log(
  [
    `System RAM: ${(totalMemoryMB / 1024).toFixed(1)} GB`,
    `Free RAM: ${(freeMemoryMB / 1024).toFixed(1)} GB`,
    `Node heap limit: ${heapSizeMB} MB`,
  ].join(" | "),
);

if (freeMemoryMB < heapSizeMB) {
  console.warn(
    "Warning: Free physical RAM is below the Node heap limit. " +
      "Close memory-heavy applications and ensure the Windows page file is enabled.",
  );
}

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
