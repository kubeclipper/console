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
import React, { useContext } from 'react';
import { RouterStore } from '@superwf/mobx-react-router';
import { parse } from 'qs';
import { getQueryString } from 'utils';
import { setLocalStorageItem, getLocalStorageItem } from 'utils/localStorage';
import { get, uniq, isArray } from 'lodash';
import { makeAutoObservable } from 'mobx';
import ObjectMapper from 'utils/object.mapper';
import jwtDecode from 'jwt-decode';
import { APIVERSION } from 'utils/constants';
import { filterComponents } from 'utils/schemaForm';
import root from './root';

export const routingStore = new RouterStore();

/* Store start */
class RootStore {
  constructor() {
    makeAutoObservable(this);

    this.routing = routingStore;
    this.routing.query = this.query;

    Object.keys(root).forEach((key) => {
      const property = key.replace(/^\S/, (s) => s.toLowerCase());

      this[property] = new root[key](this);
    });
  }

  isOpenSource = true;

  user = null;

  roles = null;

  openKeys = [];

  config = {};

  components = [];

  storageComponents = [];

  pluginComponents = [];

  componentsLoading = false;

  hasPlugin = true;

  /**
   * routing
   * @param {*} params
   * @param {*} refresh
   */
  query = (params = {}, refresh = false) => {
    const { pathname, search } = this.routing.location;
    const currentParams = parse(search.slice(1));

    const newParams = refresh ? params : { ...currentParams, ...params };
    this.routing.push(`${pathname}?${getQueryString(newParams)}`);
  };

  /**
   * redirct to login page
   * @param {*} currentPath
   * @param {*} refresh
   */
  gotoLoginPage(currentPath, refresh) {
    if (currentPath) {
      this.routing.push(`/auth/login?referer=${currentPath}`);
    } else {
      this.routing.push('/auth/login');
    }
    if (refresh) {
      window.location.reload();
    }
  }

  /**
   * login
   * @param {*} param0
   * @returns
   */
  async login({ params, options }) {
    const resp = await request.post('oauth/login', params, {
      ...options,
      checkToken: false,
    });

    return this.handleLoginResp(resp);
  }

  /**
   * loginByOauth2
   * @param {*} name
   * @param {*} params
   * @returns
   */
  async loginByOauth2(name, params) {
    const resp = await request.get(`/oauth/cb/${name}`, params, {
      withoutToken: true,
    });
    return this.handleLoginResp(resp);
  }

  /**
   *
   * @param {*} name
   * @param {*} params
   * @returns
   */
  async logoutByOauth2() {
    const externalName = getLocalStorageItem('externalName');
    const { identityProviders = [] } = await this.oauth2Info();
    const logoutUrl = identityProviders.find(
      (item) => item.name === externalName
    )?.endSessionURL;
    const params = {
      state: new Date().getTime(),
      redirect_uri: `${window.location.origin}/cluster`,
    };
    localStorage.clear();
    window.open(`${logoutUrl}${request.toQueryString(params)}`, '_self');
  }

  /**
   * oauth2Info
   * @returns
   */
  async oauth2Info() {
    const resp = await request.get(
      '/api/config.kubeclipper.io/v1/oauth',
      {},
      {
        withoutToken: true,
        checkToken: false,
      }
    );
    return ObjectMapper.oauth2(resp);
  }

  /**
   * handle login resp
   * @param {*} resp
   * @returns
   */
  handleLoginResp = (resp = {}) => {
    if (!resp.access_token) {
      throw new Error(resp.message);
    }

    const { access_token, refresh_token, expires_in, refresh_expires_in } =
      resp || {};

    const { username } = jwtDecode(access_token);

    this.user = {
      username,
    };

    const expire = Number(expires_in) * 1000;
    const refreshExpire = Number(refresh_expires_in) * 1000;
    const token = {
      token: access_token,
      refreshToken: refresh_token,
      // expire,
      expires: new Date().getTime() + expire,
    };

    setLocalStorageItem('token', token, refreshExpire);
    setLocalStorageItem('access_token', access_token, refreshExpire);

    return {
      username,
      ...token,
    };
  };

  /**
   * refresh token
   * @param {*} params
   * @returns
   */
  getNewToken = async (params) => {
    const data = {
      grant_type: 'refresh_token',
      refresh_token: params?.refreshToken,
    };

    let newToken = {};
    const resp = await request.post('oauth/token', data, {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      withoutToken: true,
      checkToken: false,
    });

    const { access_token, refresh_token, expires_in, refresh_expires_in } =
      resp || {};

    if (!access_token) {
      throw new Error(resp?.message);
    }

    const expire = Number(expires_in) * 1000;
    const refreshExpire = Number(refresh_expires_in) * 1000;
    newToken = {
      token: access_token,
      refreshToken: refresh_token,
      // expire,
      expires: new Date().getTime() + expire,
      refreshExpire,
    };

    return newToken;
  };

