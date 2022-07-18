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
import { Link } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import classnames from 'classnames';
import styles from '../index.less';
import { BaseContext } from '..';

function Breadcrumbs() {
  const { state } = useContext(BaseContext);
  const { currentRoutes } = state;

  if (currentRoutes.length === 0) {
    return null;
  }

  const { hasBreadcrumb = true } = currentRoutes[currentRoutes.length - 1];

  if (!hasBreadcrumb && hasBreadcrumb !== undefined) {
    return null;
  }

  const { hasTab } = currentRoutes[currentRoutes.length - 1];
  const tabClass = hasTab ? styles['breadcrumb-has-tab'] : '';

  const breadcrumbItem = () =>
    currentRoutes.map((item, index) => {
      if (index === 0 || index === currentRoutes.length - 1) {
        return (
          <Breadcrumb.Item key={item.key} className={styles['breadcrumb-item']}>
            {item.name}
          </Breadcrumb.Item>
        );
      }

      return (
        <Breadcrumb.Item key={item.key}>
          <Link
            key={item.key}
            to={item.path}
            className={classnames(
              styles['breadcrumb-item'],
              styles['breadcrumb-link']
            )}
          >
            {item.name}
          </Link>
        </Breadcrumb.Item>
      );
    });

  return (
    <div className={`${styles.breadcrumb} ${tabClass}`}>
      <Breadcrumb>{breadcrumbItem()}</Breadcrumb>
    </div>
  );
}

export default Breadcrumbs;
