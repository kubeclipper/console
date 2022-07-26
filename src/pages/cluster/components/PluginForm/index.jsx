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
import { observer } from 'mobx-react';
import Tabs from 'components/Tabs';
import { cloneDeep, isEmpty, get, set, isMatch } from 'lodash';
import RenderForm from './RenderForm';
import { Context } from './Context';
import Tips from 'pages/cluster/components/Tips';

const PluginForm = (props) => {
  const {
    templates = [],
    useTemplate = false,
    components,
    context,
    updateContext,
    value,
    onChange,
  } = props;
  const enabledStorageClass = get(context, 'storage.enableStorage') || [];
  const modules = components.filter((m) => m.category !== 'storage');

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
    const newTabs = cloneDeep(modules).map((item) => {
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

    setState({ ...state, tabs: newTabs, current: modules[0]?.name });
  }, []);

  const handleTabChange = (tab, index) => {
    // const form = value.currentForms;
    setState({ ...state, current: tab, tabIndex: index });
  };

  const handleFRChange = (name, formInstance, formData) => {
    if (typeof formData === 'object' && formData.pluginTemplate) {
      if (formData.pluginTemplate !== 'notUseTemplate') {
        const { flatData = {} } = templates.find(
          (item) => item.id === formData.pluginTemplate
        );
        if (!isMatch(formData, flatData)) {
          formInstance.setValues({
            ...formData,
            pluginTemplate: '',
          });
        }
      }
    }

    if (typeof formData === 'string') {
      if (formData === 'notUseTemplate') {
        const { baseFormData } = tabs.find((item) => item.name === current);
        formInstance.setValues({
          ...baseFormData,
          pluginTemplate: 'notUseTemplate',
          enable: true,
        });
      } else {
        const [{ flatData = {} }] = templates.filter(
          (item) => item.name === formData
        );
        formInstance.setValues({
          ...flatData,
          pluginTemplate: formData,
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
    onChange({ forms, currentForms: formInstance });
    updateContext({
      plugins: { forms, currentForms: formInstance },
    });
  };

  /**
   * schema 中 default，仅初次渲染生效，返回上一步，修改后值不会更新，需要 setValue
   * setValues 方法会导致值回显失效，使用 setValueByPath
   * @param {*} form
   */
  const onMount = (form) => {
    const defaultStorage = get(context, 'defaultStorage');

    form.setValueByPath(
      'storageClass',
      defaultStorage || enabledStorageClass[0]
    );
  };

  if (isEmpty(tabs)) return null;

  const TabItem = ({ tab }) => (
    <>
      {tab.category === 'paas' && <Tips />}
      <ItemForm tab={tab} />
    </>
  );

  const ItemForm = ({ tab }) => {
    if (
      isEmpty(enabledStorageClass) &&
      (tab?.dependence || []).includes('storage')
    ) {
      return null;
    }

    return (
      <RenderForm
        schema={tab.schema}
        name={current}
        value={tab.formData || {}}
        onChange={(name, formInstance, formData) =>
          handleFRChange(name, formInstance, formData)
        }
        onMount={onMount}
      />
    );
  };

  return (
    <Context.Provider value={{ context, updateContext }}>
      <Tabs
        tabs={tabs}
        current={current}
        onChange={handleTabChange}
        styles={{ paddingLeft: '10px' }}
      >
        {tabs.map((tab) => (
          <TabItem tab={tab} />
        ))}
      </Tabs>
    </Context.Provider>
  );
};

export default observer(PluginForm);
