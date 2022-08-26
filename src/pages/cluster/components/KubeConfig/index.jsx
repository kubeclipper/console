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
import classnames from 'classnames';
import { DownloadOutlined } from '@ant-design/icons';
import { saveAs } from 'file-saver';
import CodeEditor from 'components/CodeEditor';
import { useRootStore } from 'stores';
import Notify from 'components/Notify';

import styles from './index.less';

export default function KubeConfigModal(props) {
  const { name } = props;
  const { clusterStore } = useRootStore();
  const [kubeConfigVal, setKubeConfigVal] = useState('');

  useEffect(() => {
    async function init() {
      const value = await clusterStore.getKubeConfig({ name });
      setKubeConfigVal(value);
    }
    init();
  }, []);

  const handleDownload = () => {
    const fileName = 'kubeconfig.yaml';
    const blob = new Blob([kubeConfigVal], {
      type: 'text/plain;charset=utf-8',
    });
    saveAs(blob, fileName);
    Notify.success(t('Current data downloaded.'));
  };

  const options = { readOnly: true };

  return (
    <div className={styles.content}>
      <div className={classnames(styles.pane, styles.terminal)}>
        <div className={styles.download} onClick={handleDownload}>
          <DownloadOutlined />
          {`${t('Download')} KubeConfig`}
        </div>
        <CodeEditor value={kubeConfigVal} options={options} />
      </div>
    </div>
  );
}
