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
import { testCase } from '../../support/common';

describe('登录kubeclipper', () => {
  const username = Cypress.env('username');
  const password = Cypress.env('password');

  afterEach(() => {
    cy.addContext();
  });

  it(...testCase('登录kubeclipper-1').smoke().value(), () => {
    cy.visit('/');
    cy.loginInput('username', username)
      .loginInput('password', password)
      .loginFormSubmit()
      .url()
      .should('include', '/cluster');
  });

  it(...testCase('登录kubeclipper-2').smoke().value(), () => {
    cy.visit('/');
    cy.loginInput('username', `${username}1`)
      .loginInput('password', `${password}1`)
      .loginFormSubmit()
      .get('.ant-notification')
      .should('have.length', 1);
  });
});
