import type { Output } from "@swc/core";

import * as Fsp from "node:fs/promises";
import * as Path from "node:path";

import { minify } from "@swc/core";
import { fdir } from "fdir";

const DIR_TARGET: string = Path.join(process.cwd(), "dist");

const files: string[] = await new fdir()
    .withFullPaths()
    .filter((file: string) => file.endsWith(".js"))
    .crawl(DIR_TARGET)
    .withPromise();

console.log("");

for await (const file of files) {
    const content: string = await Fsp.readFile(file, "utf-8");

    const minified: Output = await minify(content, {
        compress: true,
        mangle: true,
        ecma: 5,
        module: "unknown",
    });

    const output: string = minified.code;

    const sizeOld: number = content.length / 1024;
    const sizeNew: number = output.length / 1024;

    await Fsp.writeFile(file, output, "utf-8");

    console.log(
        `${Path.relative(DIR_TARGET, file)}`,
        `(${sizeOld.toFixed(2)}KB -> ${sizeNew.toFixed(2)}KB)`,
    );
}

console.log("");
