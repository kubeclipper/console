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
import { useRootStore } from 'stores';
import { getAllowedResults, getActionList } from 'utils/allowed';
import { useDeepCompareEffect } from 'hooks';
import DropdownActions from './DropdownActions';

const ItemAction = ({
  actions,
  item,
  containerProps,
  onFinishAction,
  firstActionClassName,
}) => {
  const [results, setResults] = useState([]);
  const { routing } = useRootStore();

  const { actionList, firstAction, moreActions } = getActionList(
    actions,
    item,
    containerProps
  );

  useDeepCompareEffect(() => {
    async function updateResult() {
      const newResults = await getAllowedResults(
        actionList,
        item,
        'action',
        containerProps
      );
      setResults(newResults);
    }

    updateResult();
  }, [containerProps, item]);

  return (
    <DropdownActions
      onFinishAction={onFinishAction}
      firstAction={firstAction}
      moreActions={moreActions}
      alloweds={results}
      item={item}
      routing={routing}
      containerProps={containerProps}
      firstActionClassName={firstActionClassName}
    />
  );
};

export default ItemAction;
