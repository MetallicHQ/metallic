import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.{test,spec}.ts'],
    setupFiles: ['./tests/vitest.setup.ts'],
    testTimeout: 60000,
    watch: false,
    reporters: ['verbose'],
    printConsoleTrace: true,
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html']
    }
  },
  resolve: {
    alias: { '~': resolve(__dirname, 'lib') }
  }
});
