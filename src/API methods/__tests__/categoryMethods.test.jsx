/**
 * ЭТОТ ТЕСТ ТРЕБУЕТ РАБОТОСПОСОБНОГО API СЕРВЕРА
 * Эти тесты можно запускать отдельно, когда нужно протестировать
 * реальное взаимодействие с API
 */

import { getAllCategories, getCategoryById, getQuizzesByCategory } from '../categoryMethods';
import apiClient from '../.APIclient';

// Только для интеграционных тестов - не мокаем apiClient
describe('categoryMethods Integration Tests (требует реального API)', () => {
  // Эти тесты пропускаются по умолчанию, их нужно запускать явно
  const runIntegrationTests = process.env.RUN_INTEGRATION_TESTS === 'true';

  // Вспомогательная функция для пропуска тестов
  const testIf = (condition) => condition ? test : test.skip;

  beforeAll(() => {
    // Настраиваем таймауты для реальных запросов
    jest.setTimeout(10000);
  });

  testIf(runIntegrationTests)('реальное получение категорий с сервера', async () => {
    // Отключаем моки для этого теста
    jest.unmock('../.APIclient');
    
    try {
      const categories = await getAllCategories();
      
      // Проверяем базовые ожидания
      expect(Array.isArray(categories)).toBe(true);
      
      if (categories.length > 0) {
        // Проверяем структуру категории
        const firstCategory = categories[0];
        expect(firstCategory).toHaveProperty('categoryType');
        expect(firstCategory).toHaveProperty('name');
        
        // Проверяем типы
        expect(typeof firstCategory.categoryType).toBe('number');
        expect(typeof firstCategory.name).toBe('string');
      }
      
      // Логи должны работать
      expect(console.log).toHaveBeenCalled();
    } finally {
      // Восстанавливаем мок
      jest.mock('../.APIclient');
    }
  });

  testIf(runIntegrationTests)('реальное получение категории по ID', async () => {
    jest.unmock('../.APIclient');
    
    try {
      // Сначала получаем все категории, чтобы узнать существующие ID
      const categories = await getAllCategories();
      
      if (categories.length > 0) {
        const testCategory = categories[0];
        const category = await getCategoryById(testCategory.categoryType);
        
        expect(category).toBeDefined();
        expect(category.categoryType).toBe(testCategory.categoryType);
        expect(category.name).toBe(testCategory.name);
      }
    } finally {
      jest.mock('../.APIclient');
    }
  });

  testIf(runIntegrationTests)('реальное получение квизов по категории', async () => {
    jest.unmock('../.APIclient');
    
    try {
      // Получаем категории
      const categories = await getAllCategories();
      
      if (categories.length > 0) {
        const testCategory = categories[0];
        const quizzes = await getQuizzesByCategory(testCategory.name);
        
        expect(Array.isArray(quizzes)).toBe(true);
        
        if (quizzes.length > 0) {
          // Проверяем структуру квиза
          const firstQuiz = quizzes[0];
          expect(firstQuiz).toHaveProperty('id');
          expect(firstQuiz).toHaveProperty('title');
        }
      }
    } finally {
      jest.mock('../.APIclient');
    }
  });

  testIf(runIntegrationTests)('обработка несуществующей категории', async () => {
    jest.unmock('../.APIclient');
    
    try {
      // Пытаемся получить несуществующую категорию
      await expect(getCategoryById(999999)).rejects.toThrow();
      
      // Пытаемся получить квизы по несуществующей категории
      await expect(getQuizzesByCategory('NonExistentCategory123')).rejects.toThrow();
    } finally {
      jest.mock('../.APIclient');
    }
  });
});