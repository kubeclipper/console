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

import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Input } from 'antd';
import Select from 'components/FormItem/Select';
import PropTypes from 'prop-types';
import { isIPv4, isIpv6 } from 'utils/validate';

const recordTypeOptions = [
  { label: 'A', value: 'A' },
  { label: 'AAAA', value: 'AAAA' },
];

export default function DNSRecord(props) {
  const { value, onChange, name } = props;

  const [ip, setIp] = useState(value.ip || '');
  const [recordType, setRecordType] = useState(value.type || 'A');
  const [validateStatus, setValidateStatus] = useState('success');
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line no-unused-vars
    function checkIP() {
      if (recordType === 'A' && !isIPv4(ip)) {
        setErrorMsg(t('Pleasse input a valid ipv4!'));
        setValidateStatus('error');
      } else if (recordType === 'AAAA' && !isIpv6(ip)) {
        setErrorMsg(t('Pleasse input a valid ipv6!'));
        setValidateStatus('error');
      } else {
        setErrorMsg(null);
        setValidateStatus('success');
      }
    }

    // checkIP();
    onChange({
      ip,
      type: recordType,
    });
  }, [recordType, ip]);

  const onTypeChange = (val) => setRecordType(val);

  const onIPChange = (e) => setIp(e.target.value);

  return (
    <Form.Item name={name} validateStatus={validateStatus} help={errorMsg}>
      <Row gutter={24}>
        <Col span={4} style={{ paddingTop: '8px' }}>
          {t('Type')}
        </Col>
        <Col span={8}>
          <Select
            value={recordType}
            options={recordTypeOptions}
            onChange={onTypeChange}
          />
        </Col>
        <Col span={12}>
          <Input
            defaultValue={ip}
            onChange={onIPChange}
            placeholder={
              recordType === 'A'
                ? t('Pleasse input a ipv4')
                : t('Pleasse input a ipv6')
            }
          />
        </Col>
      </Row>
    </Form.Item>
  );
}

DNSRecord.propTypes = {
  value: PropTypes.object,
  type: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
};

DNSRecord.defaultProps = {
  value: {},
  type: 'A',
  onChange: () => {},
};
