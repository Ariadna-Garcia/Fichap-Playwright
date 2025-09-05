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
    ['html',{ outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['./reporters/test-manager-reporter.js']
  ],

  use: {
    baseURL: process.env.BASE_URL || 'https://playwright.dev',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // Projects for different environments
  projects: [
    {
      name: 'Dev',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: process.env.DEV_BASE_URL || 'https://api-dev.fichap.com',
      },
    },
    {
      name: 'Test',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: process.env.TEST_BASE_URL || 'https://api-test.fichap.com',
      },
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }],
/*
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Mobile browsers
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    
  ],

  // Web Server (opcional)
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
  */
});