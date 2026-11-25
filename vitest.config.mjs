import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    maxWorkers: 1,
    projects: [
      {
        test: {
          name: 'node',
          include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
          exclude: ['src/renderer/**'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'ui',
          include: [
            'src/renderer/**/*.spec.ts',
            'src/renderer/**/*.spec.tsx',
            'src/renderer/**/*.test.ts',
            'src/renderer/**/*.test.tsx',
          ],
          environment: 'jsdom',
          environmentOptions: {
            jsdom: { url: 'http://localhost/' },
          },
        },
      },
    ],
  },
});
