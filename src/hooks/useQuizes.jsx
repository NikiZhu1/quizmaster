import React, { useEffect, useState, useCallback, useRef } from 'react';
import * as api from '../API methods/quizMethods.jsx';

export const useQuizes = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getAllQuizzes = async () => {
        setLoading(true);
        setError(null);

        try {
            // Загружаем квизы
            const quizzesData = await api.getAllQuizzes();
            setQuizzes(quizzesData);

            return quizzesData;
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const getQuizById = async (id) => {
        setLoading(true);
        setError(null);

        try {
            const quizzesData = await api.getQuizById(id);
            
            return quizzesData;
        } catch (err) {
            setError(err);
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

    const updateQuiz = async (token, quizData) => {
        setLoading(true);
        setError(null);
        
        try {
            const quizzesData = await api.updateQuiz(token, quizData);
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