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
import {
  get,
  set,
  isString,
  isUndefined,
  isNaN,
  isNil,
  isEqual,
  isNumber,
  isArray,
  uniq,
  has,
  isNull,
  isEmpty,
} from 'lodash';
import { customAlphabet } from 'nanoid';
import moment from 'moment';
import JSEncrypt from 'jsencrypt';
import { MODULE_ROUTE } from 'utils/constants';
import { getLocalStorageItem, getToken } from 'utils/localStorage';
import { parseExpression } from 'cron-parser';

import { SIZE_VALUE, SECOND_IN_TIME_UNIT } from './constants';

/**
 * format size, output the value with unit
 * @param {Number} size - the number need to be format
 */
export const formatSize = (size, start = 0) => {
  const divisor = 1024;
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB', 'BB'];
  let index = isNumber(start) ? start : 0;
  if (!isNumber(size) || isNaN(size)) {
    return size || '-';
  }
  while (size >= divisor && index < units.length - 1) {
    size = parseFloat(size / divisor).toFixed(2);
    index += 1;
  }
  if (index === 0) {
    size = parseInt(size, 10);
  }
  return `${size} ${units[index]}`;
};

export const generateId = (length) =>
  customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', length || 6)();

/**
 * wrap promise error
 * @param {Promise} promise
 */
export const to = (promise) =>
  promise
    .then((data) => data)
    .catch((err) => {
      console.warn(err);
      return [];
    });

export const capitalize = (string) =>
  string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();

export const getQueryString = (params) =>
  Object.keys(params)
    .filter((key) => params[key])
    .map((key) => `${key}=${params[key]}`)
    .join('&');

export const merge = (origin, path, newObj) => {
  const data = get(origin, path);
  if (!data) {
    set(origin, path, newObj);
  } else {
    Object.assign(data, newObj);
  }
};

export const getWebSocketProtocol = (protocol) => {
  if (protocol.startsWith('https')) {
    return 'wss';
  }
  return 'ws';
};

export const getSinceTime = (input) => {
  if (!input) {
    return '-';
  }
  const { m, h, d, month, year } = SECOND_IN_TIME_UNIT;

  const now = new Date();

  let interval = 0;
  // input.replace(/ /, 'T');
  // if (!/Z$/.test(input)) {
  //   input = input.concat('Z');
  // }
  const parsedDate = Date.parse(input);
  const seconds = Math.floor((now - parsedDate) / 1000);

  // Years
  interval = Math.floor(seconds / year);
  if (interval >= 1) {
    return t('{interval, plural, =1 {one year} other {# years} } ago', {
      interval,
    });
  }

  // Months
  interval = Math.floor(seconds / month);
  if (interval >= 1) {
    return t('{interval, plural, =1 {one month} other {# months} } ago', {
      interval,
    });
  }

  // Days
  interval = Math.floor(seconds / d);
  if (interval >= 1) {
    return t('{interval, plural, =1 {one day} other {# days} } ago', {
      interval,
    });
  }

  // Hours
  interval = Math.floor(seconds / h);
  if (interval >= 1) {
    return t('{interval, plural, =1 {one hour} other {# hours} } ago', {
      interval,
    });
  }

  // Minutes
  interval = Math.floor(seconds / m);
  if (interval >= 1) {
    return t('{interval, plural, =1 {one minute} other {# minutes} } ago', {
      interval,
    });
  }

  // Seconds
  return t('a few seconds ago');
};

export const getKeepTime = (input) => {
  const { m, h, d, w } = SECOND_IN_TIME_UNIT;
  if (!input) {
    return '-';
  }
  if (input < 0) {
    return t('Permanent');
  }
  if (input < m) {
    return t('to delete');
  }
  let interval = 0;
  if (input < h) {
    interval = parseInt(input / m, 10);
    return t(
      '{interval, plural, =1 {one minute} other {# minutes} } later delete',
      { interval }
    );
  }
  if (input < d) {
    interval = parseInt(input / h, 10);
    return t(
      '{interval, plural, =1 {one hour} other {# hours} } later delete',
      { interval }
    );
  }
  if (input < w) {
    interval = parseInt(input / d, 10);
    return t('{interval, plural, =1 {one day} other {# days} } later delete', {
      interval,
    });
  }
  interval = parseInt(input / w, 10);
  return t('{interval, plural, =1 {one week} other {# weeks} } later delete', {
    interval,
  });
};

export const getYesNo = (input) => (input ? t('Yes') : t('No'));

export const getGBValue = (input) => {
  const gb = 1024;
  if (isNaN(input) || isNil(input) || !input || !isNumber(input)) {
    return '';
  }
  return parseFloat(Number(input / gb).toFixed(2));
};

