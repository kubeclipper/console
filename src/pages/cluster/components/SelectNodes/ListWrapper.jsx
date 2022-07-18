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
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Button } from 'antd';
import List from './List';
import classnames from 'classnames';
import styles from './index.less';
import { isEmpty } from 'lodash';

export default class Index extends Component {
  static propTypes = {
    datas: PropTypes.array,
    selectedRowKeys: PropTypes.array,
    onChange: PropTypes.func,
    nodeType: PropTypes.string,
  };

  static defaultProps = {};

  constructor(props) {
    super(props);
    const { datas = [] } = this.props;

    this.state = {
      datas,
      targetSelectedRowKeys: [],
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { datas = [] } = nextProps;
    if (datas !== prevState.datas) {
      return {
        datas,
      };
    }
    return null;
  }

  onTransfer = () => {
    const { dataSource, selectedRowKeys, onChange, nodeType } = this.props;
    const selectedData = dataSource.filter((data) =>
      selectedRowKeys.some((key) => data.name === key)
    );

    this.setState(
      {
        datas: selectedData,
      },
      () => {
        onChange && onChange(selectedRowKeys, nodeType, 'right');
      }
    );
  };

  onRemove = () => {
    const { onChange, nodeType } = this.props;
    const { datas, targetSelectedRowKeys } = this.state;
    const newDatas = datas.filter(
      (it) => !targetSelectedRowKeys.some((key) => key === it.name)
    );

    this.setState(
      {
        datas: newDatas,
        targetSelectedRowKeys: [],
      },
      () => {
        onChange &&
          onChange(
            newDatas.map((v) => v.name),
            nodeType,
            'left'
          );
      }
    );
  };

  onSelectChange = (selectedRowKeys) => {
    this.setState({
      targetSelectedRowKeys: selectedRowKeys,
    });
  };

  render() {
    const { title, selectedRowKeys } = this.props;
    const { datas, targetSelectedRowKeys } = this.state;
    return (
      <Row style={styles['right-item']} className="right-item">
        <Col span={4} className={styles.btn}>
          <div className={styles['transfer-operation']}>
            <Button
              type="primary"
              className={classnames('ant-btn-sm', 'btn-to-right')}
              disabled={isEmpty(selectedRowKeys)}
              onClick={this.onTransfer}
            >
              {'>'}
            </Button>
            <Button
              type="primary"
              className={classnames('ant-btn-sm', 'btn-to-left')}
              disabled={isEmpty(targetSelectedRowKeys)}
              onClick={this.onRemove}
            >
              {'<'}
            </Button>
          </div>
        </Col>
        <Col span={20} className={styles.target}>
          <List
            datas={datas}
            title={title}
            selectedRowKeys={targetSelectedRowKeys}
            onChange={this.onSelectChange}
          />
        </Col>
      </Row>
    );
  }
}
