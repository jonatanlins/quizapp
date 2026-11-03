import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
    coverage: { provider: 'v8', reporter: ['text', 'json', 'html'], include: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}'], exclude: ['**/*.d.ts'], thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 } },
    testTimeout: 15000,
  },
});
