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
import { get, uniq, isArray } from 'lodash';

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

// 点击菜单
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

// 设置语言
Cypress.Commands.add('setLanguage', () => {
  const exp = Date.now() + 864000000;
  const language = Cypress.env('language') || 'zh';
  const value = language === 'zh' ? 'zh-cn' : 'en';
  const langValue = { value, expires: exp };
  window.localStorage.setItem('lang', JSON.stringify(langValue));
});

// 前往 url
Cypress.Commands.add('visitPage', (url = '', isTable = true) => {
  cy.url().then((_url) => {
    if (!_url.endsWith(url)) {
      cy.visit(url);
      cy.get('#app', { timeout: 120000 }).should('exist');
      if (url) {
        cy.wait(2000);
        if (isTable) {
          cy.get('.ant-table-wrapper', { timeout: 120000 }).should('exist');
          cy.waitTableLoading();
        }
      }
    }
  });
});

// 登录
Cypress.Commands.add('login', (visitUrl = '', isTable = true) => {
  const username = Cypress.env('username');
  const password = Cypress.env('password');

  cy.visit('/auth/login');
  cy.loginInput('username', username)
    .loginInput('password', password)
    .loginFormSubmit();
  cy.visitPage(visitUrl || '/cluster', isTable);
  cy.wait(500);
});

// 登录
Cypress.Commands.add('loginByApi', (visitUrl = '', isTable = true) => {
  if (Cypress.config('user')) {
    cy.setLocalStorageItem('token', Cypress.config('token'));
    cy.setLocalStorageItem('user', Cypress.config('user'));

    cy.visitPage(visitUrl || '/cluster', isTable);
    return;
  }

  cy.setLanguage();

  cy.request({
    url: '/apis/oauth/login',
    body: {
      username: Cypress.env('username'),
      password: Cypress.env('password'),
    },
    method: 'POST',
  })
    .its('body')
    .then((res) => {
      const { access_token, refresh_token, expires_in, refresh_expires_in } =
        res || {};
      const expire = Number(expires_in) * 1000;
      const refreshExpire = Number(refresh_expires_in) * 1000;
      const token = {
        token: access_token,
        refreshToken: refresh_token,
        // expire,
        expires: new Date().getTime() + expire,
      };

      cy.setLocalStorageItem('token', token, refreshExpire);
      Cypress.config('token', token);
      return Promise.resolve(token);
    })
    .then((res) => {
      const rules = {};
      const user = {
        username: null,
        globalrole: null,
        globalRules: rules,
      };

      cy.request({
        url: `/apis/api/iam.kubeclipper.io/v1/users/${Cypress.env('username')}`,
        method: 'GET',
        headers: {
          authorization: `bearer ${res.token}`,
        },
      })
        .its('body')
        .then((userInfo) => {
          user.username = get(userInfo, 'metadata.name');
          user.globalrole = get(
            userInfo,
            'metadata.annotations["iam.kubeclipper.io/role"]'
          );
        });

      cy.request({
        url: `/apis/api/iam.kubeclipper.io/v1/users/${Cypress.env(
          'username'
        )}/roles`,
        method: 'GET',
        headers: {
          authorization: `bearer ${res.token}`,
        },
      })
        .its('body')
        .then((role) => {
          role.forEach((item) => {
            const rule = JSON.parse(
              get(
                item,
                "metadata.annotations['kubeclipper.io/role-template-rules']"
              ),
              {}
            );

            Object.keys(rule).forEach((key) => {
              rules[key] = rules[key] || [];
              if (isArray(rule[key])) {
                rules[key].push(...rule[key]);
              } else {
                rules[key].push(rule[key]);
              }
              rules[key] = uniq(rules[key]);
            });
          });
        })
        .then(() => {
          cy.setLocalStorageItem('user', user);
          Cypress.config('user', user);
        });
    });

  cy.visitPage(visitUrl || '/cluster', isTable);
  cy.wait(500);
});

// 国际化
Cypress.Commands.add('t', (text) => {
  const translated = getTitle(text);
  cy.get(translated);
});

Cypress.Commands.add('hoverAvatar', () => {
  cy.get('.ant-layout-header')
    .find('.ant-dropdown-trigger')
    .trigger('mouseover');
});
// 点击右侧用户名处下拉
Cypress.Commands.add('clickAvatarButton', (label) => {
  const realTitle = getTitle(label);
  cy.hoverAvatar();
  cy.get('.ant-dropdown-menu')
    .last()
    .find('.ant-btn-link')
    .contains(realTitle)
    .click();
});

// set localstorage
Cypress.Commands.add(
  'setLocalStorageItem',
  (key, value, maxAge = 864000000, expiry = 0) => {
    cy.setLocalStorage(
      key,
      JSON.stringify({
        expires: expiry || Date.now() + maxAge,
        value,
      })
    );
  }
);

// oauth2 登录 keycloak
Cypress.Commands.add('loginByKeycloak', (username, password) => {
  cy.visit('/auth/login');
  cy.get('[name="keycloak"]').click();
  cy.get('#username').type(username);
  cy.get('#password').type(password);
  cy.get('[type="submit"]').click();
  cy.wait(1000);
});

// 插件页选择tab
Cypress.Commands.add('selectComponentTab', (title) => {
  cy.get('.ant-row')
    .contains(`${title} ${getTitle('Set')}`)
    .click()
    .wait(200);
});

// 启用插件
Cypress.Commands.add('enableComponent', (name) => {
  cy.get('.ant-checkbox-wrapper').eq(0).contains(name).click().wait(200);
});

// 选择按钮 可代替 visitPage
Cypress.Commands.add('selectMenu', (option) => {
  const { title, subTitle } = option;

  if (!title) {
    cy.get('.ant-menu-sub').contains(getTitle(subTitle)).click();
  } else if (!subTitle) {
    cy.get('.ant-menu-root').contains(getTitle(title)).click();
  } else {
    cy.get('.ant-menu-root').contains(getTitle(title)).click();
    cy.get('.ant-menu-sub').contains(getTitle(subTitle)).click();
  }
  cy.wait(1000);
});
