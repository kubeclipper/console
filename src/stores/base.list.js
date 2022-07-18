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
import { makeAutoObservable } from 'mobx';

export default class List {
  data = [];

  page = 1;

  limit = 10;

  total = 0;

  reverse = false;

  silent = false;

  filters = {};

  isLoading = true;

  selectedRowKeys = [];

  constructor() {
    makeAutoObservable(this);
  }

  update(params) {
    Object.keys(params).forEach((key) => {
      this[key] = params[key];
    });
  }

  reset() {
    this.data = [];
    this.page = 1;
    this.limit = 10;
    this.reverse = false;
    this.silent = false;
    this.filters = {};
    this.isLoading = true;
    this.selectedRowKeys = [];
  }
}
