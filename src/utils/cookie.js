/* eslint-disable no-useless-escape */
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
/* \
|*|
|*|  :: cookies.js ::
|*|
|*|  A complete cookies reader/writer framework with full unicode support.
|*|
|*|  https://developer.mozilla.org/en-US/docs/DOM/document.cookie
|*|
|*|  This framework is released under the GNU Public License, version 3 or later.
|*|  http://www.gnu.org/licenses/gpl-3.0-standalone.html
|*|
|*|  Syntaxes:
|*|
|*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
|*|  * docCookies.getItem(name)
|*|  * docCookies.removeItem(name[, path], domain)
|*|  * docCookies.hasItem(name)
|*|  * docCookies.keys()
|*|
\ */

const docCookies = {
  getItem(sKey) {
    return (
      decodeURIComponent(
        document.cookie.replace(
          new RegExp(
            `(?:(?:^|.*;)\\s*${encodeURIComponent(sKey).replace(
              /[-.+*]/g,
              '\\$&'
            )}\\s*\\=\\s*([^;]*).*$)|^.*$`
          ),
          '$1'
        )
      ) || null
    );
  },
  setItem(sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
      return false;
    }
    let sExpires = '';
    if (vEnd) {
      // eslint-disable-next-line default-case
      switch (vEnd.constructor) {
        case Number:
          sExpires =
            vEnd === Infinity
              ? '; expires=Fri, 31 Dec 9999 23:59:59 GMT'
              : `; max-age=${vEnd}`;
          break;
        case String:
          sExpires = `; expires=${vEnd}`;
          break;
        case Date:
          sExpires = `; expires=${vEnd.toUTCString()}`;
          break;
      }
    }
    document.cookie = `${encodeURIComponent(sKey)}=${encodeURIComponent(
      sValue
    )}${sExpires}${sDomain ? `; domain=${sDomain}` : ''}${
      sPath ? `; path=${sPath}` : ''
    }${bSecure ? '; secure' : ''}`;
    return true;
  },
  removeItem(sKey, sPath, sDomain) {
    if (!sKey || !this.hasItem(sKey)) {
      return false;
    }
    document.cookie = `${encodeURIComponent(
      sKey
    )}=; expires=Thu, 01 Jan 1970 00:00:00 GMT${
      sDomain ? `; domain=${sDomain}` : ''
    }${sPath ? `; path=${sPath}` : ''}`;
    return true;
  },
  hasItem(sKey) {
    return new RegExp(
      `(?:^|;\\s*)${encodeURIComponent(sKey).replace(/[-.+*]/g, '\\$&')}\\s*\\=`
    ).test(document.cookie);
  },
  // eslint-disable-next-line object-shorthand
  keys: /* optional method: you can safely remove it! */ function () {
    const aKeys = document.cookie
      .replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, '')
      .split(/\s*(?:\=[^;]*)?;\s*/);
    for (let nIdx = 0; nIdx < aKeys.length; nIdx++) {
      aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
    }
    return aKeys;
  },
};

export default docCookies;
