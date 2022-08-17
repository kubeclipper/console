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
export const dayOfMonth = (() => {
  const result = {};
  Array.from({ length: 31 }).forEach((_, index) => {
    result[index + 1] = index + 1;
  });
  result.L = t('LastDayOfMonth');
  return result;
})();

export const dayOfWeek = {
  1: t('Monday'),
  2: t('Tuesday'),
  3: t('Wednesday'),
  4: t('Thursday'),
  5: t('Friday'),
  6: t('Saturday'),
  0: t('Sunday'),
};

export const dayOfWeekOption = [
  {
    label: t('Monday'),
    value: 1,
  },
  {
    label: t('Tuesday'),
    value: 2,
  },
  {
    label: t('Wednesday'),
    value: 3,
  },
  {
    label: t('Thursday'),
    value: 4,
  },
  {
    label: t('Friday'),
    value: 5,
  },
  {
    label: t('Saturday'),
    value: 6,
  },
  {
    label: t('Sunday'),
    value: 0,
  },
];

export const cronTypeOption = [
  {
    value: 'Repeat',
    label: t('Repeat'),
  },
  {
    value: 'OnlyOnce',
    label: t('OnlyOnce'),
  },
];
