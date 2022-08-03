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
import React, { useEffect, useState } from 'react';
import { Select } from 'antd';
import {
  circleDayofFirstLevel,
  circleDayofSecondLevel,
} from 'resources/backup';

const { Option } = Select;

export default function SelectCycle(props) {
  const { onChange } = props;

  const [firstLevelSelected, setFirstLevelSelected] = useState(
    circleDayofFirstLevel[0]
  );
  const [secondLevels, setSecondLevels] = useState(
    circleDayofSecondLevel[firstLevelSelected.key]
  );
  const [secondLevelSelected, setSecondLevelSelected] = useState(
    secondLevels[0]
  );

  const handleFirstLevelChange = (_, data) => {
    setFirstLevelSelected(data);
    setSecondLevels(circleDayofSecondLevel[data.key]);
    setSecondLevelSelected(circleDayofSecondLevel[data.key][0]);
  };

  const onSecondLevelChange = (val, data) => {
    setSecondLevelSelected(data);
  };

  useEffect(() => {
    onChange({ firstLevelSelected, secondLevelSelected });
  }, [firstLevelSelected, secondLevelSelected]);

  return (
    <>
      <Select
        defaultValue={firstLevelSelected.value}
        style={{ width: 120 }}
        onChange={handleFirstLevelChange}
      >
        {circleDayofFirstLevel.map(({ label, key, value: _value }) => (
          <Option key={key} value={_value}>
            {label}
          </Option>
        ))}
      </Select>
      {secondLevels.length ? (
        <Select
          style={{ width: 120, marginLeft: 20 }}
          value={secondLevelSelected?.value}
          onChange={onSecondLevelChange}
        >
          {secondLevels.map(({ value: _value, label }) => (
            <Option key={_value}>{label}</Option>
          ))}
        </Select>
      ) : null}
    </>
  );
}
