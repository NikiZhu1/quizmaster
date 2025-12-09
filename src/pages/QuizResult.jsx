import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Card, Row, Col, Statistic, Progress, Button, 
    Typography, Space, List, Tag, Alert 
} from 'antd';
import { 
    CheckCircleOutlined, ClockCircleOutlined, 
    HomeOutlined, TrophyOutlined, CloseCircleOutlined 
} from '@ant-design/icons';
import * as api from '../API methods/attemptMethods.jsx';

const { Title, Text, Paragraph } = Typography;

export default function QuizResult() {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    
    const [result, setResult] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadResult = async () => {
            try {
                const [attemptData, answersData] = await Promise.all([
                    api.getAttemptById(attemptId),
                    api.getAttemptAnswers(attemptId)
                ]);
                
                setResult(attemptData);
                setAnswers(answersData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadResult();
    }, [attemptId]);

    if (loading) {
        return (
            <div style={{ padding: 24, textAlign: 'center' }}>
                <Title level={3}>Загрузка результатов...</Title>
                <Progress percent={100} status="active" />
            </div>
        );
    }

    if (error || !result) {
        return (
            <div style={{ padding: 24 }}>
                <Alert
                    message="Ошибка"
                    description={error || "Не удалось загрузить результаты"}
                    type="error"
                    showIcon
                    action={
                        <Button size="small" onClick={() => navigate('/')}>
                            На главную
                        </Button>
                    }
                />
            </div>
        );
    }

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
            <Row justify="center" style={{ marginBottom: 32 }}>
                <Col>
                    <Title level={2}>
                        <TrophyOutlined /> Результаты квиза
                    </Title>
                </Col>
            </Row>

            {/* Основная статистика */}
            <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                <Col xs={24} md={8}>
                    <Card>
                        <Statistic
                            title="Результат"
                            value={result.score || 0}
                            suffix="баллов"
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                
                <Col xs={24} md={8}>
                    <Card>
                        <Statistic
                            title="Время прохождения"
                            value={formatTime(result.timeSpent)}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
                
                <Col xs={24} md={8}>
                    <Card>
                        <Statistic
                            title="Дата завершения"
                            value={new Date(result.completedAt).toLocaleDateString()}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Прогресс */}
            <Card style={{ marginBottom: 32 }}>
                <Title level={4}>Общий результат</Title>
                <Progress
                    percent={result.score || 0}
                    status="active"
                    format={percent => `${percent}%`}
                />
            </Card>

            {/* Ответы */}
            <Card>
                <Title level={4}>Ваши ответы</Title>
                <List
                    dataSource={answers}
                    renderItem={(answer, index) => (
                        <List.Item>
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Text strong>Вопрос {index + 1}</Text>
                                <Tag color={answer.isCorrect ? 'success' : 'error'}>
                                    {answer.isCorrect ? 'Правильно' : 'Неправильно'}
                                </Tag>
                                <Text type="secondary">
                                    Ваш ответ: {answer.chosenOptionText || 'Не указан'}
                                </Text>
                            </Space>
                        </List.Item>
                    )}
                />
            </Card>

            {/* Кнопки действий */}
            <Row justify="center" style={{ marginTop: 32 }}>
                <Space>
                    <Button
                        type="primary"
                        icon={<HomeOutlined />}
                        onClick={() => navigate('/')}
                    >
                        На главную
                    </Button>
                    
                    <Button
                        onClick={() => navigate(`/quiz/${result.quizId}`)}
                    >
                        Пройти еще раз
                    </Button>
                </Space>
            </Row>
        </div>
    );
}