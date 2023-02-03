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

describe('外部用户登录', () => {
  const listUrl = '/access/user';
  const username = Cypress.env('oauth2Username');
  const password = Cypress.env('oauth2Password');

  const role = 'platform-admin';
  const phone = '13333333333';
  const email = 'demo@99cloud.com';

  afterEach(() => {
    cy.addContext();
  });

  // 外部用户注册
  it(...testCase('访问控制-用户-外部用户注册-1').smoke().value(), () => {
    cy.loginByKeycloak(username, password);

    cy.url().should('include', 'auth/empty-role');
  });

  // 外部用户权限
  it(...testCase('访问控制-用户-外部用户权限-1').smoke().value(), () => {
    cy.login(listUrl);

    cy.tableSearchText(username);
    cy.clickActionButtonByTitle('Edit');
    cy.formSelect('role', role, undefined, false);
    cy.clickModalActionSubmitButton();

    cy.loginByKeycloak(username, password);
    cy.visitPage('/access/user');

    cy.checkTableRowLength();
  });

  // 编辑外部用户
  it(...testCase('访问控制-用户-编辑外部用户-1').smoke().value(), () => {
    cy.login(listUrl);
    cy.loginByKeycloak(username, password);
    cy.visitPage('/access/user');
    cy.tableSearchText(username);
    cy.clickActionButtonByTitle('Edit');
    cy.formInput('phone', phone);
    cy.formInput('email', email);
    cy.clickModalActionSubmitButton();

    cy.checkTableColVal(4, phone);
    cy.checkTableColVal(3, email);
  });

  // 查看外部用户
  it(...testCase('访问控制-用户-查看外部用户-1').smoke().value(), () => {
    cy.login(listUrl);

    cy.tableSearchText(username);

    cy.checkTableColVal(5, 'keycloak');
    cy.get('.ant-table-tbody').should('not.contain.text', getTitle('More'));
  });

  // 删除外部用户
  it(...testCase('访问控制-用户-删除外部用户-1').smoke().value(), () => {
    cy.login(listUrl);

    cy.tableSearchText(username);

    cy.clickActionButtonByTitle('Delete');
    cy.clickConfirmActionSubmitButton();

    cy.checkEmptyTable();
  });

  // 外部用户修改密码登录
  it.skip(
    ...testCase('访问控制-用户-外部用户修改密码登录-1').smoke().value(),
    () => {}
  );
});
