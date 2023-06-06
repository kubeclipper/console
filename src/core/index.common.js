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
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';
import { syncHistoryWithStore } from '@superwf/mobx-react-router';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import enUS from 'antd/es/locale/en_US';
import request from 'utils/request';
import PageLoading from 'components/PageLoading';
import App from './App';
import i18n from './i18n';
import { routingStore, rootStore } from 'stores';
import GlobalValue from './global';
import { registerMicroApps, start } from 'qiankun';

require('@babel/polyfill');

const initProject = () => {
  // request error handler
  window.onunhandledrejection = function (e) {
    if (e && (e.status === 'Failure' || e.status >= 400)) {
      if (e.status === 401) {
        // session timeout handler, except app store page.
        /* eslint-disable no-alert */
        const currentPath = window.location.pathname;
        if (currentPath.indexOf('login') < 0) {
          window.location.href = `/auth/login?referer=${currentPath}`;
        }
      } else if (e.reason || e.message) {
        // notification.error({
        //   message: e.reason,
        //   description: t(e.message),
        // });
      }
    }
  };

  window.t = i18n.t;
  window.request = request;

  window.globals = new GlobalValue();
};

const browserHistory = createBrowserHistory();
const history = syncHistoryWithStore(browserHistory, routingStore);
const lang = i18n.getLocale();
const localeProvider = lang === 'en' ? enUS : zhCN;

const render = (component) => {
  ReactDOM.render(
    <Suspense fallback={<PageLoading className="sl-page-loading" />}>
      <ConfigProvider locale={localeProvider}>{component}</ConfigProvider>
    </Suspense>,
    document.getElementById('app')
  );
};

const initApps = (apps) => {
  render(<App rootStore={rootStore} history={history} />);

  registerMicroApps(apps);

  start();
};

export default class Common {
  constructor(props) {
    const { apps } = props;
    initProject();
    initApps(apps);
  }
}
