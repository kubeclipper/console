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
import React, { Suspense } from 'react';
import { getWebSocketProtocol } from 'utils';
import ContainerTerminal from './terminal';
import { devIp } from '../../../config/common';

const BG_COLOR = '#181d28';

export default function SessionTerminal(props) {
  const { url, isLoading } = props;

  const formatUrl = () => {
    const { protocol, host } = window.location;

    const wsIp = `${getWebSocketProtocol(protocol)}://${
      process.env.NODE_ENV === 'development' ? devIp : host
    }`;

    return `${wsIp}${url}`;
  };

  const terminalOpts = {
    theme: {
      background: BG_COLOR,
    },
  };

  return (
    <div
      style={{
        height: '100%',
        borderRadius: '4px',
        background: BG_COLOR,
        padding: '12px',
        color: '#fff',
      }}
    >
      <Suspense fallback={'Loading'}>
        {isLoading ? (
          'Loading'
        ) : (
          <ContainerTerminal
            websocketUrl={formatUrl()}
            terminalOpts={terminalOpts}
          />
        )}
      </Suspense>
    </div>
  );
}
