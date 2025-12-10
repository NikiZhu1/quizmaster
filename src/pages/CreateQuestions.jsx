import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Layout, Card, Form, Input, Radio, Button, Space, Typography,
    Checkbox, message, Row, Col, Divider, List, Empty, Popconfirm
} from 'antd';
import {
    PlusOutlined, DeleteOutlined, SaveOutlined, QuestionCircleOutlined,
    CheckCircleOutlined, ArrowLeftOutlined, CheckOutlined
} from '@ant-design/icons';
import Cookies from 'js-cookie';
import HeaderComponent from '../components/HeaderComponent';
import { createQuestion } from '../API methods/questionMethods';
import { getQuizById } from '../API methods/quizMethods';
import { getQuizQuestions } from '../API methods/quizMethods';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function CreateQuestions() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loadingQuiz, setLoadingQuiz] = useState(true);
    const [questionType, setQuestionType] = useState(0); // 0 - один вариант, 1 - несколько

    useEffect(() => {
        loadQuizData();
    }, [quizId]);

    const loadQuizData = async () => {
        try {
            setLoadingQuiz(true);
            const quizData = await getQuizById(quizId);
            setQuiz(quizData);

            // Загружаем существующие вопросы
            try {
                const questionsData = await getQuizQuestions(quizId);
                setQuestions(questionsData || []);
            } catch (error) {
                console.error('Ошибка при загрузке вопросов:', error);
                setQuestions([]);
            }
        } catch (error) {
            console.error('Ошибка при загрузке квиза:', error);
            message.error('Не удалось загрузить данные квиза');
            navigate('/');
        } finally {
            setLoadingQuiz(false);
        }
    };

    const onFinish = async (values) => {
        setLoading(true);

        try {
            const token = Cookies.get('token');

            if (!token) {
                message.error('Требуется авторизация');
                navigate('/login');
                return;
            }

            // Проверяем, что есть хотя бы один правильный ответ
            const correctOptions = values.options.filter(opt => opt.isCorrect);
            if (correctOptions.length === 0) {
                message.error('Выберите хотя бы один правильный ответ!');
                setLoading(false);
                return;
            }

            // Для одиночного выбора (type 0) должен быть только один правильный ответ
            if (questionType === 0 && correctOptions.length > 1) {
                message.error('Для вопроса с одним вариантом ответа выберите только один правильный ответ!');
                setLoading(false);
                return;
            }

            // Формируем данные для отправки
            const questionData = {
                text: values.text,
                quizId: parseInt(quizId),
                type: questionType,
                options: values.options.map(opt => ({
                    text: opt.text,
                    isCorrect: opt.isCorrect || false
                }))
            };

            // Отправляем запрос на создание вопроса
            const response = await createQuestion(questionData, token);

            message.success('Вопрос успешно создан!');
            
            // Очищаем форму и сбрасываем начальные значения
            form.resetFields();
            form.setFieldsValue({
                options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }]
            });
            setQuestionType(0);
            
            // Обновляем список вопросов
            await loadQuizData();
        } catch (error) {
            console.error('Ошибка при создании вопроса:', error);
            
            if (error.response?.status === 401) {
                message.error('Ошибка авторизации. Пожалуйста, войдите снова.');
                navigate('/login');
            } else if (error.response?.status === 400) {
                message.error(error.response.data?.message || error.message || 'Неверные данные для создания вопроса');
            } else {
                message.error(error.message || 'Ошибка при создании вопроса. Попробуйте еще раз.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <HeaderComponent />

            <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                {loadingQuiz ? (
                    <Card>
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <Text>Загрузка...</Text>
                        </div>
                    </Card>
                ) : (
                    <>
                        {/* Информация о квизе */}
                        <Card style={{ marginBottom: '24px' }}>
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Row justify="space-between" align="middle">
                                    <Col>
                                        <Space>
                                            <Button
                                                icon={<ArrowLeftOutlined />}
                                                onClick={() => navigate('/')}
                                            >
                                                Назад
                                            </Button>
                                            <Title level={3} style={{ margin: 0 }}>
                                                {quiz?.title || 'Квиз'}
                                            </Title>
                                        </Space>
                                        {quiz?.description && (
                                            <Paragraph type="secondary" style={{ marginTop: '8px', marginBottom: 0 }}>
                                                {quiz.description}
                                            </Paragraph>
                                        )}
                                    </Col>
                                </Row>
                            </Space>
                        </Card>

                        <Row gutter={[24, 24]}>
                            {/* Форма создания вопроса */}
                            <Col xs={24} lg={14}>
                                <Card>
                                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                        <div>
                                            <Title level={4}>
                                                <QuestionCircleOutlined /> Создать новый вопрос
                                            </Title>
                                            <Text type="secondary">
                                                Заполните форму для добавления вопроса в квиз
                                            </Text>
                                        </div>

                                        <Divider />

                                        <Form
                                            form={form}
                                            layout="vertical"
                                            onFinish={onFinish}
                                            autoComplete="off"
                                            initialValues={{
                                                options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }]
                                            }}
                                        >
                                            {/* Текст вопроса */}
                                            <Form.Item
                                                name="text"
                                                label="Текст вопроса"
                                                rules={[
                                                    { required: true, message: 'Введите текст вопроса!' },
                                                    { max: 500, message: 'Текст не должен превышать 500 символов' }
                                                ]}
                                            >
                                                <TextArea
                                                    placeholder="Введите текст вопроса"
                                                    rows={3}
                                                    showCount
                                                    maxLength={500}
                                                />
                                            </Form.Item>

                                            {/* Тип вопроса */}
                                            <Form.Item
                                                label="Тип вопроса"
                                            >
                                                <Radio.Group
                                                    value={questionType}
                                                    onChange={(e) => {
                                                        setQuestionType(e.target.value);
                                                        // Сбрасываем выбор правильных ответов при смене типа
                                                        const options = form.getFieldValue('options') || [];
                                                        form.setFieldsValue({
                                                            options: options.map(opt => ({ ...opt, isCorrect: false }))
                                                        });
                                                    }}
                                                >
                                                    <Radio value={0}>
                                                        <Space>
                                                            <CheckCircleOutlined />
                                                            <Text>Один вариант ответа</Text>
                                                        </Space>
                                                    </Radio>
                                                    <Radio value={1}>
                                                        <Space>
                                                            <CheckOutlined />
                                                            <Text>Несколько верных вариантов</Text>
                                                        </Space>
                                                    </Radio>
                                                </Radio.Group>
                                            </Form.Item>

                                            {/* Варианты ответа */}
                                            <Form.Item
                                                label="Варианты ответа"
                                                required
                                            >
                                                <Form.List name="options">
                                                    {(fields, { add, remove }) => (
                                                        <>
                                                            {fields.map(({ key, name, ...restField }) => (
                                                                <Card
                                                                    key={key}
                                                                    size="small"
                                                                    style={{ marginBottom: 8 }}
                                                                    extra={
                                                                        fields.length > 2 && (
                                                                            <Button
                                                                                type="text"
                                                                                danger
                                                                                icon={<DeleteOutlined />}
                                                                                onClick={() => remove(name)}
                                                                                size="small"
                                                                            />
                                                                        )
                                                                    }
                                                                >
                                                                    <Row gutter={8} align="middle">
                                                                        <Col flex="auto">
                                                                            <Form.Item
                                                                                {...restField}
                                                                                name={[name, 'text']}
                                                                                rules={[
                                                                                    { required: true, message: 'Введите вариант ответа!' }
                                                                                ]}
                                                                                style={{ marginBottom: 0 }}
                                                                            >
                                                                                <Input
                                                                                    placeholder={`Вариант ответа ${name + 1}`}
                                                                                />
                                                                            </Form.Item>
                                                                        </Col>
                                                                        <Col>
                                                                            <Form.Item
                                                                                {...restField}
                                                                                name={[name, 'isCorrect']}
                                                                                valuePropName="checked"
                                                                                style={{ marginBottom: 0 }}
                                                                            >
                                                                                <Checkbox>
                                                                                    {questionType === 0 ? 'Правильный' : 'Верный'}
                                                                                </Checkbox>
                                                                            </Form.Item>
                                                                        </Col>
                                                                    </Row>
                                                                </Card>
                                                            ))}
                                                            <Button
                                                                type="dashed"
                                                                onClick={() => add()}
                                                                block
                                                                icon={<PlusOutlined />}
                                                                style={{ marginTop: 8 }}
                                                            >
                                                                Добавить вариант ответа
                                                            </Button>
                                                        </>
                                                    )}
                                                </Form.List>
                                            </Form.Item>

                                            <Divider />

                                            {/* Кнопка сохранения */}
                                            <Form.Item>
                                                <Button
                                                    type="primary"
                                                    htmlType="submit"
                                                    loading={loading}
                                                    icon={<SaveOutlined />}
                                                    block
                                                    size="large"
                                                >
                                                    Сохранить вопрос
                                                </Button>
                                            </Form.Item>
                                        </Form>
                                    </Space>
                                </Card>
                            </Col>

                            {/* Список существующих вопросов */}
                            <Col xs={24} lg={10}>
                                <Card>
                                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                        <div>
                                            <Title level={4} style={{ margin: 0 }}>
                                                Вопросы квиза
                                            </Title>
                                            <Text type="secondary">
                                                {questions.length} {questions.length === 1 ? 'вопрос' : questions.length < 5 ? 'вопроса' : 'вопросов'}
                                            </Text>
                                        </div>

                                        <Divider style={{ margin: '16px 0' }} />

                                        {questions.length === 0 ? (
                                            <Empty
                                                description="Вопросов пока нет"
                                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                            />
                                        ) : (
                                            <List
                                                dataSource={questions}
                                                renderItem={(question, index) => (
                                                    <List.Item>
                                                        <Card
                                                            size="small"
                                                            style={{ width: '100%' }}
                                                            title={
                                                                <Space>
                                                                    <Text strong>Вопрос {index + 1}</Text>
                                                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                                                        ({question.type === 0 ? 'Один вариант' : 'Несколько вариантов'})
                                                                    </Text>
                                                                </Space>
                                                            }
                                                        >
                                                            <Paragraph style={{ marginBottom: 8 }}>
                                                                {question.text}
                                                            </Paragraph>
                                                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                                {question.options?.map((option, optIndex) => (
                                                                    <Text
                                                                        key={option.id || optIndex}
                                                                        style={{
                                                                            display: 'block',
                                                                            padding: '4px 8px',
                                                                            backgroundColor: '#f5f5f5',
                                                                            borderRadius: '4px'
                                                                        }}
                                                                    >
                                                                        {optIndex + 1}. {option.text}
                                                                    </Text>
                                                                ))}
                                                            </Space>
                                                        </Card>
                                                    </List.Item>
                                                )}
                                            />
                                        )}
                                    </Space>
                                </Card>
                            </Col>
                        </Row>
                    </>
                )}
            </Content>
        </Layout>
    );
}

