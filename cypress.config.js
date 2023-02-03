const { defineConfig } = require('cypress');

module.exports = defineConfig({
  viewportWidth: 1600,
  viewportHeight: 900,
  video: false,
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'cypress/results',
    overwrite: false,
    html: false,
    json: true,
  },
  chromeWebSecurity: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config);
    },
    experimentalSessionAndOrigin: true,
    specPattern: [
      'cypress/e2e/pages/login.cy.js',
      'cypress/e2e/pages/base/header.cy.js',
      'cypress/e2e/pages/cluster/cluster.cy.js',
      'cypress/e2e/pages/cluster/online-offline-install.cy.js',
      'cypress/e2e/pages/cluster/registry.cy.js',
      'cypress/e2e/pages/cluster/template.cy.js',
      'cypress/e2e/pages/region/region.cy.js',
      'cypress/e2e/pages/access/oauth2.cy.js',
      'cypress/e2e/pages/access/platform-user-role.cy.js',
      'cypress/e2e/pages/node/node.cy.js',
      'cypress/e2e/pages/cluster/hosting-kubeadm.cy.js',
      'cypress/e2e/pages/cluster/backup.cy.js',
    ],
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
  },
});
