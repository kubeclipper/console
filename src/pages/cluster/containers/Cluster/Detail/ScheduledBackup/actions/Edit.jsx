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
import { parseExpression, fieldsToExpression } from 'cron-parser';
import moment from 'moment';
import { set } from 'lodash';
import { ModalAction } from 'containers/Action';
import { rootStore } from 'stores';

const { cornBackupStore: store, clusterStore } = rootStore;

@observer
class Edit extends ModalAction {
  init() {}

  static id = 'scheduled-backup';

  static buttonText = t('Edit');

  static title = t('Scheduled Backup');

  static policy = 'clusters:edit';

  static get modalSize() {
    return 'middle';
  }

  static allowed = () => Promise.resolve(true);

  get module() {
    return 'scheduledBackup';
  }

  get defaultValue() {
    const { name, type } = this.item;

    return {
      name,
      backupPoint: clusterStore.detail.backupPoint,
      type,
    };
  }

  get currentType() {
    return this.item.type;
  }

  get formItems() {
    return [
      {
        name: 'backupPoint',
        label: t('BackupPoint'),
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
    const formTemplate = this.item._originData;
    const { name, type, time, cycle, date, maxBackupNum } = values;

    if (type === 'OnlyOnce') {
      const runAt = moment(date).format();
      set(formTemplate, 'spec.runAt', runAt);
    } else {
      const { firstLevelSelected, secondLevelSelected } = cycle;
      const interval = parseExpression(firstLevelSelected.value);
      const fields = JSON.parse(JSON.stringify(interval.fields));
      if (secondLevelSelected?.value) {
        fields[firstLevelSelected.key] = [
          parseInt(secondLevelSelected.value, 10),
        ];
      }

      const selectedHour = moment(time).hour();
      const selectedMinute = moment(time).minute();
      const selectedSecond = moment(time).second();
      fields.hour = [selectedHour];
      fields.minute = [selectedMinute];
      fields.second = [selectedSecond];
      const modifiedInterval = fieldsToExpression(fields);
      const schedule = modifiedInterval.stringify();
      const spec = {
        schedule,
        maxBackupNum,
      };
      set(formTemplate, 'spec', {
        ...formTemplate.spec,
        ...spec,
      });
    }

    return store.edit({ id: name }, formTemplate);
  };
}

export default Edit;
