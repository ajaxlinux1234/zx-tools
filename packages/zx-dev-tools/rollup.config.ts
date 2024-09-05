import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'rollup';
import { defineConfig } from 'rollup';
import esbuild, { type Options as esbuildOptions } from 'rollup-plugin-esbuild';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)).toString());

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const sharedNodeOptions = defineConfig({
  treeshake: {
    moduleSideEffects: 'no-external',
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false,
  },
  output: {
    dir: './dist',
    entryFileNames: `client/[name].js`,
    // chunkFileNames: 'chunks/dep-[hash].js',
    exports: 'named',
    format: 'esm',
    externalLiveBindings: false,
    freeze: false,
  },
  onwarn(warning, warn) {
    if (warning.message.includes('Circular dependency')) {
      return;
    }
    warn(warning);
  },
});

const rollInputFiles = readdirSync(path.resolve(__dirname, 'src/client'));

const input = Object.fromEntries(
  rollInputFiles.map((one) => [
    one.match(/^([^.]*)\.ts$/)?.[1],
    path.resolve(__dirname, 'src/client', one),
  ]),
);

const nodeConfig = defineConfig({
  ...sharedNodeOptions,
  input,
  external: [
    'fsevents',
    'lightningcss',
    'rollup/parseAst',
    'zx',
    ...Object.keys(pkg.dependencies || {}),
  ],
  plugins: [...createSharedNodePlugins({})],
});

function createSharedNodePlugins({
  esbuildOptions,
}: {
  esbuildOptions?: esbuildOptions;
}): Plugin[] {
  return [
    nodeResolve({ preferBuiltins: true }),
    esbuild({
      tsconfig: path.resolve(__dirname, 'src/client/tsconfig.json'),
      target: 'node18',
      ...esbuildOptions,
    }),
    commonjs({
      extensions: ['.js'],
      // Optional peer deps of ws. Native deps that are mostly for performance.
      // Since ws is not that perf critical for us, just ignore these deps.
      ignore: ['bufferutil', 'utf-8-validate'],
      sourceMap: false,
    }),
    json(),
  ];
}

export default defineConfig([nodeConfig]);
