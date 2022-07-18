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
import { useRootStore } from 'stores';
import { useLocation, useHistory, useParams } from 'react-router-dom';
import { parse } from 'qs';
import { setLocalStorageItem } from 'utils/localStorage';
import Notify from 'components/Notify';
import { defaultRoute } from 'utils';

export default function Oauth2Redirect() {
  const rootStore = useRootStore();

  const location = useLocation();
  const history = useHistory();
  const { name } = useParams();
  const paramStr = parse(location.search.slice(1));

  useEffect(() => {
    async function redirect() {
      try {
        const user = await rootStore.loginByOauth2(name, paramStr);
        if (user) {
          setLocalStorageItem('user', user, user.expire);
          setLocalStorageItem('isExternal', true);
          setLocalStorageItem('externalName', name);

          const currentUser = await rootStore.getCurrentUser({
            username: user.username,
          });

          if (currentUser) {
            const { globalRules = {} } = currentUser;
            history.push(defaultRoute(globalRules));
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log('error', error);
        Notify.error(t(error.reason || 'Login Error'));
      }
    }

    redirect();
  }, []);

  return <></>;
}
