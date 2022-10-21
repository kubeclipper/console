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
describe('The User Page', () => {
  const uuid = Cypress._.random(0, 1e6);
  const listUrl = '/identity/user';
  const name = `e2e-username-${uuid}`;
  const password = 'e2e-password';

  beforeEach(() => {
    cy.login(listUrl);
  });

  it('successfully create', () => {
    cy.clickHeaderButton(1)
      .formInput('username', name)
      .formSelect('role')
      .blur({ force: true })
      .wait(1000)
      .formInput('password', password)
      .formInput('confirmPassword', password)
      .clickModalActionSubmitButton()
      .waitTableLoading();
  });

  it('successfully edit', () => {
    cy.tableSearchText(name)
      .clickFirstActionButton()
      .formInput('password', `${password}123`)
      .formInput('confirmPassword', `${password}123`)
      .clickModalActionSubmitButton();
  });

  it('successfully delete', () => {
    cy.tableSearchText(name)
      .clickActionButtonByTitle('Delete')
      .clickConfirmActionSubmitButton()
      .clearSearchInput();
  });
});
