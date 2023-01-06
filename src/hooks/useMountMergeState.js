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

import useMergedState from './useMergedState';
import { useEffect, useRef } from 'react';

/**
 *
 * @param {*} initialState
 * @param {*} option
 * @returns
 */
export default function useMountMergeState(initialState, option) {
  const mountRef = useRef(false);
  const frame = useRef(undefined);

  useEffect(() => {
    mountRef.current = true;
    return () => {
      clearTimeout(frame.current);
      mountRef.current = false;
    };
  }, []);

  const [state, setState] = useMergedState(initialState, option);
  const mountSetState = (prevState) => {
    clearTimeout(frame.current);
    frame.current = window.setTimeout(() => {
      if (mountRef.current) {
        setState(prevState);
      }
    }, 16);
  };
  return [state, mountSetState];
}
