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
import React from 'react';
import Tips from 'components/Tips';
import { ConfirmAction } from 'containers/Action';
import { rootStore } from 'stores';

const { cloudProviderStore } = rootStore;

export default class Remove extends ConfirmAction {
  get id() {
    return 'delete';
  }

  get title() {
    return t('Remove');
  }

  get actionName() {
    return t('remove');
  }

  get buttonType() {
    return 'danger';
  }

  policy = 'cloudproviders:edit';

  confirmContext = (data) => {
    const name = this.getName(data);

    return (
      <div>
        <Tips
          content={t(
            'Removing the provider will remove all cluster data under the provider on platform, please operate with caution.'
          )}
        />
        {t(
          'Are you sure to {action} provider {name} and {action} all cluster data?',
          {
            action: this.actionName || this.title,
            name,
          }
        )}
      </div>
    );
  };

  onSubmit = (item) => {
    const { name } = item || this.item;
    return cloudProviderStore.delete({ id: name });
  };
}
