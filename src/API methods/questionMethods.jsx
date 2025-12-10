import apiClient from './.APIclient';

/**
 * Получает вопрос по ID
 * @param {number} id - ID вопроса
 * @returns {Promise<Object>} - Объект вопроса с опциями
 */
export const getQuestionById = async (id) => {
  try {
    const response = await apiClient.get(`/Question/${id}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(`Вопрос с ID ${id} не найден`);
    }
    throw error;
  }
};

/**
 * Получает опцию по ID
 * @param {number} optionId - ID опции
 * @returns {Promise<Object>} - Объект опции
 */
export const getOptionById = async (optionId) => {
  try {
    const response = await apiClient.get(`/Question/option/${optionId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(`Опция с ID ${optionId} не найден`);
    }
    throw error;
  }
};

/**
 * Получает все опции для вопроса
 * @param {number} questionId - ID вопроса
 * @returns {Promise<Array>} - Массив опций
 */
export const getQuestionOptions = async (questionId) => {
  try {
    const response = await apiClient.get(`/Question/${questionId}/options`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении опций вопроса ${questionId}:`, error);
    return [];
  }
};

/**
 * Создает новый вопрос для квиза
 * @param {Object} questionData - Данные для создания вопроса
 * @param {string} questionData.text - Текст вопроса
 * @param {number} questionData.quizId - ID квиза
 * @param {number} questionData.type - Тип вопроса (0 - одиночный, 1 - множественный)
 * @param {Array} questionData.options - Массив опций
 * @returns {Promise<Object>} - Созданный вопрос
 */
export const createQuestion = async (questionData, token = null) => {
  // Валидация данных
  if (!questionData.text || questionData.text.trim() === '') {
    throw new Error('Текст вопроса обязателен');
  }
  
  if (!questionData.quizId) {
    throw new Error('ID квиза обязателен');
  }
  
  if (questionData.type !== 0 && questionData.type !== 1) {
    throw new Error('Тип вопроса должен быть 0 (одиночный) или 1 (множественный)');
  }
  
  if (!questionData.options || questionData.options.length < 2) {
    throw new Error('Вопрос должен содержать минимум 2 варианта ответа');
  }
  
  const payload = {
    text: questionData.text,
    quizId: questionData.quizId,
    type: questionData.type,
    options: questionData.options.map(option => ({
      text: option.text,
      isCorrect: option.isCorrect || false
    }))
  };

  try {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await apiClient.post('/Question', payload, { headers });
    console.log('Вопрос успешно создан:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ошибка при создании вопроса:', error);
    
    if (error.response?.status === 403) {
      throw new Error('У вас нет прав на создание вопросов в этом квизе');
    }
    
    if (error.response?.status === 400) {
      const errorMsg = error.response.data?.error || error.response.data?.message || 'Неверные данные для создания вопроса';
      throw new Error(errorMsg);
    }
    
    if (error.response?.status === 401) {
      throw new Error('Ошибка авторизации. Пожалуйста, войдите снова.');
    }
    
    throw error;
  }
};

/**
 * Создает опцию для вопроса
 * @param {number} questionId - ID вопроса
 * @param {Object} optionData - Данные опции
 * @param {string} optionData.text - Текст опции
 * @param {boolean} optionData.isCorrect - Правильный ли ответ
 * @returns {Promise<Object>} - Созданная опция
 */
export const createOption = async (questionId, optionData) => {
  if (!optionData.text || optionData.text.trim() === '') {
    throw new Error('Текст опции обязателен');
  }

  const payload = {
    text: optionData.text,
    isCorrect: optionData.isCorrect || false
  };

  try {
    const response = await apiClient.post(`/Question/${questionId}/option`, payload);
    console.log(`Опция создана для вопроса ${questionId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при создании опции для вопроса ${questionId}:`, error);
    
    if (error.response?.status === 403) {
      throw new Error('У вас нет прав на добавление опций к этому вопросу');
    }
    
    if (error.response?.status === 404) {
      throw new Error(`Вопрос с ID ${questionId} не найден`);
    }
    
    throw error;
  }
};

/**
 * Обновляет существующий вопрос
 * @param {number} id - ID вопроса
 * @param {Object} updates - Обновления для вопроса
 * @param {string} updates.text - Новый текст вопроса (опционально)
 * @param {number} updates.type - Новый тип вопроса (опционально)
 * @param {Array} updates.options - Новые опции (опционально)
 * @returns {Promise<Object>} - Обновленный вопрос
 */
export const updateQuestion = async (id, updates) => {
  const payload = {};
  
  if (updates.text !== undefined) {
    payload.text = updates.text;
  }
  
  if (updates.type !== undefined) {
    if (updates.type !== 0 && updates.type !== 1) {
      throw new Error('Тип вопроса должен быть 0 (одиночный) или 1 (множественный)');
    }
    payload.type = updates.type;
  }
  
  if (updates.options !== undefined) {
    payload.options = updates.options.map(option => ({
      text: option.text,
      isCorrect: option.isCorrect || false
    }));
  }

  try {
    const response = await apiClient.put(`/Question/${id}`, payload);
    console.log(`Вопрос ${id} успешно обновлен:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при обновлении вопроса ${id}:`, error);
    
    if (error.response?.status === 403) {
      throw new Error('У вас нет прав на редактирование этого вопроса');
    }
    
    if (error.response?.status === 404) {
      throw new Error(`Вопрос с ID ${id} не найден`);
    }
    
    throw error;
  }
};

/**
 * Обновляет опцию
 * @param {number} id - ID опции
 * @param {Object} updates - Обновления для опции
 * @param {string} updates.text - Новый текст опции
 * @param {boolean} updates.isCorrect - Является ли правильным ответом
 * @returns {Promise<string>} - Сообщение об успешном обновлении
 */
export const updateOption = async (id, updates) => {
  const payload = {};
  
  if (updates.text !== undefined) {
    if (updates.text.trim() === '') {
      throw new Error('Текст опции не может быть пустым');
    }
    payload.text = updates.text;
  }
  
  if (updates.isCorrect !== undefined) {
    payload.isCorrect = updates.isCorrect;
  }

  try {
    const response = await apiClient.put(`/Question/option/${id}`, payload);
    console.log(`Опция ${id} успешно обновлена`);
    return response.data || 'Опция успешно обновлена';
  } catch (error) {
    console.error(`Ошибка при обновлении опции ${id}:`, error);
    
    if (error.response?.status === 403) {
      throw new Error('У вас нет прав на редактирование этой опции');
    }
    
    if (error.response?.status === 404) {
      throw new Error(`Опция с ID ${id} не найден`);
    }
    
    throw error;
  }
};

/**
 * Удаляет вопрос по ID
 * @param {number} id - ID вопроса для удаления
 * @returns {Promise<string>} - Сообщение об успешном удалении
 */
export const deleteQuestion = async (id) => {
  try {
    const response = await apiClient.delete(`/Question/${id}`);
    console.log(`Вопрос ${id} успешно удален`);
    return response.data || 'Вопрос успешно удален';
  } catch (error) {
    console.error(`Ошибка при удалении вопроса ${id}:`, error);
    
    if (error.response?.status === 403) {
      throw new Error('У вас нет прав на удаление этого вопроса');
    }
    
    if (error.response?.status === 404) {
      throw new Error(`Вопрос с ID ${id} не найден`);
    }
    
    throw error;
  }
};

/**
 * Удаляет опцию по ID
 * @param {number} id - ID опции для удаления
 * @returns {Promise<string>} - Сообщение об успешном удалении
 */
export const deleteOption = async (id) => {
  try {
    const response = await apiClient.delete(`/Question/option/${id}`);
    console.log(`Опция ${id} успешно удалена`);
    return response.data || 'Опция успешно удалена';
  } catch (error) {
    console.error(`Ошибка при удалении опции ${id}:`, error);
    
    if (error.response?.status === 403) {
      throw new Error('У вас нет прав на удаление этой опции');
    }
    
    if (error.response?.status === 404) {
      throw new Error(`Опция с ID ${id} не найден`);
    }
    
    throw error;
  }
};

