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
const getTitle = (title) => {
  const language = Cypress.env('language') || 'zh';

  if (language === 'en') {
    return title;
  }
  const translate = Cypress.env('translate') || {};
  return translate[title] || title;
};

export function testCase(caseName) {
  const _value = {
    caseName,
    tags: [caseName],
    cases: [],
  };
  const self = {
    value: () => [caseName, _value],
    smoke: () => {
      _value.tags.push('smoke');
      return self;
    },
    slow: () => {
      _value.tags.push('slow');
      return self;
    },
    addCase: (name) => {
      _value.cases.push(name);
      return self;
    },
  };
  return self;
}

export default getTitle;
