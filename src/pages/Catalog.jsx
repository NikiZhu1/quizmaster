import React, { useEffect, useState } from 'react';
import { 
    Row, Col, Layout, Typography, Empty, Card, Button, 
    Space, message, Select, Spin, Flex 
} from 'antd';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

// Компоненты
import QuizCard from '../components/quizCard';
import HeaderComponent from '../components/HeaderComponent';

// Методы
import { useQuizes } from '../hooks/useQuizes';
import { getCategoryName, formatCategoriesFromApi, getCategoryOriginalName } from '../utils/categoryUtils';

const { Title } = Typography;
const { Option } = Select;

export default function Catalog() {
    const { quizzes, loading, error, getAllQuizzes, getAllCategories, categories } = useQuizes();
    const navigate = useNavigate();
    const [filteredQuizzes, setFilteredQuizzes] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [availableCategories, setAvailableCategories] = useState([]);

    useEffect(() => {
        loadQuizzes();
        loadCategories();
    }, []);

    // Преобразуем категории в нужный формат
    useEffect(() => {
        if (categories && categories.length > 0) {
            console.log('Доступные категории из API (оригинальные):', categories);
            
            // Используем утилиту для форматирования категорий
            const formattedCategories = formatCategoriesFromApi(categories);
            
            console.log('Форматированные категории:', formattedCategories);
            
            // Преобразуем в формат для Select
            const selectCategories = formattedCategories.map(cat => ({
                value: cat.categoryType,
                label: cat.displayName // Используем русские названия из утилиты
            }));
            
            console.log('Категории для Select:', selectCategories);
            setAvailableCategories(selectCategories);
        } else {
            console.log('Категории пустые или не загрузились, используем стандартные');
            // Стандартные категории для fallback - используем русские названия из утилиты
            const defaultCategories = [
                { value: 0, label: 'Общее' },
                { value: 1, label: 'Наука' },
                { value: 2, label: 'История' },
                { value: 3, label: 'Искусство' },
                { value: 4, label: 'География' },
                { value: 5, label: 'Спорт' },
                { value: 7, label: 'Технологии' }
            ];
            setAvailableCategories(defaultCategories);
        }
    }, [categories]);

    // При изменении списка квизов или выбранной категории фильтруем
    useEffect(() => {
        console.log('Фильтрация квизов:', {
            selectedCategory,
            totalQuizzes: quizzes.length,
            firstQuizCategory: quizzes[0]?.category
        });
        
        if (selectedCategory !== null && selectedCategory !== undefined) {
            const filtered = quizzes.filter(quiz => {
                // Проверяем, что у квиза есть категория и она совпадает с выбранной
                const hasCategory = quiz.category !== undefined && quiz.category !== null;
                const matchesCategory = quiz.category === selectedCategory;
                
                console.log(`Квиз ${quiz.id} (${quiz.title}): category=${quiz.category}, matches=${matchesCategory}`);
                return hasCategory && matchesCategory;
            });
            
            console.log('Отфильтрованные квизы:', filtered);
            setFilteredQuizzes(filtered);
        } else {
            console.log('Показываем все квизы:', quizzes.length);
            setFilteredQuizzes(quizzes);
        }
    }, [quizzes, selectedCategory]);

    const loadQuizzes = async () => {
        try {
            await getAllQuizzes();
        } catch (error) {
            console.error("Ошибка при загрузке квизов:", error);
        }
    };

    const loadCategories = async () => {
        setCategoriesLoading(true);
        try {
            console.log('Загрузка категорий...');
            const loadedCategories = await getAllCategories();
            console.log('Загруженные категории в loadCategories:', loadedCategories);
        } catch (error) {
            console.error("Ошибка при загрузке категорий:", error);
        } finally {
            setCategoriesLoading(false);
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

    const handleCategoryChange = (value) => {
        console.log('Выбрана категория:', value, getCategoryName(value));
        setSelectedCategory(value);
    };

    const clearFilter = () => {
        setSelectedCategory(null);
    };

    // Получаем название выбранной категории для отображения
    const getSelectedCategoryName = () => {
        if (selectedCategory === null || selectedCategory === undefined) return null;
        
        // Используем утилиту для получения русского названия
        return getCategoryName(selectedCategory);
    };

    // Для отладки - логируем информацию о категориях квизов
    useEffect(() => {
        if (quizzes.length > 0) {
            console.log('Категории в квизах:');
            const categoryCounts = {};
            quizzes.forEach(quiz => {
                const category = quiz.category !== undefined ? quiz.category : 'undefined';
                if (!categoryCounts[category]) {
                    categoryCounts[category] = 0;
                }
                categoryCounts[category]++;
                
                // Если category это число, получаем его название
                if (typeof category === 'number') {
                    console.log(`  Квиз ${quiz.id}: category=${category} (${getCategoryName(category)})`);
                }
            });
            console.log('Распределение по категориям:', categoryCounts);
        }
    }, [quizzes]);

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
                <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
                    <Typography.Text style={{ fontSize: '16px' }}>
                        Создание квизов: Вы можете создать свои уникальные викторины и отслеживать статистику прохождения
                    </Typography.Text>
                    <Space>
                        <Button type="primary" onClick={handleCreateQuiz}>Создать квиз</Button>
                        <Button onClick={handleMyQuizzes}>Мои квизы</Button>
                    </Space>
                </Flex>
            </Card>

            <div style={{ padding: "0px 40px" }}>
                <Flex justify="space-between" align="center" wrap="wrap" gap="middle" style={{ marginBottom: 24 }}>
                    <Title level={2} style={{ margin: 0 }}>
                        Все квизы
                        {selectedCategory !== null && selectedCategory !== undefined && (
                            <span style={{ fontSize: '18px', color: '#666', marginLeft: 12 }}>
                                ({getSelectedCategoryName()})
                            </span>
                        )}
                    </Title>
                    
                    <Space>
                        <Select
                            placeholder="Фильтр по категории"
                            style={{ width: 250 }}
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            loading={categoriesLoading}
                            allowClear
                            onClear={clearFilter}
                        >
                            <Option key="all" value={null}>
                                Все категории
                            </Option>
                            {availableCategories.map(category => (
                                <Option key={`cat-${category.value}`} value={category.value}>
                                    {category.label}
                                </Option>
                            ))}
                        </Select>
                        
                        {selectedCategory !== null && selectedCategory !== undefined && (
                            <Button onClick={clearFilter}>
                                Сбросить фильтр
                            </Button>
                        )}
                    </Space>
                </Flex>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <Spin size="large" />
                        <p style={{ marginTop: 16 }}>Загрузка квизов...</p>
                    </div>
                ) : error ? (
                    <Empty description="Ошибка при загрузке квизов" />
                ) : filteredQuizzes.length === 0 ? (
                    <Empty 
                        description={
                            selectedCategory !== null && selectedCategory !== undefined 
                                ? `Нет квизов в категории "${getSelectedCategoryName()}"` 
                                : "Квизов пока нет"
                        } 
                        style={{ marginTop: 40 }}
                    >
                        {selectedCategory !== null && selectedCategory !== undefined && (
                            <Button onClick={clearFilter}>
                                Показать все квизы
                            </Button>
                        )}
                    </Empty>
                ) : (
                    <Row gutter={[24, 24]}>
                        {filteredQuizzes.map(quiz => (
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