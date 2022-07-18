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

import React, { useEffect } from 'react';
import { Observer } from 'mobx-react';
import Notify from 'components/Notify';
import { toJS } from 'mobx';
import { Form, Input, Button } from 'antd';
import { Link } from 'react-router-dom';
import { useRootStore } from 'stores';

import styles from './index.less';

const { TextArea } = Input;

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

const LicenseForm = (props) => {
  const { licenseStore } = useRootStore();

  const [form] = Form.useForm();
  const { license = {}, history } = props;

  const onFinish = async (values) => {
    const body = {
      license: values.license,
    };
    try {
      await licenseStore.withoutTokenUpdate({ body });
      Notify.success(
        t(
          'License update is successful, automatically return to the login page after 3 seconds'
        )
      );

      setTimeout(() => {
        history.push('/auth/login');
      }, 3000);
    } catch (error) {
      Notify.error(t('Failed to update license, please try again!'));
    }
  };

  useEffect(() => {
    form.setFieldsValue({ license: license.license });
  }, [license]);

  return (
    <Form
      form={form}
      name="updat_license"
      {...formItemLayout}
      onFinish={onFinish}
    >
      <Form.Item
        name="license"
        label={t('License')}
        rules={[
          {
            required: true,
            message: t('Please input your License!'),
          },
        ]}
      >
        <TextArea autoSize={{ minRows: 4 }} />
      </Form.Item>

      <Form.Item className={styles.between}>
        <Button type="primary" htmlType="submit">
          {t('Confirm')}
        </Button>
        <Link style={{ marginLeft: 50 }} to="/auth/login">
          {t('Back to login page')}
        </Link>
      </Form.Item>
    </Form>
  );
};

function UpdateLicense(props) {
  const { licenseStore: store } = useRootStore();

  return (
    <Observer>
      {() => (
        <div className={styles.reset}>
          <h1 className={styles.title}>{t('Update License')}</h1>
          <LicenseForm license={toJS(store.license)} history={props.history} />
        </div>
      )}
    </Observer>
  );
}

export default UpdateLicense;
