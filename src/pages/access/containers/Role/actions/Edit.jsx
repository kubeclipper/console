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
import { set } from 'lodash';
import { rootStore } from 'stores';

@observer
class Edit extends ModalAction {
  init() {
    this.store = rootStore.roleStore;
  }

  static id = 'role-edit';

  static buttonText = t('Edit');

  static title = t('Edit Role');

  static policy = 'roles:edit';

  static isInternal = (item) => item.isInternal;

  static allowed = (item) => Promise.resolve(!this.isInternal(item));

  get defaultValue() {
    const { name, description } = this.item;

    return {
      name,
      description,
    };
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Role Name'),
        type: 'label',
      },
      {
        name: 'description',
        label: t('description'),
        type: 'input',
        maxLength: 256,
      },
    ];
  }

  onSubmit = (values) => {
    const formTemplate = this.item._originData;

    const { description } = values;
    const { name, resourceVersion } = this.item;

    set(
      formTemplate,
      'metadata.annotations["kubeclipper.io/description"]',
      description
    );

    return this.store.edit({ id: name, resourceVersion }, formTemplate);
  };
}

export default Edit;
