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

import React, { useEffect, useRef, useState } from 'react';
import { Skeleton, Tooltip } from 'antd';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { toLocalTime } from 'utils';
import { useRootStore } from 'stores';
import Status from 'components/Status';
import styles from './index.less';
import { useDeepCompareEffect } from 'hooks';

const StepItem = observer((props) => {
  const { step, activeByStep, index } = props;
  const { operationStore: store } = useRootStore();
  const inputEl = useRef();
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    if (
      inputEl &&
      inputEl?.current?.scrollWidth > inputEl?.current?.offsetWidth
    ) {
      setShowTip(true);
    }
  }, []);

  const handleStepClick = () => activeByStep(step, index);

  const stepItem = (
    <div
      className={classNames(styles['left-tab'], {
        [styles['left-tab-active']]: store.activeStepIndex === index,
      })}
      onClick={handleStepClick}
    >
      <div className={step.frontStatus ? styles.processing : ''}>
        <Status errIgnore={step.errIgnore} status={step.stepStatus} text={''} />
      </div>

      <span ref={inputEl} className={styles['log-id']}>
        {step.name}
      </span>
    </div>
  );

  return (
    <div className={styles.stageContainer}>
      <div className={styles.cutTitle}>
        {toLocalTime(step?.status?.[0]?.startAt) || '-'}
      </div>
      {showTip ? (
        <Tooltip title={step.name} color={'#000000'}>
          {stepItem}
        </Tooltip>
      ) : (
        stepItem
      )}
    </div>
  );
});

function LeftSteps(props) {
  const { operationStore: store } = useRootStore();
  const { activeByStep } = props;
  const operationSteps = toJS(store.operationSteps);

  const isDataLoading =
    operationSteps.findIndex((item) => item.stepID || item.frontStatus) >= 0;

  const resolveSteps = operationSteps.filter((item) => item.stepID);
  let pendingSteps = operationSteps.filter((item) => item.frontStatus);

  if (resolveSteps.length) {
    const lastResolve = resolveSteps[resolveSteps.length - 1];
    if (lastResolve.stepStatus === 'failed') {
      pendingSteps = [];
    }
  }
  const visibleSteps = [...resolveSteps, ...pendingSteps];

  const leftSteps = useRef();
  useDeepCompareEffect(() => {
    leftSteps.current.scrollTop = leftSteps.current.scrollHeight;
  }, [visibleSteps]);

  return (
    <div ref={leftSteps} className={styles.left}>
      <Skeleton active loading={!isDataLoading}>
        {visibleSteps.map((step, index) => (
          <StepItem
            step={step}
            key={index}
            index={index}
            activeByStep={activeByStep}
          />
        ))}
      </Skeleton>
    </div>
  );
}

export default observer(LeftSteps);
