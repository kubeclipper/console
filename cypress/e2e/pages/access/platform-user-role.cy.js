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
  const userUrl = '/access/user';
  const _uuid = Cypress._.random(0, 1e6);
  const roleName = `role-${_uuid}`;
  const roleName3 = `role3-${_uuid}`;
  const userName = `user-${_uuid}`;
  const userName2 = `user2-${_uuid}`;
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
    cy.tableSearchText(roleName).clickActionInMore({
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

  // 批量删除角色
  it(...testCase('访问控制-角色-删除角色-2').smoke().value(), () => {
    const roleName1 = `role1-${_uuid}`;
    const roleName2 = `role2-${_uuid}`;
    cy.createRole(roleName1).createRole(roleName2);

    cy.selectByName(roleName1).selectByName(roleName2);
    cy.clickHeaderButton(1).clickConfirmActionSubmitButton();
    cy.tableSearchText(roleName1).checkEmptyTable();
    cy.tableSearchText(roleName2).checkEmptyTable();
  });

  // 删除角色
  it(...testCase('访问控制-角色-删除角色-1').smoke().value(), () => {
    cy.tableSearchText(roleName)
      .clickActionInMore({ title: 'Delete' })
      .clickConfirmActionSubmitButton()
      .checkEmptyTable();
  });

  // 角色详情-编辑角色
  it(...testCase('访问控制-角色-角色详情-编辑角色-1').smoke().value(), () => {
    cy.createRole(roleName3);
    const desc = 'test-des2';
    cy.tableSearchText(roleName3).goToDetail().clickDetailFirstAction('Edit');
    cy.formInput('description', desc)
      .clickModalActionSubmitButton()
      .checkDetailInfo('Description', desc);
  });

  // 角色详情-编辑角色权限
  it(...testCase('访问控制-角色-角色详情-权限列表-1').smoke().value(), () => {
    cy.tableSearchText(roleName3)
      .goToDetail()
      .clickDetailActionInMore('Edit Permission');

    cy.clickLeftTab(1)
      .formCheckboxClick('permission', 0)
      .formCheckboxClick('permission', 1)
      .clickModalActionSubmitButton();

    cy.get('.ant-card-body span').should(
      'include.text',
      getTitle('Platform Setting')
    );
  });

  // 创建用户;
  it(...testCase('访问控制-用户-创建用户-1').smoke().value(), () => {
    cy.visitPage(userUrl).clickHeaderButton(0);

    cy.formInput('name', userName2)
      .formInput('displayName', 'test-nickname')
      .formSelect('role', 'platform-admin', null, false)
      .formInput('password', 'P@88w0rd')
      .formInput('confirmPassword', 'P@88w0rd')
      .formInput('phone', '18488888888')
      .formInput('email', 'test@test.com')
      .clickModalActionSubmitButton(1000);

    cy.tableSearchText(userName2).checkTableRowLength();
    cy.checkTableColVal(1, userName2)
      .checkTableColVal(2, 'platform-admin')
      .checkTableColVal(3, 'test@test.com')
      .checkTableColVal(4, '18488888888');
  });

  // 创建用户
  it(...testCase('访问控制-用户-创建用户-2').smoke().value(), () => {
    cy.visitPage(userUrl).clickHeaderButton(0);

    cy.formInput('name', userName)
      .formInput('displayName', 'test-nickname')
      .formSelect('role', roleName3)
      .formInput('password', 'P@88w0rd')
      .formInput('confirmPassword', 'P@88w0rd')
      .formInput('phone', '18488888888')
      .formInput('email', 'test@test.com')
      .clickModalActionSubmitButton(1000);

    cy.tableSearchText(userName)
      .checkTableRowLength(1)
      .checkTableColVal(2, roleName3);
  });

  // 查看用户
  it(...testCase('访问控制-用户-查看用户-1').smoke().value(), () => {
    cy.visitPage(userUrl);
    cy.tableSearchText(userName)
      .checkTableRowLength()
      .checkActionEnable('Edit')
      .checkActionExistInMore('Reset Password')
      .checkActionExistInMore('Delete')
      .clearSearchInput();
  });

  // 编辑用户
  it(...testCase('访问控制-用户-编辑用户-1').smoke().value(), () => {
    cy.visitPage('/access/user');
    const desc = 'test-des';
    cy.tableSearchText(userName2).clickFirstActionButton();
    cy.formInput('displayName', 'test-nickname-2')
      .formSelect('role', 'cluster-manager', null, false)
      .formInput('phone', '18488888889')
      .formInput('email', 'test2@test.com')
      .clickModalActionSubmitButton();

    cy.tableSearchText(userName2)
      .checkTableColVal(2, 'cluster-manager')
      .checkTableColVal(3, 'test2@test.com')
      .checkTableColVal(4, '18488888889');
  });

  // 角色详情-授权用户
  it(...testCase('访问控制-角色-角色详情-授权用户-1').smoke().value(), () => {
    cy.tableSearchText(roleName3)
      .goToDetail()
      .clickByDetailTabs('Authorized Users')
      .tableSearchText(userName)
      .checkTableColVal(0, userName);
  });

  // 重置密码
  it(...testCase('访问控制-用户-重置密码-1').smoke().value(), () => {
    cy.visitPage('/access/user');
    cy.tableSearchText(userName)
      .clickActionInMore({ title: 'Reset Password' })
      .formInput('password', 'P@88w0rd2')
      .formInput('confirmPassword', 'P@88w0rd2')
      .clickModalActionSubmitButton();
  });

  // 删除用户
  it(...testCase('访问控制-用户-删除用户-1').smoke().value(), () => {
    cy.visitPage('/access/user');
    cy.deleteUser(userName);
    cy.deleteUser(userName2);
  });

  // 角色详情-删除角色
  it(...testCase('访问控制-角色-角色详情-删除角色-1').smoke().value(), () => {
    cy.tableSearchText(roleName3)
      .goToDetail()
      .clickDetailActionInMore('Delete')
      .clickConfirmActionSubmitButton(2000);
    cy.url().should('include', listUrl);
    cy.tableSearchText(roleName3).checkEmptyTable();
  });

  it.skip(...testCase('访问控制-用户-登录日志-1').smoke().value(), () => {});

  it.skip(...testCase('访问控制-用户-登录日志-2').smoke().value(), () => {});
});
