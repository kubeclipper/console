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
import React, { useLayoutEffect } from 'react';
import { Layout, Empty } from 'antd';
import { useRootStore } from 'stores';
import { getLocalStorageItem } from 'utils/localStorage';
import { GlobalHeader } from 'components/Layout';
import styles from './index.less';
import { defaultRoute } from 'utils';
import { useHistory } from 'react-router-dom';

const { Header, Content } = Layout;

function EmptyRole() {
  const rootStore = useRootStore();
  const history = useHistory();

  useLayoutEffect(() => {
    if (!rootStore.user) {
      const user = getLocalStorageItem('user');
      if (!user) {
        rootStore.gotoLoginPage(window.location.pathname);
      } else {
        const { globalRules = {} } = user;
        user && rootStore.updateUser(user);
        history.push(defaultRoute(globalRules));
      }
    } else {
      history.push(defaultRoute(rootStore.user.globalRules));
    }
  }, []);

  return (
    <Layout>
      <Header className={styles.header}>
        <GlobalHeader />
      </Header>
      <Content className={styles.content}>
        <div className={styles['empty-content']}>
          <Empty className={styles['empty-img']} description={false} />
          <span>
            {t(
              'You currently have no available roles, please contact the administrator to set'
            )}
          </span>
        </div>
      </Content>
    </Layout>
  );
}

export default EmptyRole;
