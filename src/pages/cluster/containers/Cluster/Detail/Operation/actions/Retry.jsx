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

const { operationStore } = rootStore;
export default class Index extends ConfirmAction {
  get id() {
    return 'retry';
  }

  get title() {
    return t('Retry');
  }

  get buttonText() {
    return t('Retry');
  }

  get actionName() {
    return t('retry');
  }

  get notAllowAction() {
    return ['BackupCluster', 'UpgradeCluster', 'RecoveryCluster'];
  }

  isFailedStatus = (item) => {
    const firstPage = operationStore.list.page;
    const firstData = operationStore.list.data[0];
    const { id, status } = item;
    if (
      firstPage === 1 &&
      firstData.id === id &&
      firstData.status === 'failed' &&
      !this.notAllowAction.includes(firstData.operationName)
    ) {
      return true;
    } else if (firstData.id === id && status === 'termination') {
      return true;
    }

    return false;
  };

  allowedCheckFunc = (item) => this.isFailedStatus(item);

  policy = () => 'clusters:edit';

  confirmContext = () =>
    t('Retry operation from the last failure, are you sure to retry?');

  submitSuccessMsg = (data) => {
    const name = this.getName(data);
    return t('Performing retry from falied operation: {name}', { name });
  };

  onSubmit = (data) => {
    const { id } = data;

    return operationStore.retry({ id });
  };
}
