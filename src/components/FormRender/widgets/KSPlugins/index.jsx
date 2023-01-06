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

import React, { useEffect, useContext, useState } from 'react';
import { Switch } from 'antd';
import FR from 'components/FormRender';
import { useForm } from 'form-render';
import { get, isEmpty, values } from 'lodash';
import { Context } from 'pages/cluster/components/plugin/Context';

import styles from './index.less';

/**
 * 自定义 KSPlugins
 * object 类型 widget，children 无法透传，内部维护 FR，通过 getValue、setValueByPath 同步
 * @param {*} props
 * @returns
 */
export default function KSPlugins(props) {
  const { schema, addons } = props;
  const { context = {} } = useContext(Context);
  // eslint-disable-next-line no-unused-vars
  const { setValueByPath, getValue } = addons;

  const form = useForm(); // 组件内部表单
  const [switchChecked, setSwitchChecked] = useState(false);

  const handleSwitchChecked = (obj) => {
    const checked = values(obj).every((item) => item);
    setSwitchChecked(checked);
  };

  useEffect(() => {
    form.setValues(props.value);
  }, [props.value]);

  // 同步父表单值
  useEffect(() => {
    // TODO: 未生效, 应该用此方式
    // form.setValues({ ...getValue(schema.$id) });
    if (!isEmpty(context)) {
      const initPluginValue = get(
        context,
        'plugins.forms.kubesphere.formData.plugin'
      );
      form.setValues(initPluginValue);
    } else {
      handleSwitchChecked(addons.formData.plugin);
      form.setValues(addons.formData.plugin);
    }
  }, []);

  const watch = {
    '#': (formData) => {
      if (!isEmpty(formData)) {
        handleSwitchChecked(formData);
        setValueByPath(schema.$id, formData); // 设置父表单值
      }
    },
  };

  const handleChange = (checked) => {
    const formData = Object.keys(form.formData).reduce((result, key) => {
      result[key] = checked;
      return result;
    }, {});

    form.setValues(formData);
    // 设置父表单值
    setValueByPath(schema.$id, formData);
    setSwitchChecked(!switchChecked);
  };

  const { properties = {} } = schema;

  for (const key in properties) {
    if (Object.hasOwnProperty.call(properties, key)) {
      const element = properties[key];
      element.width = '30%';
    }
  }

  return (
    <div className={styles.wrapper}>
      <Switch
        checkedChildren={t('On')}
        unCheckedChildren={t('Off')}
        // defaultChecked
        checked={switchChecked}
        onChange={handleChange}
      />
      <div className={styles.content}>
        <FR form={form} schema={{ properties, type: 'object' }} watch={watch} />
      </div>
    </div>
  );
}
