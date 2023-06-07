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
import { Form, Input, Button } from 'antd';
import background from 'src/asset/image/background.png';
import SelectLang from 'components/SelectLang';
import VersionInfo from 'components/VersionInfo';
import { useRootStore } from 'stores';
import { setLocalStorageItem } from 'utils/localStorage';
import Notify from 'components/Notify';
import { defaultRoute } from 'utils';
import { useModal } from 'hooks';
import OAuth from './oauth';
import Verification from './Verification';
import styles from './index.less';

export default function Login(props) {
  const rootStore = useRootStore();
  const [modal, ModalDOM] = useModal();

  const [isSubmmiting, setIsSubmmiting] = useState(false);

  const nextPage = (globalRules) => {
    const { location = {} } = props;
    const { search } = location;
    if (search) {
      return search.split('=')[1];
    }

    return defaultRoute(globalRules);
  };

  const handleLoginResponse = async (res) => {
    setLocalStorageItem('loginType', 'caasOpen');
    setLocalStorageItem('username', 'admin');
    setLocalStorageItem('user', res, res.expire);
    setLocalStorageItem('isExternal', false);
    setIsSubmmiting(false);

    const currentUser = await rootStore.getCurrentUser({
      username: res.username,
    });

    if (currentUser) {
      const { globalRules = {} } = currentUser;
      rootStore.routing.push(nextPage(globalRules));
    }
  };

  const onFinish = async (values) => {
    setIsSubmmiting(true);

    try {
      const res = await rootStore.login({ params: values });

      if (res) {
        handleLoginResponse(res);
      }
    } catch (error) {
      if (error.status === 428) {
        const { providers } = error.data;
        const detail = providers?.[0];

        const onOk = async ({ code }) => {
          const { type, token } = detail;
          const params = {
            code,
            mfa_provider: type,
            token,
            grant_type: 'mfa',
          };

          try {
            const res = await rootStore.verifyLogin(params);
            if (res) {
              handleLoginResponse(res);
              modal.close();
            }
            // eslint-disable-next-line no-shadow
          } catch (error) {
            Notify.error(error?.reason);
          }
        };

        modal.open({
          title: t('Safety Verification'),
          width: 360,
          initialValues: { name: detail.value },
          children: <Verification detail={detail} />,
          bodyStyle: { padding: '24px 50px' },
          onOk,
          onClose: () => setIsSubmmiting(false),
        });
        return;
      }
      // eslint-disable-next-line no-console
      console.log('error', error);
      setIsSubmmiting(false);
      Notify.error(t(error.reason || 'Login Error'));
    }
  };

  const renderForm = () => (
    <Form
      name="normal_login"
      onFinish={onFinish}
      initialValues={{ remember: true }}
      className={styles.login}
    >
      <Form.Item
        name="username"
        rules={[
          {
            required: true,
            message: t('Please input username or email'),
          },
        ]}
      >
        <Input placeholder={t('Username')} />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[{ required: true, message: t('Please input password') }]}
      >
        <Input.Password placeholder={t('Password')} />
      </Form.Item>
      <Form.Item>
        <div className={styles.footer}>
          <Button type="primary" htmlType="submit" loading={isSubmmiting} block>
            {t('Log In')}
          </Button>
        </div>
      </Form.Item>
    </Form>
  );

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <SelectLang className={styles.lang} />
        {rootStore.isOpenSource && <VersionInfo className={styles.about} />}
        <div className={styles.header}>
          {`${t('Welcome Login')} ${global_config.title}`}
        </div>
        {renderForm()}
        {ModalDOM}
        <OAuth />
      </div>
      <div
        className={styles.right}
        style={{
          backgroundImage: `url(${background})`,
          backgroundSize: 'cover',
        }}
      />
    </div>
  );
}