  /**
   * get current user
   * @param {*} param0
   * @returns
   */
  getCurrentUser = async ({ username }) => {
    let user = {};

    const resp = await request.get(
      `/api/iam.kubeclipper.io/v1/users/${username}`
    );

    if (resp) {
      user = {
        username: get(resp, 'metadata.name'),
        globalrole: get(
          resp,
          'metadata.annotations["iam.kubeclipper.io/role"]'
        ),
      };
    } else {
      throw new Error(resp);
    }

    try {
      user.globalRules = await this.getUserRoleRules({ username });
    } catch (error) {}

    this.updateUser(user);

    return user;
  };

  /**
   * current user role rules
   * @param {*} param0
   * @returns
   */
  getUserRoleRules = async ({ username, options }) => {
    const resp = await request.get(
      `api/iam.kubeclipper.io/v1/users/${username}/roles`,
      {},
      options
    );

    const rules = {};
    resp.forEach((item) => {
      const rule = JSON.parse(
        get(item, "metadata.annotations['kubeclipper.io/role-template-rules']"),
        {}
      );

      Object.keys(rule).forEach((key) => {
        rules[key] = rules[key] || [];
        if (isArray(rule[key])) {
          rules[key].push(...rule[key]);
        } else {
          rules[key].push(rule[key]);
        }
        rules[key] = uniq(rules[key]);
      });
    });

    return rules;
  };

  /**
   * update user
   * @param {*} user
   */
  updateUser(user) {
    this.user = user;

    setLocalStorageItem('user', user);
  }

  /**
   * logout
   */
  async logout() {
    await request.post('oauth/logout');

    const isExternalUser = getLocalStorageItem('isExternal');
    if (isExternalUser) {
      await this.logoutByOauth2();
    } else {
      this.user = null;
      this.roles = [];
      localStorage.clear();
      this.gotoLoginPage();
    }
  }

  /**
   * update open menu
   * @param {*} newKeys
   */
  updateOpenKeys(newKeys) {
    this.openKeys = newKeys;
  }

  async getConfigs() {
    const res = await request.get('/api/config.kubeclipper.io/v1/configz');
    this.config = res;
  }

  async fetchComponents(params = {}) {
    let lang = getLocalStorageItem('lang') || 'zh';
    if (lang === 'zh-cn') {
      lang = 'zh';
    }
    const result = await request.get(
      `${APIVERSION.config}/components?lang=${lang}`,
      params
    );
    const data = result;

    this.components = filterComponents(data) || [];
    this.updateCustomComponents(data);

    return data;
  }

  updateCustomComponents(components) {
    const storageComponents = components.filter(
      ({ category }) => category === 'storage'
    );
    const pluginComponents = components.filter(
      ({ category }) => category !== 'storage'
    );
    const hasPlugin = pluginComponents.length > 0;

    this.storageComponents = filterComponents(storageComponents);
    this.pluginComponents = pluginComponents;
    this.hasPlugin = hasPlugin;
    this.componentsLoading = true;

    return hasPlugin;
  }

  sendMsgCode(params) {
    return request.post('oauth/verification-code', params, {
      checkToken: false,
    });
  }

  async verifyLogin(params) {
    const resp = await request.post('oauth/token', params, {
      checkToken: false,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    });

    return this.handleLoginResp(resp);
  }
}
/* Store end */

/**
 * rootStore
 */
const rootStore = new RootStore();

/**
 * Store context
 */
const StoresContext = React.createContext(rootStore);

/**
 * Store provider
 * @param {*} param0
 * @returns
 */
const RootStoreProvider = ({ children }) => {
  // eslint-disable-next-line no-shadow
  const root = rootStore ?? new RootStore();

  return (
    <StoresContext.Provider value={root}>{children}</StoresContext.Provider>
  );
};

/**
 * Hook to use store in any functional component
 * @returns
 */
const useRootStore = () => useContext(StoresContext);

/**
 * TODO: lost static properties when used by @withRootStore
 * HOC to inject store to any functional or class component
 * @param {*} Component
 * @returns
 */
const withRootStore = (Component) => (props) =>
  <Component {...props} store={useRootStore()} />;

export { rootStore, RootStoreProvider, useRootStore, withRootStore };
