import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { message } from 'antd';
import UserInfo from '../UserInfo';

// Мокаем зависимые модули
jest.mock('../../hooks/useUsers', () => ({
  useUsers: jest.fn(),
}));

jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  message: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
  Avatar: ({ icon, style, src, children }) => (
    <div data-testid="avatar" style={style}>
      {icon && <span data-testid="avatar-icon">{icon}</span>}
      {src && <img src={src} alt="avatar" />}
      {children}
    </div>
  ),
  Dropdown: ({ menu, children, placement }) => (
    <div data-testid="dropdown" data-placement={placement}>
      {children}
      {menu && <div data-testid="dropdown-menu">{JSON.stringify(menu)}</div>}
    </div>
  ),
  Button: ({ type, icon, onClick, children }) => (
    <button 
      data-testid="button" 
      data-type={type}
      onClick={onClick}
    >
      {icon && <span data-testid="button-icon">{icon}</span>}
      {children}
    </button>
  ),
  Space: ({ children, style }) => (
    <div data-testid="space" style={style}>
      {children}
    </div>
  ),
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
  useLocation: () => ({ pathname: '/' }),
}));

jest.mock('../ProfileModal', () => ({
  __esModule: true,
  default: ({ visible, onClose, userId, userName, onUpdateUser }) => (
    <div data-testid="profile-modal">
      {visible && (
        <div>
          <p>Profile Modal - User: {userName} (ID: {userId})</p>
          <button onClick={onClose}>Close Modal</button>
          <button onClick={() => onUpdateUser({ userName: 'Updated User' })}>
            Update User
          </button>
        </div>
      )}
    </div>
  ),
}));

// Теперь добавляем тесты
describe('UserInfo Component', () => {
  const mockCheckToken = jest.fn();
  const mockGetUserIdFromJWT = jest.fn();
  const mockGetUserInfo = jest.fn();
  const mockLogoutUser = jest.fn();
  const mockUserPicture = jest.fn();
  const { useUsers } = require('../../hooks/useUsers');

  beforeEach(() => {
    jest.clearAllMocks();
    useUsers.mockReturnValue({
      GetUserIdFromJWT: mockGetUserIdFromJWT,
      getUserInfo: mockGetUserInfo,
      logoutUser: mockLogoutUser,
      userPicture: mockUserPicture,
      checkToken: mockCheckToken,
    });
  });

  test('navigates to login page when login button is clicked', async () => {
    mockCheckToken.mockResolvedValue(null);
    
    render(
      <BrowserRouter>
        <UserInfo />
      </BrowserRouter>
    );

    await waitFor(() => {
      const loginButton = screen.getByText(/войти/i);
      fireEvent.click(loginButton);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});