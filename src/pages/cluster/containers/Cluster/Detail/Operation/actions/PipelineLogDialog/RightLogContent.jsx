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
import { Spin } from 'antd';
import { observer } from 'mobx-react';
import styles from './index.less';
import { useRootStore } from 'stores';
import LogStore from 'stores/log';
import { formatSeconds } from 'utils';
import { useInterval } from 'hooks';

function LogItemContent(props) {
  const { isExpand, isLoading, logdata } = props;
  if (isExpand) {
    if (isLoading) {
      return <Spin className={styles['spin-center']} />;
    } else {
      return <pre className={styles['log-item-content']}>{logdata}</pre>;
    }
  }
  return '';
}

const LogItem = observer((props) => {
  const { nodeStatus, taskName, logStore, runtime, nodes, index } = props;
  const inputEl = useRef();

  const taskFinished = ['Succeeded', 'Failed', 'TimedOut', 'Canceled'].includes(
    nodeStatus
  );
  logStore.isStepFinished = taskFinished;
  const { logdata, isExpand, isLoading, cumulativeSize, isStepFinished } =
    logStore;

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
    if (index === 0 && taskName) {
      const fn = async () => {
        await logStore.fetchStepLog(params);
        inputEl.current?.scrollIntoView({ block: 'end' });
      };

      fn();
    }
  }, [taskName]);

  useInterval(
    () => {
      const fn = async () => {
        await logStore.fetchStepLog(params);
        inputEl.current?.scrollIntoView({ block: 'end' });
      };
      fn();
    },
    isExpand && !isStepFinished && taskName ? 2000 : null
  );

  const toggleExpand = async () => {
    if (!taskName) return;

    if (!isExpand) {
      logStore.getStepLog(params);
    } else {
      logStore.logReset();
    }
    logStore.isExpand = !isExpand;
  };

  return (
    <div className={styles.LogItem} ref={inputEl}>
      <div className={classNames(styles.LogItem__title)} onClick={toggleExpand}>
        {isExpand ? <CaretDownOutlined /> : <CaretRightOutlined />}
        {`${nodes.name || nodes.ipv4 || nodes.id}`}
        <span className={styles.logitem_status}>
          <span>{runtime || ''}</span>
          {stateIcons(false, nodeStatus)}
        </span>
      </div>
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
