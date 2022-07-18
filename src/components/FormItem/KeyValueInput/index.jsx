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
import { Input, Row, Col } from 'antd';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';

export default function KeyValueInput(props) {
  const { keyReadonly, valueReadonly, onChange, value } = props;

  const [state, setState] = useState({ key: '', value: '' });

  if (!isEqual(state, value)) {
    setState(value);
  }

  const onKeyChange = (e) => {
    onChange &&
      onChange({
        ...state,
        key: e.target.value,
      });
  };

  const onValueChange = (e) => {
    onChange &&
      onChange({
        ...state,
        value: e.target.value,
      });
  };

  return (
    <Row>
      <Col span={10}>
        <Input
          value={state.key}
          placeholder={t('key')}
          onChange={onKeyChange}
          readOnly={keyReadonly}
          maxLength={64}
          required
        />
      </Col>
      <Col span={2} />
      <Col span={10}>
        <Input
          value={state.value}
          placeholder={t('Value')}
          onChange={onValueChange}
          readOnly={valueReadonly}
          maxLength={64}
          required
        />
      </Col>
    </Row>
  );
}

KeyValueInput.propTypes = {
  onChange: PropTypes.func,
  // eslint-disable-next-line react/no-unused-prop-types
  value: PropTypes.object,
  keyReadonly: PropTypes.bool,
  valueReadonly: PropTypes.bool,
};

KeyValueInput.defaultProps = {
  onChange: null,
  value: {
    key: '',
    value: '',
  },
  keyReadonly: false,
  valueReadonly: false,
};
