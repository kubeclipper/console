import React from 'react';
import { Link } from 'react-router-dom';
import { INTERNAL_ROLE_DES } from 'utils/constants';

export const projectMemberStatus = {
  Active: t('Active'),
  Disabled: t('Disabled'),
  AuthLimitExceeded: t('AuthLimitExceeded'),
};

export const projectMemberColumns = [
  {
    title: t('User Name'),
    dataIndex: 'name',
    extraNameIndex: 'displayName',
  },
  {
    title: t('Role'),
    dataIndex: 'projectRole',
    render: (value) => value && value,
  },
  {
    title: t('Status'),
    dataIndex: 'status',
    isHideable: true,
    render: (data) => projectMemberStatus[data] || data,
  },
  {
    title: t('Email'),
    dataIndex: 'email',
    isHideable: true,
  },
  {
    title: t('Phone'),
    dataIndex: 'phone',
    isHideable: true,
  },
  {
    title: t('Create Time'),
    dataIndex: 'createTime',
    valueRender: 'toLocalTime',
  },
];

export const projectRoleColumns = ({ isAdminPage }) => [
  {
    title: t('Role Name'),
    dataIndex: 'name',
    ...(!isAdminPage
      ? {
          render: (name, record) => {
            if (name) {
              return <Link to={`/project/role/${record.id}`}>{name}</Link>;
            }
            return '-';
          },
        }
      : {}),
  },
  {
    title: t('Description'),
    dataIndex: 'description',
    render: (value, record) => {
      const isInternal = Object.keys(INTERNAL_ROLE_DES).includes(record.name);

      if (isInternal) {
        return t(INTERNAL_ROLE_DES[record.name]);
      }

      return value;
    },
    isHideable: true,
  },
  {
    title: t('Create Time'),
    dataIndex: 'createTime',
    valueRender: 'toLocalTime',
  },
];
