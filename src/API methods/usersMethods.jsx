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

export const getUserInfo = async (userId) => {
    try {
        const response = await apiClient.get(`/User/${userId}`);
        return response.data;
    }
    catch (error) {
        console.error(`Ошибка при получении информации пользователя #${userId}`, error);
        throw error;
    }
};


// // В useUsers.js обновите getUserInfo
// export const getUserInfo = async (userId) => {
//     if (!userId) return null;

//     try {
//         const userInfo = await apiClient.getUserInfo(userId);
//         console.log('Информация о пользователе получена:', userInfo);
//         return userInfo;
//     } catch (err) {
//         console.error('Ошибка получения пользователя:', err);
        
//         // Если ошибка 401 - токен истек
//         if (err.response?.status === 401) {
//             Cookies.remove('token');
//             window.location.href = '/login';
//         }
        
//         return null;
//     }
// };

/**
 * Получает квизы пользователя
 * @param {string} token - Токен авторизации
 * @param {string} userId - ID пользователя
 * @returns {Promise<Array>} Массив квизов пользователя
 */
export const getUserQuizzes = async (token, userId) => {
    if (!token) {
      throw new Error('Токен авторизации обязателен');
    }
    if (!userId) {
      throw new Error('Id пользователя обязателен');
    }
  
    try {
      const response = await apiClient.get(`/User/${userId}/quizzes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      console.log(`Успешно получены квизы ${userId}:`, response.data);
      return response.data;
    } catch (err) {
      console.error('Ошибка при получении квизов пользователя:', err);
      throw err;
    }
  };

// export const updateUserProfile = async (userId, userData) => {
//     const token = Cookies.get('token');
    
//     if (!token) {
//         throw new Error('Требуется авторизация');
//     }

//     try {
//         const response = await apiClient.put(`/User/${userId}`, userData, {
//             headers: { 
//                 Authorization: `Bearer ${token}`,
//                 'Content-Type': 'application/json'
//             }
//         });
//         return response.data;
//     } catch (error) {
//         console.error(`Ошибка при обновлении профиля пользователя ${userId}:`, error);
//         throw error;
//     }
// };

// // В файле usersMethods.js обновите метод updateUserProfile
// export const updateUserProfile = async (userId, userData) => {
//     const token = Cookies.get('token');
    
//     if (!token) {
//         throw new Error('Требуется авторизация');
//     }

//     try {
//         // Важно: API ожидает объект с полем userName, а не username
//         const payload = {};
        
//         // Если передаем имя пользователя
//         if (userData.userName !== undefined) {
//             payload.userName = userData.userName;
//         }
        
//         // Если передаем пароль
//         if (userData.password !== undefined) {
//             payload.password = userData.password;
//         }

//         console.log('Отправляемые данные:', payload); // Для отладки

//         const response = await apiClient.put(`/User/${userId}`, payload, {
//             headers: { 
//                 Authorization: `Bearer ${token}`,
//                 'Content-Type': 'application/json'
//             }
//         });
        
//         console.log('Ответ от сервера:', response.data); // Для отладки
//         return response.data;
//     } catch (error) {
//         console.error(`Ошибка при обновлении профиля пользователя ${userId}:`, error);
        
//         // Более детальная информация об ошибке
//         if (error.response) {
//             console.error('Данные ошибки:', error.response.data);
//             console.error('Статус ошибки:', error.response.status);
//             console.error('Заголовки ошибки:', error.response.headers);
//         }
        
//         throw error;
//     }
// };

// export const updateUserProfile = async (userId, userData) => {
//     const token = Cookies.get('token');
    
//     if (!token) {
//         throw new Error('Требуется авторизация');
//     }

//     try {
//         // Подготавливаем данные согласно UserUpdateDto из API
//         const payload = {};
        
//         // Если передаем имя пользователя
//         if (userData.userName !== undefined) {
//             payload.userName = userData.userName;
//         }
        
//         // Если передаем старый пароль (для смены пароля)
//         if (userData.oldPassword !== undefined) {
//             payload.oldPassword = userData.oldPassword;
//         }
        
//         // Если передаем новый пароль
//         if (userData.password !== undefined) {
//             payload.password = userData.password;
//         }

//         console.log('Отправка запроса на обновление пользователя:', {
//             url: `/User/${userId}`,
//             method: 'PUT',
//             data: payload
//         });

//         const response = await apiClient.put(`/User/${userId}`, payload, {
//             headers: { 
//                 Authorization: `Bearer ${token}`,
//                 'Content-Type': 'application/json'
//             }
//         });
        
//         console.log('Успешный ответ от сервера:', response.data);
//         return response.data;
//     } catch (error) {
//         console.error(`Ошибка при обновлении профиля пользователя ${userId}:`, error);
        
//         // Детальная информация об ошибке для отладки
//         if (error.response) {
//             console.error('Статус ошибки:', error.response.status);
//             console.error('Данные ошибки:', error.response.data);
//             console.error('Заголовки:', error.response.headers);
//         }
        
//         throw error;
//     }
// };

export const updateUserProfile = async (userId, userData) => {
    const token = Cookies.get('token');
    
    if (!token) {
        throw new Error('Требуется авторизация');
    }

    try {
        // Подготавливаем данные согласно UserUpdateDto из API
        const payload = {};
        
        // Если передаем имя пользователя
        if (userData.userName !== undefined) {
            payload.userName = userData.userName;
        }
        
        // Если передаем старый пароль (для смены пароля)
        if (userData.oldPassword !== undefined) {
            payload.oldPassword = userData.oldPassword;
        }
        
        // Если передаем новый пароль
        if (userData.password !== undefined) {
            payload.password = userData.password;
        }

        console.log('Отправка запроса на обновление пользователя:', {
            url: `/User/${userId}`,
            method: 'PUT',
            data: payload
        });

        const response = await apiClient.put(`/User/${userId}`, payload, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Успешный ответ от сервера:', response.data);
        return response.data;
    } catch (error) {
        console.error(`Ошибка при обновлении профиля пользователя ${userId}:`, error);
        
        // Пробрасываем ошибку с детальной информацией
        const apiError = new Error(error.response?.data?.message || error.message);
        apiError.response = error.response;
        apiError.status = error.response?.status;
        
        throw apiError;
    }
};