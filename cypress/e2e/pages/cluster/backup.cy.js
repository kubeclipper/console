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
import getTitle from './../../../support/common';
import moment from 'moment';

before(() => {
  cy.login();
  cy.checkClusterExist();
});

describe('备份点', () => {
  const testUrl = '/cluster/backup-point';

  const backupFSName = 'test-fs';
  const backupFSRootDir = '/root';
  const backupFSStorageType = 'FS';

  const backupS3Name = 'test-s3';
  const backupS3StorageType = 'S3';
  const backupS3BucketName = 'kubeclipper';
  const backupS3EndPoint = '172.20.163.233:9000';
  const backupS3Admin = 'admin';
  const backupS3Password = 'Aa123456';

  // 定时备份
  const scheduledTest = 'scheduled-test';
  const onlyOnceTest = 'onlyonce-test';

  beforeEach(() => {
    cy.login(testUrl);
  });

  // 添加fs备份点
  it('集群管理-备份点-创建-1', () => {
    cy.clickHeaderButton(0);

    cy.inputText('name', backupFSName);
    cy.inputText('backupRootDir', backupFSRootDir);
    cy.formSelect('storageType', backupFSStorageType);
    cy.clickConfirm();

    cy.tableSearchText(backupFSName);
    cy.checkTableColVal(3, 'fs');

    cy.visitPage('/cluster');
    cy.clickActionInMore({
      title: 'Cluster Settings',
      subTitle: 'Edit',
    });

    cy.formSelect('backupPoint', backupFSName);
  });

  // 添加s3备份点
  it('集群管理-备份点-创建-2', () => {
    cy.visitPage(testUrl);

    cy.clickHeaderButton(0);

    cy.inputText('name', backupS3Name);
    cy.formSelect('storageType', backupS3StorageType);
    cy.inputText('bucket', backupS3BucketName);
    cy.inputText('endpoint', backupS3EndPoint);
    cy.inputText('accessKeyID', backupS3Admin);
    cy.inputText('accessKeySecret', backupS3Password);
    cy.clickConfirm();

    cy.tableSearchText(backupS3Name);
    cy.checkTableColVal(3, 's3');

    cy.visitPage('/cluster');
    cy.clickActionInMore({
      title: 'Cluster Settings',
      subTitle: 'Edit',
    });

    cy.formSelect('backupPoint', backupS3Name);
  });

  // 备份点查看
  it('集群管理-备份点-查看-1', () => {
    cy.visitPage(testUrl);

    cy.tableSearchText(backupFSName);
    cy.checkTableColVal(2, backupFSName);
  });

  // fs备份点编辑
  it('集群管理-备份点-编辑备份点-1', () => {
    cy.visitPage(testUrl);

    const description = 'fs-description';
    cy.tableSearchText(backupFSName);
    cy.checkTableColVal(2, backupFSName);
    cy.clickActionButtonByTitle('Edit');
    cy.inputText('description', description);
    cy.clickConfirm();
    cy.checkTableColVal(4, description);
  });

  // s3 备份点编辑
  it('集群管理-备份点-编辑备份点-2', () => {
    const description = 's3-description';
    cy.tableSearchText(backupS3Name);
    cy.checkTableColVal(2, backupS3Name);
    cy.clickActionButtonByTitle('Edit');
    cy.inputText('description', description);
    cy.clickConfirm();
    cy.checkTableColVal(4, description);
  });

  // 使用 fs 存储备份
  it('集群管理-备份点-备份-1', () => {
    cy.clickHeaderButton(0);
    cy.inputText('name', backupFSName);
    cy.inputText('backupRootDir', backupFSRootDir);
    cy.formSelect('storageType', backupFSStorageType);
    cy.clickConfirm();

    cy.visitPage('/cluster');
    cy.clickActionInMore({
      title: 'Cluster Settings',
      subTitle: 'Edit',
    });

    cy.formSelect('backupPoint', backupFSName);
    cy.clickConfirm();

    cy.clickActionInMore({
      title: 'Backup and recovery',
      subTitle: 'Backup Cluster',
    });

    cy.inputText('name', 'test-backup');
    cy.clickConfirm();
    cy.wait(2000).waitStatusSuccess();

    cy.goToDetail(1);
    cy.clickByDetailTabs('BackUp');
    cy.waitStatusSuccess();
  });

  // 使用 fs 存储恢复
  it('集群管理-备份点-恢复-2', () => {
    cy.visitPage('cluster');

    cy.clickActionInMore({
      title: 'Backup and recovery',
      subTitle: 'Restore Cluster',
    });

    cy.clickByTitle('.ant-modal-content .ant-table-tbody', backupFSName);
    cy.clickConfirm();
    cy.wait(2000).waitStatusSuccess();
  });

  // 使用 s3 存储备份
  it('集群管理-备份点-备份-2', () => {
    cy.visitPage('/cluster');
    cy.clickActionInMore({
      title: 'Cluster Settings',
      subTitle: 'Edit',
    });
    cy.formSelect('backupPoint', backupS3Name);
    cy.clickConfirm();
    cy.clickActionInMore({
      title: 'Backup and recovery',
      subTitle: 'Backup Cluster',
    });
    cy.inputText('name', 'test-backup');
    cy.clickConfirm();
    cy.wait(2000).waitStatusSuccess();

    cy.goToDetail(1);
    cy.clickByDetailTabs('BackUp');
    cy.waitStatusSuccess(null, 0);
  });

  // 使用 s3 存储恢复
  it('集群管理-备份点-恢复-1', () => {
    cy.visitPage('cluster');

    cy.clickActionInMore({
      title: 'Backup and recovery',
      subTitle: 'Restore Cluster',
    });

    cy.clickByTitle('.ant-modal-content .ant-table-tbody', backupS3Name);
    cy.clickConfirm();
    cy.wait(2000).waitStatusSuccess();
  });

  // 定时备份-重复执行
  it('集群管理-定时备份-1', () => {
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

    cy.inputText('name', scheduledTest);
    cy.formSelect('type', getTitle('Repeat'));
    cy.formSelect('cycle', getTitle('Every Day'));
    cy.inputText('time', `${moment().add(2, 'm').format('HH:mm')}{enter}`);

    cy.inputText('maxBackupNum', 2);
    cy.clickConfirm();
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
  it('集群管理-定时备份-3', () => {
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

    cy.inputText('time', `${moment().add(2, 'm').format('HH:mm')}{enter}`);

    cy.clickConfirm();
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
  it('集群管理-定时备份-4', () => {
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
    cy.inputText('time', `${moment().add(2, 'm').format('HH:mm')}{enter}`);
    cy.clickConfirm();

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
  it('集群管理-定时备份-2', () => {
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

    cy.inputText('name', onlyOnceTest);
    cy.formSelect('type', getTitle('OnlyOnce'));
    cy.inputText(
      'date',
      `${moment().add(2, 'm').format('YYYY-MM-DD HH:mm:ss')}{enter}`
    );
    cy.clickConfirm();
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
  it('集群管理-定时备份-5', () => {
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

  // 删除备份点 fs
  it('集群管理-备份点-删除-1', () => {
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

  // 删除备份点 s3
  it('集群管理-备份点-删除-2', () => {
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
