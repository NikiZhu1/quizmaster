import React, { useState } from 'react';
import { Card, Modal, Button, Typography, Tag, Space } from 'antd';
import { ClockCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text, Paragraph, Title } = Typography;

function QuizCard({ quiz }) {
    const navigate = useNavigate();
    const [modalVisible, setModalVisible] = useState(false);

    const handleStartQuiz = () => {
        // Закрываем модальное окно и переходим на страницу прохождения квиза
        setModalVisible(false);
        navigate(`/quiz/${quiz.id}`);
    };

    const formatTime = (seconds) => {
        if (!seconds) return "Не ограничено";
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}ч ${minutes}м ${secs}с`;
        } else if (minutes > 0) {
            return `${minutes}м ${secs}с`;
        } else {
            return `${secs}с`;
        }
    };

    return (
        <>
            {/* Карточка */}
            <Card
                hoverable
                onClick={() => setModalVisible(true)}
                style={{
                    width: '100%',
                    minHeight: 180,
                    borderRadius: 8,
                    transition: 'all 0.3s',
                }}
                styles={{ body: { padding: 16 } }}
            >
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Title level={5} style={{ margin: 0 }}>
                        {quiz.title}
                    </Title>
                    
                    <Paragraph 
                        ellipsis={{ rows: 2 }} 
                        style={{ margin: 0, color: 'rgba(0, 0, 0, 0.65)' }}
                    >
                        {quiz.description || 'Описание отсутствует'}
                    </Paragraph>
                    
                    <div style={{ marginTop: 'auto' }}>
                        <Tag icon={<ClockCircleOutlined />} color="blue">
                            {formatTime(quiz.timeLimit)}
                        </Tag>
                    </div>
                </Space>
            </Card>

            {/* Модальное окно */}
            <Modal
                title={
                    <Space>
                        <QuestionCircleOutlined />
                        <span>{quiz.title}</span>
                    </Space>
                }
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setModalVisible(false)}>
                        Закрыть
                    </Button>,
                    <Button 
                        key="start" 
                        type="primary" 
                        onClick={handleStartQuiz}
                    >
                        Начать прохождение
                    </Button>
                ]}
                width={600}
            >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {quiz.description && (
                        <div>
                            <Text strong>Описание:</Text>
                            <Paragraph style={{ marginTop: 8 }}>
                                {quiz.description}
                            </Paragraph>
                        </div>
                    )}
                    
                    <Space>
                        <Tag icon={<ClockCircleOutlined />} color="blue">
                            Время: {formatTime(quiz.timeLimit)}
                        </Tag>
                    </Space>
                    
                    <div>
                        <Text type="secondary">
                            Нажмите "Начать прохождение" чтобы приступить к квизу
                        </Text>
                    </div>
                </Space>
            </Modal>
        </>
    );
}

export default QuizCard;