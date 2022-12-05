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
  formatSize,
  generateId,
  to,
  capitalize,
  getQueryString,
  getWebSocketProtocol,
  bytesFitler,
  firstUpperCase,
  getNoValue,
  getGBValue,
  versionCross,
} from './index';

describe('test utils index.js', () => {
  it('formatSize', () => {
    expect(formatSize(null)).toBe('-');
    expect(formatSize(undefined)).toBe('-');
    expect(formatSize(NaN)).toBe('-');
    expect(formatSize('')).toBe('-');
    expect(formatSize(1000)).toBe('1000 B');
    expect(formatSize(128012010202)).toBe('119.22 GB');
    expect(formatSize('128012010202')).toBe('128012010202');
    // eslint-disable-next-line no-mixed-operators
    expect(formatSize(10000 * 1024 ** 8)).toBe('9.77 BB');
    // eslint-disable-next-line no-mixed-operators
    expect(formatSize(10000 * 1024 ** 9)).toBe('10000.00 BB');
  });

  it('generateId', () => {
    expect(generateId()).toHaveLength(6);
    expect(generateId(10)).toHaveLength(10);
  });

  it('to', async () => {
    const prom1 = new Promise((resolve) => {
      resolve('a');
    });
    const data1 = await to(prom1);
    expect(data1).toBe('a');

    const prom2 = new Promise((resolve, reject) => {
      reject();
    });
    const data2 = await to(prom2);
    expect(data2).toStrictEqual([]);
  });

  it('capitalize', () => {
    expect(capitalize('aBBcd')).toBe('Abbcd');
  });

  it('getQueryString', () => {
    expect(getQueryString({ a: '', b: 'xxx', c: 'yyy' })).toBe('b=xxx&c=yyy');
  });

  it('bytesFitler', () => {
    expect(bytesFitler(-1)).toBe('');
    expect(bytesFitler(NaN)).toBe('');
    expect(bytesFitler(100)).toBe(t('{ size } bytes', { size: '100' }));
    expect(bytesFitler(1024)).toBe(t('{ size } KB', { size: '1.00' }));
    // eslint-disable-next-line no-mixed-operators
    expect(bytesFitler(10 * 1024 ** 2)).toBe(
      t('{ size } MB', { size: '10.00' })
    );
    expect(bytesFitler(1024 ** 2)).toBe(t('{ size } MB', { size: '1.00' }));
    expect(bytesFitler(1024 ** 3)).toBe(t('{ size } GB', { size: '1.00' }));
    expect(bytesFitler(1024 ** 4)).toBe(t('{ size } TB', { size: '1.00' }));
    // eslint-disable-next-line no-mixed-operators
    expect(bytesFitler(3.15 * 1024 ** 4)).toBe(
      t('{ size } TB', { size: '3.15' })
    );
  });

  it('getWebSocketProtocol', () => {
    expect(getWebSocketProtocol('https')).toBe('wss');
    expect(getWebSocketProtocol('http')).toBe('ws');
  });

  it('firstUpperCase', () => {
    expect(firstUpperCase(123)).toBe(123);
    expect(firstUpperCase('123')).toBe('123');
    expect(firstUpperCase('abc')).toBe('Abc');
    expect(firstUpperCase('ABC')).toBe('ABC');
    expect(firstUpperCase(true)).toBe(true);
    expect(firstUpperCase(false)).toBe(false);
    expect(firstUpperCase(null)).toBe(null);
    expect(firstUpperCase(undefined)).toBe(undefined);
    expect(firstUpperCase(NaN)).toBe(NaN);
    expect(firstUpperCase('')).toBe('');
    expect(firstUpperCase(0)).toBe(0);
  });

  it('getNoValue', () => {
    expect(getNoValue(123)).toBe(123);
    expect(getNoValue('123')).toBe('123');
    expect(getNoValue(true)).toBe(true);
    expect(getNoValue(false)).toBe(false);
    expect(getNoValue(null)).toBe('-');
    expect(getNoValue(undefined)).toBe('-');
    expect(getNoValue(NaN)).toBe(NaN);
    expect(getNoValue('')).toBe('-');
    expect(getNoValue(0)).toBe(0);
  });

  it('getGBValue', () => {
    expect(getGBValue(1024)).toBe(1);
    expect(getGBValue(2 * 1024)).toBe(2);
    expect(getGBValue(2.554 * 1024)).toBe(2.55);
    expect(getGBValue(2.555 * 1024)).toBe(2.56);
    expect(getGBValue(2.556 * 1024)).toBe(2.56);
    expect(getGBValue(true)).toBe('');
    expect(getGBValue(false)).toBe('');
    expect(getGBValue(null)).toBe('');
    expect(getGBValue(undefined)).toBe('');
    expect(getGBValue(NaN)).toBe('');
    expect(getGBValue('')).toBe('');
    expect(getGBValue(0)).toBe('');
  });

  it('versionCross', () => {
    expect(versionCross('v1.23.1', 'v1.23.6')).toBe(false);
    expect(versionCross('v1.23.1', 'v1.24.6')).toBe(false);
    expect(versionCross('v1.23.1', 'v1.25.6')).toBe(true);
    expect(versionCross('v1.23.1', 'v2.23.1')).toBe(true);
  });
});
