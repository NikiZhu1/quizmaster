import React, { useState, useEffect } from 'react';
import { Layout, Breadcrumb, Flex, Button, Avatar, Dropdown, Space, Typography } from 'antd';
import { HomeOutlined, UserOutlined, LoginOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode'; // для декодирования JWT

//Методы
import { useUsers } from '../hooks/useUsers.jsx';

const { Header } = Layout;
const { Text } = Typography;

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
  const navigate = useNavigate();
  const {GetUserIdFromJWT, getUserInfo} = useUsers();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState(null);

  // Проверяем наличие токена и декодируем его при загрузке
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    const token = Cookies.get('token');
    
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setIsAuthenticated(true);
        // Предполагаем, что в токене есть имя пользователя
        // Может быть в разных полях в зависимости от вашего бэкенда 
        // комменткомметкомет

        const userid = GetUserIdFromJWT(token);
        const user = await getUserInfo(userid);
  
        setUserName(user.name);
        setUserId(user.id);
      } catch (error) {
        console.error('Ошибка декодирования токена:', error);
        handleLogout();
      }
    } else {
      setIsAuthenticated(false);
      setUserName('');
      setUserId(null);
    }
  };

  const handleLogin = () => {
    navigate('/login'); // Перенаправляем на страницу входа
  };

  const handleLogout = () => {
    Cookies.remove('token');
    setIsAuthenticated(false);
    setUserName('');
    setUserId(null);
    // Можно перенаправить на главную
    navigate('/');
  };

  // Меню для авторизованного пользователя
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Профиль',
      onClick: () => navigate('/profile')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Настройки',
      onClick: () => navigate('/settings')
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Выйти',
      danger: true,
      onClick: handleLogout
    },
  ];

  // Только "Главная" в хлебных крошках
  const breadcrumbsItems = [
    {
      href: '/',
      title: <><HomeOutlined /> Главная</>,
    }
  ];

  return (
    <Header style={HeaderStyle}>
      <Flex justify='space-between' align='center' style={{ width: '100%', height: '100%' }}>
        <Breadcrumb items={breadcrumbsItems} />
        
        {isAuthenticated ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
            <Space style={{ cursor: 'pointer', padding: '0 8px' }}>
              <Avatar 
                icon={<UserOutlined />}
                style={{ 
                  backgroundColor: '#1890ff',
                  color: '#fff'
                }}
                src={userId ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}` : null}
              />
              <Text strong>{userName}</Text>
            </Space>
          </Dropdown>
        ) : (
          <Button 
            type="primary" 
            icon={<LoginOutlined />}
            onClick={handleLogin}
          >
            Войти
          </Button>
        )}
      </Flex>
    </Header>
  );
};

export default HeaderComponent;