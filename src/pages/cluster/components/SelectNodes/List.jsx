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
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Checkbox, Row, Empty, Input, Tooltip, Col, Spin } from 'antd';
import styles from './index.less';
import { isEmpty } from 'lodash';
import { computed } from 'mobx';
import classnames from 'classnames';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Search } = Input;

@observer
export default class Index extends Component {
  static propTypes = {
    datas: PropTypes.array,
    title: PropTypes.string,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    datas: [],
    title: 'title',
  };

  constructor(props) {
    super(props);
    const { datas = [], selectedRowKeys = [] } = props;

    this.state = {
      datas,
      selectedRowKeys,
      searchText: '',
    };
  }

  get excludeUnknowCount() {
    const { datas = [] } = this.state;

    return datas.filter((it) => it.status !== 'Unknown').length;
  }

  get selectedCount() {
    const { selectedRowKeys = [] } = this.state;

    return selectedRowKeys.length;
  }

  @computed
  get indeterminate() {
    if (this.selectedCount === this.excludeUnknowCount) {
      return false;
    }
    return (
      this.selectedCount !== 0 && this.selectedCount !== this.excludeUnknowCount
    );
  }

  @computed
  get checkAll() {
    if (
      this.selectedCount !== 0 &&
      this.selectedCount === this.excludeUnknowCount
    ) {
      return true;
    }

    return false;
  }

  @computed
  get filteredData() {
    const { datas, searchText } = this.state;
    if (searchText) {
      const newData = datas.filter(
        ({ hostname, ip }) =>
          JSON.stringify({ hostname, ip }).indexOf(searchText) > -1
      );

      return newData;
    }

    return datas;
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { datas = [], selectedRowKeys = [] } = nextProps;
    if (
      datas !== prevState.datas ||
      selectedRowKeys !== prevState.selectedRowKeys
    ) {
      return {
        datas,
        selectedRowKeys,
      };
    }
    return null;
  }

  onSelectedChange = (selectedRowKeys) => {
    this.setState(
      {
        selectedRowKeys,
      },
      () => {
        this.onChange(selectedRowKeys);
      }
    );
  };

  onSelectAll = (e) => {
    const { checked } = e.target;
    const { datas } = this.state;

    const filterUnknown = (data) =>
      data.filter(({ status }) => status !== 'Unknown');

    if (checked) {
      const newSelectedRowKeys = filterUnknown(datas).map((v) => v.name);
      this.setState(
        {
          selectedRowKeys: newSelectedRowKeys,
        },
        () => {
          this.onChange(newSelectedRowKeys);
        }
      );
    } else {
      this.setState(
        {
          selectedRowKeys: [],
        },
        () => {
          this.onChange([]);
        }
      );
    }
  };

  onChange = (values) => {
    const { onChange } = this.props;
    onChange && onChange(values);
  };

  onSearch = (value) => {
    this.setState({
      searchText: value,
    });
  };

  onSearchChange = (e) => {
    const { value } = e.target;
    this.setState({
      searchText: value,
    });
  };

  renderItemText(item) {
    const {
      cpu,
      memory,
      status,
      nodeInfo: { arch },
    } = item;
    const isMinCpuOrMemory = Number(cpu) < 2 || parseInt(memory, 10) < 4096;
    const isUnknownStatus = status === 'Unknown';

    return (
      <Row key={item.name} className={styles.item}>
        <Col span={2}>
          <Checkbox value={item.name} disabled={isUnknownStatus} />
        </Col>
        <Col>
          <p className={styles.hostname}>{item.hostname}</p>
          <div className={styles.extra}>
            {item.ip} | {cpu}C {memory} | {arch}
            {(isMinCpuOrMemory || isUnknownStatus) && (
              <Tooltip
                title={
                  isMinCpuOrMemory
                    ? t('Cpu or memory is too small.')
                    : t('Node status unknow')
                }
              >
                <ExclamationCircleOutlined
                  style={{
                    marginLeft: '8px',
                    color: isMinCpuOrMemory ? '#FF0000' : 'rgba(0, 0, 0, 0.25)',
                  }}
                />
              </Tooltip>
            )}
          </div>
        </Col>
      </Row>
    );
  }

  renderList() {
    const { isLoading } = this.props;
    const { datas, selectedRowKeys } = this.state;

    if (isLoading && isLoading === true) {
      return <Spin className={styles.loading} />;
    }

    if (isEmpty(datas)) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }

    return (
      <Checkbox.Group
        className={styles.group}
        onChange={this.onSelectedChange}
        value={selectedRowKeys}
      >
        {this.filteredData.map((item) => this.renderItemText(item))}
      </Checkbox.Group>
    );
  }

  render() {
    const { title, className } = this.props;
    const { datas, selectedRowKeys } = this.state;
    const selectedCount = isEmpty(selectedRowKeys)
      ? `${datas.length} ${t('items')}`
      : `${selectedRowKeys.length} / ${datas.length} ${t('items')}`;

    return (
      <div className={classnames(styles['select-list'], className)}>
        <div className={styles.header}>
          <Checkbox
            checked={this.checkAll}
            onChange={this.onSelectAll}
            indeterminate={this.indeterminate}
          />
          <span className={styles.selected}>{selectedCount}</span>
          <span className={styles.title}>{title}</span>
        </div>
        <div className={classnames('list-body', styles.body, className)}>
          <Search
            placeholder={t('Please input search text')}
            onSearch={this.onSearch}
            className={styles.search}
            onChange={this.onSearchChange}
          />
          {this.renderList()}
        </div>
      </div>
    );
  }
}
