import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  oxc: {
    jsx: {
      runtime: 'automatic',
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: [
      'packages/*/src/**/*.test.ts',
      'packages/*/src/**/*.spec.ts',
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'scripts/**/*.test.ts',
    ],
    exclude: [
      'node_modules',
      'dist',
      '.next',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'packages/core/src/**/*.ts',
        'packages/content/src/**/*.ts',
      ],
      exclude: [
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/index.ts',
      ],
    },
  },
  resolve: {
    alias: {
      // Next.js handles `@/*` via tsconfig paths; mirror that here so test
      // files can use the same import style as source.
      '@': path.resolve(__dirname, 'src'),
      '@codeprism/core': path.resolve(__dirname, 'packages/core/src'),
      '@codeprism/content': path.resolve(__dirname, 'packages/content/src'),
    },
  },
})
