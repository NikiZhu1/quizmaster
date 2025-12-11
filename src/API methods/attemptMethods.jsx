import apiClient from './.APIclient';
import Cookies from 'js-cookie';
import { GetUserIdFromJWT } from './usersMethods';
import { jwtDecode } from 'jwt-decode';

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
 * @param {Object} attemptData - Опциональные данные попытки (для использования userId/guestSessionId из попытки)
 * @returns {Promise<Array>} - Массив ответов
 */
export const getAttemptAnswers = async (attemptId, attemptData = null) => {
  const token = Cookies.get('token');
  const guestSessionId = Cookies.get('guestSessionId');

  const params = {};
  const headers = {};

  // Используем userId или guestSessionId из данных попытки, если они доступны
  // Это важно, так как попытка могла быть создана другим пользователем или в другой сессии
  const attemptUserId = attemptData?.userId;
  const attemptGuestSessionId = attemptData?.guestSessionId || guestSessionId;

  // Всегда добавляем токен в заголовки, если он есть
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Приоритет: userId из попытки > userId из токена > guestSessionId из попытки > guestSessionId из cookies
  if (attemptUserId) {
    // Используем userId из попытки (это правильный владелец попытки)
    params.userId = attemptUserId;
    console.log('Использование userId из данных попытки:', attemptUserId);
  } else if (token) {
    // Получаем userId из токена
    const userId = GetUserIdFromJWT(token);
    console.log('Получение ответов попытки:', { 
      attemptId, 
      userId, 
      hasToken: !!token,
      attemptUserId,
      attemptGuestSessionId
    });
    
    if (userId) {
      params.userId = userId;
    } else {
      console.warn('Не удалось получить userId из токена');
    }
  }
  
  // Если нет userId, используем guestSessionId
  if (!params.userId && attemptGuestSessionId) {
    console.log('Использование guestSessionId:', attemptGuestSessionId);
    params.guestSessionId = attemptGuestSessionId;
  } else if (!params.userId && !attemptGuestSessionId) {
    console.warn('Нет ни userId, ни guestSessionId для запроса ответов');
  }
  
  try {
    const config = {
      headers: Object.keys(headers).length > 0 ? headers : undefined
    };
    
    // Добавляем params только если они есть
    if (Object.keys(params).length > 0) {
      config.params = params;
    }
    
    console.log('Запрос к API:', {
      url: `/Attempt/${attemptId}/answers`,
      params,
      hasAuthHeader: !!headers.Authorization
    });
    
    const response = await apiClient.get(`/Attempt/${attemptId}/answers`, config);
    console.log('Успешно получены ответы:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении ответов попытки ${attemptId}:`, error);
    console.error('Детали ошибки:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      params,
      hasAuthHeader: !!headers.Authorization
    });
    
    // Пробрасываем ошибку с более подробной информацией
    if (error.response?.status === 403) {
      const errorMessage = error.response?.data || 'Доступ запрещен. Убедитесь, что вы авторизованы и это ваша попытка.';
      throw new Error(errorMessage);
    }
    throw error;
  }
};

/**
 * Получает все попытки пользователя
 * @returns {Promise<Array>} - Массив попыток пользователя
 */
export const getUserAttempts = async () => {
  const token = Cookies.get('token');
  
  if (!token) {
    throw new Error('Токен авторизации обязателен');
  }

  try {
    const response = await apiClient.get('/Attempt/user', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении попыток пользователя:', error);
    throw error;
  }
};