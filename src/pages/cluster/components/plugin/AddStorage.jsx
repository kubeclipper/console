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

import React, { useEffect, useReducer, useRef } from 'react';
import Tabs from 'components/Tabs';
import styles from './index.less';
import RenderForm from './RenderForm';
import {
  cloneDeep,
  uniq,
  omit,
  set,
  assign,
  isArray,
  isMatch,
  orderBy,
} from 'lodash';
import { useParams, useHistory } from 'react-router-dom';
import { encodeProperty } from 'utils';
import Notify from 'components/Notify';

import classnames from 'classnames';
import { Forms } from 'components/Form';
import { useRootStore } from 'stores';
import { observer } from 'mobx-react';
import Footer from 'components/Footer';

const Storage = observer((props) => {
  const {
    clusterStore: store,
    templatesStore,
    storageComponents,
  } = useRootStore();
  const { state, setState } = props;
  const { id } = useParams();
  const { current, tabs, baseStorage, templates } = state;

  const checkScNameRepeat = (rule, value, callback) => {
    const scNames = uniq(store.scNames);

    if (scNames.length !== store.scNames.length) {
      callback('scName repeat');
    } else {
      callback();
    }
  };

  useEffect(() => {
    async function init() {
      const { storage = [] } = await store.updateDetail({ id });
      const _templates = await templatesStore.fetchListAll();

      const _baseStorage = storage
        .map((item) => item?.config?.scName)
        .filter((item) => !!item);

      const _baseStorageName = storage
        .map((item) => item?.name)
        .filter((item) => !!item);

      let newTabs = cloneDeep(storageComponents).map((item) => {
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

        const pluginTemplate = [
          ..._templates.filter((template) => template.pluginName === item.name),
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

        // unique true 表示只能安装一次
        const disabled =
          item.unique &&
          _baseStorageName.findIndex((name) => name === item.name) !== -1;

        return {
          ...item,
          state: 'Not Enabled',
          schemas: [item.schema],
          disabled,
          formData: [],
          formInstances: [],
        };
      });

      newTabs = orderBy(newTabs, ['deprecated'], 'asc');

      setState({
        ...state,
        tabs: newTabs,
        current: newTabs.find((item) => !item?.disabled)?.name,
        baseStorage: _baseStorage,
        storageComps: storageComponents,
        templates: _templates,
      });
    }
    init();
  }, [storageComponents]);

  const handleTabChange = async (tab) => {
    let isError = false;
    for (const item of state[current]) {
      if (item.formData.enable) {
        // eslint-disable-next-line no-await-in-loop
        const errfields = await item.submit();
        errfields.length && (isError = true);
      }
    }
    if (!isError) {
      setState({ ...state, current: tab });
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
        const { baseFormData } = tabs.find((item) => item.name === current);
        formInstance.setValues({
          ...baseFormData,
          pluginTemplate: 'notUseTemplate',
          enable: true,
        });
      }
    }

    let enableStorage = [];
    const allScName = [];

    tabs.forEach((item) => {
      if (item.name === name) {
        item.formData[index] = formData;
        item.formInstances[index] = formInstance;
        if (!item.baseFormData) {
          item.baseFormData = cloneDeep(formData);
        }
      }

      if (item.disabled) {
        item.state = t('Cannot be added repeatedly');
      } else {
        item.state = item.formData.some((_item) => _item.enable)
          ? 'Enabled'
          : 'Not Enabled';
      }

      item.formData.forEach((_item) => {
        if (_item.enable) {
          enableStorage.push(_item.scName);
          allScName.push(_item.scName);
        }
      });
      state[item.name] = item.formInstances;
    });

    enableStorage = uniq(enableStorage).filter((item) => item.length) || [];

    const allStorage = [...baseStorage, ...enableStorage];
    const endState = {
      ...state,
      enableStorage: allStorage,
      currentForms: state[name],
    };

    store.scNames = allStorage;
    setState(endState);
  };

  return (
    <Tabs tabs={tabs} current={current} onChange={handleTabChange}>
      {tabs.map((item, index) => (
        <div key={index} style={{ display: item.name !== current && 'none' }}>
          {item.schemas.map((schema, _index) => (
            <div key={_index} className={styles.item}>
              <RenderForm
                schema={schema}
                name={item.name}
                value={item.formData[_index]}
                onChange={(name, formInstance, formData, type) =>
                  handleFRChange(name, formInstance, formData, type, _index)
                }
              />
            </div>
          ))}
        </div>
      ))}
    </Tabs>
  );
});

