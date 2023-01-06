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

import React, { useMemo } from 'react';
import { Table } from 'antd';
import Pagination from 'components/Pagination';
import classNames from 'classnames';

import styles from './index.less';

/**
 *TableRender
 */
function TableRender(props) {
  const {
    rowKey,
    rowSelection,
    tableClassName,
    tableStyle,
    action,
    pagination,
    tableColumn: tableColumns,
    className: propClassName,
    style,
    toolbarDom,
    isPageByServer,
    hideTotal,
    ...rest
  } = props;

  /* 计算 columns */
  const columns = useMemo(() => {
    const loopFilter = (column) => column.filter(Boolean);
    return loopFilter(tableColumns);
  }, [tableColumns]);

  const className = classNames(styles.table, 'sl-table', propClassName);

  /* 自定义分页组件 */
  const renderFooter = (currentPageData) => {
    if (!isPageByServer) return null;

    const handlePageChange = (current, pageSize) =>
      action.setPageInfo({ current, pageSize });

    const { current, pageSize, total } = action.pageInfo;

    return (
      <Pagination
        current={current}
        pageSize={pageSize}
        onChange={handlePageChange}
        currentDataSize={currentPageData.length}
        total={total}
        isLoading={action.isLoading}
        hideTotal={hideTotal}
      />
    );
  };

  const getTableProps = () => ({
    ...rest,
    // size,
    rowSelection: rowSelection === false ? undefined : rowSelection,
    className: tableClassName,
    style: tableStyle,
    columns: columns.map((item) =>
      item.isExtraColumns ? item.extraColumn : item
    ),
    loading: action.loading,
    dataSource: action.dataSource,
    pagination: isPageByServer ? false : pagination,
    footer: renderFooter,
    onChange: (changePagination, filters, sorter, extra) => {
      rest.onChange?.(changePagination, filters, sorter, extra);
    },
  });
  /* 默认 table dom */
  const baseTableDom = <Table {...getTableProps()} rowKey={rowKey} />;

  /* 自定义的 render */
  const tableDom = props.tableViewRender
    ? props.tableViewRender(
        {
          ...getTableProps(),
          rowSelection: rowSelection !== false ? rowSelection : undefined,
        },
        baseTableDom
      )
    : baseTableDom;

  const tableContentDom = useMemo(() => {
    if (!props.name) {
      return (
        <>
          {toolbarDom}
          {tableDom}
        </>
      );
    }

    return (
      <>
        {toolbarDom}
        {tableDom}
      </>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.loading, tableDom, toolbarDom]);

  const renderTable = () => {
    if (props.tableRender) {
      return props.tableRender(props, tableContentDom, {
        toolbar: toolbarDom || undefined,
        table: tableDom || undefined,
      });
    }
    return tableContentDom;
  };

  return (
    <div
      className={classNames(className, {
        [`${className}-polling`]: action.pollingLoading,
      })}
      style={style}
    >
      {renderTable()}
    </div>
  );
}

export default TableRender;
