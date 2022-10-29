const { defineConfig } = require('cypress');

module.exports = defineConfig({
  viewportWidth: 1600,
  viewportHeight: 900,
  video: false,
  env: {
    username: 'admin',
    password: 'Thinkbig1',
    language: 'zh',
  },
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'cypress/results',
    overwrite: false,
    html: false,
    json: true,
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config);
    },
    experimentalSessionAndOrigin: true,
    baseUrl: 'http://localhost:8089',
    specPattern: [
      'cypress/e2e/pages/login.cy.js',
      'cypress/e2e/pages/cluster/cluster.cy.js',
      'cypress/e2e/pages/cluster/backup.cy.js',
    ],
  },
});
