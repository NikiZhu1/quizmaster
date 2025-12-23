import {
  getQuizStatistics,
  getAttemptAnswersForAnalysis,
  getQuestionDetails
} from '../statisticsMethods';
import apiClient from '../.APIclient';
import Cookies from 'js-cookie';

jest.mock('../.APIclient');
jest.mock('js-cookie');

describe('statisticsMethods Edge Cases', () => {
  const mockToken = 'test-token';
  const mockQuizId = 123;
  const mockAttemptId = 456;
  const mockQuestionId = 789;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Edge Cases для getQuizStatistics', () => {
    test('обрабатывает строковый quizId', async () => {
      const stringQuizId = '123';
      Cookies.get.mockReturnValue(mockToken);
      apiClient.get.mockResolvedValue({ data: [] });

      const result = await getQuizStatistics(stringQuizId);

      expect(result).toEqual([]);
      // API должен получить строку как есть
      expect(apiClient.get).toHaveBeenCalledWith(
        `/Quiz/${stringQuizId}/attempts`,
        expect.any(Object)
      );
    });

    test('обрабатывает null quizId', async () => {
      Cookies.get.mockReturnValue(mockToken);
      apiClient.get.mockResolvedValue({ data: [] });

      const result = await getQuizStatistics(null);

      expect(result).toEqual([]);
      expect(apiClient.get).toHaveBeenCalledWith(
        '/Quiz/null/attempts',
        expect.any(Object)
      );
    });

    test('обрабатывает undefined quizId', async () => {
      Cookies.get.mockReturnValue(mockToken);
      apiClient.get.mockResolvedValue({ data: [] });

      const result = await getQuizStatistics(undefined);

      expect(result).toEqual([]);
      expect(apiClient.get).toHaveBeenCalledWith(
        '/Quiz/undefined/attempts',
        expect.any(Object)
      );
    });

    test('обрабатывает неожиданную структуру ответа сервера', async () => {
      Cookies.get.mockReturnValue(mockToken);
      // Сервер вернул неожиданную структуру
      apiClient.get.mockResolvedValue({ 
        data: {
          attempts: [],
          total: 0
        }
      });

      const result = await getQuizStatistics(mockQuizId);

      // Возвращает то, что пришло с сервера
      expect(result).toEqual({
        attempts: [],
        total: 0
      });
    });
  });

  describe('Edge Cases для getAttemptAnswersForAnalysis', () => {
    test('обрабатывает строковый attemptId', async () => {
      const stringAttemptId = '456';
      Cookies.get.mockReturnValue(mockToken);
      apiClient.get.mockResolvedValue({ data: [] });

      const result = await getAttemptAnswersForAnalysis(stringAttemptId);

      expect(result).toEqual([]);
      expect(apiClient.get).toHaveBeenCalledWith(
        `/Attempt/${stringAttemptId}/answers`,
        expect.any(Object)
      );
    });

    test('обрабатывает null attemptId', async () => {
      Cookies.get.mockReturnValue(mockToken);
      apiClient.get.mockResolvedValue({ data: [] });

      const result = await getAttemptAnswersForAnalysis(null);

      expect(result).toEqual([]);
      expect(apiClient.get).toHaveBeenCalledWith(
        '/Attempt/null/answers',
        expect.any(Object)
      );
    });

    test('обрабатывает undefined attemptId', async () => {
      Cookies.get.mockReturnValue(mockToken);
      apiClient.get.mockResolvedValue({ data: [] });

      const result = await getAttemptAnswersForAnalysis(undefined);

      expect(result).toEqual([]);
      expect(apiClient.get).toHaveBeenCalledWith(
        '/Attempt/undefined/answers',
        expect.any(Object)
      );
    });

    test('обрабатывает ответ сервера с некорректной data (не массив)', async () => {
      Cookies.get.mockReturnValue(mockToken);
      // Сервер вернул строку вместо массива
      apiClient.get.mockResolvedValue({ data: 'not-an-array' });

      const result = await getAttemptAnswersForAnalysis(mockAttemptId);

      // Возвращает строку как есть (логика в коде || [])
      expect(result).toBe('not-an-array');
    });
  });

  describe('Edge Cases для getQuestionDetails', () => {

    test('обрабатывает null questionId', async () => {
      const error = new Error('Invalid request');
      apiClient.get.mockRejectedValue(error);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(getQuestionDetails(null))
        .rejects
        .toThrow('Invalid request');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Ошибка при получении вопроса null:',
        error
      );
      
      consoleErrorSpy.mockRestore();
    });

    test('обрабатывает undefined questionId', async () => {
      const error = new Error('Invalid request');
      apiClient.get.mockRejectedValue(error);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(getQuestionDetails(undefined))
        .rejects
        .toThrow('Invalid request');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Ошибка при получении вопроса undefined:',
        error
      );
      
      consoleErrorSpy.mockRestore();
    });

    test('обрабатывает ответ сервера без свойства data', async () => {
      // Сервер вернул ответ без свойства data
      apiClient.get.mockResolvedValue({ status: 200, statusText: 'OK' });

      const result = await getQuestionDetails(mockQuestionId);

      // Возвращает undefined (результат response.data)
      expect(result).toBeUndefined();
    });

    test('обрабатывает пустой ответ сервера', async () => {
      // Сервер вернул пустой ответ
      apiClient.get.mockResolvedValue({});

      const result = await getQuestionDetails(mockQuestionId);

      expect(result).toBeUndefined();
    });
  });

  describe('Edge Cases для Cookies', () => {
    test('getQuizStatistics обрабатывает токен с пробелами', async () => {
      const tokenWithSpaces = '  token-with-spaces  ';
      Cookies.get.mockReturnValue(tokenWithSpaces);
      apiClient.get.mockResolvedValue({ data: [] });

      const result = await getQuizStatistics(mockQuizId);

      expect(result).toEqual([]);
      // Токен должен использоваться как есть, включая пробелы
      expect(apiClient.get).toHaveBeenCalledWith(
        `/Quiz/${mockQuizId}/attempts`,
        {
          headers: {
            'Authorization': `Bearer ${tokenWithSpaces}`
          }
        }
      );
    });

    test('getAttemptAnswersForAnalysis обрабатывает токен со специальными символами', async () => {
      const tokenWithSpecialChars = 'token.with.dots-and_dashes@123';
      Cookies.get.mockReturnValue(tokenWithSpecialChars);
      apiClient.get.mockResolvedValue({ data: [] });

      const result = await getAttemptAnswersForAnalysis(mockAttemptId);

      expect(result).toEqual([]);
      expect(apiClient.get).toHaveBeenCalledWith(
        `/Attempt/${mockAttemptId}/answers`,
        {
          headers: {
            'Authorization': `Bearer ${tokenWithSpecialChars}`
          }
        }
      );
    });

    test('getQuizStatistics бросает ошибку при токене равном 0', async () => {
      Cookies.get.mockReturnValue(0); // Число 0

      await expect(getQuizStatistics(mockQuizId))
        .rejects
        .toThrow('Требуется авторизация для получения статистики');
    });

    test('getAttemptAnswersForAnalysis бросает ошибку при токене равном false', async () => {
      Cookies.get.mockReturnValue(false); // Булево false

      await expect(getAttemptAnswersForAnalysis(mockAttemptId))
        .rejects
        .toThrow('Требуется авторизация');
    });
  });
});