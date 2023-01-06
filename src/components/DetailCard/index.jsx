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
import { Row, Col, Skeleton, Tooltip, Typography, Popover } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { has, get, isNumber, isArray, isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { renderFilterMap } from 'utils';
import Status from 'components/Status';
import styles from './index.less';

const { Paragraph } = Typography;

const getContentValue = (value, dataIndex, data, copyable) => {
  const status = get(data, dataIndex);
  // get status
  if (
    dataIndex.toLowerCase().indexOf('status') >= 0 ||
    dataIndex.toLowerCase().indexOf('state') >= 0
  ) {
    return <Status status={status} text={value} />;
  }
  // get copyable
  if (value !== '-') {
    if (
      copyable ||
      dataIndex.toLowerCase().indexOf('id') === 0 ||
      dataIndex.toLowerCase().indexOf('_id') >= 0
    ) {
      return <Paragraph copyable>{value}</Paragraph>;
    }
  }

  if (isArray(value) && !isEmpty(value)) {
    return (
      <div>
        {value.map((it) => (
          <p key={it}> {it}</p>
        ))}
      </div>
    );
  }

  return value;
};

const getContent = (data, option) => {
  const { content, dataIndex, render, valueRender, copyable, format } = option;
  if (has(option, 'content')) {
    return copyable ? <Paragraph copyable>{content}</Paragraph> : content;
  }
  let value = get(data, dataIndex);
  if (!render) {
    if (valueRender) {
      const renderFunc = renderFilterMap[valueRender];
      value = renderFunc && renderFunc(value);
    }
  } else {
    value = render(value, data);
  }

  if (format && format === 'Enable') {
    value = value ? t('Enabled') : t('Not Config');
  }
  if (!isNumber(value)) {
    value = value || '-';
  }

  return getContentValue(value, dataIndex, data, copyable);
};

const renderLabel = (option) => {
  const { label, tooltip = '' } = option;
  if (!tooltip) {
    return label;
  }
  return (
    <Tooltip title={tooltip}>
      <span>{label}</span>
    </Tooltip>
  );
};

const renderOptions = (options, data, loading, labelCol, contentCol) =>
  options.map((option, index) => (
    <Skeleton loading={loading} key={`detail-row-${index}`}>
      <Row className={styles['card-item']}>
        <Col span={labelCol}>{renderLabel(option)}</Col>
        <Col
          span={option.label ? contentCol : '24'}
          className={!option.label && styles['port-content']}
        >
          {getContent(data, option)}
        </Col>
      </Row>
    </Skeleton>
  ));

const DetailCard = ({
  title,
  titleHelp,
  loading,
  options,
  data,
  labelCol,
  contentCol,
  className,
  cardButton: CardButton,
}) => {
  let titleHelpValue;
  if (titleHelp) {
    titleHelpValue = (
      <Popover
        arrowPointAtCenter="true"
        placement="rightTop"
        content={titleHelp}
        trigger="click"
      >
        <InfoCircleOutlined className={styles['title-help']} />
      </Popover>
    );
  }
  return (
    <div className={classnames(className, styles.card)}>
      <div className={styles['card-content']}>
        <Skeleton loading={loading}>
          <Row className={styles['card-item']}>
            <div className={styles['header-left']}>
              <h3> {title} </h3>
              {titleHelpValue}
            </div>

            <div>
              <CardButton />
            </div>
          </Row>
        </Skeleton>
        {renderOptions(options, data, loading, labelCol, contentCol)}
      </div>
    </div>
  );
};

const detailProps = PropTypes.shape({
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  content: PropTypes.any,
  tooltip: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  dataIndex: PropTypes.string,
  valueRender: PropTypes.string,
});

DetailCard.defaultProps = {
  labelCol: 10,
  contentCol: 14,
  options: [],
  title: '',
  titleHelp: '',
  loading: false,
  data: {},
  cardButton: () => <></>,
};

DetailCard.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  titleHelp: PropTypes.any,
  options: PropTypes.arrayOf(detailProps),
  loading: PropTypes.bool,
  data: PropTypes.object,
  labelCol: PropTypes.number,
  contentCol: PropTypes.number,
  cardButton: PropTypes.any,
};

export default DetailCard;
