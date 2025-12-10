import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Card, Row, Col, Statistic, Progress, Button, 
    Typography, Space, List, Tag, Alert, Descriptions, 
    Divider, Tooltip
} from 'antd';
import { 
    CheckCircleOutlined, ClockCircleOutlined, 
    HomeOutlined, TrophyOutlined, CloseCircleOutlined,
    QuestionCircleOutlined, FieldTimeOutlined,
    CheckOutlined, CloseOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import * as api from '../API methods/attemptMethods.jsx';
import * as quizApi from '../API methods/quizMethods.jsx';

const { Title, Text, Paragraph } = Typography;

export default function QuizResult() {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    
    const [result, setResult] = useState(null);
    const [quizInfo, setQuizInfo] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadResult = async () => {
            try {
                // 1. Загружаем попытку и ответы
                const [attemptData, answersData] = await Promise.all([
                    api.getAttemptById(attemptId),
                    api.getAttemptAnswers(attemptId)
                ]);
                
                setResult(attemptData);
                setAnswers(answersData);
                
                // 2. Загружаем информацию о квизе
                if (attemptData.quizId) {
                    try {
                        const quizData = await quizApi.getQuizById(attemptData.quizId);
                        setQuizInfo(quizData);
                        
                        // 3. Загружаем вопросы квиза, чтобы знать общее количество
                        const questionsData = await quizApi.getQuizQuestions(attemptData.quizId);
                        setQuestions(questionsData);
                    } catch (quizError) {
                        console.error('Ошибка загрузки информации о квизе:', quizError);
                    }
                }
                
            } catch (err) {
                console.error('Ошибка загрузки результатов:', err);
                setError(err.message || 'Не удалось загрузить результаты');
            } finally {
                setLoading(false);
            }
        };

        loadResult();
    }, [attemptId]);

    // Функция для форматирования TimeSpan
    const formatTimeSpan = (timeSpan) => {
        if (!timeSpan) return "00:00:00";
        
        // Если timeSpan - это объект
        if (typeof timeSpan === 'object') {
            const totalSeconds = 
                (timeSpan.days || 0) * 86400 + 
                (timeSpan.hours || 0) * 3600 + 
                (timeSpan.minutes || 0) * 60 + 
                Math.floor(timeSpan.seconds || 0); // Округляем секунды до целого
            
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = Math.floor(totalSeconds % 60);
            
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        // Если timeSpan - это строка в формате "00:01:30" или "00:00:02.3707030"
        if (typeof timeSpan === 'string') {
            // Убираем дробную часть, если она есть
            const timeWithoutFraction = timeSpan.split('.')[0];
            
            // Проверяем, что строка имеет формат ЧЧ:ММ:СС
            const timePattern = /^(\d{2}):(\d{2}):(\d{2})$/;
            if (timePattern.test(timeWithoutFraction)) {
                return timeWithoutFraction;
            }
            
            // Если формат не соответствует, пытаемся распарсить
            const parts = timeWithoutFraction.split(':');
            if (parts.length === 3) {
                const hours = parseInt(parts[0]) || 0;
                const minutes = parseInt(parts[1]) || 0;
                const seconds = Math.floor(parseFloat(parts[2]) || 0);
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
            
            return timeWithoutFraction;
        }
        
        // Если timeSpan - это число (секунды)
        if (typeof timeSpan === 'number') {
            const totalSeconds = Math.floor(timeSpan); // Округляем до целого
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        return "00:00:00";
    };

    // Функция для форматирования даты
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

    // Рассчитываем общее количество вопросов
    const totalQuestions = questions.length > 0 ? questions.length : 
                          answers.length > 0 ? answers.length : 1;
    
    // Получаем количество правильных ответов
    const correctAnswers = result?.score || 0;
    
    // Рассчитываем процент правильных ответов
    const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    
    // Время, потраченное на квиз
    const timeSpent = result?.timeSpent ? formatTimeSpan(result.timeSpent) : "00:00:00";

    // Функция для получения цвета в зависимости от процента
    const getScoreColor = (percent) => {
        if (percent >= 80) return '#52c41a'; // Зеленый
        if (percent >= 60) return '#1890ff'; // Синий
        if (percent >= 40) return '#faad14'; // Желтый
        return '#ff4d4f'; // Красный
    };

    // Функция для получения текста оценки
    const getGradeText = (percent) => {
        if (percent >= 90) return 'Отлично! 🎉';
        if (percent >= 75) return 'Хорошо! 👍';
        if (percent >= 60) return 'Удовлетворительно ✅';
        if (percent >= 40) return 'Плохо 😕';
        return 'Очень плохо 😢';
    };

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

    return (
        <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
            {/* Заголовок */}
            <Row justify="center" style={{ marginBottom: 32 }}>
                <Col>
                    <Title level={2}>
                        <TrophyOutlined /> Результаты квиза
                    </Title>
                    {quizInfo && (
                        <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
                            {quizInfo.title}
                        </Text>
                    )}
                </Col>
            </Row>

            {/* Основная статистика */}
            <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                <Col xs={24} md={6}>
                    <Card>
                        <Statistic
                            title="Результат"
                            value={correctAnswers}
                            suffix={`из ${totalQuestions}`}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ 
                                color: getScoreColor(percentage),
                                fontSize: '28px'
                            }}
                        />
                    </Card>
                </Col>
                
                <Col xs={24} md={6}>
                    <Card>
                        <Statistic
                            title="Процент выполнения"
                            value={percentage.toFixed(1)}
                            suffix="%"
                            valueStyle={{ 
                                color: getScoreColor(percentage),
                                fontSize: '28px'
                            }}
                        />
                    </Card>
                </Col>
                
                <Col xs={24} md={6}>
                    <Card>
                        <Statistic
                            title="Потраченное время"
                            value={timeSpent}
                            prefix={<FieldTimeOutlined />}
                            valueStyle={{ fontSize: '22px' }}
                        />
                    </Card>
                </Col>
                
                <Col xs={24} md={6}>
                    <Card>
                        <Statistic
                            title="Завершено"
                            value={formatDate(result.completedAt)}
                            valueStyle={{ fontSize: '16px' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Информация о квизе */}
            {quizInfo && (
                <Card style={{ marginBottom: 32 }}>
                    <Title level={5}>Информация о квизе</Title>
                    <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                        <Descriptions.Item label="Название">
                            <Text strong>{quizInfo.title}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Описание">
                            <Text>{quizInfo.description || 'Нет описания'}</Text>
                        </Descriptions.Item>
                        {quizInfo.timeLimit && (
                            <Descriptions.Item label="Лимит времени">
                                <Text strong>{quizInfo.timeLimit}</Text>
                            </Descriptions.Item>
                        )}
                        <Descriptions.Item label="Всего вопросов">
                            <Text strong>{totalQuestions}</Text>
                        </Descriptions.Item>
                    </Descriptions>
                </Card>
            )}

            {/* Ответы пользователя */}
            <Card>
                <Title level={4}>
                    <QuestionCircleOutlined /> Детали ответов
                </Title>
                
                {answers.length === 0 ? (
                    <Alert
                        message="Нет данных об ответах"
                        description="Информация о ваших ответах не найдена."
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                ) : (
                    <Alert
                        message={`Показаны ${answers.length} из ${totalQuestions} вопросов`}
                        description={
                            totalQuestions > answers.length 
                                ? `На ${totalQuestions - answers.length} вопросов не было дано ответов` 
                                : 'Все вопросы получены'
                        }
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                )}
                
                <List
                    dataSource={answers}
                    renderItem={(answer, index) => (
                        <List.Item 
                            style={{ 
                                borderBottom: '1px solid #f0f0f0', 
                                padding: '16px 0',
                                backgroundColor: index % 2 === 0 ? '#fafafa' : 'white'
                            }}
                        >
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Row justify="space-between" align="middle">
                                    <Col>
                                        <Text strong style={{ fontSize: '16px' }}>
                                            <QuestionCircleOutlined /> Вопрос {index + 1}
                                        </Text>
                                    </Col>
                                    <Col>
                                        <Tooltip title="ID вопроса">
                                            <Tag color="blue">ID: {answer.questionId}</Tag>
                                        </Tooltip>
                                    </Col>
                                </Row>
                                
                                <Divider style={{ margin: '8px 0' }} />
                                
                                <Row gutter={[16, 16]}>
                                    <Col xs={24} md={12}>
                                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                            <Text strong>Статус ответа:</Text>
                                            {answer.chosenOptionId ? (
                                                <Space>
                                                    <CheckOutlined style={{ color: '#52c41a' }} />
                                                    <Text type="success">Ответ предоставлен</Text>
                                                </Space>
                                            ) : (
                                                <Space>
                                                    <CloseOutlined style={{ color: '#ff4d4f' }} />
                                                    <Text type="danger">Ответ не предоставлен</Text>
                                                </Space>
                                            )}
                                        </Space>
                                    </Col>
                                    
                                    <Col xs={24} md={12}>
                                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                            <Text strong>Выбранный вариант:</Text>
                                            <Text>
                                                {answer.chosenOptionId 
                                                    ? `ID варианта: ${answer.chosenOptionId}` 
                                                    : 'Не выбран'}
                                            </Text>
                                        </Space>
                                    </Col>
                                </Row>
                            </Space>
                        </List.Item>
                    )}
                />
                
                {totalQuestions > answers.length && (
                    <Alert
                        message={`На ${totalQuestions - answers.length} вопросов не было дано ответов`}
                        type="warning"
                        showIcon
                        style={{ marginTop: 16 }}
                        description="Эти вопросы были учтены как неправильные при подсчете результата."
                    />
                )}
            </Card>

            {/* Кнопки действий */}
            <Row justify="center" style={{ marginTop: 32 }}>
                <Space>
                    <Button
                        type="primary"
                        icon={<HomeOutlined />}
                        onClick={() => navigate('/')}
                        size="large"
                    >
                        На главную
                    </Button>
                    
                    {result.quizId && (
                        <Button
                            onClick={() => navigate(`/quiz/${result.quizId}`)}
                            size="large"
                            icon={<CheckCircleOutlined />}
                        >
                            Пройти еще раз
                        </Button>
                    )}
                </Space>
            </Row>
        </div>
    );
}