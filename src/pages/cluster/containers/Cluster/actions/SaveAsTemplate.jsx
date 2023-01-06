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
import { isDisableByProviderType } from 'utils';
import { safeAtob } from 'utils/base64';

@observer
class SaveAsTemplate extends ModalAction {
  init() {
    this.store = rootStore.templatesStore;
  }

  static id = 'cluster-edit';

  static buttonText = t('Save as template');

  static title = t('Save as template');

  static policy = 'clusters:edit';

  static listUrl = '/cluster';

  static get modalSize() {
    return 'middle';
  }

  get name() {
    return t('Create Template');
  }

  get item() {
    const { item } = this.props;
    const { isPlugin } = item;
    if (!isPlugin) {
      return {
        pluginName: 'kubernetes',
        pluginVersion: 'v1',
        pluginCategory: 'kubernetes',
        component: item._originData,
      };
    }
    return item;
  }

  static isInstalling = (item) => item.status === 'Installing';

  static allowed = (item) =>
    Promise.resolve(!this.isInstalling(item)) &&
    !isDisableByProviderType(item, ['kubeadm']);

  get formItems() {
    return [
      {
        name: 'templateName',
        label: t('Template Name'),
        type: 'input',
        required: true,
      },
      {
        name: 'templateDescription',
        label: t('description'),
        type: 'input',
      },
    ];
  }

  onSubmit = (values) => {
    const { component, pluginName, pluginVersion, pluginCategory } = this.item;

    const params = {
      ...values,
      pluginName,
      pluginVersion,
      pluginCategory,
    };

    const decryptCategory = ['cinder'];
    const decryptKeys = ['password', 'caCert'];
    const decryptCom = ['externalCaKey', 'externalCaCert'];

    if (decryptCategory.includes(pluginName)) {
      decryptKeys.forEach((key) => {
        component[key] = safeAtob(component[key]);
      });
    }

    if (pluginName === 'kubernetes') {
      component.addons.forEach((addon) => {
        if (decryptCategory.includes(addon.name)) {
          decryptKeys.forEach((key) => {
            addon.config[key] = safeAtob(addon.config[key]);
          });
        }
      });

      decryptCom.forEach((key) => {
        if (component?.[key]) {
          component[key] = safeAtob(component[key]);
        }
      });
    }

    return this.store.create(params, component);
  };
}

export default SaveAsTemplate;
