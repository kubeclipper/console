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

const region = 'default';
const uuid = Cypress._.random(0, 1e6);
const clusterName = `e2e.cluster.name${uuid}`;
const listUrl = '/region';
const port = '22';
const username = 'root';
const password = 'Thinkbig1';

before(() => {
  cy.login(listUrl);
  cy.createClusterQuick(clusterName);
});

after(() => {
  cy.deleteCluster(clusterName);
});

describe('The Region Page', () => {
  beforeEach(() => {
    cy.login(listUrl);
  });

  afterEach(() => {
    cy.addContext();
  });

  it(...testCase('区域管理-查看区域-1').smoke().value(), () => {
    cy.checkTableRowLength();
  });

  it(...testCase('区域管理-区域详情-查看集群列表-1').smoke().value(), () => {
    cy.tableSearchText(region).goToDetail(0);
    cy.clickByDetailTabs('Cluster List');
    cy.checkTableRowLength();
  });

  it(...testCase('区域管理-区域详情-查看集群详情-1').smoke().value(), () => {
    cy.tableSearchText(region).goToDetail(0);
    cy.goToDetail(0);
    cy.clickByDetailTabs('BaseDetail');
    cy.checkBaseDetailValue(clusterName);
    cy.clickByDetailTabs('Nodes List');
    cy.checkTableRowLength();
    cy.clickByDetailTabs('Operation Log');
    cy.clickActionButtonByTitle('ViewLog');
    cy.get('.ant-modal-body').should('exist');
  });

  it(...testCase('区域管理-区域详情-查看节点列表-1').smoke().value(), () => {
    cy.tableSearchText(region).goToDetail(0);
    cy.clickByDetailTabs('Nodes List');
    cy.checkTableRowLength();
    cy.clickActionButtonByTitle('Connect Terminal');
    cy.formInput('port', port)
      .formInput('username', username)
      .formInput('password', password)
      .clickModalActionSubmitButton();
  });

  it(...testCase('区域管理-区域详情-查看节点详情-1').smoke().value(), () => {
    cy.tableSearchText(region).goToDetail(0);
    cy.clickByDetailTabs('Nodes List');
    cy.goToDetail(0);
    cy.clickByDetailTabs('BaseDetail');
    cy.checkBaseDetailValue('default');
  });
});
