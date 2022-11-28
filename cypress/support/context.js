import addContext from 'mochawesome/addContext';

Cypress.Commands.add('addContext', () => {
  cy.once('test:after:run', (test) => {
    const { _testConfig = {} } = test;
    const context = {
      title: (_testConfig || {}).caseName || '-',
      value: _testConfig,
    };
    addContext({ test }, context);
  });
});
