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
import React, { useEffect, useState } from 'react';
import { Checkbox } from 'antd';
import PropTypes from 'prop-types';

export default function CheckboxGroup(props) {
  const { onChange, value, options, className } = props;
  const [values, setValues] = useState([]);

  useEffect(() => {
    const _values = [];
    options.forEach((it) => {
      const key = it.value;
      if (value[key]) _values.push(key);
    });
    setValues(_values);
  }, [options, value]);

  const conf = {
    className,
    onChange: (checkedValues) => {
      const _value = {};
      checkedValues.forEach((it) => {
        _value[it] = true;
      });
      onChange(_value);
    },
  };

  return <Checkbox.Group {...conf} options={options} value={values} />;
}

CheckboxGroup.propTypes = {
  value: PropTypes.object,
  className: PropTypes.string,
  options: PropTypes.array,
  onChange: PropTypes.func,
  span: PropTypes.number,
};

CheckboxGroup.defaultProps = {
  value: {},
  options: [],
  span: 8,
  onChange: () => {},
};
