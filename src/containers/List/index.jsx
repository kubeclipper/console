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
import React, { useState, useEffect } from 'react';
import { useParams, useRouteMatch } from 'react-router-dom';
import { useQuery } from 'hooks';
import { parse } from 'qs';
import classnames from 'classnames';
import { toJS } from 'mobx';
import { isEmpty, get, omit, uniq } from 'lodash';
import BaseTable from 'components/Tables/Base';
import Notify from 'components/Notify';
import styles from './index.less';
import { useRootStore } from 'stores';
import { initTagByUrlParams, generateUrlParamsByTag } from 'utils';

/**
 * notify Error
 * @param {*} e
 * @param {*} name
 * @returns
 */
const notifyError = (e, name) => {
  if (e.status === 401) return null;
  return Notify.errorWithDetail(e, t('Get {name} error.', { name }));
};

const mergeFieldSelector = (field1, field2) => {
  const val1 = get(field1, 'fieldSelector') ?? '';
  const val2 = get(field2, 'fieldSelector') ?? '';

  if (val1 && val2) {
    const data = uniq([...val1?.split(','), ...val2?.split(',')]);

    return data.join(',');
  }
  if (!val1) return val2;
  if (!val2) return val1;
  return '';
};

function BaseList(props) {
  const params = useParams();

  const { routing } = useRootStore();
  let dataTimer = null;
  const dataDuration = 5;

  const {
    name,
    rowKey,
    searchFilters,
    columns,
    actionConfigs = [],
    store,
    showSelectFilter,
    className,
    hasTab,
    transitionStatusList,
    transitionDataIndex,
    expandable,
    selectFilterOptions,
    getData: propsGetData,
    isAction,
    propsParams,
    hideSearch,
    currentTab,
    isRenderFooter,
    isShowDownLoadIcon,
    isShowEyeIcon,
  } = props;

  const { list } = store;
  const {
    primaryActions = [],
    batchActions = [],
    rowActions = [],
  } = actionConfigs;

  const urlParams = useQuery();
  const match = useRouteMatch();

  const initFilters = initTagByUrlParams(urlParams, searchFilters);
  const [filters, setFilters] = useState(initFilters);

  const [tagByUrl, setTagsByUrl] = useState({});

  useEffect(() => {
    const unsubscribe = routing.history.subscribe((_location) => {
      if (_location.pathname === match.url) {
        const locationParams = parse(_location.search.slice(1));
        const tags = initTagByUrlParams(locationParams, searchFilters);

        setTagsByUrl(tags);
        fetchData(locationParams);
      }
    });

    return () => {
      unsubscribe();
      clearTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = (locationParams, _params = {}) => {
    if (!isRenderFooter) _params.limit = -1;

    const _locationParams = omit(locationParams, ['tab']);

    if (propsGetData) {
      propsGetData({ ..._locationParams, ..._params });
      return;
    }

    let dataParams = { ..._locationParams, ...propsParams };
    if (!isEmpty(_params)) {
      dataParams = { ...dataParams, ..._params };
    }

    dataParams.fieldSelector = mergeFieldSelector(_locationParams, propsParams);

    getData(dataParams);
  };

  const handleSelectRowKeys = (keys) => store.setSelectRowKeys('list', keys);

  /**
   * refresh
   */
  const handleRefresh = (silent = false) => {
    const { page, limit, reverse, filters: _filters } = list;

    const _params = {
      page,
      limit,
      reverse,
      silent,
      ...toJS(_filters),
    };
    handleFetch(_params, true);
  };

  /**
   * fetch list
   * @param {*} _params
   * @param {*} refresh
   * @returns
   */
  const handleFetch = (_params, refresh) => {
    if (refresh) {
      fetchData(urlParams, _params);
      return;
    }
    const { limit, page, reverse } = _params;

    routing.query(
      {
        page,
        limit,
        reverse,
      },
      refresh
    );
  };

  /**
   * filter list data
   * @param {*} _filters
   */
  const handleFilterChange = (_filters) => {
    const { page, limit, reverse, ...rest } = _filters;

    setFilters(rest);

    const queryParams = {
      reverse,
      page,
      limit,
      ...generateUrlParamsByTag(rest, searchFilters, propsParams),
    };
    if (!isEmpty(currentTab)) queryParams.tab = currentTab.key;

    routing.query(queryParams, true);
  };

  const getTableProps = {
    onRefresh: handleRefresh,
    onFetch: handleFetch,
    onSelectRowKeys: handleSelectRowKeys,
    onFilterChange: handleFilterChange,
    hideCustom: false,
    hideSearch,
    hideRefresh: false,
  };

  const getEnabledTableProps = () => {
    if (isEmpty(batchActions)) {
      getTableProps.onSelectRowKeys = null;
    }

    return getTableProps;
  };

  const fetchListWithTry = async (func) => {
    try {
      func && (await func());
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('err', e);
      notifyError(e, name);
      list.isLoading = false;
    }
  };

  const getData = async ({ silent, ..._params } = {}) => {
    silent && (list.silent = true);
    const newParams = {
      ...match.params,
      ..._params,
    };

    fetchListWithTry(async () => {
      await store.fetchList({ ...newParams });
      list.silent = false;
    });
  };

  const setFreshDataTimer = () => {
    if (dataTimer) {
      return;
    }
    dataTimer = setTimeout(() => {
      handleRefresh(true);
      dataTimer = null;
    }, dataDuration * 1000);
  };

  const clearTimer = () => {
    clearTimeout(dataTimer);
    dataTimer = null;
  };

  const getCheckboxProps = (record) => ({
    disabled: false,
    name: record.name,
  });

  const tableHeight = () => {
    const tabOtherHeight = 326;
    const otherHeight = 272;

    const height = window.innerHeight;
    if (hasTab) {
      return height - tabOtherHeight;
    }
    const id = params?.id;
    return id ? -1 : height - otherHeight;
  };

  const getDownloadData = async () => {
    // only used for donwload all and pagination by backend
    const result = await props.store.fetchListByDownload({
      ...propsParams,
      limit: list.total,
    });
    return result;
  };

  const itemInTransitionFunction = (item) => {
    const status = get(item, transitionDataIndex);
    return transitionStatusList.includes(status);
  };

  const checkRefresh = (datas) => {
    const hasTransData = datas.some((item) => itemInTransitionFunction(item));

    if (hasTransData) {
      setFreshDataTimer();
    } else {
      clearTimer();
    }
  };

  return (
    <div className={classnames(styles.wrapper, 'list-container', className)}>
      <BaseTable
        store={store}
        checkRefresh={checkRefresh}
        resourceName={name}
        columns={columns}
        filters={{
          ...toJS(list.filters),
          ...filters,
        }}
        searchFilters={searchFilters}
        primaryActions={primaryActions}
        batchActions={batchActions}
        itemActions={rowActions}
        getCheckboxProps={getCheckboxProps}
        rowKey={rowKey}
        scrollY={tableHeight}
        getDownloadData={getDownloadData}
        containerProps={{ ...props, match }}
        expandable={expandable()}
        showSelectFilter={showSelectFilter}
        selectFilterOptions={selectFilterOptions}
        isAction={isAction}
        tagByUrl={tagByUrl}
        isRenderFooter={isRenderFooter}
        isShowDownLoadIcon={isShowDownLoadIcon}
        isShowEyeIcon={isShowEyeIcon}
        {...getEnabledTableProps()}
      />
    </div>
  );
}

BaseList.defaultProps = {
  columns: [],
  transitionStatusList: [],
  showSelectFilter: false,
  className: '',
  hasTab: false,
  selectFilterOptions: [],
  transitionDataIndex: 'status',
  expandable: () => ({
    expandedRowRender: null,
    rowExpandable: false,
  }),
  rowKey: 'id',
  isAction: true,
  currentTab: {},
  isRenderFooter: true,
};

export default BaseList;
