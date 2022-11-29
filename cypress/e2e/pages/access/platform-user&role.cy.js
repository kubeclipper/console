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

  beforeEach(() => {
    cy.login(listUrl);
  });

  // 创建角色
  it(...testCase('访问控制-角色-创建角色-1').smoke().value(), () => {
    cy.clickHeaderButton(0).url().should('include', listUrl);

    cy.formInput('name', roleName);

    // cy.tableSearchText(roleName);
  });
});
