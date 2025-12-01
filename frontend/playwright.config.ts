import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  use: {
    screenshot: 'only-on-failure'
  },
  reporter: [['list']]
})
