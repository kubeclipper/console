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
import getTitle from '../../../support/common';

describe('集群', () => {
  const testUrl = '/cluster';

  const uuid = Cypress._.random(0, 1e6);
  const name = `e2e.cluster.name${uuid}`;
  const description = 'e2e-description';
  const region = 'default';
  const externalIP = '142.22.2.2';
  const upgradeVersion = 'v1.23.9';

  beforeEach(() => {
    cy.login(testUrl);
  });

  // 创建单机集群
  it('集群管理-创建-1', () => {
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
  it.skip('集群管理-创建-2', () => {
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
  it('集群管理-查看-1', () => {
    cy.tableSearchText(name).goToDetail(1);
    cy.checkDetailName(name);
  });

  // 编辑集群
  it('集群管理-集群-编辑集群-1', () => {
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
  it.skip('集群管理-集群-添加节点-1', () => {
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
  it.skip('集群管理-集群-移除节点-1', () => {
    cy.tableSearchText(name);
    cy.clickActionInMore({
      title: 'Node management',
      subTitle: 'RemoveNode',
    });
    cy.clickByTitle('.ant-modal-content .ant-table-tbody', 'worker');
    cy.clickConfirm();
    cy.wait(2000).waitStatusSuccess();
  });

  // 查看集群详情
  it('集群管理-集群详情-详情-1', () => {
    cy.goToDetail(1);
    cy.clickByDetailTabs('BaseDetail');

    cy.get('.ant-descriptions-view').should('exist');
    cy.get('.ant-tabs-content h3').should('contain', getTitle('Base Info'));
    cy.get('.ant-tabs-content h3').should('contain', getTitle('Network Info'));
  });

  // 查看集群存储
  it.skip('集群管理-集群详情-存储详情-1', () => {
    cy.goToDetail(1);
    cy.clickByDetailTabs('Storage');

    cy.get('.ant-tabs-content h3').should('contain', 'nfs-provisioner');
  });

  // 查看节点列表
  it.skip('集群管理-集群-集群详情-节点列表-1', () => {});

  // 添加节点
  it.skip('集群管理-集群-集群详情-节点列表-2', () => {
    cy.goToDetail(1);
    cy.clickByDetailTabs('Nodes List');

    cy.get('.ant-table-body')
      .find('.ant-table-row')
      .its('length')
      .as('rowLength');

    cy.clickHeaderButton(0, 200);
    cy.formMultiTransfer('nodes', 0);
    cy.clickConfirm();

    cy.log('@rowLength');

    cy.get('@rowLength').then((rowLength) => {
      cy.log(rowLength);
      cy.get('.ant-table-body .ant-table-row').should(
        'have.lengthOf.gt',
        rowLength
      );
    });
  });

  // 查看操作日志
  it('集群管理-集群-集群详情-操作日志-1', () => {
    cy.goToDetail(1);
    cy.clickByDetailTabs('Operation Log');

    cy.clickActionButtonByTitle('ViewLog');
    cy.get('.ant-modal-body').should('exist');
  });

  // 查看集群备份
  it.skip('集群管理-集群-集群详情-备份-1', () => {
    cy.goToDetail(1);
    cy.clickByDetailTabs('BackUp');

    cy.clickActionButtonByTitle('Edit');
    cy.inputText('description', 'description');
    cy.clickConfirm();
    cy.checkTableColVal(2, 'description');

    cy.clickActionInMore({
      title: 'Restore',
    });
    cy.clickConfirmActionSubmitButton();
    cy.wait(2000).waitStatusSuccess();

    cy.clickActionInMore({
      title: 'Delete',
    });
    cy.clickConfirmActionSubmitButton();
    cy.wait(2000).waitStatusSuccess();
  });

  // 升级集群
  it.skip('集群管理-集群-升级集群-1', () => {
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

  // 删除集群
  it('集群管理-集群-删除集群-1', () => {
    cy.deleteCluster(name);
  });
});
