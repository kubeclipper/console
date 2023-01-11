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

export const uiSchemas = [
  {
    name: 'kubesphere',
    schema: {
      properties: {
        enable: {
          default: false,
          priority: 0,
          title: 'Kubesphere',
          type: 'boolean',
        },
        clusterRole: {
          widget: 'radio',
          props: {
            optionType: 'button',
          },
        },
        plugin: {
          widget: 'KSPlugins',
        },
        storageClass: {
          widget: 'select-input',
        },
        HostClusterName: {
          hidden:
            '{{formData.enable === false || formData.clusterRole !== "member"}}',
        },
        jwtSecret: {
          hidden:
            '{{formData.enable === false || formData.clusterRole === "member"}}',
        },
      },
    },
  },
  {
    name: 'nfs-provisioner',
    schema: {
      properties: {
        enable: {
          default: false,
          priority: 0,
          title: 'nfs-provisioner',
          type: 'boolean',
        },
        reclaimPolicy: {
          widget: 'select',
          props: {},
          enum: ['Retain', 'Delete'],
          enumNames: ['Retain', 'Delete'],
        },
        mountOptions: {
          widget: 'ArrayString',
          props: {
            isInput: true,
            width: '100%',
          },
        },
      },
    },
  },
  {
    name: 'nfs-csi',
    schema: {
      properties: {
        enable: {
          default: false,
          priority: 0,
          title: 'nfs-csi',
          type: 'boolean',
        },
        reclaimPolicy: {
          widget: 'select',
          props: {},
          enum: ['Retain', 'Delete'],
          enumNames: ['Retain', 'Delete'],
        },
        mountOptions: {
          widget: 'ArrayString',
          props: {
            isInput: true,
            width: '100%',
          },
        },
      },
    },
  },
  {
    name: 'cinder',
    schema: {
      properties: {
        enable: {
          default: false,
          priority: 0,
          title: 'cinder',
          type: 'boolean',
        },
        caCert: {
          widget: 'textarea',
        },
      },
    },
  },
  {
    name: 'ceph-csi',
    schema: {
      properties: {
        enable: {
          default: false,
          priority: 0,
          title: 'ceph-csi',
          type: 'boolean',
        },
        monitors: {
          widget: 'ArrayString',
          props: {
            isInput: true,
          },
          default: [null],
        },
      },
    },
  },

  {
    name: 'metallb',
    schema: {
      properties: {
        enable: {
          default: false,
          priority: 0,
          title: 'metallb',
          type: 'boolean',
        },

        addresses: {
          widget: 'ArrayString',
          props: {
            isInput: true,
            width: '100%',
          },
        },
      },
    },
  },
];
