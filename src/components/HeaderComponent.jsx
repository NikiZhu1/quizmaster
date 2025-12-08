import React from 'react';
import { Layout, Breadcrumb, Flex } from 'antd';
import { HomeOutlined, UserOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import UserInfo from './UserInfo';

const { Header } = Layout;

const HeaderStyle = {
  backgroundColor: '#fff',
  padding: '0 24px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  height: '64px',
  lineHeight: '64px',
  position: 'sticky',
  top: 0,
  zIndex: 1000,
};

const HeaderComponent = () => {
  // Для примера - берем пользователя из localStorage или используем mock
  const user = {
    id: 1,
    name: 'Иван Иванов'
  };

  // Простые хлебные крошки (можно сделать динамическими позже)
  const breadcrumbsItems = [
    {
      href: '/',
      title: <><HomeOutlined /> Главная</>,
    },
    {
      title: <><UserOutlined /> Профиль</>,
    }
  ];

  return (
    <Header style={HeaderStyle}>
      <Flex justify='space-between' align='center' style={{ width: '100%', height: '100%' }}>
        <Breadcrumb items={breadcrumbsItems} />
        <UserInfo userId={user.id} userName={user.name} />
      </Flex>
    </Header>
  );
};

export default HeaderComponent;