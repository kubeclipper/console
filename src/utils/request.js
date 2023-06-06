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
import { isEmpty, get, merge } from 'lodash';
import {
  getToken,
  getLocalStorageItem,
  setLocalStorageItem,
} from 'utils/localStorage';
import { rootStore } from 'stores';

const qs = require('qs');

const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'];

/**
 * This is our overly complicated isomorphic "request",
 * methods: get, post, put, patch, delete
 * @param url
 * @param params
 * @param options
 * @param reject
 * @returns {Function}
 */
module.exports = methods.reduce(
  (prev, method) => ({
    ...prev,
    [method.toLowerCase()]: (url, params = {}, options, reject) =>
      buildRequest({ method, url, params, options, reject }),
  }),
  {
    defaults: buildRequest,
    watch: watchResource,
    toQueryString,
  }
);

async function checkToken(callback) {
  const token = getLocalStorageItem('token') || '';

  if (!token) {
    const error = {
      status: 401,
      reason: 'the token has expired, please login again',
    };
    window.onunhandledrejection(error);
    return;
  }

  const { expires = '' } = token;

  if (expires) {
    const current = new Date().getTime();

    // ahead of 10 minutes refresh token, aviod time difference between client and server
    const TIME_DELAY = 10 * 60 * 1000;
    if (expires <= current + TIME_DELAY) {
      const resp = await rootStore.getNewToken(token);

      setLocalStorageItem('token', resp, resp.refreshExpire);
      setLocalStorageItem('access_token', resp.token, resp.refreshExpire);

      return callback();
    }
  }

  return callback();
}

/**
 * Build and execute remote request
 * @param method
 * @param url
 * @param params
 * @param config
 */
function buildRequest({
  method = 'GET',
  url,
  params = {},
  options,
  reject,
  handler,
}) {
  let requestURL = createURL(url, method);
  const token = getToken();
  const withoutToken = get(options, 'withoutToken', false);

  const request = merge(
    {
      method,
      mode: 'cors',
      credentials: 'include',
      headers: {
        'content-type': 'application/json',
        ...(withoutToken || !token ? {} : { Authorization: `Bearer ${token}` }),
      },
    },
    options
  );
  if (get(options, 'headers.content-type')) {
    request.headers['content-type'] = options.headers['content-type'];
  }
  const isForm =
    get(options, 'headers[content-type]', '').indexOf(
      'application/x-www-form-urlencoded'
    ) !== -1;

  const isFile =
    get(options, 'headers.content-type', '').indexOf(
      'application/octet-stream'
    ) !== -1;
  if (method === 'GET' || method === 'HEAD') {
    requestURL += !isEmpty(params) ? toQueryString(omitNil(params)) : '';
  } else if (isFile) {
    request.body = params;
  } else if (isForm) {
    request.body = qs.stringify(params);
  } else if (options && options.isFormData) {
    request.body = params;
    delete request.headers['content-type'];
  } else {
    request.body = JSON.stringify(params);
    if (method === 'DELETE' && isEmpty(params)) {
      delete request.body;
    }
  }

  let responseHandler = handleResponse;

  if (typeof handler === 'function') {
    responseHandler = handler;
  }

  function doFetch() {
    return fetch(requestURL, request).then((resp) =>
      responseHandler(resp, reject, request)
    );
  }

  if (options?.withoutToken) {
    return doFetch();
  }

  return options?.checkToken ?? true ? checkToken(doFetch) : doFetch();
}

function watchResource(url, params = {}, callback) {
  const xhr = new XMLHttpRequest();

  xhr.open('GET', `${url}${toQueryString(params)}`, true);

  xhr.onreadystatechange = () => {
    if (xhr.readyState >= 3 && xhr.status === 200) {
      callback(xhr.responseText);
    }
  };

  xhr.send();

  return xhr;
}

/**
 * Prepend host of API server
 * @param path
 * @returns {String}
 * @private
 */
