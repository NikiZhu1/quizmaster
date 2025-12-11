import apiClient from './.APIclient';
import { GetUserIdFromJWT } from './usersMethods';

/**
 * Получает все квизы с сервера
 * @returns {Promise<Array>} - Массив квизов
 */
export const getAllQuizzes = async () => {

  try {
    const response = await apiClient.get('/Quiz');

    console.log('Полученные квизы:', response.data);
    return response.data;

  } catch (error) {
    console.error('Ошибка при получении квизов:', error);
    throw error;
  }
};

/**
 * Создает новый квиз
 * @param {Object} quizData - Данные для создания квиза
 * @param {string} quizData.title - Название квиза
 * @param {string} quizData.description - Описание квиза
 * @param {number} quizData.categoryId - ID категории
 * @param {boolean} quizData.isPublic - Публичный ли квиз
 * @param {number} quizData.timeLimit - Ограничение по времени в секундах
 * @returns {Promise<Object>} - Созданный квиз
 */
export const createQuiz = async (token, quizData) => {
  // Валидация данных
  if (!quizData.title || quizData.title.trim() === '') {
    throw new Error('Название квиза обязательно');
  }

  const payload = {
    title: quizData.title,
    description: quizData.description || '',
    categoryId: quizData.categoryId || null,
    isPublic: quizData.isPublic || false,
    timeLimit: quizData.timeLimit || null
  };

  try {
    const response = await apiClient.post('/Quiz', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Квиз успешно создан:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ошибка при создании квиза:', error);
    
    if (error.response?.status === 400) {
      const errorMessage = error.response.data || 'Неверные данные для создания квиза';
      throw new Error(errorMessage);
    }
    
    if (error.response?.status === 401) {
      throw new Error('Ошибка авторизации. Пожалуйста, войдите снова.');
    }
    
    throw error;
  }
};

/**
 * Получает квиз по его ID
 * @param {number} id - ID квиза
 * @returns {Promise<Object>} - Объект квиза
 */
export const getQuizById = async (id) => {
  if (!id || id <= 0) {
    throw new Error('Неверный ID квиза');
  }

  try {
    const response = await apiClient.get(`/Quiz/${id}`);
    console.log(`Получен квиз с ID ${id}:`, response.data);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.warn(`Квиз с ID ${id} не найден`);
      throw new Error(`Квиз с ID ${id} не найден`);
    }
    console.error(`Ошибка при получении квиза ${id}:`, error);
    throw error;
  }
};

/**
 * Удаляет квиз по ID
 * @param {number} id - ID квиза для удаления
 * @returns {Promise<string>} - Сообщение об успешном удалении
 */
export const deleteQuiz = async (token, id) => {
  if (!id || id <= 0) {
    throw new Error('Неверный ID квиза для удаления');
  }

  try {
    const response = await apiClient.delete(`/Quiz/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`Квиз с ID ${id} успешно удален`);
    return response.data || 'Квиз успешно удален';
  } catch (error) {
    console.error(`Ошибка при удалении квиза ${id}:`, error);
    
    if (error.response?.status === 404) {
      throw new Error(`Квиз с ID ${id} не найден`);
    }
    
    if (error.response?.status === 403) {
      throw new Error('У вас нет прав для удаления этого квиза');
    }
    
    if (error.response?.status === 401) {
      throw new Error('Ошибка авторизации');
    }
    
    throw error;
  }
};

/**
 * Обновляет существующий квиз
 * @param {number} id - ID квиза
 * @param {Object} updates - Обновления для квиза
 * @returns {Promise<string>} - Сообщение об успешном обновлении
 */
export const updateQuiz = async (token, id, updates) => {

  try {
    const response = await apiClient.put(`/Quiz/${id}`, updates, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`Квиз с ID ${id} успешно обновлен`);
    return response.data || 'Квиз успешно обновлен';
  } catch (error) {
    console.error(`Ошибка при обновлении квиза ${id}:`, error);
    
    if (error.response?.status === 404) {
      throw new Error(`Квиз с ID ${id} не найден`);
    }
    
    if (error.response?.status === 403) {
      throw new Error('У вас нет прав для обновления этого квиза');
    }
    
    throw error;
  }
};




// Добавьте эти функции в существующий файл quizMethods.jsx

/**
 * Получает вопросы для квиза
 * @param {number} quizId - ID квиза
 * @param {string} accessKey - Ключ доступа для приватных квизов
 * @returns {Promise<Array>} - Массив вопросов
 */
export const getQuizQuestions = async (quizId, accessKey = null) => {
  try {
    const params = {};
    if (accessKey) {
      params.accessKey = accessKey;
    }
    
    const response = await apiClient.get(`/quiz/${quizId}/questions`, { params });
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении вопросов квиза ${quizId}:`, error);
    throw error;
  }
};

