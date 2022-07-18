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
describe('The Error Page', () => {
  const listUrl = '/version/plan';
  const name = '1.19.2';

  beforeEach(() => {
    cy.login(listUrl);
  });

  it('successfully create plan', () => {
    // TODO: create cluster
    cy.createVersion({ name });
    cy.visitPage(listUrl)
      .clickHeaderButton(1)
      .formSelect('cluster')
      .formSelect('version', name)
      .clickModalActionSubmitButton();
  });

  it('successfully upgrade', () => {
    cy.tableSearchText(name)
      .clickFirstActionButton()
      .clickConfirmActionSubmitButton();
  });

  it('successfully delete', () => {
    cy.tableSearchText(name)
      .clickActionInMore('Delete')
      .clickConfirmActionSubmitButton();
    cy.deleteVersion({ name });
  });
});
