import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Layout, Row, Col, Card, Radio, Checkbox, Button, Space, 
    Typography, Progress, Statistic, Alert, Spin, Divider, Tooltip 
} from 'antd';
import { 
    LeftOutlined, RightOutlined, ClockCircleOutlined, 
    QuestionCircleOutlined, CheckCircleOutlined,
    ArrowRightOutlined, CheckOutlined, SaveOutlined
} from '@ant-design/icons';
import { useQuizAttempt } from '../hooks/useQuizAttempt';

const { Header, Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function QuizAttempt() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    
    const {
        attempt,
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
        startQuizAttempt,
        saveAnswer,
        goToNextQuestion,
        goToPreviousQuestion,
        goToQuestion,
        finishQuizAttempt,
        cleanup
    } = useQuizAttempt();

    const [submitting, setSubmitting] = useState(false);
    const [visitedQuestions, setVisitedQuestions] = useState(new Set());

    // Начинаем попытку при загрузке страницы
    useEffect(() => {
        const startAttempt = async () => {
            try {
                await startQuizAttempt(quizId);
            } catch (err) {
                console.error('Ошибка начала попытки:', err);
                setTimeout(() => navigate('/'), 2000);
            }
        };

        startAttempt();

        // Очистка при размонтировании
        return cleanup;
    }, [quizId]);

    // Отмечаем вопрос как посещенный при загрузке
    useEffect(() => {
        if (currentQuestion) {
            setVisitedQuestions(prev => new Set([...prev, currentQuestion.id]));
        }
    }, [currentQuestion]);

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
        }
    };

    // Обработчик перехода к предыдущему вопросу
    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            goToPreviousQuestion();
        }
    };

    // Завершение квиза
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
    useEffect(() => {
        if (timeLeft === 0) {
            handleFinishQuiz();
        }
    }, [timeLeft]);

    if (loading && !attempt) {
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
                    message="Ошибка"
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
                    message="Нет вопросов"
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

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Шапка с таймером и прогрессом */}
            <Header style={{ 
                background: '#fff', 
                padding: '0 24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
                <Row justify="space-between" align="middle" style={{ height: '100%' }}>
                    <Col>
                        <Space size="large">
                            <Title level={4} style={{ margin: 0 }}>
                                {questions[0]?.quizTitle || 'Квиз'}
                            </Title>
                            <Text type="secondary">
                                Вопрос {progress.current} из {progress.total}
                            </Text>
                        </Space>
                    </Col>
                    
                    <Col>
                        <Space size="large">
                            {timeLeft !== null && (
                                <Statistic
                                    title="Осталось времени"
                                    value={timeLeft}
                                    prefix={<ClockCircleOutlined />}
                                    suffix="сек"
                                    valueStyle={{ color: timeLeft < 60 ? '#ff4d4f' : '#1890ff' }}
                                />
                            )}
                            
                            <Progress
                                type="circle"
                                percent={progress.percentage}
                                width={50}
                                format={() => `${progress.current}/${progress.total}`}
                            />
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
                            isQuestionAnswered && (
                                <Space>
                                    <SaveOutlined style={{ color: '#52c41a' }} />
                                    <Text type="success">Ответ сохранен</Text>
                                </Space>
                            )
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
                                                icon={<ArrowRightOutlined />}
                                                onClick={handleNextQuestion}
                                                size="large"
                                                style={{ minWidth: 180 }}
                                            >
                                                <Space>
                                                    Следующий вопрос
                                                    <ArrowRightOutlined />
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
                            
                            <Row justify="space-between">
                                <Col>
                                    <Text type="secondary">
                                        Отвечено вопросов: {answeredCount} из {questions.length}
                                    </Text>
                                </Col>
                                <Col>
                                    <Text type="secondary">
                                        Вопрос {progress.current} из {progress.total}
                                    </Text>
                                </Col>
                            </Row>
                            
                            {/* Статус текущего вопроса */}
                            <Row>
                                <Col>
                                    {isQuestionAnswered ? (
                                        <Text type="success">
                                            ✓ На этот вопрос дан ответ
                                        </Text>
                                    ) : (
                                        <Text type="warning">
                                            ⚠ На этот вопрос еще не дан ответ
                                        </Text>
                                    )}
                                </Col>
                            </Row>
                        </Space>
                    </Card>
                </Content>
            </Layout>
        </Layout>
    );
}