import React, { useEffect, useState, useCallback } from 'react';
import { 
    Row, Col, Layout, Typography, Empty, Card, Button, Space, 
    message, Spin, Alert, Tag, Statistic, Descriptions
} from 'antd';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { 
    TrophyOutlined, ClockCircleOutlined, CheckCircleOutlined,
    EyeOutlined, FileTextOutlined, CrownOutlined
} from '@ant-design/icons';
import * as api from '../API methods/attemptMethods.jsx';
import * as quizApi from '../API methods/quizMethods.jsx';
import HeaderComponent from '../components/HeaderComponent';
import { useUsers } from '../hooks/useUsers.jsx';

const { Title, Text } = Typography;

export default function CompletedQuizzes() {
    const [bestAttempts, setBestAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const {GetUserIdFromJWT} = useUsers();

    // Функция для получения лучших попыток
    const getBestAttempts = useCallback((attemptsData) => {
        if (!attemptsData || !Array.isArray(attemptsData)) {
            console.log('Нет данных попыток или не массив:', attemptsData);
            return [];
        }

        // Группируем попытки по quizId
        const attemptsByQuiz = {};
        
        attemptsData.forEach(attempt => {
            const quizId = attempt.quizId;
            
            if (!quizId) {
                console.warn('Попытка без quizId:', attempt);
                return;
            }
            
            if (!attemptsByQuiz[quizId]) {
                attemptsByQuiz[quizId] = [];
            }
            
            attemptsByQuiz[quizId].push(attempt);
        });

        console.log('Сгруппированные попытки по квизам:', attemptsByQuiz);

        // Для каждого квиза находим лучшую попытку
        const bestAttemptsArray = [];
        
        Object.keys(attemptsByQuiz).forEach(quizId => {
            const quizAttempts = attemptsByQuiz[quizId];
            
            if (quizAttempts.length === 0) return;
            
            // Находим лучшую попытку по баллам, а при равных баллах - по дате
            const bestAttempt = quizAttempts.reduce((best, current) => {
                if (!best) return current;

                // Сравниваем баллы (score может быть undefined)
                const bestScore = best.score !== undefined ? best.score : 0;
                const currentScore = current.score !== undefined ? current.score : 0;

                console.log(`Сравнение попыток для quizId ${quizId}:`, {
                    best: {id: best.id, score: bestScore, date: best.completedAt},
                    current: {id: current.id, score: currentScore, date: current.completedAt}
                });

                if (currentScore > bestScore) return current;
                if (currentScore < bestScore) return best;

                // При равных баллах берем самую свежую
                const bestDate = best.completedAt ? new Date(best.completedAt) : new Date(0);
                const currentDate = current.completedAt ? new Date(current.completedAt) : new Date(0);

                return currentDate > bestDate ? current : best;
            }, null);

            if (bestAttempt) {
                bestAttemptsArray.push(bestAttempt);
            }
        });

        console.log('Лучшие попытки:', bestAttemptsArray);

        // Сортируем по дате завершения (самые свежие первыми)
        return bestAttemptsArray.sort((a, b) => {
            const dateA = a.completedAt ? new Date(a.completedAt) : new Date(0);
            const dateB = b.completedAt ? new Date(b.completedAt) : new Date(0);
            return dateB - dateA;
        });
    }, []);

    useEffect(() => {
        loadBestAttempts();
    }, []);

    const loadBestAttempts = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = Cookies.get('token');
            if (!token) {
                message.warning('Для просмотра пройденных квизов необходимо войти в аккаунт');
                navigate('/login');
                return;
            }
            
            const userId = GetUserIdFromJWT(token);
            if (!userId) {
                throw new Error('Не удалось получить ID пользователя');
            }
            
            console.log('Загрузка попыток для пользователя:', userId);
            
            // Используем правильный метод для получения попыток пользователя
            const attemptsData = await api.getUserAttempts(userId);
            console.log('Полученные попытки:', attemptsData);
            
            if (!attemptsData || !Array.isArray(attemptsData)) {
                console.warn('Нет попыток или неправильный формат данных:', attemptsData);
                setBestAttempts([]);
                return;
            }
            
            // Фильтруем только завершенные попытки
            const completedAttempts = attemptsData.filter(attempt => 
                attempt.completedAt && 
                attempt.completedAt !== null &&
                attempt.timeSpent !== '00:00:00'
            );
            
            console.log('Завершенные попытки:', completedAttempts);
            
            if (completedAttempts.length === 0) {
                setBestAttempts([]);
                return;
            }
            
            // Получаем только лучшие попытки для каждого квиза
            const bestAttemptsData = getBestAttempts(completedAttempts);
            
            console.log('Лучшие попытки после фильтрации:', bestAttemptsData);
            
            // Загружаем дополнительную информацию о квизах для каждой лучшей попытки
            const bestAttemptsWithQuizInfo = await Promise.all(
                bestAttemptsData.map(async (attempt) => {
                    try {
                        const quizInfo = await quizApi.getQuizById(attempt.quizId);
                        return { ...attempt, quizInfo };
                    } catch (err) {
                        console.error(`Ошибка загрузки квиза ${attempt.quizId}:`, err);
                        // Возвращаем попытку без информации о квизе
                        return attempt;
                    }
                })
            );
            
            console.log('Лучшие попытки с информацией о квизах:', bestAttemptsWithQuizInfo);
            setBestAttempts(bestAttemptsWithQuizInfo);
            
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
            return timeWithoutFraction;
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
                            Ваши лучшие результаты по квизам. Показывается только лучшая попытка для каждого квиза.
                        </Typography.Text>
                    </Space>
                </Card>

                <Title level={2}>
                    <Space>
                        <CrownOutlined />
                        Лучшие результаты
                    </Space>
                </Title>

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
                            <Button size="small" onClick={loadBestAttempts}>
                                Попробовать снова
                            </Button>
                        }
                    />
                ) : bestAttempts.length === 0 ? (
                    <Empty 
                        description="Вы еще не проходили квизы" 
                        style={{ marginTop: 40 }}
                    >
                        <Button type="primary" onClick={() => navigate('/')}>
                            Перейти к каталогу квизов
                        </Button>
                    </Empty>
                ) : (
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <Text type="secondary">
                            Показано {bestAttempts.length} квизов. Для каждого квиза показана лучшая попытка.
                        </Text>
                        
                        <Row gutter={[24, 24]}>
                            {bestAttempts.map((attempt, index) => {
                                const quizInfo = attempt.quizInfo;
                                const totalQuestions = quizInfo?.questionsCount || 0;
                                const score = attempt.score !== undefined ? attempt.score : 0;
                                const percentage = totalQuestions 
                                    ? (score / totalQuestions) * 100 
                                    : 0;
                                
                                return (
                                    <Col key={`${attempt.quizId}-${attempt.id}-${index}`} xs={24} sm={12} lg={8}>
                                        <Card
                                            hoverable
                                            style={{ height: '100%' }}
                                            actions={[
                                                <Button
                                                    type="link"
                                                    icon={<EyeOutlined />}
                                                    onClick={() => navigate(`/quiz-result/${attempt.id}`)}
                                                >
                                                    Посмотреть детали
                                                </Button>,
                                                <Button
                                                    type="link"
                                                    onClick={() => navigate(`/quiz/${attempt.quizId}`)}
                                                >
                                                    Пройти снова
                                                </Button>
                                            ]}
                                            extra={
                                                <Tag color="gold" icon={<CrownOutlined />}>
                                                    Лучшая попытка
                                                </Tag>
                                            }
                                        >
                                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                                {quizInfo ? (
                                                    <>
                                                        <Title level={4} style={{ margin: 0 }}>
                                                            {quizInfo.title}
                                                        </Title>
                                                        
                                                        {quizInfo.description && (
                                                            <Text type="secondary" ellipsis={{ rows: 2 }}>
                                                                {quizInfo.description}
                                                            </Text>
                                                        )}
                                                    </>
                                                ) : (
                                                    <Title level={4} style={{ margin: 0 }}>
                                                        Квиз #{attempt.quizId}
                                                    </Title>
                                                )}
                                                
                                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                    <Row gutter={16}>
                                                        <Col span={12}>
                                                            <Statistic
                                                                title="Результат"
                                                                value={score}
                                                                suffix={totalQuestions ? `из ${totalQuestions}` : ''}
                                                                prefix={<TrophyOutlined />}
                                                                valueStyle={{ 
                                                                    color: getScoreColor(score, totalQuestions),
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
                                                                    color: getScoreColor(score, totalQuestions),
                                                                    fontSize: '24px'
                                                                }}
                                                            />
                                                        </Col>
                                                    </Row>
                                                    
                                                    <Descriptions column={1} size="small" bordered>
                                                        <Descriptions.Item 
                                                            label={<><ClockCircleOutlined /> Время прохождения</>}
                                                        >
                                                            {formatTimeSpan(attempt.timeSpent)}
                                                        </Descriptions.Item>
                                                        <Descriptions.Item 
                                                            label={<><CheckCircleOutlined /> Дата завершения</>}
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
                    </Space>
                )}
            </div>
        </Layout>
    );
}