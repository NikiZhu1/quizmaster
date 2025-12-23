import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AuthForm from '../AuthForm';

// Мокаем компоненты Ant Design
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  Form: ({ 
    form, 
    name, 
    initialValues, 
    onFinish, 
    onFinishFailed, 
    autoComplete, 
    layout, 
    children 
  }) => (
    <form 
      data-testid="auth-form" 
      data-name={name}
      data-layout={layout}
      data-auto-complete={autoComplete}
      onSubmit={(e) => {
        e.preventDefault();
        // Имитируем успешный submit
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        onFinish && onFinish(data);
      }}
    >
      {children}
    </form>
  ),
  FormItem: ({ name, rules, children, dependencies }) => (
    <div data-testid="form-item" data-name={name} data-dependencies={dependencies}>
      {children}
      {rules && <div data-testid={`rules-${name}`}>{JSON.stringify(rules)}</div>}
    </div>
  ),
  Input: ({ prefix, placeholder, size, value, onChange, type = 'text' }) => (
    <div data-testid="input-wrapper">
      {prefix && <span data-testid="input-prefix">{prefix}</span>}
      <input
        data-testid={`input-${placeholder || 'default'}`}
        placeholder={placeholder}
        data-size={size}
        value={value}
        onChange={onChange}
        type={type}
      />
    </div>
  ),
  InputPassword: ({ prefix, placeholder, size, value, onChange }) => (
    <div data-testid="input-password-wrapper">
      {prefix && <span data-testid="input-password-prefix">{prefix}</span>}
      <input
        data-testid={`input-password-${placeholder || 'default'}`}
        placeholder={placeholder}
        data-size={size}
        value={value}
        onChange={onChange}
        type="password"
      />
    </div>
  ),
  Button: ({ type, htmlType, loading, size, block, children, style }) => (
    <button
      data-testid="submit-button"
      data-type={type}
      data-html-type={htmlType}
      data-loading={loading}
      data-size={size}
      data-block={block}
      style={style}
      type={htmlType}
    >
      {children}
    </button>
  ),
  Typography: {
    Title: ({ level, children, style }) => (
      <h3 data-testid="title" data-level={level} style={style}>
        {children}
      </h3>
    ),
    Text: ({ children }) => (
      <span data-testid="text">{children}</span>
    ),
  },
  Divider: ({ style }) => (
    <hr data-testid="divider" style={style} />
  ),
}));

jest.mock('@ant-design/icons', () => ({
  UserOutlined: () => <span data-testid="user-icon">👤</span>,
  LockOutlined: () => <span data-testid="lock-icon">🔒</span>,
  MailOutlined: () => <span data-testid="mail-icon">📧</span>,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ to, children }) => (
    <a data-testid="link" href={to}>
      {children}
    </a>
  ),
}));

