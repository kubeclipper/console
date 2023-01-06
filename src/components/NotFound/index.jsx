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
import { Link } from 'react-router-dom';
import i18n from 'core/i18n';

import styles from './index.less';

const { t } = i18n;

function NotFound({ title, link, codeError }) {
  let h = '';
  if (codeError) {
    h = 'Error';
  } else {
    h = 'Resource Not Found';
  }

  const des = t('Unable to get {title} ', {
    title,
  });

  const p = (
    <p>
      {des},{t('Back to')}
      {link && <Link to={link}>{t('Home page')}</Link>}
    </p>
  );

  return (
    <div className={styles.wrapper}>
      <img className={styles.image} src={emptyCard} alt="" />
      <div className={styles.text}>
        <div className="h1">{h}</div>
        {p}
      </div>
    </div>
  );
}

NotFound.propTypes = {
  link: PropTypes.string,
};

NotFound.defaultProps = {
  link: '/',
};

export default NotFound;
