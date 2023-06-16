import { defineConfig } from "rollup";
import typescript from "rollup-plugin-typescript2";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import Json from "@rollup/plugin-json";
import babel from "@rollup/plugin-babel";
import terser from "@rollup/plugin-terser";
import { readFileSync } from "fs";
const PKG_JSON = JSON.parse(readFileSync("package.json", { encoding: "utf8" }));

const external = [
  ...Object.keys(PKG_JSON.devDependencies || {}),
  ...Object.keys(PKG_JSON.peerDependencies || {}),
];

const babelConfig = {
  babelHelpers: "bundled",
  extensions: [".ts"],
  include: ["src/**/*.ts"],
};

const outputConfig = {
  format: "es",
  exports: "auto",
  sourcemap: true,
};

const config = {
  input: "src/index.ts",
  plugins: [
    typescript({
      useTsconfigDeclarationDir: true
    }),
    Json(),
    resolve({
      browser: true,
      extensions: [".js", ".ts"],
      preferBuiltins: true,
    }),
    
    commonjs(),
    terser(),
  ],
  external,
};
export default defineConfig([
  {
    ...config,
    output: [
      {
        ...outputConfig,
        dir: "dist/es",
      },
    ],
    plugins: [
      ...config.plugins,
      babel({
        ...babelConfig,
        targets: ["chrome 100"],
      }),
    ],
  },
  {
    ...config,
    output: [
      {
        ...outputConfig,
        dir: "dist/legacy",
      },
    ],
    plugins: [
      ...config.plugins,
      babel({
        ...babelConfig,
        targets: ["chrome 55"],
      }),
    ],
  },
]);
