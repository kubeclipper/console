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
  roots: ['<rootDir>/src'],
  coverageDirectory: 'unitCoverage',
  coveragePathIgnorePatterns: ['<rootDir>/tests'],
  setupFiles: ['react-app-polyfill/jsdom'],
  setupFilesAfterEnv: [
    '<rootDir>/tests/unit/setup.js',
    '<rootDir>/node_modules/jest-enzyme/lib/index.js',
  ],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx|mjs|cjs|ts|tsx)$':
      '<rootDir>/tests/unit/transform/babelTransform.js',
    '^.+\\.css$': '<rootDir>/tests/unit/transform/cssTransform.js',
    '^(?!.*\\.(js|jsx|mjs|cjs|ts|tsx|css|json)$)':
      '<rootDir>/tests/unit/transform/fileTransform.js',
  },
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  modulePaths: [],
  moduleNameMapper: {
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    '^core/(.*)$': '<rootDir>/src/core/$1',
    '^layouts/(.*)$': '<rootDir>/src/layouts/$1',
    '^components/(.*)$': '<rootDir>/src/components/$1',
    '^pages/(.*)$': '<rootDir>/src/pages/$1',
    '^utils/(.*)$': '<rootDir>/src/utils/$1',
    '^stores/(.*)$': '<rootDir>/src/stores/$1',
  },
  moduleFileExtensions: ['js', 'ts', 'tsx', 'jsx', 'json'],
  resetMocks: true,
  // coverageThreshold: {
  //   global: {
  //     branches: 80,
  //     functions: 80,
  //     lines: 80,
  //     statements: 80,
  //   },
  // },
};
