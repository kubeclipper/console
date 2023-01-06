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

const { cloudProviderStore } = rootStore;

export default class Sync extends ConfirmAction {
  get id() {
    return 'sync';
  }

  get title() {
    return t('Sync');
  }

  get buttonText() {
    return t('Sync');
  }

  get actionName() {
    return t('sync');
  }

  get isAsyncAction() {
    return true;
  }

  policy = 'cloudproviders:edit';

  confirmContext = (data) => {
    const name = this.getName(data);

    return (
      <div>
        {t('Are you sure to { action } all cluster data in provider {name}?', {
          action: this.actionName || this.title,
          name,
        })}
      </div>
    );
  };

  onSubmit = (item) => {
    const { name } = item || this.item;
    return cloudProviderStore.sync({ id: name });
  };
}
