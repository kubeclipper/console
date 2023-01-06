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
import classnames from 'classnames';
import { useRootStore } from 'stores';

import styles from './index.less';

function Footer(props) {
  const {
    current = 0,
    steps = [],
    confirmDisabled = false,
    onPrev,
    onNext,
    onOK,
  } = props;
  const { routing } = useRootStore();

  const PrevBtn = () => {
    if (current === 0) {
      return null;
    }
    const preTitle = steps[current - 1].title;

    return (
      <Button style={{ margin: '0 8px' }} onClick={onPrev}>
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
      <Button type="primary" onClick={onNext}>
        {`${t('Next')}: ${title}`}
      </Button>
    );
  };

  const handleOK = () => {
    onOK && onOK();
  };

  return (
    <div className={styles.footer}>
      <div className={classnames(styles.btns, 'step-form-footer-btns')}>
        <Button
          className={styles.cancel}
          onClick={() => {
            routing.goBack();
          }}
        >
          {t('Cancel')}
        </Button>
        <PrevBtn />
        <NextBtn />
        {(current === steps.length - 1 || steps.length === 0) && (
          <Button
            disabled={confirmDisabled}
            type="primary"
            onClick={() => handleOK()}
          >
            {t('Confirm')}
          </Button>
        )}
      </div>
    </div>
  );
}

export default Footer;
