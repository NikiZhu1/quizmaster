import React, { useEffect, useState, useCallback, useRef } from 'react';
import * as api from '../API methods/quizMethods.jsx';
import * as categoryApi from '../API methods/categoryMethods.jsx';
import { useUsers } from './useUsers'; // Добавляем импорт хука пользователей

export const useQuizes = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [categoryLoading, setCategoryLoading] = useState(false);
    
    // Используем хук пользователей для получения метода GetUserIdFromJWT
    const { GetUserIdFromJWT, getUserInfo } = useUsers();

    // Метод для получения всех категорий
    const getAllCategories = async () => {
        setCategoryLoading(true);
        setError(null);

        try {
            const categoriesData = await categoryApi.getAllCategories();
            setCategories(categoriesData);
            return categoriesData;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setCategoryLoading(false);
        }
    };

    // Метод для получения категории по ID
    const getCategoryById = async (id) => {
        setCategoryLoading(true);
        setError(null);

        try {
            const categoryData = await categoryApi.getCategoryById(id);
            return categoryData;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setCategoryLoading(false);
        }
    };

    // Метод для получения квизов по категории
    const getQuizzesByCategory = async (categoryName) => {
        setLoading(true);
        setError(null);

        try {
            const quizzesData = await categoryApi.getQuizzesByCategory(categoryName);
            
            // Для каждого квиза получаем информацию об авторе
            const quizzesWithAuthors = await Promise.all(
                quizzesData.map(async (quiz) => {
                    try {
                        if (quiz.authorId) {
                            const authorInfo = await getUserInfo(quiz.authorId);
                            return {
                                ...quiz,
                                authorName: authorInfo?.userName || authorInfo?.username
                            };
                        }
                        return quiz;
                    } catch (error) {
                        console.warn(`Не удалось загрузить автора для квиза ${quiz.id}:`, error);
                        return quiz;
                    }
                })
            );
            
            setQuizzes(quizzesWithAuthors);
            return quizzesWithAuthors;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Обновленный метод для получения всех квизов с фильтрацией по категории
    const getAllQuizzes = async (categoryId = null) => {
        setLoading(true);
        setError(null);

        try {
            let quizzesData;
            
            if (categoryId) {
                // Получаем квизы только выбранной категории
                const category = categories.find(c => c.CategoryType === categoryId);
                if (category) {
                    quizzesData = await getQuizzesByCategory(category.Name);
                } else {
                    // Если категория не найдена в локальном списке, загружаем все квизы
                    quizzesData = await api.getAllQuizzes();
                }
            } else {
                // Получаем все квизы
                quizzesData = await api.getAllQuizzes();
            }
            
            // Для каждого квиза получаем информацию об авторе
            const quizzesWithAuthors = await Promise.all(
                quizzesData.map(async (quiz) => {
                    try {
                        if (quiz.authorId) {
                            const authorInfo = await getUserInfo(quiz.authorId);
                            return {
                                ...quiz,
                                authorName: authorInfo?.userName || authorInfo?.username
                            };
                        }
                        return quiz;
                    } catch (error) {
                        console.warn(`Не удалось загрузить автора для квиза ${quiz.id}:`, error);
                        return quiz;
                    }
                })
            );
            
            setQuizzes(quizzesWithAuthors);
            return quizzesWithAuthors;
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    // Метод для проверки прав доступа к статистике квиза
    const checkQuizOwnership = async (quizId, token) => {
        try {
            const quiz = await getQuizById(quizId, token);
            const userId = GetUserIdFromJWT ? GetUserIdFromJWT(token) : null;
            
            if (!userId) {
                console.error('Не удалось получить ID пользователя из токена');
                return false;
            }
            
            return quiz.authorId === userId;
        } catch (error) {
            console.error('Ошибка проверки прав доступа:', error);
            return false;
        }
    };

    const getQuizById = async (id, token) => {
        setLoading(true);
        setError(null);

        try {
            const quizData = await api.getQuizById(id, token);
            
            return quizData;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const createQuiz = async (id, token, UpdatedQuizData) => {
        setLoading(true);
        setError(null);

        try {
            const quizzesData = await api.createQuiz(id, token, UpdatedQuizData);
            return quizzesData;

        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const updateQuiz = async (token, id, quizData) => {
        setLoading(true);
        setError(null);
        
        try {
            const quizzesData = await api.updateQuiz(token, id, quizData);
            return quizzesData;

        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const deleteQuiz = async (token, id) => {
        setLoading(true);
        setError(null);
        
        try {
            const quizzesData = await api.deleteQuiz(token, id);
            return quizzesData;
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }
    
    const getQuizQuestions = async (quizId, accessKey) => {
        setLoading(true);
        setError(null);
        
        try {
            const quizzesData = await api.getQuizQuestions(quizId, accessKey);
            return quizzesData;

        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const connectToQuizByCode = async (code) => {
        setLoading(true);
        setError(null);
        
        try {
            const quizzesData = await api.connectToQuizByCode(code);
            return quizzesData;

        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };
    
    return {
        // Категории
        getAllCategories,
        getCategoryById,
        getQuizzesByCategory,
        
        // Квизы
        getAllQuizzes,
        getQuizById,
        createQuiz,
        updateQuiz,
        deleteQuiz,
        getQuizQuestions,
        connectToQuizByCode,
        checkQuizOwnership, // Добавляем метод проверки прав
        
        // Состояния
        quizzes,
        categories,
        loading,
        categoryLoading,
        error
    }
}