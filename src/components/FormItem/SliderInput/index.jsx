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
import PropTypes from 'prop-types';
import { Slider, InputNumber, Row, Col } from 'antd';

export default function SliderInput(props) {
  const { value, max, min, description, onChange } = props;

  const [inputVal, setInputVal] = useState(() => {
    const valueToInt = parseInt(value, 10);
    return Number.isNaN(valueToInt) ? 1 : value;
  });

  const handelOnChange = (val) => {
    setInputVal({
      inputValue: val,
    });
    onChange(val);
  };

  const { inputValue } = inputVal;
  return (
    <Row>
      <Col span={16}>
        <Slider
          min={min}
          max={max}
          onChange={handelOnChange}
          value={inputValue}
        />
      </Col>
      <Col span={4}>
        <InputNumber
          min={min}
          max={max}
          style={{ margin: 0 }}
          value={inputValue}
          onChange={handelOnChange}
        />
      </Col>
      <Col span={24}>
        <span style={{ fontStyle: 'italic', color: '#7b8997' }}>
          {description}
        </span>
      </Col>
    </Row>
  );
}

SliderInput.propTypes = {
  value: PropTypes.number,
  max: PropTypes.number,
  min: PropTypes.number,
  description: PropTypes.string,
  onChange: PropTypes.func,
};

SliderInput.defaultProps = {
  max: 500,
  min: 0,
  value: 0,
  onChange: () => {},
};
