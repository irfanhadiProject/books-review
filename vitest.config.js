import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    threads: false,
    isolate: false,
    sequence: {
      concurrent: false
    }
  }
})
