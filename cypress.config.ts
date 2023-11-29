import { defineConfig } from 'cypress';

export default defineConfig({
  // projectId: 'w4expe',
  viewportWidth: 1200,
  viewportHeight: 660,
  // experimentalSourceRewriting: false,
  // trashAssetsBeforeRuns: true,
  downloadsFolder: './cypress/download',
  defaultCommandTimeout: 10000,
  // video: false,
  retries: 5,
  e2e: {
    testIsolation: false,
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config);
    },
    baseUrl: 'http://localhost:4200',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}'
  }
});
