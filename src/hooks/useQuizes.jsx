import React, { useEffect, useState, useCallback, useRef } from 'react';
import * as api from '../API methods/quizMethods.jsx';
import { getUserInfo } from '../API methods/usersMethods';

export const useQuizes = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // const getAllQuizzes = async () => {
    //     setLoading(true);
    //     setError(null);

    //     try {
    //         // Загружаем квизы
    //         const quizzesData = await api.getAllQuizzes();
    //         setQuizzes(quizzesData);

    //         return quizzesData;
    //     } catch (err) {
    //         setError(err);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // В методе getAllQuizzes в useQuizes.jsx:
    const getAllQuizzes = async () => {
        setLoading(true);
        setError(null);

        try {
            // Загружаем квизы
            const quizzesData = await api.getAllQuizzes();
            
            // Для каждого квиза попробуем получить информацию об авторе
            const quizzesWithAuthors = await Promise.all(
                quizzesData.map(async (quiz) => {
                    try {
                        if (quiz.userId) {
                            const authorInfo = await getUserInfo(quiz.userId);
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

    // В методе getQuizById в useQuizes.jsx добавьте:
    const getQuizById = async (id) => {
        setLoading(true);
        setError(null);

        try {
            const quizData = await api.getQuizById(id);
            
            // Если нужно, можно получить количество вопросов отдельно
            try {
                const questions = await api.getQuizQuestions(id);
                quizData.questionsCount = questions?.length || 0;
            } catch (questionsError) {
                console.error('Не удалось получить количество вопросов:', questionsError);
                quizData.questionsCount = 0;
            }
            
            return quizData;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };
    // const getQuizById = async (id) => {
    //     setLoading(true);
    //     setError(null);

    //     try {
    //         const quizzesData = await api.getQuizById(id);
            
    //         return quizzesData;
    //     } catch (err) {
    //         setError(err);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

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
        getAllQuizzes,
        getQuizById,
        createQuiz,
        updateQuiz,
        deleteQuiz,
        getQuizQuestions,
        connectToQuizByCode,
        quizzes,
        loading,
        error
    }
}