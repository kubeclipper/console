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

describe('The Role Page', () => {
  const uuid = Cypress._.random(0, 1e6);
  const listUrl = '/identity/role';
  const name = `e2e-role-name-${uuid}`;

  beforeEach(() => {
    cy.login(listUrl);
  });

  it('successfully create', () => {
    cy.clickHeaderButton(1)
      .formInput('name', name)
      .clickModalActionSubmitButton()
      .waitTableLoading();
  });

  it('successfully edit', () => {
    cy.tableSearchText(name)
      .clickFirstActionButton()
      .formCheckboxClick('authority', 7)
      .clickModalActionSubmitButton();
  });

  it('successfully detail', () => {
    cy.tableSearchText(name).goToDetail().checkDetailName(name);
    cy.get('.ant-card-body').find('li').next().t('Region').should('not.exist');
    cy.goBackToList(listUrl);
  });

  it('successfully delete', () => {
    cy.tableSearchText(name)
      .clickActionButtonByTitle('Delete')
      .clickConfirmActionSubmitButton()
      .clearSearchInput();
  });
});
