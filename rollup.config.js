import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import dts from 'rollup-plugin-dts';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  'crypto',
  'util',
  'stream',
  'events',
  'buffer',
  'url',
  'http',
  'https',
  'fs',
  'path'
];

// Common plugins for Node and ESM builds
const commonPlugins = [
  json(),
  resolve({ preferBuiltins: true, browser: false }),
  commonjs({ esmExternals: true }), // ⚠ key fix for ESM-only dependencies like ethers v6
  typescript({ tsconfig: './tsconfig.json', declaration: false, declarationMap: false })
];

// Plugins for browser builds
const browserPlugins = [
  json(),
  resolve({ preferBuiltins: false, browser: true }),
  commonjs({ esmExternals: true }), // ⚠ important
  typescript({ tsconfig: './tsconfig.json', declaration: false, declarationMap: false })
];

export default [
  // CommonJS build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.cjs',
      format: 'cjs',
      exports: 'auto',
      sourcemap: true,
      interop: 'compat'
    },
    external,
    plugins: commonPlugins
  },

  // ESM build
  {
    input: 'src/index.mjs',
    output: { file: 'dist/index.mjs', format: 'es', sourcemap: true },
    external,
    plugins: commonPlugins
  },

  // Browser UMD build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'ODudeSDK',
      sourcemap: true,
      globals: { 'ethers': 'ethers' }
    },
    external: ['ethers'],
    plugins: [...browserPlugins, terser()]
  },

  // Browser ESM build
  {
    input: 'src/index.mjs',
    output: { file: 'dist/index.browser.mjs', format: 'es', sourcemap: true },
    external: ['ethers'],
    plugins: browserPlugins
  },

  // TypeScript declarations
  {
    input: 'src/index.d.ts',
    output: { file: 'dist/index.d.ts', format: 'es' },
    plugins: [dts({ respectExternal: true })],
    external
  }
];
