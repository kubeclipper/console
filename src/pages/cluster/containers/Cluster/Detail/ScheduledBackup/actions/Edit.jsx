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
import moment from 'moment';
import { ModalAction } from 'containers/Action';
import { rootStore } from 'stores';
import { toLocalTime, formatCron } from 'utils';
import { circleDayofFirstLevel, formatFormTemplates } from 'resources/backup';
import * as dateOption from 'resources/date';

const { cornBackupStore: store, clusterStore } = rootStore;

@observer
class Edit extends ModalAction {
  init() {}

  static id = 'scheduled-backup';

  static buttonText = t('Edit');

  static title = t('Edit');

  static policy = 'clusters:edit';

  static get modalSize() {
    return 'middle';
  }

  static allowed = () => Promise.resolve(true);

  get module() {
    return 'scheduledBackup';
  }

  get defaultValue() {
    const { name, type, maxBackupNum, schedule, runAt } = this.item;

    const baseDefault = {
      backupPoint: clusterStore.detail.backupPoint,
      name,
      type,
    };

    if (type === 'OnlyOnce') {
      return {
        ...baseDefault,
        date: moment(toLocalTime(runAt), 'YYYY-MM-DD HH:mm:ss'),
      };
    } else {
      const { time, localsFormat, firstVal } = formatCron(schedule);

      const firstLevelSelected = circleDayofFirstLevel.find(
        (item) => item.key === localsFormat
      );

      return {
        ...baseDefault,
        time: moment(time, 'HH:mm'),
        maxBackupNum,
        cycle: {
          firstLevelSelected,
          secondLevelSelected: {
            label: dateOption?.[firstLevelSelected.key]?.[firstVal],
            value: firstVal,
          },
        },
      };
    }
  }

  get currentType() {
    return this.item.type;
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
        type: 'label',
      },
      {
        name: 'type',
        label: t('Type'),
        type: 'label',
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
        required: true,
      },
    ];
  }

  onSubmit = (values) => {
    const formTemplate = formatFormTemplates(this.item._originData, values);
    const { name } = values;

    return store.edit({ id: name }, formTemplate);
  };
}

export default Edit;
