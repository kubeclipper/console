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
import React from 'react';
import Status from 'components/Status';
import PropTypes from 'prop-types';
import { getUserStatus } from 'utils/status';

function UserStatus({ status }) {
  const statusStr = getUserStatus(status);
  return (
    <Status type={statusStr} name={t(`USER_${statusStr.toUpperCase()}`)} />
  );
}

UserStatus.propTypes = {
  status: PropTypes.string,
};

export default UserStatus;
