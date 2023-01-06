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
import React, { PureComponent } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';
import classnames from 'classnames';
import { flatten } from 'lodash';
import List from './List';
import ListWrapper from './ListWrapper';
import styles from './index.less';

@observer
export default class Index extends PureComponent {
  static propTypes = {
    onChange: PropTypes.func,
    // eslint-disable-next-line react/no-unused-prop-types
    value: PropTypes.array,
    rightTransfers: PropTypes.array,
  };

  static defaultProps = {
    onChange: null,
    value: [],
    rightTransfers: [
      { key: 'master', title: t('Master') },
      { key: 'worker', title: t('Worker') },
    ],
  };

  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      values: [], // [{key: 'master', value: [{label: '', value: ''}]},{ key: 'worker', value: [{label: '', value: ''}]}]
    };

    this.store = props.nodeStore;
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { value = [] } = nextProps;
    if (value !== prevState.values) {
      return {
        values: value,
      };
    }
    return null;
  }

  get dataSource() {
    return this.props.dataSource;
  }

  getData = (key) => {
    const { values } = this.state;

    if (!values || values.length === 0) return [];
    if (!values.find((it) => it.key === key)) return [];

    const targetItem = values.find((v) => v.key === key).value;

    return targetItem;
  };

  onSelectChange = (selectedRowKeys) => {
    this.setState({
      selectedRowKeys,
    });
  };

  // 两栏之间转移时的回调函数
  onChange = (selectedRowKeys, nodeType, direction) => {
    const { values } = this.state;
    const { onChange } = this.props;

    const currentValue = values.find((it) => it.key === nodeType) || {};
    const selectedData = this.dataSource.filter((data) =>
      selectedRowKeys.some((key) => data.name === key)
    );

    let newValue = null;
    if (direction === 'right') {
      const obj = {};
      newValue = [...(currentValue.value || []), ...selectedData].reduce(
        (cur, next) => {
          // eslint-disable-next-line no-unused-expressions
          obj[next.name] ? '' : (obj[next.name] = true && cur.push(next));
          return cur;
        },
        []
      );
    } else {
      newValue = currentValue.value.filter((data) =>
        selectedRowKeys.some((key) => data.name === key)
      );
    }
    const filteredValue = values.filter((v) => v.key !== nodeType);
    const nextValues = [...filteredValue, { key: nodeType, value: newValue }];

    this.setState({
      selectedRowKeys: [],
      values: nextValues,
    });

    onChange && onChange(nextValues);
  };

  @computed
  get leftDatas() {
    const rightsDataName = flatten(this.state.values.map((it) => it.value));
    const leftData = this.dataSource.filter(
      (x) => !rightsDataName.some((y) => x.name === y.name)
    );

    return leftData;
  }

  render() {
    const { selectedRowKeys } = this.state;
    const { isLoading } = this.store.list;

    return (
      <div>
        <Row>
          <Col
            span={10}
            className={classnames('multi-transfer-left', styles.left)}
          >
            <List
              datas={this.leftDatas}
              title={t('Available Nodes')}
              selectedRowKeys={selectedRowKeys}
              onChange={this.onSelectChange}
              className={styles.source}
              isLoading={isLoading}
            />
          </Col>
          <Col
            span={14}
            className={classnames('multi-transfer-right', styles.right)}
          >
            {this.props.rightTransfers.map((it) => (
              <ListWrapper
                key={it.key}
                dataSource={this.dataSource}
                nodeType={it.key}
                datas={this.getData(it.key)}
                title={it.title}
                selectedRowKeys={selectedRowKeys} // source selectedRowKeys
                onChange={this.onChange}
              />
            ))}
          </Col>
        </Row>
      </div>
    );
  }
}
