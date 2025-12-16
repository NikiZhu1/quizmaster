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

// /**
//  * Завершает попытку прохождения квиза
//  * @param {number} attemptId - ID попытки
//  * @param {Array} answers - Массив ответов в формате {questionId, selectedOptionIds}
//  * @returns {Promise<Object>} - Результат попытки
//  */
// export const finishAttempt = async (attemptId, answers) => {
//   const token = Cookies.get('token');
  
//   // Логируем данные перед отправкой
//   console.log('Отправка данных на сервер:');
//   console.log('- attemptId:', attemptId);
//   console.log('- answers:', answers);
  
//   try {
//     const response = await apiClient.post(`/Attempt/${attemptId}/stop`, {
//       answers: answers
//     }, {
//       headers: token ? { Authorization: `Bearer ${token}` } : {}
//     });
    
//     console.log('Ответ от сервера:', response.data);
//     return response.data;
//   } catch (error) {
//     console.error(`Ошибка при завершении попытки ${attemptId}:`, error);
    
//     // Детальная информация об ошибке
//     if (error.response) {
//       console.error('Статус:', error.response.status);
//       console.error('Данные ошибки:', error.response.data);
//     }
    
//     throw error;
//   }
// };
// API methods/attemptMethods.jsx

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
  console.log('- answers:', JSON.stringify(answers, null, 2));
  
  // Форматируем ответы: для вопросов с одиночным выбором берем первый элемент массива
  const formattedAnswers = answers.map(answer => {
    const isSingleChoice = answer.selectedOptionIds.length <= 1; // или проверяйте тип вопроса
    return {
      questionId: answer.questionId,
      selectedOptionIds: answer.selectedOptionIds
    };
  });
  
  console.log('Форматированные ответы для отправки:', JSON.stringify(formattedAnswers, null, 2));
  
  try {
    const response = await apiClient.post(`/Attempt/${attemptId}/stop`, {
      answers: formattedAnswers
    }, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    
    console.log('Ответ от сервера:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при завершении попытки ${attemptId}:`, error);
    
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

// /**
//  * Получает ответы для конкретной попытки
//  * @param {number} attemptId - ID попытки
//  * @param {Object} attemptData - Опциональные данные попытки (для использования userId/guestSessionId из попытки)
//  * @returns {Promise<Array>} - Массив ответов с информацией о правильности
//  */
// export const getAttemptAnswers = async (attemptId, attemptData = null) => {
//   const token = Cookies.get('token');
//   const guestSessionId = Cookies.get('guestSessionId');

//   const config = {};
//   const params = {};

//   // Определяем guestSessionId: приоритет - из данных попытки, затем из cookies
//   const sessionId = attemptData?.guestSessionId || guestSessionId;

//   // Если есть токен, добавляем заголовок авторизации
//   if (token) {
//     config.headers = {
//       Authorization: `Bearer ${token}`
//     };
    
//     // Если есть userId в данных попытки, используем его
//     // Иначе пытаемся извлечь из токена
//     if (attemptData?.userId) {
//       params.userId = attemptData.userId;
//     } else {
//       const userId = GetUserIdFromJWT(token);
//       if (userId) {
//         params.userId = userId;
//       }
//     }
//   }

//   // Если нет userId, но есть guestSessionId, используем его
//   if (!params.userId && sessionId) {
//     params.guestSessionId = sessionId;
//   }

//   // Добавляем params только если они есть
//   if (Object.keys(params).length > 0) {
//     config.params = params;
//   }

//   try {
//     const response = await apiClient.get(`/attempt/${attemptId}/answers`, config);
//     return response.data;
//   } catch (error) {
//     console.error(`Ошибка при получении ответов попытки ${attemptId}:`, error);
//     throw error;
//   }
// };
// API methods/attemptMethods.jsx

/**
 * Получает ответы для конкретной попытки
 * @param {number} attemptId - ID попытки
 * @param {Object} attemptData - Опциональные данные попытки
 * @returns {Promise<Array>} - Массив ответов, сгруппированных по questionId
 */
export const getAttemptAnswers = async (attemptId, attemptData = null) => {
  const token = Cookies.get('token');
  const guestSessionId = Cookies.get('guestSessionId');

  const config = {};
  const params = {};

  // Определяем guestSessionId: приоритет - из данных попытки, затем из cookies
  const sessionId = attemptData?.guestSessionId || guestSessionId;

  // Если есть токен, добавляем заголовок авторизации
  if (token) {
    config.headers = {
      Authorization: `Bearer ${token}`
    };
  }

  // Если нет токена, но есть guestSessionId, используем его
  if (!token && sessionId) {
    params.guestSessionId = sessionId;
  }

  // Добавляем params только если они есть
  if (Object.keys(params).length > 0) {
    config.params = params;
  }

  try {
    const response = await apiClient.get(`/attempt/${attemptId}/answers`, config);
    
    // Группируем ответы по questionId для вопросов с множественным выбором
    const answersByQuestionId = {};
    
    response.data.forEach(answer => {
      const questionId = answer.questionId;
      
      if (!answersByQuestionId[questionId]) {
        answersByQuestionId[questionId] = {
          questionId: questionId,
          selectedOptionIds: [],
          isCorrect: true, // Изначально считаем правильным
          answers: [] // Сохраняем все объекты ответов для дебага
        };
      }
      
      answersByQuestionId[questionId].selectedOptionIds.push(answer.chosenOptionId);
      answersByQuestionId[questionId].answers.push(answer);
      
      // Если хотя бы один ответ неправильный, помечаем весь ответ как неправильный
      if (!answer.isCorrect) {
        answersByQuestionId[questionId].isCorrect = false;
      }
    });
    
    // Конвертируем обратно в массив
    const groupedAnswers = Object.values(answersByQuestionId);
    
    console.log('Сгруппированные ответы:', groupedAnswers);
    
    // Возвращаем и сгруппированные, и исходные данные для обратной совместимости
    return {
      grouped: groupedAnswers,
      raw: response.data
    };
    
  } catch (error) {
    console.error(`Ошибка при получении ответов попытки ${attemptId}:`, error);
    
    // Если ошибка 403 и есть guestSessionId, пробуем без авторизации
    if (error.response?.status === 403 && sessionId) {
      console.log('Пробуем с guestSessionId без авторизации...');
      
      try {
        const guestResponse = await apiClient.get(`/attempt/${attemptId}/answers`, {
          params: { guestSessionId: sessionId }
        });
        
        // Группируем аналогично
        const answersByQuestionId = {};
        
        guestResponse.data.forEach(answer => {
          const questionId = answer.questionId;
          
          if (!answersByQuestionId[questionId]) {
            answersByQuestionId[questionId] = {
              questionId: questionId,
              selectedOptionIds: [],
              isCorrect: true,
              answers: []
            };
          }
          
          answersByQuestionId[questionId].selectedOptionIds.push(answer.chosenOptionId);
          answersByQuestionId[questionId].answers.push(answer);
          
          if (!answer.isCorrect) {
            answersByQuestionId[questionId].isCorrect = false;
          }
        });
        
        const groupedAnswers = Object.values(answersByQuestionId);
        
        return {
          grouped: groupedAnswers,
          raw: guestResponse.data
        };
        
      } catch (guestError) {
        console.error('Ошибка при получении ответов через guestSessionId:', guestError);
        throw guestError;
      }
    }
    
    throw error;
  }
};

/**
 * Получает все попытки пользователя
 * @returns {Promise<Array>} - Массив попыток пользователя
 */
export const getUserAttempts = async (userId) => {
  const token = Cookies.get('token');
  
  if (!token) {
    throw new Error('Токен авторизации обязателен');
  }

  try {
    const response = await apiClient.get(`/User/${userId}/attempts`, {
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

// Добавьте в конец файла API methods/attemptMethods.jsx

/**
 * Получает лидерборд для квиза
 * @param {number} quizId - ID квиза
 * @param {string} guestSessionId - ID гостевой сессии (опционально)
 * @returns {Promise<Array>} - Массив лучших попыток
 */
export const getLeaderboard = async (quizId, guestSessionId = null) => {
    const token = Cookies.get('token');
    const config = {};
    const params = {};

    // Если есть токен, добавляем заголовок авторизации
    if (token) {
        config.headers = {
            Authorization: `Bearer ${token}`
        };
    }

    // Если передали guestSessionId или есть в cookies
    const sessionId = guestSessionId || Cookies.get('guestSessionId');
    if (sessionId) {
        params.guestSessionId = sessionId;
    }

    // Добавляем params если есть
    if (Object.keys(params).length > 0) {
        config.params = params;
    }

    try {
        const response = await apiClient.get(`/Attempt/quiz/${quizId}/leaderboard`, config);
        
        // Преобразуем данные в удобный формат
        const leaderboardData = Array.isArray(response.data) ? response.data : [];
        
        return leaderboardData.map((item, index) => ({
            id: item.id || index,
            position: index + 1,
            userId: item.userId,
            userName: item.userName || item.username || `Участник ${index + 1}`,
            score: item.score || item.percentage || 0,
            timeTaken: item.timeTaken || item.duration || "00:00:00",
            completedAt: item.completedAt || item.finishedAt || new Date().toISOString()
        }));
        
    } catch (error) {
        console.error(`Ошибка при получении лидерборда для квиза ${quizId}:`, error);
        
        // Если ошибка авторизации и есть guestSessionId, пробуем без авторизации
        if ((error.response?.status === 401 || error.response?.status === 403) && sessionId) {
            try {
                const guestResponse = await apiClient.get(`/Attempt/quiz/${quizId}/leaderboard`, {
                    params: { guestSessionId: sessionId }
                });
                
                const guestData = Array.isArray(guestResponse.data) ? guestResponse.data : [];
                return guestData.map((item, index) => ({
                    id: item.id || index,
                    position: index + 1,
                    userId: item.userId,
                    userName: item.userName || item.username || `Участник ${index + 1}`,
                    score: item.score || item.percentage || 0,
                    timeTaken: item.timeTaken || item.duration || "00:00:00",
                    completedAt: item.completedAt || item.finishedAt || new Date().toISOString()
                }));
                
            } catch (guestError) {
                console.error('Ошибка при получении лидерборда через guestSessionId:', guestError);
                return []; // Возвращаем пустой массив при ошибке
            }
        }
        
        return []; // Возвращаем пустой массив при ошибке
    }
};


// // Добавим в конец файла attemptMethods.jsx (или после других методов)
// /**
//  * Получает лидерборд для квиза
//  * @param {number} quizId - ID квиза
//  * @param {string} guestSessionId - ID гостевой сессии (опционально)
//  * @returns {Promise<Array>} - Массив лучших попыток
//  */
// export const getLeaderboard = async (quizId, guestSessionId = null) => {
//     const token = Cookies.get('token');
//     const config = {};
//     const params = {};

//     // Если есть токен, добавляем заголовок авторизации
//     if (token) {
//         config.headers = {
//             Authorization: `Bearer ${token}`
//         };
//     }

//     // Если передали guestSessionId или есть в cookies
//     const sessionId = guestSessionId || Cookies.get('guestSessionId');
//     if (sessionId) {
//         params.guestSessionId = sessionId;
//     }

//     // Добавляем params если есть
//     if (Object.keys(params).length > 0) {
//         config.params = params;
//     }

//     try {
//         const response = await apiClient.get(`/Attempt/quiz/${quizId}/leaderboard`, config);
        
//         // Преобразуем данные в нужный формат
//         const leaderboardData = response.data || [];
        
//         return leaderboardData.map((item, index) => ({
//             id: item.attemptId || index,
//             userId: item.userId,
//             userName: item.userName || `Игрок ${index + 1}`,
//             score: Math.round(item.scorePercentage || 0),
//             timeTaken: item.timeTaken || '00:00:00',
//             completedAt: item.completedAt || new Date().toISOString(),
//             position: index + 1
//         }));
//     } catch (error) {
//         console.error(`Ошибка при получении лидерборда для квиза ${quizId}:`, error);
        
//         // Если ошибка авторизации и есть guestSessionId, пробуем без авторизации
//         if (error.response?.status === 401 && sessionId) {
//             try {
//                 const guestResponse = await apiClient.get(`/Attempt/quiz/${quizId}/leaderboard`, {
//                     params: { guestSessionId: sessionId }
//                 });
                
//                 const guestLeaderboardData = guestResponse.data || [];
//                 return guestLeaderboardData.map((item, index) => ({
//                     id: item.attemptId || index,
//                     userId: item.userId,
//                     userName: item.userName || `Гость ${index + 1}`,
//                     score: Math.round(item.scorePercentage || 0),
//                     timeTaken: item.timeTaken || '00:00:00',
//                     completedAt: item.completedAt || new Date().toISOString(),
//                     position: index + 1
//                 }));
//             } catch (guestError) {
//                 console.error('Ошибка при получении лидерборда через guestSessionId:', guestError);
//                 return [];
//             }
//         }
        
//         // Если API не реализовано, возвращаем тестовые данные
//         console.log('Используем тестовые данные для лидерборда');
//         return getMockLeaderboardData();
//     }
// };

// // Функция для тестовых данных (можно удалить когда API будет готово)
// const getMockLeaderboardData = () => {
//     return [
//         {
//             id: 1,
//             userId: 101,
//             userName: 'Алексей',
//             score: 95,
//             timeTaken: '00:05:32',
//             completedAt: '2024-01-15T14:30:00Z',
//             position: 1
//         },
//         {
//             id: 2,
//             userId: 102,
//             userName: 'Мария',
//             score: 88,
//             timeTaken: '00:06:15',
//             completedAt: '2024-01-15T15:20:00Z',
//             position: 2
//         },
//         {
//             id: 3,
//             userId: 103,
//             userName: 'Иван',
//             score: 82,
//             timeTaken: '00:07:48',
//             completedAt: '2024-01-14T10:15:00Z',
//             position: 3
//         },
//         {
//             id: 4,
//             userId: 104,
//             userName: 'Ольга',
//             score: 78,
//             timeTaken: '00:08:22',
//             completedAt: '2024-01-13T16:45:00Z',
//             position: 4
//         },
//         {
//             id: 5,
//             userId: 105,
//             userName: 'Дмитрий',
//             score: 72,
//             timeTaken: '00:09:10',
//             completedAt: '2024-01-12T11:30:00Z',
//             position: 5
//         }
//     ];
// };