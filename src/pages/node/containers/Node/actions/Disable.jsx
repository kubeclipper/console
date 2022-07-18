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

const { nodeStore } = rootStore;

export default class Disable extends ConfirmAction {
  get id() {
    return 'Disable';
  }

  get title() {
    return t('Disable Node');
  }

  get buttonType() {
    return 'danger';
  }

  get buttonText() {
    return t('Disable');
  }

  get actionName() {
    return t('disable node');
  }

  isRoleEmpty = (item) => {
    if (item.role !== '-') {
      return false;
    }
    return true;
  };

  isDisabled = (item) => item.disabled;

  allowed = (item) =>
    Promise.resolve(this.isDisabled(item) && this.isRoleEmpty(item));

  policy = 'clusters:delete';

  onSubmit = (item) => {
    const { id } = item || this.item;
    return nodeStore.disable(id);
  };
}
