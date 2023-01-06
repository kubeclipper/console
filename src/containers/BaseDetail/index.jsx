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
import React, { useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import { toJS } from 'mobx';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react';

import styles from './index.less';
import Card from 'components/DetailCard';

const Item = observer((props) => {
  const { it, index, store } = props;
  const { title, titleHelp, options, cardButton } = it;
  const ref = useRef();
  const [gridSpan, setGridSpan] = useState(0);
  const BASEGRID = 1;
  const BASEPADDING = 16;

  useEffect(() => {
    const [nodes] = ref.current.childNodes;
    setGridSpan(Math.round(nodes.clientHeight / BASEGRID));
  }, [store.isLoading, store.detail]);

  const gridComputed =
    gridSpan > 0 ? { gridRow: `auto / span ${gridSpan + BASEPADDING}` } : {};

  return (
    <div
      className={classnames(styles.item, 'detail-card-item')}
      style={gridComputed}
      ref={ref}
    >
      <Card
        key={`card-left-${index}`}
        data={toJS(store.detail)}
        title={title}
        titleHelp={titleHelp}
        options={options}
        loading={store.isLoading}
        cardButton={cardButton}
      />
    </div>
  );
});

const Columns = (props) => {
  const { cards, store } = props;

  return cards.map((it, index) => {
    if (isEmpty(it)) return null;

    return <Item it={it} index={index} store={store} key={index} />;
  });
};

function BaseDetail(props) {
  const { cards, store } = props;

  return (
    <div className={classnames(styles.main)}>
      <Columns cards={cards} store={store} />
    </div>
  );
}

BaseDetail.defaultProps = {
  cards: [],
};

export default observer(BaseDetail);
