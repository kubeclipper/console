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
import { rootStore } from 'stores';
import BaseForm from 'components/Form';
import { subdomain } from 'utils/regex';

export default class BaseInfo extends BaseForm {
  get name() {
    return 'password';
  }

  get isModal() {
    return true;
  }

  init() {
    this.store = rootStore.roleStore;
  }

  get defaultValue() {
    return {
      name: '',
      offline: true,
    };
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Role Name'),
        type: 'input',
        required: true,
        placeholder: t('Please input role name'),
        validator: this.checkName,
        maxLength: 64,
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'input',
        placeholder: t('Please input description'),
        maxLength: 256,
      },
    ];
  }

  checkName = async (rule, value) => {
    if (!value) {
      return Promise.reject(t('Please input rolename'));
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
}
