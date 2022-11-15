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
import React, { useEffect, useMemo, useState } from 'react';
import classnames from 'classnames';
import { Tabs, Skeleton } from 'antd';
import styles from './index.less';
import { useRootStore } from 'stores';
import { useMergedState } from 'hooks';

const TabComponent = (props) => {
  const { tabItem, activeKey, store } = props;
  const { key } = tabItem;

  return useMemo(
    () =>
      activeKey === key ? (
        <tabItem.component currentTab={tabItem} store={store} />
      ) : null,
    [activeKey]
  );
};

const Tab = (props) => {
  const { tabs, className, store, active } = props;
  const { routing } = useRootStore();

  const [availableTabs, setAvailableTabs] = useState([]);
  const [activeKey, setActiveKey] = useMergedState(tabs[0].key, {
    value: active,
  });
  const [tabLoading, setTabLoading] = useState(true);

  useEffect(() => {
    setAvailableTabs(tabs);
    setTabLoading(false);
  }, []);

  const handleChangeTab = (tab) => {
    if (tab === activeKey) return;

    setActiveKey(tab);
    setTimeout(() => {
      routing.query({ tab }, false);
    });
  };

  return (
    <Skeleton active loading={tabLoading}>
      <div className={styles.tabs}>
        <div className={classnames(styles['tab-wrapper'], className)}>
          <Tabs activeKey={activeKey} onChange={handleChangeTab}>
            {availableTabs.map((tabItem) => {
              const { title, key } = tabItem;
              return (
                <Tabs.TabPane tab={title} key={key}>
                  <TabComponent
                    tabItem={tabItem}
                    activeKey={activeKey}
                    store={store}
                  />
                </Tabs.TabPane>
              );
            })}
          </Tabs>
        </div>
      </div>
    </Skeleton>
  );
};

Tab.defultProps = {
  tabs: [],
  className: '',
};

export default Tab;
