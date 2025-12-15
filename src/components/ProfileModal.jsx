import React, { useState, useEffect } from 'react';
import { 
    Modal, Form, Input, Button, message, Avatar, Space, 
    Typography, Divider, Alert, Tabs, Card
} from 'antd';
import { 
    UserOutlined, LockOutlined, SaveOutlined, 
    CheckCircleOutlined, KeyOutlined, SafetyOutlined
} from '@ant-design/icons';
import Cookies from 'js-cookie';
import apiClient from '../API methods/.APIclient';
import { updateUserProfile } from '../API methods/usersMethods'; // Импортируем метод из API

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ProfileModal = ({ 
    visible, 
    onClose, 
    userId, 
    userName, 
    onUpdateUser 
}) => {
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [userData, setUserData] = useState(null);

    // Загружаем данные пользователя при открытии модального окна
    useEffect(() => {
        if (visible && userId) {
            loadUserData();
        }
    }, [visible, userId]);

    const loadUserData = async () => {
        try {
            const token = Cookies.get('token');
            if (!token) return;

            const response = await apiClient.get(`/User/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            setUserData(response.data);
            form.setFieldsValue({
                userName: response.data.userName || userName || ''
            });
        } catch (error) {
            console.error('Ошибка загрузки данных пользователя:', error);
            message.error('Не удалось загрузить данные профиля');
        }
    };

    // Обработчик изменения профиля
    const handleProfileUpdate = async (values) => {
        setLoading(true);
        try {
            const token = Cookies.get('token');
            if (!token) {
                message.error('Требуется авторизация');
                return;
            }

            const updateData = {};
            if (values.userName && values.userName !== userName) {
                updateData.userName = values.userName;
            }

            // Проверяем, есть ли что обновлять
            if (Object.keys(updateData).length === 0) {
                message.info('Нет изменений для сохранения');
                return;
            }

            // Используем метод из usersMethods
            const response = await updateUserProfile(userId, updateData);

            message.success('Профиль успешно обновлен!');
            onUpdateUser({ 
                userName: values.userName || userName 
            });
            
            // Закрываем модальное окно через секунду
            setTimeout(() => {
                onClose();
            }, 1000);

        } catch (error) {
            console.error('Ошибка обновления профиля:', error);
            
            if (error.response?.status === 400) {
                message.error('Некорректные данные. Проверьте введенные значения.');
            } else if (error.response?.status === 409) {
                message.error('Этот никнейм уже занят. Выберите другой.');
            } else if (error.response?.status === 401) {
                message.error('Ошибка авторизации. Пожалуйста, войдите снова.');
                // Можно предложить перелогиниться
                Cookies.remove('token');
                window.location.href = '/login';
            } else {
                message.error('Не удалось обновить профиль');
            }
        } finally {
            setLoading(false);
        }
    };

    // Обработчик изменения пароля
    const handlePasswordChange = async (values) => {
        setPasswordLoading(true);
        try {
            const token = Cookies.get('token');
            if (!token) {
                message.error('Требуется авторизация');
                return;
            }

            const updateData = {};
            
            // Проверяем новый пароль
            if (values.newPassword && values.newPassword.length >= 6) {
                updateData.password = values.newPassword;
            } else {
                message.error('Новый пароль должен содержать минимум 6 символов');
                return;
            }

            // Используем тот же метод для обновления пароля
            const response = await updateUserProfile(userId, updateData);

            message.success('Пароль успешно изменен!');
            passwordForm.resetFields();
            
            // Опционально: принудительный выход пользователя после смены пароля
            // Cookies.remove('token');
            // window.location.href = '/login';

        } catch (error) {
            console.error('Ошибка смены пароля:', error);
            
            if (error.response?.status === 400) {
                message.error('Некорректные данные пароля');
            } else if (error.response?.status === 401) {
                message.error('Неверные учетные данные');
                Cookies.remove('token');
                window.location.href = '/login';
            } else {
                message.error('Не удалось изменить пароль');
            }
        } finally {
            setPasswordLoading(false);
        }
    };

    // Валидация пароля
    const validatePassword = (_, value) => {
        if (!value || value.length >= 6) {
            return Promise.resolve();
        }
        return Promise.reject(new Error('Пароль должен содержать минимум 6 символов'));
    };

    const validateConfirmPassword = ({ getFieldValue }) => ({
        validator(_, value) {
            if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve();
            }
            return Promise.reject(new Error('Пароли не совпадают'));
        },
    });

    return (
        <Modal
            title={
                <Space>
                    <UserOutlined />
                    <span>Профиль пользователя</span>
                </Space>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            width={600}
            centered
            destroyOnClose
        >
            <div style={{ padding: '10px 0' }}>
                {/* Аватар и основная информация */}
                <Card 
                    style={{ 
                        marginBottom: 20,
                        backgroundColor: '#fafafa',
                        border: '1px solid #e8e8e8'
                    }}
                    bodyStyle={{ padding: '16px' }}
                >
                    <Space align="center" style={{ width: '100%' }}>
                        <Avatar 
                            size={64}
                            icon={<UserOutlined />}
                            src={userId ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}` : null}
                            style={{ 
                                backgroundColor: '#1890ff',
                                color: '#fff',
                                fontSize: '28px'
                            }}
                        />
                        <Space direction="vertical" size={0}>
                            <Text strong style={{ fontSize: '18px' }}>
                                {userName || 'Пользователь'}
                            </Text>
                            <Text type="secondary">
                                ID: {userId}
                            </Text>
                        </Space>
                    </Space>
                </Card>

                {/* Табы для навигации */}
                <Tabs 
                    activeKey={activeTab} 
                    onChange={setActiveTab}
                    centered
                    style={{ marginBottom: 20 }}
                >
                    <TabPane 
                        tab={
                            <span>
                                <UserOutlined />
                                Профиль
                            </span>
                        } 
                        key="profile"
                    />
                    <TabPane 
                        tab={
                            <span>
                                <KeyOutlined />
                                Безопасность
                            </span>
                        } 
                        key="security"
                    />
                </Tabs>

                {/* Вкладка профиля */}
                {activeTab === 'profile' && (
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleProfileUpdate}
                        initialValues={{
                            userName: userName || ''
                        }}
                    >
                        <Form.Item
                            label="Имя пользователя (никнейм)"
                            name="userName"
                            rules={[
                                { required: true, message: 'Введите имя пользователя' },
                                { min: 3, message: 'Минимум 3 символа' },
                                { max: 50, message: 'Максимум 50 символов' }
                            ]}
                        >
                            <Input 
                                prefix={<UserOutlined />}
                                placeholder="Введите новый никнейм"
                                size="large"
                            />
                        </Form.Item>

                        <Alert
                            message="Информация"
                            description="После изменения никнейма вы будете отображаться с новым именем во всех квизах и результатах."
                            type="info"
                            showIcon
                            style={{ marginBottom: 20 }}
                        />

                        <div style={{ textAlign: 'right', marginTop: 20 }}>
                            <Space>
                                <Button onClick={onClose}>
                                    Отмена
                                </Button>
                                <Button 
                                    type="primary" 
                                    htmlType="submit"
                                    loading={loading}
                                    icon={<SaveOutlined />}
                                >
                                    Сохранить изменения
                                </Button>
                            </Space>
                        </div>
                    </Form>
                )}

                {/* Вкладка безопасности */}
                {activeTab === 'security' && (
                    <Form
                        form={passwordForm}
                        layout="vertical"
                        onFinish={handlePasswordChange}
                    >

                        <Form.Item
                            label="Новый пароль"
                            name="newPassword"
                            rules={[
                                { required: true, message: 'Введите новый пароль' },
                                { validator: validatePassword }
                            ]}
                        >
                            <Input.Password 
                                prefix={<LockOutlined />}
                                placeholder="Введите новый пароль"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Подтвердите новый пароль"
                            name="confirmPassword"
                            dependencies={['newPassword']}
                            rules={[
                                { required: true, message: 'Подтвердите новый пароль' },
                                validateConfirmPassword
                            ]}
                        >
                            <Input.Password 
                                prefix={<CheckCircleOutlined />}
                                placeholder="Повторите новый пароль"
                                size="large"
                            />
                        </Form.Item>

                        <Alert
                            message="Требования к паролю"
                            description="Пароль должен содержать минимум 6 символов. Рекомендуем использовать комбинацию букв, цифр и специальных символов."
                            type="info"
                            showIcon
                            style={{ marginBottom: 20 }}
                        />

                        <div style={{ textAlign: 'right', marginTop: 20 }}>
                            <Space>
                                <Button onClick={() => {
                                    passwordForm.resetFields();
                                    setActiveTab('profile');
                                }}>
                                    Отмена
                                </Button>
                                <Button 
                                    type="primary" 
                                    htmlType="submit"
                                    loading={passwordLoading}
                                    icon={<SafetyOutlined />}
                                    danger
                                >
                                    Изменить пароль
                                </Button>
                            </Space>
                        </div>
                    </Form>
                )}
            </div>
        </Modal>
    );
};

export default ProfileModal;