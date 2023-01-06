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
import PropTypes from 'prop-types';
import { Menu } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { includes, remove, isUndefined } from 'lodash';

import styles from './index.less';

export default function CustomRow(props) {
  const { className, value: visibleList, onChange, title, options } = props;

  const renderHeader = () =>
    isUndefined(title) ? null : <header>{title}</header>;

  const renderOptions = () => {
    const isVisibleOption = (option) => {
      const { value } = option;
      return includes(visibleList, value);
    };
    const renderOption = (option) => {
      const isVisible = isVisibleOption(option);
      const { value, label } = option;
      const icon = isVisible ? (
        <CheckOutlined />
      ) : (
        <span className={styles.empty} />
      );
      return (
        <Menu.Item key={value}>
          {icon}
          {label}
        </Menu.Item>
      );
    };

    const changeVisibleList = (e) => {
      const value = e.key;
      const [...duplicate] = visibleList;
      includes(duplicate, value)
        ? remove(duplicate, (visibleValue) => visibleValue === value)
        : duplicate.push(value);
      onChange(duplicate);
    };

    const menuItems = options.map((it) => renderOption(it));
    return (
      <Menu onClick={changeVisibleList} theme="light">
        {menuItems}
      </Menu>
    );
  };

  return (
    <div className={className}>
      {renderHeader()}
      {renderOptions()}
    </div>
  );
}

CustomRow.propTypes = {
  value: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  title: PropTypes.node,
  options: PropTypes.array.isRequired,
};

CustomRow.defaultProps = {
  value: [],
};
