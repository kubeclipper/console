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

const { clusterStore } = rootStore;

export default class RemovePlugin extends ConfirmAction {
  get id() {
    return 'remove';
  }

  get title() {
    return t('Remove');
  }

  get buttonType() {
    return 'danger';
  }

  get buttonText() {
    return t('Remove');
  }

  get isAsyncAction() {
    return true;
  }

  policy = 'clusters:edit';

  getName = (data) => {
    const [component] = data.component;
    return component.name || '';
  };

  onSubmit = async (item) => {
    const { name, component, uninstall } = item;
    await clusterStore.patchComponents(name, component, uninstall);
    await clusterStore.fetchDetail({ id: name });
    return Promise.resolve(true);
  };
}
