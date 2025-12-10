import apiClient from './.APIclient';
import Cookies from 'js-cookie';
import { GetUserIdFromJWT } from './usersMethods';

/**
 * Начинает попытку прохождения квиза
 * @param {number} quizId - ID квиза
 * @returns {Promise<Object>} - Объект попытки
 */
export const startAttempt = async (quizId) => {
  const token = Cookies.get('token');
  
  try {
    const response = await apiClient.post(`/attempt/${quizId}/start`, {}, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
  } catch (error) {
    console.error(`Ошибка при начале попытки квиза ${quizId}:`, error);
    throw error;
  }
};

/**
 * Завершает попытку прохождения квиза
 * @param {number} attemptId - ID попытки
 * @param {Array} answers - Массив ответов в формате {questionId, selectedOptionIds}
 * @returns {Promise<Object>} - Результат попытки
 */
export const finishAttempt = async (attemptId, answers) => {
  const token = Cookies.get('token');
  
  // Логируем данные перед отправкой
  console.log('Отправка данных на сервер:');
  console.log('- attemptId:', attemptId);
  console.log('- answers:', answers);
  
  try {
    const response = await apiClient.post(`/Attempt/${attemptId}/stop`, {
      answers: answers
    }, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    
    console.log('Ответ от сервера:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при завершении попытки ${attemptId}:`, error);
    
    // Детальная информация об ошибке
    if (error.response) {
      console.error('Статус:', error.response.status);
      console.error('Данные ошибки:', error.response.data);
    }
    
    throw error;
  }
};

/**
 * Получает попытку по ID
 * @param {number} attemptId - ID попытки
 * @returns {Promise<Object>} - Объект попытки
 */
export const getAttemptById = async (attemptId) => {
  const token = Cookies.get('token');
  
  try {
    const response = await apiClient.get(`/Attempt/${attemptId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении попытки ${attemptId}:`, error);
    throw error;
  }
};

/**
 * Получает ответы для попытки
 * @param {number} attemptId - ID попытки
 * @returns {Promise<Array>} - Массив ответов
 */
export const getAttemptAnswers = async (attemptId) => {
  const token = Cookies.get('token');
  const guestSessionId = Cookies.get('guestSessionId');

  let params = ''

  if (token) {
      // Получаем userId из токена
      const userId = GetUserIdFromJWT(token);
      params = `userId=${userId}`;
    } 
    else if (guestSessionId) {
      params = `guestSessionId=${guestSessionId}`;
    }
  
  try {
    const response = await apiClient.get(`/Attempt/${attemptId}/answers?${params}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении ответов попытки ${attemptId}:`, error);
    throw error;
  }
};