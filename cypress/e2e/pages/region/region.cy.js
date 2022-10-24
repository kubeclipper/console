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

let region = null;

describe('The Region Page', () => {
  const listUrl = '/region/mgt';

  beforeEach(() => {
    cy.login(listUrl);
  });

  it('successfully get region', () => {
    cy.get('.ant-table-row')
      .first()
      .find('a')
      .then(($el) => {
        region = $el.text();
      });
  });

  it('successfully detail', () => {
    cy.tableSearchText(region).goToDetail(0);
    cy.checkDetailName(region);

    cy.goBackToList(listUrl);
  });

  it('successfully delete', () => {
    cy.tableSearchText(region)
      .clickActionButtonByTitle('Delete')
      .clickConfirmActionSubmitButton();
  });
});
