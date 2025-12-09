import { useState, useCallback, useRef, useEffect } from 'react';
import * as api from '../API methods/attemptMethods.jsx';
import * as quizApi from '../API methods/quizMethods.jsx';

export const useQuizAttempt = () => {
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // Сохраняем {questionId: [optionIds]}
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [visitedQuestions, setVisitedQuestions] = useState(new Set());
  const timerRef = useRef(null);

  // Начать попытку
  const startQuizAttempt = async (quizId, accessKey = null) => {
    setLoading(true);
    setError(null);
    
    try {
      // Начинаем попытку
      const attemptData = await api.startAttempt(quizId);
      setAttempt(attemptData);
      
      // Получаем вопросы квиза
      const questionsData = await quizApi.getQuizQuestions(quizId, accessKey);
      setQuestions(questionsData);
      
      // Устанавливаем таймер, если есть ограничение по времени
      if (attemptData.timeLimit) {
        startTimer(attemptData.timeLimit);
      }
      
      return attemptData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Таймер
  const startTimer = (totalSeconds) => {
    setTimeLeft(totalSeconds);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Сохранить ответ на вопрос
  const saveAnswer = useCallback((questionId, chosenOptions) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: chosenOptions
    }));
  }, []);

  // Отметить вопрос как посещенный
  const markQuestionAsVisited = useCallback((questionId) => {
    setVisitedQuestions(prev => new Set([...prev, questionId]));
  }, []);

  // Перейти к следующему вопросу
  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      // Помечаем текущий вопрос как посещенный перед переходом
      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion) {
        markQuestionAsVisited(currentQuestion.id);
      }
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [currentQuestionIndex, questions, markQuestionAsVisited]);

  // Перейти к предыдущему вопросу
  const goToPreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      // Помечаем текущий вопрос как посещенный перед переходом
      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion) {
        markQuestionAsVisited(currentQuestion.id);
      }
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex, questions, markQuestionAsVisited]);

  // Перейти к конкретному вопросу
  const goToQuestion = useCallback((index) => {
    if (index >= 0 && index < questions.length) {
      // Помечаем текущий вопрос как посещенный перед переходом
      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion) {
        markQuestionAsVisited(currentQuestion.id);
      }
      setCurrentQuestionIndex(index);
    }
  }, [currentQuestionIndex, questions, markQuestionAsVisited]);

  // Завершить попытку
  const finishQuizAttempt = async () => {
    if (!attempt) return null;
    
    setLoading(true);
    
    try {
      // Формируем ответы в формате для API
      const formattedAnswers = Object.entries(answers).map(([questionId, chosenOptions]) => {
        // Убедимся, что все ID - числа
        const selectedOptionIds = chosenOptions.map(id => parseInt(id)).filter(id => !isNaN(id));
        
        return {
          questionId: parseInt(questionId),
          selectedOptionIds: selectedOptionIds
        };
      });
      
      // Если есть вопросы без ответов, добавляем пустые ответы
      questions.forEach(question => {
        if (!answers[question.id]) {
          formattedAnswers.push({
            questionId: question.id,
            selectedOptionIds: []
          });
        }
      });
      
      console.log('Отправляемые ответы:', formattedAnswers);
      
      // Завершаем попытку
      const result = await api.finishAttempt(attempt.id, formattedAnswers);
      
      // Очищаем таймер
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Сбрасываем состояние
      setAttempt(null);
      setQuestions([]);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setVisitedQuestions(new Set());
      setTimeLeft(null);
      
      return result;
    } catch (err) {
      console.error('Ошибка завершения:', err.response?.data || err.message);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Текущий вопрос
  const currentQuestion = questions[currentQuestionIndex] || null;

  // Ответ на текущий вопрос
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null;

  // Прогресс
  const progress = {
    current: currentQuestionIndex + 1,
    total: questions.length,
    percentage: questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0
  };

  // Количество отвеченных вопросов
  const answeredCount = Object.keys(answers).length;

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    // Состояние
    attempt,
    questions,
    currentQuestion,
    currentQuestionIndex,
    answers,
    currentAnswer,
    loading,
    error,
    timeLeft,
    progress,
    answeredCount,
    visitedQuestions,
    
    // Методы
    startQuizAttempt,
    saveAnswer,
    goToNextQuestion,
    goToPreviousQuestion,
    goToQuestion,
    finishQuizAttempt,
    markQuestionAsVisited,
    cleanup: () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };
};