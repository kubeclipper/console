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
import { Menu, Dropdown } from 'antd';
import i18n from 'core/i18n';
import React from 'react';
import classNames from 'classnames';
import { GlobalOutlined } from '@ant-design/icons';
import styles from './index.less';

const { getLocale, setLocale } = i18n;

const SelectLang = (props) => {
  const { className } = props;
  const selectedLang = getLocale();

  const changeLang = ({ key }) => {
    setLocale(key, false);
  };

  const locales = [
    {
      key: 'zh-cn',
      label: '简体中文',
      icon: '🇨🇳',
    },
    {
      key: 'en',
      label: 'English',
      icon: '🇺🇸',
    },
  ];

  const langMenu = (
    <Menu
      className={styles.menu}
      selectedKeys={[selectedLang]}
      onClick={changeLang}
    >
      {locales.map(({ key, label, icon }) => (
        <Menu.Item key={key}>
          <span role="img" aria-label={label}>
            {icon}
          </span>{' '}
          {label}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Dropdown overlay={langMenu} placement="bottomRight">
      <span className={classNames(styles.dropDown, className)}>
        <GlobalOutlined />
      </span>
    </Dropdown>
  );
};

export default SelectLang;
