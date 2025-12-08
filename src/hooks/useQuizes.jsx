import React, { useEffect, useState, useCallback, useRef } from 'react';
import * as api from '../API methods/quizMethods.jsx';

export const useQuizes = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getAllQuizzes = async () => {
        try {
            // агружаем квизы
            const quizzesData = await api.getAllQuizzes();
            setQuizzes(quizzesData);
            
            return quizzesData;
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return {
        getAllQuizzes,
        quizzes,
        loading,
        error
    }
}