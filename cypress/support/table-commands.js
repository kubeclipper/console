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

// 表格 header 区域按钮
Cypress.Commands.add('clickHeaderButton', (buttonIndex, waitTime = 2000) => {
  cy.get('.table-header-btns')
    .find('button')
    .eq(buttonIndex)
    .click({ force: true });
  cy.wait(waitTime);
});

// 等待表格 loading 消失
Cypress.Commands.add('waitTableLoading', () => {
  cy.get('.ant-spin-dot-spin', { timeout: 120000 }).should('not.exist');
});

// 表格搜索
Cypress.Commands.add('tableSearchText', (str) => {
  cy.get('.magic-input-wrapper')
    .find('input')
    .type(`${str}{enter}`, { force: true });
  cy.waitTableLoading();
});

// 操作栏 first action 按钮
Cypress.Commands.add('clickFirstActionButton', () => {
  cy.get('.ant-table-row')
    .first()
    .find('button')
    .first()
    .click({ force: true });
});

// 点击指定 title 按钮
Cypress.Commands.add('clickActionButtonByTitle', (title) => {
  const realTitle = getTitle(title);
  cy.get('.ant-table-row')
    .first()
    .find('.ant-btn')
    .contains(realTitle)
    .click({ force: true });
});

// 清空搜索框
Cypress.Commands.add('clearSearchInput', () => {
  cy.get('.magic-input-wrapper')
    .first()
    .find('.ant-btn')
    .click({ force: true });
});

// 点击表格中跳转列链接
Cypress.Commands.add(
  'clickLinkInColumn',
  (columnIndex = 1, waitTime = 2000) => {
    cy.get('.ant-table-row')
      .first()
      .find('td')
      .eq(columnIndex)
      .find('a')
      .click(waitTime);
  }
);

// 前往详情
Cypress.Commands.add('goToDetail', (index = 1, waitTime) => {
  cy.clickLinkInColumn(index, 2000);
  cy.get('.ant-skeleton-content', { timeout: 120000 }).should('not.exist');
  if (waitTime) {
    cy.wait(waitTime);
  }
});

// 校验详情页 name 存在
Cypress.Commands.add('checkDetailName', (name) => {
  cy.get('.ant-descriptions-item-content').contains(name).should('exist');
});

// 详情页返回列表页
Cypress.Commands.add('goBackToList', (url) => {
  cy.get('.ant-descriptions-header').find('button').eq(0).click().wait(2000);
  if (url) {
    cy.url().should('include', url);
  }
  cy.waitTableLoading();
});

// 点击更多按钮
Cypress.Commands.add('clickActionInMore', (titles, waitTime = 2000) => {
  const { title, subTitle } = titles;

  cy.get('.ant-table-row').first().find('.ant-dropdown-trigger').click();
  cy.wait(500);
  const realTitle = getTitle(title);
  cy.log(realTitle);
  if (!subTitle) {
    cy.get('ul.ant-dropdown-menu-light').contains(realTitle).click();
  } else {
    cy.get('ul.ant-dropdown-menu-light')
      .contains(realTitle)
      .trigger('mouseover');

    cy.get('ul.ant-dropdown-menu-sub').contains(getTitle(subTitle)).click();
  }

  waitTime && cy.wait(waitTime);
});

// 校验指定 action 不存在更多中
Cypress.Commands.add('checkActionNotExistInMore', (title) => {
  const realTitle = getTitle(title);
  cy.get('.ant-table-row')
    .first()
    .find('.ant-dropdown-trigger')
    .trigger('mouseover');
  cy.get('ul.ant-dropdown-menu-light').contains(realTitle).should('not.exist');
});

// 校验指定操作是 disabled
Cypress.Commands.add('checkActionDisabled', (title) => {
  const realTitle = getTitle(title);
  cy.get('.ant-table-row').first().contains(realTitle).should('not.exist');
  cy.get('.ant-table-row')
    .first()
    .find('.ant-dropdown-trigger')
    .trigger('mouseover');
  cy.get('ul.ant-dropdown-menu-light').contains(realTitle).should('not.exist');
});

