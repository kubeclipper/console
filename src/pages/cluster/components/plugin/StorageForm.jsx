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

import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import Tabs from 'components/Tabs';
import { cloneDeep, uniq, set, isMatch, isEmpty, orderBy } from 'lodash';
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
  const { storageComponents } = useRootStore();
  const {
    storageCurrent = '',
    storageTabs = [],
    storageTabIndex = 0,
    availableComponents,
  } = context;

  const checkScNameRepeat = (rule, value, callback) => {
    const scNames = uniq(store.scNames);

    if (scNames.length !== store.scNames.length) {
      callback('scName repeat');
    } else {
      callback();
    }
  };

  useEffect(() => {
    if (!isEmpty(storageTabs)) return;

    let newTabs = cloneDeep(storageComponents).map((item) => {
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
      if (availableComponents) {
        availableComponents.forEach((plugin) => {
          if (plugin.name === name) {
            formData.push({ ...plugin.config, enable: true });
          }
        });
      }

      const schemas = Array(formData.length || 1).fill(item.schema);

      return {
        ...item,
        state: 'Not Enabled',
        schemas,
        isAddMore: !item.unique,
        formData,
        formInstances: [],
      };
    });
    newTabs = orderBy(newTabs, ['deprecated'], 'asc');

    updateContext({
      storageCurrent: newTabs[0]?.name,
      storageTabs: newTabs,
    });
  }, [storageComponents]);

  const handleTabChange = async (tab, index) => {
    let isError = false;
    const currentForms = storageTabs.find(
      (item) => item.name === storageCurrent
    ).formInstances;

    for (const item of currentForms) {
      if (item.formData.enable) {
        // eslint-disable-next-line no-await-in-loop
        const errfields = await item.submit();
        errfields.length && (isError = true);
      }
    }
    if (!isError) {
      updateContext({
        storageCurrent: tab,
        storageTabIndex: index,
      });
    }
  };

  const handleFRChange = (name, formInstance, formData, type, index) => {
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
        const { baseFormData } = storageTabs.find(
          (item) => item.name === storageCurrent
        );
        formInstance.setValues({
          ...baseFormData,
          pluginTemplate: 'notUseTemplate',
          enable: true,
        });
      }
    }

    const enableStorage = [];
    const allScName = [];

    const _tabs = cloneDeep(storageTabs);
    _tabs.forEach((item) => {
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

    store.scNames = allScName;

    const currentForms = storageTabs.find(
      (item) => item.name === storageCurrent
    ).formInstances;

    onChange({
      currentForms,
    });

    updateContext({
      storageTabs: _tabs,
      storageEnable: uniq(enableStorage),
    });
  };

  const handleAdd = async () => {
    const _tabs = storageTabs.map((item) => {
      if (item.name === storageCurrent) {
        item.schemas.push(item.schema);
      }
      return item;
    });

    updateContext({
      storageTabs: _tabs,
    });
  };

  const handleRemove = async () => {
    const _tabs = storageTabs.map((item) => {
      if (item.name === storageCurrent) {
        item.schemas.pop();
        item.formData.pop();
        item.formInstances.pop();
      }
      return item;
    });

    updateContext({
      storageTabs: _tabs,
    });
  };

  const isShowAddMore = storageTabs[storageTabIndex]?.formData.some(
    ({ enable }) => enable
  );

  return (
    <Context.Provider value={{ context, updateContext }}>
      <Tabs
        tabs={storageTabs}
        current={storageCurrent}
        onChange={handleTabChange}
      >
        {storageTabs.map((item, index) => (
          <div
            key={index}
            style={{ display: item.name !== storageCurrent && 'none' }}
          >
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
                  onChange={(name, formInstance, formData, type) =>
                    handleFRChange(name, formInstance, formData, type, _index)
                  }
                />
                {item.isAddMore && isShowAddMore && <Divider dashed />}
              </div>
            ))}
          </div>
        ))}
        {storageTabs[storageTabIndex]?.isAddMore && isShowAddMore && (
          <Button onClick={handleAdd}>{t('Add More')}</Button>
        )}
      </Tabs>
    </Context.Provider>
  );
};

export default observer(StorageForm);