export const getNoValue = (input, def) => {
  if (
    input === null ||
    isUndefined(input) ||
    (isString(input) && input.trim() === '')
  ) {
    return def || '-';
  } else {
    return input;
  }
};

export const firstUpperCase = (str) => {
  if (!isString(str) || str === '') {
    return str;
  }
  const [first, ...rest] = str;
  return first.toUpperCase() + rest.join('');
};

export const bytesFitler = (input) => {
  const { kb, mb, gb, tb } = SIZE_VALUE;
  if (isNaN(input) || isUndefined(input) || input === null || input < 0) {
    return '';
  } else if (input >= tb) {
    const size = Number(input / tb).toFixed(2);
    return t('{ size } TB', { size });
  } else if (input >= gb) {
    const size = Number(input / gb).toFixed(2);
    return t('{ size } GB', { size });
  } else if (input >= mb) {
    const size = Number(input / mb).toFixed(2);
    return t('{ size } MB', { size });
  } else if (input >= kb) {
    const size = Number(input / kb).toFixed(2);
    return t('{ size } KB', { size });
  }
  const size = Math.floor(input);
  return t('{ size } bytes', { size });
};

export const uppercaseFilter = (input) => {
  if (!input) {
    return '-';
  }
  return input.toUpperCase();
};

export const toLocalTime = (time) => {
  if (!time) {
    return '-';
  }

  return moment(time).format('YYYY-MM-DD HH:mm:ss');
};

export const renderFilterMap = {
  sinceTime: getSinceTime,
  keepTime: getKeepTime,
  yesNo: getYesNo,
  GBValue: getGBValue,
  noValue: getNoValue,
  bytes: bytesFitler,
  uppercase: uppercaseFilter,
  formatSize,
  toLocalTime,
};

/**
 *
 * @param {*} obj
 * @returns array
 */
export const getOptions = (obj) =>
  Object.keys(obj).map((key) => ({
    label: obj[key],
    value: key,
    key,
  }));

/**
 *
 * @param {*} enable
 * @param {*} options
 * @returns
 */
export const formatOptions = (enable, options) => (enable ? options : []);

/**
 *
 * @param {*} arr
 * @returns
 */
export const isRepeat = (arr) => {
  const hash = [];
  for (let i = 0; i < arr.length; i += 1) {
    if (hash.some((it) => isEqual(it, arr[i]))) {
      return true;
    }

    hash.push(arr[i]);
  }
  return false;
};

/**
 *
 * @param {*} array exp: [{key: 'qq', value: 'ww'}]
 * @returns obj  exp:  { qq: 'ww' }
 */
export const keyValue2Obj = (array = []) =>
  Object.fromEntries(
    array.filter((item) => item).map(({ key, value }) => [key, value])
  );

/**
 *
 * @param {*} obj  { qq: 'ww' }
 * @returns  [{key: 'qq', value: 'ww'}]
 */
export const obj2KeyValue = (obj = {}) => {
  const arr = [];

  for (const [key, value] of Object.entries(obj)) {
    arr.push({ key, value });
  }

  return arr;
};

/**
 *
 * @param {*} rule
 * @returns
 */
export const formatRoleRules = (item) => {
  const rules = {};
  //  TODO
  let rule = {};
  const aggregationRoles = get(
    item,
    "metadata.annotations['kubeclipper.io/aggregation-roles']"
  );

  const templateRoles = get(
    item,
    "metadata.annotations['kubeclipper.io/role-template-rules']"
  );
  if (aggregationRoles) {
    rule = safeParseJSON(aggregationRoles, {});
  } else if (templateRoles) {
    rule = safeParseJSON(templateRoles, {});
  }

  Object.keys(rule).forEach((key) => {
    rules[key] = rules[key] || [];
    if (isArray(rule[key])) {
      rules[key].push(...rule[key]);
    } else {
      rules[key].push(rule[key]);
    }
    rules[key] = uniq(rules[key]);
  });

  return rules;
};

/**
 * parse string without error throw.
 * @param {string} json - json string need to be parsed
 * @param {object} defaultValue - if parse failed, return defaultValue
 */
export const safeParseJSON = (json, defaultValue) => {
  let result;
  try {
    result = JSON.parse(json);
  } catch (e) {}

  if (!result && defaultValue !== undefined) {
    return defaultValue;
  }
  return result;
};

/**
 * default redirect route
 * @param {*} globalRules
 * @returns
 */
export const defaultRoute = (globalRules) => {
  let path = '';

  const token = getToken();

  if (!isEmpty(token)) {
    if (isEmpty(globalRules)) {
      return MODULE_ROUTE.empty;
    }

    for (const key in MODULE_ROUTE) {
      if (has(globalRules, key) && globalRules[key].length > 0) {
        path = MODULE_ROUTE[key];

        break;
      }
    }
  }

  return path;
};

