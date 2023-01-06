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
import { isMaster } from 'resources/cluster';
import { isArray } from 'lodash';

const { clusterStore } = rootStore;

export default class Remove extends ConfirmAction {
  get id() {
    return 'remove';
  }

  get title() {
    return t('RemoveNode');
  }

  get buttonType() {
    return 'danger';
  }

  get buttonText() {
    return t('Remove');
  }

  get actionName() {
    return t('RemoveNode');
  }

  policy = 'clusters:edit';

  combineBatch = true;

  isBatch = false;

  getName = (data) =>
    isArray(data)
      ? data.map((it) => `${it.hostname}(${it.ip})`).join(', ')
      : `${data.hostname}(${data.ip})`;

  isRunning(item) {
    return item.status === 'Running';
  }

  allowedCheckFunc = (item) => {
    const { role } = item;

    const isUnknownStatus = item.status === 'Unknown';
    const { detail } = this.containerProps;

    return !isMaster(role) && !isUnknownStatus && this.isRunning(detail);
  };

  allowed = (data) => {
    if (isArray(data)) {
      return Promise.all(
        data.map((it) => Promise.resolve(this.allowedCheckFunc(it)))
      );
    }
    return Promise.resolve(this.allowedCheckFunc(data));
  };

  submitSuccessMsg = (data) => {
    const name = this.getName(data);
    return t('Node {name} is being deleted.', { name });
  };

  onSubmit = (data) => {
    const { detail } = this.containerProps;
    let nodes;
    if (isArray(data)) {
      nodes = data.map((it) => ({ id: it.id }));
    } else {
      nodes = [{ id: data.id }];
    }

    const params = {
      operation: 'remove',
      role: 'worker',
      nodes,
    };
    return clusterStore.addOrRemoveNode(detail.id, params);
  };
}
