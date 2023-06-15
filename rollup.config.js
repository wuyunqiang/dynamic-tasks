import { defineConfig } from "rollup";
import typescript from "rollup-plugin-typescript2";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import Json from "@rollup/plugin-json";
import babel from "@rollup/plugin-babel";
import terser from '@rollup/plugin-terser';

import { readFileSync } from "fs";
const PKG_JSON = JSON.parse(readFileSync('package.json', {encoding: 'utf8'}));

const external = [
  ...Object.keys(PKG_JSON.devDependencies || {}),
  ...Object.keys(PKG_JSON.peerDependencies || {}),
];
export default defineConfig({
  input: 'src/index.ts',
  output: [
    {
      format: "es",
      dir: "dist",
      exports: "auto",
      sourcemap: true,
    }
  ],
  plugins: [
    Json(),
    resolve({
      browser: true,
      extensions: [".js", ".ts"],
      preferBuiltins: true,
    }),
    typescript(),
    commonjs(),
    babel({
      babelHelpers: "bundled",
      extensions: [".ts"],
      include: ["src/**/*.ts"],
    }),
    terser()
  ],
  external,
});
