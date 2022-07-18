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
import emptyCard from 'asset/image/empty-card.svg';

import styles from './index.less';

function NotFound({ title, link }) {
  return (
    <div className={styles.wrapper}>
      <img className={styles.image} src={emptyCard} alt="" />
      <div className={styles.text}>
        <div className="h1">Not Found</div>
        <p>{t.html('DETAIL_NOT_FOUND_DESC', { title, link })}</p>
      </div>
    </div>
  );
}

NotFound.propTypes = {
  title: PropTypes.string,
  link: PropTypes.string,
};

NotFound.defaultProps = {
  title: '',
  link: '/',
};

export default NotFound;
