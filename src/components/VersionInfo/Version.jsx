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
import styles from './index.less';
import title from 'src/asset/image/title.png';
import { useRootStore } from 'stores';

function Version() {
  const { licenseStore: store } = useRootStore();
  const { env: { BRANCH = '', COMMIT_REF = '' } = {} } = process.env;

  return (
    <div className={styles['version-content']}>
      <div
        className={styles.title}
        style={{
          backgroundImage: `url(${title})`,
          backgroundSize: 'cover',
        }}
      />
      <div>
        <span>kc-console:</span>
        <span>{`${BRANCH}-${COMMIT_REF}`}</span>
      </div>
      <div>
        <span>kc-server:</span>
        <span>{store.versionInfo?.gitVersion}</span>
      </div>
      <div>☸️ Manage Kubernetes in the most light and conventient way ☸️</div>
      <div>
        Feel free to contribute on{' '}
        <a href="https://github.com/kubeclipper" target="_blank">
          Github
        </a>{' '}
        🍻{' '}
      </div>
    </div>
  );
}

export default Version;
