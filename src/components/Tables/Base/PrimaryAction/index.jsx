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
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ActionButton from '../ActionButton';
import { getAllowedResults } from 'utils/allowed';
import { generateId } from 'utils';
import { useRootStore } from 'stores';

const PrimaryAction = (props) => {
  const { routing } = useRootStore();
  const { primaryActions, containerProps, onFinishAction } = props;
  const { detail = null } = containerProps;
  const [primaryAllowedResults, setPrimaryAllowedResults] = useState([]);

  useEffect(() => {
    let isUnmount = false;

    async function getResult() {
      const results = await getAllowedResults(
        primaryActions,
        detail,
        null,
        containerProps
      );

      if (!isUnmount) {
        setPrimaryAllowedResults(results);
      }
    }

    getResult();

    return () => (isUnmount = true);
  }, []);

  if (!primaryActions) return null;

  const primaryActionButtons = primaryActions.map((it, index) => {
    const key = `primary-${generateId()}`;
    const { id, title, buttonType, actionType } = it;
    const config = {
      id,
      title,
      buttonType,
      actionType,
      action: it,
    };

    return (
      <ActionButton
        {...config}
        key={key}
        isAllowed={primaryAllowedResults[index]}
        onFinishAction={onFinishAction}
        routing={routing}
        containerProps={containerProps}
      />
    );
  });

  return <>{primaryActionButtons}</>;
};

PrimaryAction.propTypes = {
  visibleButtonNumber: PropTypes.number,
  primaryActions: PropTypes.array,
  onFinishAction: PropTypes.func,
  containerProps: PropTypes.object,
};

PrimaryAction.defaultProps = {
  visibleButtonNumber: 3,
  primaryActions: [],
  onFinishAction: null,
  containerProps: {},
};

export default PrimaryAction;
