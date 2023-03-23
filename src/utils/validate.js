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
import { isString } from 'lodash';
import { Address4, Address6 } from 'ip-address';
import yaml from 'js-yaml/dist/js-yaml';

// eslint-disable-next-line no-unused-vars
const ip =
  /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)[.](25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)[.](25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)[.](25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const cidr =
  /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)[.](25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)[.](25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)[.](25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)[\/](([0-9])|([1-2][0-9])|(3[1-2]))$/; // eslint-disable-line
const ipCidr =
  /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)[.](25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)[.](25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)[.](25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)([\/](([0-9])|([1-2][0-9])|(3[1-2])))?$/; // eslint-disable-line
const ipv6Cidr =
  /^((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?s*(\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))?$/;
// const nameRegex =
//   /^[a-zA-Z\u4e00-\u9fa5][\u4e00-\u9fa5\w"'\[\]^<>.:()_-]{0,127}$/; // eslint-disable-line
const macRegex = /^[A-F0-9]{2}(:[A-F0-9]{2}){5}$/;
const portRangeRegex =
  /^([1-9]|[1-5]?[0-9]{2,4}|6[1-4][0-9]{3}|65[1-4][0-9]{2}|655[1-2][0-9]|6553[1-5])(:([1-9]|[1-5]?[0-9]{2,4}|6[1-4][0-9]{3}|65[1-4][0-9]{2}|655[1-2][0-9]|6553[1-5]))?$/;
const ipWithMask =
  /^(?:(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\/([1-9]|[1-2]\d|3[0-2])$/;
export const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}$/;
const domain =
  /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/;
const domainPath =
  // eslint-disable-next-line no-useless-escape
  /[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%&:\/~\+#]*[\w\-\@?^=%&\/~\+#])?$/;
const domainPort =
  /^((http|https):\/\/)?([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}(:[0-9]{1,5})?$/i;
const emailRegex =
  /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
const phoneNumberRegex = /^1[3456789]\d{9}$/;
const portRegx =
  /^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{4}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;
const ipPortRegx =
  // eslint-disable-next-line no-useless-escape
  /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\:([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-5]{2}[0-3][0-5])$/;
const numberRegx = /^[0-9]*$/;
const nameRegex =
  /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;

export const regex = {
  cidr,
  ipCidr,
  ipv6Cidr,
  nameRegex,
  macRegex,
  portRangeRegex,
  ipWithMask,
  emailRegex,
  domainPort,
};

export const isPhoneNumber = (value) => phoneNumberRegex.test(value);

export const isPort = (value) => portRegx.test(value);

export const isIp = (value) => ip.test(value);

export const isIpPort = (value) => ipPortRegx.test(value);

export const isMacAddress = (value) => macRegex.test(value);

export const isEmailNumber = (value) => emailRegex.test(value);

export const isNumber = (value) => numberRegx.test(value);

function zfill(num, len) {
  return (Array(len).join('0') + num).slice(-len);
}

export const isIpWithMask = (value) => ipWithMask.test(value);

export const ipFull = (ipadd) =>
  ipadd
    .split('.')
    .map((item) => zfill(item, 3))
    .join('');

export const isIPv4 = (value) => value && Address4.isValid(value);

export const isIpv6 = (value) => value && Address6.isValid(value);

export const isDomain = (value) => domain.test(value);

export const isDomainPath = (value) => domainPath.test(value);

export const isDomainPort = (value) => domainPort.test(value);

export const isCidr = (value) => cidr.test(value);

export const isIpCidr = (value) => ipCidr.test(value);

export const isIPv6Cidr = (value) => ipv6Cidr.test(value);

export const isName = (value) => {
  if (value && isString(value)) {
    return nameRegex.test(value) && value.length <= 64;
  }
  return false;
};

export const isPasswordRegex = (value) => passwordRegex.test(value);

export const nameMessage = t(
  'The name can only contain lowercase letters, numbers, and separators ("-" or "."), and must start and end with a lowercase letter or number, up to a maximum of 64 characters'
);

export const portMessage = t('Enter an integer value between 1 and 65535.');

export const rangeMessage = t(
  'The starting number must be less than the ending number'
);

export const portRangeMessage = t(
  'Input source port or port range(example: 80 or 80:160)'
);

export const phoneNumberValidate = (rule, value) => {
  if (!rule.required && !value) {
    return Promise.resolve(true);
  }
  if (isPhoneNumber(value)) {
    return Promise.resolve(true);
  }
  return Promise.reject(new Error(`${t('Please enter a valid Phone Number')}`));
};

export const emailValidate = (rule, value) => {
  if (!rule.required && !value) {
    return Promise.resolve(true);
  }
  if (isEmailNumber(value)) {
    return Promise.resolve(true);
  }
  return Promise.reject(
    new Error(`${t('Please enter a valid Email Address!')}`)
  );
};

export const nameValidate = (rule, value) => {
  if (!rule.required && value === undefined) {
    return Promise.resolve(true);
  }
  if (isName(value)) {
    return Promise.resolve(true);
  }
  return Promise.reject(new Error(`${nameMessage}`));
};

export const macAddressValidate = (rule, value) => {
  if (isMacAddress(value)) {
    return Promise.resolve(true);
  }
  return Promise.reject(new Error(`${t('Invalid: ')}${nameMessage}`));
};

export const portRangeValidate = (rule, value) => {
  if (portRangeRegex.test(value)) {
    const ports = value.split(':');
    if (Number(ports[0]) > Number(ports[1])) {
      return Promise.reject(new Error(`${t('Invalid: ')}${rangeMessage}`));
    }
    return Promise.resolve();
  }
  return Promise.reject(new Error(`${t('Invalid: ')}${portMessage}`));
};

export const passwordValidate = (rule, value, state) => {
  const { password, confirmPassword, oldPassword } = state;
  const { field } = rule;

  if (field === 'password') {
    if (value && !passwordRegex.test(value)) {
      return Promise.reject(
        t(
          '8 to 16 characters, at least one uppercase letter, one lowercase letter, one number.'
        )
      );
    }
    if (confirmPassword && value !== confirmPassword) {
      return Promise.reject(
        t('Password must be the same with confirm password.')
      );
    }
    if (oldPassword && password === oldPassword) {
      return Promise.reject(
        t('The new password cannot be identical to the current password.')
      );
    }
  }
  if (field === 'confirmPassword') {
    if (password && value !== password) {
      return Promise.reject(
        t('Password must be the same with confirm password.')
      );
    }
  }
  return Promise.resolve();
};

export const getPasswordOtherRule =
  (name, type) =>
  ({ getFieldValue }) => ({
    validator(rule, value) {
      let state = {};
      if (name === 'password') {
        state = {
          oldPassword: getFieldValue('oldPassword'),
          password: value || getFieldValue('password'),
          confirmPassword: getFieldValue('confirmPassword'),
        };
      } else {
        state = {
          confirmPassword: value || getFieldValue('confirmPassword'),
          password: getFieldValue('password'),
          oldPassword: getFieldValue('oldPassword'),
        };
      }

      if (type === 'user') {
        state.oldPassword = getFieldValue('oldPassword');
      }

      return passwordValidate(rule, value, state);
    },
  });

export const yamlValidator = (_, value) => {
  if (value !== undefined && value !== '') {
    try {
      yaml.load(value);
      return Promise.resolve(true);
    } catch (e) {
      return Promise.reject(new Error(t('Illegal YAML scheme')));
    }
  }
  return Promise.resolve(true);
};
