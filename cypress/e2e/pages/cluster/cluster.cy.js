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
import { TestCase } from '../../../support/common';

describe('集群', () => {
  const testUrl = '/cluster';

  const uuid = Cypress._.random(0, 1e6);
  const name = `e2e.cluster.name${uuid}`;
  const description = 'e2e-description';
  const region = 'default';
  const externalIP = '142.22.2.2';

  beforeEach(() => {
    cy.login(testUrl);
  });

  afterEach(() => {
    cy.addContext();
  });

  // 创建单机集群
  it(...TestCase('集群管理-创建-1').smoke().value(), () => {
    cy.clickHeaderButton(0);

    cy.wait(1000).url().should('include', 'cluster/create');

    // cluster name
    cy.get('[name="name"]').clear().type(name).blur();
    cy.formSelect('region', region);
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

  // 创建高可用集群
  it.skip(...TestCase('集群管理-创建-2').smoke().value(), () => {
    cy.clickHeaderButton(0);

    cy.wait(1000).url().should('include', 'cluster/create');

    // cluster name
    cy.get('[name="name"]').clear().type(name).blur();
    cy.formSelect('region', region);
    // select node
    cy.waitTransferList();
    cy.formMultiTransfer('nodes', 0);
    cy.formMultiTransfer('nodes', 0, 1);
    cy.formMultiTransfer('nodes', 0, 1);

    // next step
    cy.clickStepActionNextButton('step-next');
    cy.wait(2000);
    cy.clickStepActionNextButton('step-quick');
    cy.clickStepActionNextButton('step-confirm');
    // check status
    cy.wait(2000).tableSearchText(name).waitStatusSuccess();
  });

  // 查看集群
  it(...TestCase('集群管理-查看-1').smoke().value(), () => {
    cy.tableSearchText(name).goToDetail(1);
    cy.checkDetailName(name);
  });

  // 编辑集群
  it(...TestCase('集群管理-集群-编辑集群-1').smoke().value(), () => {
    cy.tableSearchText(name);
    cy.clickActionInMore({
      title: 'Cluster Settings',
      subTitle: 'Edit',
    });
    cy.inputText('description', description);
    cy.inputIP('.ant-form-item-control-input .input-ip', externalIP);

    cy.clickConfirm();
    cy.wait(500).waitStatusSuccess();
    cy.checkTableColVal(3, description);
  });

  // 添加节点
  it(...TestCase('集群管理-集群-添加节点-1').smoke().value(), () => {
    cy.tableSearchText(name);
    cy.clickActionInMore({
      title: 'Node management',
      subTitle: 'AddNode',
    });
    cy.formMultiTransfer('nodes', 0);
    cy.clickConfirm();
    cy.wait(2000).waitStatusSuccess();
  });

  // 移除节点
  it(...TestCase('集群管理-集群-移除节点-1').smoke().value(), () => {
    cy.tableSearchText(name);
    cy.clickActionInMore({
      title: 'Node management',
      subTitle: 'RemoveNode',
    });
    cy.clickByTitle('.ant-modal-content .ant-table-tbody', 'worker');
    cy.clickConfirm();
    cy.wait(2000).waitStatusSuccess();
  });

  // 删除集群
  it(...TestCase('集群管理-集群-删除集群-1').smoke().value(), () => {
    cy.clickActionInMore({
      title: 'Cluster Status',
      subTitle: 'Delete Cluster',
    });

    cy.clickByTitle('.ant-modal-confirm-btns span', 'Confirm');
    // cy.tableSearchText(name).waitStatusSuccess();
  });
});
