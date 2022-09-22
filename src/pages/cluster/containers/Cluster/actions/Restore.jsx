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
import BackUpStore from 'stores/backup';
import { get } from 'lodash';
import { backupTableProps } from 'resources/backup';
import { checkExpired, isDisableByProviderType } from 'utils';

@observer
export default class Index extends ModalAction {
  static id = 'restore';

  static title = t('Restore Cluster');

  static get modalSize() {
    return 'middle';
  }

  get name() {
    return t('Restore');
  }

  init() {
    this.store = new BackUpStore();
  }

  get labelCol() {
    return {
      xs: { span: 6 },
      sm: { span: 4 },
    };
  }

  get wrapperCol() {
    return {
      xs: { span: 18 },
      sm: { span: 20 },
    };
  }

  get backups() {
    return this.store.list.data || [];
  }

  get defaultValue() {
    const { name } = this.item;

    return {
      name,
    };
  }

  static policy = 'clusters:edit';

  static isStatusRunning(item) {
    if (item.status === 'Running') {
      return true;
    }
    return false;
  }

  static isLicensExpiration = (item) =>
    checkExpired(item.licenseExpirationTime);

  static allowed = (item) =>
    Promise.resolve(
      this.isLicensExpiration(item) &&
        this.isStatusRunning(item) &&
        !isDisableByProviderType(item)
    );

  get formItems() {
    const { name } = this.item;
    return [
      {
        name: 'name',
        label: t('Cluster'),
        type: 'label',
      },
      {
        name: 'backup',
        label: t('Select Backup'),
        type: 'select-table',
        required: true,
        isLoading: this.store.list.isLoading,
        isMulti: false,
        backendPageStore: this.store,
        extraParams: { cluster: name },
        ...backupTableProps,
      },
    ];
  }

  get successText() {
    return t('{name} is restoring.', {
      action: this.name,
      name: this.item.name,
    });
  }

  get errorText() {
    return t('Unable to {action}.', {
      action: this.name,
    });
  }

  get cluster() {
    return this.props.item.name;
  }

  onSubmit = async (values) => {
    const backupName = get(values, 'backup.data[0].name');

    const data = {
      useBackupName: backupName,
    };
    await this.store.restore(data, { cluster: this.cluster });
  };
}
