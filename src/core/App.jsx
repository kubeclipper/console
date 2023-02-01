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
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Router } from 'react-router';
import { renderRoutes } from 'utils/router.config';
import { Provider } from 'mobx-react';
import 'styles/main.less';
import { Helmet } from 'react-helmet';
import { RootStoreProvider } from 'stores';

import routes from './routes';
import i18n from './i18n';

function App({ rootStore, history }) {
  const [initDone, setInitDone] = useState(false);

  const appLoadLocales = () => {
    const { loadLocales } = i18n;
    loadLocales();
    setInitDone(true);
  };

  useEffect(() => {
    appLoadLocales();
  }, []);

  return (
    initDone && (
      <Provider rootStore={rootStore}>
        <>
          <Helmet>
            <title>{global_config.title}</title>
          </Helmet>
          <RootStoreProvider>
            <Router history={history}>{renderRoutes(routes)}</Router>
          </RootStoreProvider>
        </>
      </Provider>
    )
  );
}

App.propTypes = {
  rootStore: PropTypes.object,
  history: PropTypes.object,
};

export default App;
