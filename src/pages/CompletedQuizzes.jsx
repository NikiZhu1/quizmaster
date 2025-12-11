import React, { useEffect, useState } from 'react';
import { 
    Row, Col, Layout, Typography, Empty, Card, Button, Space, 
    message, Spin, Alert, Tag, Statistic, Descriptions
} from 'antd';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { 
    TrophyOutlined, ClockCircleOutlined, CheckCircleOutlined,
    EyeOutlined, FileTextOutlined
} from '@ant-design/icons';
import * as api from '../API methods/attemptMethods.jsx';
import * as quizApi from '../API methods/quizMethods.jsx';
import HeaderComponent from '../components/HeaderComponent';

const { Title, Text } = Typography;

export default function CompletedQuizzes() {
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadAttempts();
    }, []);

    const loadAttempts = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = Cookies.get('token');
            if (!token) {
                message.warning('Для просмотра пройденных квизов необходимо войти в аккаунт');
                navigate('/login');
                return;
            }
            const attemptsData = await api.getUserAttempts();
            
            // Загружаем дополнительную информацию о квизах для каждой попытки
            const attemptsWithQuizInfo = await Promise.all(
                (attemptsData || []).map(async (attempt) => {
                    try {
                        const quizInfo = await quizApi.getQuizById(attempt.quizId);
                        return { ...attempt, quizInfo };
                    } catch (err) {
                        console.error(`Ошибка загрузки квиза ${attempt.quizId}:`, err);
                        return attempt;
                    }
                })
            );
            
            setAttempts(attemptsWithQuizInfo);
        } catch (err) {
            console.error("Ошибка при загрузке попыток:", err);
            setError(err.message || 'Не удалось загрузить пройденные квизы');
            message.error('Не удалось загрузить пройденные квизы');
        } finally {
            setLoading(false);
        }
    };

    const formatTimeSpan = (timeSpan) => {
        if (!timeSpan) return "00:00:00";
        
        if (typeof timeSpan === 'string') {
            const timeWithoutFraction = timeSpan.split('.')[0];
            const timePattern = /^(\d{2}):(\d{2}):(\d{2})$/;
            if (timePattern.test(timeWithoutFraction)) {
                return timeWithoutFraction;
            }
        }
        
        return "00:00:00";
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Неизвестно";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const getScoreColor = (score, totalQuestions) => {
        if (!totalQuestions || totalQuestions === 0) return '#595959';
        const percentage = (score / totalQuestions) * 100;
        if (percentage >= 80) return '#52c41a';
        if (percentage >= 60) return '#1890ff';
        if (percentage >= 40) return '#faad14';
        return '#ff4d4f';
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
                    bodyStyle={{ padding: '16px 24px' }}
                >
                    <Space>
                        <FileTextOutlined style={{ fontSize: '20px' }} />
                        <Typography.Text style={{ fontSize: '16px' }}>
                            История ваших прохождений квизов: просматривайте результаты и анализируйте прогресс
                        </Typography.Text>
                    </Space>
                </Card>

                <Title level={2}>Пройденные квизы</Title>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <Spin size="large" />
                    </div>
                ) : error ? (
                    <Alert
                        message="Ошибка"
                        description={error}
                        type="error"
                        showIcon
                        action={
                            <Button size="small" onClick={loadAttempts}>
                                Попробовать снова
                            </Button>
                        }
                    />
                ) : attempts.length === 0 ? (
                    <Empty 
                        description="Вы еще не проходили квизы" 
                        style={{ marginTop: 40 }}
                    >
                        <Button type="primary" onClick={() => navigate('/')}>
                            Перейти к каталогу квизов
                        </Button>
                    </Empty>
                ) : (
                    <Row gutter={[24, 24]}>
                        {attempts.map(attempt => {
                            const quizInfo = attempt.quizInfo;
                            const percentage = quizInfo?.questionsCount 
                                ? (attempt.score / quizInfo.questionsCount) * 100 
                                : 0;
                            
                            return (
                                <Col key={attempt.id} xs={24} sm={12} lg={8}>
                                    <Card
                                        hoverable
                                        style={{ height: '100%' }}
                                        actions={[
                                            <Button
                                                type="link"
                                                icon={<EyeOutlined />}
                                                onClick={() => navigate(`/quiz-result/${attempt.id}`)}
                                            >
                                                Посмотреть результаты
                                            </Button>
                                        ]}
                                    >
                                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                            {quizInfo && (
                                                <Title level={4} style={{ margin: 0 }}>
                                                    {quizInfo.title}
                                                </Title>
                                            )}
                                            
                                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                <Row gutter={16}>
                                                    <Col span={12}>
                                                        <Statistic
                                                            title="Результат"
                                                            value={attempt.score || 0}
                                                            suffix={quizInfo?.questionsCount ? `из ${quizInfo.questionsCount}` : ''}
                                                            prefix={<TrophyOutlined />}
                                                            valueStyle={{ 
                                                                color: getScoreColor(attempt.score || 0, quizInfo?.questionsCount || 0),
                                                                fontSize: '24px'
                                                            }}
                                                        />
                                                    </Col>
                                                    <Col span={12}>
                                                        <Statistic
                                                            title="Процент"
                                                            value={percentage.toFixed(1)}
                                                            suffix="%"
                                                            valueStyle={{ 
                                                                color: getScoreColor(attempt.score || 0, quizInfo?.questionsCount || 0),
                                                                fontSize: '24px'
                                                            }}
                                                        />
                                                    </Col>
                                                </Row>
                                                
                                                <Descriptions column={1} size="small" bordered>
                                                    <Descriptions.Item 
                                                        label={<><ClockCircleOutlined /> Время</>}
                                                    >
                                                        {formatTimeSpan(attempt.timeSpent)}
                                                    </Descriptions.Item>
                                                    <Descriptions.Item 
                                                        label={<><CheckCircleOutlined /> Завершено</>}
                                                    >
                                                        {formatDate(attempt.completedAt)}
                                                    </Descriptions.Item>
                                                </Descriptions>
                                            </Space>
                                        </Space>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                )}
            </div>
        </Layout>
    );
}

