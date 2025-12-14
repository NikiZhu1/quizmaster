import React, { useEffect, useState, useCallback, useRef } from 'react';
import * as api from '../API methods/questionMethods.jsx';

export const useQuestions = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getQuestionById = async (id) => {
        setLoading(true);
        setError(null);

        try {
            const questionData = await api.getQuestionById(id);

            return questionData;
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const createQuestion = async (questionData, token) => {
        setLoading(true);
        setError(null);

        try {
            const question = await api.createQuestion(questionData, token);

            return question;
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const updateQuestion = async (id, questionData, token) => {
        setLoading(true);
        setError(null);

        try {
            const question = await api.updateQuestion(id, questionData, token);

            return question;
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const deleteQuestion = async (id, token) => {
        setLoading(true);
        setError(null);

        try {
            const question = await api.deleteQuestion(id, token);

            return question;
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error
    }
}
