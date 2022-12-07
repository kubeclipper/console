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
import getTitle, { testCase } from '../../../support/common';

describe('在线/离线安装集群', () => {
  const listUrl = '/cluster';

  const uuid = Cypress._.random(0, 1e6);
  const offLineRegistry = Cypress.env('offLineRegistry');

  beforeEach(() => {
    cy.login(listUrl);
  });

  // 在线安装 本地未设置镜像仓库代理的话，该用例会失败，workflow 里应该会成功
  it(...testCase('集群管理-集群安装-1').smoke().value(), () => {
    const name = `e2e.cluster.name1${uuid}`;

    cy.clickHeaderButton(0);

    cy.url().should('include', 'cluster/create');

    cy.formInput('name', name).waitTransferList().formMultiTransfer('nodes', 0);
    cy.formArrayInputRemove('taints').clickStepActionNextButton('step-next');
    cy.formRadioChoose('offline', 0).clickStepActionNextButton('step-next');
    cy.clickStepActionNextButton('step-next');
    cy.checkConfirmStepItemContent('cluster', getTitle('Online'));
    cy.clickStepActionNextButton('step-confirm');
    cy.tableSearchText(name).waitStatusSuccess();
    cy.deleteCluster(name);
  });

  // 离线安装
  it(...testCase('集群管理-集群安装-2').smoke().value(), () => {
    const name = `e2e.cluster.name2${uuid}`;

    cy.clickHeaderButton(0);

    cy.url().should('include', 'cluster/create');

    cy.formInput('name', name).waitTransferList().formMultiTransfer('nodes', 0);
    cy.formArrayInputRemove('taints').clickStepActionNextButton('step-next');
    cy.formRadioChoose('offline', 1)
      .formInput('localRegistry', offLineRegistry)
      .clickStepActionNextButton('step-next');
    cy.clickStepActionNextButton('step-next');
    cy.checkConfirmStepItemContent('cluster', getTitle('Offline'));
    cy.clickStepActionNextButton('step-confirm');
    cy.tableSearchText(name).waitStatusSuccess();
    cy.deleteCluster(name);
  });
});
