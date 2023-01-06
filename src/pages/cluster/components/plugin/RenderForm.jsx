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

import React, { useEffect, useMemo } from 'react';
import { message } from 'antd';
import { useForm } from 'form-render';
import FR from 'components/FormRender';
import { computeSchema, getSchema } from 'utils/schemaForm';
import { uiSchemas } from './uiSchemas';
import { isEmpty } from 'lodash';

const RenderForm = (props) => {
  const {
    name,
    schema = {},
    value,
    onChange,
    onMount,
    useEnable = true,
  } = props;

  const form = useForm({
    logOnMount: () => {
      form.setValues(value);
    },
  });

  useEffect(() => {
    form.setValues(value);
  }, []);

  const _schema = useMemo(() => {
    const cacheSchema = computeSchema(
      schema,
      getSchema(uiSchemas, name, useEnable)
    );

    return cacheSchema;
  }, [name]);

  const watch = {
    // # 为全局
    '#': {
      handler: (formData) => {
        if (!isEmpty(formData)) {
          onChange(name, form, formData);
        }
      },
      immediate: false,
    },
    pluginTemplate: {
      handler: (val) => {
        val && onChange(name, form, form.formData, 'plugin');
      },
      immediate: false,
    },
  };

  const handleOnMount = () => {
    onMount && onMount(form);
  };

  const onFinish = (data, errors) => {
    if (errors.length > 0) {
      const msg = JSON.stringify(errors.map((item) => item.name));
      message.error(t('Invalid: {name}', { name: msg }));
    }
  };

  return (
    <div style={{ paddingLeft: '14px' }}>
      <FR
        form={form}
        schema={_schema}
        watch={watch}
        onMount={handleOnMount}
        onFinish={onFinish}
      />
    </div>
  );
};

export default RenderForm;
