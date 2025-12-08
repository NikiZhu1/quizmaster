import React from 'react';
import { Avatar, Dropdown, Space, Typography } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';

const { Text } = Typography;

const UserInfo = ({ userId, userName }) => {
  const items = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Профиль',
      onClick: () => console.log('Переход в профиль')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Настройки',
      onClick: () => console.log('Переход в настройки')
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Выйти',
      danger: true,
      onClick: () => {
        console.log('Выход из системы');
        // localStorage.removeItem('token');
        // window.location.href = '/login';
      }
    },
  ];

  return (
    <Dropdown menu={{ items }} placement="bottomRight" arrow>
      <Space style={{ cursor: 'pointer', padding: '0 8px' }}>
        <Avatar 
          icon={<UserOutlined />}
          style={{ backgroundColor: '#87d068' }}
        />
        <Text strong>{userName || 'Пользователь'}</Text>
      </Space>
    </Dropdown>
  );
};

export default UserInfo;