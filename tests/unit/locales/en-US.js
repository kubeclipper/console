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

module.exports = {
  SIMPLE: 'Simple',
  HELLO: 'Hello, {name}',
  TIP: 'This is <span>HTML</span>',
  TIP_VAR: 'This is<span>{message}</span>',
  SALE_START: 'Sale begins {start, date}',
  SALE_END: 'Sale begins {start, date, long}',
  COUPON: 'Coupon expires at {expires, time, medium}',
  SALE_PRICE: 'The price is {price, number, USD}',
  PHOTO:
    'You have {num, plural, =0 {no photos.} =1 {one photo.} other {# photos.}}',
  NESTED: {
    HELLO: 'Hello World',
    HELLO_NAME: 'Hello, {name}',
  },
  'DOT.HELLO': 'Hello World',
  BRACE1: 'The format is {var}',
  // eslint-disable-next-line no-template-curly-in-string
  BRACE2: 'The format is ${var}',
  ONLY_IN_ENGLISH: 'ONLY_IN_ENGLISH',
  SKELETON_VAR: 'Increase by {value, number, ::.0#}',
  SKELETON_SELECTORDINAL:
    "It's my cat's {year, selectordinal, one {#st} two {#nd} few {#rd} other {#th}} birthday!",
  'not-exist-key': 'not-exist-key',
};
