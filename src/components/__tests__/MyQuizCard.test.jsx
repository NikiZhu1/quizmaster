import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import MyQuizCard from '../MyQuizCard';

// Простые моки для зависимостей
jest.mock('../../hooks/useQuizes', () => ({
  useQuizes: () => ({
    deleteQuiz: jest.fn(),
  }),
}));

jest.mock('../../hooks/useUsers', () => ({
  useUsers: () => ({
    checkToken: jest.fn(),
  }),
}));

jest.mock('antd', () => ({
  message: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
  Card: ({ hoverable, actions, onClick, style, styles, children }) => (
    <div 
      data-testid="quiz-card" 
      onClick={onClick}
      style={style}
    >
      <div style={styles?.body} data-testid="card-body">
        {children}
      </div>
      <div style={styles?.actions} data-testid="card-actions">
        {actions}
      </div>
    </div>
  ),
  Tag: ({ icon, color, children, style }) => (
    <span data-testid="tag" data-color={color} style={style}>
      {icon && <span data-testid="tag-icon">{icon}</span>}
      {children}
    </span>
  ),
  Button: ({ type, icon, onClick, danger, title, children }) => (
    <button 
      data-testid={`button-${title || 'default'}`} 
      onClick={onClick}
      data-danger={danger}
      title={title}
    >
      {icon && <span data-testid="button-icon">{icon}</span>}
      {children}
    </button>
  ),
  Modal: ({ title, open, onOk, onCancel, okText, cancelText, children }) => {
    if (!open) return null;
    return (
      <div data-testid="modal">
        <h3 data-testid="modal-title">{title}</h3>
        <div data-testid="modal-content">{children}</div>
        <button data-testid="modal-ok" onClick={onOk}>{okText}</button>
        <button data-testid="modal-cancel" onClick={onCancel}>{cancelText}</button>
      </div>
    );
  },
  Typography: {
    Title: ({ level, children, style }) => (
      <h3 data-testid="title" style={style}>
        {children}
      </h3>
    ),
    Text: ({ type, children, style }) => (
      <span data-testid="text" style={style}>
        {children}
      </span>
    ),
    Paragraph: ({ ellipsis, children, style }) => (
      <p data-testid="paragraph" style={style}>
        {children}
      </p>
    ),
  },
}));

jest.mock('@ant-design/icons', () => ({
  ClockCircleOutlined: () => <span data-testid="clock-icon">⏰</span>,
  QuestionCircleOutlined: () => <span data-testid="question-icon">❓</span>,
  EditOutlined: () => <span data-testid="edit-icon">✏️</span>,
  DeleteOutlined: () => <span data-testid="delete-icon">🗑️</span>,
  BarChartOutlined: () => <span data-testid="chart-icon">📊</span>,
}));

jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Основной тест
describe('MyQuizCard Component', () => {
  const mockQuiz = {
    id: 1,
    title: 'Test Quiz',
    description: 'This is a test quiz description',
    questionsCount: 10,
    timeLimit: '00:30:00',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders quiz card with basic information', () => {
    render(
      <BrowserRouter>
        <MyQuizCard quiz={mockQuiz} />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Quiz')).toBeInTheDocument();
    expect(screen.getByText('This is a test quiz description')).toBeInTheDocument();
    expect(screen.getByText('10 вопросов')).toBeInTheDocument();
  });

  test('navigates to quiz page on card click', () => {
    render(
      <BrowserRouter>
        <MyQuizCard quiz={mockQuiz} />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByTestId('quiz-card'));
    expect(mockNavigate).toHaveBeenCalledWith('/quiz/1');
  });

  test('opens delete confirmation modal when delete button is clicked', () => {
    render(
      <BrowserRouter>
        <MyQuizCard quiz={mockQuiz} />
      </BrowserRouter>
    );

    const deleteButton = screen.getByTestId('button-Удалить');
    fireEvent.click(deleteButton);
    
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });
});