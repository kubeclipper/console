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

// 快速创建集群
Cypress.Commands.add('createClusterQuick', (clusterName) => {
  cy.visitPage('/cluster');

  cy.clickHeaderButton(0);

  const uuid = Cypress._.random(0, 1e6);
  const name = clusterName || `e2e.cluster.name${uuid}`;

  // cluster name
  cy.get('[name="name"]').clear().type(name).blur();
  cy.formSelect('region', 'default');
  // select node
  cy.waitTransferList();
  cy.formMultiTransfer('nodes', 0);

  // next step
  cy.clickStepActionNextButton('step-next');
  cy.wait(1000);
  cy.clickStepActionNextButton('step-quick');
  cy.clickStepActionNextButton('step-confirm');
  // check status
  cy.wait(2000).tableSearchText(name).waitStatusSuccess();
});

// 删除集群
Cypress.Commands.add('deleteCluster', (clusterName) => {
  cy.visitPage('/cluster');
  cy.tableSearchText(clusterName);

  cy.clickActionInMore({
    title: 'Cluster Status',
    subTitle: 'Delete Cluster',
  });

  cy.clickConfirmActionSubmitButton();
  // check delete finished
  cy.get('.ant-table-tbody')
    .find('.ant-table-row', { timeout: 20 * 60 * 1000 })
    .should('not.exist');
});

// 创建平台角色
Cypress.Commands.add('createRole', (roleName) => {
  cy.visitPage('/access/role');
  cy.clickHeaderButton(0)
    .formInput('name', roleName)
    .clickRoleCheckbox()
    .clickPageFormSubmitButton(1000);
});

// 删除平台用户
Cypress.Commands.add('deleteUser', (userName) => {
  cy.visitPage('/access/user');
  cy.tableSearchText(userName)
    .clickActionInMore({ title: 'Delete' })
    .clickConfirmActionSubmitButton()
    .checkEmptyTable()
    .clearSearchInput();
});

// 删除镜像仓库
Cypress.Commands.add('deleteRegistry', (name) => {
  cy.visitPage('/cluster/registry');
  cy.tableSearchText(name)
    .clickActionButtonByTitle('Delete')
    .clickConfirmActionSubmitButton()
    .checkEmptyTable()
    .clearSearchInput();
});
