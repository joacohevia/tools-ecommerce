import { defineConfig } from 'vitest/config';

/**
 * Configuración de Vitest compartida para frontend + backend.
 * Archivos .test.jsx usan jsdom (React). Archivos .test.js usan node.
 */
export default defineConfig({
  test: {
    globals: true,
    environmentMatchGlobs: [
      ['**/*.test.jsx', 'jsdom'],
    ],
    setupFiles: ['./tests/setup.js'],
    include: ['tests/**/*.test.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,jsx}', 'backend/**/*.js'],
      exclude: ['backend/mcp/**'],
    },
  },
});
