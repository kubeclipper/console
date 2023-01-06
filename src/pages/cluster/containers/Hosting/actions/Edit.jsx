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
import { merge } from 'lodash';
import { safeBtoa, safeAtob } from 'utils/base64';

// eslint-disable-next-line no-unused-vars
import styles from './index.less';

class Edit extends ModalAction {
  static id = 'edit-provider';

  static title = t('Edit');

  static get modalSize() {
    return 'middle';
  }

  get labelCol() {
    return { span: 4 };
  }

  get name() {
    return t('Edit');
  }

  get module() {
    return 'cloudproviders';
  }

  init() {
    this.store = rootStore.cloudProviderStore;
  }

  static policy = 'cloudproviders:edit';

  static allowed = () => Promise.resolve(true);

  get defaultValue() {
    const {
      name,
      type,
      description,
      ssh = {},
      config = {},
      sshType,
    } = this.item;
    const { apiEndpoint } = config;
    const { user } = ssh;
    let { password, privateKey } = ssh;

    password = safeAtob(password);
    privateKey = safeAtob(privateKey);
    const kubeConfig = safeAtob(config.kubeConfig);

    return {
      name,
      type,
      sshType,
      description,
      apiEndpoint,
      user,
      password,
      privateKey,
      kubeConfig,
    };
  }

  get formItems() {
    const { sshType } = this.state;

    const isPassword = sshType === 'password';

    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'label',
      },
      {
        name: 'type',
        label: t('Provider Type'),
        type: 'label',
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
        maxLength: 256,
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
        name: 'kubeConfig',
        label: t('KubeConfig'),
        type: 'yaml-input',
        required: true,
        wrapperCol: { span: 24 },
        className: styles.kubeconfig,
      },
    ];
  }

  onSubmit = (values) => {
    const {
      name,
      description,
      apiEndpoint,
      user,
      password,
      privateKey,
      kubeConfig,
    } = values;

    const data = {
      metadata: {
        name,
        annotations: {
          'kubeclipper.io/description': description,
        },
      },
      config: {
        apiEndpoint,
        kubeConfig: safeBtoa(kubeConfig),
      },
      ssh: {
        user,
        password: safeBtoa(password),
        privateKey: safeBtoa(privateKey),
      },
    };

    const formTemplate = merge(this.item._originData, data);

    return this.store.edit(this.item, formTemplate);
  };
}

export default observer(Edit);
