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
import React, { useEffect } from 'react';
import { debounce } from 'lodash';
import { Terminal } from 'xterm';
import PropTypes from 'prop-types';
import * as fit from 'xterm/lib/addons/fit/fit';
import SocketClient from 'utils/socket.client';

import './xterm.css';
import './terminal.css';

Terminal.applyAddon(fit);

const DEFAULT_TERMINAL_OPTS = {
  lineHeight: 1.2,
  cursorBlink: true,
  cursorStyle: 'underline',
  fontSize: 12,
  fontFamily: "Monaco, Menlo, Consolas, 'Courier New', monospace",
  theme: {
    background: '#181d28',
  },
};

export default function ContainerTerminal(props) {
  const { initText, terminalOpts, websocketUrl } = props;
  let first = true;
  const containerRef = React.createRef();
  let term;
  let ws;

  useEffect(() => {
    createTerm();
    createWS();
    onTerminalResize();
    onTerminalKeyPress();

    disableTermStdin();

    return () => {
      term.destroy();
      disconnect();
      removeResizeListener();
    };
  }, []);

  function createTerm() {
    const _terminalOpts = { ...DEFAULT_TERMINAL_OPTS, ...terminalOpts };
    term = new Terminal(_terminalOpts);
    term.open(containerRef.current);
    term.write(initText);
    term.fit();
  }

  function createWS() {
    ws = new SocketClient(websocketUrl, {
      onopen: onWSOpen,
      onmessage: onWSReceive,
      onerror: onWSError,
      oncloseLastTime: onWSCloseLastTime,
      onclose: onWSClose,
      ontimeOut: onTimeOut,
    });
  }

  const isWsOpen = () => ws?.getSocketState() === 'open';

  function disableTermStdin(disabled = true) {
    const { textarea = {} } = term;
    textarea.disabled = disabled;
  }

  function onTerminalResize() {
    window.addEventListener('resize', onResize());
    term.on('resize', resizeRemoteTerminal);
  }

  function onTerminalKeyPress() {
    term.on('data', (data) => {
      if (isWsOpen()) {
        ws.send(packStdin(data));
      }
    });
  }

  function resizeRemoteTerminal() {
    const { cols, rows } = term;
    if (isWsOpen()) {
      ws.send(packResize(cols, rows));
    }
  }

  function removeResizeListener() {
    window.removeEventListener('resize', onResize());
  }

  function disconnect() {
    if (term) {
      disableTermStdin(true);
    }

    if (ws) {
      ws.close(true);
    }
  }

  const onResize = () => debounce(() => term.fit(), 800);

  const packStdin = (data) =>
    JSON.stringify({
      type: 'cmd',
      cmd: btoa(data),
    });

  const packResize = (col, row) =>
    JSON.stringify({
      type: 'resize',
      Cols: col,
      Rows: row,
    });

  const onWSOpen = () => {
    term.setOption('cursorBlink', true);
  };

  const onWSClose = () => {
    term.setOption('cursorBlink', false);
  };

  const onWSCloseLastTime = (ev) => {
    const err = `\r\n${ev.reason}`;
    term.write(`\x1B[1;31m${err}\x1B[m`);

    let message = t('Terminal Close Tip');
    message = `\r\n${message}`;
    term.write(`\x1B[1;31m${message}\x1B[m`);
  };

  const onTimeOut = () => {
    let message = t('Terminal Timeout Tip', {
      time: global_config.terminalTimeOut,
    });
    message = `\r\n${message}`;
    term.write(`\x1B[1;31m${message}\x1B[m`);
  };

  const onWSError = (ex) => {
    fatal(ex.message);
  };

  const onWSReceive = (data) => {
    if (first) {
      first = false;
      disableTermStdin(false);
      term.reset();
      term.element && term.focus();
      resizeRemoteTerminal();
    }

    term.write(`${data}`);
  };

  const fatal = (message) => {
    if (!message && first)
      message =
        'Could not connect to the container. Do you have sufficient privileges?';
    if (!message) message = 'disconnected';
    if (!first) message = `\r\n${message}`;
    if (first) term.reset();
    term.write(`\x1b[31m${message}\x1b[m\r\n`);
  };

  return (
    <kubernetes-container-terminal
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
      }}
      ref={containerRef}
    />
  );
}

ContainerTerminal.propsTypes = {
  terminalOpts: PropTypes.object,
  websocketUrl: PropTypes.string,
  initText: PropTypes.string,
};

ContainerTerminal.defaultProps = {
  terminalOpts: {},
  initText: 'Connecting...',
};
