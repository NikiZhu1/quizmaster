import React, { useEffect, useState } from 'react';
import { Row, Col, Flex, Layout, Typography, Empty, Button } from 'antd';

//Компоненты
import QuizCard from '../components/quizCard';

//Методы
import { useQuizes } from '../hooks/useQuizes';

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
const { Header, Footer, Content } = Layout;

export default function Catalog() {
    // const [quizzes, setQuizzes] = useState([]);
    const {quizzes, loading, error, getAllQuizzes} = useQuizes();

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

    return (
        <div style={{ padding: "24px 40px" }}>
            <Header style={HeaderStyle}>
                <Flex justify='space-between' align='center' style={{width: '100%'}}>
                    <Button/>
                </Flex>
            </Header>
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
    );
}