/**
 * Подключается к квизу по коду доступа
 * @param {string} code - Код доступа (5 символов)
 * @returns {Promise<Object>} - Информация о квизе
 */
export const connectToQuizByCode = async (code) => {
  try {
    const response = await apiClient.get(`/quiz/connect/${code}`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при подключении к квизу по коду ${code}:`, error);
    throw error;
  }
};




/**
 * Получает вопросы для квиза с детальной информацией
 */
export const getQuizQuestionsDetailed = async (quizId, accessKey = null) => {
  try {
    const params = {};
    if (accessKey) {
      params.accessKey = accessKey;
    }
    
    const response = await apiClient.get(`/quiz/${quizId}/questions`, { params });
    
    // Проверяем структуру ответа
    console.log('Структура вопросов:', response.data);
    
    // Если опции не имеют ID, добавляем их
    const questions = response.data.map(question => ({
      ...question,
      options: question.options?.map((option, index) => ({
        ...option,
        id: option.id || `temp_${question.id}_${index}` // Временный ID если нет
      })) || []
    }));
    
    return questions;
  } catch (error) {
    console.error(`Ошибка при получении вопросов квиза ${quizId}:`, error);
    throw error;
  }
};

/**
 * Получает квизы пользователя
 * @param {string} token - Токен авторизации
 * @returns {Promise<Array>} - Массив квизов пользователя
 */
export const getUserQuizzes = async (token) => {
  if (!token) {
    throw new Error('Токен авторизации обязателен');
  }

  try {
    // Пробуем несколько вариантов эндпоинтов
    const endpoints = ['/Quiz/user', '/Quiz/my', '/Quiz/byUser'];
    let lastError = null;

    for (const endpoint of endpoints) {
      try {
        const response = await apiClient.get(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log(`Успешно получены квизы через ${endpoint}:`, response.data);
        return response.data;
      } catch (err) {
        lastError = err;
        console.log(`Эндпоинт ${endpoint} не сработал:`, err.response?.status, err.response?.data);
        // Если это не 400 или 404, прекращаем попытки
        if (err.response?.status !== 400 && err.response?.status !== 404) {
          throw err;
        }
      }
    }

    // Если все эндпоинты вернули ошибку, пробуем получить userId и использовать его
    if (lastError?.response?.status === 400) {
      try {
        const userId = GetUserIdFromJWT(token);
        
        if (userId) {
          console.log(`Пробуем получить квизы через userId: ${userId}`);
          // Пробуем получить все квизы и отфильтровать на клиенте
          const allQuizzes = await getAllQuizzes();
          // Фильтруем квизы по userId (предполагая, что в объекте квиза есть поле creatorId или userId)
          const userQuizzes = allQuizzes.filter(quiz => 
            quiz.userId === userId || 
            quiz.creatorId === userId || 
            quiz.authorId === userId
          );
          console.log('Отфильтрованные квизы пользователя:', userQuizzes);
          return userQuizzes;
        }
      } catch (filterError) {
        console.error('Ошибка при фильтрации квизов:', filterError);
      }
    }

    // Если ничего не помогло, выбрасываем последнюю ошибку
    console.error('Ошибка при получении квизов пользователя:', lastError);
    if (lastError.response?.data) {
      console.error('Данные ошибки от сервера:', lastError.response.data);
    }
    throw lastError;
  } catch (error) {
    console.error('Ошибка при получении квизов пользователя:', error);
    throw error;
  }
};