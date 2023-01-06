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
import classNames from 'classnames';
import Text from 'components/Text';
import { Badge, Divider } from 'antd';

import styles from './index.less';

const Tabs = (props) => {
  const {
    tabs = [],
    current,
    tabClassName,
    tabStyles,
    onChange,
    isModlal = false,
    children,
  } = props;

  const handleTabChange = (e, index) => {
    if (tabs[index].disabled) return;

    const { module } = e.currentTarget.dataset;
    onChange(module, index);
  };

  return (
    <div className={styles.wrapper}>
      <div className={classNames(styles.tabs, tabClassName)} style={tabStyles}>
        <div className={styles.tabsWrapper}>
          {tabs.map((item, index) => (
            <div
              key={item.name}
              className={classNames(styles.tab, {
                [styles.enabled]: current === item.name,
              })}
              onClick={(e) => handleTabChange(e, index)}
              data-module={item.name}
            >
              <Text
                desIcon={
                  <Badge
                    status={item.state === 'Enabled' ? 'processing' : 'default'}
                  />
                }
                title={t(item.title || item.name)}
                description={
                  current === item.name
                    ? t('Setting')
                    : t(item.state || 'Not Enabled')
                }
              />
              {item.deprecated ? (
                <div className={styles.deprecated}>{t('To be deprecated')}</div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
      <div>
        <Divider type="vertical" className={styles.divider} />
      </div>
      <div
        className={classNames(
          styles.content,
          isModlal ? styles['is-modal'] : ''
        )}
      >
        <div className={styles.contentWrapper}>{children}</div>
      </div>
    </div>
  );
};

export default Tabs;
