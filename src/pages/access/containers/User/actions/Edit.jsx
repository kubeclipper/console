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
import { phoneNumberValidate, emailValidate } from 'utils/validate';
import { set, get } from 'lodash';

@observer
class Edit extends ModalAction {
  init() {
    this.store = rootStore.userStore;
    this.roleStore = rootStore.roleStore;
    this.getRole();
  }

  static id = 'user-edit';

  static buttonText = t('Edit');

  static title = t('Edit User');

  static policy = 'users:edit';

  static isAdmin = (item) => item.name === 'admin';

  static allowed = (item) => Promise.resolve(!this.isAdmin(item));

  get module() {
    return 'users';
  }

  async getRole() {
    await this.roleStore.fetchList({
      labelSelector: '!kubeclipper.io/role-template',
      limit: -1,
    });
  }

  get listUrl() {
    return this.getUrl('/access/user');
  }

  get data() {
    return this.store.detail || [];
  }

  get defaultValue() {
    const { name, displayName, role, phone, email } = this.item;

    return {
      name,
      displayName,
      role,
      phone,
      email,
    };
  }

  get roles() {
    return (this.roleStore.list.data || []).map((it) => ({
      label: it.name,
      value: it.name,
    }));
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('User Name'),
        type: 'label',
      },
      {
        name: 'displayName',
        label: t('Alias Name'),
        type: 'input',
        placeholder: t('Please input alias name'),
        maxLength: 32,
      },
      {
        name: 'role',
        label: t('Role'),
        type: 'select',
        required: true,
        options: this.roles,
      },
      {
        name: 'phone',
        label: t('Phone'),
        validator: phoneNumberValidate,
        type: 'input',
        placeholder: t('Please input phone'),
      },
      {
        name: 'email',
        label: t('Email'),
        validator: emailValidate,
        type: 'input',
        placeholder: t('Please input email'),
      },
    ];
  }

  onSubmit = (values) => {
    const formTemplate = this.item._originData;
    const { name, resourceVersion } = this.item;

    const { displayName, role, phone, email } = values;

    set(formTemplate, 'metadata.annotations["iam.kubeclipper.io/role"]', role);

    const spec = {
      ...get(formTemplate, 'spec'),
      email,
      phone,
      displayName,
    };
    set(formTemplate, 'spec', spec);

    return this.store.edit({ id: name, resourceVersion }, formTemplate);
  };
}

export default Edit;
