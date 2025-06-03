import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['lib/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  bundle: true,
  skipNodeModulesBundle: true,
  target: 'node16',
  outDir: 'dist',
  treeshake: true
});
