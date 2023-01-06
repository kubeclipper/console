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
class Edit extends ModalAction {
  init() {
    this.store = rootStore.backupPointStore;
  }

  static id = 'edit-backuppoint';

  static buttonText = t('Edit');

  static title = t('Edit Backup Space');

  static policy = 'backuppoints:edit';

  static allowed = () => Promise.resolve(true);

  get module() {
    return 'users';
  }

  get defaultValue() {
    return this.item;
  }

  get isS3() {
    const { storageType } = this.item;
    return storageType === 's3';
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Backup Space Name'),
        type: 'label',
      },
      {
        name: 'storageType',
        label: t('StorageType'),
        type: 'label',
      },
      {
        name: 'description',
        label: t('description'),
        type: 'input',
        maxLength: 256,
      },
      {
        name: 'accessKeyID',
        label: t('Username'),
        type: 'input',
        maxLength: 256,
        hidden: !this.isS3,
      },
      {
        name: 'accessKeySecret',
        label: t('Password'),
        type: 'input-password',
        hidden: !this.isS3,
      },
    ];
  }

  onSubmit = (values) => {
    const { name, storageType, description, ...rest } = values;
    const params = {
      storageType,
      description,
      [`${storageType.toLowerCase()}Config`]: rest,
    };

    return this.store.edit({ id: name }, params);
  };
}

export default Edit;
