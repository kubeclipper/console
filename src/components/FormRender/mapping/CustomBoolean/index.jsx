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
import { Checkbox } from 'antd';
import classnames from 'classnames';

import styles from './index.less';

/**
 * 自定义 CustomBoolean ，覆盖默认 boolean 类型组件
 * 添加 label
 * @param {*} props
 * @returns
 */
export default function CustomBoolean({ value, onChange, schema }) {
  const { title } = schema;

  function handleChange(e) {
    onChange(e.target.checked);
  }

  return (
    <div className="fr-field w-100 flex">
      <div className={classnames('fr-label fr-label-row', styles['c-label'])}>
        <label className="fr-label-title">
          {/* <span>{title}</span>
          {description && (
            <span className="fr-tooltip-toggle" aria-label={description}>
              <i className="fr-tooltip-icon" />
              <div className="fr-tooltip-container">
                <i className="fr-tooltip-triangle" />
                {description}
              </div>
            </span>
          )} */}
        </label>
      </div>
      <Checkbox onChange={handleChange} checked={value}>
        {title}
      </Checkbox>
    </div>
  );
}
