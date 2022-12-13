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

import { isArray } from 'lodash';
import getTitle from './common';

function getId(formItemName) {
  return `#form-item-col-${formItemName}`;
}

Cypress.Commands.add('waitFormLoading', () => {
  cy.get('.ant-btn-loading', { timeout: 600000 }).should('not.exist');
});

// 普通 input 表单
Cypress.Commands.add('formInput', (formItemName, value, index) => {
  if (!index) {
    cy.get(getId(formItemName))
      .find('input')
      .first()
      .clear({ force: true })
      .type(value)
      .blur();
  } else {
    cy.get(getId(formItemName))
      .find('input')
      .eq(index)
      .clear({ force: true })
      .type(value)
      .blur();
  }
});

// 登录 input
Cypress.Commands.add('loginInput', (formItemName, value, index) => {
  if (!index) {
    cy.get(`#normal_login_${formItemName}`).clear().type(value).blur();
  } else {
    cy.get(`#normal_login_${formItemName}`).clear().type(value).blur();
  }
});

// 登录提交
Cypress.Commands.add('loginFormSubmit', () => {
  cy.get('#normal_login').find('button').click().waitFormLoading();
});

// 选择框
Cypress.Commands.add(
  'formSelect',
  (formItemName, label, selectIndex, i18n = true) => {
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
      const realLabel = i18n ? getTitle(label) : label;
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
  }
);

// 清空选择框
Cypress.Commands.add('clearFormSelect', (formItemName) => {
  cy.get(getId(formItemName)).find('.ant-select').first().trigger('mouseover');
  cy.get(getId(formItemName))
    .find('.ant-select-clear')
    .first()
    .click({ force: true });
});

// 表单 loading
Cypress.Commands.add('waitFormLoading', () => {
  cy.get('.ant-btn-loading', { timeout: 600000 }).should('not.exist');
});

// 关闭页面右上角 notification
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
    .wait(1000)
    .closeNotice();
  if (waitTime) {
    cy.wait(waitTime);
  }
});

// 页面表单确认按钮，非 modal 弹窗
Cypress.Commands.add('clickPageFormSubmitButton', (waitTime) => {
  cy.get('.step-form-footer-btns')
    .find('button')
    .eq(1)
    .click()
    .waitFormLoading()
    .wait(1000);
  if (waitTime) {
    cy.wait(waitTime);
  }
});

// checkbox 类型表单
Cypress.Commands.add('formCheckboxClick', (formItemName, index = 0) => {
  cy.get(getId(formItemName)).find('input').eq(index).click();
});

// switch 类型表单
Cypress.Commands.add('formSwitchClick', (formItemName) => {
  cy.get(getId(formItemName)).find('.ant-switch').click();
});

// ip 输入框
Cypress.Commands.add('formInputIp', (formItemName, value = '0.0.0.0') => {
  cy.get(formItemName).last().as('item');
  value.split('.').forEach((it, index) => {
    cy.get('@item').find('input').eq(index).clear().type(it);
  });
});

// port 输入框
Cypress.Commands.add('formInputPort', (formItemName, value) => {
  cy.get(formItemName).last().find('input').first().clear().type(value);
});

// Textarea 类型输入框
Cypress.Commands.add('formTextarea', (formItemName, value) => {
  cy.get(getId(formItemName))
    .find('textarea')
    .clear({ force: true })
    .invoke('val', value);
});

// Radio 类型选择框
Cypress.Commands.add('formRadioChoose', (formItemName, itemIndex = 0) => {
  cy.get(getId(formItemName)).find('.ant-radio-wrapper').eq(itemIndex).click();
});

// RadioButton 类型选择框
Cypress.Commands.add('formRadioButtonChoose', (formItemName, itemIndex = 0) => {
  cy.get(getId(formItemName))
    .find('.ant-radio-button-wrapper')
    .eq(itemIndex)
    .click();
});

// 分步表单下一步按钮
Cypress.Commands.add('clickStepActionNextButton', (action, waitTime = 1000) => {
  cy.get(`[data-action="${action}"]`).click().wait(waitTime);
});

