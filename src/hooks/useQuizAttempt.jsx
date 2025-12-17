import { useState, useCallback, useRef, useEffect } from 'react';
import * as api from '../API methods/attemptMethods.jsx';
import * as quizApi from '../API methods/quizMethods.jsx';
import Cookies from 'js-cookie';

export const useQuizAttempt = () => {
  const [attempt, setAttempt] = useState(null);
  const [quizInfo, setQuizInfo] = useState(null); // Добавляем для хранения информации о квизе
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // Сохраняем {questionId: [optionIds]}
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null); // Оставшееся время в секундах
  const [visitedQuestions, setVisitedQuestions] = useState(new Set());
  const timerRef = useRef(null);

  // Функция для преобразования строки времени "00:10:47" в секунды
  const parseTimeStringToSeconds = (timeString) => {
    if (!timeString) return null;
    
    try {
      // Формат: "00:10:47" (часы:минуты:секунды)
      const parts = timeString.split(':');
      if (parts.length === 3) {
        const hours = parseInt(parts[0]) || 0;
        const minutes = parseInt(parts[1]) || 0;
        const seconds = parseInt(parts[2]) || 0;
        return hours * 3600 + minutes * 60 + seconds;
      }
      return null;
    } catch (error) {
      console.error('Ошибка парсинга времени:', error);
      return null;
    }
  };

  // Начать попытку
  const startQuizAttempt = async (quizId, accessKey = null) => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('token');
    try {
      // Начинаем попытку
      const attemptData = await api.startAttempt(token, quizId, accessKey);
      setAttempt(attemptData);
      
      // Сохраняем guestSessionId если есть
      if (attemptData.guestSessionId) {
        Cookies.set('guestSessionId', attemptData.guestSessionId, { expires: 1 });
      }
      
      // Получаем информацию о квизе (чтобы узнать timeLimit)
      const quizData = await quizApi.getQuizById(quizId, token);
      setQuizInfo(quizData);
      
      // Получаем вопросы квиза
      const questionsData = await quizApi.getQuizQuestions(quizId, accessKey);
      setQuestions(questionsData);
      
      // Устанавливаем таймер, если есть ограничение по времени
      if (quizData.timeLimit) {
        const totalSeconds = parseTimeStringToSeconds(quizData.timeLimit);
        if (totalSeconds && totalSeconds > 0) {
          setTimeLeft(totalSeconds);
          startTimer(totalSeconds);
        }
      }
      
      return attemptData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Таймер обратного отсчета
  const startTimer = (totalSeconds) => {
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
      
      // ВОТ ИСПРАВЛЕНИЕ ДЛЯ ВТОРОЙ ПРОБЛЕМЫ:
      // Добавляем пустые ответы для ВСЕХ вопросов, даже если на них не отвечали
      questions.forEach(question => {
        if (!answers[question.id]) {
          formattedAnswers.push({
            questionId: question.id,
            selectedOptionIds: [] // Пустой массив для вопросов без ответа
          });
        }
      });
      
      console.log('Отправляемые ответы:', formattedAnswers);
      console.log('Всего вопросов:', questions.length);
      console.log('Ответов сформировано:', formattedAnswers.length);
      
      // Завершаем попытку
      const result = await api.finishAttempt(attempt.id, formattedAnswers);
      
      // Очищаем таймер
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Сбрасываем состояние
      setAttempt(null);
      setQuizInfo(null);
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

  // Есть ли у квиза ограничение по времени
  const hasTimeLimit = quizInfo && quizInfo.timeLimit;

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
    quizInfo, // Добавляем информацию о квизе
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
    hasTimeLimit, // Добавляем флаг наличия тайм-лимита
    
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