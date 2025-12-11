import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Card, Row, Col, Statistic, Progress, Button, 
    Typography, Space, List, Tag, Alert, Descriptions, Layout, 
    Divider, Tooltip, Radio, Checkbox
} from 'antd';
import { 
    CheckCircleOutlined, ClockCircleOutlined, 
    HomeOutlined, TrophyOutlined, CloseCircleOutlined,
    QuestionCircleOutlined, FieldTimeOutlined,
    CheckOutlined, CloseOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import * as api from '../API methods/attemptMethods.jsx';
import * as quizApi from '../API methods/quizMethods.jsx';
import HeaderComponent from '../components/HeaderComponent.jsx';

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
                // 1. Загружаем попытку
                const attemptData = await api.getAttemptById(attemptId);
                console.log('Данные попытки:', attemptData);
                setResult(attemptData);
                
                // 2. Пытаемся загрузить ответы (может быть недоступно)
                // Передаем данные попытки, чтобы использовать правильный userId/guestSessionId
                let answersData = [];
                try {
                    answersData = await api.getAttemptAnswers(attemptId, attemptData);
                    console.log('Успешно загружены ответы:', answersData);
                    setAnswers(answersData);
                } catch (answersError) {
                    console.warn('Не удалось загрузить ответы попытки:', answersError);
                    console.warn('Детали ошибки:', {
                        message: answersError.message,
                        response: answersError.response?.data,
                        status: answersError.response?.status,
                        attemptData: {
                            userId: attemptData?.userId,
                            guestSessionId: attemptData?.guestSessionId
                        }
                    });
                    // Продолжаем работу без ответов - покажем вопросы без ответов пользователя
                    setAnswers([]);
                    // Не устанавливаем error, так как мы можем показать вопросы без ответов
                }
                
                // 3. Загружаем информацию о квизе
                if (attemptData.quizId) {
                    try {
                        const quizData = await quizApi.getQuizById(attemptData.quizId);
                        setQuizInfo(quizData);
                        
                        // 4. Загружаем вопросы квиза
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

    // Создаем мапу ответов по questionId для быстрого поиска
    const answersMap = useMemo(() => {
        const map = new Map();
        answers.forEach(answer => {
            // Обрабатываем как chosenOptionId (одиночный выбор), так и selectedOptionIds (множественный)
            const selectedIds = answer.selectedOptionIds || 
                               (answer.chosenOptionId ? [answer.chosenOptionId] : []);
            map.set(answer.questionId, selectedIds);
        });
        return map;
    }, [answers]);

    // Объединяем вопросы с ответами
    const questionsWithAnswers = useMemo(() => {
        return questions.map((question, index) => {
            const userSelectedIds = answersMap.get(question.id) || [];
            const correctOptionIds = question.options
                ?.filter(opt => opt.isCorrect !== undefined && opt.isCorrect)
                .map(opt => opt.id) || [];
            
            // Проверяем, правильно ли ответил пользователь
            // Если информация о правильных ответах недоступна, считаем, что мы не знаем результат
            const hasCorrectInfo = correctOptionIds.length > 0 || 
                                  (question.options && question.options.some(opt => opt.isCorrect === false));
            
            const isCorrect = hasCorrectInfo && question.options && correctOptionIds.length > 0
                ? correctOptionIds.length === userSelectedIds.length &&
                  correctOptionIds.every(id => userSelectedIds.includes(id)) &&
                  userSelectedIds.every(id => correctOptionIds.includes(id))
                : null; // null означает, что мы не знаем, правильный ли ответ

            return {
                ...question,
                questionNumber: index + 1,
                userSelectedIds,
                correctOptionIds,
                isCorrect,
                hasAnswer: userSelectedIds.length > 0,
                hasCorrectInfo
            };
        });
    }, [questions, answersMap]);

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
        <Layout>
            <HeaderComponent />
            <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
            
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
                
                {questionsWithAnswers.length === 0 ? (
                    <Alert
                        message="Нет данных о вопросах"
                        description="Информация о вопросах квиза не найдена."
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                ) : answers.length === 0 && questions.length > 0 ? (
                    <Alert
                        message="Ответы недоступны"
                        description="Не удалось загрузить ваши ответы. Возможные причины: вы не авторизованы, это не ваша попытка, или сессия гостя истекла. Вопросы показаны без ваших ответов."
                        type="warning"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                ) : (
                    <Alert
                        message={`Показаны все ${questionsWithAnswers.length} вопросов`}
                        description="Просмотрите каждый вопрос с вашими ответами и правильными вариантами."
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                )}
                
                <List
                    dataSource={questionsWithAnswers}
                    renderItem={(questionData) => {
                        const { questionNumber, text, options, type, userSelectedIds, correctOptionIds, isCorrect, hasAnswer, hasCorrectInfo } = questionData;
                        
                        return (
                            <List.Item 
                                style={{ 
                                    borderBottom: '2px solid #e8e8e8', 
                                    padding: '24px 0',
                                    marginBottom: '16px',
                                    backgroundColor: 'white'
                                }}
                            >
                                <Space direction="vertical" style={{ width: '100%' }} size="large">
                                    {/* Заголовок вопроса */}
                                    <Row justify="space-between" align="middle">
                                        <Col flex="auto">
                                            <Space>
                                                <Text strong style={{ fontSize: '18px' }}>
                                                    <QuestionCircleOutlined /> Вопрос {questionNumber}
                                                </Text>
                                                {hasAnswer ? (
                                                    isCorrect === true ? (
                                                        <Tag color="success" icon={<CheckCircleOutlined />}>
                                                            Правильно
                                                        </Tag>
                                                    ) : isCorrect === false ? (
                                                        <Tag color="error" icon={<CloseCircleOutlined />}>
                                                            Неправильно
                                                        </Tag>
                                                    ) : (
                                                        <Tag color="default" icon={<InfoCircleOutlined />}>
                                                            Ответ предоставлен
                                                        </Tag>
                                                    )
                                                ) : (
                                                    <Tag color="warning" icon={<InfoCircleOutlined />}>
                                                        Без ответа
                                                    </Tag>
                                                )}
                                                {type === 0 && (
                                                    <Tag color="blue">Одиночный выбор</Tag>
                                                )}
                                                {type === 1 && (
                                                    <Tag color="purple">Множественный выбор</Tag>
                                                )}
                                            </Space>
                                        </Col>
                                    </Row>
                                    
                                    {/* Текст вопроса */}
                                    <Card 
                                        size="small" 
                                        style={{ 
                                            backgroundColor: '#fafafa',
                                            border: '1px solid #e8e8e8'
                                        }}
                                    >
                                        <Paragraph style={{ fontSize: '16px', margin: 0 }}>
                                            {text}
                                        </Paragraph>
                                    </Card>
                                    
                                    {/* Варианты ответов */}
                                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                        <Text strong style={{ fontSize: '14px', color: '#595959' }}>
                                            Варианты ответа:
                                        </Text>
                                        {options && options.length > 0 ? (
                                            options.map((option) => {
                                                const isCorrectOption = correctOptionIds.includes(option.id);
                                                const isUserSelected = userSelectedIds.includes(option.id);
                                                
                                                // Определяем стиль в зависимости от статуса
                                                let borderColor = '#d9d9d9';
                                                let backgroundColor = '#ffffff';
                                                let borderWidth = '1px';
                                                let icon = null;
                                                
                                                if (isCorrectOption && isUserSelected) {
                                                    // Правильный и выбранный пользователем
                                                    borderColor = '#52c41a';
                                                    backgroundColor = '#f6ffed';
                                                    borderWidth = '2px';
                                                    icon = <CheckCircleOutlined style={{ color: '#52c41a' }} />;
                                                } else if (isCorrectOption) {
                                                    // Правильный, но не выбранный
                                                    borderColor = '#52c41a';
                                                    backgroundColor = '#f6ffed';
                                                    borderWidth = '2px';
                                                    icon = <CheckCircleOutlined style={{ color: '#52c41a' }} />;
                                                } else if (isUserSelected) {
                                                    // Выбранный пользователем, но неправильный
                                                    borderColor = '#ff4d4f';
                                                    backgroundColor = '#fff1f0';
                                                    borderWidth = '2px';
                                                    icon = <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
                                                }
                                                
                                                return (
                                                    <Card
                                                        key={option.id}
                                                        style={{
                                                            borderColor,
                                                            backgroundColor,
                                                            borderWidth,
                                                            transition: 'all 0.2s',
                                                            cursor: 'default'
                                                        }}
                                                        bodyStyle={{ padding: '12px 16px' }}
                                                    >
                                                        <Space>
                                                            {type === 0 ? (
                                                                <Radio 
                                                                    checked={isUserSelected}
                                                                    disabled
                                                                />
                                                            ) : (
                                                                <Checkbox 
                                                                    checked={isUserSelected}
                                                                    disabled
                                                                />
                                                            )}
                                                            <Text style={{ fontSize: '15px', flex: 1 }}>
                                                                {option.text}
                                                            </Text>
                                                            {icon && <Space>{icon}</Space>}
                                                            {isCorrectOption && (
                                                                <Tag color="success" style={{ margin: 0 }}>
                                                                    Правильный ответ
                                                                </Tag>
                                                            )}
                                                            {isUserSelected && !isCorrectOption && (
                                                                <Tag color="error" style={{ margin: 0 }}>
                                                                    Ваш ответ
                                                                </Tag>
                                                            )}
                                                            {isUserSelected && isCorrectOption && (
                                                                <Tag color="success" style={{ margin: 0 }}>
                                                                    Ваш правильный ответ
                                                                </Tag>
                                                            )}
                                                        </Space>
                                                    </Card>
                                                );
                                            })
                                        ) : (
                                            <Alert
                                                message="Варианты ответа не загружены"
                                                type="warning"
                                                showIcon
                                            />
                                        )}
                                    </Space>
                                    
                                    {/* Итоговая информация по вопросу */}
                                    <Divider style={{ margin: '8px 0' }} />
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Space direction="vertical" size="small">
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    Правильные варианты:
                                                </Text>
                                                {hasCorrectInfo ? (
                                                    correctOptionIds.length > 0 ? (
                                                        <Space wrap>
                                                            {correctOptionIds.map(id => {
                                                                const option = options?.find(opt => opt.id === id);
                                                                return (
                                                                    <Tag key={id} color="success">
                                                                        {option?.text || `ID: ${id}`}
                                                                    </Tag>
                                                                );
                                                            })}
                                                        </Space>
                                                    ) : (
                                                        <Text type="secondary">Правильных вариантов нет</Text>
                                                    )
                                                ) : (
                                                    <Text type="secondary" style={{ fontStyle: 'italic' }}>
                                                        Информация о правильных ответах недоступна
                                                    </Text>
                                                )}
                                            </Space>
                                        </Col>
                                        <Col span={12}>
                                            <Space direction="vertical" size="small">
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    Ваши варианты:
                                                </Text>
                                                {userSelectedIds.length > 0 ? (
                                                    <Space wrap>
                                                        {userSelectedIds.map(id => {
                                                            const option = options?.find(opt => opt.id === id);
                                                            const isCorrect = hasCorrectInfo && correctOptionIds.includes(id);
                                                            return (
                                                                <Tag 
                                                                    key={id} 
                                                                    color={hasCorrectInfo ? (isCorrect ? "success" : "error") : "default"}
                                                                >
                                                                    {option?.text || `ID: ${id}`}
                                                                </Tag>
                                                            );
                                                        })}
                                                    </Space>
                                                ) : (
                                                    <Text type="danger">Ответ не предоставлен</Text>
                                                )}
                                            </Space>
                                        </Col>
                                    </Row>
                                </Space>
                            </List.Item>
                        );
                    }}
                />
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
        </Layout>
        
    );
}