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
import { Select } from 'antd';

const { Option } = Select;

export default function CustomSelect(props) {
  const { onChange, value, options } = props;

  return (
    <Select
      placeholder={t('Please select')}
      onChange={(val) => {
        onChange(val);
      }}
      value={value}
    >
      {options.map((item) => {
        const { value: _value, extra } = item;
        return (
          <Option key={_value} value={_value}>
            <div style={{ display: 'flex' }}>
              <div>{_value}</div>
              <div
                style={{
                  display: 'flex',
                  color: '#0068FF',
                  marginLeft: '10px',
                }}
              >
                {extra?.map((val, index) => (
                  <div key={index} style={{ marginRight: '5px' }}>
                    {val}
                  </div>
                ))}
              </div>
            </div>
          </Option>
        );
      })}
    </Select>
  );
}
