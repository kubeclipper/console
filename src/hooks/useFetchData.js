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

/* eslint-disable no-unused-vars */
import { useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import useMountMergeState from './useMountMergeState';
import useRefFunction from './useRefFunction';
import useDebounceFn from './useDebounceFn';
import usePrevious from './usePrevious';
import useDeepCompareEffect from './useDeepCompareEffect';
import { runFunction } from 'utils';

/**
 * 合并分页配置和默认配置
 * @param {*} param0
 * @returns
 */
const mergeOptionAndPageInfo = ({ pageInfo }) => {
  if (pageInfo) {
    const { current, defaultCurrent, pageSize, defaultPageSize } = pageInfo;
    return {
      current: current || defaultCurrent || 1,
      total: 0,
      pageSize: pageSize || defaultPageSize || 10,
    };
  }
  return { current: 1, total: 0, pageSize: 10 };
};

const useFetchData = (getData, defaultData, options) => {
  const {
    onLoad,
    manual,
    polling,
    onRequestError,
    debounceTime = 20,
  } = options || {};

  /* 标记组件卸载 */
  const umountRef = useRef(false);

  /* 轮询的 setTime ID 存储 */
  const pollingSetTimeRef = useRef();

  /* 列表 dataSource */
  const [list, setList] = useMountMergeState(defaultData, {
    value: options?.dataSource,
    onChange: options?.onDataSourceChange,
  });

  /* 列表 loading */
  const [tableLoading, setLoading] = useMountMergeState(false, {
    value: options?.loading,
    onChange: options?.onLoadingChange,
  });

  /* 分页数据 */
  const [pageInfo, setPageInfoState] = useMountMergeState(
    () => mergeOptionAndPageInfo(options),
    {
      onChange: options?.onPageInfoChange,
    }
  );

  /* 更新分页 */
  const setPageInfo = useRefFunction((changePageInfo) => {
    if (
      changePageInfo.current !== pageInfo.current ||
      changePageInfo.pageSize !== pageInfo.pageSize ||
      changePageInfo.total !== pageInfo.total
    ) {
      setPageInfoState(changePageInfo);
    }
  });

  // pre state
  const prePage = usePrevious(pageInfo?.current);
  const prePageSize = usePrevious(pageInfo?.pageSize);

  /* 标记是否正在请求中 */
  const requesting = useRef(false);

  /* 更新列表 data 和分页信息 */
  const setDataAndPage = (newData, dataTotal) => {
    setList(newData);

    if (pageInfo?.total !== dataTotal) {
      setPageInfo({
        ...pageInfo,
        total: dataTotal || newData.length,
      });
    }
  };

  /* request 结束 */
  const requestFinally = useRefFunction(() => {
    setTimeout(() => {
      setLoading(false);
    }, 0);
  });

  /* 请求数据 */
  const fetchList = async (isPolling = false) => {
    if (tableLoading || requesting.current || !getData) {
      return [];
    }

    if (!isPolling) {
      setLoading(true);
    } else {
      // setPollingLoading(true);
    }

    requesting.current = true;

    const { pageSize, current } = pageInfo || {};

    try {
      const pageParams =
        options?.pageInfo !== false
          ? {
              current,
              pageSize,
            }
          : undefined;

      const {
        data = [],
        // success,
        page = 1,
        limit = 10,
        total = 0,
        ...rest
      } = (await getData(pageParams)) || {};
      // 如果失败了，直接返回，不走剩下的逻辑了
      // if (success === false) return [];

      const responseData = data;
      // const responseData = postDataPipeline(
      //   data,
      //   [options.postData].filter((item) => item)
      // );
      setDataAndPage(responseData, total);
      // onLoad?.(responseData, rest);
      return responseData;
    } catch (e) {
      // 如果没有传递这个方法的话，需要把错误抛出去，以免吞掉错误
      if (onRequestError === undefined) throw new Error(e);
      if (list === undefined) setList([]);
      // onRequestError(e);
    } finally {
      requesting.current = false;
      requestFinally();
    }

    return [];
  };

  /* 防抖请求数据 */
  const fetchListDebounce = useDebounceFn(async (isPolling) => {
    if (pollingSetTimeRef.current) {
      clearTimeout(pollingSetTimeRef.current);
    }
    const msg = await fetchList(isPolling);

    const needPolling = runFunction(polling, msg);

    // 如果需要轮询，设置一段时间后执行，如果解除了挂载，删除一下
    if (needPolling && !umountRef.current) {
      pollingSetTimeRef.current = setTimeout(() => {
        fetchListDebounce.run(needPolling);
      }, Math.max(needPolling, 2000));
    }
    return msg;
  }, debounceTime || 10);

  /* 轮询结束，销毁定时器 */
  useEffect(() => {
    if (!polling) {
      clearTimeout(pollingSetTimeRef.current);
    }
    if (polling) {
      fetchListDebounce.run(true);
    }
    return () => {
      clearTimeout(pollingSetTimeRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [polling]);

  /* 卸载与否 */
  useLayoutEffect(() => {
    umountRef.current = false;

    return () => {
      umountRef.current = true;
    };
  }, []);

  /* page current 改变的时候自动刷新 */
  useEffect(() => {
    const { current, pageSize } = pageInfo || {};

    if (
      (!prePage || prePage === current) &&
      (!prePageSize || prePageSize === pageSize)
    ) {
      return;
    }

    if ((options.pageInfo && list && list?.length > pageSize) || 0) {
      return;
    }

    // 如果 list 的长度大于 pageSize 的长度
    // 说明是一个假分页
    // (pageIndex - 1 || 1) 至少要第一页
    // 在第一页大于 10
    // 第二页也应该是大于 10
    if (current !== undefined && list && list.length <= pageSize) {
      fetchListDebounce.run(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageInfo?.current]);

  /* pageSize 修改后自动刷新并返回第一页 */
  useEffect(() => {
    if (!prePageSize) {
      return;
    }
    fetchListDebounce.run(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageInfo?.pageSize]);

  /* 其他查询参数改变自动刷新 */
  useDeepCompareEffect(() => {}, []);

  return {
    dataSource: list,
    setDataSource: setList,
    loading: tableLoading,
    reload: async () => {
      await fetchListDebounce.run(false);
    },
    pageInfo,
    // pollingLoading,
    reset: async () => {
      const { pageInfo: optionPageInfo } = options || {};
      const { defaultCurrent = 1, defaultPageSize = 10 } = optionPageInfo || {};
      const initialPageInfo = {
        current: defaultCurrent,
        total: 0,
        pageSize: defaultPageSize,
      };
      setPageInfo(initialPageInfo);
    },
    setPageInfo: async (newPageInfo) => {
      setPageInfo({
        ...pageInfo,
        ...newPageInfo,
      });
    },
  };
};

export default useFetchData;
