import React, { useEffect, useState } from 'react';
import { Row, Col, Spin, Typography, Empty } from 'antd';

//Компоненты
import QuizCard from '../components/quizCard';

//Методы
import { useQuizes } from '../hooks/useQuizes';

const { Title } = Typography;

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
    };

    return (
        <div style={{ padding: "24px 40px" }}>
            <p>Ghbdtn</p>
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
}
