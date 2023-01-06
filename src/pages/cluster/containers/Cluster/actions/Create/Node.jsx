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
import BaseForm from 'components/Form';
import { rootStore } from 'stores';
import { joinSelector } from 'utils';
import { isEmpty, flatten, isNumber, uniq } from 'lodash';
import TaintInput from 'components/FormItem/TaintInput';
import LabelInput from 'components/FormItem/LabelInput';
import { message } from 'antd';
import { subdomain } from 'utils/regex';
import SelectNodes from 'pages/cluster/components/SelectNodes';
import { nameMessage } from 'utils/validate';

const { nodeStore, regionStore } = rootStore;

@observer
export default class Node extends BaseForm {
  async init() {
    this.nodeStore = nodeStore;
    this.regionStore = regionStore;

    await this.getRegions();
    await this.fetchNodeList({
      'topology.kubeclipper.io/region': this.formDefaultValue.region,
    });
  }

  async getRegions() {
    if (this.formDefaultValue.region) return;

    const regionList = await this.regionStore.fetchList({ limit: -1 });
    this.updateContext({
      region: regionList[0]?.name,
    });
    this.updateDefaultValue();
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

  allowed = () => Promise.resolve();

  get isStep() {
    return true;
  }

  getTaintsDefaultValue(nodes) {
    if (isEmpty(nodes)) return [];

    return nodes.map((it, index) => {
      const defaultTaint = {
        key: 'node-role.kubernetes.io/master',
        value: '',
        effect: 'NoSchedule',
        nodeId: it.id,
      };
      return { index, value: defaultTaint };
    });
  }

  checkNodes = (rule, value) => {
    if (!value || isEmpty(value)) {
      return Promise.reject(t('Please select nodes!'));
    }

    const master = value.find((it) => it.key === 'master')?.value || [];

    if (isEmpty(master)) return Promise.reject(t('Please select master node!'));
    if (master.length % 2 === 0) {
      return Promise.reject(
        t('Please keep the number of master nodes to an odd number!')
      );
    }

    let values = [];
    value.forEach((item) => {
      values = [...values, ...item.value];
    });
    values = uniq(values.map((item) => item.nodeInfo.arch));
    if (values.length !== 1) {
      return Promise.reject(t('Please keep the CPU architecture consistent!'));
    }

    this.updateContext({ arch: values[0] });

    return Promise.resolve(true);
  };

  get regionOptions() {
    const data = toJS(this.regionStore.list.data) || [];
    return data.map((it) => ({
      value: it.id,
      label: it.name,
    }));
  }

  get templateOptions() {
    const { templates = [] } = this.props.context;
    const currentTemplates = templates.filter(
      (item) =>
        item.pluginName === 'kubernetes' && item.pluginCategory === 'kubernetes'
    );

    return currentTemplates.map((it) => ({
      value: it.id,
      label: it.templateName,
    }));
  }

  get dataSource() {
    const data = toJS(this.nodeStore.list.data);
    if (!isEmpty(data)) {
      return data.filter((item) => item.disabled);
    }
    return data;
  }

  getConuts = (nodes = []) => {
    let conuts = 0;
    nodes.forEach((x) => {
      conuts += x.value.length;
    });

    return conuts;
  };

  getMaster = (value) => value.find((it) => it.key === 'master')?.value || [];

  onNodeChange = (value) => {
    const { taints } = this.state;
    const prevNodes = this.props.context?.nodes ?? [];

    this.updateContext({ nodes: value });

    if (this.getConuts(value) > this.getConuts(prevNodes)) {
      // master 节点自动添加默认污点，{key: "node-role.kubernetes.io/master",value: "",effect: "NoSchedule"}
      // 获取新增 master 节点的 defaultTaint
      const newAddMasterNodes = this.getMaster(value).filter(
        (x) => !this.getMaster(prevNodes).some((y) => x.id === y.id)
      );

      if (newAddMasterNodes.length === 0) return;

      const taintsValue = this.getTaintsDefaultValue(newAddMasterNodes);

      const CURRENT_TAINTS_LENGTH = taints.length;
      const addedNodes = taintsValue.map((it, index) => ({
        ...it,
        index: index + CURRENT_TAINTS_LENGTH,
      }));

      this.updateFormValue('taints', [...taints, ...addedNodes]);
    } else {
      const selectedNodes = flatten(value.map((it) => it.value));
      const newTaints = taints.filter((x) =>
        selectedNodes.some((y) => x.value.nodeId === y.id)
      );

      this.updateFormValue('taints', newTaints);
    }

    // 关联 labels，移除 A 节点，已添加的 A 节点的标签同步移除
    this.updateLabels(value);
  };

  updateLabels(value) {
    const selectedNodes = flatten(value.map((it) => it.value));

    const form = this.getFormInstance();
    const formValue = form.getFieldValue('nodeLabels');

    const newFormValue = formValue
      .map((it) => it.value)
      .filter((x) => selectedNodes.some((y) => x.nodeId === y.id))
      .map((rt, index) => ({ index, value: rt }));

    this.updateFormValue('nodeLabels', newFormValue);
  }

  getSelectNodes() {
    return (
      <SelectNodes
        dataSource={this.dataSource}
        onChange={this.onNodeChange}
        nodeStore={this.nodeStore}
      />
    );
  }

  onRegionChange = (region) => {
    this.fetchNodeList({
      'topology.kubeclipper.io/region': region,
    });
  };

  onTemplateChange = (template) => {
    const { templates = [] } = this.props.context;
    const { flatData, templateName } = templates.find(
      (item) => item.id === template
    );

    this.updateContext({
      ...flatData,
      useTemplate: true,
      templateName,
    });
  };

  handleTaintChange = (values) => {
    this.setState({
      taints: values,
    });
  };

  checkName = (rule, value) => {
    const { isPrev } = this.state;

    if (!value) {
      if (isPrev) return Promise.resolve(true);

      message.error(t('Please input cluster name'));
      return Promise.reject(t('Please input cluster name'));
    }

    if (isNumber(value)) {
      return Promise.reject(t('The name cannot be all numbers'));
    }

    if (!subdomain.test(value)) {
      return Promise.reject(nameMessage);
    }

    return Promise.resolve(true);
  };

  get formItems() {
    const { nodes = [] } = this.props.context;
    return [
      [
        {
          name: 'name',
          label: t('Cluster Name'),
          type: 'input',
          placeholder: t('Please input cluster name'),
          maxLength: 32,
          required: true,
          validator: this.checkName,
        },
        {
          name: 'clusterTemplate',
          label: t('Cluster Template'),
          type: 'select',
          options: this.templateOptions,
          onChange: this.onTemplateChange,
        },
      ],
      [
        {
          name: 'region',
          label: t('Region'),
          type: 'select',
          options: this.regionOptions,
          onChange: this.onRegionChange,
          required: true,
        },
        {
          name: 'nodes',
          label: t('Select Nodes'),
          required: true,
          component: this.getSelectNodes(),
          wrapperCol: {
            xs: {
              span: 24,
            },
            sm: {
              span: 18,
            },
          },
          validator: this.checkNodes,
        },
      ],
      [
        {
          name: 'taints',
          label: t('Taint Manage'),
          type: 'array-input',
          itemComponent: TaintInput,
          wrapperCol: {
            xs: {
              span: 24,
            },
            sm: {
              span: 18,
            },
          },
          addText: t('Add Taints'),
          nodes,
          tip: t(
            'Master cannot be scheduled. It is recommended to remove mater taints in allinone, otherwise cluster maybe create fail.'
          ),
          onChange: this.handleTaintChange,
        },
        {
          name: 'nodeLabels',
          label: t('Node Labels'),
          type: 'array-input',
          itemComponent: LabelInput,
          width: '75%',
          wrapperCol: {
            xs: {
              span: 24,
            },
            sm: {
              span: 18,
            },
          },
          addText: t('Add Labels'),
          nodes,
        },
      ],
    ];
  }
}
