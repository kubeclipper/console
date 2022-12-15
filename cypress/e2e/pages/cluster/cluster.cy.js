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

describe('集群', () => {
  const listUrl = '/cluster';

  const uuid = Cypress._.random(0, 1e6);
  const name = `e2e.cluster.name${uuid}`;
  const description = 'e2e-description';
  const region = 'default';
  const externalIP = Cypress.env('externalIP');
  const upgradeVersion = Cypress.env('upgradeVersion');

  const nfsIp = Cypress.env('nfsIp');
  const nfsPath = Cypress.env('nfsPath');
  const offLineRegistry = Cypress.env('offLineRegistry');

  const selectComponentTab = 'NFS CSI';
  const enableComponent = 'nfs-csi';

  beforeEach(() => {
    cy.login(listUrl);
  });

  afterEach(() => {
    cy.addContext();
  });

  // 创建单机集群
  it(...testCase('集群管理-创建-1').smoke().value(), () => {
    cy.clickHeaderButton(0);

    cy.wait(1000).url().should('include', 'cluster/create');

    // cluster name
    cy.formInput('name', name);
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
    cy.wait(2000);

    // check log modal
    cy.tableSearchText(name).goToDetail(1);
    cy.clickByDetailTabs('Operation Log')
      .clickActionButtonByTitle('ViewLog')
      .wait(1000);
    cy.get('.ant-modal-body').should('exist').wait(6000);
    cy.get('.ant-modal-body').should('exist');
    cy.closeModal();

    cy.goBackToList(listUrl).wait(2000);
    cy.tableSearchText(name).waitStatusSuccess();
  });

  // 添加节点
  it(...testCase('集群管理-集群-添加节点-1').smoke().value(), () => {
    cy.tableSearchText(name);
    cy.clickActionInMore({
      title: 'Node management',
      subTitle: 'AddNode',
    });
    cy.formMultiTransfer('nodes', 0);
    cy.clickModalActionSubmitButton();
    cy.waitStatusSuccess();
  });

  // 移除节点
  it(...testCase('集群管理-集群-移除节点-1').smoke().value(), () => {
    cy.tableSearchText(name);
    cy.clickActionInMore({
      title: 'Node management',
      subTitle: 'RemoveNode',
    });
    cy.clickByTitle('.ant-modal-content .ant-table-tbody', 'worker');
    cy.clickModalActionSubmitButton();
    cy.waitStatusSuccess();

    cy.deleteCluster(name);
  });

  // 创建带存储插件 nfs 的集群
  it(...testCase('集群管理-创建-3').smoke().value(), () => {
    cy.clickHeaderButton(0);

    cy.wait(1000).url().should('include', 'cluster/create');

    // cluster name
    cy.formInput('name', name);
    cy.formSelect('region', region);
    // select node
    cy.waitTransferList();
    cy.formMultiTransfer('nodes', 0);
    cy.clickStepActionNextButton('step-next');
    cy.wait(1000);

    cy.formInput('localRegistry', offLineRegistry);
    cy.wait(1000);

    cy.clickStepActionNextButton('step-next');

    cy.selectComponentTab(selectComponentTab);
    cy.enableComponent(enableComponent);

    cy.get('input[title="服务地址"]').eq(0).type(Cypress.env('nfsIp'));
    cy.get('input[title="共享路径"]').eq(0).type(Cypress.env('nfsPath'));
    cy.get('input[title="NFS 镜像仓库代理"]').eq(0).type(offLineRegistry);
    cy.clickStepActionNextButton('step-quick');
    cy.clickStepActionNextButton('step-confirm');

    // check status
    cy.wait(2000).tableSearchText(name).waitStatusSuccess();
  });

  // 创建同名集群
  it(...testCase('集群管理-创建-4').smoke().value(), () => {
    cy.clickHeaderButton(0);

    cy.wait(1000).url().should('include', 'cluster/create');

    // cluster name
    cy.formInput('name', name);
    cy.formSelect('region', region);
    // select node
    cy.waitTransferList();
    cy.formMultiTransfer('nodes', 0);

    // next step
    cy.clickStepActionNextButton('step-next');
    cy.wait(1000);
    cy.clickStepActionNextButton('step-quick');
    cy.clickStepActionNextButton('step-confirm');

    cy.checkActionError();
  });

  // 查看集群
  it(...testCase('集群管理-查看-1').smoke().value(), () => {
    cy.tableSearchText(name).goToDetail(1);
    cy.checkDetailName(name);
  });

  // 区域管理-区域详情-查看集群详情
  it(...testCase('区域管理-区域详情-查看集群详情-1').smoke().value(), () => {
    cy.selectMenu({
      title: 'Region',
    });
    cy.tableSearchText('default').goToDetail(0);
    cy.tableSearchText(name);
    cy.goToDetail(0).checkBaseDetailValue(name);

    cy.clickByDetailTabs('Nodes List').checkTableRowLength();
    cy.clickByDetailTabs('Operation Log');
    cy.clickActionButtonByTitle('ViewLog');
    cy.get('.ant-modal-body').should('exist');
  });

  it(...testCase('区域管理-区域详情-查看集群列表-1').smoke().value(), () => {
    cy.selectMenu({
      title: 'Region',
    });
    cy.tableSearchText('default').goToDetail(0);
    cy.clickByDetailTabs('Cluster List');
    cy.checkTableRowLength();
  });

  // 使用 http 镜像仓库
  it(
    ...testCase('集群-更多-集群设置-CRI 镜像仓库-http-docker-1')
      .smoke()
      .value(),
    () => {
      const registryName = `registry-${uuid}`;

      // 创建 registy
      cy.selectMenu({
        subTitle: 'Registry',
      });
      cy.clickHeaderButton(0);
      cy.formInput('name', registryName);
      cy.formInputRegistry(
        'host',
        0,
        offLineRegistry
      ).clickModalActionSubmitButton();

      cy.selectMenu({
        subTitle: 'Cluster',
      });
      cy.tableSearchText(name).clickActionInMore({
        title: 'Cluster Settings',
        subTitle: 'CRI Registry',
      });

      cy.formArrayInputAdd('registries');

      cy.get('.item-detail').find('.ant-select').click().wait(500);
      cy.get('.ant-select-item-option-content').should(($div) => {
        const text = $div.text();

        expect(text).to.include(registryName);
      });

      cy.get('.ant-select-item-option')
        .contains(`${offLineRegistry} (${registryName})`)
        .click({ force: true })
        .clickModalActionSubmitButton();

      cy.deleteRegistry(registryName);
    }
  );

  // 编辑集群
  it(...testCase('集群管理-集群-编辑集群-1').smoke().value(), () => {
    cy.tableSearchText(name);
    cy.clickActionInMore({
      title: 'Cluster Settings',
      subTitle: 'Edit',
    });
    cy.formInput('description', description);
    cy.inputIP('.ant-form-item-control-input .input-ip', externalIP);

    cy.clickModalActionSubmitButton();
    cy.wait(500).waitStatusSuccess();
    cy.checkTableColVal(3, description);
  });

  // 查看 kubeconfig 文件
  it(...testCase('集群管理-查看 kubeconfig 文件-1').smoke().value(), () => {
    cy.tableSearchText(name);
    cy.clickActionInMore({
      title: 'Certificate Management',
      subTitle: 'View KubeConfig File',
    });
    cy.get('#ace-editor').should('exist');
    cy.get('.ace_content').should('contain', 'apiVersion');
    cy.get('[aria-label="download"]').should('exist');
  });

  // 下载 kubeconfig 文件
  it(...testCase('集群管理-下载 kubeconfig 文件-1').smoke().value(), () => {
    cy.tableSearchText(name);
    cy.clickActionInMore({
      title: 'Certificate Management',
      subTitle: 'View KubeConfig File',
    });

    cy.get('[aria-label="download"]')
      .first()
      .click({ force: true })
      .closeNotice();
  });

  // 更新集群证书
  it(...testCase('集群管理-更新集群证书-1').smoke().value(), () => {
    cy.tableSearchText(name);
    cy.clickActionInMore({
      title: 'Certificate Management',
      subTitle: 'Update Cluster License',
    });
    cy.clickConfirmActionSubmitButton().waitStatusSuccess();
  });

  // 带插件集群添加节点
  it(...testCase('集群管理-集群-添加节点-2').smoke().value(), () => {
    cy.tableSearchText(name);
    cy.clickActionInMore({
      title: 'Node management',
      subTitle: 'AddNode',
    });
    cy.formMultiTransfer('nodes', 0);
    cy.clickModalActionSubmitButton();
    cy.waitStatusSuccess();
  });

  // 移除节点
  it(...testCase('集群管理-集群-移除节点-3').smoke().value(), () => {
    cy.tableSearchText(name);
    cy.clickActionInMore({
      title: 'Node management',
      subTitle: 'RemoveNode',
    });
    cy.clickByTitle('.ant-modal-content .ant-table-tbody', 'worker');
    cy.clickModalActionSubmitButton();
    cy.waitStatusSuccess();
  });

  // 查看集群详情
  it(...testCase('集群管理-集群详情-详情-1').smoke().value(), () => {
    cy.goToDetail(1);
    cy.clickByDetailTabs('BaseDetail');

    cy.get('.ant-descriptions-view').should('exist');
    cy.get('.ant-tabs-content h3').should('contain', getTitle('Base Info'));
    cy.get('.ant-tabs-content h3').should('contain', getTitle('Network Info'));
  });

  // 查看集群存储
  it(...testCase('集群管理-集群详情-存储详情-1').smoke().value(), () => {
    cy.goToDetail(1);
    cy.clickByDetailTabs('Storage');

    cy.get('.ant-tabs-content h3').should('contain', enableComponent);
  });

  // 查看节点列表
  it(
    ...testCase('集群管理-集群-集群详情-节点列表-1').smoke().value(),
    () => {}
  );

  // 添加节点
  it(...testCase('集群管理-集群-集群详情-节点列表-2').smoke().value(), () => {
    cy.goToDetail(1);
    cy.clickByDetailTabs('Nodes List');

    cy.get('.ant-table-body')
      .find('.ant-table-row')
      .its('length')
      .as('rowLength');

    cy.clickHeaderButton(0, 200);
    cy.formMultiTransfer('nodes', 0);
    cy.clickModalActionSubmitButton();

    cy.log('@rowLength');

    cy.get('@rowLength').then((rowLength) => {
      cy.log(rowLength);
      cy.get('.ant-table-body .ant-table-row').should(
        'have.lengthOf.gt',
        rowLength
      );
    });
    cy.selectMenu({
      subTitle: 'Cluster',
    });
    cy.waitStatusSuccess();
  });

  // 移除节点
  it(...testCase('集群管理-集群-集群详情-节点列表-3').smoke().value(), () => {
    cy.tableSearchText(name).goToDetail(1);

    cy.clickByDetailTabs('Nodes List');
    cy.get('.ant-table-body')
      .find('.ant-table-row')
      .its('length')
      .as('rowLength');

    cy.selectTableListByIndex(1);
    cy.clickHeaderButton(1);
    cy.clickConfirmActionSubmitButton();
    cy.wait(10 * 1000);

    cy.freshTable();
    cy.log('@rowLength');

    cy.get('@rowLength').then((rowLength) => {
      cy.log(rowLength);
      cy.get('.ant-table-body .ant-table-row').should(
        'have.lengthOf.lt',
        rowLength
      );
    });
    cy.selectMenu({
      subTitle: 'Cluster',
    });
    cy.waitStatusSuccess();
  });

  // 单独卸载存储nfs
  it(...testCase('集群管理-集群详情-存储-移除1').smoke().value(), () => {
    cy.tableSearchText(name);
    cy.goToDetail(1);
    cy.clickByDetailTabs('Storage');
    cy.get('.ant-row').find('.ant-btn-dangerous').click();
    cy.clickConfirmActionSubmitButton();
    cy.goBackToList(listUrl);
    cy.tableSearchText(name).wait(2000).waitStatusSuccess();
  });

  // 单独安装存储nfs
  it(...testCase('集群管理-集群-添加存储项-1').smoke().value(), () => {
    cy.tableSearchText(name);
    cy.clickActionInMore({
      title: 'Plugin management',
      subTitle: 'Add Storage',
    });
    cy.get('.ant-row').contains('NFS CSI').click();
    cy.get('.ant-checkbox-input').eq(0).click();
    cy.get('input[title = "服务地址"]').eq(0).type(nfsIp);
    cy.get('input[title = "共享路径"]').eq(0).type(nfsPath);
    cy.get('.step-form-footer-btns')
      .find('.ant-btn-primary')
      .click()
      .wait(1000);
    cy.tableSearchText(name).wait(2000).waitStatusSuccess();

    // 移除
    cy.goToDetail(1);
    cy.clickByDetailTabs('Storage');
    cy.get('.ant-row').find('.ant-btn-dangerous').click();
    cy.clickConfirmActionSubmitButton();
    cy.goBackToList(listUrl);
    cy.tableSearchText(name).wait(2000).waitStatusSuccess();
  });

  // 使用镜像仓库单独安装存储nfs
  it(...testCase('集群管理-集群-添加存储项-2').smoke().value(), () => {
    cy.tableSearchText(name);
    cy.clickActionInMore({
      title: 'Plugin management',
      subTitle: 'Add Storage',
    });
    cy.get('.ant-row').contains('NFS CSI').click();
    cy.get('.ant-checkbox-input').eq(0).click();
    cy.get('input[title = "服务地址"]').eq(0).type(nfsIp);
    cy.get('input[title = "共享路径"]').eq(0).type(nfsPath);
    cy.get('input[title = "NFS 镜像仓库代理"]').eq(0).type(offLineRegistry);
    cy.get('.step-form-footer-btns').find('.ant-btn-primary').click().wait(200);
    cy.tableSearchText(name).wait(2000).waitStatusSuccess();

    cy.goToDetail(1);
    cy.clickByDetailTabs('Storage');
    cy.get('.ant-row').find('.ant-btn-dangerous').click();
    cy.clickConfirmActionSubmitButton();
    cy.goBackToList(listUrl);
    cy.tableSearchText(name).wait(2000).waitStatusSuccess();
  });

  // 查看操作日志
  it(...testCase('集群管理-集群-集群详情-操作日志-1').smoke().value(), () => {
    cy.goToDetail(1);
    cy.clickByDetailTabs('Operation Log');

    cy.clickActionButtonByTitle('ViewLog');
    cy.get('.ant-modal-body').should('exist');
  });

  // 升级集群
  it(...testCase('集群管理-集群-升级集群-1').smoke().value(), () => {
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
    cy.clickModalActionSubmitButton();

    cy.waitStatusSuccess(null, 20 * 60 * 1000);

    cy.goToDetail(1);
    cy.get('.ant-tabs-content .ant-row').should('contain', upgradeVersion);
  });

  // 删除集群
  it(...testCase('集群管理-集群-删除集群-1').smoke().value(), () => {
    cy.deleteCluster(name);
  });

  // 创建高可用集群
  it(...testCase('集群管理-创建-2').smoke().value(), () => {
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
    cy.deleteCluster(name);
  });
});
