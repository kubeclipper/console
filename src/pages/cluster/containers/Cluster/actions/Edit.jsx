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
import KeyValueInput from 'components/FormItem/KeyValueInput';
import { ModalAction } from 'containers/Action';
import { set, get, omit, pick } from 'lodash';
import { observer } from 'mobx-react';
import { rootStore } from 'stores';
import {
  arrayInput2Label,
  label2ArrayInput,
  isDisableByProviderType,
} from 'utils';
import { isIp } from 'utils/validate';

@observer
class Edit extends ModalAction {
  init() {
    this.store = rootStore.clusterStore;
    this.backupPointStore = rootStore.backupPointStore;
    this.getBackupPointData();
  }

  static id = 'cluster-edit';

  static buttonText = t('Edit');

  static title = t('Edit Cluster');

  static policy = 'clusters:edit';

  static get modalSize() {
    return 'middle';
  }

  static isRunning = (item) => item.status === 'Running';

  static allowed = (item) => Promise.resolve(this.isRunning(item));

  get defaultValue() {
    const { name, description, metadata, backupPoint } = this.item;
    const externalIP = get(
      this.item,
      'metadata.labels["kubeclipper.io/externalIP"]'
    );

    const labels = label2ArrayInput(
      omit(metadata.labels, [
        'kubeclipper.io/externalIP',
        'topology.kubeclipper.io/region',
        'kubeclipper.io/clusterProviderName',
        'kubeclipper.io/clusterProviderType',
      ])
    );

    return {
      name,
      description,
      externalIP,
      labels,
      backupPoint,
    };
  }

  get getBackupPointOptions() {
    const options = (this.backupPointStore.list.data || []).map((item) => ({
      value: item.name,
      label: item.name,
    }));
    return options;
  }

  getBackupPointData() {
    this.backupPointStore.fetchList();
  }

  checkLabels = (rule, value = []) => {
    const checkFunc = (item) => {
      if (!item) return true;
      if ((item.key && item.value) || (!item.key && !item.value)) {
        return true;
      }
      return false;
    };

    const isInValide = value.some((it) => !checkFunc(it.value));

    if (isInValide) {
      return Promise.reject(t('Please enter legal label'));
    }

    return Promise.resolve(true);
  };

  checkIP = async (_, value) => {
    if (value && !isIp(value)) {
      return Promise.reject(t('IP invalid'));
    }
    return Promise.resolve();
  };

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Cluster Name'),
        type: 'label',
      },
      {
        name: 'description',
        label: t('description'),
        type: 'input',
      },
      !isDisableByProviderType(this.item) && {
        name: 'backupPoint',
        label: t('Backup Space'),
        type: 'select',
        options: this.getBackupPointOptions,
      },
      {
        name: 'externalIP',
        label: t('External Access IP'),
        type: 'ip-input',
        tip: t('Set up a floating IP for end users to access.'),
        validator: this.checkIP,
      },
      {
        name: 'labels',
        label: t('Labels'),
        type: 'array-input',
        itemComponent: KeyValueInput,
        validator: this.checkLabels,
      },
    ];
  }

  onSubmit = (values) => {
    const formTemplate = this.item._originData;

    const { description, externalIP, labels, backupPoint } = values;
    const { name, resourceVersion } = this.item;

    set(
      formTemplate,
      'metadata.annotations["kubeclipper.io/description"]',
      description
    );

    const pickLabels = [
      'topology.kubeclipper.io/region',
      'kubeclipper.io/clusterProviderName',
      'kubeclipper.io/clusterProviderType',
    ];
    set(formTemplate, 'metadata.labels', {
      ...pick(formTemplate.metadata.labels, pickLabels),
      ...(externalIP ? { 'kubeclipper.io/externalIP': externalIP } : {}),
      ...arrayInput2Label(labels),
      ...(backupPoint ? { 'kubeclipper.io/backupPoint': backupPoint } : {}),
    });

    return this.store.edit({ id: name, resourceVersion }, formTemplate);
  };
}

export default Edit;
