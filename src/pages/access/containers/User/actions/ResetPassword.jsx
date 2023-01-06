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
import { observer } from 'mobx-react';
import { ModalAction } from 'containers/Action';
import { rootStore } from 'stores';
import { getPasswordOtherRule } from 'utils/validate';

@observer
class Index extends ModalAction {
  init() {
    this.store = rootStore.userStore;
  }

  static id = 'reset-password';

  static title = t('Reset Password');

  static policy = 'users:edit';

  static isAdmin = (item) => item.name === 'admin';

  static allowed = (item) =>
    Promise.resolve(!this.isAdmin(item) && !item.authenticationMode);

  get module() {
    return 'users';
  }

  get name() {
    return t('Reset password');
  }

  get listUrl() {
    return this.getUrl('/access/user');
  }

  get defaultValue() {
    const { name } = this.item;

    return {
      name,
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
        name: 'password',
        label: t('Password'),
        type: 'input-password',
        required: true,
        otherRule: getPasswordOtherRule('password'),
      },
      {
        name: 'confirmPassword',
        label: t('Confirm Password'),
        type: 'input-password',
        required: true,
        dependencies: ['password'],
        otherRule: getPasswordOtherRule('confirmPassword'),
      },
    ];
  }

  onSubmit = (values) => {
    const { password } = values;

    const data = {
      newPassword: password,
    };
    return this.store.updatePassword(this.item, data);
  };
}

export default Index;
