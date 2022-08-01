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

@observer
class SaveAsTemplate extends ModalAction {
  init() {
    this.store = rootStore.templatesStore;
  }

  static id = 'cluster-edit';

  static buttonText = t('Save as template');

  static title = t('Save as template');

  static policy = 'clusters:create';

  static listUrl = '/cluster';

  static get modalSize() {
    return 'middle';
  }

  get name() {
    return t('Create Template');
  }

  static isInstalling = (item) => item.status === 'Installing';

  static allowed = (item) => Promise.resolve(!this.isInstalling(item));

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
    const { addons, pluginName, pluginVersion, pluginCategory } = this.item;

    const params = {
      ...values,
      pluginName: pluginName || 'kubernetes',
      pluginVersion: pluginVersion || 'v1',
      pluginCategory: pluginCategory || 'kubernetes',
    };

    return this.store.create(params, addons);
  };
}

export default SaveAsTemplate;
