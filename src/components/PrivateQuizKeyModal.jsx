import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Form, message, Typography, Alert } from 'antd';
import { KeyOutlined, InfoCircleOutlined, LinkOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import * as quizApi from '../API methods/quizMethods.jsx';

const { Text } = Typography;

const PrivateQuizKeyModal = ({ visible, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    // Автофокус при открытии
    useEffect(() => {
        if (visible) {
            setTimeout(() => {
                const input = document.querySelector('#quiz-key-input');
                if (input) input.focus();
            }, 100);
        } else {
            form.resetFields();
        }
    }, [visible]);

    const handleConnect = async (values) => {
        setLoading(true);
        try {
            const { key } = values;
            
            // Проверяем валидность ключа (5 символов)
            if (!key || key.length !== 5) {
                message.error('Ключ должен состоять из 5 символов');
                return;
            }

            // Используем метод подключения по коду
            const quizInfo = await quizApi.connectToQuizByCode(key.toUpperCase());
            localStorage.setItem(`quiz_access_${quizInfo.quizId}`, upperKey);
            
            message.success('Подключение успешно!');
            onClose();
            
            // Перенаправляем на страницу квиза
            navigate(`/quiz/${quizInfo.quizId}`);
            
        } catch (error) {
            console.error('Ошибка подключения:', error);
            
            if (error.response?.status === 404) {
                message.error('Квиз с таким ключом не найден');
            } else if (error.response?.status === 403) {
                message.error('Нет доступа к этому квизу');
            } else {
                message.error(error.response?.data || 'Неверный ключ доступа');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain').toUpperCase();
        form.setFieldValue('key', text.slice(0, 5));
    };

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <KeyOutlined style={{ color: '#1890ff' }} />
                    <span>Подключиться к приватному квизу</span>
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            width={500}
            centered
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleConnect}
                autoComplete="off"
            >
                <Form.Item
                    name="key"
                    label="Ключ доступа"
                    rules={[
                        { required: true, message: 'Введите ключ доступа' },
                        { len: 5, message: 'Ключ должен содержать 5 символов' },
                        {
                            pattern: /^[A-Z0-9]+$/,
                            message: 'Только заглавные буквы и цифры'
                        }
                    ]}
                >
                    <Input
                        id="quiz-key-input"
                        placeholder="ABCDE"
                        maxLength={5}
                        style={{ 
                            textTransform: 'uppercase',
                            fontFamily: 'monospace',
                            fontSize: '18px',
                            letterSpacing: '4px',
                            textAlign: 'center'
                        }}
                        onPaste={handlePaste}
                        suffix={
                            <Button 
                                type="text" 
                                size="small"
                                onClick={() => {
                                    const text = form.getFieldValue('key') || '';
                                    navigator.clipboard.writeText(text);
                                    message.success('Скопировано в буфер обмена');
                                }}
                            >
                                Копировать
                            </Button>
                        }
                    />
                </Form.Item>

                <Alert
                    message="Информация"
                    description={
                        <div style={{ fontSize: '13px' }}>
                            <p style={{ marginBottom: 4 }}>
                                <InfoCircleOutlined /> Ключ доступа состоит из 5 заглавных букв или цифр
                            </p>
                            <p style={{ marginBottom: 4 }}>
                                <LinkOutlined /> Получить ключ можно у автора приватного квиза
                            </p>
                            <p style={{ marginBottom: 0 }}>
                                🔒 Приватные квизы доступны только по специальному приглашению
                            </p>
                        </div>
                    }
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                />

                <Form.Item>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Button onClick={onClose} style={{ flex: 1 }}>
                            Отмена
                        </Button>
                        <Button 
                            type="primary" 
                            htmlType="submit"
                            loading={loading}
                            style={{ flex: 1 }}
                        >
                            Подключиться
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default PrivateQuizKeyModal;