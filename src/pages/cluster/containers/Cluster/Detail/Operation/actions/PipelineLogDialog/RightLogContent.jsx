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

import React, { useEffect, useRef, useMemo } from 'react';
import classNames from 'classnames';
import {
  CaretRightOutlined,
  CaretDownOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
} from '@ant-design/icons';
import { Spin, Button } from 'antd';
import { observer } from 'mobx-react';
import styles from './index.less';
import { useRootStore } from 'stores';
import LogStore from 'stores/log';
import { formatSeconds } from 'utils';
import { useInterval } from 'hooks';

function LogItemContent({ isExpand, isLoading, logdata }) {
  if (!isExpand) return null;
  return (
    <div className={styles['log-output']}>
      <div className={styles['log-output-title']}>{t('Execution logs')}</div>
      {isLoading && !logdata ? (
        <Spin className={styles['spin-center']} />
      ) : (
        <pre className={styles['log-item-content']}>
          {logdata || t('No log output yet')}
        </pre>
      )}
    </div>
  );
}

const LogItem = observer((props) => {
  const {
    nodeStatus,
    taskName,
    logStore,
    runtime,
    nodes,
    index,
    message,
    reason,
  } = props;
  const initiallyExpanded = useRef(index === 0);

  const taskFinished = ['Succeeded', 'Failed', 'TimedOut', 'Canceled'].includes(
    nodeStatus
  );
  logStore.isStepFinished = taskFinished;
  const {
    logdata,
    isExpand,
    isLoading,
    cumulativeSize,
    isStepFinished,
    error,
  } = logStore;

  const stateIcons = (errIgnore, status) => {
    if (status === 'Succeeded') {
      return <CheckCircleFilled style={{ color: '#57E39B' }} />;
    } else if (['Failed', 'TimedOut', 'Canceled'].includes(status)) {
      return <CloseCircleFilled style={{ color: '#EB354D' }} />;
    }
    return '';
  };

  const params = {
    taskName,
    offset: cumulativeSize,
  };

  useEffect(() => {
    if (initiallyExpanded.current) logStore.isExpand = true;
    return () => logStore.logReset();
  }, [taskName, logStore]);

  useEffect(() => {
    if (logStore.isExpand && taskName) {
      const fn = async () => {
        await logStore.fetchStepLog({
          taskName,
          offset: logStore.cumulativeSize,
        });
      };

      fn();
    }
  }, [taskName, nodeStatus, index, logStore]);

  useInterval(
    () => {
      const fn = async () => {
        await logStore.fetchStepLog(params);
      };
      fn();
    },
    isExpand && !isStepFinished && taskName ? 2000 : null
  );

  const toggleExpand = async () => {
    if (!taskName) return;

    logStore.isExpand = !isExpand;
    if (!isExpand) {
      logStore.getStepLog(params);
    } else {
      logStore.logReset();
    }
  };

  const failed = ['Failed', 'TimedOut', 'Canceled'].includes(nodeStatus);
  const statusClass = failed
    ? 'status-failed'
    : nodeStatus === 'Succeeded'
    ? 'status-succeeded'
    : 'status-running';

  return (
    <div className={styles.LogItem}>
      <button
        type="button"
        className={styles.LogItem__title}
        onClick={toggleExpand}
        aria-expanded={isExpand}
      >
        <span className={styles['node-heading']}>
          {isExpand ? <CaretDownOutlined /> : <CaretRightOutlined />}
          <strong>{nodes.ipv4 || nodes.id}</strong>
          {nodes.ipv4 && (
            <span className={styles['node-id']} title={nodes.id}>
              {nodes.id}
            </span>
          )}
        </span>
        <span className={styles.logitem_status}>
          <span
            className={classNames(styles['status-badge'], styles[statusClass])}
          >
            {stateIcons(false, nodeStatus)} {t(nodeStatus)}
          </span>
          {runtime && <span className={styles.runtime}>{runtime}</span>}
        </span>
      </button>
      {(message || reason) && (
        <div role="alert" className={styles['log-item-error']}>
          <div className={styles['error-heading']}>
            <CloseCircleFilled />{' '}
            {t(failed ? 'Execution failed' : 'Task message')}
          </div>
          <pre>{message || reason}</pre>
        </div>
      )}
      {error && (
        <div role="alert" className={styles['log-read-error']}>
          <span>
            {t('Log read failed; current content is preserved')}: {error}
          </span>
          <Button
            type="link"
            size="small"
            onClick={() => logStore.getStepLog(params)}
          >
            {t('Retry loading logs')}
          </Button>
        </div>
      )}
      <LogItemContent
        isExpand={isExpand}
        logdata={logdata}
        isLoading={isLoading}
      />
    </div>
  );
});

function RightLogContent() {
  const { operationStore } = useRootStore();
  const { currentNodesByStep, activeStepIndex } = operationStore;
  const logStores = useRef(new Map());

  return useMemo(() => {
    const nodes = currentNodesByStep?.nodes || [];
    const statuses = currentNodesByStep?.status || [];
    return (
      <div className={styles.right}>
        {nodes.map((item, index) => {
          const taskStatus = statuses[index] || {};
          const taskName = taskStatus.taskName || item.taskName;
          const storeKey =
            taskName ||
            `${item.uid || item.name || item.id || 'node'}-${index}`;
          if (!logStores.current.has(storeKey)) {
            logStores.current.set(storeKey, new LogStore());
          }
          return (
            <LogItem
              key={index}
              logStore={logStores.current.get(storeKey)}
              nodeStatus={taskStatus.status || 'Pending'}
              message={taskStatus.message}
              reason={taskStatus.reason}
              taskName={taskName}
              runtime={
                taskStatus.startAt
                  ? formatSeconds(taskStatus.startAt, taskStatus.endAt)
                  : ''
              }
              nodes={item}
              index={index}
            />
          );
        })}
      </div>
    );
  }, [currentNodesByStep, activeStepIndex]);
}

export default observer(RightLogContent);