// 光标 hover 更多
Cypress.Commands.add('hoverMore', () => {
  cy.get('.ant-table-row').find('.ant-btn-more').first().trigger('mouseover');
});

// 点击 tab
Cypress.Commands.add('clickTab', (label, urlTab, waitTime = 2000) => {
  const realTitle = getTitle(label);
  cy.get('.ant-tabs-tab-btn').contains(realTitle).click().wait(waitTime);
  if (urlTab) {
    cy.url().should('include', urlTab);
  }
});

// 等待状态成功
Cypress.Commands.add('waitStatusSuccess', (index, timeout = 100000000) => {
  if (!index) {
    cy.get('.ant-table-row')
      .first()
      .find('.ant-badge-status-success', { timeout })
      .should('exist');
  } else {
    cy.get('.ant-table-row')
      .first()
      .find('.ant-table-cell')
      .eq(index)
      .find('.ant-badge-status-success', { timeout })
      .should('exist');
  }
});

// 等待状态 green
Cypress.Commands.add('waitStatusGreen', (index) => {
  if (!index) {
    cy.get('.ant-table-row')
      .first()
      .find('.ant-badge-status-green', { timeout: 100000000 })
      .should('exist');
  } else {
    cy.get('.ant-table-row')
      .first()
      .find('.ant-table-cell')
      .eq(index)
      .find('.ant-badge-status-green', { timeout: 100000000 })
      .should('exist');
  }
});

// 刷新表格
Cypress.Commands.add('freshTable', () => {
  // eslint-disable-next-line no-console
  console.log('fresh table');
  cy.clickHeaderButton(0).waitTableLoading();
});

// 校验表格为空
Cypress.Commands.add('checkEmptyTable', () => {
  cy.get('.ant-empty-normal').should('have.length', 1);
  cy.wait(2000);
});

// 等待表格状态 no error
Cypress.Commands.add('waitStatusNoError', (index) => {
  if (!index) {
    cy.get('.ant-table-row')
      .first()
      .find('.ant-badge-status-error', { timeout: 100000000 })
      .should('not.exist');
  } else {
    cy.get('.ant-table-row')
      .first()
      .find('.ant-table-cell')
      .eq(index)
      .find('.ant-badge-status-error', { timeout: 100000000 })
      .should('not.exist');
  }
});

// 等待表格 Processing 状态消失
Cypress.Commands.add('waitStatusProcessing', (index) => {
  if (!index) {
    cy.get('.ant-table-row')
      .first()
      .find('.ant-badge-status-processing', { timeout: 100000000 })
      .should('not.exist');
  } else {
    cy.get('.ant-table-row')
      .first()
      .find('.ant-table-cell')
      .eq(index)
      .find('.ant-badge-status-processing', { timeout: 100000000 })
      .should('not.exist');
  }
});

// 等待表格状态 default
Cypress.Commands.add('waitStatusBackuping', () => {
  cy.get('.ant-table-row')
    .first()
    .find('.ant-badge-status-default', { timeout: 100000000 })
    .should('not.exist');
});

Cypress.Commands.add('clickByTitle', (_class, title, options) => {
  const { addZhSpace = true, waitTime = 2000 } = options || {};
  title = getTitle(title);
  if (Cypress.env('language') === 'zh' && title.length === 2 && addZhSpace) {
    const [a, b] = title;
    title = `${a} ${b}`;
  }
  cy.get(_class).contains(title).click();
  waitTime && cy.wait(waitTime);
});

// 校验表格 col 列 存在 val 值
Cypress.Commands.add('checkTableColVal', (col, val) => {
  cy.get('.ant-table-row')
    .find('.ant-table-cell')
    .eq(col)
    .contains(val)
    .should('exist');
});

// 点击详情页 tab
Cypress.Commands.add('clickByDetailTabs', (title, waitTime) => {
  cy.get('.ant-tabs-nav-list div').contains(getTitle(title)).click();
  waitTime && cy.wait(waitTime);
});
