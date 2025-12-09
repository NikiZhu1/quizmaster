import { useState } from 'react';
import Cookies from 'js-cookie';
import { 
    AuthenticateUser, 
    GetUserIdFromJWT, 
    getUserInfo 
} from '../API methods/usersMethods.jsx';

export const useUsers = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Функция авторизации
    const loginUser = async (values, isRegistration = false) => {
        setLoading(true);
        setError(null);
        
        try {
            const token = await AuthenticateUser(values, isRegistration);
            
            if (token) {
                // Сохраняем токен в cookies
                Cookies.set('token', token, { expires: 7 }); // Токен на 7 дней
                return token;
            } else {
                throw new Error('Токен не получен');
            }
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Функция регистрации
    const registerUser = async (values) => {
        return await loginUser(values, true); // Используем ту же функцию, но с isRegistration = true
    };

    // Функция выхода
    const logoutUser = () => {
        Cookies.remove('token');
    };

    // Получение информации о текущем пользователе
    const getCurrentUser = async () => {
        const token = Cookies.get('token');
        if (!token) return null;

        try {
            const userId = GetUserIdFromJWT(token);
            if (userId) {
                const userInfo = await getUserInfo(token, userId);
                return userInfo;
            }
            return null;
        } catch (err) {
            console.error('Ошибка получения пользователя:', err);
            return null;
        }
    };

    return {
        loading,
        error,
        loginUser,
        registerUser,
        logoutUser,
        getCurrentUser
    };
};