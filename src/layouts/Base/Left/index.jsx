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
import classnames from 'classnames';
import styles from '../index.less';
import Logo from './logo';
import Trigger from './trigger';
import Menus from './menus';
import { BaseContext } from '..';

const Left = () => {
  const { state, setState } = useContext(BaseContext);

  const onMouseEnter = (e) => {
    if (state.collapsed) {
      const target = (e && e.target) || null;
      const className = target ? target.className : null;
      if (className.indexOf('trigger') < 0) {
        setState({ ...state, hover: true });
      }
    }
  };

  const onMouseLeave = () => {
    if (state.hover) setState({ ...state, hover: false });
  };

  return (
    <div
      className={classnames(
        styles['base-layout-sider'],
        state.collapsed ? styles['base-layout-sider-collapsed'] : '',
        state.hover ? styles['base-layout-sider-hover'] : ''
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Logo />
      <Menus />
      <Trigger />
    </div>
  );
};

export default Left;
