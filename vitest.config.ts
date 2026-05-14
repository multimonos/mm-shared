// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',

    // important for stability/debugging
    pool: 'forks',

    // prevent workspace weirdness
    root: '.',
  },

  resolve: {
    preserveSymlinks: true,
  },
})