function AddStorage() {
  const history = useHistory();
  const { id } = useParams();
  const { clusterStore: store } = useRootStore();
  const formRef = useRef();

  const [state, setState] = useReducer(
    (_state, newState) => ({ ..._state, ...newState }),
    {
      current: '',
      tabs: [],
      currentForms: [],
      enableStorage: [],
      baseStorage: [],
      storageComps: [],
      templates: [],

      options: [],
      confirmDisabled: true,
    }
  );

  const { tabs, confirmDisabled, enableStorage, currentForms } = state;

  useEffect(() => {
    let enable = true;
    for (const item of tabs) {
      for (const form of item.formData) {
        if (form.enable) {
          enable = false;
          break;
        }
      }
    }

    setState({
      confirmDisabled: enable,
    });
  }, [enableStorage]);

  const checkFormRenderInput = async () => {
    let isError = false;

    if (!currentForms) {
      return {
        isError: false,
      };
    }

    if (isArray(currentForms)) {
      for (const item of currentForms) {
        if (item.formData.enable) {
          // eslint-disable-next-line no-await-in-loop
          const errfields = await item.submit();
          errfields.length && (isError = true);
        }
      }
    } else {
      const errfields = await currentForms.submit();
      errfields.length && (isError = true);
    }

    return {
      isError,
      // values,
    };
  };

  const onOK = async () => {
    const { defaultStorage } = formRef.current.getFieldsValue();
    let enabledComponents = [];

    state.tabs.forEach(({ name, formData }) => {
      (formData || []).forEach((item) => {
        if (item.enable) {
          const s = {
            name,
            version: 'v1',
            config: assign(omit(item, 'enable'), {
              isDefaultSC: item.scName === defaultStorage,
            }),
          };

          enabledComponents.push(s);
        }
      });
    });

    enabledComponents = encodeProperty(state.storageComps, enabledComponents);
    // validate form
    const { isError } = await checkFormRenderInput();
    if (!isError) {
      // 请求接口
      try {
        await store.patchComponents(id, enabledComponents, false);
        // Notify.success(t('Role {name} has been created successfully.', { name }));
        history.push('/cluster');
      } catch (error) {
        Notify.error(error.reason);
      }
    }
  };

  const formItems = [
    [
      {
        name: 'storage',
        label: '',
        component: <Storage state={state} setState={setState} />,
        wrapperCol: {
          xs: {
            span: 24,
          },
          sm: {
            span: 18,
          },
        },
      },
    ],
    [
      {
        name: 'enableStorages',
        label: t('Enable Storages'),
        type: 'tags',
        tags: enableStorage,
      },
      {
        name: 'defaultStorage',
        label: t('Default Storage'),
        type: 'select',
        options: [
          ...enableStorage.map((item) => ({
            label: item,
            value: item,
          })),
          {
            label: t('No Setting'),
            value: false,
          },
        ],
      },
    ],
  ];

  return (
    <div className={classnames(styles.wrapper)}>
      <div className={classnames(styles.form, 'base-form')}>
        <Forms
          ref={formRef}
          formItems={formItems}
          labelCol={{
            xs: { span: 5 },
            sm: { span: 3 },
          }}
          wrapperCol={{
            xs: { span: 10 },
            sm: { span: 8 },
          }}
        />
        <Footer onOK={onOK} confirmDisabled={confirmDisabled} />
      </div>
    </div>
  );
}

export default observer(AddStorage);
