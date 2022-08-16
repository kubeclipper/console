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
import React, { useEffect, useReducer } from 'react';
import { toJS } from 'mobx';
import RightContext from './Right/index';
import LeftContext from './Left/index';
import { useRootStore } from 'stores';
import { getLocalStorageItem } from 'utils/localStorage';

import styles from './index.less';

export const BaseContext = React.createContext();

function BaseLayout(props) {
  const rootStore = useRootStore();

  const initialState = {
    collapsed: false,
    hover: false,
    openKeys: [],
    currentRoutes: [],
  };

  const reducer = (state, newState) => ({ ...state, ...newState });
  const [state, setState] = useReducer(reducer, initialState);

  useEffect(() => {
    rootStore.fetchComponents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!rootStore.user) {
      const user = getLocalStorageItem('user');

      if (!user) {
        rootStore.gotoLoginPage(window.location.pathname);
      }

      user && rootStore.updateUser(user);
    }

    const user = toJS(rootStore.user);

    if (user && (!user?.globalrole || !user?.globalRules)) {
      rootStore.getCurrentUser({ username: rootStore.user.username });
    }
  }, []);

  return (
    <BaseContext.Provider
      value={{ state, setState, Routes: props }}
      className={styles['base-layout']}
    >
      <LeftContext />
      <RightContext />
    </BaseContext.Provider>
  );
}

export default BaseLayout;
