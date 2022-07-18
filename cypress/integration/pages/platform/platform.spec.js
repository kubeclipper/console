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
describe('The Platform Configure Page', () => {
  const listUrl = 'configuration/global-settings';
  const ip = '10.10.10.158';
  const port = '5000';

  beforeEach(() => {
    cy.login(listUrl, false);
  });

  it('remove a container registry', () => {
    cy.get('#form-item-col-container_registry').find('.ant-btn').eq(2).click();
    cy.get('.footer').find('.ant-btn').click();
    cy.get('.ant-notification-topRight')
      .first()
      .find('.anticon-check-circle')
      .should('exist');
  });

  it('add a container registry', () => {
    cy.formAddSelectAdd('container_registry')
      .formInputIp('.input-ip', ip)
      .formInputPort('.input-port', port)
      .get('.footer')
      .find('.ant-btn')
      .click()
      .wait(1000)
      .get('.ant-notification-topRight')
      .first()
      .find('.anticon-check-circle')
      .should('exist');
  });
});