/**
 * IP:Port 根路由默认跳转页路由
 * 1. license 非法，跳转更新 license 页
 * 2. license 合法，未登陆，跳转登陆页
 * 3. license 合法，已登陆，跳转第一个有权限的菜单栏页
 * @returns
 */
export const homePageRoute = () => {
  const globalRules = getLocalStorageItem('user')?.globalRules;
  return defaultRoute(globalRules);
};

/**
 * join selector
 * @param {Object} selector
 */
export const joinSelector = (selector = {}) =>
  Object.entries(selector)
    .filter((entry) => !isUndefined(entry[1]) && !isNull(entry[1]))
    .map(([key, value]) => (key === 'undefined' ? value : `${key}=${value}`))
    .join(',');

/**
 *
 * @param {*} values
 * @returns
 */
export const arrayInputValue = (values = []) =>
  values.map((item) => item.value);

/**
 *
 * @param {*} value
 * @returns
 */
export const arrayInput2Label = (value = []) =>
  keyValue2Obj(arrayInputValue(value));

/**
 *
 * @param {*} label
 */
export const label2ArrayInput = (label = {}) =>
  obj2KeyValue(label).map((item, index) => ({ index, value: item }));

/**
 *
 * @param {*} promises
 * @returns
 */
export const allSettled = (promises) => {
  if (!Promise.allSettled) {
    return Promise.all(
      promises.map((promise) =>
        promise
          .then((value) => ({ status: 'fulfilled', value }))
          .catch((reason) => ({ status: 'rejected', reason }))
      )
    );
  }
  return Promise.allSettled(promises);
};

/**
 * 比较版本号大小，1.22.0 > 1.21.0
 * @param {*} preVersion
 * @param {*} lastVersion
 * @returns
 */
export const versionCompare = (preVersion = '', lastVersion = '') => {
  const sources = preVersion.replace('v', '').split('.');
  const dests = lastVersion.replace('v', '').split('.');
  const maxL = Math.max(sources.length, dests.length);
  let result = 0;
  for (let i = 0; i < maxL; i++) {
    const preValue = sources.length > i ? sources[i] : 0;
    const preNum = isNaN(Number(preValue))
      ? preValue.charCodeAt()
      : Number(preValue);
    const lastValue = dests.length > i ? dests[i] : 0;
    const lastNum = isNaN(Number(lastValue))
      ? lastValue.charCodeAt()
      : Number(lastValue);
    if (preNum < lastNum) {
      result = -1;
      break;
    } else if (preNum > lastNum) {
      result = 1;
      break;
    }
  }
  return result;
};

/**
 * 是否跨次版本  1.20.0 -> 1.22.0
 * @param {*} currentVersion
 * @param {*} crossVersion
 * @returns
 */
export const versionCross = (currentVersion = '', crossVersion = '') => {
  const current = currentVersion.replace('v', '').split('.');
  const cross = crossVersion.replace('v', '').split('.');

  const [x, y] = current;
  const [x1, y1] = cross;

  if ((x === x1 && Number(y1) > Number(y) + 1) || Number(x1) > Number(x)) {
    return true;
  }

  return false;
};

/**
 * 批量删除对象属性
 * @param {*} obj
 * @param {*} keys
 * @returns
 */
export function deleteObjectProperties(obj, keys = []) {
  keys.forEach((key) => {
    delete obj[key];
  });

  return obj;
}

/**
 *
 * @param {*} params examp: fieldSelector=name=d,name2=d2&fuzzy=description~df,description2~df2
 * @param {*} params fieldSelector 精确查询；fuzzy 模糊查询
 * @param {*} searchFilters
 * @returns {obj} {name: dd, name2: d2, description: df, description2: df2}
 */
export const initTagByUrlParams = (params, searchFilters = []) => {
  const tag = {};
  const paramsKeys = ['fieldSelector', 'fuzzy'];

  Object.entries(params).forEach(([key, value]) => {
    (value || '').split(',').forEach((it) => {
      const [k, val] = it.indexOf('=') > 0 ? it.split('=') : it.split('~');
      const isInSearch = searchFilters.some((s) => s.name === k);
      const isKeyValExist = !!k && !!val;

      if (isInSearch && paramsKeys.includes(key) && isKeyValExist) {
        tag[k] = val;
      }
    });
  });

  return tag;
};

/**
 *
 * @param {obj} tags {name: dd, name2: d2, description: df, description2: df2}
 * @param {array} searchFilters
 * @returns {obj} {fieldSelector: 'name=d,name2=d2',fuzzy: 'description~df,description2~df2'}
 */
