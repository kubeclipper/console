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
import { DoubleRightOutlined } from '@ant-design/icons';
import { Collapse } from 'antd';
import classnames from 'classnames';

import styles from './index.less';

const { Panel } = Collapse;

/**
 * 自定义 Collapses
 * @param {*} props
 * @returns
 */
export default function Collapses(props) {
  const { title = '', schema } = props;

  if (schema.$id === '#') {
    return <div>{props.children}</div>;
  }

  return (
    <div className={classnames('fr-field flex w-80', styles.wrapper)}>
      <div className={classnames('fr-label fr-label-row', styles['c-label'])}>
        <label className="fr-label-title">
          <span>{title}</span>
        </label>
      </div>
      <Collapse
        defaultActiveKey={['1']}
        expandIcon={({ isActive }) => (
          <span>
            {t('Advanced Options')}
            <DoubleRightOutlined
              style={{ marginLeft: '10px' }}
              rotate={isActive ? -90 : 90}
            />
          </span>
        )}
        expandIconPosition="right"
        className={styles.content}
      >
        <Panel key="1">{props.children}</Panel>
      </Collapse>
    </div>
  );
}
