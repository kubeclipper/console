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
import { get } from 'lodash';
import { getWebSocketProtocol } from 'utils';

const readyStates = ['connecting', 'open', 'closing', 'closed'];
const defaultOptions = {
  reopenLimit: 3,
  onopen() {},
  onmessage() {},
  onclose() {},
  onerror() {},
  oncloseLastTime() {},
};

export default class SocketClient {
  static composeEndpoint = (socketUrl, suffix = '') => {
    const re = /(\w+?:\/\/)?([^\\?]+)/;
    const matchParts = String(socketUrl).match(re);
    return `${getWebSocketProtocol(window.location.protocol)}://${
      matchParts[2]
    }${suffix}`;
  };

  constructor(endpoint, options = {}) {
    this.endpoint = endpoint;
    this.options = Object.assign(defaultOptions, options);

    if (!this.endpoint) {
      throw Error(`invalid websocket endpoint: ${this.endpoint}`);
    }
    this.client = null;
    this.reopenCount = 0;
    this.time = null;
    this.isTimeOut = false;
    this.setUp();
  }

  getSocketState(readyState) {
    if (readyState === undefined) {
      readyState = this.client.readyState;
    }

    return readyStates[readyState];
  }

  initClient() {
    const subProto = get(this.options, 'subProtocol');

    if (!this.client) {
      this.client = new WebSocket(this.endpoint, subProto);
    }

    if (this.client && this.client.readyState > 1) {
      this.client.close();
      this.client = new WebSocket(this.endpoint, subProto);
    }

    return this.client;
  }

  setWsTimeOut() {
    this.time && clearTimeout(this.time);
    this.time = setTimeout(() => {
      this.reopenCount = defaultOptions.reopenLimit;
      this.isTimeOut = true;
      this.client?.close();
      clearTimeout(this.time);
      this.time = null;
    }, global_config.terminalTimeOut * 60 * 1000);
  }

  attachEvents() {
    const { onopen, onmessage, onclose, onerror, oncloseLastTime, ontimeOut } =
      this.options;

    this.client.onopen = (ev) => {
      onopen?.(ev);
    };

    this.client.onmessage = (message) => {
      let { data } = message;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {}
      }

      this.setWsTimeOut();
      onmessage?.(data);
    };

    this.client.onclose = (ev) => {
      if (
        ev.code !== 1000 &&
        !this.immediately &&
        this.reopenCount < this.options.reopenLimit
      ) {
        setTimeout(this.setUp.bind(this), 1000);
        this.reopenCount++;
      } else if (this.isTimeOut) {
        ontimeOut?.(ev);
      } else {
        oncloseLastTime?.(ev);
      }

      onclose?.(ev);
    };

    this.client.onerror = (ev) => {
      console.error('socket error: ', ev);
      onerror?.(ev);
    };
  }

  send(data) {
    return this.client.send(data);
  }

  close(val) {
    val && (this.immediately = true);
    this.client.close();
  }

  setUp() {
    this.initClient();
    this.attachEvents();
  }
}
