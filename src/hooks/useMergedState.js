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

import React, { useState } from 'react';

/**
 * Similar to `useState` but will use props value if provided.
 */
export default function useMergedState(defaultStateValue, option) {
  const { defaultValue, value, onChange, postState } = option || {};
  // 声明内部 value 值
  const [innerValue, setInnerValue] = useState(() => {
    // value 存在，用 value 初始化 innerValue 的值
    if (value !== undefined) {
      return value;
    }
    // 同上
    if (defaultValue !== undefined) {
      return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
    }
    // defaultStateValue 优先级最低
    return typeof defaultStateValue === 'function'
      ? defaultStateValue()
      : defaultStateValue;
  });

  let mergedValue = value !== undefined ? value : innerValue;
  if (postState) {
    // 数据处理
    mergedValue = postState(mergedValue);
  }

  // 封装内部的 setState
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  const triggerChange = React.useCallback(
    (newValue, ignoreDestroy) => {
      setInnerValue(newValue, ignoreDestroy);
      if (mergedValue !== newValue && onChangeRef.current) {
        onChangeRef.current(newValue, mergedValue);
      }
    },
    [mergedValue, onChangeRef]
  );

  // Effect of reset value to `undefined`
  const prevValueRef = React.useRef(value);
  React.useEffect(() => {
    if (value === undefined && value !== prevValueRef.current) {
      setInnerValue(value);
    }

    prevValueRef.current = value;
  }, [value]);

  return [mergedValue, triggerChange];
}
