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

// import React from 'react';
import { observer } from 'mobx-react';
// import { Button } from 'antd';
import { ModalAction } from 'containers/Action';
import { rootStore } from 'stores';
import FORM_TEMPLATES from 'utils/form.templates';
import { merge } from 'lodash';
import { safeBtoa } from 'utils/base64';
// import { checkEndpoint } from 'utils/validate';
// import Notify from 'components/Notify';
import { toJS } from 'mobx';

class Add extends ModalAction {
  static id = 'add-provider';

  static title = t('Add');

  static get modalSize() {
    return 'middle';
  }

  get name() {
    return t('Add');
  }

  get module() {
    return 'cloudproviders';
  }

  init() {
    this.store = rootStore.cloudProviderStore;
    this.regionStore = rootStore.regionStore;

    this.getRegion();
  }

  static policy = 'cloudproviders:edit';

  static allowed = () => Promise.resolve(true);

  get labelCol() {
    return { span: 4 };
  }

  get defaultValue() {
    return {
      type: 'rancher',
      sshType: 'privateKey',
    };
  }

  async getRegion() {
    await this.regionStore.fetchList();
  }

  getRegionOptions() {
    const data = toJS(this.regionStore.list.data);

    return (data || []).map(({ name }) => ({
      value: name,
      label: name,
    }));
  }

  get formItems() {
    const { sshType } = this.state;
    const isPassword = sshType === 'password';

    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        placeholder: t('Please input name'),
        required: true,
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
        maxLength: 256,
      },
      {
        name: 'region',
        label: t('Region'),
        type: 'select-input',
        placeholder: t('Please input region which cluster and node belong'),
        required: true,
        options: this.getRegionOptions(),
      },
      {
        name: 'type',
        label: t('Provider Type'),
        type: 'radio',
        optionType: 'button',
        buttonStyle: 'outline',
        required: true,
        options: [
          {
            label: t('Kubeadm'),
            value: 'kubeadm',
          },
        ],
      },
      {
        name: 'sshType',
        label: t('SSH'),
        type: 'radio',
        optionType: 'button',
        buttonStyle: 'outline',
        required: true,
        options: [
          {
            label: t('PrivateKey'),
            value: 'privateKey',
          },
          {
            label: t('Password'),
            value: 'password',
          },
        ],
      },
      {
        name: 'user',
        label: t('User'),
        type: 'input',
        placeholder: t('Please input node user'),
        required: true,
      },
      {
        name: 'password',
        label: t('Password'),
        type: 'input-password',
        placeholder: t('Please input node password'),
        required: true,
        hidden: !isPassword,
      },
      {
        name: 'privateKey',
        label: t('PrivateKey'),
        type: 'textarea',
        placeholder: t('Please input node privateKey'),
        required: true,
        hidden: isPassword,
      },
      {
        name: 'kubeconfig',
        label: t('KubeConfig'),
        type: 'yaml-input',
        required: true,
        labelCol: { span: 4 },
        wrapperCol: { span: 20 },
      },
    ];
  }

  onSubmit = (values) => {
    const {
      name,
      description,
      type,
      region,
      apiEndpoint,
      accessKey,
      secretKey,
      user,
      password,
      privateKey,
    } = values;

    const data = {
      metadata: {
        name,
        annotations: {
          'kubeclipper.io/description': description,
        },
      },
      type,
      region,
      config: {
        apiEndpoint,
        accessKey,
        secretKey,
      },
      ssh: {
        user,
        password: safeBtoa(password),
        port: 22,
        privateKey: safeBtoa(privateKey),
      },
    };

    const formTemplate = merge(FORM_TEMPLATES[this.module](), data);

    return this.store.create(formTemplate);
  };
}

export default observer(Add);
