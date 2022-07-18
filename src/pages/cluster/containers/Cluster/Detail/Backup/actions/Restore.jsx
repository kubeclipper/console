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
import { ConfirmAction } from 'containers/Action';
import { rootStore } from 'stores';

const { backUpStore } = rootStore;

export default class Restore extends ConfirmAction {
  get id() {
    return 'restore';
  }

  get title() {
    return t('Restore');
  }

  get buttonText() {
    return t('Restore');
  }

  get actionName() {
    return t('restore');
  }

  policy = 'clusters:edit';

  isEnableStatus(item) {
    return item.status === 'available';
  }

  allowedCheckFunc = (item) => this.isEnableStatus(item);

  confirmContext = (data) => {
    const name = this.getName(data);
    return t('Are you sure to { action } cluster from {name}?', {
      action: this.actionName,
      name,
    });
  };

  submitSuccessMsg = (data) => {
    const name = this.getName(data);
    return t('{name} is restoring.', {
      name,
    });
  };

  get cluster() {
    return this.containerProps.detail.id;
  }

  onSubmit = async (item) => {
    const { name } = item || this.item;

    const data = {
      useBackupName: name,
    };
    await backUpStore.restore(data, { cluster: this.cluster });
  };
}
