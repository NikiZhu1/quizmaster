import React, { useEffect, useState } from 'react';
import { Row, Col, Layout, Typography, Empty, Card, Button, Space, message, Spin, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { PlusOutlined } from '@ant-design/icons';

//Компоненты
import MyQuizCard from '../components/MyQuizCard';
import HeaderComponent from '../components/HeaderComponent';

//Методы
import * as quizApi from '../API methods/quizMethods.jsx';

const { Title } = Typography;

export default function MyQuizzes() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadQuizzes();
    }, []);

    const loadQuizzes = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = Cookies.get('token');
            if (!token) {
                message.warning('Для просмотра своих квизов необходимо войти в аккаунт');
                navigate('/login');
                return;
            }
            const quizzesData = await quizApi.getUserQuizzes(token);
            setQuizzes(quizzesData || []);
        } catch (err) {
            console.error("Ошибка при загрузке квизов:", err);
            setError(err.message || 'Не удалось загрузить ваши квизы');
            message.error('Не удалось загрузить ваши квизы');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateQuiz = () => {
        navigate('/newquiz');
    };

    const handleQuizDelete = (quizId) => {
        setQuizzes(prevQuizzes => prevQuizzes.filter(q => q.id !== quizId));
    };

    return (
        <Layout>
            <HeaderComponent />

            <div style={{ padding: "24px 40px" }}>
                <Card 
                    style={{ 
                        marginBottom: 24,
                        borderRadius: '8px',
                        backgroundColor: '#f0f2f5'
                    }}
                    styles={{ body: { padding: '16px 24px' } }}
                >
                    <Space style={{ width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        <Typography.Text style={{ fontSize: '16px' }}>
                            Управление своими квизами: создавайте, редактируйте и отслеживайте статистику
                        </Typography.Text>
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />}
                            onClick={handleCreateQuiz}
                            size="large"
                        >
                            Создать новый квиз
                        </Button>
                    </Space>
                </Card>

                <Title level={2}>Мои квизы</Title>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <Spin size="large" />
                    </div>
                ) : error ? (
                    <Alert
                        title="Ошибка"
                        description={error}
                        type="error"
                        showIcon
                        action={
                            <Button size="small" onClick={loadQuizzes}>
                                Попробовать снова
                            </Button>
                        }
                    />
                ) : quizzes.length === 0 ? (
                    <Empty 
                        description="У вас пока нет созданных квизов" 
                        style={{ marginTop: 40 }}
                    >
                        <Button type="primary" onClick={handleCreateQuiz}>
                            Создать первый квиз
                        </Button>
                    </Empty>
                ) : (
                    <Row gutter={[24, 24]}>
                        {quizzes.map(quiz => (
                            <Col key={quiz.id} xs={24} sm={12} md={8} lg={6}>
                                <MyQuizCard quiz={quiz} onDelete={handleQuizDelete} />
                            </Col>
                        ))}
                    </Row>
                )}
            </div>
        </Layout>
    );
}

