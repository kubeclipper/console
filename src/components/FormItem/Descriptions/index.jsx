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
import { Descriptions, Button } from 'antd';
import { FormOutlined } from '@ant-design/icons';
import { isArray, isUndefined, isBoolean } from 'lodash';
import { generateId } from 'utils';
import styles from './index.less';

export default function CustomDescriptions(props) {
  const { onClick, title, items } = props;

  const getValueContent = (value, inline) => {
    if (isUndefined(value)) {
      return '-';
    }
    if (isArray(value)) {
      if (inline) {
        return value.map((it) => (
          <span key={`value-${generateId()}`} style={{ marginRight: '20px' }}>
            {it}
          </span>
        ));
      }
      return value.map((it) => <div key={`value-${generateId()}`}>{it}</div>);
    }

    if (isBoolean(value)) {
      return value ? t('Enable') : t('Disable');
    }

    return value;
  };

  const handelOnClick = () => {
    onClick && onClick();
  };

  const renderTitle = () => (
    <span>
      {title}{' '}
      <Button type="link" icon={<FormOutlined />} onClick={handelOnClick} />
    </span>
  );

  const desItems = items.map((it) => {
    const { label, value, span, inline } = it;
    const desContent = getValueContent(value, inline);
    const options = {
      label,
      key: `item-${generateId()}`,
      className: styles.label,
    };
    if (span) {
      options.span = span;
    }
    return <Descriptions.Item {...options}>{desContent}</Descriptions.Item>;
  });

  return (
    <Descriptions title={renderTitle()} colon={false}>
      {desItems}
    </Descriptions>
  );
}
