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
import React, { useEffect, useRef, useReducer } from 'react';
import classnames from 'classnames';
import Footer from 'components/Footer';
import { Forms } from 'components/Form';
import Notify from 'components/Notify';
import Tabs from 'components/Tabs';
import { cloneDeep, omit, isArray, get, set, isMatch } from 'lodash';
import Tips from 'pages/cluster/components/Tips';
import { Context } from 'pages/cluster/components/plugin/Context';
import { useParams, useHistory } from 'react-router';
import { useRootStore } from 'stores';
import RenderForm from './RenderForm';
import styles from './index.less';

const Plugin = (props) => {
  const { state, setState } = props;
  const { current, tabs, templates } = state;
  const {
    clusterStore: store,
    templatesStore,
    pluginComponents,
  } = useRootStore();

  const { id } = useParams();

  useEffect(() => {
    async function init() {
      const _templates = await templatesStore.fetchAll();

      const { storage = [] } = await store.updateDetail({ id });
      const enabledStorageClass = storage
        .map((item) => item?.config?.scName)
        .filter((item) => !!item);

      const newTabs = cloneDeep(pluginComponents).map((item) => {
        const { properties = {} } = item.schema;

        for (const key in properties) {
          if (Object.hasOwnProperty.call(properties, key)) {
            const ele = properties[key];
            ele.hidden = '{{formData.enable === false}}';
          }
        }

        const storageClass = get(item.schema, 'properties.storageClass');

        storageClass &&
          set(item.schema, 'properties.storageClass', {
            ...storageClass,
            enum: enabledStorageClass,
            enumNames: enabledStorageClass,
          });

        // plugin template
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

        return {
          ...item,
          state: 'Not Enabled',
          schemas: [item.schema],
          formData: [],
          formInstances: [],
          switchChecked: false,
        };
      });

      setState({
        ...state,
        tabs: newTabs,
        current: pluginComponents[0]?.name,
        templates: _templates,
      });
    }

    init();
  }, [pluginComponents]);

  const handleTabChange = (tab) => {
    setState({ ...state, current: tab });
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

    tabs.forEach((item) => {
      if (item.name === name) {
        item.formData[index] = formInstance.formData;
        item.formInstances[index] = formInstance;
      }

      item.state = item.formData.some((_item) => _item.enable)
        ? 'Enabled'
        : 'Not Enabled';

      state[item.name] = item.formInstances;
    });

    let enable = true;
    for (const item of tabs) {
      for (const form of item.formData) {
        if (form.enable) {
          enable = false;
          break;
        }
      }
    }

    const endState = {
      ...state,
      currentForms: state[name],
      confirmDisabled: enable,
    };
    setState(endState);
  };

  return (
    <Context.Provider value={{ context: tabs, setState }}>
      <Tabs tabs={tabs} current={current} onChange={handleTabChange}>
        {tabs.map((item) =>
          item.schemas.map((_item, _index) => (
            <>
              {item.name === 'kubesphere' && <Tips />}
              <RenderForm
                schema={_item}
                name={current}
                onChange={(name, formInstance, formData, type) =>
                  handleFRChange(name, formInstance, formData, type, _index)
                }
              />
            </>
          ))
        )}
      </Tabs>
    </Context.Provider>
  );
};

export default function AddPlugin() {
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
      confirmDisabled: true,
      templates: [],
    }
  );

  const { currentForms, confirmDisabled } = state;

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
    const enabledComponents = [];

    state.tabs.forEach(({ name, formData }) => {
      (formData || []).forEach((item) => {
        if (item.enable) {
          const s = {
            name,
            version: 'v1',
            config: omit(item, 'enable'),
          };

          enabledComponents.push(s);
        }
      });
    });

    const { isError } = await checkFormRenderInput();
    if (!isError) {
      try {
        await store.patchComponents(id, enabledComponents, false);
        history.push('/cluster');
      } catch (error) {
        Notify.error(error.reason);
      }
    }
  };

  const formItems = [
    [
      {
        name: 'plugins',
        label: '',
        component: <Plugin state={state} setState={setState} />,
        wrapperCol: {
          xs: {
            span: 24,
          },
          sm: {
            span: 19,
          },
        },
      },
    ],
  ];

  return (
    <div className={classnames(styles.wrapper)}>
      <div className={classnames(styles.form, 'base-form')}>
        <Forms ref={formRef} formItems={formItems} name={'plugins'} />
        <Footer onOK={onOK} confirmDisabled={confirmDisabled} />
      </div>
    </div>
  );
}
