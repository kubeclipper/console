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
import { cloneDeep, uniq, get, set, isMatch } from 'lodash';
import { filterComponents } from 'utils/schemaForm';
import RenderForm from './RenderForm';
import { Divider, Button } from 'antd';
import { Context } from './Context';
import { MinusCircleFilled } from '@ant-design/icons';
import { useRootStore } from 'stores';

import styles from './index.less';

const StorageForm = (props) => {
  const {
    templates = [],
    useTemplate = false,
    context,
    updateContext,
    onChange,
    store,
  } = props;
  const { clusterStore } = useRootStore();

  const [state, setState] = useReducer(
    (_state, newState) => ({ ..._state, ...newState }),
    {
      current: '',
      tabs: [],
      tabIndex: 0,
      currentForms: [],
      enableStorage: [],
    }
  );
  const { current, tabs, tabIndex } = state;

  const checkScNameRepeat = (rule, value, callback) => {
    const scNames = uniq(store.scNames);

    if (scNames.length !== store.scNames.length) {
      callback('scName repeat');
    } else {
      callback();
    }
  };

  useEffect(() => {
    let components = clusterStore.components.filter(
      (it) => it.category === 'storage'
    );
    components = filterComponents(components);

    const newTabs = cloneDeep(components).map((item) => {
      const { name } = item;
      const { properties = {} } = item.schema;

      delete properties.isDefaultSC;
      // eslint-disable-next-line guard-for-in
      for (const key in properties) {
        if (Object.hasOwnProperty.call(properties, key)) {
          const ele = properties[key];
          ele.hidden = '{{formData.enable === false}}';
        }
        if (key === 'scName') {
          properties.scName.rules = [
            {
              validator: checkScNameRepeat,
            },
          ];
        }
      }

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
      const formData = [];
      if (context.availableComponents) {
        context.availableComponents.forEach((plugin) => {
          if (plugin.name === name) {
            formData.push({ ...plugin.config, enable: true });
          }
        });
      }
      return {
        ...item,
        state: 'Not Enabled',
        schemas: [item.schema],
        isAddMore: item.name === 'nfs-provisioner',
        formData,
        formInstances: [],
      };
    });

    if (context.storage) {
      setState(context.storage);
    } else {
      const data = { ...state, tabs: newTabs, current: components[0]?.name };
      setState(data);
    }
  }, []);

  const handleTabChange = async (tab, index) => {
    let isError = false;
    const currentForms = tabs.find(
      (item) => item.name === current
    ).formInstances;

    for (const item of currentForms) {
      if (item.formData.enable) {
        // eslint-disable-next-line no-await-in-loop
        const errfields = await item.submit();
        errfields.length && (isError = true);
      }
    }
    if (!isError) {
      setState({ ...state, current: tab, tabIndex: index });
    }
  };

  const handleFRChange = (name, formInstance, formData, index) => {
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

    let enableStorage = [];
    const allScName = [];

    const _tabs = tabs.map((item) => {
      const _item = { ...item };

      if (item.name === name) {
        _item.formInstances[index] = formInstance;
        _item.formData[index] = formInstance.formData;
      }

      item.state = item.formData.some((formItem) => formItem.enable)
        ? 'Enabled'
        : 'Not Enabled';

      item.formData.forEach((formItem) => {
        if (formItem.enable) {
          enableStorage.push(formItem.scName);
          allScName.push(formItem.scName);
        }
      });

      return _item;
    });

    enableStorage = uniq(enableStorage);
    const endState = {
      ...state,
      tabs: _tabs,
      enableStorage,
      currentForms: _tabs.find((item) => item.name === name).formInstances,
    };

    store.scNames = allScName;
    setState(endState);
    onChange(endState);

    updateContext({
      enableStorage,
      storage: endState,
    });
  };

  const handleAdd = async () => {
    const _tabs = tabs.map((item) => {
      if (item.name === current) {
        item.schemas.push(item.schema);
      }
      return item;
    });

    setState({
      ...state,
      tabs: _tabs,
    });
  };

  const handleRemove = async () => {
    const _tabs = tabs.map((item) => {
      if (item.name === current) {
        item.schemas.pop();
        item.formData.pop();
        item.formInstances.pop();
      }
      return item;
    });

    setState({
      ...state,
      tabs: _tabs,
    });
  };

  let isShowAddMore = false;
  get(state, 'currentForms', []).forEach((it) => {
    if (it.formData.enable) {
      isShowAddMore = true;
    }
  });

  return (
    <Context.Provider value={{ context, updateContext }}>
      <Tabs tabs={tabs} current={current} onChange={handleTabChange}>
        {tabs.map((item, index) => (
          <div key={index} style={{ display: item.name !== current && 'none' }}>
            {item.schemas.map((_item, _index) => (
              <div key={_index} className={styles.item}>
                {_index > 0 && (
                  <Button
                    type="link"
                    className={styles['remove-btn']}
                    onClick={handleRemove}
                  >
                    <MinusCircleFilled />
                  </Button>
                )}
                <RenderForm
                  schema={_item}
                  name={item.name}
                  value={item.formData[_index]}
                  onChange={(name, formInstance, formData) =>
                    handleFRChange(name, formInstance, formData, _index)
                  }
                />
                {tabs[tabIndex]?.isAddMore && isShowAddMore && (
                  <Divider dashed />
                )}
              </div>
            ))}
          </div>
        ))}
        {tabs[tabIndex]?.isAddMore && isShowAddMore && (
          <Button onClick={handleAdd}>{t('Add More')}</Button>
        )}
      </Tabs>
    </Context.Provider>
  );
};

export default observer(StorageForm);
