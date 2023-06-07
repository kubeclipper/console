import React from 'react';
import RightContent from 'components/Layout/GlobalHeader/RightContent';
import styles from './index.less';

export const GlobalHeader = (props) => (
  <div className={styles.header}>
    <span className={styles.title}>{global_config.title}</span>
    <RightContent {...props} />
  </div>
);
