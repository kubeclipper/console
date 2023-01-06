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

import React from 'react';
import PropTypes from 'prop-types';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Select } from 'antd';
import classnames from 'classnames';
import styles from './index.less';

export default function Pagination(props) {
  const {
    current: _current,
    pageSize: _pageSize,
    defaultCurrent: _defaultCurrent,
    defaultPageSize: _defaultPageSize,
    currentDataSize,
    isLoading,
    total,
    onChange: _onChange,
    pageSizeOptions,
    className,
    hideTotal,
  } = props;

  const current = _current || _defaultCurrent;
  const pageSize = _pageSize || _defaultPageSize;

  // eslint-disable-next-line no-shadow
  const onChange = (current, pageSize) => {
    _onChange?.(current, pageSize);
  };

  // eslint-disable-next-line no-shadow
  const onChangePageSize = (pageSize) => {
    onChange(1, pageSize);
  };

  const onClickPre = () => {
    if (current === 1) {
      return;
    }
    onChange(current - 1, pageSize);
  };

  const onClickNext = () => {
    if (currentDataSize < pageSize) {
      return;
    }
    onChange(current + 1, pageSize);
  };

  const checkNextByTotal = () => {
    if (total === undefined) {
      return true;
    }
    if (!total) {
      return false;
    }
    return _current < Math.ceil(total / pageSize);
  };

  const renderTotal = () => {
    if (hideTotal) {
      return null;
    }
    if (total !== undefined) {
      return <span>{t('Total {total} items', { total })}</span>;
    }
    if (isLoading) {
      return null;
    }
    if (currentDataSize < pageSize) {
      // eslint-disable-next-line no-mixed-operators
      const totalCompute = (current - 1) * pageSize + currentDataSize;
      return <span>{t('Total {total} items', { total: totalCompute })}</span>;
    }
    return null;
  };

  const renderPageSelect = () => {
    const options = pageSizeOptions.map((it) => ({
      label: t('{pageSize} items/page', { pageSize: it }),
      value: it,
    }));

    return (
      <Select
        className={styles['page-select']}
        options={options}
        value={pageSize}
        defaultValue={_defaultPageSize}
        onChange={(newValue) => {
          onChangePageSize(newValue);
        }}
      />
    );
  };

  const preDisabled = isLoading || parseFloat(current) === 1;
  const nextDisabled =
    isLoading || currentDataSize < pageSize || !checkNextByTotal();

  return (
    <div
      className={classnames(styles.wrapper, className, 'backend-pagination')}
    >
      <div className={classnames(styles.inner, 'pagination-inner')}>
        {renderTotal()}
        <Button
          type="link"
          icon={<LeftOutlined />}
          disabled={preDisabled}
          onClick={onClickPre}
        />
        <Button type="link" style={{ paddingLeft: 0, paddingRight: 0 }}>
          {current}
        </Button>
        <Button
          type="link"
          icon={<RightOutlined />}
          disabled={nextDisabled}
          onClick={onClickNext}
        />
        {renderPageSelect()}
      </div>
    </div>
  );
}

Pagination.propTypes = {
  total: PropTypes.number,
  currentDataSize: PropTypes.number.isRequired,
  current: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  defaultCurrent: PropTypes.number,
  defaultPageSize: PropTypes.number,
  pageSizeOptions: PropTypes.array,
  onChange: PropTypes.func,
  isLoading: PropTypes.bool,
  className: PropTypes.string,
};

Pagination.defaultProps = {
  isLoading: false,
  total: undefined,
  defaultCurrent: 1,
  defaultPageSize: 10,
  pageSizeOptions: [10, 20, 50, 100],
  onChange: (page, pageSize) => {
    // eslint-disable-next-line no-console
    console.log(page, pageSize);
  },
};
