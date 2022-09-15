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
import { Form, Input, Select, Button } from 'antd';
import React, { useState, useEffect } from 'react';
import { rootStore } from 'stores';
import { debounce } from 'lodash';
import Notify from 'components/Notify';
import styles from './index.less';

const { Option } = Select;

const COUNTDOWN_SECONDS = 60;

const Verification = (props) => {
  const { form, onFinish, detail } = props;
  const [timing, setTiming] = useState(false);
  const [second, setSecond] = useState(COUNTDOWN_SECONDS);

  const { value: providerValue } = detail;
  const modeOption = [{ label: providerValue, value: providerValue }];

  useEffect(() => {
    let timer;

    function countdown() {
      setSecond((preSecond) => {
        if (preSecond <= 1) {
          setTiming(false);
          return COUNTDOWN_SECONDS;
        } else {
          timer = setTimeout(countdown, 1000);
          return preSecond - 1;
        }
      });
    }

    if (timing) {
      timer = setTimeout(countdown, 1000);
    }
    return () => clearTimeout(timer);
  }, [timing]);

  const handleSendCode = debounce(
    async () => {
      const { type, token } = detail;

      try {
        await rootStore.sendMsgCode({ type, token });

        setTiming(true);
      } catch (error) {
        Notify.error(error?.reason);
      }
    },
    1000,
    true
  );

  const renderAddonAfter = () => (
    <Button disabled={timing} onClick={() => handleSendCode()}>
      {timing ? second : t('Send VerifyCode')}
    </Button>
  );

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={onFinish}
      className={styles.verification}
    >
      <p className={styles.tips}>
        {t(
          'To make sure it works for you, please do a security verification first.'
        )}
      </p>
      <Form.Item
        label={t('Verification Mode')}
        name="name"
        rules={[
          {
            required: true,
            message: t('Please select verification mode!'),
          },
        ]}
      >
        <Select>
          {modeOption.map(({ label, value }) => (
            <Option key={value} value={value}>
              {label}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="code"
        rules={[{ required: true, message: t('Please input verifyCode') }]}
      >
        <div className={styles.code}>
          <Input
            placeholder={t('Please input verifyCode')}
            addonAfter={renderAddonAfter()}
          />
        </div>
      </Form.Item>
    </Form>
  );
};

export default Verification;
