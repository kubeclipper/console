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

import { get } from 'lodash';
import React from 'react';
import { Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { SuccessIcon, ErrorIcon } from 'components/Icon';
import styles from './index.less';

const isSuccess = (type, condition) => {
  const conditionType = condition.type;
  const conditionStatus = condition.status;

  if (type === 'volume') {
    return conditionStatus === 'True';
  }

  return conditionType === 'ReplicaFailure'
    ? conditionStatus === 'False'
    : conditionStatus === 'True';
};

export default function StatusReason({
  data,
  status,
  reason,
  type = 'workload',
}) {
  const conditions = (
    <div>
      <div className="tooltip-title">{t('STATUS_INFORMATION')}</div>
      <div>
        {get(data, 'status.conditions', []).map((cd) => (
          <div key={cd.type} className={styles.condition}>
            <div className={styles.title}>
              {isSuccess(type, cd) ? (
                <SuccessIcon
                  style={{
                    fontSize: '16px',
                  }}
                />
              ) : (
                <ErrorIcon />
              )}
              <span className={styles.type}>{cd.type}</span>
            </div>
            {cd.status && (
              <p>
                {`${t('Status')}: ${cd.status === 'True' ? 'True' : 'False'}`}
              </p>
            )}
            {cd.reason && <p>{`${t('Reason')}: ${cd.reason}`}</p>}
            {cd.message && <p>{`${t('Message')}: ${cd.message}`}</p>}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <span className={styles.reason}>
      <Tooltip placement="right" title={conditions}>
        <InfoCircleOutlined style={{ color: 'rgb(245, 166, 35)' }} />
      </Tooltip>
      {reason && (
        <span className={status === 'error' ? styles.error : styles.warning}>
          {t(reason)}
        </span>
      )}
    </span>
  );
}
