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
import { Input, Select } from 'antd';
import PropTypes from 'prop-types';

const { Option } = Select;

export default function IPGroup(props) {
  const { onChange, value, className } = props;

  const [prefix, setPrefix] = useState('http');
  const [ip, setIp] = useState('');

  if (prefix !== value?.prefix) {
    setPrefix(value?.prefix);
  }
  if (ip !== value?.ip) {
    setIp(value?.ip);
  }

  const onPrefixChange = (_prefix) => {
    onChange?.({
      prefix: _prefix,
      ip,
    });
  };

  const onIPChange = (e) => {
    onChange?.({
      prefix,
      ip: e.target.value,
    });
  };

  return (
    <Input.Group compact className={className}>
      <Select
        style={{
          width: '30%',
        }}
        value={prefix}
        onChange={onPrefixChange}
      >
        <Option value="http">http</Option>
        <Option value="https">https</Option>
      </Select>
      <Input
        style={{
          width: '70%',
        }}
        value={ip}
        onChange={onIPChange}
      />
    </Input.Group>
  );
}

IPGroup.propTypes = {
  value: PropTypes.string,
  className: PropTypes.string,
  onChange: PropTypes.func,
};

IPGroup.defaultProps = {
  value: '',
  onChange: () => {},
};
