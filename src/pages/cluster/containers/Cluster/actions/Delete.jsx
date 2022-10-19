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
import React from 'react';
import { rootStore } from 'stores';
import { failedStatus } from 'resources/cluster';
import { isDisableByProviderType } from 'utils';

import styles from './index.less';

const { clusterStore } = rootStore;

export default class DeleteAction extends ConfirmAction {
  get id() {
    return 'delete';
  }

  get title() {
    return t('Delete Cluster');
  }

  get buttonType() {
    return 'danger';
  }

  get buttonText() {
    return t('Delete Cluster');
  }

  get actionName() {
    return t('delete cluster');
  }

  policy = 'clusters:delete';

  width = 680;

  isRunning(item) {
    return item.status === 'Running';
  }

  isFailed(item) {
    return failedStatus.includes(item.status);
  }

  allowedCheckFunc = (item) =>
    (this.isRunning(item) || this.isFailed(item)) &&
    !isDisableByProviderType(item, ['kubeadm']);

  confirmContext = (data) => {
    const name = this.getName(data);

    return (
      <div className={styles.wrapper}>
        <div className={styles['warn-text']}>
          {t(
            'Cluster cannot be recovered after deleted, please operate with caution.'
          )}
          <br />
          {t(
            'The volume in the storage class with the recycling policy of "reserved" will be retained. You can access it in other ways or manually clear it.'
          )}
          <br />
          {t(
            'The volume in the storage class with recycling policy is "delete" will be automatically deleted when the cluster is deleted.'
          )}
        </div>
        {t('Are you sure to { action } {name}?', {
          action: this.actionName || this.title,
          name,
        })}
      </div>
    );
  };

  onSubmit = (item) => {
    const { name } = item || this.item;
    return clusterStore.delete({ id: name });
  };
}
