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
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useContext,
} from 'react';
import { useParams } from 'react-router-dom';
import classnames from 'classnames';
import { isEmpty, get } from 'lodash';
import { renderFilterMap } from 'utils';
import { Button, Divider, Typography, Skeleton } from 'antd';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';
import NotFound from 'components/NotFound';
import Infos from 'components/Infos';
import styles from './index.less';
import { useRootStore } from 'stores';
import ItemAction from 'components/Tables/Base/ItemAction';
import Tab from 'src/containers/Tab/TrendsTab';
import { useInterval } from 'hooks';

const { Paragraph } = Typography;
export const TabDetailContext = React.createContext();

const DetailInfos = observer(() => {
  const { store, goBack, detailInfos } = useContext(TabDetailContext);
  const [collapsed, setCollapsed] = useState(false);
  const { isLoading, detail } = store;
  const { id } = useParams();

  const detailTitle = () => {
    const icon = collapsed ? <DownOutlined /> : <UpOutlined />;
    const handleDetailInfo = () => {
      setCollapsed(!collapsed);
    };

    return (
      <div>
        <span className={styles['title-label']}>ID:</span>
        <span className={styles['header-title']}>
          <Paragraph style={{ display: 'inherit' }} copyable>
            {id}
          </Paragraph>
        </span>
        <Divider type="vertical" className={styles['header-divider']} />
        <Button onClick={goBack} type="link">
          {t('Back')}
        </Button>
        {/* {renderTitleAction} */}
        <Button
          onClick={handleDetailInfo}
          icon={icon}
          type="link"
          className={styles['header-button']}
        />
      </div>
    );
  };

  const getDesc = (data, dataConf) => {
    const { dataIndex, render, valueRender } = dataConf;
    if (render) {
      return render(data[dataIndex], data);
    }
    if (valueRender) {
      const renderFunc = renderFilterMap[valueRender];
      return renderFunc && renderFunc(data[dataIndex]);
    }
    const desc = data[dataIndex];
    if (desc === undefined) {
      return '-';
    }
    return desc;
  };

  const descriptions = collapsed
    ? []
    : detailInfos.map((it) => {
        const { title, dataIndex, copyable } = it;
        let desc;
        if (isLoading || !detail || isEmpty(detail)) {
          desc = '-';
        } else {
          desc = getDesc(detail, it);
          if (desc !== '-') {
            if (
              copyable ||
              dataIndex.toLowerCase().indexOf('id') === 0 ||
              dataIndex.toLowerCase().indexOf('_id') >= 0
            ) {
              desc = (
                <Paragraph style={{ margin: 0 }} copyable>
                  {desc}
                </Paragraph>
              );
            }
          }
        }
        return {
          label: title,
          content: desc,
        };
      });

  return (
    <Skeleton active loading={isLoading}>
      <div className={styles.header}>
        <Infos
          title={detailTitle()}
          descriptions={descriptions}
          loading={store.isLoading}
        />
      </div>
    </Skeleton>
  );
});

const Actions = observer(() => {
  const { store, goBack, actionConfigs, fetchData } =
    useContext(TabDetailContext);
  const { detail, isLoading } = store;
  if (isEmpty(detail) || isLoading) {
    return null;
  }
  const onFinishAction = (success, fail, isDelete, afterSubmit) => {
    if (success && isDelete) {
      goBack();
    } else {
      fetchData(true);
      afterSubmit?.();
    }
  };

  return (
    <div className={styles['action-wrapper']}>
      <ItemAction
        actions={actionConfigs.rowActions}
        onFinishAction={onFinishAction}
        item={detail}
      />
    </div>
  );
});

const TabDetail = (props) => {
  const {
    store,
    name,
    listUrl,
    className,
    transitionStatusList = [],
    transitionDataIndex = 'status',
    tabs,
  } = props;

  const [notFound, setNotFound] = useState(false);
  const { routing } = useRootStore();

  const detail = toJS(store.detail);

  const params = useParams();
  /* 每次渲染 useParams 是不同的引用，缓存 params */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoParams = useMemo(() => params, [params.id]);
  const fetchData = useCallback(
    async (silent) => {
      await store.fetchDetail(memoParams, silent).catch(_catch);
    },
    [memoParams, store]
  );

  const updateData = useCallback(async () => {
    await store.updateDetail(memoParams).catch(_catch);
  }, [memoParams, store]);

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  const isTransStatus = transitionStatusList.includes(
    get(detail, transitionDataIndex)
  );

  useInterval(
    () => {
      updateData() || fetchData(true);
    },
    isTransStatus ? 5000 : null
  );

  const goBack = () => {
    routing.push(listUrl);
  };

  const _catch = (e) => {
    const notFoundRegx = /Unable to find/;

    if (
      e.code === 404 ||
      e.status === 404 ||
      e.message === 'NotFound' ||
      notFoundRegx.test(e.message)
    ) {
      setNotFound(true);
    }
  };

  if (notFound) {
    return <NotFound title={t(`${name}s`)} link={listUrl} />;
  }

  return (
    <TabDetailContext.Provider value={{ ...props, goBack, fetchData }}>
      <div className={classnames(styles.main, className)}>
        <Actions />
        <DetailInfos />
        <Tab tabs={tabs} className={className} store={store} />
      </div>
    </TabDetailContext.Provider>
  );
};

TabDetail.defaultProps = {
  listUrl: '/base/tmp',
  name: '',
  module: '',
  authKey: '',
  tabs: [],
  detailInfos: [],
  className: '',
  renderTitleAction: null,
  actionConfigs: {
    rowActions: {
      moreActions: [],
    },
    batchActions: [],
    primaryActions: [],
  },
};

export default observer(TabDetail);
