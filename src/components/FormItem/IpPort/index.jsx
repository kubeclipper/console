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
import { InputNumber } from 'antd';
import IpInput from '../IpInput';
import PropTypes from 'prop-types';
import styles from './index.less';

export default function IpPort(props) {
  const {
    onChange,
    value: { ip, port },
  } = props;

  const onIpChange = (value) => {
    onChange({
      port,
      ip: value,
    });
  };

  const onPortChange = (value) => {
    onChange({
      ip,
      port: value,
    });
  };

  return (
    <div className={styles['ip-port']}>
      <span className={styles.ip}>{t('IP')}</span>
      <IpInput
        value={ip}
        onChange={onIpChange}
        className={styles['ip-input']}
      />
      <span className={styles.port}>{t('Port')}</span>
      <InputNumber
        min={0}
        value={port}
        onChange={onPortChange}
        style={{ width: 60 }}
        className="input-port"
      />
    </div>
  );
}

IpPort.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.object,
};

IpPort.defaultProps = {
  onChange: () => {},
  value: { ip: '0.0.0.0', port: 0 },
};
