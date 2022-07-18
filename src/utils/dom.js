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
// eslint-disable-next-line import/prefer-default-export
export function createCenterWindowOpt({ width = 800, height = 500, ...reset }) {
  const {
    width: screenWidth,
    height: screenHeight,
    availWidth,
    availHeight,
  } = window.screen;

  const viewportWidth = availWidth || screenWidth;
  const viewportHeight = availHeight || screenHeight;

  const left = (viewportWidth - width) / 2;
  const top = (viewportHeight - height) / 2;

  const options = {
    left: left > 0 ? left : 0,
    top: top > 0 ? top : 0,
    width,
    height,
    ...reset,
  };

  return Object.entries(options).reduce(
    (windowOpts, [key, value]) => `${windowOpts},${key}=${value}`,
    ''
  );
}
