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
import PropTypes from 'prop-types';
import classnames from 'classnames';
import isEqual from 'react-fast-compare';
import { toJS } from 'mobx';
import { Observer, observer } from 'mobx-react';
import { get, isArray, isString, isEmpty, includes, omit } from 'lodash';
import { Button, Table, Input, Typography, Tooltip, Dropdown } from 'antd';
import MagicInput from 'components/MagicInput';
import Pagination from 'components/Pagination';
import Status from 'components/Status';
import {
  EyeOutlined,
  SyncOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import PrimaryAction from './PrimaryAction';
import ItemAction from './ItemAction';
import BatchAction from './BatchAction';
import { renderFilterMap } from 'utils';
import { getAction } from 'utils/allowed';
import { checkPolicy } from 'utils/policy';
import CustomColumns from '../HeaderIcons/CustomColumns';
import Download from '../HeaderIcons/Download';

import styles from './index.less';

const ORDER_MAP = {
  ascend: true,
  descend: false,
};

/**
 *
 * @param {*} dataIndex
 * @returns string
 */
const getDataIndex = (dataIndex) => {
  if (isArray(dataIndex)) {
    return dataIndex.join(',');
  }
  return dataIndex;
};

/**
 * batch Action List
 * @param {Object} containerProps
 * @param {Array} batchActions
 * @returns Array
 */
const batchActionList = (containerProps, batchActions) => {
  const getActionList = (actions) =>
    actions.map((it) => getAction(it, null, containerProps));

  const filterActionByPolicy = (actionList) =>
    actionList.filter((it) => checkPolicy(it.policy));

  const actionList = filterActionByPolicy(getActionList(batchActions));

  return actionList;
};

const BaseTable = (props) => {
  const {
    store,
    className,
    rowKey,
    onSelectRowKeys,
    getCheckboxProps,
    scrollY,
    expandable,
    hideRefresh,
    hideCustom,
    primaryActions,
    batchActions,
    containerProps,
    hideSearch,
    searchFilters = [],
    columns,
    resourceName,
    getDownloadData,
    isRenderFooter,
    hideTotal,
    onFetch,
    handleInputFocus,
    tagByUrl,
    filters,
    isShowDownLoadIcon,
    isShowEyeIcon,
  } = props;

  const { list } = store;

  const isHeaderLeftNoAction = isEmpty(primaryActions) && isEmpty(batchActions);

  const [filtered, setFiltered] = useState({});
  // 小眼睛 列显示/隐藏
  const [hideRow, setHideRow] = useState([]);
  const [hideableRow, setHideableRow] = useState([]);
  const [hideableColValues, setHideableColValues] = useState([]);

  useEffect(() => {
    const result = props.columns
      .filter((column) => !column.hidden)
      .filter((column) => column.isHideable)
      .map((column) => ({
        label: column.title,
        value: getDataIndex(column.dataIndex) || column.key,
      }));
    setHideableRow(result);
    setHideableColValues(result.map((item) => item.value));
  }, [props.columns]);

  const handleRowHide = (_columns) => {
    setHideRow(hideableColValues.filter((value) => !_columns.includes(value)));
  };

  const handleRefresh = (success, fail, isDelete, afterSubmit) => {
    props.onRefresh();
    afterSubmit?.();
  };

  const CustomEyeIcon = () => {
    if (hideCustom) {
      return null;
    }
    const renderRowMenu = () => {
      const getHideColKeys = (cols) => {
        const results = [];
        hideableRow.forEach((item) => {
          if (cols.indexOf(item.value) === -1) {
            results.push(item.value);
          }
        });
        return results;
      };

      return (
        <CustomColumns
          className={styles.columnMenu}
          options={hideableRow}
          value={getHideColKeys(hideRow)}
          onChange={handleRowHide}
        />
      );
    };

    return (
      <Dropdown overlay={renderRowMenu()}>
        <Button
          className={styles['custom-button']}
          type="default"
          icon={<EyeOutlined />}
        />
      </Dropdown>
    );
  };

  const DownloadIcon = ({ data, total }) => {
    if (!isShowDownLoadIcon) return '';

    const getValueRenderFunc = (valueRender) => {
      if (isString(valueRender)) {
        return renderFilterMap[valueRender];
      }
      return null;
    };

    return (
      <Download
        datas={data}
        columns={columns}
        total={total}
        getValueRenderFunc={getValueRenderFunc}
        resourceName={resourceName}
        getData={getDownloadData}
      />
    );
  };

  const RefreshIcon = () =>
    !hideRefresh ? (
      <Button type="default" icon={<SyncOutlined />} onClick={handleRefresh} />
    ) : null;

  const BatchActions = ({ selectedRowKeys, data }) => {
    if (!batchActions) return '';
    const selectedItems = data.filter((it) =>
      selectedRowKeys.includes(it[rowKey])
    );

    return (
      <BatchAction
        visibleButtonNumber={3}
        selectedItemKeys={selectedRowKeys}
        selectedItems={selectedItems}
        batchActions={batchActions}
        actionList={batchActionList(containerProps, batchActions)}
        onFinishAction={handleRefresh}
        containerProps={containerProps}
        onSelectRowKeys={onSelectRowKeys}
      />
    );
  };

  const SearchInput = () => {
    if (hideSearch) {
      return null;
    }

    const handleFilterInput = (tags) => {
      const newFilters = {};
      tags.forEach((n) => {
        newFilters[n.filter.name] = n.value;
      });

      if (
        !isEqual(newFilters, omit(filters, ['page', 'limit', 'reverse', 'tab']))
      ) {
        setFiltered(newFilters);

        const { onFilterChange } = props;
        const { limit, page, reverse } = filters;

        onFilterChange({
          limit,
          page,
          reverse,
          ...newFilters,
        });
      }
    };

    const handleFilterInputText = (e) => {
      const newFilters = {};
      newFilters.keywords = e.currentTarget.value;
      if (!isEqual(newFilters, props.filters)) {
        setFiltered(newFilters);

        props.onFilterChange({
          limit: list.limit,
          page: 1,
          reverse: list.reverse,
          ...newFilters,
        });
      }
    };

    if (searchFilters.length > 0) {
      // eslint-disable-next-line no-inner-declarations
      function areEqual(prev, next) {
        return isEqual(prev.initValue, next.initValue);
      }

      const MemoizedMagicInput = React.memo(MagicInput, areEqual);
      const initValue = !isEmpty(filtered) ? filtered : tagByUrl;

      return (
        <div className={styles['search-row']}>
          <MemoizedMagicInput
            filterParams={searchFilters}
            onInputChange={handleFilterInput}
            initValue={initValue}
          />
        </div>
      );
    }

    return (
      <div className={styles['search-row']}>
        <Input
          placeholder={t('Enter query conditions to filter')}
          onChange={handleFilterInputText}
        />
      </div>
    );
  };

  const TableHeader = () => (
    <div className={styles['table-header']}>
      <div
        className={classnames(styles['table-header-btns'], 'table-header-btns')}
      >
        <div className={styles['table-header-btns-left']}>
          <PrimaryAction
            primaryActions={primaryActions}
            containerProps={containerProps}
            onFinishAction={handleRefresh}
          />
          <Observer>
            {() => (
              <BatchActions
                selectedRowKeys={toJS(list.selectedRowKeys)}
                data={list.data}
              />
            )}
          </Observer>
        </div>
        <div
          className={`${isHeaderLeftNoAction && styles['table-header-flex']}
               ${styles['table-header-btns-right']}`}
        >
          <div className={styles['search-left']}>
            <SearchInput />
          </div>
          <div
            className={`${isHeaderLeftNoAction && styles['table-header-flex']}
                 ${styles['icons-right']}`}
          >
            <RefreshIcon />
            {isShowEyeIcon ? <CustomEyeIcon /> : ''}
            <Observer>
              {() => <DownloadIcon data={list.data} total={list.total} />}
            </Observer>
          </div>
        </div>
      </div>
    </div>
  );

  const handlePageChange = (current, pageSize) => {
    const { reverse } = filters;
    onFetch?.({
      limit: pageSize,
      page: current,
      reverse,
      current,
      ...filtered,
    });
  };

  const CustomTable = observer(() => {
    const expandableProps = expandable.rowExpandable ? { expandable } : {};

    const handleChange = (_, __, sorter) => {
      onFetch(
        {
          limit: list.limit,
          page: list.page,
          current: list.page,
          reverse: ORDER_MAP[sorter.order],
        },
        true
      );
    };

    const getColumns = () => {
      const currentColumns = columns
        .filter((it) => !it.hidden)
        .filter((it) => !includes(hideRow, getDataIndex(it.dataIndex)));

      const checkIsStatusColumn = (dataIndex, isStatus) => {
        if (isStatus) {
          return true;
        }
        return (
          isString(dataIndex) &&
          (dataIndex.toLowerCase().indexOf('status') >= 0 ||
            dataIndex.toLowerCase().indexOf('state') >= 0)
        );
      };

      const getStatusRender = (render) => (value) => {
        const text = render ? render(value) : value;
        return <Status status={value} text={text} />;
      };

      const getTipRender = (tip, render, dataIndex) => {
        const newRender = (value, record) => {
          const tipValue = tip(value, record);
          const realValue = render
            ? render(value, record)
            : get(record, dataIndex);
          if (!tipValue) {
            return realValue;
          }
          return (
            <div>
              {realValue}
              <Tooltip title={tipValue}>
                <QuestionCircleOutlined style={{ marginLeft: 8 }} />
              </Tooltip>
            </div>
          );
        };
        return newRender;
      };

      // eslint-disable-next-line no-shadow
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
            isStatus = false,
            extraNameIndex,
            extraNameCopyable,
            extraRender,
            ...rest
          } = column;

          const getRender = () => {
            if (!valueRender) {
              return null;
            }
            return (value) => {
              const func = isString(valueRender)
                ? renderFilterMap[valueRender]
                : null;
              if (func) {
                return func(value);
              }
              return '-';
            };
          };

          let newRender = render || getRender();
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
                    <div style={{ display: 'flex' }}>
                      <Paragraph {...nameProps}>
                        {render ? render(value, record) : value}
                      </Paragraph>
                      {extraRender?.(value, record)}
                    </div>
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
            ...rest,
            dataIndex,
            align: column.align || 'left',
          };

          if (newRender) {
            newColumn.render = newRender;
          }

          const sorters = ['createTime'];
          if (sorters.includes(dataIndex)) {
            newColumn.sorter = true;
            newColumn.defaultSortOrder = 'descend';
          }

          return newColumn;
        });

      const hasItemActions = () => {
        const { firstAction, moreActions, actionList } = props.itemActions;

        if (firstAction) {
          return true;
        }
        if (moreActions && moreActions.length) {
          return true;
        }
        return actionList && actionList.length > 0;
      };

      const baseColumns = getBaseColumns(currentColumns);
      if (!hasItemActions()) {
        return baseColumns;
      }

      const resultColumns = [...baseColumns];
      props.isAction &&
        resultColumns.push({
          title: t('Action'),
          key: 'operation',
          width: 200,
          render: (text, record, index) => (
            <ItemAction
              actions={props.itemActions}
              onFinishAction={handleRefresh}
              item={record}
              index={index}
              containerProps={containerProps}
            />
          ),
        });
      return resultColumns;
    };

    const renderFooter = (currentPageData) => {
      const onInputFocus = (value) => {
        handleInputFocus && handleInputFocus(value);
      };

      return (
        <Pagination
          current={parseFloat(list.page || 1)}
          pageSize={list.limit > 0 ? parseFloat(list.limit) : 10}
          onChange={handlePageChange}
          currentDataSize={currentPageData.length}
          total={list.total}
          isLoading={list.isLoading}
          onFocusChange={onInputFocus}
          hideTotal={hideTotal}
        />
      );
    };

    const rowSelection = (selectedRowKeys) => {
      if (onSelectRowKeys) {
        if (!isEmpty(batchActionList(containerProps, batchActions))) {
          return {
            selectedRowKeys,
            getCheckboxProps,
            onChange: onSelectRowKeys,
          };
        }
      }
      return null;
    };

    props.checkRefresh(list.data);

    return (
      <Table
        className={classnames(styles.table, 'sl-table', className)}
        rowKey={rowKey}
        columns={getColumns()}
        dataSource={list.data}
        loading={list.silent ? false : list.isLoading}
        onChange={handleChange}
        pagination={false}
        rowSelection={rowSelection(toJS(list.selectedRowKeys))}
        sortDirections={['ascend', 'descend', 'ascend']}
        scroll={{ x: 'max-content', y: scrollY > 0 ? scrollY : 400 }}
        showSorterTooltip={false}
        {...expandableProps}
        footer={(currentPageData) =>
          isRenderFooter ? renderFooter(currentPageData) : null
        }
      />
    );
  });

  return (
    <>
      <TableHeader />
      <CustomTable />
    </>
  );
};

export default BaseTable;

BaseTable.defaultProps = {
  rowKey: 'name',
  onFetch() {},
  hideSearch: false,
  resourceName: '',
  primaryActions: [],
  batchActions: [],
  hideTotal: false,
  isShowDownLoadIcon: true,
  isShowEyeIcon: true,
  isRenderFooter: true,
};

BaseTable.propTypes = {
  columns: PropTypes.array.isRequired,
  filters: PropTypes.object,
  rowKey: PropTypes.any,
  onFetch: PropTypes.func,
  onFilterChange: PropTypes.func,
  onSelectRowKeys: PropTypes.func,
  getCheckboxProps: PropTypes.func,
  hideSearch: PropTypes.bool,
  primaryActions: PropTypes.array,
  batchActions: PropTypes.array,
  resourceName: PropTypes.string,
  expandable: PropTypes.object,
  hideTotal: PropTypes.bool,
  isShowDownLoadIcon: PropTypes.bool,
  isShowEyeIcon: PropTypes.bool,
  isRenderFooter: PropTypes.bool,
};
