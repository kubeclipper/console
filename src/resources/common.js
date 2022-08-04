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

export const computeAutoDetectionReversion = (values) => {
  const { IPv4AutoDetection: ipv_4, IPv6AutoDetection: ipv_6 } = values;

  function IPv4AutoDetectionReversion(val) {
    if (val === 'first-found') {
      return {
        pod_network_underlay: 'first-found',
        IPv4AutoDetection: '',
      };
    } else {
      const [underlay, IPv4AutoDetection] = val.split('=');
      return {
        pod_network_underlay: underlay,
        IPv4AutoDetection,
      };
    }
  }

  function IPv6AutoDetectionReversion(val) {
    if (val === '') {
      return {
        pod_network_underlay_v6: 'first-found',
        IPv6AutoDetection: '',
        IPVersion: 'IPv4',
      };
    } else if (val === 'first-found') {
      return {
        pod_network_underlay_v6: 'first-found',
        IPv6AutoDetection: '',
        IPVersion: 'IPv4+IPv6',
      };
    } else {
      const [underlay, IPv6AutoDetection] = val.split('=');
      return {
        pod_network_underlay_v6: underlay,
        IPv6AutoDetection,
        IPVersion: 'IPv4+IPv6',
      };
    }
  }

  return {
    ...IPv4AutoDetectionReversion(ipv_4),
    ...IPv6AutoDetectionReversion(ipv_6),
  };
};
