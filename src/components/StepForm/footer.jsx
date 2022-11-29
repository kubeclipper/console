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
import { Button } from 'antd';
import styles from './index.less';
import classnames from 'classnames';

export default function Footer(props) {
  const {
    current,
    steps,
    isCreateQuickly,
    useTemplate,
    handle: {
      onClickCancel,
      onClickPrev,
      onClickNext,
      onClickSubmit,
      onClickCreateQuickly,
    },
  } = props;

  const Cancel = () => (
    <Button className={styles.cancel} onClick={onClickCancel}>
      {t('Cancel')}
    </Button>
  );

  const PrevBtn = () => {
    if (current === 0) {
      return null;
    }
    const preTitle = steps[current - 1].title;
    return (
      <Button style={{ margin: '0 8px' }} onClick={onClickPrev}>
        {`${t('Previous')}: ${preTitle}`}
      </Button>
    );
  };

  const NextBtn = () => {
    if (current >= steps.length - 1) {
      return null;
    }
    const { title } = steps[current + 1];
    return (
      <Button type="primary" onClick={onClickNext} data-action="step-next">
        {`${t('Next')}: ${title}`}
      </Button>
    );
  };

  const Confirm = () => {
    if (current === steps.length - 1) {
      return (
        <Button
          type="primary"
          onClick={onClickSubmit}
          data-action="step-confirm"
        >
          {t('Confirm')}
        </Button>
      );
    }
    return null;
  };

  const CreateQuickly = () => {
    const isFirstStep = current === 0;
    const isEndStep = current === steps.length - 1;

    const useTemplateQuickly = isCreateQuickly && useTemplate && !isEndStep;
    const uselessTemplateQuickly =
      isCreateQuickly && !useTemplate && !isFirstStep && !isEndStep;

    if (useTemplateQuickly || uselessTemplateQuickly) {
      return (
        <Button
          type="primary"
          onClick={onClickCreateQuickly}
          data-action="step-quick"
        >
          {t('Create Quickly')}
        </Button>
      );
    }
    return null;
  };

  return (
    <div className={classnames(styles.footer, 'step-footer')}>
      <div className={classnames(styles['footer-left'])}>{}</div>
      <div className={classnames(styles.btns)}>
        <Cancel />
        <PrevBtn />
        <NextBtn />
        <Confirm />
        <CreateQuickly />
      </div>
    </div>
  );
}
