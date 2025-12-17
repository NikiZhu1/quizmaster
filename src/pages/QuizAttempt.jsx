import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Layout, Row, Col, Card, Radio, Checkbox, Button, Space, 
    Typography, Alert, Spin, Divider, Tooltip 
} from 'antd';
import { 
    LeftOutlined, 
    QuestionCircleOutlined, CheckCircleOutlined,
    RightOutlined, CheckOutlined, SaveOutlined
} from '@ant-design/icons';
import Cookies from 'js-cookie';

import { useQuizAttempt } from '../hooks/useQuizAttempt';
import HeaderComponent from '../components/HeaderComponent';
import { useQuizes } from '../hooks/useQuizes';

const { Header, Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function QuizAttempt() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const { getQuizById } = useQuizes();
    
    const {
        attempt,
        quizInfo,
        questions,
        currentQuestion,
        currentQuestionIndex,
        answers,
        currentAnswer,
        loading,
        error,
        timeLeft,
        progress,
        answeredCount,
        visitedQuestions,
        hasTimeLimit,
        startQuizAttempt,
        saveAnswer,
        goToNextQuestion,
        goToPreviousQuestion,
        goToQuestion,
        finishQuizAttempt,
        markQuestionAsVisited,
        cleanup
    } = useQuizAttempt();

    const [submitting, setSubmitting] = useState(false);

    // Начинаем попытку при загрузке страницы
    useEffect(() => {
        const startAttempt = async () => {
            try {
                const token = Cookies.get('token');
                const quiz = await getQuizById(quizId, token);
                console.log("квиз", quiz)
                await startQuizAttempt(quizId, quiz.privateAccessKey);
            } catch (err) {
                console.error('Ошибка начала попытки:', err);
                setTimeout(() => navigate('/'), 2000);
            }
        };

        startAttempt();

        // Очистка при размонтировании
        return cleanup;
    }, [quizId]);

    // Обновляем состояние выбора ответа
    useEffect(() => {
        if (currentQuestion && currentAnswer) {
            const hasAnswer = currentQuestion.type === 0 
                ? currentAnswer.length > 0 
                : currentAnswer.length > 0;
        }
    }, [currentQuestion, currentAnswer]);

    // Отмечаем вопрос как посещенный при загрузке
    useEffect(() => {
        if (currentQuestion) {
            markQuestionAsVisited(currentQuestion.id);
        }
    }, [currentQuestion, markQuestionAsVisited]);

    // Обработчик выбора ответа
    const handleAnswerSelect = (optionId) => {
        if (!currentQuestion) return;

        let newAnswer;
        
        if (currentQuestion.type === 0) {
            // Одиночный выбор - сохраняем как массив с одним элементом
            newAnswer = [optionId];
        } else {
            // Множественный выбор
            const currentAnswers = currentAnswer || [];
            
            if (currentAnswers.includes(optionId)) {
                // Удаляем, если уже выбран
                newAnswer = currentAnswers.filter(id => id !== optionId);
            } else {
                // Добавляем
                newAnswer = [...currentAnswers, optionId];
            }
        }
        
        saveAnswer(currentQuestion.id, newAnswer);
    };

    // Проверка, выбран ли вариант
    const isOptionSelected = (optionId) => {
        if (!currentAnswer) return false;
        
        if (currentQuestion.type === 0) {
            // Для одиночного выбора проверяем первый элемент массива
            return currentAnswer[0] === optionId;
        } else {
            return currentAnswer.includes(optionId);
        }
    };

    // Обработчик перехода к следующему вопросу
    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            goToNextQuestion();
        } else {
            // Если это последний вопрос, показываем кнопку завершения
            handleFinishQuiz();
        }
    };

    // Обработчик перехода к предыдущему вопросу
    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            goToPreviousQuestion();
        }
    };

    // Завершение квиза (ручное)
    const handleFinishQuiz = async () => {
        if (window.confirm('Вы уверены, что хотите завершить квиз?')) {
            setSubmitting(true);
            try {
                const result = await finishQuizAttempt();
                navigate(`/quiz-result/${result.id}`);
            } catch (err) {
                console.error('Ошибка завершения квиза:', err);
            } finally {
                setSubmitting(false);
            }
        }
    };

    // Автоматическое завершение при истечении времени
    const handleTimeExpired = async () => {
        setSubmitting(true);
        try {
            const result = await finishQuizAttempt();
            navigate(`/quiz-result/${result.id}`);
        } catch (err) {
            console.error('Ошибка завершения квиза:', err);
        } finally {
            setSubmitting(false);
        }
    };

    // Автоматическое завершение при истечении времени
    useEffect(() => {
        if (timeLeft === 0 && hasTimeLimit) {
            window.alert('Время, отведенное на прохождение викторины, закончилось. Викторина будет автоматически завершена.');
            handleTimeExpired();
        }
    }, [timeLeft, hasTimeLimit]);

    // Функция для форматирования секунд в ЧЧ:ММ:СС
    const formatTimeToHHMMSS = (seconds) => {
        if (!seconds && seconds !== 0) return "Не ограничено";
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        // Форматируем с ведущими нулями
        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = secs.toString().padStart(2, '0');
        
        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    };

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <Spin size="large" tip="Загрузка квиза..." />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: 24 }}>
                <Alert
                    title="Ошибка"
                    description={error}
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

    if (!currentQuestion) {
        return (
            <div style={{ padding: 24 }}>
                <Alert
                    title="Нет вопросов"
                    description="В этом квизе пока нет вопросов."
                    type="info"
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

    const isLastQuestion = currentQuestionIndex >= questions.length - 1;
    const isQuestionAnswered = currentAnswer && currentAnswer.length > 0;

    // Функция для обрезки названия квиза
    const truncateTitle = (title) => {
        if (!title) return 'Квиз';
        return title.length > 50 ? title.substring(0, 50) + '...' : title;
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Шапка с таймером и прогрессом */}
            <Header style={{ 
                background: '#fff', 
                padding: '0 24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                height: 'auto',
                minHeight: '64px'
            }}>
                <Row justify="center" align="middle" style={{ height: '100%', padding: '12px 0' }}>
                    <Col>
                        <Space direction="vertical" size="small" align="center" style={{ width: '100%' }}>
                            <Title level={4} style={{ margin: 0, textAlign: 'center' }}>
                                {truncateTitle(quizInfo?.title)}
                            </Title>
                            
                            {/* Таймер обратного отсчета - показываем только если есть timeLimit */}
                            {hasTimeLimit && timeLeft !== null && (
                                <Space direction="vertical" size={0} align="center">
                                    <div style={{ 
                                        fontSize: '24px', 
                                        fontWeight: 'bold',
                                        color: timeLeft < 60 ? '#ff4d4f' : 
                                               timeLeft < 300 ? '#faad14' : '#1890ff',
                                        fontFamily: 'monospace',
                                        letterSpacing: '1px',
                                        lineHeight: 1
                                    }}>
                                        {formatTimeToHHMMSS(timeLeft)}
                                    </div>
                                    {timeLeft < 300 && (
                                        <Text 
                                            type={timeLeft < 60 ? 'danger' : 'warning'} 
                                            style={{ fontSize: '12px', lineHeight: 1 }}
                                        >
                                            {timeLeft < 60 ? '⏳ Время почти вышло!' : '⚠ Времени осталось мало!'}
                                        </Text>
                                    )}
                                </Space>
                            )}
                            
                            <Text type="secondary" style={{ textAlign: 'center' }}>
                                Вопрос {progress.current} из {progress.total}
                            </Text>
                        </Space>
                    </Col>
                </Row>
            </Header>

            <Layout>
                {/* Боковая панель с навигацией */}
                <Sider width={250} style={{ 
                    background: '#fff',
                    padding: '24px 16px',
                    borderRight: '1px solid #f0f0f0'
                }}>
                    <Title level={5} style={{ marginBottom: 16 }}>
                        Навигация по вопросам
                    </Title>
                    
                    <Space direction="vertical" style={{ width: '100%' }}>
                        {questions.map((question, index) => {
                            const isAnswered = answers[question.id] && answers[question.id].length > 0;
                            const isCurrent = currentQuestionIndex === index;
                            const isVisited = visitedQuestions.has(question.id);
                            
                            let buttonType = "dashed";
                            let backgroundColor = undefined;
                            let borderColor = undefined;
                            
                            if (isCurrent) {
                                buttonType = "primary";
                            } else if (isAnswered) {
                                buttonType = "default";
                                backgroundColor = '#d9f7be';
                                borderColor = '#52c41a';
                            } else if (isVisited) {
                                buttonType = "default";
                                backgroundColor = '#fff7e6';
                                borderColor = '#faad14';
                            }
                            
                            return (
                                <Tooltip 
                                    key={question.id} 
                                    title={
                                        isAnswered ? "Ответ дан" : 
                                        isVisited ? "Просмотрен" : 
                                        "Не просмотрен"
                                    }
                                >
                                    <Button
                                        type={buttonType}
                                        shape="circle"
                                        size="large"
                                        onClick={() => goToQuestion(index)}
                                        style={{
                                            width: 40,
                                            height: 40,
                                            marginBottom: 8,
                                            backgroundColor,
                                            borderColor
                                        }}
                                    >
                                        {index + 1}
                                        {isAnswered && !isCurrent && (
                                            <CheckOutlined style={{ fontSize: 10, marginLeft: 2 }} />
                                        )}
                                        {isVisited && !isAnswered && !isCurrent && (
                                            <span style={{ fontSize: 10, marginLeft: 2 }}>👁</span>
                                        )}
                                    </Button>
                                </Tooltip>
                            );
                        })}
                    </Space>

                    <Divider style={{ margin: '16px 0' }} />

                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            <span style={{ color: '#52c41a' }}>●</span> Ответ дан<br />
                            <span style={{ color: '#faad14' }}>●</span> Просмотрен<br />
                            <span style={{ color: '#d9d9d9' }}>●</span> Не просмотрен
                        </Text>
                        
                        <Button
                            type="primary"
                            danger
                            onClick={handleFinishQuiz}
                            loading={submitting}
                            icon={<CheckCircleOutlined />}
                            block
                            style={{ marginTop: 8 }}
                        >
                            Завершить квиз
                        </Button>
                    </Space>
                </Sider>

                {/* Основное содержимое с вопросом */}
                <Content style={{ padding: '24px' }}>
                    <Card
                        title={
                            <Space>
                                <QuestionCircleOutlined />
                                <Text strong>Вопрос {progress.current}</Text>
                                <Text type="secondary" style={{ fontSize: 14 }}>
                                    ({currentQuestion.type === 0 ? 'Одиночный выбор' : 'Множественный выбор'})
                                </Text>
                            </Space>
                        }
                        style={{ minHeight: '60vh' }}
                        extra={
                            <Space>
                                {isQuestionAnswered && (
                                    <Space>
                                        <SaveOutlined style={{ color: '#52c41a' }} />
                                        <Text type="success">Ответ сохранен</Text>
                                    </Space>
                                )}
                            </Space>
                        }
                    >
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <Paragraph style={{ fontSize: '18px', marginBottom: 24 }}>
                                {currentQuestion.text}
                            </Paragraph>

                            <Space direction="vertical" style={{ width: '100%' }}>
                                {currentQuestion.options?.map(option => (
                                    <Card
                                        key={option.id}
                                        hoverable
                                        onClick={() => handleAnswerSelect(option.id)}
                                        style={{
                                            marginBottom: 8,
                                            border: isOptionSelected(option.id) 
                                                ? '2px solid #1890ff' 
                                                : '1px solid #d9d9d9',
                                            background: isOptionSelected(option.id) 
                                                ? '#e6f7ff' 
                                                : '#fff',
                                            transition: 'all 0.2s',
                                            cursor: 'pointer'
                                        }}
                                        bodyStyle={{ padding: 12 }}
                                    >
                                        <Space>
                                            {currentQuestion.type === 0 ? (
                                                <Radio checked={isOptionSelected(option.id)} />
                                            ) : (
                                                <Checkbox checked={isOptionSelected(option.id)} />
                                            )}
                                            <Text style={{ fontSize: '16px' }}>
                                                {option.text}
                                            </Text>
                                        </Space>
                                    </Card>
                                ))}
                            </Space>

                            {/* Улучшенные кнопки навигации */}
                            <Row justify="space-between" style={{ marginTop: 32 }}>
                                <Col>
                                    <Button
                                        icon={<LeftOutlined />}
                                        onClick={handlePreviousQuestion}
                                        disabled={currentQuestionIndex === 0}
                                        size="large"
                                    >
                                        Предыдущий вопрос
                                    </Button>
                                </Col>
                                
                                <Col>
                                    <Space>
                                        {/* Кнопка перехода к следующему вопросу или завершения */}
                                        {!isLastQuestion ? (
                                            <Button
                                                type="primary"
                                                onClick={handleNextQuestion}
                                                size="large"
                                                style={{ minWidth: 180 }}
                                            >
                                                <Space>
                                                    Следующий вопрос
                                                    <RightOutlined />
                                                </Space>
                                            </Button>
                                        ) : (
                                            <Button
                                                type="primary"
                                                icon={<CheckCircleOutlined />}
                                                onClick={handleFinishQuiz}
                                                loading={submitting}
                                                size="large"
                                                style={{ minWidth: 180 }}
                                            >
                                                Завершить квиз
                                            </Button>
                                        )}
                                    </Space>
                                </Col>
                            </Row>

                            {/* Информация о прогрессе */}
                            <Divider style={{ margin: '16px 0' }} />
                            
                            <Row justify="center">
                                <Col>
                                    <Text type="secondary">
                                        Отвечено вопросов: {answeredCount} из {questions.length}
                                    </Text>
                                </Col>
                            </Row>
                        </Space>
                    </Card>
                </Content>
            </Layout>
        </Layout>
    );
}