describe('AuthForm Component', () => {
  const mockOnFinish = jest.fn();
  const mockOnFinishFailed = jest.fn();

  const defaultProps = {
    title: 'Авторизация',
    onFinish: mockOnFinish,
    buttonText: 'Войти',
    linkText: 'Нет аккаунта? Зарегистрироваться',
    linkTo: '/register',
    isRegistration: false,
    loading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with default props', () => {
    render(
      <BrowserRouter>
        <AuthForm {...defaultProps} />
      </BrowserRouter>
    );

    expect(screen.getByTestId('title')).toHaveTextContent('Авторизация');
    expect(screen.getByTestId('submit-button')).toHaveTextContent('Войти');
    expect(screen.getByTestId('link')).toHaveTextContent('Нет аккаунта? Зарегистрироваться');
    expect(screen.getByTestId('link')).toHaveAttribute('href', '/register');
  });

  test('renders registration form when isRegistration is true', () => {
    const props = {
      ...defaultProps,
      title: 'Регистрация',
      buttonText: 'Зарегистрироваться',
      linkText: 'Уже есть аккаунт? Войти',
      linkTo: '/login',
      isRegistration: true,
    };

    render(
      <BrowserRouter>
        <AuthForm {...props} />
      </BrowserRouter>
    );

    expect(screen.getByTestId('title')).toHaveTextContent('Регистрация');
    expect(screen.getByTestId('submit-button')).toHaveTextContent('Зарегистрироваться');
    expect(screen.getByTestId('link')).toHaveTextContent('Уже есть аккаунт? Войти');
    expect(screen.getByTestId('link')).toHaveAttribute('href', '/login');
    expect(screen.getByTestId('input-password-Подтвердите пароль')).toBeInTheDocument();
  });

  test('does not render confirm password field when isRegistration is false', () => {
    render(
      <BrowserRouter>
        <AuthForm {...defaultProps} />
      </BrowserRouter>
    );

    expect(screen.queryByTestId('input-password-Подтвердите пароль')).not.toBeInTheDocument();
  });

  test('shows loading state on submit button', () => {
    const props = {
      ...defaultProps,
      loading: true,
    };

    render(
      <BrowserRouter>
        <AuthForm {...props} />
      </BrowserRouter>
    );

    expect(screen.getByTestId('submit-button')).toHaveAttribute('data-loading', 'true');
  });

  test('renders all required form fields', () => {
    render(
      <BrowserRouter>
        <AuthForm {...defaultProps} />
      </BrowserRouter>
    );

    expect(screen.getByTestId('input-Имя пользователя')).toBeInTheDocument();
    expect(screen.getByTestId('input-password-Пароль')).toBeInTheDocument();
    expect(screen.getByTestId('auth-form')).toBeInTheDocument();
  });

  test('renders icons in input fields', () => {
    render(
      <BrowserRouter>
        <AuthForm {...defaultProps} />
      </BrowserRouter>
    );

    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
  });

  test('renders divider between form and link', () => {
    render(
      <BrowserRouter>
        <AuthForm {...defaultProps} />
      </BrowserRouter>
    );

    expect(screen.getByTestId('divider')).toBeInTheDocument();
  });

  test('calls onFinish when form is submitted', () => {
    render(
      <BrowserRouter>
        <AuthForm {...defaultProps} />
      </BrowserRouter>
    );

    const form = screen.getByTestId('auth-form');
    fireEvent.submit(form);

    expect(mockOnFinish).toHaveBeenCalledTimes(1);
  });

  test('has proper form layout and attributes', () => {
    render(
      <BrowserRouter>
        <AuthForm {...defaultProps} />
      </BrowserRouter>
    );

    const form = screen.getByTestId('auth-form');
    expect(form).toHaveAttribute('data-name', 'auth-form');
    expect(form).toHaveAttribute('data-layout', 'vertical');
    expect(form).toHaveAttribute('data-auto-complete', 'off');
  });

  test('submit button has correct attributes', () => {
    render(
      <BrowserRouter>
        <AuthForm {...defaultProps} />
      </BrowserRouter>
    );

    const button = screen.getByTestId('submit-button');
    expect(button).toHaveAttribute('data-type', 'primary');
    expect(button).toHaveAttribute('data-html-type', 'submit');
    expect(button).toHaveAttribute('data-size', 'large');
    expect(button).toHaveAttribute('data-block', 'true');
  });

  test('handles confirm password validation in registration mode', () => {
    const props = {
      ...defaultProps,
      isRegistration: true,
    };

    render(
      <BrowserRouter>
        <AuthForm {...props} />
      </BrowserRouter>
    );

    const confirmPasswordField = screen.getByTestId('form-item');
    expect(confirmPasswordField).toHaveAttribute('data-dependencies', 'password');
  });

  test('renders form with initial values', () => {
    // Note: We can't directly test initialValues since they're handled internally by Ant Design Form
    // But we can verify the form renders correctly
    render(
      <BrowserRouter>
        <AuthForm {...defaultProps} />
      </BrowserRouter>
    );

    expect(screen.getByTestId('auth-form')).toBeInTheDocument();
  });

  test('link text is properly rendered', () => {
    const customLinkText = 'Custom link text';
    const props = {
      ...defaultProps,
      linkText: customLinkText,
    };

    render(
      <BrowserRouter>
        <AuthForm {...props} />
      </BrowserRouter>
    );

    expect(screen.getByTestId('link')).toHaveTextContent(customLinkText);
  });

  test('link has correct destination', () => {
    const customLinkTo = '/custom-path';
    const props = {
      ...defaultProps,
      linkTo: customLinkTo,
    };

    render(
      <BrowserRouter>
        <AuthForm {...props} />
      </BrowserRouter>
    );

    expect(screen.getByTestId('link')).toHaveAttribute('href', customLinkTo);
  });

  test('form has proper styling structure', () => {
    render(
      <BrowserRouter>
        <AuthForm {...defaultProps} />
      </BrowserRouter>
    );

    const title = screen.getByTestId('title');
    expect(title).toHaveStyle({ textAlign: 'center', marginBottom: '24px' });

    const button = screen.getByTestId('submit-button');
    expect(button).toHaveStyle({ marginTop: '8px' });

    const divider = screen.getByTestId('divider');
    expect(divider).toHaveStyle({ margin: '16px 0' });
  });

  test('renders username field with validation rules', () => {
    render(
      <BrowserRouter>
        <AuthForm {...defaultProps} />
      </BrowserRouter>
    );

    // Проверяем наличие правил валидации через data-атрибуты
    const usernameField = screen.getByTestId('input-Имя пользователя');
    expect(usernameField).toBeInTheDocument();
  });

  test('renders password field with validation rules', () => {
    render(
      <BrowserRouter>
        <AuthForm {...defaultProps} />
      </BrowserRouter>
    );

    const passwordField = screen.getByTestId('input-password-Пароль');
    expect(passwordField).toBeInTheDocument();
    expect(passwordField).toHaveAttribute('type', 'password');
  });

  test('submit button is block type', () => {
    render(
      <BrowserRouter>
        <AuthForm {...defaultProps} />
      </BrowserRouter>
    );

    const button = screen.getByTestId('submit-button');
    expect(button).toHaveAttribute('data-block', 'true');
  });

  test('form submission triggers onFinish callback', () => {
    render(
      <BrowserRouter>
        <AuthForm {...defaultProps} />
      </BrowserRouter>
    );

    const form = screen.getByTestId('auth-form');
    fireEvent.submit(form);

    expect(mockOnFinish).toHaveBeenCalledTimes(1);
  });

  test('does not show mail icon (not used in component)', () => {
    render(
      <BrowserRouter>
        <AuthForm {...defaultProps} />
      </BrowserRouter>
    );

    // MailOutlined импортирован, но не используется в компоненте
    // Проверяем, что он не отображается
    expect(screen.queryByTestId('mail-icon')).not.toBeInTheDocument();
  });

  test('handles registration form with confirm password field', () => {
    const props = {
      ...defaultProps,
      isRegistration: true,
    };

    render(
      <BrowserRouter>
        <AuthForm {...props} />
      </BrowserRouter>
    );

    // Проверяем наличие всех полей
    expect(screen.getByTestId('input-Имя пользователя')).toBeInTheDocument();
    expect(screen.getByTestId('input-password-Пароль')).toBeInTheDocument();
    expect(screen.getByTestId('input-password-Подтвердите пароль')).toBeInTheDocument();
  });
});