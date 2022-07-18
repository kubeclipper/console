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
import ArrayInput from 'components/FormItem/ArrayInput';

/**
 * 支持 type: 'array' string 类型 schema， 如：['aaa', 'bbb']
 * 使用：const demoSchema = {
    type: 'array',
    widget: 'ArrayString',
    props: {
      isInput: true,
    },
  };
 * @param {*} param0
 * @returns
 */
const ArrayString = ({ value, onChange, ...rest }) => {
  const triggerChange = (changedValue) => {
    const newValue = changedValue.map((it) => it.value);
    onChange && onChange(newValue);
  };

  const formatValue = (value || []).map((item, index) => ({
    value: item,
    index,
  }));

  return <ArrayInput value={formatValue} onChange={triggerChange} {...rest} />;
};

export default ArrayString;
