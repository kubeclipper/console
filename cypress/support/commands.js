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
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import 'cypress-localstorage-commands';
import getTitle from './common';

Cypress.Commands.add('interceptGetAll', (requestList) => {
  const names = requestList.map((it, index) => {
    const tmps = it.split('/');
    return `${tmps[tmps.length - 1]}-${index}`;
  });
  requestList.forEach((it, index) => {
    cy.intercept('GET', it).as(names[index]);
  });
  requestList.forEach((_, index) => {
    const name = names[index];
    cy.wait(`@${name}`);
  });
});

Cypress.Commands.add('clickMenu', (fatherIndex, sonIndex) => {
  const ele = cy
    .get('.ant-menu-dark')
    .find('.ant-menu-submenu')
    .eq(fatherIndex);
  ele.click();
  cy.wait(1000);
  cy.get('li.ant-menu-submenu-open').first().find('ul>li').eq(sonIndex).click();
  cy.wait(1000);
});

Cypress.Commands.add('setLanguage', () => {
  const exp = Date.now() + 864000000;
  const language = Cypress.env('language') || 'zh';
  const value = language === 'zh' ? 'zh-cn' : 'en';
  const langValue = { value, expires: exp };
  window.localStorage.setItem('lang', JSON.stringify(langValue));
});

Cypress.Commands.add('visitPage', (url = '', isTable = true) => {
  cy.visit(url);

  cy.get('#app', { timeout: 120000 }).should('exist');
  if (url) {
    cy.wait(2000);
    if (isTable) {
      cy.get('.ant-table-wrapper', { timeout: 120000 }).should('exist');
      cy.waitTableLoading();
    }
  }
});

Cypress.Commands.add('login', (visitUrl = '', isTable = true) => {
  cy.setLanguage();

  if (Cypress.config('user')) {
    cy.setCookie('session', Cypress.config('session'));
    cy.setCookie('username', Cypress.config('username'));
    cy.setLocalStorage(
      'user',
      JSON.stringify({
        expires: Date.now() + 864000000,
        value: Cypress.config('user'),
      })
    );
    cy.visitPage(visitUrl || '/cluster/info', isTable);

    return;
  }

  cy.log('need login by request');
  const body = {
    username: Cypress.env('username'),
    password: `${Cypress.env('password')}`,
  };
  cy.request({
    url: '/api/core/v1/login',
    body,
    method: 'POST',
  }).then((res) => {
    const { body: resBody } = res;
    const {
      user: { username, roles, exp },
      permission,
    } = resBody || {};

    const { token } = resBody || {};
    cy.setCookie('username', username);
    cy.setCookie('session', token);

    // const authType = get(options, 'headers.X-Auth-Type');

    const user = {
      token,
      username,
      expire: exp,
      roles,
      authType: 'standard',
      permission,
    };

    cy.setLocalStorage(
      'user',
      JSON.stringify({
        expires: Date.now() + 864000000,
        value: user,
      })
    );
    Cypress.config('username', username);
    Cypress.config('session', token);
    Cypress.config('user', user);
    cy.visitPage(visitUrl || '/cluster/info', isTable);
  });
});

Cypress.Commands.add('t', (text) => {
  const translated = getTitle(text);
  cy.get(translated);
});

Cypress.Commands.add('clickAvatarButton', (label) => {
  const realTitle = getTitle(label);
  cy.get('.ant-layout-header').find('.ant-dropdown-trigger').click().wait(2000);
  cy.get('.ant-dropdown-menu')
    .last()
    .find('.ant-btn-link')
    .contains(realTitle)
    .click();
});
