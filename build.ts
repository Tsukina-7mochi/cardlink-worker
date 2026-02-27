import * as esbuild from "esbuild";
import { denoPlugin } from "@deno/esbuild-plugin";

await esbuild.build({
  plugins: [denoPlugin()],
  entryPoints: ["./src/mod.ts"],
  outfile: "./dist/server.js",
  bundle: true,
  format: "esm",
  minify: true,
  treeShaking: true,
});

esbuild.stop();
