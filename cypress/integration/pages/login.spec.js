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

describe('The Login Page', () => {
  const username = 'admin';
  const password = '123456';

  it('successfully get authtype', () => {
    cy.visit('/');
    cy.request('GET', 'api/authtype')
      .its('body')
      .should((response) => {
        expect(response).to.have.property('standard');
        expect(response).to.have.property('caas');
      });
  });

  it('successfully login and check menu', () => {
    cy.visit('/');
    cy.intercept('GET', 'authtype');
    cy.intercept('POST', 'login').as('login');
    cy.loginInput('username', `${username}`)
      .loginInput('password', `${password}`)
      .loginFormSubmit()
      .wait('@login')
      .url()
      .should('include', '/cluster/info')
      .wait(1000)
      .clickMenu(1, 0)
      .wait(1000)
      .url()
      .should('include', '/region/mgt');
  });

  it('successfully error username and password', () => {
    cy.visit('/');
    cy.intercept('GET', 'authtype').as('login');
    cy.loginInput('username', `${username}1`)
      .loginInput('password', `${password}1`)
      .loginFormSubmit()
      .get('.ant-notification')
      .should('have.length', 1);
  });
});
