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
import {
  phoneNumberValidate,
  emailValidate,
  getPasswordOtherRule,
} from 'utils/validate';
import FORM_TEMPLATES from 'utils/form.templates';
import { set } from 'lodash';
import { subdomain } from 'utils/regex';

@observer
class CreateForm extends ModalAction {
  init() {
    this.store = rootStore.userStore;
    this.roleStore = rootStore.roleStore;
    this.getRole();
  }

  async getRole() {
    await this.roleStore.fetchList({
      labelSelector: '!kubeclipper.io/role-template',
      limit: -1,
    });
  }

  static id = 'user-create';

  static title = t('Create User');

  static policy = 'users:create';

  get module() {
    return 'users';
  }

  get listUrl() {
    return '/access/user';
  }

  get name() {
    return t('Create');
  }

  get roles() {
    return (this.roleStore.list.data || []).map((it) => ({
      label: it.name,
      value: it.name,
    }));
  }

  static allowed = () => Promise.resolve(true);

  checkName = async (rule, value) => {
    if (!value) {
      return Promise.reject(t('please input username'));
    }

    if (value && !subdomain.test(value)) {
      return Promise.reject(t('NAME_DESC'));
    }

    const resp = await this.store.checkName({
      fieldSelector: `metadata.name=${value}`,
    });

    if (resp.exist) {
      return Promise.reject(t('Name exists'));
    }

    return Promise.resolve();
  };

  get formItems() {
    return [
      {
        name: 'name',
        label: t('User Name'),
        type: 'input',
        placeholder: t('Please input user name'),
        validator: this.checkName,
        required: true,
        extra: t('Login account, cannot be modified after created.'),
        maxLength: 64,
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
    const formTemplate = FORM_TEMPLATES[this.module]();

    const { name, displayName, role, password, phone, email } = values;

    set(formTemplate, 'metadata.name', name);
    set(formTemplate, 'metadata.annotations["iam.kubeclipper.io/role"]', role);

    const spec = {
      email,
      phone,
      password,
      displayName,
    };
    set(formTemplate, 'spec', spec);

    return this.store.create(formTemplate);
  };
}

export default CreateForm;
