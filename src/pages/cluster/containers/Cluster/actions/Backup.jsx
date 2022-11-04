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
import FORM_TEMPLATES from 'utils/form.templates';
import { set } from 'lodash';
import Notify from 'components/Notify';
import { isDisableByProviderType } from 'utils';

@observer
export default class Backup extends ModalAction {
  static id = 'back-up';

  static title = t('Backup Cluster');

  static actionType = 'notice';

  get name() {
    return t('Create Backup');
  }

  static checkNotice = (item) => {
    const { backupPoint } = item;
    if (!backupPoint) {
      Notify.error(t('Please add a backup space in the edit cluster'));
      return false;
    }
    return true;
  };

  init() {
    this.store = rootStore.backUpStore;
  }

  get defaultValue() {
    const { backupPoint } = this.item;

    return {
      backupPoint,
      name: '',
    };
  }

  static policy = 'clusters:edit';

  static isStatusRunning({ status }) {
    if (status === 'Running') {
      return true;
    }
    return false;
  }

  static allowed = (item) =>
    Promise.resolve(
      this.isStatusRunning(item) && !isDisableByProviderType(item)
    );

  get formItems() {
    return [
      {
        name: 'backupPoint',
        label: t('Backup Space'),
        type: 'label',
      },
      {
        name: 'name',
        label: t('Backup Name'),
        type: 'input',
        placeholder: t('Please input backup name'),
        required: true,
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'input',
        placeholder: t('Please input description'),
      },
    ];
  }

  get successText() {
    return t('{name} is backing up.', {
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

  onSubmit = (values) => {
    const { name, description } = values;

    const formTemplate = FORM_TEMPLATES.backups();

    set(formTemplate, 'metadata.name', name);
    set(
      formTemplate,
      'metadata.annotations["kubeclipper.io/description"]',
      description
    );

    return this.store.create(formTemplate, { cluster: this.cluster });
  };

  successCallback = () => this.store.fetchList({ cluster: this.cluster });
}
