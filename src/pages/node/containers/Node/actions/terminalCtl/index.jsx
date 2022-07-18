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
import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import ContainerTerminal from 'components/Terminal';
import { getToken } from 'utils/localStorage';
import { encrypt } from 'utils';

import styles from './index.less';

function ContainerTerminalModal(props) {
  const { store, id, val } = props;

  const [url, setUrl] = useState('');

  useEffect(() => {
    async function formatUrl() {
      let { publicKey } = await store.fetchTerminalKey();

      publicKey = atob(publicKey);
      const { username, port, password } = val;

      const params = {
        username: encrypt(publicKey, username),
        password: encrypt(publicKey, password),
        // ip,
        port,
      };

      const spaceParams = JSON.stringify(params);
      const secret = btoa(spaceParams);

      const token = getToken();

      const urlTemplate = `/api/core.kubeclipper.io/v1/nodes/${id}/terminal?name=${id}&token=${token}&msg=${secret}`;
      setUrl(urlTemplate);
    }

    formatUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.terminalWrapper}>
      <div className={classnames(styles.pane, styles.terminal)}>
        <ContainerTerminal isLoading={!url} url={url} />
      </div>
    </div>
  );
}

export default ContainerTerminalModal;
