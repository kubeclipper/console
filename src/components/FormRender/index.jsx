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
import FormRender from 'form-render';
import i18n from 'core/i18n';
import { InputNumber } from 'antd';
import MyCheckBox from './widgets/MyCheckBox';
import ArrayText from './widgets/ArrayText';
import ArrayString from './widgets/ArrayString';
import KSPlugins from './widgets/KSPlugins';
import Collapses from './mapping/Collapses';
import SelectInput from './widgets/SelectInput';

import CustomBoolean from './mapping/CustomBoolean';

// eslint-disable-next-line no-unused-vars
import styles from './index.less';

/**
 * 自定义组件（widget）
 * https://x-render.gitee.io/form-render/advanced/widget
 */
const widgets = {
  'input-number': InputNumber,
  // widgets
  myCheckBox: MyCheckBox,
  ArrayText,
  ArrayString,
  KSPlugins,
  // mapping
  CustomBoolean,
  collapse: Collapses,
  'select-input': SelectInput,
};

/**
 * 覆盖默认组件（mapping）
 * https://x-render.gitee.io/form-render/advanced/mapping
 */
const mapping = {
  boolean: 'CustomBoolean',
  // int: 'number', // TODO 导致 form.submit 无法触发所有表单的校验
  object: 'collapse',
};

const locale = i18n.getLocale() === 'zh-cn' ? 'cn' : 'en';

const FR = (props) => (
  <FormRender
    widgets={widgets}
    mapping={mapping}
    locale={locale}
    validateMessages={{
      required: `\${title} ${t(`is required`)}`,
    }}
    {...props}
  />
);

export default FR;
