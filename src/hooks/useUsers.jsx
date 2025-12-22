import { useState } from 'react';
import Cookies from 'js-cookie';
import * as api from '../API methods/usersMethods.jsx'; 

export const useUsers = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const userPicture = (userId) => {
        const link = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;
        return link
    }

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

    /** Функция регистрации */ 
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
        Cookies.remove('guestSessionId');
        Cookies.remove('refreshToken');
        Cookies.remove('guest_session_id');
    };

    // Получение информации о пользователе
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

    const getUserByUsername = async (username) => {
        if (!username) return null;

        try {
            const userInfo = await api.getUserByUsername(username);
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

    const getUserQuizzes = async (token, userId) => {
        setLoading(true);
        setError(null);
        
        try {
            const quizzesData = await api.getUserQuizzes(token, userId);
            return quizzesData;

        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const changePassword = async (userId, oldPassword, newPassword) => {
        setLoading(true);
        setError(null);
        
        try {
            const updateData = {
                oldPassword: oldPassword,
                password: newPassword
            };
            
            const response = await api.updateUserProfile(userId, updateData);
            return response;
        } catch (err) {
            console.error('Ошибка при смене пароля:', err);
            
            if (err.response?.data) {
                throw new Error(err.response.data);
            }
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        userPicture,
        loginUser,
        registerUser,
        logoutUser,
        getUserInfo,
        getUserByUsername,
        GetUserIdFromJWT,
        getUserQuizzes,
        changePassword
    };
};