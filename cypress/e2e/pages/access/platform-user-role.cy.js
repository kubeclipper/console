/* eslint-disable no-unused-vars */
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

describe('平台用户和角色', () => {
  const listUrl = '/access/role';
  const _uuid = Cypress._.random(0, 1e6);
  const roleName = `role-${_uuid}`;
  const userName = `user-${_uuid}`;
  const innerRoles = [
    'platform-view',
    'platform-admin',
    'iam-manager',
    'cluster-manager',
  ];

  beforeEach(() => {
    cy.login(listUrl);
  });

  afterEach(() => {
    cy.addContext();
  });

  // 创建角色
  it(...testCase('访问控制-角色-创建角色-1').smoke().value(), () => {
    cy.clickHeaderButton(0).url().should('include', listUrl);

    cy.formInput('name', roleName);
    cy.clickRoleCheckbox();
    cy.clickLeftTab(1).clickRoleCheckbox();
    cy.clickLeftTab(2).clickRoleCheckbox();
    cy.clickLeftTab(3).clickRoleCheckbox();
    cy.clickLeftTab(4).clickRoleCheckbox();
    cy.clickPageFormSubmitButton(1000);

    cy.tableSearchText(roleName).checkTableRowLength();
  });

  // 查看角色
  it(...testCase('访问控制-角色-查看角色-1').smoke().value(), () => {
    cy.tableSearchText(roleName)
      .checkTableRowLength(1)
      .checkActionExistInMore('Edit Permission')
      .checkActionExistInMore('Delete')
      .checkActionEnable('Edit')
      .clearSearchInput();

    // 校验内置角色编辑置灰
    innerRoles.forEach((name) => {
      cy.checkActionDisabled('Edit', name);
    });
  });

  // 编辑角色
  it(...testCase('访问控制-角色-编辑角色-1').smoke().value(), () => {
    const desc = 'test-des';
    cy.tableSearchText(roleName).clickFirstActionButton();
    cy.formInput('description', desc)
      .clickModalActionSubmitButton()
      .checkTableColVal(2, desc);
  });

  // 编辑角色权限
  it(...testCase('访问控制-角色-编辑权限-1').smoke().value(), () => {
    cy.tableSearchText('role-845989').clickActionInMore({
      title: 'Edit Permission',
    });
    cy.clickLeftTab(1)
      .formCheckboxClick('permission', 1)
      .formCheckboxClick('permission', 0)
      .clickModalActionSubmitButton();

    cy.goToDetail();
    cy.get('.ant-card-body span').should(
      'not.include.text',
      getTitle('Platform Setting')
    );
  });

  // 删除角色
  it(...testCase('访问控制-角色-删除角色-1').smoke().value(), () => {
    cy.tableSearchText(roleName)
      .clickActionInMore({ title: 'Delete' })
      .clickConfirmActionSubmitButton()
      .checkEmptyTable();
  });

  // 批量删除角色
  it.only(...testCase('访问控制-角色-删除角色-2').smoke().value(), () => {
    const roleName1 = `role1-${_uuid}`;
    const roleName2 = `role2-${_uuid}`;
    cy.createRole(roleName1).createRole(roleName2);

    cy.selectByName(roleName1).selectByName(roleName2);
    cy.clickHeaderButton(1).clickConfirmActionSubmitButton();
    cy.tableSearchText(roleName1).checkEmptyTable();
    cy.tableSearchText(roleName2).checkEmptyTable();
  });

  // 角色详情
  // TODO
});
