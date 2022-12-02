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
import getTitle from './common';

// 点击详情页 tab
Cypress.Commands.add('clickByDetailTabs', (title, waitTime) => {
  cy.get('.ant-tabs-nav-list div').contains(getTitle(title)).click();
  waitTime && cy.wait(waitTime);
});

// 校验详情页 BaseDetail 字段值
Cypress.Commands.add('checkBaseDetailValue', (value) => {
  cy.goToDetail(1)
    .get('.detail-card-item')
    .first()
    .find('.ant-col', { timeout: 100000000 })
    .contains(value)
    .should('exist');
});

// 详情页第一个 action
Cypress.Commands.add('clickDetailFirstAction', (title, waitTime = 2000) => {
  const realTitle = getTitle(title);
  cy.get('.detail-main')
    .children()
    .first()
    .find('button')
    .contains(realTitle)
    .click()
    .wait(waitTime);
});

// 详情页更多中操作
Cypress.Commands.add('clickDetailActionInMore', (title, waitTime = 2000) => {
  cy.get('.detail-main')
    .children()
    .first()
    .find('.ant-dropdown-trigger')
    .trigger('mouseover');
  const realTitle = getTitle(title);
  cy.get('ul.ant-dropdown-menu-light')
    .contains(realTitle)
    .click({ force: true })
    .wait(waitTime);
});

// 详情页值校验
Cypress.Commands.add('checkDetailInfo', (label, value) => {
  const realTitle = getTitle(label);
  cy.get('.ant-descriptions-item')
    .find('.ant-descriptions-item-label')
    .contains(realTitle)
    .as('labelItem');
  cy.get('@labelItem')
    .parent()
    .find('.ant-descriptions-item-content')
    .contains(value)
    .should('exist');
});

// 表单详情页 key 对应 value 值
Cypress.Commands.add('checkDetailValueByKey', (key, value) => {
  cy.contains(getTitle(key)).next().should('include.text', value);
});
