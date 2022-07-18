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

import React, { useState } from 'react';
import { Row, Col, Space } from 'antd';
import { isEqual, get } from 'lodash';
import { keyValue2Obj, obj2KeyValue } from 'utils';
import ArrayInput from '../ArrayInput';
import KeyValueInput from '../KeyValueInput';

const labelStyle = {
  display: 'block',
  color: '#00000073',
};

function Metadata({ value, onChange }) {
  const [metadata, setMetadata] = useState({});

  if (!isEqual(metadata, value)) {
    setMetadata(value);
  }

  const onMetaChange = (data, type) => {
    const newValue = { ...metadata };
    newValue[type] = keyValue2Obj(data.map((it) => it.value));

    onChange && onChange(newValue);
  };

  const getValues = (type) =>
    obj2KeyValue(get(metadata, type)).map((it, index) => ({
      index,
      value: it,
    }));

  return (
    <Space direction="vertical" size="middle" style={{ paddingTop: '7px' }}>
      <Row>
        <Col>
          <label style={labelStyle}>Label</label>
          <ArrayInput
            itemComponent={KeyValueInput}
            value={getValues('labels')}
            keyReadonly
            onChange={(data) => onMetaChange(data, 'labels')}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <label style={labelStyle}>Annotation</label>
          <ArrayInput
            itemComponent={KeyValueInput}
            value={getValues('annotations')}
            onChange={(data) => onMetaChange(data, 'annotations')}
          />
        </Col>
      </Row>
    </Space>
  );
}

export default Metadata;
