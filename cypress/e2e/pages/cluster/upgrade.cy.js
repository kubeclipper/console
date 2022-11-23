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
import getTitle, { TestCase } from '../../../support/common';

before(() => {
  cy.login();
  cy.checkClusterExist();
});

describe('升级集群', () => {
  const testUrl = '/cluster';
  const upgradeVersion = 'v1.23.9';

  beforeEach(() => {
    cy.login(testUrl);
  });

  afterEach(() => {
    cy.addContext();
  });

  // 升级集群
  it.skip(...TestCase('集群管理-集群-升级集群-1').smoke().value(), () => {
    cy.clickActionInMore({
      title: 'Cluster Status',
      subTitle: 'Cluster Upgrade',
    });

    cy.wait(1000);
    cy.get('.ant-form-item-control-input')
      .find('span')
      .contains(getTitle('Online'))
      .click();
    cy.get('#form-item-col-version').find('span').contains(upgradeVersion);
    cy.clickConfirm();

    cy.waitStatusSuccess(null, 5 * 1000 * 60);

    cy.goToDetail(1);
    cy.get('.ant-tabs-content .ant-row').should('contain', upgradeVersion);
  });
});
