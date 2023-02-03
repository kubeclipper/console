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
import moment from 'moment';

describe('kubeadm 纳管', () => {
  const _uuid = Cypress._.random(0, 1e6);

  const name = 'demo';
  const region = 'default';
  const clusterName = `e2e.cluster.name${_uuid}`;

  const backupFSName = `fs-${_uuid}`;
  const backupFSRootDir = Cypress.env('nfsPath') || '/root';
  const backupFSStorageType = 'FS';

  const offLineRegistry = Cypress.env('offLineRegistry');

  afterEach(() => {
    cy.addContext();
  });

  // 添加提供商（密钥）
  it(...testCase('集群管理-集群托管-提供商-添加-2').smoke().value(), () => {
    cy.login('/cluster/hosting');

    cy.clickHeaderButton(0);

    cy.readFile('cypress/config/kubeconfig.yaml').then((kubeconfig) => {
      cy.readFile('cypress/config/privateKey').then((privateKey) => {
        cy.formInput('name', name);
        cy.formSelect('region', region);
        cy.get('#form-item-col-sshType').contains('PrivateKey').click();

        cy.formInput('user', 'root');
        cy.get('textarea[name="privateKey"]')
          .invoke('val', privateKey)
          .type(' ', { force: true });

        cy.formInput('clusterName', clusterName);
        // 输出 kubeconfig
        cy.get('.ace_text-input')
          .focus()
          .invoke('val', kubeconfig)
          .type(' ', { force: true });

        cy.clickModalActionSubmitButton();

        // 托管列表校验
        cy.tableSearchText(name);

        cy.get('.ant-table-row')
          .find('td')
          .eq(1)
          .find('span', { timeout: 1000 * 60 })
          .should('not.exist');

        // 集群列表校验
        cy.visitPage('/cluster');
        cy.tableSearchText(clusterName);
        cy.waitStatusSuccess();
      });
    });
  });

  // 纳管集群添加CRI镜像仓库
  it(
    ...testCase('集群管理-集群-纳管集群详情-添加CRI镜像仓库-3').smoke().value(),
    () => {
      cy.login('/cluster/registry');

      const registryName = `registry-${_uuid}`;

      // 创建 registy
      cy.visitPage('/cluster/registry').clickHeaderButton(0);
      cy.formInput('name', registryName);
      cy.formInputRegistry(
        'host',
        0,
        offLineRegistry
      ).clickModalActionSubmitButton();

      cy.visitPage('/cluster');
      cy.tableSearchText(clusterName).clickActionInMore({
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

      cy.login('/cluster/hosting');
      cy.tableSearchText(name);

      cy.clickActionInMore({ title: 'Remove' });
      cy.clickConfirmActionSubmitButton();
      cy.checkEmptyTable(20 * 60 * 1000);
    }
  );

  // 添加提供商(密码)
  it(...testCase('集群管理-集群托管-提供商-添加-1').smoke().value(), () => {
    cy.login('/cluster/hosting');

    cy.clickHeaderButton(0);

    cy.readFile('cypress/config/kubeconfig.yaml').then((kubeconfig) => {
      cy.formInput('name', name);
      cy.formSelect('region', region);
      cy.get('#form-item-col-sshType').contains(getTitle('Password')).click();

      cy.formInput('user', 'root');
      cy.formInput('password', Cypress.env('password'));
      cy.formInput('clusterName', clusterName);
      // 输出 kubeconfig
      cy.get('.ace_text-input')
        .focus()
        .invoke('val', kubeconfig)
        .type(' ', { force: true });

      cy.clickModalActionSubmitButton();

      // 托管列表校验
      cy.tableSearchText(name);

      cy.get('.ant-table-row')
        .find('td')
        .eq(1)
        .find('span', { timeout: 1000 * 60 })
        .should('not.exist');

      // 集群列表校验
      cy.visitPage('/cluster');
      cy.tableSearchText(clusterName);
      cy.waitStatusSuccess();
    });
  });

  // 编辑提供商 需：节点修改节点的密码
  it.skip(
    ...testCase('集群管理-集群托管-提供商-编辑-1').smoke().value(),
    () => {}
  );

  // 编辑提供商
  it(...testCase('集群管理-集群托管-提供商-编辑-2').smoke().value(), () => {
    cy.login('/cluster/hosting');
    cy.wait(2000);
    cy.clickActionInMore({ title: 'Edit' });

    cy.get('.ace_text-input')
      .focus()
      .type('{backspace}{backspace}{backspace}', { force: true });
    cy.clickModalActionSubmitButton();

    cy.tableSearchText(name);

    cy.log(getTitle('SyncFailed'));

    cy.get('.ant-table-row')
      .find('td')
      .eq(1)
      .find('span', { timeout: 1000 * 60 })
      .should('exist');
  });

  // 同步提供商 需：命令行添加节点
  it.skip(
    ...testCase('集群管理-集群托管-提供商-同步提供商-1').smoke().value(),
    () => {}
  );

  // 同步提供商 需：后台查看kubeadm集群信息
  it.skip(
    ...testCase('集群管理-集群托管-提供商-同步提供商-2').smoke().value(),
    () => {}
  );

  // 纳管集群的备份恢复
  it(
    ...testCase('集群管理-集群-纳管集群详情-备份恢复-6').smoke().value(),
    () => {
      cy.login('/cluster/backup-point');
      // 添加备份空间
      cy.clickHeaderButton(0);

      cy.formInput('name', backupFSName);
      cy.formInput('backupRootDir', backupFSRootDir);
      cy.formSelect('storageType', backupFSStorageType);
      cy.clickModalActionSubmitButton();

      // 集群绑定备份控件
      cy.visitPage('/cluster');
      cy.tableSearchText(clusterName);
      cy.clickActionInMore({
        title: 'Cluster Settings',
        subTitle: 'Edit',
      });
      cy.formSelect('backupPoint', backupFSName);
      cy.clickModalActionSubmitButton();

      // 备份集群
      cy.clickActionInMore({
        title: 'Backup and recovery',
        subTitle: 'Backup Cluster',
      });

      cy.formInput('name', 'test-backup');
      cy.clickModalActionSubmitButton();
      cy.waitStatusSuccess();

      // 恢复集群
      cy.clickActionInMore({
        title: 'Backup and recovery',
        subTitle: 'Restore Cluster',
      });

      cy.clickByTitle('.ant-modal-content .ant-table-tbody', backupFSName);
      cy.clickModalActionSubmitButton();
      cy.waitStatusSuccess();
    }
  );

  // 纳管集群访问kubectl
  it.skip(
    ...testCase('集群管理-集群-纳管集群详情-访问kubectl-1').smoke().value(),
    () => {}
  );

  // 纳管集群更新集群证书
  it(
    ...testCase('集群管理-集群托管-纳管集群详情-更新集群证书-9')
      .smoke()
      .value(),
    () => {
      cy.login('/cluster');
      cy.tableSearchText(clusterName);

      cy.clickActionInMore({
        title: 'Certificate Management',
        subTitle: 'Update Cluster License',
      });
      cy.clickConfirmActionSubmitButton();

      cy.wait(2000).waitStatusSuccess();
      cy.goToDetail(1);
      const nextYear = moment().add(1, 'y').format('YYYY-MM-DD');
      cy.checkDetailValueByKey('License Expiration Time', nextYear);
    }
  );

  // 纳管集群查看kubeconfig文件
  it(
    ...testCase('集群管理-集群托管-纳管集群详情-查看kubeconfig文件-10')
      .smoke()
      .value(),
    () => {
      cy.login('/cluster');
      cy.tableSearchText(clusterName);

      cy.clickActionInMore({
        title: 'Certificate Management',
        subTitle: 'View KubeConfig File',
      });

      cy.get('.ace_content').should('contain', 'apiVersion');
    }
  );

  // 纳管集群添加节点
  it(
    ...testCase('集群管理-集群托管-纳管集群详情-添加节点-4').smoke().value(),
    () => {
      cy.login('/cluster');
      cy.tableSearchText(clusterName);
      cy.clickActionInMore({
        title: 'Node management',
        subTitle: 'AddNode',
      });
      cy.formMultiTransfer('nodes', 0);
      cy.clickModalActionSubmitButton();
      cy.waitStatusSuccess(null, 30 * 60 * 1000);
    }
  );

  // 纳管集群移除节点
  it(
    ...testCase('集群管理-集群托管-纳管集群详情-移除节点-5').smoke().value(),
    () => {
      cy.login('/cluster');
      cy.tableSearchText(clusterName);
      cy.clickActionInMore({
        title: 'Node management',
        subTitle: 'RemoveNode',
      });
      cy.clickByTitle('.ant-modal-content .ant-table-tbody', 'worker');
      cy.clickModalActionSubmitButton();
      cy.waitStatusSuccess();
    }
  );

  // 纳管集群的添加存储项
  it(
    ...testCase('集群管理-集群-纳管集群详情-添加存储项-7').smoke().value(),
    () => {
      cy.login('/cluster');
      cy.tableSearchText(clusterName);
      cy.clickActionInMore({
        title: 'Plugin Manage',
        subTitle: 'Add Storage',
      });

      cy.selectComponentTab('NFS CSI');
      cy.enableComponent('nfs-csi');

      cy.get('input[title="服务地址"]').eq(0).type(Cypress.env('nfsIp'));
      cy.get('input[title="共享路径"]').eq(0).type(Cypress.env('nfsPath'));
      cy.clickStepActionConfirmButton();

      cy.wait(2000).waitStatusSuccess(null, 20 * 60 * 1000);
    }
  );

  // 移除提供商
  it(
    ...testCase('集群管理-集群托管-提供商-移除提供商-1').smoke().value(),
    () => {
      cy.login('/cluster/hosting');
      cy.tableSearchText(name);

      cy.clickActionInMore({ title: 'Remove' });
      cy.clickConfirmActionSubmitButton();
      cy.checkEmptyTable(20 * 60 * 1000);

      cy.visitPage('/cluster');
      cy.tableSearchText(clusterName);
      cy.checkEmptyTable();
    }
  );
});
