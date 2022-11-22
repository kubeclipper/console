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
import { action, observable, makeObservable } from 'mobx';
import { getWebSocketProtocol } from 'utils';
import SocketClient from 'utils/socket.client';
import { devIp } from '../../config/common';

export default class WebSocketStore {
  message = {};

  constructor() {
    makeObservable(this, {
      message: observable,
      receive: action,
    });
  }

  get host() {
    return process.env.NODE_ENV === 'development'
      ? devIp
      : window.location.host;
  }

  get websocketUrl() {
    return (url) =>
      `${getWebSocketProtocol(window.location.protocol)}://${this.host}/${url}`;
  }

  watch(url) {
    if (this.wsClient) {
      this.wsClient.close(true);
    }

    this.wsClient = new SocketClient(this.websocketUrl(url), {
      onmessage: this.receive,
    });
  }

  receive = (data) => {
    this.message = data;
  };

  close() {
    if (this.wsClient) {
      this.wsClient.close(true);
    }
  }
}
