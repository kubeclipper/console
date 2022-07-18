/*
 * Copyright 2021 KubeClipper Authors.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

let nodeIp;

describe('The Node Info Page', () => {
  const uuid = Cypress._.random(0, 1e6);
  const listUrl = 'node/info';
  const port = '22';
  const username = `e2e-username-${uuid}`;
  const password = 'e2e-password';

  beforeEach(() => {
    cy.login(listUrl);
  });

  it('successfully get a ip with more action', () => {
    cy.get('.ant-table-body')
      .find('.ant-btn-more')
      .as('more')
      .its('length')
      .then((res) => {
        if (res > 0) {
          cy.get('@more')
            .eq(0)
            .parent()
            .siblings()
            .as('row')
            .find('a')
            .then(($a) => {
              nodeIp = $a.text();
            });
        }
      });
  });

  it('successfully detail', () => {
    cy.goToDetail()
      .get('.ant-tabs-content')
      .should('exist')
      .goBackToList(listUrl);
  });

  it('successfully disable', () => {
    cy.tableSearchText(nodeIp)
      .clickActionInMore('Disable')
      .clickConfirmActionSubmitButton();
  });

  it('successfully enable', () => {
    cy.tableSearchText(nodeIp)
      .clickActionInMore('Enable')
      .clickConfirmActionSubmitButton();
  });

  it('successfully delete', () => {
    cy.tableSearchText(nodeIp)
      .clickActionInMore('Disable')
      .clickConfirmActionSubmitButton();

    cy.tableSearchText(nodeIp)
      .clickActionInMore('Delete')
      .clickConfirmActionSubmitButton();
  });

  it('successfully open terminal', () => {
    cy.get('.ant-table-row').first().find('button').eq(1).click();

    cy.window().then((win) => {
      cy.spy(win, 'open').as('terminal');
    });
    cy.formInput('port', port)
      .formInput('username', username)
      .formInput('password', password)
      .clickModalActionSubmitButton();

    cy.get('@terminal').should('be.called');
  });
});
