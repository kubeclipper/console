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
import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { Observer, useObserver } from 'mobx-react';
import { isEmpty, isString } from 'lodash';
import { Button, Dropdown } from 'antd';
import { SyncOutlined, EyeOutlined } from '@ant-design/icons';

import PrimaryAction from 'components/Tables/Base/PrimaryAction';
import BatchAction from 'components/Tables/Base/BatchAction';
import CustomColumns from 'components/Tables/HeaderIcons/CustomColumns';
import Download from 'components/Tables/HeaderIcons/Download';

import { batchActionList, getDataIndex } from './utils';
import styles from './index.less';

const BatchActions = ({
  rowKey,
  selectedRowKeys,
  data = [],
  batchActions,
  containerProps,
  handleRefresh,
  onSelectRowKeysChange,
}) => {
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
      onSelectRowKeys={onSelectRowKeysChange}
    />
  );
};

const CustomEyeIcon = ({ hideCustom, hideRow, hideableRow, handleRowHide }) => {
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

const TableHeader = (props) => {
  const {
    action,
    actionConfigs,
    containerProps,
    selectedRowKeys,
    onSelectRowKeysChange,
    hideRefresh,
    hideCustom,
    isShowEyeIcon,
    rowKey,
    columns,
  } = props;
  // 小眼睛 列显示/隐藏
  const [hideRow, setHideRow] = useState([]);
  const [hideableRow, setHideableRow] = useState([]);
  const [hideableColValues, setHideableColValues] = useState([]);

  useEffect(() => {
    const result = columns
      .filter((column) => !column.hidden)
      .filter((column) => column.isHideable)
      .map((column) => ({
        label: column.title,
        value: getDataIndex(column.dataIndex) || column.key,
      }));
    setHideableRow(result);
    setHideableColValues(result.map((item) => item.value));
  }, [columns]);

  const handleRowHide = (_columns) => {
    setHideRow(hideableColValues.filter((value) => !_columns.includes(value)));
  };

  const { primaryActions = [], batchActions = [] } = actionConfigs;

  const isHeaderLeftNoAction = isEmpty(primaryActions) && isEmpty(batchActions);

  const handleRefresh = () => action.reload();

  const RefreshIcon = () =>
    !hideRefresh ? (
      <Button type="default" icon={<SyncOutlined />} onClick={handleRefresh} />
    ) : null;

  // const DownloadIcon = ({ data, total }) => {
  //   if (!isShowDownLoadIcon) return '';

  //   const getValueRenderFunc = (valueRender) => {
  //     if (isString(valueRender)) {
  //       return renderFilterMap[valueRender];
  //     }
  //     return null;
  //   };

  //   return (
  //     <Download
  //       datas={data}
  //       columns={columns}
  //       total={total}
  //       getValueRenderFunc={getValueRenderFunc}
  //       resourceName={resourceName}
  //       getData={getDownloadData}
  //     />
  //   );
  // };

  return (
    <div className={styles['table-header']}>
      <div
        className={classNames(styles['table-header-btns'], 'table-header-btns')}
      >
        <div className={styles['table-header-btns-left']}>
          <PrimaryAction
            primaryActions={primaryActions}
            containerProps={containerProps}
            onFinishAction={handleRefresh}
          />
          {/* <Observer>
            {() => ( */}
          <BatchActions
            rowKey={rowKey}
            selectedRowKeys={selectedRowKeys}
            onSelectRowKeysChange={onSelectRowKeysChange}
            data={action.dataSource}
            batchActions={batchActions}
            containerProps={containerProps}
            handleRefresh={handleRefresh}
            hideCustom={hideCustom}
          />
          {/* )}
          </Observer> */}
        </div>
        <div
          className={`${isHeaderLeftNoAction && styles['table-header-flex']}
               ${styles['table-header-btns-right']}`}
        >
          <div className={styles['search-left']}>{/* <SearchInput /> */}</div>
          <div
            className={`${isHeaderLeftNoAction && styles['table-header-flex']}
                 ${styles['icons-right']}`}
          >
            <RefreshIcon />
            {/* {isShowEyeIcon ? (
              <CustomEyeIcon
                hideCustom={hideCustom}
                hideRow={hideRow}
                hideableRow={hideableRow}
                handleRowHide={handleRowHide}
              />
            ) : (
              ''
            )} */}
            {/* <Observer>
              {() => (
                <DownloadIcon
                  data={action.dataSource}
                  total={action.pageInfo.total}
                />
              )}
            </Observer> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableHeader;