function createURL(path) {
  if (path.startsWith('http')) {
    return path;
  }
  let resultUrl = `${path[0] === '/' ? '' : '/'}${path.trimLeft('/')}`;
  resultUrl = `/apis${resultUrl}`;
  return resultUrl;
}

/**
 * Decide what to do with the response
 * @param response
 * @returns {Promise}
 * @private
 */
// eslint-disable-next-line no-unused-vars
function handleResponse(response, reject, request) {
  const redirect = response.redirected;

  if (redirect) {
    window.location.replace(response.url);
    return Promise.reject();
  }

  const contentType = response.headers.get('content-type');
  if (response.status === 202 || response.status === 204) {
    if (Number(response.headers.get('content-length')) === 0) {
      return Promise.resolve();
    }
    if (contentType && contentType.includes('json')) {
      return response.json();
    }
    return Promise.resolve();
  }
  if (response.redirected) {
    window.location.href = response.url;
    return Promise.resolve();
  }

  if (contentType && contentType.includes('json')) {
    return response
      .json()
      .then((data) => {
        if (response.status === 401) {
          // eslint-disable-next-line no-console
          console.warn('Unauthorized', response, response.ok);
        }

        if (response.ok && response.status >= 200 && response.status < 400) {
          return data;
        }

        const error = formatError(response, data);

        if (typeof reject === 'function') {
          return reject(error, response);
        } else if (window.onunhandledrejection) {
          window.onunhandledrejection(error);
        }

        return Promise.reject(error);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err);
        return Promise.reject(err);
      });
  }

  if (contentType && contentType.includes('image')) {
    return response.blob().then((data) => {
      if (response.status === 401) {
        // eslint-disable-next-line no-console
        console.warn('Unauthorized', response, response.ok);
      }

      if (response.ok && response.status >= 200 && response.status < 400) {
        return data;
      }

      const error = formatError(response, data);

      if (typeof reject === 'function') {
        return reject(error, response);
      } else if (window.onunhandledrejection) {
        window.onunhandledrejection(error);
      }

      return Promise.reject(error);
    });
  }

  // checkName exist
  if (response.headers.has('x-check-exist')) {
    const data = {
      exist: JSON.parse(response.headers.get('x-check-exist')),
    };

    return Promise.resolve(data);
  }

  if (response.status === 200) {
    return response.text();
  }

  return response.text().then((text) => {
    const error = {
      status: response.status,
      reason: response.statusText,
      message: text,
    };

    if (typeof reject === 'function') {
      return reject(response, error);
    } else if (window.onunhandledrejection) {
      window.onunhandledrejection(error);
    }

    return Promise.reject(error);
  });
}

/**
 * Transform an JSON object to a query string
 * @param params
 * @returns {string}
 */
function toQueryString(params) {
  return `?${Object.keys(params)
    .map((k) => {
      const name = encodeURIComponent(k);
      if (Array.isArray(params[k])) {
        return params[k]
          .map((val) => `${name}=${encodeURIComponent(val)}`)
          .join('&');
      }
      if (k === 'q') {
        return `${name}=${params[k]}`;
      }
      return `${name}=${encodeURIComponent(params[k])}`;
    })
    .join('&')}`;
}

function omitNil(obj) {
  if (typeof obj !== 'object') return obj;
  return Object.keys(obj).reduce((acc, v) => {
    if (obj[v] !== undefined) acc[v] = obj[v];
    return acc;
  }, {});
}

function formatError(response, data) {
  // eslint-disable-next-line no-console
  console.log('formatError-response', response);
  // eslint-disable-next-line no-console
  console.log('formatError-data', data);
  if (data.code < 100) {
    data.code = 500;
  }

  const result = {
    status: response.status,
    reason: response.statusText,
    data,
  };

  if (typeof data.code === 'number') {
    result.status = data.code;
  }

  if (data.status) {
    result.status = data.status;
  }

  if (data.reason || data.error) {
    result.reason = data.reason || data.error;
  }

  result.message =
    data.message || data.error_message || JSON.stringify(data.details);

  return result;
}
