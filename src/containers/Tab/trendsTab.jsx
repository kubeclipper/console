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
import React, { useEffect, useState } from 'react';
import classnames from 'classnames';
import { Tabs, Skeleton } from 'antd';
import { observer } from 'mobx-react';
import styles from './index.less';
import { useRootStore } from 'stores';
import { isEmpty } from 'lodash';
import { useQuery } from 'hooks';

const TabComponent = observer((props) => {
  const { tabItem, activeKey, store } = props;
  const { key, isNeedDetail = true } = tabItem;

  const [isDetail, setIsDetail] = useState(false);

  useEffect(() => {
    if (!isDetail && !isEmpty(store.detail)) {
      setIsDetail(true);
    }
  }, [store.detail]);

  if (isNeedDetail) {
    return activeKey === key && isDetail ? (
      <tabItem.component currentTab={tabItem} store={store} />
    ) : null;
  }
  return <tabItem.component currentTab={tabItem} />;
});

const Tab = (props) => {
  const { tabs, className, store } = props;
  const { detail } = store;
  const { routing } = useRootStore();
  const urlParams = useQuery();

  const [availableTabs, setAvailableTabs] = useState([]);
  const [activeKey, setActiveKey] = useState('');
  const [tabLoading, setTabLoading] = useState(true);

  useEffect(() => {
    if (!detail) {
      setAvailableTabs(tabs);
      setActiveKey(tabs[0].key);
      setTabLoading(false);
    } else {
      const _availableTabs = tabs.filter((tabItem) => {
        const { allowed } = tabItem;

        if (allowed === undefined) return true;

        return allowed && allowed(detail);
      });
      const _activeKey =
        _availableTabs.find((it) => it.key === urlParams.tab)?.key ||
        _availableTabs[0].key;

      if (!isEmpty(detail)) {
        setActiveKey(_activeKey);
        setAvailableTabs(_availableTabs);
        setTabLoading(false);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail]);

  useEffect(() => {
    const { tab } = urlParams;
    const _activeKey = availableTabs.find((item) => item.key === tab)?.key;
    if (_activeKey && activeKey !== _activeKey) {
      setActiveKey(_activeKey);
    }
  }, [urlParams.tab]);

  const handleChangeTab = (tab) => {
    if (tab === activeKey) return;
    routing.query({ tab }, false);
    setActiveKey(tab);
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

export default observer(Tab);
