/* eslint-disable no-unused-vars */
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
import { observer } from 'mobx-react';
import { ModalAction } from 'containers/Action';
import { toJS } from 'mobx';
import { rootStore } from 'stores';
import SelectWithInput from 'components/FormItem/SelectWithInput';
import { set, get } from 'lodash';
import { isDisableByProviderType } from 'utils';

@observer
class Registry extends ModalAction {
  init() {
    this.store = rootStore.clusterStore;
    this.registryStore = rootStore.registryStore;
    this.getRegistry();
  }

  static id = 'cluster-registry';

  static buttonText = t('CRI Registry');

  static title = t('CRI Registry');

  static policy = 'clusters:edit';

  static get modalSize() {
    return 'middle';
  }

  static isRunning = (item) => item.status === 'Running';

  static allowed = (item) =>
    Promise.resolve(this.isRunning(item) && !isDisableByProviderType(item));

  get name() {
    return t('Update CRI Registry');
  }

  get successText() {
    return t('Cluster {name} {action} successfully.', {
      action: this.name.toLowerCase(),
      name: this.instanceName,
    });
  }

  async getRegistry() {
    await this.registryStore.fetchList({
      limit: -1,
    });

    this.updateDefaultValue();
  }

  get defaultValue() {
    const { name } = this.item;
    const defaultRegistry = get(this.item, 'containerRuntime.registries') ?? [];

    const registries = defaultRegistry.map((it, index) => {
      if (it.insecureRegistry) {
        return {
          value: it.insecureRegistry,
          index,
        };
      }

      const existItem = this.registryData.find(
        (r) => it.registryRef === r.name
      );

      return {
        value: existItem?.host,
        index,
      };
    });

    return {
      name,
      registries,
    };
  }

  get registryData() {
    return toJS(this.registryStore.list.data);
  }

  get registryOptions() {
    return this.registryData.map(({ host, name }) => ({
      label: `${host} (${name})`,
      value: host,
    }));
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Cluster Name'),
        type: 'label',
      },
      {
        name: 'registries',
        label: t('Registry'),
        type: 'array-input',
        itemComponent: SelectWithInput,
        options: this.registryOptions,
      },
    ];
  }

  onSubmit = (values) => {
    const { registries } = values;
    const formTemplate = this.item._originData;

    const newRegistries = registries.map(({ value }) => {
      const existItem = this.registryData.find(({ host }) => host === value);
      return {
        insecureRegistry: existItem ? '' : value, // 新增 insecureRegistry 传
        registryRef: existItem ? existItem.name : '', // 已存在 registryRef 传 name
      };
    });

    set(formTemplate, 'containerRuntime.registries', newRegistries);
    const { name } = this.item;

    return this.store.edit({ id: name }, formTemplate);
  };
}

export default Registry;
