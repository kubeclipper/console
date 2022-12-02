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

const uuid = Cypress._.random(0, 1e6);
const clusterName = `e2e.cluster.name.${uuid}`;

before(() => {
  cy.login();
  cy.createClusterQuick(clusterName);
});

after(() => {
  cy.deleteCluster(clusterName);
});

describe('备份空间', () => {
  const listUrl = '/cluster/backup-point';

  const _uuid = Cypress._.random(0, 1e6);

  const backupFSName = `fs-${_uuid}`;
  const backupFSRootDir = Cypress.env('backupFSRootDir'); // e2e workflow 中 mkdir 的目录
  const backupFSStorageType = 'FS';

  const backupS3Name = `s3-${_uuid}`;
  const backupS3StorageType = 'S3';
  const backupS3BucketName = 'kubeclipper';
  const backupS3EndPoint = Cypress.env('backupS3EndPoint');
  const backupS3Admin = Cypress.env('admin');
  const backupS3Password = Cypress.env('backupS3Password');

  // 定时备份
  const scheduledTest = 'scheduled-test';
  const onlyOnceTest = 'onlyonce-test	';

  beforeEach(() => {
    cy.login(listUrl);
  });

  afterEach(() => {
    cy.addContext();
  });

  // 添加fs备份空间
  it(...testCase('集群管理-备份空间-创建-1').smoke().value(), () => {
    cy.clickHeaderButton(0);

    cy.formInput('name', backupFSName);
    cy.formInput('backupRootDir', backupFSRootDir);
    cy.formSelect('storageType', backupFSStorageType);
    cy.clickModalActionSubmitButton();

    cy.tableSearchText(backupFSName);
    cy.checkTableColVal(3, 'fs');

    cy.visitPage('/cluster');
    cy.clickActionInMore({
      title: 'Cluster Settings',
      subTitle: 'Edit',
    });

    cy.formSelect('backupPoint', backupFSName);
  });

  // 查看集群备份
  it(...testCase('集群管理-集群-集群详情-备份-1').smoke().value(), () => {
    cy.goToDetail(1);
    cy.clickByDetailTabs('BackUp');

    cy.clickActionButtonByTitle('Edit');
    cy.formInput('description', 'description');
    cy.clickModalActionSubmitButton();
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

  // 添加s3备份空间
  it(...testCase('集群管理-备份空间-创建-2').smoke().value(), () => {
    cy.visitPage(listUrl);

    cy.clickHeaderButton(0);

    cy.formInput('name', backupS3Name);
    cy.formSelect('storageType', backupS3StorageType);
    cy.formInput('bucket', backupS3BucketName);
    cy.formInput('endpoint', backupS3EndPoint);
    cy.formInput('accessKeyID', backupS3Admin);
    cy.formInput('accessKeySecret', backupS3Password);
    cy.clickModalActionSubmitButton();

    cy.tableSearchText(backupS3Name);
    cy.checkTableColVal(3, 's3');

    cy.visitPage('/cluster');
    cy.clickActionInMore({
      title: 'Cluster Settings',
      subTitle: 'Edit',
    });

    cy.formSelect('backupPoint', backupS3Name);
  });

  // 备份空间查看
  it(...testCase('集群管理-备份空间-查看-1').smoke().value(), () => {
    cy.visitPage(listUrl);

    cy.tableSearchText(backupFSName);
    cy.checkTableColVal(2, backupFSName);
  });

  // fs备份空间编辑
  it(...testCase('集群管理-备份空间-编辑备份空间-1').smoke().value(), () => {
    cy.visitPage(listUrl);

    const description = 'fs-description';
    cy.tableSearchText(backupFSName);
    cy.checkTableColVal(2, backupFSName);
    cy.clickActionButtonByTitle('Edit');
    cy.formInput('description', description);
    cy.clickModalActionSubmitButton();
    cy.checkTableColVal(4, description);
  });

  // s3 备份空间编辑
  it(...testCase('集群管理-备份空间-编辑备份空间-2').smoke().value(), () => {
    const description = 's3-description';
    cy.tableSearchText(backupS3Name);
    cy.checkTableColVal(2, backupS3Name);
    cy.clickActionButtonByTitle('Edit');
    cy.formInput('description', description);
    cy.clickModalActionSubmitButton();
    cy.checkTableColVal(4, description);
  });

  // 使用 fs 存储备份
  it(...testCase('集群管理-备份空间-备份-1').smoke().value(), () => {
    cy.clickHeaderButton(0);
    cy.formInput('name', backupFSName);
    cy.formInput('backupRootDir', backupFSRootDir);
    cy.formSelect('storageType', backupFSStorageType);
    cy.clickModalActionSubmitButton();

    cy.visitPage('/cluster');
    cy.clickActionInMore({
      title: 'Cluster Settings',
      subTitle: 'Edit',
    });

    cy.formSelect('backupPoint', backupFSName);
    cy.clickModalActionSubmitButton();

    cy.clickActionInMore({
      title: 'Backup and recovery',
      subTitle: 'Backup Cluster',
    });

    cy.formInput('name', 'test-backup');
    cy.clickModalActionSubmitButton();
    cy.wait(2000).waitStatusSuccess();

    cy.goToDetail(1);
    cy.clickByDetailTabs('BackUp');
    cy.waitStatusSuccess();
  });

  // 使用 fs 存储恢复
  it(...testCase('集群管理-备份空间-恢复-2').smoke().value(), () => {
    cy.visitPage('cluster');

    cy.clickActionInMore({
      title: 'Backup and recovery',
      subTitle: 'Restore Cluster',
    });

    cy.clickByTitle('.ant-modal-content .ant-table-tbody', backupFSName);
    cy.clickModalActionSubmitButton();
    cy.wait(2000).waitStatusSuccess();
  });

  // 使用 s3 存储备份
  it(...testCase('集群管理-备份空间-备份-2').smoke().value(), () => {
    cy.visitPage('/cluster');
    cy.clickActionInMore({
      title: 'Cluster Settings',
      subTitle: 'Edit',
    });
    cy.formSelect('backupPoint', backupS3Name);
    cy.clickModalActionSubmitButton();
    cy.clickActionInMore({
      title: 'Backup and recovery',
      subTitle: 'Backup Cluster',
    });
    cy.formInput('name', 'test-backup');
    cy.clickModalActionSubmitButton();
    cy.wait(2000).waitStatusSuccess();

    cy.goToDetail(1);
    cy.clickByDetailTabs('BackUp');
    cy.waitStatusSuccess(null, 0);
  });

  // 使用 s3 存储恢复
  it(...testCase('集群管理-备份空间-恢复-1').smoke().value(), () => {
    cy.visitPage('cluster');

    cy.clickActionInMore({
      title: 'Backup and recovery',
      subTitle: 'Restore Cluster',
    });

    cy.clickByTitle('.ant-modal-content .ant-table-tbody', backupS3Name);
    cy.clickModalActionSubmitButton();
    cy.wait(2000).waitStatusSuccess();
  });

  // 定时备份-重复执行
  it(...testCase('集群管理-定时备份-1').smoke().value(), () => {
    cy.visitPage('/cluster');

    cy.goToDetail(1);
    cy.clickByDetailTabs('BackUp');
    cy.get('.ant-table-body')
      .find('.ant-table-row')
      .its('length')
      .as('rowLength');

    cy.visitPage('/cluster');
    cy.clickActionInMore({
      title: 'Backup and recovery',
      subTitle: 'Scheduled Backup',
    });

    cy.formInput('name', scheduledTest);
    cy.formSelect('type', getTitle('Repeat'));
    cy.formSelect('cycle', getTitle('Every Day'));
    cy.formInput('time', `${moment().add(2, 'm').format('HH:mm')}{enter}`);

    cy.formInput('maxBackupNum', 2);
    cy.clickModalActionSubmitButton();
    cy.wait(1000 * 60 * 2);

    cy.goToDetail(1);
    cy.clickByDetailTabs('BackUp');
    // cy.get('.ant-btn-loading', { timeout: 600000 }).should('not.exist');
    cy.get('@rowLength').then((rowLength) => {
      cy.log(rowLength);
      cy.get('.ant-table-body .ant-table-row').should(
        'have.length.gt',
        rowLength
      );
    });
  });

  // 编辑定时备份
  it(...testCase('集群管理-定时备份-3').smoke().value(), () => {
    cy.visitPage('/cluster');

    cy.goToDetail(1);
    cy.clickByDetailTabs('BackUp');
    cy.get('.ant-table-body')
      .find('.ant-table-row')
      .its('length')
      .as('rowLength');

    cy.visitPage('/cluster');
    cy.goToDetail(1);
    cy.clickByDetailTabs('Scheduled Backup');

    cy.clickActionButtonByTitle('Edit');

    cy.formInput('time', `${moment().add(2, 'm').format('HH:mm')}{enter}`);

    cy.clickModalActionSubmitButton();
    cy.wait(1000 * 60 * 2);

    cy.clickByDetailTabs('BackUp');
    cy.get('@rowLength').then((rowLength) => {
      cy.log(rowLength);
      cy.get('.ant-table-body .ant-table-row').should(
        'have.length.gt',
        rowLength
      );
    });
  });

  // 禁用/启用定时备份
  it(...testCase('集群管理-定时备份-4').smoke().value(), () => {
    cy.visitPage('/cluster');

    cy.goToDetail(1);
    cy.clickByDetailTabs('BackUp');
    cy.get('.ant-table-body')
      .find('.ant-table-row')
      .its('length')
      .as('rowLength');

    cy.visitPage('/cluster');
    cy.goToDetail(1);
    cy.clickByDetailTabs('Scheduled Backup');

    cy.clickActionButtonByTitle('Edit');
    cy.formInput('time', `${moment().add(2, 'm').format('HH:mm')}{enter}`);
    cy.clickModalActionSubmitButton();

    cy.clickActionInMore({
      title: 'Disable',
    });
    cy.clickConfirmActionSubmitButton();

    cy.wait(1000 * 60 * 2);

    cy.clickByDetailTabs('BackUp');
    cy.get('@rowLength').then((rowLength) => {
      cy.log(rowLength);
      cy.get('.ant-table-body .ant-table-row').should('have.length', rowLength);
    });
  });

  // 定时备份-仅执行一次
  it(...testCase('集群管理-定时备份-2').smoke().value(), () => {
    cy.visitPage('/cluster');

    cy.goToDetail(1);
    cy.clickByDetailTabs('BackUp');
    cy.get('.ant-table-body')
      .find('.ant-table-row')
      .its('length')
      .as('rowLength');

    cy.visitPage('/cluster');
    cy.clickActionInMore({
      title: 'Backup and recovery',
      subTitle: 'Scheduled Backup',
    });

    cy.formInput('name', onlyOnceTest);
    cy.formSelect('type', getTitle('OnlyOnce'));
    cy.formInput(
      'date',
      `${moment().add(2, 'm').format('YYYY-MM-DD HH:mm:ss')}{enter}`
    );
    cy.clickModalActionSubmitButton();
    cy.wait(1000 * 60 * 2);

    cy.goToDetail(1);
    cy.clickByDetailTabs('BackUp');
    cy.get('@rowLength').then((rowLength) => {
      cy.log(rowLength);
      cy.get('.ant-table-body .ant-table-row').should(
        'have.length.gt',
        rowLength
      );
    });
  });

  // 删除定时备份
  it(...testCase('集群管理-定时备份-5').smoke().value(), () => {
    cy.visitPage('/cluster');
    cy.goToDetail(1);
    cy.clickByDetailTabs('Scheduled Backup');
    cy.get('.ant-table-body')
      .find('.ant-table-row')
      .its('length')
      .as('rowLength');

    cy.clickActionInMore({
      title: 'Delete',
    });
    cy.clickConfirmActionSubmitButton();

    cy.get('@rowLength').then((rowLength) => {
      cy.get('.ant-table-body .ant-table-row').should(
        'have.length.lt',
        rowLength
      );
    });
  });

  // 删除备份空间 fs
  it(...testCase('集群管理-备份空间-删除-1').smoke().value(), () => {
    cy.tableSearchText(backupFSName);
    cy.clickActionButtonByTitle('Delete');
    cy.clickConfirmActionSubmitButton();

    cy.visitPage('/cluster');
    cy.clickActionInMore({
      title: 'Cluster Settings',
      subTitle: 'Edit',
    });

    cy.checkFormSelectorNotExist('backupPoint', backupFSName);
  });

  // 删除备份空间 s3
  it(...testCase('集群管理-备份空间-删除-2').smoke().value(), () => {
    cy.tableSearchText(backupS3Name);
    cy.clickActionButtonByTitle('Delete');
    cy.clickConfirmActionSubmitButton();

    cy.visitPage('/cluster');
    cy.clickActionInMore({
      title: 'Cluster Settings',
      subTitle: 'Edit',
    });

    cy.checkFormSelectorNotExist('backupPoint', backupS3Name);
  });
});
