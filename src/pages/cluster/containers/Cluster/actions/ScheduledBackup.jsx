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
import Notify from 'components/Notify';
import { cronTypeOption } from 'resources/date';
import { formatFormTemplates } from 'resources/backup';
import { isDisableByProviderType } from 'utils';

@observer
class ScheduledBackup extends ModalAction {
  init() {
    this.store = rootStore.cornBackupStore;
    this.clusterStore = rootStore.clusterStore;
  }

  static id = 'scheduled-backup';

  static buttonText = t('Scheduled Backup');

  static title = t('Scheduled Backup');

  static policy = 'clusters:edit';

  static actionType = 'notice';

  static get modalSize() {
    return 'middle';
  }

  get name() {
    return t('Add');
  }

  get module() {
    return 'scheduledBackup';
  }

  get instanceName() {
    return this.values.name;
  }

  static checkNotice = (item) => {
    const { backupPoint } = item;
    if (!backupPoint) {
      Notify.error(t('Please add a backup space in the edit cluster'));
      return false;
    }
    return true;
  };

  static isStatusRunning({ status }) {
    if (status === 'Running') {
      return true;
    }
    return false;
  }

  static allowed = (item) =>
    Promise.resolve(this.isStatusRunning(item)) &&
    !isDisableByProviderType(item);

  get defaultValue() {
    const { backupPoint } = this.item;

    return {
      backupPoint,
      type: cronTypeOption[0].value,
    };
  }

  get currentType() {
    return this.state.type;
  }

  get formItems() {
    return [
      {
        name: 'backupPoint',
        label: t('Backup Space'),
        type: 'label',
      },
      {
        name: 'name',
        label: t('Name'),
        type: 'input',
        required: true,
      },
      {
        name: 'type',
        label: t('Type'),
        type: 'select',
        options: cronTypeOption,
        required: true,
      },
      {
        name: 'cycle',
        label: t('Cycle'),
        type: 'select-cycle',
        hidden: this.currentType !== 'Repeat',
        required: true,
      },

      {
        name: 'date',
        label: t('Time'),
        type: 'date-picker',
        showTime: true,
        format: 'YYYY-MM-DD HH:mm:ss',
        hidden: this.currentType !== 'OnlyOnce',
        required: true,
      },
      {
        name: 'time',
        label: t('Time'),
        type: 'time-picker',
        format: 'HH:mm',
        hidden: this.currentType !== 'Repeat',
        required: true,
      },
      {
        name: 'maxBackupNum',
        label: t('Number of valid backups'),
        type: 'input-number',
        hidden: this.currentType !== 'Repeat',
        min: 1,
        required: true,
      },
    ];
  }

  onSubmit = (values) => {
    const { id } = this.item;
    const { name } = values;
    const formTemplate = formatFormTemplates(this.formTemplate, {
      id,
      ...values,
    });

    return this.store.create(formTemplate, { name });
  };
}

export default ScheduledBackup;
