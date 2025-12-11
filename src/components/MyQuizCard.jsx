import React, { useState } from 'react';
import { Card, Dropdown, Typography, Tag, Space, Modal, message } from 'antd';
import { ClockCircleOutlined, MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import * as quizApi from '../API methods/quizMethods.jsx';

const { Text, Paragraph, Title } = Typography;

function MyQuizCard({ quiz, onDelete }) {
    const navigate = useNavigate();
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

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

    const handleEdit = () => {
        // Временно перенаправляем на страницу создания вопросов
        // В будущем можно добавить полноценную страницу редактирования
        navigate(`/quiz/${quiz.id}/questions`);
    };

    const handleDeleteClick = () => {
        setDeleteModalVisible(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                message.error('Ошибка авторизации');
                return;
            }
            
            await quizApi.deleteQuiz(token, quiz.id);
            message.success('Квиз успешно удален');
            setDeleteModalVisible(false);
            
            // Вызываем callback для обновления списка
            if (onDelete) {
                onDelete(quiz.id);
            }
        } catch (error) {
            console.error('Ошибка при удалении квиза:', error);
            message.error(error.message || 'Не удалось удалить квиз');
        }
    };

    const menuItems = [
        {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Редактировать',
            onClick: handleEdit
        },
        {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Удалить',
            danger: true,
            onClick: handleDeleteClick
        }
    ];

    return (
        <>
            <Card
                hoverable
                style={{
                    width: '100%',
                    minHeight: 180,
                    borderRadius: 8,
                    transition: 'all 0.3s',
                    position: 'relative'
                }}
                styles={{ body: { padding: 16 } }}
            >
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Title level={5} style={{ margin: 0, flex: 1 }}>
                            {quiz.title}
                        </Title>
                        <Dropdown 
                            menu={{ items: menuItems }} 
                            trigger={['click']}
                            placement="bottomRight"
                        >
                            <MoreOutlined 
                                style={{ 
                                    fontSize: 18, 
                                    cursor: 'pointer',
                                    padding: '4px',
                                    borderRadius: '4px',
                                    transition: 'background-color 0.3s'
                                }}
                                onClick={(e) => e.stopPropagation()}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f0f0f0';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            />
                        </Dropdown>
                    </div>
                    
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

            {/* Модальное окно подтверждения удаления */}
            <Modal
                title="Подтверждение удаления"
                open={deleteModalVisible}
                onOk={handleDeleteConfirm}
                onCancel={() => setDeleteModalVisible(false)}
                okText="Удалить"
                cancelText="Отмена"
                okButtonProps={{ danger: true }}
            >
                <p>Вы уверены, что хотите удалить квиз &quot;{quiz.title}&quot;?</p>
                <p style={{ color: 'rgba(0, 0, 0, 0.45)' }}>Это действие нельзя отменить.</p>
            </Modal>
        </>
    );
}

export default MyQuizCard;

