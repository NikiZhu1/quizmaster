import React, { useState, useEffect } from 'react';
import { 
    Layout, Row, Col, Card, Typography, Button, Space, 
    Tag, Divider, Spin, Alert, Collapse, Table, Avatar, message, Skeleton 
} from 'antd';
import { 
    ClockCircleOutlined, UserOutlined, QuestionCircleOutlined,
    TrophyOutlined, PlayCircleOutlined, ArrowLeftOutlined,
    CrownOutlined, TeamOutlined, LoadingOutlined 
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

// Компоненты
import HeaderComponent from '../components/HeaderComponent';

// Методы
import { useQuizes } from '../hooks/useQuizes';
import { getUserInfo } from '../API methods/usersMethods';
import { getLeaderboard } from '../API methods/attemptMethods';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const QuizDetail = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const { getQuizById, loading: quizLoading } = useQuizes();
    
    const [quiz, setQuiz] = useState(null);
    const [author, setAuthor] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingAuthor, setLoadingAuthor] = useState(false);
    const [leaderboardLoading, setLeaderboardLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = Cookies.get('token');
        setIsAuthenticated(!!token);
        loadQuizDetails();
    }, [quizId]);

    const loadAuthorInfo = async (userId) => {
        if (!userId) {
            setAuthor(null);
            return;
        }

        setLoadingAuthor(true);
        try {
            const authorInfo = await getUserInfo(userId);
            console.log('Информация об авторе загружена:', authorInfo);
            setAuthor(authorInfo);
        } catch (error) {
            console.warn('Не удалось загрузить информацию об авторе:', error);
            setAuthor(null);
        } finally {
            setLoadingAuthor(false);
        }
    };

    const loadQuizDetails = async () => {
        setLoading(true);
        try {
            // Загружаем информацию о квизе
            const quizData = await getQuizById(parseInt(quizId));
            console.log('Данные квиза:', quizData);
            setQuiz(quizData);
            
            // Загружаем информацию об авторе - используем authorId или userId
            const authorId = quizData.authorId || quizData.userId;
            if (authorId) {
                await loadAuthorInfo(authorId);
            }
            
            // Загружаем лидерборд
            await loadLeaderboard();
            
        } catch (error) {
            console.error('Ошибка при загрузке квиза:', error);
            message.error('Не удалось загрузить информацию о квизе');
        } finally {
            setLoading(false);
        }
    };

    const loadLeaderboard = async () => {
        setLeaderboardLoading(true);
        try {
            const leaderboardData = await getLeaderboard(parseInt(quizId));
            console.log('Лидерборд загружен:', leaderboardData);
            setLeaderboard(leaderboardData);
        } catch (error) {
            console.error('Ошибка при загрузке лидерборда:', error);
            setLeaderboard([]);
        } finally {
            setLeaderboardLoading(false);
        }
    };

    const handleStartQuiz = () => {
        navigate(`/quiz/${quizId}/attempt`);
    };

    const formatTime = (timeString) => {
        if (!timeString || timeString === "00:00:00") {
            return "Без ограничений по времени";
        }
        
        try {
            // Если это строка вида "00:10:47"
            if (typeof timeString === 'string' && timeString.includes(':')) {
                const parts = timeString.split(':');
                if (parts.length === 3) {
                    const hours = parseInt(parts[0]) || 0;
                    const minutes = parseInt(parts[1]) || 0;
                    const seconds = parseInt(parts[2]) || 0;
                    
                    if (hours > 0) {
                        return `${hours}ч ${minutes}м ${seconds}с`;
                    } else if (minutes > 0) {
                        return `${minutes}м ${seconds}с`;
                    } else {
                        return `${seconds}с`;
                    }
                }
            }
            
            // Если это число секунд
            if (typeof timeString === 'number') {
                const hours = Math.floor(timeString / 3600);
                const minutes = Math.floor((timeString % 3600) / 60);
                const seconds = timeString % 60;
                
                if (hours > 0) {
                    return `${hours}ч ${minutes}м ${seconds}с`;
                } else if (minutes > 0) {
                    return `${minutes}м ${seconds}с`;
                } else {
                    return `${seconds}с`;
                }
            }
            
            return timeString.toString();
        } catch (error) {
            console.error('Ошибка форматирования времени:', error);
            return "Без ограничений по времени";
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Недавно';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Ошибка форматирования даты:', error);
            return dateString;
        }
    };

    // Функция для получения имени автора
    const getAuthorName = () => {
        if (author?.name) return author.name;
        if (author?.userName) return author.userName;
        if (author?.username) return author.username;
        return 'Неизвестный автор';
    };

    // Функция для получения ID автора для аватара
    const getAuthorId = () => {
        if (author?.id) return author.id;
        if (quiz?.authorId) return quiz.authorId;
        if (quiz?.userId) return quiz.userId;
        return null;
    };

    // Функция для отображения информации об авторе
    const renderAuthorInfo = () => {
        if (loadingAuthor) {
            return (
                <Card 
                    size="small" 
                    style={{ 
                        height: '100%',
                        border: '1px solid #e8e8e8',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Space orientation="vertical" align="center">
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                        <Text type="secondary">Загрузка автора...</Text>
                    </Space>
                </Card>
            );
        }

        return (
            <Card 
                size="small" 
                style={{ 
                    height: '100%',
                    border: '1px solid #e8e8e8',
                    borderRadius: 8
                }}
            >
                <Space orientation="vertical" size="small">
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        <UserOutlined style={{ marginRight: 4 }} />
                        Автор квиза
                    </Text>
                    <Space align="center">
                        <Avatar 
                            size="large"
                            src={getAuthorId() ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${getAuthorId()}` : null}
                            icon={<UserOutlined />}
                            style={{ 
                                backgroundColor: getAuthorId() ? '#1890ff' : '#ccc',
                                fontSize: '20px'
                            }}
                        />
                        <div>
                            <Text strong style={{ display: 'block', fontSize: '16px' }}>
                                {getAuthorName()}
                            </Text>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                ID: {getAuthorId() || 'Неизвестен'}
                            </Text>
                        </div>
                    </Space>
                </Space>
            </Card>
        );
    };

    // Столбцы для таблицы лидерборда
    const leaderboardColumns = [
        {
            title: 'Место',
            key: 'position',
            render: (_, __, index) => {
                const position = index + 1;
                if (position === 1) {
                    return <CrownOutlined style={{ color: '#FFD700', fontSize: '20px' }} />;
                } else if (position === 2) {
                    return <CrownOutlined style={{ color: '#C0C0C0', fontSize: '18px' }} />;
                } else if (position === 3) {
                    return <CrownOutlined style={{ color: '#CD7F32', fontSize: '16px' }} />;
                }
                return <span style={{ fontWeight: 'bold' }}>{position}</span>;
            },
            width: 80,
            align: 'center',
        },
        {
            title: 'Участник',
            key: 'user',
            render: (record) => (
                <Space>
                    <Avatar 
                        size="small" 
                        src={record.userId ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${record.userId}` : null}
                        icon={<UserOutlined />}
                        style={{ backgroundColor: record.userId ? '#1890ff' : '#ccc' }}
                    />
                    <div>
                        <div style={{ fontWeight: '500' }}>
                            {record.userName || 'Анонимный участник'}
                        </div>
                        {record.userId && (
                            <Text type="secondary" style={{ fontSize: '11px' }}>
                                ID: {record.userId}
                            </Text>
                        )}
                    </div>
                </Space>
            ),
        },
        {
            title: 'Результат',
            key: 'score',
            dataIndex: 'score',
            render: (score) => {
                let color = 'default';
                if (score >= 90) color = 'green';
                else if (score >= 70) color = 'blue';
                else if (score >= 50) color = 'orange';
                else color = 'red';
                
                return (
                    <Tag 
                        color={color} 
                        style={{ 
                            fontSize: '14px', 
                            fontWeight: 'bold',
                            minWidth: '60px',
                            textAlign: 'center'
                        }}
                    >
                        {score}%
                    </Tag>
                );
            },
            align: 'center',
            sorter: (a, b) => b.score - a.score,
        },
        {
            title: 'Затраченное время',
            key: 'time',
            dataIndex: 'timeTaken',
            render: (time) => (
                <Space>
                    <ClockCircleOutlined />
                    <span>{formatTime(time)}</span>
                </Space>
            ),
            align: 'center',
        },
        {
            title: 'Дата прохождения',
            key: 'date',
            dataIndex: 'completedAt',
            render: (date) => formatDate(date),
            width: 150,
        },
    ];

    if (loading) {
        return (
            <Layout>
                <HeaderComponent />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <Spin size="large" tip="Загрузка информации о квизе..." />
                </div>
            </Layout>
        );
    }

    if (!quiz) {
        return (
            <Layout>
                <HeaderComponent />
                <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
                    <Alert
                        message="Квиз не найден"
                        description="Возможно, квиз был удален или у вас нет к нему доступа. Проверьте, правильно ли указан URL или вернитесь на главную страницу."
                        type="error"
                        showIcon
                        action={
                            <Space orientation="vertical">
                                <Button type="primary" onClick={() => navigate('/')}>
                                    На главную
                                </Button>
                                <Button onClick={() => window.location.reload()}>
                                    Обновить страницу
                                </Button>
                            </Space>
                        }
                    />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <HeaderComponent />
            
            <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                {/* Кнопка назад */}
                <Button 
                    type="link" 
                    icon={<ArrowLeftOutlined />} 
                    onClick={() => navigate('/')}
                    style={{ marginBottom: 16, paddingLeft: 0 }}
                >
                    Вернуться к каталогу
                </Button>

                {/* Основная информация о квизе */}
                <Card 
                    style={{ 
                        marginBottom: 24,
                        borderRadius: 12,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <Space orientation="vertical" size="small" style={{ width: '100%' }}>
                                <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                                    {quiz.title}
                                </Title>
                                
                                {/* Описание с возможностью сворачивания */}
                                <Collapse 
                                    bordered={false} 
                                    ghost
                                    defaultActiveKey={['1']}
                                    style={{ backgroundColor: 'transparent' }}
                                >
                                    <Panel 
                                        header={
                                            <Text strong style={{ fontSize: '16px' }}>
                                                <QuestionCircleOutlined style={{ marginRight: 8 }} />
                                                Описание квиза
                                            </Text>
                                        } 
                                        key="1"
                                        style={{ border: 'none' }}
                                    >
                                        <Card 
                                            size="small" 
                                            style={{ 
                                                backgroundColor: '#fafafa',
                                                border: '1px solid #f0f0f0',
                                                marginTop: 8
                                            }}
                                        >
                                            <Paragraph style={{ margin: 0, fontSize: '15px', lineHeight: 1.6 }}>
                                                {quiz.description || 'Этот квиз не содержит описания.'}
                                            </Paragraph>
                                        </Card>
                                    </Panel>
                                </Collapse>
                            </Space>
                        </div>
                        
                        <Divider style={{ margin: 0 }} />
                        
                        <Row gutter={[16, 16]}>
                            {/* Информация об авторе */}
                            <Col xs={24} sm={12} md={8}>
                                {renderAuthorInfo()}
                            </Col>
                            
                            {/* Количество вопросов */}
                            <Col xs={24} sm={12} md={8}>
                                <Card 
                                    size="small" 
                                    style={{ 
                                        height: '100%',
                                        border: '1px solid #e8e8e8',
                                        borderRadius: 8
                                    }}
                                >
                                    <Space orientation="vertical" size="small" style={{ width: '100%' }}>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            <QuestionCircleOutlined style={{ marginRight: 4 }} />
                                            Количество вопросов
                                        </Text>
                                        <Space align="center" style={{ justifyContent: 'center', width: '100%' }}>
                                            <div style={{ 
                                                backgroundColor: '#1890ff', 
                                                borderRadius: '50%', 
                                                width: 48, 
                                                height: 48,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <Text strong style={{ color: 'white', fontSize: '18px' }}>
                                                    {quiz.questionsCount || '?'}
                                                </Text>
                                            </div>
                                            <Text style={{ fontSize: '14px', marginLeft: 8 }}>
                                                вопросов
                                            </Text>
                                        </Space>
                                    </Space>
                                </Card>
                            </Col>
                            
                            {/* Тайм-лимит */}
                            <Col xs={24} sm={12} md={8}>
                                <Card 
                                    size="small" 
                                    style={{ 
                                        height: '100%',
                                        border: '1px solid #e8e8e8',
                                        borderRadius: 8
                                    }}
                                >
                                    <Space orientation="vertical" size="small" style={{ width: '100%' }}>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            <ClockCircleOutlined style={{ marginRight: 4 }} />
                                            Ограничение по времени
                                        </Text>
                                        <Space align="center" style={{ justifyContent: 'center', width: '100%' }}>
                                            <div style={{ 
                                                backgroundColor: '#faad14', 
                                                borderRadius: '50%', 
                                                width: 48, 
                                                height: 48,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <ClockCircleOutlined style={{ fontSize: '24px', color: 'white' }} />
                                            </div>
                                            <Title level={3} style={{ margin: 0, marginLeft: 8, fontSize: quiz.timeLimit && quiz.timeLimit !== "00:00:00" ? '24px' : '18px' }}>
                                                {formatTime(quiz.timeLimit)}
                                            </Title>
                                        </Space>
                                    </Space>
                                </Card>
                            </Col>
                        </Row>
                        
                        {/* Статус и категория квиза */}
                        <div>
                            <Space wrap style={{ marginTop: 8 }}>
                                <Tag 
                                    color={quiz.isPublic ? "green" : "orange"}
                                    style={{ fontSize: '14px', padding: '4px 12px' }}
                                >
                                    {quiz.isPublic ? "📢 Публичный" : "🔒 Приватный"}
                                </Tag>
                                {quiz.category && (
                                    <Tag 
                                        color="blue" 
                                        style={{ fontSize: '14px', padding: '4px 12px' }}
                                    >
                                        Категория: {quiz.category}
                                    </Tag>
                                )}
                            </Space>
                        </div>
                    </div>
                </Card>

                {/* Кнопка начала квиза */}
                <div style={{ 
                    textAlign: 'center', 
                    marginBottom: 40,
                    padding: '24px',
                    backgroundColor: '#f6ffed',
                    borderRadius: 12,
                    border: '1px solid #b7eb8f'
                }}>
                    <div style={{ marginBottom: 16 }}>
                        <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                            Готовы проверить свои знания?
                        </Title>
                        <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                            Пройдите этот квиз и посмотрите, насколько хорошо вы знаете тему!
                        </Text>
                    </div>
                    
                    <Button
                        type="primary"
                        size="large"
                        icon={<PlayCircleOutlined />}
                        onClick={handleStartQuiz}
                        disabled={!isAuthenticated && !quiz.isPublic}
                        style={{ 
                            height: '56px', 
                            padding: '0 48px',
                            fontSize: '18px',
                            borderRadius: '28px',
                            boxShadow: '0 4px 12px rgba(24, 144, 255, 0.4)'
                        }}
                    >
                        {isAuthenticated 
                            ? '🎯 Начать прохождение' 
                            : quiz.isPublic 
                                ? '🔐 Войти, чтобы начать'
                                : '🔒 Требуется авторизация'
                        }
                    </Button>
                    
                    {!isAuthenticated && (
                        <Alert
                            message="Требуется авторизация"
                            description="Для прохождения квизов необходимо войти в систему. Это поможет сохранить ваши результаты и участвовать в рейтингах."
                            type="info"
                            showIcon
                            style={{ 
                                marginTop: 24, 
                                maxWidth: '600px', 
                                margin: '24px auto 0',
                                borderRadius: 8
                            }}
                            action={
                                <Space orientation="vertical" size="small">
                                    <Button 
                                        type="primary" 
                                        onClick={() => navigate('/login')}
                                        size="small"
                                    >
                                        Войти
                                    </Button>
                                    <Button 
                                        onClick={() => navigate('/register')}
                                        size="small"
                                    >
                                        Регистрация
                                    </Button>
                                </Space>
                            }
                        />
                    )}
                </div>

                {/* Лидерборд */}
                <Card
                    title={
                        <Space>
                            <TrophyOutlined style={{ color: '#faad14', fontSize: '20px' }} />
                            <Title level={4} style={{ margin: 0 }}>
                                Таблица лидеров
                            </Title>
                            <Tag icon={<TeamOutlined />} color="gold">
                                {leaderboard.length} участников
                            </Tag>
                        </Space>
                    }
                    loading={leaderboardLoading}
                    style={{
                        borderRadius: 12,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}
                    extra={
                        <Button 
                            type="link" 
                            onClick={loadLeaderboard}
                            loading={leaderboardLoading}
                            icon={<TrophyOutlined />}
                        >
                            Обновить
                        </Button>
                    }
                >
                    {leaderboard.length > 0 ? (
                        <>
                            <Table
                                columns={leaderboardColumns}
                                dataSource={leaderboard}
                                rowKey={(record, index) => record.id || index}
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: true,
                                    showQuickJumper: true,
                                    showTotal: (total, range) => 
                                        `${range[0]}-${range[1]} из ${total} записей`
                                }}
                                scroll={{ x: true }}
                                style={{ marginTop: 16 }}
                            />
                            
                            <div style={{ 
                                marginTop: 24, 
                                padding: 16, 
                                backgroundColor: '#fafafa', 
                                borderRadius: 8,
                                border: '1px dashed #d9d9d9'
                            }}>
                                <Space orientation="vertical" size="small">
                                    <Text strong>Как попасть в таблицу лидеров?</Text>
                                    <Text type="secondary">
                                        1. Пройдите квиз полностью<br/>
                                        2. Наберите как можно больше правильных ответов<br/>
                                        3. Постарайтесь пройти квиз быстрее других<br/>
                                        4. Ваш результат автоматически появится в таблице
                                    </Text>
                                </Space>
                            </div>
                        </>
                    ) : (
                        <Alert
                            message="Таблица лидеров пуста"
                            description="Будьте первым, кто пройдет этот квиз и попадет в историю! Пройдите квиз, чтобы ваш результат появился здесь."
                            type="info"
                            showIcon
                            icon={<TrophyOutlined />}
                            action={
                                <Button 
                                    type="primary" 
                                    onClick={handleStartQuiz}
                                    disabled={!isAuthenticated && !quiz.isPublic}
                                    size="small"
                                >
                                    Стать первым
                                </Button>
                            }
                        />
                    )}
                </Card>
            </div>
        </Layout>
    );
};

export default QuizDetail;