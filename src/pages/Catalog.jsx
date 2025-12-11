import React, { useEffect, useState } from 'react';
import { Row, Col, Layout, Typography, Empty, Card, Button, Space, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

//Компоненты
import QuizCard from '../components/quizCard';

//Методы
import { useQuizes } from '../hooks/useQuizes';
import HeaderComponent from '../components/HeaderComponent';

const HeaderStyle = {
    background: '#fff',
    position: 'sticky',
    top: 0,
    zIndex: 1,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    height: '48px',
    padding: '24px'
};

const { Title } = Typography;

export default function Catalog() {
    // const [quizzes, setQuizzes] = useState([]);
    const {quizzes, loading, error, getAllQuizzes} = useQuizes();
    const navigate = useNavigate();

    useEffect(() => {
        loadQuizzes();
    }, []);

    const loadQuizzes = async () => {
    try {
        await getAllQuizzes();
    } catch (error) {
        console.error("Ошибка при загрузке квизов:", error);
    }
    };

    const handleCreateQuiz = () => {
        const token = Cookies.get('token');
        if (!token) {
            message.warning('Для создания квиза необходимо войти в аккаунт');
        } else {
            navigate('/newquiz');
        }
    };

    const handleMyQuizzes = () => {
        const token = Cookies.get('token');
        if (!token) {
            message.warning('Для просмотра своих квизов необходимо войти в аккаунт');
        } else {
            navigate('/myquizzes');
        }
    };

    return (
        <Layout>
            <HeaderComponent />

            <Card 
                style={{ 
                    margin: '16px 40px',
                    borderRadius: '8px',
                    backgroundColor: '#f0f2f5'
                }}
                styles={{ body: { padding: '16px 24px' } }}
            >
                <Space style={{ width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <Typography.Text style={{ fontSize: '16px' }}>
                        Создание квизов: Вы можете создать свои уникальные викторины и отслеживать статистику прохождения
                    </Typography.Text>
                    <Space>
                        <Button type="primary" onClick={handleCreateQuiz}>Создать квиз</Button>
                        <Button onClick={handleMyQuizzes}>Мои квизы</Button>
                    </Space>
                </Space>
            </Card>

            <div style={{ padding: "0px 40px" }}>
            <Title level={2}>Все квизы</Title>

            {quizzes.length === 0 ? (
                <Empty description="Квизов пока нет" style={{ marginTop: 40 }} />
            ) : (
                <Row gutter={[24, 24]}>
                    {quizzes.map(quiz => (
                        <Col key={quiz.id} xs={24} sm={12} md={8} lg={6}>
                            <QuizCard quiz={quiz} />
                        </Col>
                    ))}
                </Row>
            )}
            </div>
        </Layout>
    );
}
