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
import { testCase } from '../../../support/common';

let nodeIp;

describe('节点信息', () => {
  const uuid = Cypress._.random(0, 1e6);
  const listUrl = 'node';
  const username = `e2e-username-${uuid}`;
  const password = 'e2e-password';

  beforeEach(() => {
    cy.login(listUrl);
  });

  afterEach(() => {
    cy.addContext();
  });

  it(...testCase('获取最后一行的节点ip').smoke().value(), () => {
    cy.get('.ant-table-body')
      .as('more')
      .its('length')
      .then((res) => {
        if (res > 0) {
          cy.get('@more')
            .find('.ant-typography')
            .eq(-1)
            .then(($a) => {
              nodeIp = $a.text();
            });
        }
      });
  });

  it(...testCase('节点信息-查看节点信息-1').smoke().value(), () => {
    cy.tableSearchText(nodeIp);
    cy.checkTableRowLength();
  });

  it(...testCase('节点信息-查看节点详情-1').smoke().value(), () => {
    cy.tableSearchText(nodeIp);
    cy.goToDetail(0)
      .get('.ant-tabs-content')
      .should('exist')
      .checkDetailName(nodeIp)
      .goBackToList(listUrl);
  });

  it(...testCase('节点信息-节点禁用-1').smoke().value(), () => {
    cy.tableSearchText(nodeIp);
    cy.clickActionButtonByTitle('Disable');
    cy.clickConfirmActionSubmitButton();
  });

  it(...testCase('节点信息-节点启用-1').smoke().value(), () => {
    cy.tableSearchText(nodeIp);
    cy.clickActionButtonByTitle('Enable');
    cy.clickConfirmActionSubmitButton();
  });

  it(...testCase('节点信息-节点连接终端-1').smoke().value(), () => {
    cy.tableSearchText(nodeIp);
    cy.clickActionButtonByTitle('Connect Terminal');
    cy.formInput('username', username);
    cy.formInput('password', password);
    cy.clickModalActionSubmitButton();
    cy.get('.ant-modal-confirm-title').should('contain', nodeIp);
  });
});
