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

import React, { useEffect, useReducer } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import Tabs from 'components/Tabs';
import { cloneDeep, isEmpty, get, set, isMatch } from 'lodash';
import RenderForm from './RenderForm';
import { Context } from './Context';
import Tips from 'pages/cluster/components/Tips';
import { useRootStore } from 'stores';

const PluginForm = (props) => {
  const { clusterStore: store, pluginComponents } = useRootStore();
  const {
    templates = [],
    useTemplate = false,
    context,
    updateContext,
    value,
    onChange,
  } = props;
  const enabledStorageClass = get(context, 'storageEnable') || [];

  const [state, setState] = useReducer(
    (_state, newState) => ({ ..._state, ...newState }),
    {
      current: '',
      tabIndex: 0,
      tabs: [],
    }
  );
  const { current, tabs } = state;

  useEffect(() => {
    const newTabs = cloneDeep(pluginComponents).map((item) => {
      const { properties = {} } = item.schema;

      for (const key in properties) {
        if (Object.hasOwnProperty.call(properties, key)) {
          const ele = properties[key];
          ele.hidden = '{{formData.enable === false}}';
        }
      }

      // 存储类
      const storageClass = get(item.schema, 'properties.storageClass');

      set(item.schema, 'properties.storageClass', {
        ...storageClass,
        enum: enabledStorageClass,
        enumNames: enabledStorageClass,
        widget: 'select',
      });

      // plugin template
      if (useTemplate) {
        const pluginTemplate = [
          ...templates.filter((template) => template.pluginName === item.name),
          { name: 'notUseTemplate', templateName: t('Do not use Template') },
        ];
        set(item.schema, 'properties.pluginTemplate', {
          title: t('Plugin Template'),
          type: 'string',
          props: {},
          priority: 1,
          widget: 'select',
          enum: pluginTemplate.map((template) => template.name),
          enumNames: pluginTemplate.map((template) => template.templateName),
          hidden: '{{formData.enable === false}}',
        });
      }

      // cluster template
      let formData = {};
      if (context.availableComponents) {
        context.availableComponents.forEach((plugin) => {
          if (plugin.name === item.name) {
            formData = { ...plugin.config, enable: true };
          }
        });
      }

      return {
        ...item,
        formData,
        state: 'Not Enabled',
      };
    });

    if (context?.plugins?.state) {
      setState(context.plugins.state);
    } else {
      setState({ ...state, tabs: newTabs, current: pluginComponents[0]?.name });
    }
  }, [pluginComponents]);

  const handleTabChange = (tab, index) => {
    // const form = value.currentForms;
    setState({ ...state, current: tab, tabIndex: index });
  };

  const handleFRChange = (name, formInstance, formData, type) => {
    if (type) {
      if (formData.pluginTemplate !== 'notUseTemplate') {
        const selectedTemplate = templates.find(
          (item) => item.name === formData.pluginTemplate
        );
        if (!isMatch(formData, selectedTemplate.flatData)) {
          formInstance.setValues({
            ...selectedTemplate.flatData,
            pluginTemplate: formData.pluginTemplate,
            enable: true,
          });
        }
      } else {
        const { baseFormData } = tabs.find((item) => item.name === current);
        formInstance.setValues({
          ...baseFormData,
          pluginTemplate: 'notUseTemplate',
          enable: true,
        });
      }
    }

    tabs.forEach((item) => {
      if (item.name === name) {
        item.formData = formData;
        item.formInstances = formInstance;
      }

      item.state = item.formData.enable ? 'Enabled' : 'Not Enabled';
    });

    const forms = cloneDeep(value?.forms) || {};
    forms[name] = formInstance;
    onChange({ forms, currentForms: formInstance, state });
  };

  /**
   * schema 中 default，仅初次渲染生效，返回上一步，修改后值不会更新，需要 setValue
   * setValues 方法会导致值回显失效，使用 setValueByPath
   * @param {*} form
   */
  const onMount = async (form) => {
    await store.fetchList({ limit: -1 });

    const isHost = ({ addons = [] }) => {
      const result = addons.some(
        ({ config, name }) =>
          name === 'kubesphere' && config.clusterRole === 'host'
      );

      if (result) {
        return true;
      }

      return false;
    };
    const hostCluster = toJS(store.list.data).filter(isHost);
    const hostEnum = hostCluster.map(({ id }) => id);

    form.setSchemaByPath('HostClusterName', {
      widget: 'select',
      enum: hostEnum,
      enumNames: hostEnum,
    });

    const defaultStorage = get(context, 'defaultStorage');

    form.setValueByPath(
      'storageClass',
      defaultStorage || enabledStorageClass[0]
    );
  };

  if (isEmpty(tabs)) return null;

  return (
    <Context.Provider value={{ context, updateContext }}>
      <Tabs
        tabs={tabs}
        current={current}
        onChange={handleTabChange}
        styles={{ paddingLeft: '10px' }}
      >
        {tabs.map((tab, index) => (
          <div key={index} style={{ display: tab.name !== current && 'none' }}>
            {tab.category === 'PAAS' && <Tips />}
            <RenderForm
              schema={tab.schema}
              name={current}
              value={tab.formData || {}}
              onChange={(name, formInstance, formData, type) =>
                handleFRChange(name, formInstance, formData, type)
              }
              onMount={onMount}
            />
          </div>
        ))}
      </Tabs>
    </Context.Provider>
  );
};

export default observer(PluginForm);
