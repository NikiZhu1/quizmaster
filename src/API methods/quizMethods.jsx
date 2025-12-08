import apiClient from './.APIclient';

/**
 * Получает все квизы с сервера
 * @returns {Promise<Array>} - Массив квизов
 */
export const getAllQuizzes = async () => {

  try {
    const response = await apiClient.get('/quiz');

    console.log('Полученные квизы:', response.data);
    return response.data;

  } catch (error) {
    console.error('Ошибка при получении квизов:', error);
    throw error;
  }
};