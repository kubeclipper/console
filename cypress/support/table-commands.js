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

Cypress.Commands.add('clickHeaderButton', (buttonIndex, waitTime = 2000) => {
  cy.get('.table-header-btns')
    .find('button')
    .eq(buttonIndex)
    .click({ force: true });
  cy.wait(waitTime);
});

Cypress.Commands.add('waitTableLoading', () => {
  cy.get('.ant-spin-dot-spin', { timeout: 120000 }).should('not.exist');
});

Cypress.Commands.add('tableSearchText', (str) => {
  cy.get('.magic-input-wrapper')
    .find('input')
    .type(`${str}{enter}`, { force: true });
  cy.waitTableLoading();
});

Cypress.Commands.add('clickFirstActionButton', () => {
  cy.get('.ant-table-row')
    .first()
    .find('button')
    .first()
    .click({ force: true });
});

Cypress.Commands.add('clickActionButtonByTitle', (title) => {
  const realTitle = getTitle(title);
  cy.get('.ant-table-row')
    .first()
    .find('.ant-btn')
    .contains(realTitle)
    .click({ force: true });
});

Cypress.Commands.add('clearSearchInput', () => {
  cy.get('.magic-input-wrapper')
    .first()
    .find('.ant-btn')
    .click({ force: true });
});

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

Cypress.Commands.add('goToDetail', (index = 1, waitTime) => {
  cy.clickLinkInColumn(index, 2000);
  cy.get('.ant-skeleton-content', { timeout: 120000 }).should('not.exist');
  if (waitTime) {
    cy.wait(waitTime);
  }
});

Cypress.Commands.add('checkDetailName', (name) => {
  cy.get('.ant-descriptions-item-content').contains(name).should('exist');
});

Cypress.Commands.add('goBackToList', (url) => {
  cy.get('.ant-descriptions-header').find('button').eq(0).click().wait(2000);
  if (url) {
    cy.url().should('include', url);
  }
  cy.waitTableLoading();
});

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

Cypress.Commands.add('checkActionNotExistInMore', (title) => {
  const realTitle = getTitle(title);
  cy.get('.ant-table-row')
    .first()
    .find('.ant-dropdown-trigger')
    .trigger('mouseover');
  cy.get('ul.ant-dropdown-menu-light').contains(realTitle).should('not.exist');
});

Cypress.Commands.add('checkActionDisabled', (title) => {
  const realTitle = getTitle(title);
  cy.get('.ant-table-row').first().contains(realTitle).should('not.exist');
  cy.get('.ant-table-row')
    .first()
    .find('.ant-dropdown-trigger')
    .trigger('mouseover');
  cy.get('ul.ant-dropdown-menu-light').contains(realTitle).should('not.exist');
});

Cypress.Commands.add('hoverMore', () => {
  cy.get('.ant-table-row').find('.ant-btn-more').first().trigger('mouseover');
});

Cypress.Commands.add('clickTab', (label, urlTab, waitTime = 2000) => {
  const realTitle = getTitle(label);
  cy.get('.ant-tabs-tab-btn').contains(realTitle).click().wait(waitTime);
  if (urlTab) {
    cy.url().should('include', urlTab);
  }
});

Cypress.Commands.add('waitStatusSuccess', (index) => {
  if (!index) {
    cy.get('.ant-table-row')
      .first()
      .find('.ant-badge-status-success', { timeout: 100000000 })
      .should('exist');
  } else {
    cy.get('.ant-table-row')
      .first()
      .find('.ant-table-cell')
      .eq(index)
      .find('.ant-badge-status-success', { timeout: 100000000 })
      .should('exist');
  }
});

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

Cypress.Commands.add('freshTable', () => {
  // eslint-disable-next-line no-console
  console.log('fresh table');
  cy.clickHeaderButton(0).waitTableLoading();
});

Cypress.Commands.add('checkEmptyTable', () => {
  cy.get('.ant-empty-normal').should('have.length', 1);
  cy.wait(2000);
});

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

Cypress.Commands.add('checkTableColVal', (col, val) => {
  cy.get('.ant-table-row')
    .find('.ant-table-cell')
    .eq(col)
    .contains(val)
    .should('exist');
});
