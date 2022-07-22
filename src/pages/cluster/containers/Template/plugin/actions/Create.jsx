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
import { useParams, useHistory } from 'react-router';
import { useRootStore } from 'stores';
import { set, cloneDeep } from 'lodash';
import classnames from 'classnames';
import RenderForm from 'pages/cluster/components/PluginForm/RenderForm';
import { Context } from 'pages/cluster/components/PluginForm/Context';
import KubesphereTips from 'pages/cluster/components/KubesphereTips';

import Notify from 'components/Notify';
import Footer from 'components/Footer';
import { Forms } from 'components/Form';

import styles from './index.less';

const Plugin = (props) => {
  const { state, setState } = props;
  const { current } = state;
  const { currentPlugin, pluginInitVal } = state;
  const handleFRChange = (name, formInstance, formData) => {
    setState({
      ...state,
      currentInstance: formInstance,
      pluginInitVal: formData,
    });
  };

  return (
    <Context.Provider value={{ context: setState }}>
      {current === 'kubesphere' && <KubesphereTips />}
      <RenderForm
        schema={currentPlugin?.schema}
        name={currentPlugin?.name}
        useEnable={false}
        value={pluginInitVal}
        onChange={(name, formInstance, formData) =>
          handleFRChange(name, formInstance, formData)
        }
      />
    </Context.Provider>
  );
};

export default function AddPlugin() {
  const history = useHistory();
  const { clusterStore: store, templatesStore } = useRootStore();
  const formRef = useRef();
  const { plugin, name = '' } = useParams();

  const [state, setState] = useReducer(
    (_state, newState) => ({ ..._state, ...newState }),
    {
      current: '',
      currentPlugin: {},
      templateInitVal: {},
      pluginInitVal: {},
      isEdit: false,
      name: 'plugin',
      oldVals: {},
      currentInstance: null,
    }
  );

  useEffect(() => {
    async function init() {
      const comps = await store.fetchComponents();
      const pluginComps = cloneDeep(comps.find((it) => it.name === plugin));
      let templateInitVal = {};
      let pluginInitVal = {};
      let oldVals = {};
      if (name) {
        const vals = await templatesStore.query({
          fieldSelector: `metadata.name=${name}`,
        });
        const { templateDescription, templateName, flatData, _originData } =
          vals;

        templateInitVal = { templateName, templateDescription };
        pluginInitVal = flatData;
        oldVals = _originData;
      }

      delete pluginComps.schema.properties.isDefaultSC;
      if (pluginComps.name === 'kubesphere') {
        delete pluginComps.schema.properties.storageClass;
      }
      // pluginComps.schema.required = [];

      setState({
        ...state,
        current: pluginComps.name,
        currentPlugin: pluginComps,
        isEdit: !!name,
        templateInitVal,
        pluginInitVal,
        oldVals,
      });
      formRef.current.setFieldsValue(templateInitVal);
    }

    init();
  }, []);

  const onOK = async () => {
    const values = await formRef.current.validateFields();
    const errs = await state.currentInstance.submit();
    if (errs.length) return;

    const {
      name: pluginName,
      version: pluginVersion,
      category: pluginCategory,
    } = state.currentPlugin;

    const params = {
      templateName: values.templateName,
      templateDescription: values.templateDescription,
      pluginName,
      pluginVersion,
      pluginCategory,
      name,
    };

    set(state.oldVals, 'metadata.annotations', {
      'kubeclipper.io/display-name': values.templateName,
      'kubeclipper.io/description': values.templateDescription,
    });

    set(state.oldVals, 'config', state.pluginInitVal);

    try {
      if (state.isEdit) {
        await templatesStore.patch(name, state.oldVals);
      } else {
        await templatesStore.create(params, state.pluginInitVal);
      }
      history.push('/cluster/template');
    } catch (error) {
      Notify.error(error.reason);
    }
  };

  const formItems = [
    [
      {
        name: 'templateName',
        label: t('Template Name'),
        type: 'input',
        placeholder: t('Please input Template name'),
        required: true,
        labelCol: {
          xs: { span: 7 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 10 },
          sm: { span: 8 },
        },
      },
      {
        name: 'templateDescription',
        label: t('Description'),
        type: 'input',
        placeholder: t('Please input description!'),
        labelCol: {
          xs: { span: 7 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 10 },
          sm: { span: 8 },
        },
      },
    ],
    [
      {
        name: 'plugins',
        label: '',
        component: <Plugin state={state} setState={setState} />,
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 19 },
        },
      },
    ],
  ];

  return (
    <div className={classnames(styles.wrapper)}>
      <div className={classnames(styles.form, 'base-form')}>
        <Forms
          ref={formRef}
          formItems={formItems}
          name={state.name}
          initialValues={state.templateInitVal}
        />
        <Footer onOK={onOK} />
      </div>
    </div>
  );
}
