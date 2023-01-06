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
import React, { useState } from 'react';
import { Transfer, Table } from 'antd';
import difference from 'lodash/difference';
import PropTypes from 'prop-types';

// Customize Table Transfer
const TableTransfer = ({
  leftColumns,
  rightColumns,
  pageSize,
  ...restProps
}) => (
  <Transfer {...restProps} showSelectAll={false}>
    {({
      direction,
      filteredItems,
      onItemSelectAll,
      onItemSelect,
      selectedKeys: listSelectedKeys,
      disabled: listDisabled,
    }) => {
      const columns = direction === 'left' ? leftColumns : rightColumns;

      const rowSelection = {
        getCheckboxProps: (item) => ({
          disabled: listDisabled || item.disabled,
        }),
        onSelectAll(selected, selectedRows) {
          const treeSelectedKeys = selectedRows
            .filter((item) => !item.disabled)
            .map(({ key }) => key);
          const diffKeys = selected
            ? difference(treeSelectedKeys, listSelectedKeys)
            : difference(listSelectedKeys, treeSelectedKeys);
          onItemSelectAll(diffKeys, selected);
        },
        onSelect({ key }, selected) {
          onItemSelect(key, selected);
        },
        selectedRowKeys: listSelectedKeys,
      };
      const pagination = {
        pageSize,
      };

      return (
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredItems}
          rowKey={(record) => record.id}
          pagination={pagination}
          size="small"
          style={{ pointerEvents: listDisabled ? 'none' : null }}
          onRow={({ key, disabled: itemDisabled }) => ({
            onClick: () => {
              if (itemDisabled || listDisabled) return;
              onItemSelect(key, !listSelectedKeys.includes(key));
            },
          })}
        />
      );
    }}
  </Transfer>
);

export default function CustomTransfer(props) {
  const {
    value,
    onChange,
    disabled,
    showSearch,
    leftTableColumns,
    rightTableColumns,
    dataSource,
    filterOption,
    titles,
    pageSize,
  } = props;
  const [targetKeys, setTargetKeys] = useState(value);

  const handleOnChange = (nextTargetKeys) => {
    setTargetKeys(nextTargetKeys);
    onChange(nextTargetKeys);
  };

  return (
    <>
      <TableTransfer
        titles={titles}
        pageSize={pageSize}
        dataSource={dataSource}
        targetKeys={targetKeys}
        disabled={disabled}
        showSearch={showSearch}
        onChange={handleOnChange}
        filterOption={filterOption}
        leftColumns={leftTableColumns}
        rightColumns={rightTableColumns}
      />
    </>
  );
}

CustomTransfer.propTypes = {
  titles: PropTypes.array,
  leftTableColumns: PropTypes.array.isRequired,
  rightTableColumns: PropTypes.array.isRequired,
  dataSource: PropTypes.array.isRequired,
  disabled: PropTypes.bool,
  showSearch: PropTypes.bool,
  filterOption: PropTypes.func,
  onChange: PropTypes.func,
  value: PropTypes.array,
  pageSize: PropTypes.number,
};

CustomTransfer.defaultProps = {
  titles: [t('Optional list'), t('Selected list')],
  disabled: false,
  showSearch: true,
  filterOption: (inputValue, item) => item.name.indexOf(inputValue) !== -1,
  onChange: () => {},
  value: [],
  pageSize: 5,
};