// 分步表单取消按钮
Cypress.Commands.add('clickStepActionCancelButton', (waitTime = 2000) => {
  cy.get('.step-form-footer-btns')
    .find('button')
    .first()
    .click()
    .wait(waitTime);
});

// 分步表单确认按钮
Cypress.Commands.add('clickStepActionConfirmButton', (waitTime = 2000) => {
  cy.get('.step-form-footer-btns').find('button').eq(1).click().wait(waitTime);
});

// ip 输入框
Cypress.Commands.add('inputIP', (_class, value) => {
  value.split('.').forEach((it, index) => {
    cy.get(_class).find('input').eq(index).clear().type(it);
  });
});

// 校验多穿梭框非空
Cypress.Commands.add('waitTransferList', (waitTime = 10000) => {
  cy.get('.multi-transfer-left')
    .find('.ant-empty', { timeout: waitTime })
    .should('not.exist');
});

// 多穿梭框
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

// ArrayInput 类型表单 添加 按钮
Cypress.Commands.add('formArrayInputAdd', (formItemName) => {
  cy.get(getId(formItemName)).find('.add-btn').click().wait(2000);
});

// ArrayInput 类型表单 移除 按钮， index 表示移除第几个
Cypress.Commands.add('formArrayInputRemove', (formItemName, index) => {
  if (index) {
    cy.get(getId(formItemName))
      .find('.anticon-minus-circle')
      .eq(index)
      .click()
      .wait(2000);
  } else {
    cy.get(getId(formItemName))
      .find('.anticon-minus-circle')
      .first()
      .click()
      .wait(2000);
  }
});

// 校验表单值存在
Cypress.Commands.add('checkFormValue', (formItemName, value) => {
  const realValue = getTitle(value);
  cy.get(getId(formItemName))
    .find('.ant-form-item-control')
    .contains(realValue)
    .should('exist');
});

// 检验选择框值存在
Cypress.Commands.add('checkFormSelectorExist', (formItemName, val) => {
  cy.get(getId(formItemName)).find('.ant-select').click().wait(500);
  cy.get(`[label="${val}"]`).should('exist');
});

// 检验选择框值不存在
Cypress.Commands.add('checkFormSelectorNotExist', (formItemName, val) => {
  cy.get(getId(formItemName)).find('.ant-select').click().wait(500);
  cy.get(`[label="${val}"]`).should('not.exist');
});

// 检验分步创建确认页表单值
Cypress.Commands.add('checkConfirmStepItemContent', (formItemName, value) => {
  cy.get(getId(formItemName))
    .find('.ant-descriptions-item-content')
    .contains(value)
    .should('exist');
});

// 点击左侧 tab 按钮(比如：角色权限)
Cypress.Commands.add('clickLeftTab', (index, waitTime = 500) => {
  cy.get('.vertical-tabs').find('.vertical-tabs-item').eq(index).click();
  if (waitTime) {
    cy.wait(waitTime);
  }
});

// 勾选权限角色权限右侧 checkbox, 不传 index 就全勾选
Cypress.Commands.add('clickRoleCheckbox', (index, waitTime) => {
  if (index || index === 0) {
    cy.get('.check-item-wrapper').find('.ant-checkbox').eq(index).click();
  } else {
    cy.get('.check-item-wrapper')
      .find('.ant-checkbox')
      .as('checkboxes')
      .click({ multiple: true });

    cy.get('@checkboxes').each(($el) => {
      cy.wrap($el).should('have.class', 'ant-checkbox-checked');
    });
  }
  if (waitTime) {
    cy.wait(waitTime);
  }
});

Cypress.Commands.add(
  'formInputRegistry',
  (formItemName, index, value, waitTime) => {
    cy.get(getId(formItemName)).as('formItem');
    cy.get('@formItem').find('.ant-select').click().wait(500);

    cy.get('.ant-select-dropdown')
      .last()
      .find('.ant-select-item-option')
      .eq(index)
      .click({ force: true });

    cy.get('@formItem')
      .find('input')
      .last()
      .clear({ force: true })
      .type(value)
      .blur();

    if (waitTime) {
      cy.wait(waitTime);
    }
  }
);

Cypress.Commands.add('closeModal', () => {
  cy.get('.ant-modal-close').click();
});
