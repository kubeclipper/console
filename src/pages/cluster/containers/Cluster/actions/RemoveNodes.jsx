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
import { get } from 'lodash';
import { checkExpired, isDisableByProviderType } from 'utils';
import { getNodeRole } from 'resources/node';
import { rootStore } from 'stores';

const { clusterStore, nodeStore } = rootStore;

@observer
export default class RemoveNodes extends ModalAction {
  static id = 'remove';

  static title = t('Remove Nodes');

  static get modalSize() {
    return 'middle';
  }

  get name() {
    return t('Remove Nodes');
  }

  init() {
    this.store = nodeStore;
    this.clusterStore = clusterStore;
  }

  get labelCol() {
    return {
      xs: { span: 6 },
      sm: { span: 4 },
    };
  }

  get wrapperCol() {
    return {
      xs: { span: 18 },
      sm: { span: 20 },
    };
  }

  get backups() {
    return this.store.list.data || [];
  }

  get defaultValue() {
    const { name } = this.item;

    return {
      name,
    };
  }

  static policy = 'clusters:edit';

  static isStatusRunning(item) {
    if (item.status === 'Running') {
      return true;
    }
    return false;
  }

  static isLicensExpiration = (item) =>
    checkExpired(item.licenseExpirationTime);

  static allowed = (item) =>
    Promise.resolve(
      this.isLicensExpiration(item) &&
        this.isStatusRunning(item) &&
        !isDisableByProviderType(item)
    );

  get formItems() {
    const { name } = this.item;
    const labelSelector = `kubeclipper.io/cluster=${name}`;

    return [
      {
        name: 'name',
        label: t('Cluster'),
        type: 'label',
      },
      {
        name: 'nodes',
        label: t('RemoveNode'),
        type: 'select-table',
        required: true,
        isLoading: this.store.list.isLoading,
        isMulti: false,
        backendPageStore: this.store,
        extraParams: { labelSelector },
        tagKey: 'ip',
        searchFilters: [],
        disabledFunc: (item) => item.role === 'master',
        columns: [
          {
            title: t('Node IP'),
            dataIndex: 'ip',
            extraNameIndex: 'hostname',
            copyable: true,
          },
          {
            title: t('CPU'),
            dataIndex: 'cpu',
            isHideable: true,
          },
          {
            title: t('Memory'),
            dataIndex: 'memory',
            isHideable: true,
          },
          {
            title: t('Status'),
            dataIndex: 'status',
            render: (data) => data && t(data),
          },
          {
            title: t('Role'),
            dataIndex: 'role',
            render: (data) => getNodeRole(data) || '-',
          },
        ],
      },
    ];
  }

  get successText() {
    return t('{name} is removing.', {
      action: this.name,
      name: this.item.name,
    });
  }

  get errorText() {
    return t('Unable to {action}.', {
      action: this.name,
    });
  }

  get cluster() {
    return this.props.item.name;
  }

  onSubmit = async (values) => {
    const id = get(values, 'nodes.selectedRows[0].id');

    const params = {
      operation: 'remove',
      role: 'worker',
      nodes: [{ id }],
    };

    return this.clusterStore.addOrRemoveNode(this.item.id, params);
  };
}
