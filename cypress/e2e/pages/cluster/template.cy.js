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

describe('模版管理', () => {
  const testUrl = 'cluster/template';
  const templateName = 'template-name';

  beforeEach(() => {
    cy.login(testUrl);
  });

  // 集群模版添加
  it('集群管理-模版管理-Cluster 模版-添加-1', () => {
    cy.clickHeaderButton(0);

    cy.inputText('templateName', templateName);

    cy.wait(1000);
    cy.clickStepActionNextButton('step-next');
    cy.wait(1000);
    cy.clickStepActionNextButton('step-next');
    cy.clickStepActionNextButton('step-confirm');
    cy.get('.ant-table-body').find('.ant-table-row').should('have.length', 1);
  });

  // 集群模版编辑
  it('集群管理-模版管理-Cluster 模版-编辑-1', () => {
    cy.clickActionButtonByTitle('Edit');
    cy.wait(1000);
    cy.clickStepActionNextButton('step-next');
    cy.wait(1000);
    cy.clickStepActionNextButton('step-next');
    cy.clickStepActionNextButton('step-confirm');
  });

  // 使用模版创建集群
  it('集群管理-创建集群-集群模版使用-1', () => {
    cy.visitPage('/cluster');

    cy.clickHeaderButton(0);
    cy.get('[name="name"]').clear().type('demo').blur();

    //
    cy.formSelect('clusterTemplate', templateName);

    // select node
    cy.waitTransferList();
    cy.formMultiTransfer('nodes', 0);

    // next step
    cy.clickStepActionNextButton('step-next');
    cy.wait(2000);
    cy.clickStepActionNextButton('step-quick');
    cy.clickStepActionNextButton('step-confirm');

    cy.wait(2000).waitStatusSuccess();
  });

  // 使用模版快速创建集群
  it('集群管理-创建集群-集群模版使用-2', () => {
    cy.visitPage('/cluster');

    cy.clickHeaderButton(0);
    cy.get('[name="name"]').clear().type('demo2').blur();

    //
    cy.formSelect('clusterTemplate', templateName);

    // select node
    cy.waitTransferList();
    cy.formMultiTransfer('nodes', 0);

    cy.clickStepActionNextButton('step-quick');
    cy.clickStepActionNextButton('step-confirm');

    cy.wait(2000).waitStatusSuccess();
  });

  // 集群模版保存
  it('集群管理-集群-更多-保存为模版-1', () => {
    cy.get('.ant-table-body')
      .find('.ant-table-row')
      .its('length')
      .as('rowLength');

    cy.visitPage('/cluster');
    cy.clickActionInMore({
      title: 'Cluster Settings',
      subTitle: 'Save as template',
    });

    cy.inputText('templateName', 'template-name1');
    cy.inputText('templateDescription', 'templateDescription');
    cy.clickConfirm();

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
  it('集群管理-模版管理-Cluster 模版-删除-1', () => {
    cy.clickActionButtonByTitle('Delete');
    cy.clickConfirmActionSubmitButton();
    cy.get('.ant-empty-image').should('exist');
  });
});