export const generateUrlParamsByTag = (
  tags = {},
  searchFilters = [],
  propsParams = {}
) => {
  const params = {};

  Object.entries(tags).forEach(([key, value]) => {
    const s = searchFilters.find((it) => it.name === key);
    const isKeyValueExist = !!key && !!value;

    if (s && s.exact && isKeyValueExist) {
      const val = params.fieldSelector;

      let fieldValue = val ? `${val},${key}=${value}` : `${key}=${value}`;

      if (has(propsParams, 'fieldSelector')) {
        const propsFieldSelectorValue = get(propsParams, 'fieldSelector');
        fieldValue = `${fieldValue},${propsFieldSelectorValue}`;
      }

      params.fieldSelector = fieldValue;

      return;
    }

    if (s && isKeyValueExist) {
      const val = params.fuzzy;
      params.fuzzy = val ? `${val},${key}~${value}` : `${key}~${value}`;
    }
  });

  return params;
};

/**
 * 加密
 * @param {string} publickey
 * @param {string} value
 * @returns
 */
export function encrypt(publickey, value) {
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(publickey);
  return encryptor.encrypt(value);
}

/**
 * 解密
 * @param {string} privateKey
 * @param {string} value
 * @returns
 */
export function decrypt(privateKey, value) {
  const encryptor = new JSEncrypt();
  encryptor.setPrivateKey(privateKey);
  return encryptor.decrypt(value);
}

/**
 * 秒数转化为时分秒
 * @param {*} startAt  开始时间
 * @param {*} endAt  结束时间
 * @returns
 */
export function formatSeconds(startAt, endAt) {
  let second = moment(endAt).diff(moment(startAt), 'seconds');
  let minute = 0;
  let hour = 0;

  if (second > 60) {
    minute = parseInt(second / 60, 10);
    second = parseInt(second % 60, 10);
    if (minute > 60) {
      hour = parseInt(minute / 60, 10);
      minute = parseInt(minute % 60, 10);
    }
  }

  let result = `${parseInt(second, 10)}s`;
  if (minute > 0) {
    result = `${parseInt(minute, 10)}m${result}`;
  }
  if (hour > 0) {
    result = `${parseInt(hour, 10)}h${result}`;
  }
  return result;
}

/**
 *
 * @param {*} valueEnum
 * @param  {...any} rest
 * @returns
 */
export function runFunction(valueEnum, ...rest) {
  if (typeof valueEnum === 'function') {
    return valueEnum(...rest);
  }
  return valueEnum;
}

/* base64 加密 mask: true 的属性 */
export function encodeProperty(components, enabledComponents) {
  enabledComponents.forEach(({ config, name }) => {
    const item = components.find(({ name: cname }) => name === cname);

    const { properties = {} } = item.schema;

    const encode = (propValue) => window.btoa(propValue);

    for (const [prop, propValue] of Object.entries(properties)) {
      if (propValue.mask) {
        config[prop] = encode(config[prop]);
      }
    }
  });
  return enabledComponents;
}

/**
 * 解析 cron
 * @param {string} cron 例： '3 4 * * *'
 * @returns
 */
export function formatCron(cron) {
  const baseCron = parseExpression('* * * * *');
  const { dayOfMonth: baseDayOfMonth, dayOfWeek: baseDayOfWeek } =
    baseCron.fields;
  const { dayOfMonth, dayOfWeek, hour, minute } = parseExpression(cron).fields;
  const time = moment({
    hour: hour[0],
    minute: minute[0],
  }).format('HH:mm');
  if (dayOfMonth.length < baseDayOfMonth.length) {
    return {
      cycle: 'Every Month',
      values: dayOfMonth,
      firstVal: dayOfMonth[0],
      localsFormat: 'dayOfMonth',
      time,
    };
  }
  if (dayOfWeek.length < baseDayOfWeek.length) {
    return {
      cycle: 'Every Week',
      values: dayOfWeek,
      firstVal: dayOfWeek[0],
      localsFormat: 'dayOfWeek',
      time,
    };
  }
  return {
    cycle: 'Every Day',
    values: [],
    firstVal: null,
    localsFormat: 'day',
    time,
  };
}

/**
 * 校验时间是否过期
 * @param {Date} time
 * @returns
 */
export function checkExpired(time) {
  if (!time) return true;
  const secDiff = moment(time).diff(moment(), 'seconds');
  return secDiff > 0;
}

export function isDisableByProviderType(item, extraType = []) {
  const PROVIDER_TYPE = 'rancher';

  if (item?.providerType === PROVIDER_TYPE) {
    return true;
  }

  if (extraType.includes(item?.providerType)) {
    return true;
  }

  return false;
}

/**
 * 数组指定位置插入元素
 * @param index 添加元素的位置
 * @param items 向数组添加的新项目
 */
// eslint-disable-next-line no-extend-native
Array.prototype.insert = function (index, ...items) {
  if (isNaN(index)) {
    throw new TypeError('请输入数字');
  }
  this.splice(index, 0, ...items);

  return this;
};
