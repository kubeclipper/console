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

const uuid = Cypress._.random(0, 1e6);
const name = `e2e.cluster.name.${uuid}`;

describe('模版管理', () => {
  const testUrl = 'cluster/template';
  const templateName = `e2e.template.name${uuid}`;

  const templatePluginName = `e2e.template.name${uuid}`;

  beforeEach(() => {
    cy.login(testUrl);
  });

  afterEach(() => {
    cy.addContext();
  });

  // 集群模版添加
  it(
    ...testCase('集群管理-模版管理-Cluster 模版-添加-1').smoke().value(),
    () => {
      cy.clickHeaderButton(0);
      cy.formInput('templateName', templateName);

      cy.wait(1000);
      cy.clickStepActionNextButton('step-next');
      cy.wait(1000);
      cy.clickStepActionNextButton('step-next');
      cy.clickStepActionNextButton('step-confirm');
      cy.get('.ant-table-body').find('.ant-table-row').should('have.length', 1);
    }
  );

  // 集群模版编辑
  it(
    ...testCase('集群管理-模版管理-Cluster 模版-编辑-1').smoke().value(),
    () => {
      cy.clickActionButtonByTitle('Edit');
      cy.wait(1000);
      cy.clickStepActionNextButton('step-next');
      cy.wait(1000);
      cy.clickStepActionNextButton('step-next');
      cy.clickStepActionNextButton('step-confirm');
    }
  );

  // 使用模版创建集群
  it(...testCase('集群管理-创建集群-集群模版使用-1').smoke().value(), () => {
    cy.visitPage('/cluster');

    cy.clickHeaderButton(0);
    cy.formInput('name', name);

    cy.formSelect('clusterTemplate', templateName);

    // select node
    cy.waitTransferList();
    cy.formMultiTransfer('nodes', 0);

    // next step
    cy.clickStepActionNextButton('step-next');
    cy.wait(2000);
    cy.clickStepActionNextButton('step-quick');
    cy.clickStepActionNextButton('step-confirm');

    cy.wait(2000).tableSearchText(name).waitStatusSuccess();
    cy.deleteCluster(name);
  });

  // 使用模版快速创建集群
  it(...testCase('集群管理-创建集群-集群模版使用-2').smoke().value(), () => {
    cy.visitPage('/cluster');

    cy.clickHeaderButton(0);
    cy.formInput('name', name);
    cy.formSelect('clusterTemplate', templateName);

    // select node
    cy.waitTransferList();
    cy.formMultiTransfer('nodes', 0);

    cy.clickStepActionNextButton('step-quick');
    cy.clickStepActionNextButton('step-confirm');

    cy.wait(2000).tableSearchText(name).waitStatusSuccess();
  });

  // 集群模版保存
  it(...testCase('集群管理-集群-更多-保存为模版-1').smoke().value(), () => {
    cy.get('.ant-table-body')
      .find('.ant-table-row')
      .its('length')
      .as('rowLength');

    cy.visitPage('/cluster');
    cy.clickActionInMore({
      title: 'Cluster Settings',
      subTitle: 'Save as template',
    });

    cy.formInput('templateName', `${templateName}1`);
    cy.formInput('templateDescription', 'templateDescription');
    cy.clickModalActionSubmitButton();

    cy.wait(2000).tableSearchText(name).waitStatusSuccess();
    cy.deleteCluster(name);

    cy.visitPage(testUrl);
    cy.get('@rowLength').then((rowLength) => {
      cy.get('.ant-table-body .ant-table-row').should(
        'have.lengthOf.gt',
        rowLength
      );
    });

    cy.clickActionButtonByTitle('Delete');
    cy.clickConfirmActionSubmitButton();
  });

  // 集群模版删除
  it(
    ...testCase('集群管理-模版管理-Cluster 模版-删除-1').smoke().value(),
    () => {
      cy.clickActionButtonByTitle('Delete');
      cy.clickConfirmActionSubmitButton();
      cy.get('.ant-empty-image').should('exist');
    }
  );

  // nfs 模版添加
  it(...testCase('集群管理-模版管理-插件模版-添加-1').smoke().value(), () => {
    cy.visitPage('/cluster/template');

    cy.clickByDetailTabs('nfs-csi 模版');
    cy.clickHeaderButton(0);

    cy.formInput('templateName', templatePluginName);

    cy.get('input[title="服务地址"]').eq(0).type(Cypress.env('nfsIp'));
    cy.get('input[title="共享路径"]').eq(0).type(Cypress.env('nfsPath'));
    cy.get('.step-form-footer-btns')
      .find('.ant-btn-primary')
      .click()
      .wait(1000);

    cy.checkTableRowLength(1);
  });

  // nfs 模版添加
  it(...testCase('集群管理-模版管理-插件模版-删除-1').smoke().value(), () => {
    cy.visitPage('/cluster/template');
    cy.clickByDetailTabs('nfs-csi 模版');
    cy.wait(1000);
    cy.clickActionButtonByTitle('Delete');
    cy.clickConfirmActionSubmitButton();

    cy.checkEmptyTable();
  });
});
