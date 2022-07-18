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

import React, { useContext } from 'react';
import styles from '../index.less';
import logo from 'asset/logos/logo.svg';
import { BaseContext } from '..';

export default function Logo() {
  const { state } = useContext(BaseContext);
  const { collapsed, hover } = state;

  const renderTitle = () => {
    if (collapsed && !hover) {
      return null;
    }
    return <span>{global_config.title}</span>;
  };

  return (
    <div className={styles.logo}>
      <img alt="logo" className={styles.img} src={logo} />
      {renderTitle()}
    </div>
  );
}
