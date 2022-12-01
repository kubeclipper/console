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
import { observer } from 'mobx-react';
import { toJS } from 'mobx';
import { ModalAction } from 'containers/Action';
import { isEmpty } from 'lodash';
import SelectNodes from 'pages/cluster/components/SelectNodes';
import LabelInput from 'components/FormItem/LabelInput';
import { joinSelector } from 'utils';
import { formatNodesWithLabel } from 'resources/node';
import { rootStore } from 'stores';
import NodeStore from 'stores/node';

const { clusterStore } = rootStore;

@observer
export default class Add extends ModalAction {
  static id = 'add';

  static title = t('AddNode');

  static get modalSize() {
    return 'middle';
  }

  get name() {
    return t('AddNode');
  }

  init() {
    this.nodeStore = new NodeStore();
    this.clusterStore = clusterStore;
    this.fetchNodeList({
      'topology.kubeclipper.io/region': this.item.region,
    });
  }

  async fetchNodeList(params) {
    await this.nodeStore.fetchList({
      labelSelector: joinSelector({
        ...params,
        undefined: '!kubeclipper.io/nodeRole',
      }),
      limit: -1,
    });
  }

  static policy = 'clusters:edit';

  static isStatusRunning({ status }) {
    if (status === 'Running') {
      return true;
    }
    return false;
  }

  static allowed = (item) => Promise.resolve(this.isStatusRunning(item));

  get tableColumn() {
    return [
      {
        dataIndex: 'name',
        title: t('Cluster'),
      },
    ];
  }

  get dataSource() {
    const data = toJS(this.nodeStore.list.data);
    if (!isEmpty(data)) {
      return data.filter((item) => item.disabled);
    }
    return data;
  }

  get rightTransfers() {
    return [{ key: 'worker', title: t('Worker') }];
  }

  getSelectNodes() {
    return (
      <SelectNodes
        rightTransfers={this.rightTransfers}
        dataSource={this.dataSource}
        onChange={this.onNodeChange}
        nodeStore={this.nodeStore}
      />
    );
  }

  getTaintsDefaultValue(nodes) {
    const defaultMasterTaint = {
      key: 'node-role.kubernetes.io/master',
      value: '',
      effect: 'NoSchedule',
    };
    const masters = nodes.find((it) => it.key === 'master');

    if (masters && !isEmpty(masters.value)) {
      const defaultValue = masters.value.map((it, index) => {
        defaultMasterTaint.nodeId = it.id;
        return { index, value: defaultMasterTaint };
      });

      return defaultValue;
    }
    return [];
  }

  onNodeChange = (value) => {
    this.setState({
      nodes: value,
    });
  };

  get taintsNodes() {
    const { nodes = [] } = this.state;
    return nodes;
  }

  get formItems() {
    return [
      {
        name: 'nodes',
        label: t('Select Nodes'),
        required: true,
        component: this.getSelectNodes(),
        labelCol: {},
        wrapperCol: {},
      },
      {
        name: 'nodeLabels',
        label: t('Label Manage'),
        type: 'array-input',
        itemComponent: LabelInput,
        labelCol: {},
        wrapperCol: {},
        addText: t('Add Node Labels'),
        nodes: this.taintsNodes,
      },
    ];
  }

  get successText() {
    return t('Node {name} is being added to the cluster。', {
      name: this.item.ip,
    });
  }

  onSubmit = (values) => {
    const { id: clusterId } = this.item;
    const { worker } = formatNodesWithLabel(values);

    return this.clusterStore.addOrRemoveNode(clusterId, {
      operation: 'add',
      role: 'worker',
      nodes: worker,
    });
  };
}
