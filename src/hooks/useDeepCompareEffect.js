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

import { useEffect, useRef } from 'react';
import isEqual from 'react-fast-compare';

const isPrimitive = (val) => val !== Object(val);

/**
 * useDeepCompareEffect
 * @param {*} effect
 * @param {*} deps
 */
export default function useDeepCompareEffect(effect, deps) {
  if (!deps || !deps.length) {
    console.warn('deps 里面不能没有数据');
  }

  if (deps.every(isPrimitive)) {
    console.warn('原始类型的值,请使用 useEffect');
  }

  const ref = useRef(undefined);

  if (!isEqual(deps, ref.current)) {
    ref.current = deps;
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, ref.current);
}
