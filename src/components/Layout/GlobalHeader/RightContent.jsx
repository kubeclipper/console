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
import Avatar from './AvatarDropdown';
import { Button, Col, Row } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import { useRootStore } from 'stores';
import styles from './index.less';

const GlobalHeaderRight = ({ isAdminPage }) => {
  const rootStore = useRootStore();

  const Console = () => {
    if (isAdminPage) {
      return (
        <Button
          type="link"
          href="/cluster" // TODO deafultRoute
          className={styles['single-link']}
        >
          <SwapOutlined />
          {t('Console')}
        </Button>
      );
    }
    return null;
  };
  const Administrator = () => {
    if (!isAdminPage && rootStore.isAdminPageRole) {
      return (
        <Button
          type="link"
          href="/cluster-admin"
          className={styles['single-link']}
        >
          <SwapOutlined />
          {t('Administrator')}
        </Button>
      );
    }
    return null;
  };

  return (
    <div className={styles.right}>
      <Row justify="space-between" align="middle" gutter={10}>
        <Col>
          <Console />
          <Administrator />
        </Col>
        <Col>
          <Avatar menu />
        </Col>
      </Row>
    </div>
  );
};
export default GlobalHeaderRight;
