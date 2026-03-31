/**
 * A script to sync MapLibre assets.
 */

import * as Fs from "node:fs";
import * as Fsp from "node:fs/promises";
import * as Path from "node:path";
import * as Url from "node:url";

const __dirname: string = Path.dirname(Url.fileURLToPath(import.meta.url));

const rootDir: string = Path.join(__dirname, "..");

const sourceDir: string = Path.join(
    rootDir,
    "node_modules",
    "maplibre-gl",
    "dist",
);

const targetDir: string = Path.join(rootDir, "public", "vendor");

const assetFiles = [
    "maplibre-gl-csp.js",
    "maplibre-gl-csp-worker.js",
] as const;

await Fsp.mkdir(targetDir, {
    recursive: true,
});

for await (const assetFile of assetFiles) {
    const sourcePath: string = Path.join(sourceDir, assetFile);
    const targetPath: string = Path.join(targetDir, assetFile);

    if (!Fs.existsSync(sourcePath)) {
        throw new Error(`Missing MapLibre asset: ${sourcePath}`);
    }

    await Fsp.copyFile(sourcePath, targetPath);
}

console.log(`Synced MapLibre assets to ${targetDir}`);
