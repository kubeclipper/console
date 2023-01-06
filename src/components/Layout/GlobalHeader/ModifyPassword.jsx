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

import React from 'react';
import Notify from 'components/Notify';
import { getPasswordOtherRule } from 'utils/validate';
import { rootStore } from 'stores';
import styles from './index.less';
import ActionButton from 'components/Tables/Base/ActionButton';
import { ModalAction } from 'containers/Action';

export default function ModifyPassword() {
  const currentProps = {
    id: 'modifyPassword',
    title: t('Modify Password'),
    isAllowed: true,
    buttonClassName: styles['password-btn'],
    action: ModifyAction,
  };

  return <ActionButton {...currentProps} />;
}

class ModifyAction extends ModalAction {
  get defaultValue() {
    const { username } = rootStore.user;

    return {
      name: username,
    };
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('User Name'),
        type: 'label',
      },
      {
        name: 'oldPassword',
        label: t('Old Password'),
        type: 'input-password',
        required: true,
        placeholder: t('Please input old password'),
        otherRule: getPasswordOtherRule('oldPassword', 'user'),
      },
      {
        name: 'password',
        label: t('New Password'),
        type: 'input-password',
        required: true,
        placeholder: t('Please input new password'),
        otherRule: getPasswordOtherRule('password'),
      },
      {
        name: 'confirmPassword',
        label: t('Confirm New Password'),
        type: 'input-password',
        required: true,
        dependencies: ['password'],
        placeholder: t('Please input new password one more'),
        otherRule: getPasswordOtherRule('confirmPassword'),
      },
    ];
  }

  onSubmit = async (values) => {
    const { name, oldPassword, password } = values;
    const data = { currentPassword: oldPassword, newPassword: password };
    try {
      await rootStore.userStore.updatePassword({ id: name }, data);
      Notify.success(
        t('Password has been modified successfully. please login in again.')
      );

      setTimeout(() => {
        localStorage.clear();
        rootStore.gotoLoginPage();
      }, 1000);
    } catch (error) {
      Notify.error(error.reason);
    }
  };
}
