const { build } = require("esbuild");
const { peerDependencies } = require("./package.json");

const entryFile = "src/TimelineCalendar.tsx";

const shared = {
  bundle: true,
  entryPoints: [entryFile],
  // Treat all dependencies in package.json as externals to keep bundle size to a minimum
  external: Object.keys(peerDependencies),
  logLevel: "info",
  minify: true,
  sourcemap: true,
};

build({
  ...shared,
  format: "esm",
  outfile: "./dist/lib.esm.js",
  target: ["esnext", "node12.22.0"],
});