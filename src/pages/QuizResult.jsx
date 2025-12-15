import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Card, Row, Col, Statistic, Progress, Button, 
    Typography, Space, List, Tag, Alert, Descriptions, Layout, 
    Divider, Tooltip, Radio, Checkbox, Badge, Spin
} from 'antd';
import { 
    CheckCircleOutlined, ClockCircleOutlined, 
    HomeOutlined, TrophyOutlined, CloseCircleOutlined,
    QuestionCircleOutlined, FieldTimeOutlined,
    CheckOutlined, CloseOutlined, InfoCircleOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import * as api from '../API methods/attemptMethods.jsx';
import * as quizApi from '../API methods/quizMethods.jsx';
import * as questionApi from '../API methods/questionMethods.jsx';
import HeaderComponent from '../components/HeaderComponent.jsx';

const { Title, Text, Paragraph } = Typography;

export default function QuizResult() {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    
    const [result, setResult] = useState(null);
    const [quizInfo, setQuizInfo] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [questionsWithOptions, setQuestionsWithOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadResult = async () => {
            try {
                // 1. Загружаем попытку
                const attemptData = await api.getAttemptById(attemptId);
                console.log('Данные попытки:', attemptData);
                setResult(attemptData);
                
                // 2. Загружаем ответы попытки
                let answersData = [];
                try {
                    const answersResponse = await api.getAttemptAnswers(attemptId, attemptData);
                    console.log('Ответы от API:', answersResponse);
                    
                    if (Array.isArray(answersResponse)) {
                        answersData = answersResponse;
                    } else if (answersResponse && Array.isArray(answersResponse.raw)) {
                        answersData = answersResponse.raw;
                    }
                    
                    console.log('Сырые ответы для обработки:', answersData);
                    setAnswers(answersData);
                    
                } catch (answersError) {
                    console.warn('Не удалось загрузить ответы попытки:', answersError);
                    setAnswers([]);
                }
                
                // 3. Загружаем информацию о квизе и вопросы
                if (attemptData.quizId) {
                    try {
                        const quizData = await quizApi.getQuizById(attemptData.quizId);
                        setQuizInfo(quizData);
                        
                        // 4. Загружаем вопросы квиза (без правильных ответов)
                        const questionsData = await quizApi.getQuizQuestions(attemptData.quizId);
                        setQuestions(questionsData);
                        console.log('Загружены вопросы:', questionsData);
                        
                        // 5. Для каждого вопроса загружаем полную информацию с IsCorrect
                        const questionsWithFullData = await Promise.all(
                            questionsData.map(async (question) => {
                                try {
                                    const fullQuestion = await questionApi.getQuestionById(question.id);
                                    return {
                                        ...question,
                                        options: fullQuestion.options || [],
                                        type: fullQuestion.type || 0
                                    };
                                } catch (error) {
                                    console.error(`Ошибка загрузки вопроса ${question.id}:`, error);
                                    return question;
                                }
                            })
                        );
                        
                        setQuestionsWithOptions(questionsWithFullData);
                        console.log('Вопросы с полными данными:', questionsWithFullData);
                        
                    } catch (quizError) {
                        console.error('Ошибка загрузки информации о квизе:', quizError);
                        setError('Не удалось загрузить информацию о квизе');
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
        
        if (typeof timeSpan === 'object') {
            const totalSeconds = 
                (timeSpan.days || 0) * 86400 + 
                (timeSpan.hours || 0) * 3600 + 
                (timeSpan.minutes || 0) * 60 + 
                Math.floor(timeSpan.seconds || 0);
            
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = Math.floor(totalSeconds % 60);
            
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (typeof timeSpan === 'string') {
            const timeWithoutFraction = timeSpan.split('.')[0];
            return timeWithoutFraction;
        }
        
        if (typeof timeSpan === 'number') {
            const totalSeconds = Math.floor(timeSpan);
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

    // Группируем ответы по questionId
    const groupedAnswers = useMemo(() => {
        const groups = {};
        
        if (Array.isArray(answers)) {
            answers.forEach(answer => {
                const questionId = answer.questionId;
                
                if (!groups[questionId]) {
                    groups[questionId] = {
                        questionId: questionId,
                        answers: [],
                        hasAnswer: false
                    };
                }
                
                groups[questionId].answers.push({
                    chosenOptionId: answer.chosenOptionId,
                    isCorrect: answer.isCorrect
                });
                
                groups[questionId].hasAnswer = true;
            });
        }
        
        return groups;
    }, [answers]);

    // Объединяем вопросы с ответами
    const questionsWithAnswers = useMemo(() => {
        return questionsWithOptions.map((question, index) => {
            const group = groupedAnswers[question.id];
            const answersForQuestion = group?.answers || [];
            
            // Получаем все выбранные варианты для этого вопроса
            const userSelectedIds = answersForQuestion.map(a => a.chosenOptionId);
            
            // Получаем ВСЕ правильные варианты из вопроса
            const allCorrectOptionIds = question.options
                ?.filter(opt => opt.isCorrect === true)
                .map(opt => parseInt(opt.id))
                .filter(id => !isNaN(id)) || [];
            
            // Считаем выбранные правильные и неправильные варианты
            const correctSelectedCount = answersForQuestion.filter(a => a.isCorrect).length;
            const incorrectSelectedCount = answersForQuestion.filter(a => !a.isCorrect).length;
            
            const isMultipleChoice = question.type === 1;
            
            // Определяем, правильно ли ответил пользователь на вопрос
            let questionStatus = 'unknown';
            let questionStatusText = 'Неизвестно';
            let statusColor = 'default';
            let isFullyCorrect = false;
            
            if (!group?.hasAnswer) {
                questionStatus = 'not-answered';
                questionStatusText = 'Без ответа';
                statusColor = 'default';
            } else if (incorrectSelectedCount > 0) {
                // Если есть хотя бы один неправильно выбранный вариант
                questionStatus = 'incorrect';
                questionStatusText = 'Неправильно';
                statusColor = 'error';
            } else if (isMultipleChoice) {
                // Для множественного выбора проверяем, выбраны ли ВСЕ правильные варианты
                // и нет ли неправильных (incorrectSelectedCount уже проверен выше)
                
                // Проверяем, выбраны ли все правильные варианты
                const allCorrectSelected = allCorrectOptionIds.every(id => 
                    userSelectedIds.includes(id)
                );
                
                // Проверяем, нет ли лишних вариантов (это невозможно, т.к. incorrectSelectedCount = 0)
                const noExtraSelections = userSelectedIds.every(id => 
                    allCorrectOptionIds.includes(id)
                );
                
                if (allCorrectSelected && noExtraSelections) {
                    questionStatus = 'correct';
                    questionStatusText = 'Правильно';
                    statusColor = 'success';
                    isFullyCorrect = true;
                } else {
                    // Даже если все выбранные варианты правильные, но выбраны не все - ответ неправильный
                    questionStatus = 'incorrect';
                    questionStatusText = 'Неправильно';
                    statusColor = 'error';
                }
            } else {
                // Для одиночного выбора
                if (correctSelectedCount > 0) {
                    questionStatus = 'correct';
                    questionStatusText = 'Правильно';
                    statusColor = 'success';
                    isFullyCorrect = true;
                } else if (userSelectedIds.length > 0) {
                    questionStatus = 'incorrect';
                    questionStatusText = 'Неправильно';
                    statusColor = 'error';
                }
            }

            // Создаем карту правильности для каждого выбранного варианта
            const optionCorrectnessMap = {};
            answersForQuestion.forEach(answer => {
                optionCorrectnessMap[answer.chosenOptionId] = answer.isCorrect;
            });

            return {
                ...question,
                questionNumber: index + 1,
                userSelectedIds,
                answersForQuestion,
                allCorrectOptionIds,
                correctSelectedCount,
                incorrectSelectedCount,
                isMultipleChoice,
                optionCorrectnessMap,
                hasAnswer: group?.hasAnswer || false,
                questionStatus,
                questionStatusText,
                statusColor,
                isFullyCorrect,
                totalCorrectOptions: allCorrectOptionIds.length,
                missingCorrectOptions: allCorrectOptionIds.filter(id => 
                    !userSelectedIds.includes(id)
                ).length
            };
        });
    }, [questionsWithOptions, groupedAnswers]);

    // Рассчитываем общую статистику
    const totalQuestions = questionsWithAnswers.length;
    const correctAnswersCount = questionsWithAnswers.filter(q => 
        q.questionStatus === 'correct'
    ).length;
    const percentage = totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0;
    const timeSpent = result?.timeSpent ? formatTimeSpan(result.timeSpent) : "00:00:00";

    // Функция для получения цвета в зависимости от процента
    const getScoreColor = (percent) => {
        if (percent >= 80) return '#52c41a';
        if (percent >= 60) return '#1890ff';
        if (percent >= 40) return '#faad14';
        return '#ff4d4f';
    };

    // Функция для получения текста оценки
    const getGradeText = (percent) => {
        if (percent >= 90) return 'Отлично! 🎉';
        if (percent >= 75) return 'Хорошо! 👍';
        if (percent >= 60) return 'Удовлетворительно ✅';
        if (percent >= 40) return 'Плохо 😕';
        return 'Очень плохо 😢';
    };

    // Функция для получения иконки статуса
    const getStatusIcon = (status) => {
        switch (status) {
            case 'correct':
                return <CheckCircleOutlined />;
            case 'incorrect':
                return <CloseCircleOutlined />;
            case 'not-answered':
                return <InfoCircleOutlined />;
            default:
                return <InfoCircleOutlined />;
        }
    };

    // Функция для получения статуса конкретного варианта ответа
    const getOptionStatus = (optionId, questionData) => {
        const { userSelectedIds, optionCorrectnessMap } = questionData;
        const isUserSelected = userSelectedIds.includes(optionId);
        
        if (!isUserSelected) {
            // Для невыбранных вариантов - нейтральный статус
            return {
                status: 'not-selected',
                label: '',
                color: 'default'
            };
        }
        
        // Проверяем правильность этого конкретного варианта
        const isCorrect = optionCorrectnessMap[optionId];
        
        if (isCorrect) {
            return {
                status: 'correct-selected',
                label: '✓ Правильный ответ',
                color: 'success'
            };
        } else {
            return {
                status: 'incorrect-selected',
                label: '✗ Неправильный ответ',
                color: 'error'
            };
        }
    };

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                gap: 16
            }}>
                <Spin size="large" />
                <Title level={4}>Загрузка результатов...</Title>
                <Progress percent={100} status="active" style={{ width: 300 }} />
            </div>
        );
    }

    if (error || !result) {
        return (
            <Layout>
                <HeaderComponent />
                <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
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
            </Layout>
        );
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <HeaderComponent />
            
            <div style={{ 
                padding: 24, 
                maxWidth: 1200, 
                margin: '0 auto',
                width: '100%'
            }}>
            
                {/* Заголовок */}
                <Row justify="center" style={{ marginBottom: 32 }}>
                    <Col>
                        <Space direction="vertical" align="center">
                            <Title level={2}>
                                <TrophyOutlined /> Результаты квиза
                            </Title>
                            {quizInfo && (
                                <Text type="secondary" style={{ fontSize: '18px' }}>
                                    {quizInfo.title}
                                </Text>
                            )}
                        </Space>
                    </Col>
                </Row>

                {/* Основная статистика */}
                <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                    <Col xs={24} sm={12} md={6}>
                        <Card hoverable>
                            <Statistic
                                title="Результат"
                                value={correctAnswersCount}
                                suffix={`из ${totalQuestions}`}
                                prefix={<CheckCircleOutlined />}
                                valueStyle={{ 
                                    color: getScoreColor(percentage),
                                    fontSize: '28px'
                                }}
                            />
                        </Card>
                    </Col>
                    
                    <Col xs={24} sm={12} md={6}>
                        <Card hoverable>
                            <Statistic
                                title="Процент выполнения"
                                value={percentage.toFixed(1)}
                                suffix="%"
                                valueStyle={{ 
                                    color: getScoreColor(percentage),
                                    fontSize: '28px'
                                }}
                            />
                            <div style={{ marginTop: 8 }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {getGradeText(percentage)}
                                </Text>
                            </div>
                        </Card>
                    </Col>
                    
                    <Col xs={24} sm={12} md={6}>
                        <Card hoverable>
                            <Statistic
                                title="Потраченное время"
                                value={timeSpent}
                                prefix={<FieldTimeOutlined />}
                                valueStyle={{ fontSize: '20px' }}
                            />
                        </Card>
                    </Col>
                    
                    <Col xs={24} sm={12} md={6}>
                        <Card hoverable>
                            <Statistic
                                title="Завершено"
                                value={formatDate(result.completedAt)}
                                valueStyle={{ fontSize: '14px' }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Прогресс-бар */}
                <Card style={{ marginBottom: 32 }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong>Общий прогресс</Text>
                        <Progress 
                            percent={percentage} 
                            strokeColor={getScoreColor(percentage)}
                            size="large"
                            format={() => `${correctAnswersCount}/${totalQuestions} (${percentage.toFixed(1)}%)`}
                        />
                    </Space>
                </Card>

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
                            <Descriptions.Item label="Категория">
                                <Text>{quizInfo.category || 'Не указана'}</Text>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                )}

                {/* Ответы пользователя */}
                <Card>
                    <Title level={4}>
                        <QuestionCircleOutlined /> Ваши ответы
                    </Title>
                    
                    {questionsWithAnswers.length === 0 ? (
                        <Alert
                            message="Нет данных о вопросах"
                            description="Информация о вопросах квиза не найдена."
                            type="info"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                    ) : (
                        <Alert
                            message={`Показаны все ${questionsWithAnswers.length} вопросов`}
                            description="Все варианты ответов показаны. Ваши выбранные варианты подсвечены зеленым (правильные) или красным (неправильные)."
                            type="info"
                            showIcon
                            style={{ marginBottom: 24 }}
                        />
                    )}
                    
                    <List
                        dataSource={questionsWithAnswers}
                        renderItem={(questionData) => {
                            const { 
                                questionNumber, 
                                text, 
                                options, 
                                type, 
                                userSelectedIds,
                                questionStatus,
                                questionStatusText,
                                statusColor,
                                isMultipleChoice,
                                answersForQuestion,
                                correctSelectedCount,
                                incorrectSelectedCount
                            } = questionData;
                            
                            return (
                                <List.Item 
                                    style={{ 
                                        borderBottom: '2px solid #e8e8e8', 
                                        padding: '24px 0',
                                        marginBottom: '16px',
                                        backgroundColor: 'white',
                                        borderRadius: '8px'
                                    }}
                                >
                                    <Space direction="vertical" style={{ width: '100%' }} size="large">
                                        {/* Заголовок вопроса */}
                                        <Row justify="space-between" align="middle" wrap={false}>
                                            <Col flex="auto">
                                                <Space>
                                                    <Badge 
                                                        count={questionNumber} 
                                                        style={{ backgroundColor: '#1890ff' }}
                                                    />
                                                    <Text strong style={{ fontSize: '18px' }}>
                                                        Вопрос
                                                    </Text>
                                                    <Tag 
                                                        color={statusColor} 
                                                        icon={getStatusIcon(questionStatus)}
                                                        style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}
                                                    >
                                                        {questionStatusText}
                                                    </Tag>
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
                                                border: '1px solid #e8e8e8',
                                                borderRadius: '6px'
                                            }}
                                        >
                                            <Paragraph style={{ fontSize: '16px', margin: 0, fontWeight: '500' }}>
                                                {text}
                                            </Paragraph>
                                        </Card>
                                        
                                        {/* Показываем ВСЕ варианты ответов */}
                                        {options && options.length > 0 ? (
                                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                                <Text strong style={{ fontSize: '14px', color: '#595959' }}>
                                                    Варианты ответа:
                                                </Text>
                                                
                                                {options.map((option) => {
                                                    const optionId = parseInt(option.id);
                                                    const optionStatus = getOptionStatus(optionId, questionData);
                                                    const isUserSelected = userSelectedIds.includes(optionId);
                                                    
                                                    // Определяем стили на основе статуса
                                                    const getCardStyles = () => {
                                                        switch (optionStatus.status) {
                                                            case 'correct-selected':
                                                                return {
                                                                    borderColor: '#52c41a',
                                                                    backgroundColor: '#f6ffed',
                                                                    borderWidth: '3px',
                                                                    color: '#389e0d',
                                                                    fontWeight: '600'
                                                                };
                                                            case 'incorrect-selected':
                                                                return {
                                                                    borderColor: '#ff4d4f',
                                                                    backgroundColor: '#fff1f0',
                                                                    borderWidth: '3px',
                                                                    color: '#cf1322',
                                                                    fontWeight: '600'
                                                                };
                                                            default:
                                                                return {
                                                                    borderColor: '#d9d9d9',
                                                                    backgroundColor: '#ffffff',
                                                                    borderWidth: '1px',
                                                                    color: '#000000',
                                                                    fontWeight: 'normal'
                                                                };
                                                        }
                                                    };
                                                    
                                                    const cardStyles = getCardStyles();
                                                    
                                                    return (
                                                        <Card
                                                            key={option.id}
                                                            style={{
                                                                borderColor: cardStyles.borderColor,
                                                                backgroundColor: cardStyles.backgroundColor,
                                                                borderWidth: cardStyles.borderWidth,
                                                                transition: 'all 0.3s ease',
                                                                cursor: 'default',
                                                                marginBottom: '8px',
                                                                borderRadius: '6px'
                                                            }}
                                                            bodyStyle={{ padding: '12px 16px' }}
                                                        >
                                                            <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
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
                                                                    <Text style={{ 
                                                                        fontSize: '15px', 
                                                                        color: cardStyles.color, 
                                                                        fontWeight: cardStyles.fontWeight,
                                                                        maxWidth: '600px'
                                                                    }}>
                                                                        {option.text || `ID: ${option.id}`}
                                                                    </Text>
                                                                </Space>
                                                                
                                                                {optionStatus.status !== 'not-selected' && (
                                                                    <Tag 
                                                                        color={optionStatus.color}
                                                                        style={{ 
                                                                            margin: 0, 
                                                                            fontSize: '12px', 
                                                                            fontWeight: '600',
                                                                            whiteSpace: 'nowrap'
                                                                        }}
                                                                    >
                                                                        {optionStatus.label}
                                                                    </Tag>
                                                                )}
                                                            </Space>
                                                        </Card>
                                                    );
                                                })}
                                            </Space>
                                        ) : (
                                            <Alert
                                                message="Варианты ответа не загружены"
                                                type="warning"
                                                showIcon
                                            />
                                        )}
                                        
                                        {/* Итоговая информация по вопросу */}
                                        <Divider style={{ margin: '8px 0' }} />
                                        <Row gutter={[16, 16]}>
                                            <Col xs={24}>
                                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                    <Text type="secondary" style={{ fontSize: '12px', fontWeight: '500' }}>
                                                        Ваш результат:
                                                    </Text>
                                                    
                                                    {userSelectedIds.length > 0 ? (
                                                        <Space wrap>
                                                            {answersForQuestion.map((answer, index) => {
                                                                const isCorrect = answer.isCorrect;
                                                                
                                                                return (
                                                                    <Tag 
                                                                        key={index} 
                                                                        color={isCorrect ? "success" : "error"}
                                                                        style={{ fontSize: '12px', fontWeight: '500' }}
                                                                    >
                                                                        {isCorrect ? 'Правильный выбор ✓' : 'Неправильный выбор ✗'}
                                                                    </Tag>
                                                                );
                                                            })}
                                                        </Space>
                                                    ) : (
                                                        <Text type="danger" style={{ fontSize: '12px' }}>
                                                            Ответ не предоставлен
                                                        </Text>
                                                    )}
                                                    
                                                    {/* Пояснения для пользователя - БЕЗ указания количества правильных вариантов */}
                                                    {userSelectedIds.length > 0 && (
                                                        <Alert
                                                            message={
                                                                questionStatus === 'correct' 
                                                                    ? "✓ Вопрос засчитан как правильный" 
                                                                    : "❌ Ответ неправильный"
                                                            }
                                                            description={
                                                                questionStatus === 'correct'
                                                                    ? isMultipleChoice
                                                                        ? "Вы выбрали все правильные варианты ответа."
                                                                        : "Вы выбрали правильный вариант ответа."
                                                                    : isMultipleChoice
                                                                    ? incorrectSelectedCount > 0
                                                                        ? "Вы выбрали неправильные варианты ответа."
                                                                        : "Вы выбрали не все правильные варианты ответа."
                                                                    : "Вы выбрали неправильный вариант ответа."
                                                            }
                                                            type={questionStatus === 'correct' ? "success" : "error"}
                                                            showIcon
                                                            style={{ marginTop: 8 }}
                                                        />
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
                <Row justify="center" style={{ marginTop: 32, marginBottom: 32 }}>
                    <Space wrap>
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
                                type="default"
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