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
import PropTypes from 'prop-types';
import { iconTypeMap } from 'utils/constants';
import styles from './index.less';

export default function Label(props) {
  const renderIcon = () => {
    const { icon, iconType } = props;
    if (iconType) {
      const iconComp = iconTypeMap[iconType] || null;
      return <span className={styles.icon}>{iconComp}</span>;
    }
    return <span className={styles.icon}>{icon || null}</span>;
  };

  const { content, value, iconType, ...rest } = props;
  if (content) {
    return content;
  }

  return (
    <span {...rest}>
      {renderIcon()}
      {value}
    </span>
  );
}

Label.propTypes = {
  content: PropTypes.any,
  value: PropTypes.any,
  icon: PropTypes.node,
  iconType: PropTypes.string,
};

Label.defaultProps = {
  icon: null,
  iconType: '',
  content: '',
  value: null,
};
