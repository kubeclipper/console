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

export default class Enable extends ConfirmAction {
  get id() {
    return 'Enable';
  }

  get title() {
    return t('Enable Node');
  }

  get buttonText() {
    return t('Enable');
  }

  get actionName() {
    return t('enable node');
  }

  isDisabled = (item) => !item.disabled;

  allowed = (item) => Promise.resolve(this.isDisabled(item));

  policy = 'clusters:delete';

  onSubmit = (item) => {
    const { id } = item || this.item;
    return nodeStore.enable(id);
  };
}
