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
import React, { useEffect, useState } from 'react';
import { Button, Divider } from 'antd';
import { useRootStore } from 'stores';
import styles from './index.less';
import { LoginOutlined } from '@ant-design/icons';
import { toQueryString } from 'utils/request';

export default function OAuth() {
  const rootStore = useRootStore();

  const [oauth2Info, setOatuth2Info] = useState([]);

  useEffect(() => {
    const fetchOauth2 = async () => {
      const { identityProviders } = await rootStore.oauth2Info();
      const [firstiIdentity = {}] = identityProviders;
      const { authURL, clientID, redirectURL, scopes } = firstiIdentity;

      const identity = identityProviders.map((item) => {
        const params = {
          state: new Date().getTime(),
          client_id: clientID,
          response_type: 'code',
          redirect_uri: redirectURL,
          scope: scopes.join(' '),
        };

        return {
          oauthUrl: `${authURL}${toQueryString(params)}`,
          name: item.name,
        };
      });
      setOatuth2Info(identity);
    };
    fetchOauth2();
  }, []);

  const oauth2 = (val) => {
    window.open(val, '_self');
  };

  return oauth2Info.length ? (
    <div className={styles.login}>
      <Divider plain>
        <span className={styles['divider-title']}>or</span>
      </Divider>

      {oauth2Info.map((item, index) => (
        <Button key={index} onClick={() => oauth2(item.oauthUrl)} block>
          <LoginOutlined />
          {t('Use { name } to login', { name: item.name })}
        </Button>
      ))}
    </div>
  ) : null;
}
