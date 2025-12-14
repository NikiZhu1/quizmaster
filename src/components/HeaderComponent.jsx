import React, { useState, useEffect } from 'react';
import { Layout, Flex, Button, Avatar, Dropdown, Space, Typography } from 'antd';
import { 
    HomeOutlined, UserOutlined, LoginOutlined, LogoutOutlined, SettingOutlined,
    FileTextOutlined, TrophyOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const {GetUserIdFromJWT, getUserInfo} = useUsers();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('home');

  // Проверяем наличие токена и декодируем его при загрузке
  useEffect(() => {
    checkAuthentication();
  }, []);

  // Определяем активную вкладку на основе текущего пути
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      setActiveTab('home');
    } else if (path === '/myquizzes') {
      setActiveTab('myquizzes');
    } else if (path === '/completedquizzes') {
      setActiveTab('completedquizzes');
    } else {
      setActiveTab('');
    }
  }, [location.pathname]);

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

  // Стили для активной вкладки
  const getTabStyle = (key) => ({
    height: '64px',
    lineHeight: '64px',
    padding: '0 16px',
    border: 'none',
    borderBottom: activeTab === key ? '2px solid #1890ff' : '2px solid transparent',
    borderRadius: 0,
    backgroundColor: 'transparent',
    color: activeTab === key ? '#1890ff' : 'rgba(0, 0, 0, 0.85)',
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontWeight: activeTab === key ? 500 : 400,
  });

  const handleTabClick = (key) => {
    switch (key) {
      case 'home':
        navigate('/');
        break;
      case 'myquizzes':
        navigate('/myquizzes');
        break;
      case 'completedquizzes':
        navigate('/completedquizzes');
        break;
      default:
        break;
    }
  };

  return (
    <Header style={HeaderStyle}>
      <Flex justify='space-between' align='center' style={{ width: '100%', height: '100%' }}>
        <Space size="small" style={{ flex: 1 }}>
          <Space size="small">
              <Button
                type="text"
                icon={<HomeOutlined />}
                style={getTabStyle('home')}
                onClick={() => handleTabClick('home')}
              >
                Главная
              </Button>
              {isAuthenticated && (<Button
                type="text"
                icon={<FileTextOutlined />}
                style={getTabStyle('myquizzes')}
                onClick={() => handleTabClick('myquizzes')}
              >
                Мои квизы
              </Button>)}
              {isAuthenticated && (<Button
                type="text"
                icon={<TrophyOutlined />}
                style={getTabStyle('completedquizzes')}
                onClick={() => handleTabClick('completedquizzes')}
              >
                Пройденные квизы
              </Button>)}
            </Space>
        </Space>
        
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