import {
  getCategoryName,
  getCategoryColor,
  getCategoryOriginalName,
  formatCategoriesFromApi,
  filterQuizzesByCategory,
} from '../categoryUtils';

describe('categoryUtils', () => {
  describe('getCategoryName', () => {
    test('возвращает правильное название для известной категории', () => {
      expect(getCategoryName(1)).toBe('Наука');
      expect(getCategoryName(7)).toBe('Технологии');
    });

    test('возвращает fallback для неизвестной категории', () => {
      expect(getCategoryName(999)).toBe('Категория 999');
    });

    test('обрабатывает null и undefined', () => {
      expect(getCategoryName(null)).toBe('Неизвестная категория');
      expect(getCategoryName(undefined)).toBe('Неизвестная категория');
    });
  });

  describe('getCategoryColor', () => {
    test('возвращает правильный цвет для категории', () => {
      expect(getCategoryColor(0)).toBe('green');
      expect(getCategoryColor(5)).toBe('red');
    });

    test('возвращает "default" для неизвестной категории', () => {
      expect(getCategoryColor(999)).toBe('default');
    });
  });

  describe('filterQuizzesByCategory', () => {
    const mockQuizzes = [
      { id: 1, title: 'Квиз 1', category: 1 },
      { id: 2, title: 'Квиз 2', category: 2 },
      { id: 3, title: 'Квиз 3', category: 1 },
      { id: 4, title: 'Квиз 4', category: null },
    ];

    test('фильтрует квизы по категории', () => {
      const filtered = filterQuizzesByCategory(mockQuizzes, 1);
      expect(filtered).toHaveLength(2);
      expect(filtered.map(q => q.id)).toEqual([1, 3]);
    });

    test('возвращает все квизы при null категории', () => {
      const filtered = filterQuizzesByCategory(mockQuizzes, null);
      expect(filtered).toHaveLength(4);
    });

    test('возвращает пустой массив при отсутствии квизов в категории', () => {
      const filtered = filterQuizzesByCategory(mockQuizzes, 999);
      expect(filtered).toHaveLength(0);
    });
  });

  describe('formatCategoriesFromApi', () => {
    test('преобразует данные API в нужный формат', () => {
      const apiData = [
        { categoryType: 1, name: 'Science' },
        { categoryType: 7, name: 'Technology' },
      ];

      const result = formatCategoriesFromApi(apiData);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        categoryType: 1,
        name: 'Science',
        displayName: 'Наука',
        color: 'blue',
        originalName: 'Science',
      });
    });

    test('обрабатывает пустой массив', () => {
      expect(formatCategoriesFromApi([])).toEqual([]);
    });

    test('фильтрует некорректные данные', () => {
      const apiData = [
        { categoryType: 1, name: 'Science' },
        null,
        undefined,
        { categoryType: undefined },
      ];

      const result = formatCategoriesFromApi(apiData);
      expect(result).toHaveLength(1);
    });
  });
});