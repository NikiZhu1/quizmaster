import React, { useState } from 'react';
import { Card, Modal, Button, Typography, Tag } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text, Paragraph } = Typography;

function QuizCard({ quiz }) {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const handleStart = () => {
        navigate(`/quiz/${quiz.id}`);
    };

    return (
        <>
            {/* --- КАРТОЧКА --- */}
            <Card
                hoverable
                onClick={() => setOpen(true)}
                style={{
                    width: 300,
                    minHeight: 150,
                }}
            >
                <Card.Meta
                    title={quiz.title}
                    description={
                        <Paragraph ellipsis={{ rows: 2 }}>
                            {quiz.description}
                        </Paragraph>
                    }
                />

                <div style={{ marginTop: 12 }}>
                    <Tag icon={<ClockCircleOutlined />}>
                        Время: {quiz.timeLimit || "Не ограничено"}
                    </Tag>
                </div>
            </Card>

            {/* --- МОДАЛЬНОЕ ОКНО --- */}
            <Modal
                title={quiz.title}
                open={open}
                onCancel={() => setOpen(false)}
                footer={[
                    <Button key="cancel" onClick={() => setOpen(false)}>
                        Закрыть
                    </Button>,
                    <Button key="start" type="primary" onClick={handleStart}>
                        Старт
                    </Button>
                ]}
            >
                <Paragraph>{quiz.description}</Paragraph>

                <Text>
                    <ClockCircleOutlined /> Время:{" "}
                    {quiz.timeLimit || "не ограничено"}
                </Text>
            </Modal>
        </>
    );
}

export default QuizCard;
