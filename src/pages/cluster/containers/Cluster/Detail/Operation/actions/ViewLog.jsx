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
import { observer } from 'mobx-react';
import { ViewAction } from 'containers/Action';
import { Timeline } from 'antd';
import { generateId, toLocalTime } from 'utils';
import styles from './index.less';

@observer
export default class ViewLog extends ViewAction {
  static id = 'viewlog';

  static title = t('ViewLog');

  static buttonText = t('ViewLog');

  static get modalSize() {
    return 'middle';
  }

  static allowed() {
    return Promise.resolve(true);
  }

  isPending() {
    const { status } = this.item;
    const whiteStatus = ['processing', 'deleting'];

    const isLoading = whiteStatus.includes(status) && (
      <span className={styles.level}>Loading...</span>
    );

    return isLoading;
  }

  renderContent = () => {
    const data = (this.item.logs || []).map((v) => JSON.parse(v));
    return (
      <div className={styles['log-time-line']}>
        <Timeline
          pending={this.isPending()}
          mode="left"
          style={{ padding: '10px' }}
          reverse
        >
          {data.map((item) => (
            <Timeline.Item
              key={`key-${generateId()}`}
              label={toLocalTime(item.time)}
              className={styles[item.level]}
            >
              <span className={styles.level}>{item.level}</span> <br />
              {item.msg}
            </Timeline.Item>
          ))}
        </Timeline>
      </div>
    );
  };
}
