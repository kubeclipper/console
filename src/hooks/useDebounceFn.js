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

import { useRef, useCallback, useEffect } from 'react';
import useRefFunction from './useRefFunction';

/**
 * useDebounceFn
 * @param {*} fn
 * @param {*} options
 * @returns
 */
export default function useDebounceFn(fn, wait) {
  const callback = useRefFunction(fn);

  const timer = useRef();

  const cancel = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const run = useCallback(
    async (...args) => {
      if (wait === 0 || wait === undefined) {
        return callback(...args);
      }
      cancel();
      return new Promise((resolve) => {
        timer.current = setTimeout(async () => {
          resolve(await callback(...args));
        }, wait);
      });
    },
    [callback, cancel, wait]
  );

  useEffect(() => cancel, [cancel]);

  return {
    run,
    cancel,
  };
}
