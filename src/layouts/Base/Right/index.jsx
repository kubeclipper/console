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
import { Layout } from 'antd';
import classnames from 'classnames';
import { renderRoutes } from 'utils/router.config';
import { GlobalHeader } from 'components/Layout';
import { observer } from 'mobx-react';
import { useRootStore } from 'stores';
import Breadcrumbs from './Breadcrumb';
import { BaseContext } from '..';
import ErrorBoundary from 'components/ErrorBoundary';
import Tools from 'components/Tools';

import styles from '../index.less';

const { Header, Content } = Layout;

function Right() {
  const { state } = useContext(BaseContext);
  const { collapsed } = state;

  return (
    <Layout
      className={classnames(
        styles['base-layout-right'],
        collapsed ? styles['base-layout-right-collapsed'] : ''
      )}
    >
      <Header className={styles.header}>
        <GlobalHeader />
      </Header>
      <Content className={styles.content}>
        <Breadcrumbs />
        <MainContent />
      </Content>
    </Layout>
  );
}

function MainContent() {
  const { state, Routes } = useContext(BaseContext);
  const { currentRoutes, hover, collapsed } = state;
  const { routes } = Routes.route;

  const rootStore = useRootStore();

  if (!rootStore.user) return null;

  const hasMainTab = () => {
    if (currentRoutes.length === 0) {
      return false;
    }

    const { hasTab } = currentRoutes[currentRoutes.length - 1];

    return hasTab || false;
  };

  const hasBreadcrumb = (function () {
    let flag = true;
    const currentFirstRoute = currentRoutes[0]?.hasBreadcrumb;

    if (currentFirstRoute !== undefined && currentFirstRoute === false) {
      flag = false;
    }

    return flag;
  })();

  const mainTabClass = hasMainTab() ? styles['main-has-tab'] : '';

  const extraProps = {
    sliderHover: hover,
    sliderCollapsed: collapsed,
  };

  return (
    <div
      className={`${styles.main} ${
        !hasBreadcrumb ? styles['main-no-breadcrumb'] : ''
      }  ${mainTabClass}`}
    >
      <ErrorBoundary>{renderRoutes(routes, extraProps)}</ErrorBoundary>
      <Tools />
    </div>
  );
}

export default observer(Right);
