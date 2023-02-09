const { build } = require("esbuild");
const files = [
  "./src/handlers/get-date-options/get-date-options.ts",
  "./src/handlers/get-date-options-json/get-date-options-json.ts",
  "./src/handlers/calculate/calculate.ts",
  "./src/handlers/import-ons-data/handler.ts",
];

build({
  platform: "node",
  entryPoints: files,
  outdir: "./esdist",
  minify: false,
  bundle: true,
  sourcemap: true,
}).catch(() => process.exit(1));
