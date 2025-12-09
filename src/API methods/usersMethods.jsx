import apiClient from './.APIclient';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

export const AuthenticateUser = async (values, isRegistration) => {
    try {
        let url = '/User/login';
        if (isRegistration) 
            url = '/User/register';

        const response = await apiClient.post(url, {
            username: values.username,
            password: values.password
        });

        // Получаем JWT токен из ответа на авторизацию
        const token = response.data.token;
        if (!token) {
            throw new Error('Токен отсутствует в ответе сервера');
        }

        return token;
    }
    catch (error) {
        console.error('Ошибка аутентификации:', error.response?.data || error.message);
        throw error;
    }
};

export const GetUserIdFromJWT = (token) => {
    try {
        const decoded = jwtDecode(token);
        const userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
        
        if (userId) {
            return parseInt(userId);
        }
        return null;
    } catch (decodeError) {
        console.error('Ошибка при декодировании токена:', decodeError);
        return null;
    }
};

export const getUserInfo = async (token, userId) => {
    try {
        const response = await apiClient.get(`/User/${userId}`, {
            headers: { 
                Authorization: `Bearer ${token}` 
            }
        });
        return response.data;
    }
    catch (error) {
        console.error(`Ошибка при получении информации пользователя #${userId}`, error);
        throw error;
    }
};

export const getUserNickname = async (userId) => {
    const token = Cookies.get('token');
    
    if (!userId || userId <= 0) {
        console.error('Неверный ID пользователя');
        return null;
    }

    try {
        const response = await apiClient.get(`/User/${userId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        // Предполагаем, что сервер возвращает username или name
        return response.data.username || response.data.name || 'Пользователь';
    } catch (error) {
        console.error(`Ошибка при получении никнейма пользователя ${userId}:`, error);
        return null;
    }
};

export const updateUserProfile = async (userId, userData) => {
    const token = Cookies.get('token');
    
    if (!token) {
        throw new Error('Требуется авторизация');
    }

    try {
        const response = await apiClient.put(`/User/${userId}`, userData, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Ошибка при обновлении профиля пользователя ${userId}:`, error);
        throw error;
    }
};