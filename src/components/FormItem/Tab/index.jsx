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
import { Radio } from 'antd';
import PropTypes from 'prop-types';
import { useDidUpdateEffect } from 'hooks';

export default function Tab(props) {
  const { tabs, defaultTabValue, onChange, onTabChange, value } = props;

  const [tab, setTab] = useState(value);

  useDidUpdateEffect(() => {
    onChange(tab);
    onTabChange(tab);
  }, [tab]);

  const handleOnChange = (e) => {
    const tabValue = e.target.value;
    setTab(tabValue);
  };

  const items = tabs.map((it) => (
    <Radio.Button value={it.value} key={it.value}>
      <span>{it.label}</span>
    </Radio.Button>
  ));

  return (
    <Radio.Group
      onChange={handleOnChange}
      buttonStyle="solid"
      defaultValue={defaultTabValue}
      value={tab}
    >
      {items}
    </Radio.Group>
  );
}

Tab.propTypes = {
  tabs: PropTypes.array,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onTabChange: PropTypes.func,
};

Tab.defaultProps = {
  tabs: [],
  value: '',
  onChange: () => {},
  onTabChange: () => {},
};
