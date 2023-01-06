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
import { namespace, path } from 'utils/regex';
import { passwordRegex, isIp, isIpPort } from 'utils/validate';

@observer
class CreateForm extends ModalAction {
  init() {
    this.store = rootStore;
    this.backupPointStore = rootStore.backupPointStore;

    rootStore.getConfigs();
  }

  static title = t('Create');

  static policy = 'backuppoints:edit';

  get name() {
    return t('Create');
  }

  get storageType() {
    const { config } = this.store;
    const types = ['FS', 'S3'];
    const availableTypes = [];

    types.forEach((item) => {
      const name = item.toLowerCase();
      if (config[name]) {
        availableTypes.push(item);
      }
    });

    return availableTypes.map((item) => ({
      label: item,
      value: item,
    }));
  }

  get isFs() {
    const { storageType } = this.state;
    return storageType === 'FS';
  }

  get isS3() {
    const { storageType } = this.state;
    return storageType === 'S3';
  }

  get defaultValue() {
    return {
      storageType: 'FS',
    };
  }

  get checkName() {
    return {
      pattern: namespace,
      message: t('NAME_DESC'),
      required: true,
    };
  }

  checkIp = async (_, value) => {
    if (!isIp(value) && !isIpPort(value)) {
      return Promise.reject(t('IP invalid'));
    }
    return Promise.resolve();
  };

  static allowed = () => Promise.resolve(true);

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Backup Space Name'),
        type: 'input',
        placeholder: `${t('Please input')}${t('Backup Space Name')}`,
        maxLength: 12,
        rules: [this.checkName],
      },
      {
        name: 'description',
        label: t('description'),
        type: 'input',
        maxLength: 256,
      },
      {
        name: 'storageType',
        label: t('StorageType'),
        type: 'select',
        required: true,
        options: this.storageType,
      },
      {
        name: 'backupRootDir',
        label: t('backupRootDir'),
        type: 'input',
        hidden: !this.isFs,
        tip: t(
          'The backup path needs to be created on each node and mounted to a shared file path (such as NFS)'
        ),
        rules: [
          {
            pattern: path,
            message: t('Please input correct path'),
            required: true,
          },
        ],
      },
      {
        name: 'bucket',
        label: t('Bucket Name'),
        type: 'input',
        required: true,
        maxLength: 256,
        rules: [this.checkName],
        hidden: !this.isS3,
      },
      {
        name: 'endpoint',
        label: t('Endpoint'),
        type: 'input',
        maxLength: 64,
        require: true,
        validator: this.checkIp,
        hidden: !this.isS3,
      },
      {
        name: 'accessKeyID',
        label: t('Username'),
        type: 'input',
        maxLength: 64,
        rules: [this.checkName],
        hidden: !this.isS3,
      },
      {
        name: 'accessKeySecret',
        label: t('Password'),
        type: 'input-password',
        hidden: !this.isS3,
        rules: [
          {
            pattern: passwordRegex,
            message: t(
              '8 to 16 characters, at least one uppercase letter, one lowercase letter, one number.'
            ),
            required: true,
          },
        ],
      },
    ];
  }

  onSubmit = (values) => {
    const { name, storageType, description, ...rest } = values;
    const params = {
      metadata: {
        name,
      },
      storageType,
      description,
      [`${storageType.toLowerCase()}Config`]: rest,
    };

    return this.backupPointStore.create(params);
  };
}

export default CreateForm;
