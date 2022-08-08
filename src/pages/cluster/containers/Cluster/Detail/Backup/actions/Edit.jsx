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
import { set } from 'lodash';

@observer
class Edit extends ModalAction {
  init() {
    this.store = rootStore.backUpStore;
  }

  static id = 'backup-edit';

  static buttonText = t('Edit');

  static title = t('Edit BackUp');

  static policy = 'clusters:edit';

  static isAvailable = (item) => item.status === 'available';

  static allowed = (item) => Promise.resolve(this.isAvailable(item));

  get module() {
    return 'backups';
  }

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
        label: t('Backup Name'),
        type: 'label',
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

  onSubmit = (values) => {
    const formTemplate = this.item._originData;
    const { name, resourceVersion } = this.item;
    const { id: cluster } = this.containerProps.detail;
    const { description } = values;

    set(
      formTemplate,
      'metadata.annotations["kubeclipper.io/description"]',
      description
    );

    return this.store.edit(
      { id: name, cluster, resourceVersion },
      formTemplate
    );
  };
}

export default Edit;
