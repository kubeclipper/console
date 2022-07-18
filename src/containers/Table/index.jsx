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

import React, { useMemo, useEffect, useRef, useCallback } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router-dom';

import { Typography } from 'antd';
import classNames from 'classnames';
import { useFetchData, useMountMergeState } from 'hooks';
import { get, isEmpty } from 'lodash';
import ItemAction from 'components/Tables/Base/ItemAction';

import TableHeader from './TableHeader';
import TableRender from './TableRender';
import {
  checkIsStatusColumn,
  getTipRender,
  getStatusRender,
  getRender,
  hasItemActions,
} from './utils';
import styles from './index.less';

/**
 * ProTable
 * @param {*} props
 * @returns
 */
function ProTable(props) {
  const {
    store,
    cardBordered,
    request,
    className: propsClassName,
    params = {},
    defaultData,
    headerTitle,
    postData,
    ghost,
    pagination: propsPagination,
    actionRef: propsActionRef,
    columns: propsColumns = [],
    toolBarRender,
    onLoad,
    onRequestError,
    style,
    cardProps,
    tableStyle,
    tableClassName,
    options,
    search,
    name: isEditorTable,
    onLoadingChange,
    rowSelection: propsRowSelection = true,
    beforeSearchSubmit,
    tableAlertRender,
    formRef: propRef,
    // columnEmptyText = '-',
    toolbar,
    rowKey = 'id',
    manualRequest,
    polling,
    tooltip,
    isPageByServer = true,
    hideTotal = false,
    actionConfigs,
    isAction = true,
    hideRefresh = false,
    hideCustom = false,
    isShowEyeIcon = true,
    // eslint-disable-next-line no-unused-vars
    ...rest
  } = props;

  const match = useRouteMatch();
  const containerProps = { match }; // TODO { ...props, match }

  const className = classNames(
    styles.wrapper,
    'list-container',
    propsClassName
  );

  const {
    primaryActions = [],
    batchActions = [],
    rowActions = [],
  } = actionConfigs;

  /** 分页初始化  */
  const fetchPagination =
    typeof propsPagination === 'object'
      ? propsPagination
      : { defaultCurrent: 1, defaultPageSize: 10, pageSize: 10, current: 1 };

  // ============================ useFetchData ============================
  const fetchData = useMemo(() => {
    if (request) {
      return async (pageParams) => {
        const actionParams = {
          ...pageParams,
          ...params,
        };
        const response = await request(actionParams);
        return response;
      };
    }

    return async (pageParams) => {
      // 修正参数，api 中使用 limit 与 page
      const newPageParams = pageParams
        ? { limit: pageParams?.pageSize, page: pageParams?.current }
        : {};

      const actionParams = {
        ...(newPageParams || {}),
        // ...formSearch,
        ...params,
      };

      await store.fetchList(actionParams);

      return toJS(store.list);
    };
  }, [params, store, request]);

  const action = useFetchData(fetchData, defaultData, {
    pageInfo: propsPagination === false ? false : fetchPagination,
    loading: props.loading,
    dataSource: props.dataSource,
    onDataSourceChange: props.onDataSourceChange,
    onLoad,
    onLoadingChange,
    onRequestError,
    postData,
    revalidateOnFocus: props.revalidateOnFocus ?? true,
    // manual: formSearch === undefined,
    polling,
    effects: [
      JSON.stringify(params),
      // JSON.stringify(formSearch),
      // JSON.stringify(proFilter),
      // JSON.stringify(proSort),
    ],
    debounceTime: props.debounceTime,
    onPageInfoChange: (pageInfo) => {
      if (!propsPagination) return;

      propsPagination?.onChange?.(pageInfo.current, pageInfo.pageSize);
      propsPagination?.onShowSizeChange?.(pageInfo.current, pageInfo.pageSize);
    },
  });
  // ============================ END ============================

  /** 初始化数据 */
  useEffect(() => {
    if (props.manualRequest) return;

    action.reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* 计算分页 */
  // const pagination = useMemo(() => {
  //   const newPropsPagination =
  //     propsPagination === false ? false : { ...propsPagination };
  //   const pageConfig = {
  //     ...action.pageInfo,
  //     setPageInfo: ({ pageSize, current }) => {
  //       const { pageInfo } = action;
  //       // pageSize 发生改变，并且你不是在第一页，切回到第一页
  //       // 这样可以防止出现 跳转到一个空的数据页的问题
  //       if (pageSize === pageInfo.pageSize || pageInfo.current === 1) {
  //         action.setPageInfo({ pageSize, current });
  //         return;
  //       }

  //       // 通过request的时候清空数据，然后刷新不然可能会导致 pageSize 没有数据多
  //       if (request) action.setDataSource([]);
  //       action.setPageInfo({
  //         pageSize,
  //         current: 1,
  //       });
  //     },
  //   };
  //   if (request && newPropsPagination) {
  //     delete newPropsPagination.onChange;
  //     delete newPropsPagination.onShowSizeChange;
  //   }
  //   return mergePagination(newPropsPagination, pageConfig, intl);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [propsPagination, action, intl]);

  // --------------------------  行选择相关 start  --------------------------
  const [selectedRowKeys, setSelectedRowKeys] = useMountMergeState(
    propsRowSelection ? propsRowSelection?.defaultSelectedRowKeys : undefined,
    {
      value: propsRowSelection ? propsRowSelection.selectedRowKeys : undefined,
    }
  );

  const selectedRowsRef = useRef([]);

  const setSelectedRowsAndKey = useCallback(
    (keys, rows) => {
      setSelectedRowKeys(keys);
      if (!propsRowSelection || !propsRowSelection?.selectedRowKeys) {
        selectedRowsRef.current = rows;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setSelectedRowKeys]
  );

  const rowSelection = {
    selectedRowKeys,
    getCheckboxProps: (record) => ({
      disabled: false,
      name: record.name,
    }),
    ...propsRowSelection,
    onChange: (keys, rows) => {
      if (propsRowSelection && propsRowSelection.onChange) {
        propsRowSelection.onChange(keys, rows);
      }
      setSelectedRowsAndKey(keys, rows);
    },
  };
  // --------------------------------  end  ---------------------------------

  useEffect(() => {
    // 显示操作栏
  }, [selectedRowKeys]);

  //  ----------------------------- 列计算相关 start --------------------------
  const tableColumn = useMemo(() => {
    const currentColumns = propsColumns.filter((it) => !it.hidden);
    // .filter((it) => !includes(hideRow, getDataIndex(it.dataIndex)));

    const getBaseColumns = (columns) =>
      columns.map((column) => {
        const { Paragraph } = Typography;
        const {
          sortable,
          dataIndex,
          valueRender,
          sorter,
          sortOrder,
          render,
          copyable,
          tip,
          isStatus,
          extraNameIndex,
          extraNameCopyable,
          ...rests
        } = column;

        let newRender = render || getRender(valueRender);
        if (checkIsStatusColumn(dataIndex, isStatus)) {
          newRender = getStatusRender(newRender);
        }

        if (copyable || extraNameIndex || extraNameCopyable) {
          newRender = (value, record) => {
            const nameProps = {
              style: { marginBottom: 0 },
            };
            if (copyable) {
              nameProps.copyable = { text: value };
            }

            const extraVal = get(record, extraNameIndex, '-');
            const extraProps = {
              style: { color: 'rgba(0, 0, 0, 0.45)' },
            };
            if (extraNameCopyable) {
              extraProps.copyable = { text: extraVal };
            }

            if (value && value !== '-') {
              return (
                <>
                  <Paragraph {...nameProps}>
                    {render ? render(value, record) : value}
                  </Paragraph>
                  {extraNameIndex ? (
                    <Paragraph {...extraProps}>{extraVal}</Paragraph>
                  ) : (
                    ''
                  )}
                </>
              );
            }
            return '-';
          };
        }
        if (tip) {
          newRender = getTipRender(tip, newRender, dataIndex);
        }
        const newColumn = {
          ...rests,
          dataIndex,
          align: column.align || 'left',
        };

        if (newRender) {
          newColumn.render = newRender;
        }

        const sorters = ['createTime'];
        if (sorters.includes(dataIndex)) {
          newColumn.sorter = true;
        }

        return newColumn;
      });

    const baseColumns = getBaseColumns(currentColumns);

    if (!hasItemActions(rowActions)) {
      return baseColumns;
    }

    const resultColumns = [...baseColumns];
    isAction &&
      resultColumns.push({
        title: t('Action'),
        key: 'operation',
        width: 200,
        render: (text, record, index) => (
          <ItemAction
            actions={rowActions}
            onFinishAction={() => action.reload()}
            item={record}
            index={index}
            containerProps={containerProps}
          />
        ),
      });
    return resultColumns;
  }, [action, propsColumns, rowActions, containerProps, isAction]);
  //  --------------------------------- end ---------------------------------

  const toolbarDom =
    toolBarRender === false ? null : (
      <TableHeader
        action={action}
        hideRefresh={hideRefresh}
        hideCustom={hideCustom}
        isShowEyeIcon={isShowEyeIcon}
        actionConfigs={actionConfigs}
        primaryActions={primaryActions}
        containerProps={containerProps}
        selectedRowKeys={selectedRowKeys}
        onSelectRowKeysChange={setSelectedRowKeys}
        rowKey={rowKey}
        columns={propsColumns}
      />
    );

  return (
    <TableRender
      {...props}
      name={isEditorTable}
      // pagination={pagination}
      rowSelection={
        propsRowSelection !== false && !isEmpty(batchActions)
          ? rowSelection
          : undefined
      }
      className={className}
      tableColumn={tableColumn}
      action={action}
      toolbarDom={toolbarDom}
      // onSortChange={setProSort}
      // onFilterChange={setProFilter}
      rowKey={rowKey}
      isPageByServer={isPageByServer}
      hideTotal={hideTotal}
    />
  );
}

export default observer(ProTable);
