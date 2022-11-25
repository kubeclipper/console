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
import { isArray } from 'lodash';

function getId(formItemName) {
  return `#form-item-col-${formItemName}`;
}

Cypress.Commands.add('waitFormLoading', () => {
  cy.get('.ant-btn-loading', { timeout: 600000 }).should('not.exist');
});

Cypress.Commands.add('formInput', (formItemName, value, index) => {
  if (!index) {
    cy.get(getId(formItemName))
      .find('input')
      .first()
      .clear()
      .type(value)
      .blur();
  } else {
    cy.get(getId(formItemName))
      .find('input')
      .eq(index)
      .clear()
      .type(value)
      .blur();
  }
});

Cypress.Commands.add('loginInput', (formItemName, value, index) => {
  if (!index) {
    cy.get(`#normal_login_${formItemName}`).clear().type(value).blur();
  } else {
    cy.get(`#normal_login_${formItemName}`).clear().type(value).blur();
  }
});

Cypress.Commands.add('loginFormSubmit', () => {
  cy.get('#normal_login').find('button').click().waitFormLoading();
});

Cypress.Commands.add('formSelect', (formItemName, label, selectIndex) => {
  if (!selectIndex) {
    cy.get(getId(formItemName)).find('.ant-select').click().wait(500);
  } else {
    cy.get(getId(formItemName))
      .find('.ant-select')
      .eq(selectIndex)
      .click()
      .wait(500);
  }
  if (label !== undefined) {
    const realLabel = getTitle(label);
    cy.get('.ant-select-item-option')
      .contains(realLabel)
      .click({ force: true });
  } else {
    cy.get('.ant-select-dropdown')
      .last()
      .find('.ant-select-item-option')
      .first()
      .click({ force: true });
  }
});

Cypress.Commands.add('checkFormSelectorExist', (formItemName, val) => {
  cy.get(getId(formItemName)).find('.ant-select').click().wait(500);
  cy.get(`[label="${val}"]`).should('exist');
});

Cypress.Commands.add('checkFormSelectorNotExist', (formItemName, val) => {
  cy.get(getId(formItemName)).find('.ant-select').click().wait(500);
  cy.get(`[label="${val}"]`).should('not.exist');
});

Cypress.Commands.add('waitFormLoading', () => {
  cy.get('.ant-btn-loading', { timeout: 600000 }).should('not.exist');
});

Cypress.Commands.add('closeNotice', () => {
  cy.get('.ant-notification-topRight')
    .first()
    .find('.anticon-check-circle')
    .should('exist');
  cy.get('.ant-notification-topRight')
    .first()
    .find('.ant-notification-close-x')
    .first()
    .click();
});

// modal 框确认按钮
Cypress.Commands.add(
  'clickModalActionSubmitButton',
  (inTable = true, waitTime) => {
    cy.get('.ant-modal-footer')
      .find('button')
      .eq(1)
      .click()
      .waitFormLoading()
      .wait(1000)
      .closeNotice();
    if (inTable) {
      cy.wait(2000).waitTableLoading();
    }
    if (waitTime) {
      cy.wait(waitTime);
    }
  }
);

// confirm 框确认按钮
Cypress.Commands.add('clickConfirmActionSubmitButton', (waitTime) => {
  cy.get('.ant-modal-confirm-btns')
    .find('button')
    .eq(1)
    .click()
    .waitFormLoading()
    .closeNotice();
  if (waitTime) {
    cy.wait(waitTime);
  }
});

Cypress.Commands.add('formCheckboxClick', (formItemName, index = 0) => {
  cy.get(getId(formItemName)).find('input').eq(index).click();
});

Cypress.Commands.add('formAddSelectAdd', (formItemName) => {
  cy.get(getId(formItemName)).find('.add-btn').click().wait(2000);
});

Cypress.Commands.add('formInputIp', (formItemName, value = '0.0.0.0') => {
  cy.get(formItemName).last().as('item');
  value.split('.').forEach((it, index) => {
    cy.get('@item').find('input').eq(index).clear().type(it);
  });
});

Cypress.Commands.add('formInputPort', (formItemName, value) => {
  cy.get(formItemName).last().find('input').first().clear().type(value);
});

Cypress.Commands.add('checkFormValue', (formItemName, value) => {
  const realValue = getTitle(value);
  cy.get(getId(formItemName))
    .find('.ant-form-item-control')
    .contains(realValue)
    .should('exist');
});

Cypress.Commands.add('formTextarea', (formItemName, value) => {
  cy.get(getId(formItemName))
    .find('textarea')
    .clear({ force: true })
    .type(value, { force: true });
});

Cypress.Commands.add('formRadioChoose', (formItemName, itemIndex = 0) => {
  cy.get(getId(formItemName)).find('.ant-radio-wrapper').eq(itemIndex).click();
});

Cypress.Commands.add('formRadioButtonChoose', (formItemName, itemIndex = 0) => {
  cy.get(getId(formItemName))
    .find('.ant-radio-button-wrapper')
    .eq(itemIndex)
    .click();
});

Cypress.Commands.add('clickStepActionNextButton', (action, waitTime = 1000) => {
  cy.get(`[data-test="${action}"]`).click().wait(waitTime);
});

Cypress.Commands.add('inputText', (formItemName, value) => {
  cy.get(getId(formItemName)).find('input').clear({ force: true }).type(value);
});

Cypress.Commands.add('inputIP', (_class, value) => {
  value.split('.').forEach((it, index) => {
    cy.get(_class).find('input').eq(index).clear().type(it);
  });
});

Cypress.Commands.add('clickStepActionCancelButton', (waitTime = 2000) => {
  cy.get('.step-form-footer-btns')
    .find('button')
    .first()
    .click()
    .wait(waitTime);
});

Cypress.Commands.add('waitTransferList', (waitTime = 10000) => {
  cy.get('.multi-transfer-left')
    .find('.ant-empty', { timeout: waitTime })
    .should('not.exist');
});

Cypress.Commands.add(
  'formMultiTransfer',
  (formItemName, leftIndex, rightIndex) => {
    cy.get(getId(formItemName))
      .find('.multi-transfer-left')
      .find('.list-body')
      .find('.ant-checkbox-wrapper')
      .as('leftCheckbox');

    if (!leftIndex) {
      cy.get('@leftCheckbox').first().click();
    } else if (isArray(leftIndex)) {
      leftIndex.forEach((index) => {
        cy.log(index);
        cy.get('@leftCheckbox').eq(index).click();
      });
    } else {
      cy.get('@leftCheckbox').eq(leftIndex).click();
    }

    if (!rightIndex) {
      cy.get('.multi-transfer-right')
        .find('.right-item')
        .first()
        .find('.btn-to-right')
        .first()
        .click();
    } else {
      cy.get('.multi-transfer-right')
        .find('.right-item')
        .eq(rightIndex)
        .find('.btn-to-right')
        .first()
        .click();
    }
  }
);

Cypress.Commands.add('clickConfirm', (_class = '.ant-modal-footer span') => {
  const confirmTitle = Cypress.env('language') === 'zh' ? '确 定' : 'Confirm';
  cy.clickByTitle(_class, confirmTitle);
});
