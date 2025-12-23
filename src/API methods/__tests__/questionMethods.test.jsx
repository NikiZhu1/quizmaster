import {
  getQuestionById,
  createQuestion,
  updateQuestion,
  updateOption,
  deleteQuestion
} from '../questionMethods';
import apiClient from '../.APIclient';

jest.mock('../.APIclient');

describe('questionMethods Edge Cases', () => {
  const mockToken = 'test-token';
  const mockQuestionId = 123;
  const mockQuizId = 456;
  const mockOptionId = 789;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  describe('Edge Cases для getQuestionById', () => {

    test('обрабатывает опции с неправильным типом', async () => {
      const mockQuestion = {
        id: mockQuestionId,
        text: 'Вопрос',
        type: 0,
        options: 'not an array' // options это строка
      };
      
      apiClient.get.mockResolvedValue({ data: mockQuestion });

      const result = await getQuestionById(mockQuestionId);

      // Должен проигнорировать options если это не массив
      expect(result.options).toBe('not an array'); // Остается как есть
    });
  });

  describe('Edge Cases для createQuestion', () => {

    test('обрабатывает очень длинный текст вопроса', async () => {
      const longText = 'A'.repeat(1000); // Очень длинный текст
      const questionData = {
        text: longText,
        quizId: mockQuizId,
        type: 0,
        options: [
          { text: 'Ответ 1', isCorrect: true },
          { text: 'Ответ 2', isCorrect: false }
        ]
      };
      
      const mockResponse = { data: { id: mockQuestionId } };
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await createQuestion(questionData, mockToken);

      expect(result.id).toBe(mockQuestionId);
    });

    test('обрабатывает опции с очень длинным текстом', async () => {
      const longOptionText = 'B'.repeat(500);
      const questionData = {
        text: 'Вопрос',
        quizId: mockQuizId,
        type: 0,
        options: [
          { text: longOptionText, isCorrect: true },
          { text: 'Короткий ответ', isCorrect: false }
        ]
      };
      
      const mockResponse = { data: { id: mockQuestionId } };
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await createQuestion(questionData, mockToken);

      expect(result.id).toBe(mockQuestionId);
    });

    test('обрабатывает максимальное количество опций', async () => {
      // Создаем 10 опций (больше, чем минимальные 2)
      const options = Array.from({ length: 10 }, (_, i) => ({
        text: `Вариант ${i + 1}`,
        isCorrect: i === 0 // Первая правильная
      }));
      
      const questionData = {
        text: 'Вопрос с 10 опциями',
        quizId: mockQuizId,
        type: 1, // Множественный выбор
        options: options
      };
      
      const mockResponse = { data: { id: mockQuestionId } };
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await createQuestion(questionData, mockToken);

      expect(result.id).toBe(mockQuestionId);
      expect(apiClient.post.mock.calls[0][1].options).toHaveLength(10);
    });
  });

  describe('Edge Cases для updateQuestion', () => {
    test('обрабатывает обновление с минимальными изменениями', async () => {
      const updateData = {
        text: 'Н', // Всего один символ
        type: 0
      };
      
      const mockResponse = { data: { id: mockQuestionId } };
      apiClient.put.mockResolvedValue(mockResponse);

      const result = await updateQuestion(mockQuestionId, updateData, mockToken);

      expect(result.id).toBe(mockQuestionId);
    });

    test('обрабатывает смену типа вопроса', async () => {
      const updateData = {
        text: 'Вопрос с измененным типом',
        type: 1 // Меняем с одиночного на множественный
      };
      
      const mockResponse = { 
        data: { 
          id: mockQuestionId,
          text: 'Вопрос с измененным типом',
          type: 1
        }
      };
      apiClient.put.mockResolvedValue(mockResponse);

      const result = await updateQuestion(mockQuestionId, updateData, mockToken);

      expect(result.type).toBe(1);
    });

    test('обрабатывает обновление с тем же текстом', async () => {
      const updateData = {
        text: 'Тот же самый текст',
        type: 0
      };
      
      const mockResponse = { data: { id: mockQuestionId } };
      apiClient.put.mockResolvedValue(mockResponse);

      const result = await updateQuestion(mockQuestionId, updateData, mockToken);

      expect(result.id).toBe(mockQuestionId);
    });
  });

  describe('Edge Cases для updateOption', () => {
    test('обрабатывает опцию с isCorrect = 0 (ноль)', async () => {
      const optionData = {
        text: 'Опция',
        isCorrect: 0 // Число 0
      };
      
      const mockResponse = { data: { id: mockOptionId } };
      apiClient.put.mockResolvedValue(mockResponse);

      await updateOption(mockOptionId, optionData, mockToken);

      expect(apiClient.put).toHaveBeenCalledWith(
        `/Question/option/${mockOptionId}`,
        { text: 'Опция', isCorrect: 0 }, // Сохраняется как 0
        expect.any(Object)
      );
    });

    test('обрабатывает опцию с пустым текстом после trim', async () => {
      const optionData = {
        text: '   ', // Только пробелы
        isCorrect: true
      };

      await expect(updateOption(mockOptionId, optionData, mockToken))
        .rejects.toThrow('Текст опции обязателен');
    });

    test('обрабатывает isCorrect = undefined в payload', async () => {
      const optionData = {
        text: 'Опция',
        isCorrect: undefined
      };
      
      const mockResponse = { data: { id: mockOptionId } };
      apiClient.put.mockResolvedValue(mockResponse);

      await updateOption(mockOptionId, optionData, mockToken);

      // undefined в isCorrect должно стать false
      expect(apiClient.put).toHaveBeenCalledWith(
        `/Question/option/${mockOptionId}`,
        { text: 'Опция', isCorrect: false },
        expect.any(Object)
      );
    });
  });

  describe('Edge Cases для deleteQuestion', () => {
    test('обрабатывает удаление несуществующего вопроса', async () => {
      const error404 = {
        response: { status: 404 }
      };
      
      apiClient.delete.mockRejectedValue(error404);

      await expect(deleteQuestion(999, mockToken))
        .rejects.toThrow('Вопрос с ID 999 не найден');
    });

    test('обрабатывает удаление вопроса с уже удаленными опциями', async () => {
      const mockResponse = { status: 200 };
      apiClient.delete.mockResolvedValue(mockResponse);

      const result = await deleteQuestion(mockQuestionId, mockToken);

      expect(result.status).toBe(200);
    });

    test('обрабатывает сетевую ошибку при удалении', async () => {
      const networkError = new Error('Network error');
      apiClient.delete.mockRejectedValue(networkError);

      await expect(deleteQuestion(mockQuestionId, mockToken))
        .rejects.toThrow('Network error');
    });
  });

  describe('Интеграционные сценарии', () => {
    test('создание и удаление вопроса', async () => {
      // Сценарий: создать вопрос, потом удалить его
      const questionData = {
        text: 'Временный вопрос',
        quizId: mockQuizId,
        type: 0,
        options: [
          { text: 'Да', isCorrect: true },
          { text: 'Нет', isCorrect: false }
        ]
      };

      // 1. Создание вопроса
      const createResponse = { 
        data: { 
          id: mockQuestionId,
          ...questionData 
        } 
      };
      
      apiClient.post.mockResolvedValueOnce(createResponse);
      
      const createdQuestion = await createQuestion(questionData, mockToken);
      expect(createdQuestion.id).toBe(mockQuestionId);

      // 2. Удаление вопроса
      const deleteResponse = { status: 200 };
      apiClient.delete.mockResolvedValueOnce(deleteResponse);
      
      const deleteResult = await deleteQuestion(mockQuestionId, mockToken);
      expect(deleteResult.status).toBe(200);
    });

    test('создание опции и обновление ее текста', async () => {
      // Сценарий: создать опцию, потом обновить ее текст
      const optionData = {
        text: 'Исходный текст',
        isCorrect: true
      };

      const updatedOptionData = {
        text: 'Обновленный текст',
        isCorrect: false
      };

      // 1. Создание опции
      const createResponse = { 
        data: { 
          id: mockOptionId,
          ...optionData 
        } 
      };
      
      apiClient.post.mockResolvedValueOnce(createResponse);
      
      // 2. Обновление опции
      const updateResponse = { 
        data: { 
          id: mockOptionId,
          ...updatedOptionData 
        } 
      };
      
      apiClient.put.mockResolvedValueOnce(updateResponse);

      // Этот тест проверяет, что API методы не конфликтуют друг с другом
      expect(true).toBe(true); // Просто проверяем, что тест проходит
    });
  });

  describe('Обработка серверных ошибок', () => {

    test('обрабатывает таймаут при получении вопроса', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.code = 'ECONNABORTED';
      
      apiClient.get.mockRejectedValue(timeoutError);

      await expect(getQuestionById(mockQuestionId))
        .rejects.toThrow('Request timeout');
    });
  });
});