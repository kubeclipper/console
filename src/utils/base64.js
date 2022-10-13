import { Base64 } from 'js-base64';

/**
 * 编码
 * @param {*} str
 * @returns
 */
export const safeBtoa = (str) => {
  if (typeof str !== 'string') {
    return '';
  }
  return Base64.encode(str);
};

/**
 * 解码
 * @param {*} str
 * @returns
 */
export const safeAtob = (str) => {
  if (typeof str !== 'string') {
    return '';
  }
  return Base64.decode(str);
};
