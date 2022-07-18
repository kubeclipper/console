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

import React, { useMemo } from 'react';
import classNames from 'classnames';
import {
  CaretRightOutlined,
  CaretDownOutlined,
  ExclamationCircleFilled,
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
      return <pre className={styles.LogItem_content}>{logdata}</pre>;
    }
  }
  return '';
}

const LogItem = observer((props) => {
  const { nodeStatus, logStore, runtime, isStepFinished, nodes } = props;
  const { operationStore } = useRootStore();
  const step = operationStore.currentNodesByStep;
  logStore.isStepFinished = isStepFinished;

  const { logdata, isExpand, isLoading, cumulativeSize } = logStore;

  const stateIcons = (errIgnore, status) => {
    if (errIgnore && status === 'failed') {
      return <ExclamationCircleFilled style={{ color: '#fadb14' }} />;
    } else if (status === 'successful') {
      return <CheckCircleFilled style={{ color: '#57E39B' }} />;
    } else if (status === 'failed') {
      return <CloseCircleFilled style={{ color: '#EB354D' }} />;
    }
    return '';
  };

  const params = {
    operation: operationStore.currentOperation.name,
    node: nodes.id,
    step: step.id,
    offset: cumulativeSize,
  };

  useInterval(
    () => {
      logStore.fetchStepLog(params);
    },
    isExpand && !isStepFinished ? 2000 : null
  );

  const toggleExpand = async () => {
    if (!isExpand) {
      logStore.getStepLog(params);
    } else {
      logStore.logReset();
    }
    logStore.isExpand = !isExpand;
  };

  return (
    <div className={styles.LogItem}>
      <div className={classNames(styles.LogItem__title)} onClick={toggleExpand}>
        {isExpand ? <CaretDownOutlined /> : <CaretRightOutlined />}
        {`${nodes.ipv4} (${nodes.id})`}
        <span className={styles.logitem_status}>
          <span>{runtime || ''}</span>
          {stateIcons(step.errIgnore, nodeStatus)}
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

function RightLogContent(props) {
  const { activeStepIndex } = props;
  const { operationStore: store } = useRootStore();
  return useMemo(() => {
    if (store.currentNodesByStep.status) {
      return store.currentNodesByStep.status.map(
        ({ node, status, startAt, endAt }, index) => (
          <LogItem
            key={node}
            logStore={new LogStore()}
            nodeStatus={status}
            runtime={formatSeconds(startAt, endAt)}
            isStepFinished
            nodes={store.currentNodesByStep.nodes[index]}
          />
        )
      );
    }

    return store.currentNodesByStep.nodes.map((item) => (
      <LogItem
        key={item}
        logStore={new LogStore()}
        isStepFinished={false}
        nodes={item}
      />
    ));
  }, [store.currentNodesByStep.status, activeStepIndex]);
}

export default RightLogContent;
