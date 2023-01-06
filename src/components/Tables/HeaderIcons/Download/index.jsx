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

import React, { useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import FileSaver from 'file-saver';
import { DownloadOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Menu, Dropdown, Progress, Tooltip } from 'antd';
import { get, isObject, isArray } from 'lodash';
import { Parser } from 'json2csv';
import { toLocalTime } from 'utils';
import Notify from 'components/Notify';
import styles from './index.less';

export default function Download(props) {
  const {
    total,
    datas,
    columns,
    resourceName,
    getValueRenderFunc,
    getData,
    pageSize,
  } = props;

  const reducer = (state, action) => {
    // eslint-disable-next-line default-case
    switch (action.type) {
      case 'beginDownload':
        return {
          ...state,
          isDownloading: true,
          percent: 0,
          current: 1,
        };
      case 'getDownloadData':
        return {
          ...state,
          ...action.payload,
          percent: 100,
        };
      case 'finishDownload':
        return {
          ...state,
          isDownloading: false,
        };
    }
  };

  const [state, dispatch] = useReducer(reducer, {
    isDownloading: false,
    current: 1,
    allData: [],
    // marker: null, // todo
  });
  const { current, isDownloading, allData, percent } = state;

  const getDownloadHeader = () =>
    columns.map((it) => ({
      label: it.title,
      value: it.dataIndex,
      default: '',
    }));

  const getSimpleValue = (value, data, dataIndex) => {
    if (isArray(value)) {
      return value.join('; ');
    }
    if (isObject(value)) {
      if (React.isValidElement(value)) {
        return (data[dataIndex] && data[dataIndex].toString()) || '-';
      }
      return data[dataIndex];
    }
    return value;
  };

  const getColumnData = (data, column) => {
    const { dataIndex, render, valueRender, stringify } = column;
    const value = get(data, dataIndex);
    if (!render && !valueRender && !stringify) {
      return getSimpleValue(value, data, dataIndex);
    }
    if (stringify) {
      return stringify(value, data);
    }
    if (valueRender) {
      const renderFunc = getValueRenderFunc(valueRender);
      return getSimpleValue(renderFunc(value, data), data, dataIndex);
    }
    if (render) {
      return getSimpleValue(render(value, data), data, dataIndex);
    }
  };

  const getDownloadData = () =>
    datas.map((data) => {
      const item = {};
      columns.forEach((it) => {
        const value = getColumnData(data, it);
        item[it.dataIndex] = value;
      });
      return item;
    });

  const getDownloadDataAll = () =>
    allData.map((data) => {
      const item = {};
      columns.forEach((it) => {
        const value = getColumnData(data, it);
        item[it.dataIndex] = value;
      });
      return item;
    });

  const getFileName = (isAll) => {
    const timeStr = toLocalTime(new Date().getTime());
    return isAll
      ? `${resourceName}-${t('all')}-${timeStr}.csv`
      : `${resourceName}-${timeStr}.csv`;
  };

  const exportCurrentData = () => {
    const fields = getDownloadHeader();
    const jsonData = getDownloadData();
    const parser = new Parser({ fields });
    const csv = parser.parse(jsonData);
    const exportContent = '\uFEFF';
    const blob = new Blob([exportContent + csv], {
      type: 'text/plain;charset=utf-8',
    });
    const fileName = getFileName();
    FileSaver.saveAs(blob, fileName);
    Notify.success(t('Current data downloaded.'));
  };

  const exportAllData = () => {
    const fields = getDownloadHeader();
    const jsonData = getDownloadDataAll();
    const parser = new Parser({ fields });
    const csv = parser.parse(jsonData);
    const exportContent = '\uFEFF';
    const blob = new Blob([exportContent + csv], {
      type: 'text/plain;charset=utf-8',
    });
    const fileName = getFileName(true);
    FileSaver.saveAs(blob, fileName);
    Notify.success(t('All data downloaded.'));
  };

  useEffect(() => {
    async function GetData() {
      const response = await getData({ page: current, limit: pageSize });
      dispatch({
        type: 'getDownloadData',
        payload: {
          allData: response,
        },
      });
    }

    if (isDownloading) {
      GetData();
    }
  }, [isDownloading]);

  useEffect(() => {
    if (isDownloading) {
      dispatch({ type: 'finishDownload' });
      exportAllData();
    }
  }, [allData]);

  const Downloading = async () => {
    dispatch({ type: 'beginDownload' });
  };

  const renderDownloadCurrent = () => (
    <Tooltip title={t('Download Data')}>
      <Button
        type="default"
        onClick={exportCurrentData}
        icon={<DownloadOutlined />}
      />
    </Tooltip>
  );

  const renderDownloadAll = () => {
    const menu = (
      <Menu>
        <Menu.Item key="current" onClick={exportCurrentData}>
          {t('Download current data')}
        </Menu.Item>
        <Menu.Item key="all" onClick={Downloading}>
          {t('Download all data')}
        </Menu.Item>
      </Menu>
    );

    const renderProgress = () => {
      if (!isDownloading) return null;
      return (
        <Progress
          percent={percent}
          status="active"
          className={styles.progress}
        />
      );
    };

    const renderCancelBtn = () => {
      if (!isDownloading) return null;

      const cancelDownload = () => {
        dispatch({ type: 'finishDownload' });
        Notify.warn(t('Download canceled!'));
      };

      return (
        <Tooltip title={t('Cancel Download')}>
          <Button
            type="danger"
            shape="circle"
            onClick={cancelDownload}
            icon={<CloseOutlined />}
            size="small"
          />
        </Tooltip>
      );
    };

    return (
      <>
        <Dropdown overlay={menu}>
          <Button type="default" icon={<DownloadOutlined />} />
        </Dropdown>
        {renderProgress()}
        {renderCancelBtn()}
      </>
    );
  };

  if (total === datas.length) {
    return renderDownloadCurrent();
  }
  return renderDownloadAll();
}

Download.propTypes = {
  columns: PropTypes.array,
  datas: PropTypes.array,
  total: PropTypes.number,
  pageSize: PropTypes.number,
  getValueRenderFunc: PropTypes.func.isRequired,
  resourceName: PropTypes.string,
  getData: PropTypes.func,
};

Download.defaultProps = {
  columns: [],
  datas: [],
  total: 0,
  pageSize: 50,
  resourceName: '',
  getData: () =>
    Promise.resolve({
      data: {
        items: [],
        count: 0,
      },
    }),
};
