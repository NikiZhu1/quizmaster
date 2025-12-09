import { useState } from 'react';
import Cookies from 'js-cookie';

//Методы
import * as api from '../API methods/usersMethods.jsx'; 

export const useUsers = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Функция авторизации
    const loginUser = async (values) => {
    setLoading(true);
    setError(null);
    try {
        const token = await api.AuthenticateUser(values, false);

        // Сохраняем токен в cookies
        setTokenToCookie(token);
        
        console.log('Вход: ', values);
    }
    catch (error) {
        console.error(`Ошибка входа: `, error);
        throw error;
    }
    finally {
        setLoading(false);
    }
}

    // Функция регистрации
    const registerUser = async (values) => {
    setLoading(true);
    setError(null);
    try {
        const token = await api.AuthenticateUser(values, true);

        // Сохраняем токен в cookies
        setTokenToCookie(token);

        console.log('Регистрация: ', values);
    }
    catch (error) {
        console.error(`Ошибка регистрации: `, error);
        throw error;
    }
    finally {
        setLoading(false);
    }
}

    const setTokenToCookie = (token) => {
        Cookies.set('token', token, { expires: 1, secure: true, sameSite: 'Strict' });
}

    // Функция выхода
    const logoutUser = () => {
        Cookies.remove('token');
    };

    // Получение информации о текущем пользователе
    const getUserInfo = async (userId) => {
        if (!userId) return null;

        try {
            const userInfo = await api.getUserInfo(userId);
            return userInfo;
                
        } catch (err) {
            console.error('Ошибка получения пользователя:', err);
            return null;
        }
    };

    const GetUserIdFromJWT = (token) => {
        if (!token) return null;

        try {
            const userId = api.GetUserIdFromJWT(token);
            return userId;
        } catch (err) {
            console.error('Ошибка получения id из токена')
            return null;
        }
    }

    return {
        loading,
        error,
        loginUser,
        registerUser,
        logoutUser,
        getUserInfo,
        GetUserIdFromJWT
    };
};