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
import { NodeStore } from 'stores/node';

export default class Delete extends ConfirmAction {
  get id() {
    return 'delete';
  }

  get title() {
    return t('Delete Node');
  }

  get buttonType() {
    return 'danger';
  }

  get buttonText() {
    return t('Delete');
  }

  get actionName() {
    return t('delete node');
  }

  policy = 'clusters:delete';

  isRoleZero = (data) => data.role === 0;

  // isDisabled = (data) => data.is_disabled;

  allowed = (data) => Promise.resolve(this.isRoleZero(data));

  confirmContext = (data) => {
    const name = this.getName(data);
    return t(
      'Are you sure to { action } {name}? the administrator must manually stop the systemd service corresponding to the client on the deleted node, otherwise the changed node will be automatically re-registered, it is recommended to use disable action.',
      { action: this.actionName || this.title, name }
    );
  };

  onSubmit = (item) => {
    const { node_id } = item || this.item;

    const store = new NodeStore();
    return store.delete({ id: node_id });
  };
}
