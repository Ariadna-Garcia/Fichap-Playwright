const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

module.exports = defineConfig({
  testDir: './tests',

  // Global Test Settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { 
      outputFolder: 'playwright-report',
      open: process.env.CI ? 'never' : 'on-failure'
    }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],

    // ➕ Allure reporter
    ...(process.env.CI || process.env.GITHUB_ACTIONS ? [['allure-playwright']] : []),

    // Discord reporter solo en CI/CD
    ...(process.env.CI || process.env.GITHUB_ACTIONS ? [['./discord-reporter.js']] : [])
  ],

  use: {
    baseURL: process.env.BASE_URL || 'https://playwright.dev',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },

  outputDir: 'test-results',

  projects: [
    {
      name: 'Dev',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: process.env.DEV_BASE_URL || 'https://api-dev.fichap.com',
      },
      testMatch: /.*\.spec\.(js|ts)/,
    },
    {
      name: 'Test', 
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: process.env.TEST_BASE_URL || 'https://api-test.fichap.com',
      },
      testMatch: /.*\.spec\.(js|ts)/,
    },
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        launchOptions: {
          slowMo: process.env.CI ? 0 : 100,
        }
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    /*
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    */
  ],
});
