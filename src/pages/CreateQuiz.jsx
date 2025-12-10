import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Layout, Card, Form, Input, Radio, Button, Space, Typography, 
    TimePicker, Switch, message, Row, Col, Divider 
} from 'antd';
import { SaveOutlined, ClockCircleOutlined, LockOutlined, GlobalOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import Cookies from 'js-cookie';
import HeaderComponent from '../components/HeaderComponent';
import apiClient from '../API methods/.APIclient';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

export default function CreateQuiz() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [hasTimeLimit, setHasTimeLimit] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        
        try {
            const token = Cookies.get('token');
            
            if (!token) {
                message.error('Требуется авторизация');
                navigate('/login');
                return;
            }

            // Формируем данные для отправки
            const quizData = {
                title: values.title,
                description: values.description || '',
                isPublic: values.accessMode === 'public'
            };

            // Добавляем timeLimit только если установлен лимит времени
            if (hasTimeLimit && values.timeLimit) {
                quizData.timeLimit = dayjs(values.timeLimit).format('HH:mm:ss');
            }

            // Отправляем запрос на создание квиза
            const response = await apiClient.post('/Quiz', quizData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            message.success('Квиз успешно создан!');
            
            // Перенаправляем на страницу создания вопросов
            if (response.data?.id) {
                navigate(`/quiz/${response.data.id}/questions`);
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error('Ошибка при создании квиза:', error);
            
            if (error.response?.status === 401) {
                message.error('Ошибка авторизации. Пожалуйста, войдите снова.');
                navigate('/login');
            } else if (error.response?.status === 400) {
                message.error(error.response.data?.message || 'Неверные данные для создания квиза');
            } else {
                message.error('Ошибка при создании квиза. Попробуйте еще раз.');
            }
        } finally {
            setLoading(false);
        }
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Validation failed:', errorInfo);
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <HeaderComponent />
            
            <Content style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                <Card>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <div>
                            <Title level={2}>Создание нового квиза</Title>
                            <Text type="secondary">
                                Заполните форму ниже, чтобы создать новый квиз
                            </Text>
                        </div>

                        <Divider />

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            onFinishFailed={onFinishFailed}
                            autoComplete="off"
                        >
                            {/* Название квиза */}
                            <Form.Item
                                name="title"
                                label="Название квиза"
                                rules={[
                                    { required: true, message: 'Введите название квиза!' },
                                    { max: 200, message: 'Название не должно превышать 200 символов' }
                                ]}
                            >
                                <Input 
                                    placeholder="Введите название квиза"
                                    size="large"
                                />
                            </Form.Item>

                            {/* Описание */}
                            <Form.Item
                                name="description"
                                label="Описание"
                            >
                                <TextArea 
                                    placeholder="Введите описание квиза (необязательно)"
                                    rows={4}
                                    showCount
                                    maxLength={1000}
                                />
                            </Form.Item>

                            {/* Лимит времени */}
                            <Form.Item label="Лимит времени">
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <Switch
                                        checked={hasTimeLimit}
                                        onChange={setHasTimeLimit}
                                        checkedChildren={<ClockCircleOutlined />}
                                        unCheckedChildren="Без времени"
                                    />
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        {hasTimeLimit 
                                            ? 'Установите лимит времени для прохождения квиза'
                                            : 'Квиз можно проходить без ограничения по времени'
                                        }
                                    </Text>
                                    
                                    {hasTimeLimit && (
                                        <Form.Item
                                            name="timeLimit"
                                            rules={[
                                                { required: true, message: 'Выберите лимит времени!' }
                                            ]}
                                        >
                                            <TimePicker
                                                format="HH:mm:ss"
                                                placeholder="Выберите время"
                                                style={{ width: '100%' }}
                                                size="large"
                                                showNow={false}
                                            />
                                        </Form.Item>
                                    )}
                                </Space>
                            </Form.Item>

                            {/* Режим доступа */}
                            <Form.Item
                                name="accessMode"
                                label="Режим доступа"
                                rules={[
                                    { required: true, message: 'Выберите режим доступа!' }
                                ]}
                                initialValue="public"
                            >
                                <Radio.Group>
                                    <Space direction="vertical">
                                        <Radio value="public">
                                            <Space>
                                                <GlobalOutlined />
                                                <Text>Публичный</Text>
                                            </Space>
                                            <br />
                                            <Text type="secondary" style={{ fontSize: '12px', marginLeft: 24 }}>
                                                Квиз будет доступен всем пользователям
                                            </Text>
                                        </Radio>
                                        <Radio value="private">
                                            <Space>
                                                <LockOutlined />
                                                <Text>Приватный</Text>
                                            </Space>
                                            <br />
                                            <Text type="secondary" style={{ fontSize: '12px', marginLeft: 24 }}>
                                                Квиз будет доступен только по коду доступа
                                            </Text>
                                        </Radio>
                                    </Space>
                                </Radio.Group>
                            </Form.Item>

                            <Divider />

                            {/* Кнопки действий */}
                            <Form.Item>
                                <Row justify="space-between">
                                    <Col>
                                        <Button 
                                            onClick={() => navigate('/')}
                                            size="large"
                                        >
                                            Отмена
                                        </Button>
                                    </Col>
                                    <Col>
                                        <Button 
                                            type="primary" 
                                            htmlType="submit"
                                            loading={loading}
                                            icon={<SaveOutlined />}
                                            size="large"
                                        >
                                            Создать квиз
                                        </Button>
                                    </Col>
                                </Row>
                            </Form.Item>
                        </Form>
                    </Space>
                </Card>
            </Content>
        </Layout>
    );
}
