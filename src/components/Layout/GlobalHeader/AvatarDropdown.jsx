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
import { Menu, Spin, Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import i18n from 'core/i18n';
import HeaderDropdown from './HeaderDropdown';
import styles from './index.less';
import { useRootStore } from 'stores';
import ModifyPassword from './ModifyPassword';
import { observer } from 'mobx-react';
import { getLocalStorageItem } from 'utils/localStorage';

const { getLocale, setLocale } = i18n;

function AvatarDropdown() {
  const rootStore = useRootStore();

  const changeLang = (language) => () => setLocale(language, true);
  const isExternalUser = getLocalStorageItem('isExternal');
  const handleLogout = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    rootStore.logout();
  };

  if (!rootStore.user) {
    return (
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    );
  }

  const selectedLang = getLocale();
  const menuHeaderDropdown = (
    <Menu className={styles.menu}>
      <Menu.Item
        key="user"
        className={`${styles['no-hover']} ${styles['menu-item']}`}
      >
        <span>
          <span className={styles['user-label']}>{t('User')}</span>
          <span>{rootStore.user?.username}</span>
        </span>
        <Button type="link" onClick={handleLogout}>
          {t('Sign Out')}
        </Button>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="language"
        className={`${styles['no-hover']} ${styles['menu-item']}`}
      >
        <span>{t('Switch Language')}</span>
        <div>
          <Button
            type="link"
            disabled={selectedLang === 'zh-cn'}
            onClick={changeLang('zh-cn')}
          >
            CN
          </Button>
          <span>/</span>
          <Button
            type="link"
            disabled={selectedLang === 'en'}
            onClick={changeLang('en')}
          >
            EN
          </Button>
        </div>
      </Menu.Item>
      {!isExternalUser && <Menu.Divider />}
      {!isExternalUser && (
        <Menu.Item
          key="update-password"
          className={`${styles['no-hover']} ${styles['menu-item']}`}
        >
          <span />
          <ModifyPassword />
        </Menu.Item>
      )}
    </Menu>
  );

  return (
    <HeaderDropdown overlay={menuHeaderDropdown}>
      <div className={`${styles.action}`}>
        <Button
          shape="circle"
          icon={<UserOutlined />}
          className={styles.avatar}
        />
      </div>
    </HeaderDropdown>
  );
}

export default observer(AvatarDropdown);
