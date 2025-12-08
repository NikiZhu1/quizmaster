import apiClient from './.APIclient';

export const AuthenticateUser = async (values, isRegistration) => {
    try {
        let url = '/User/login';
        if (isRegistration) 
            url = '/User/register';

        const response = await apiClient.post(url, {
            username: values.username,
            password: values.password
        });

        //Получаем JWT токен из ответа на авторизацию
        const token = response.data.token;
        if (!token) {
            throw new Error('Токен отсутствует в ответе сервера');
        }

        //Декодируем JWT токен для получения UserId
        let userId;
        try {
            userId = GetUserIdFromJWT(token);

        } catch (decodeError) {
            console.error('Ошибка при декодировании токена:', decodeError);
            return;
        }

        return token;
    }
    catch (error) {
        throw error;
    }
};

export const GetUserIdFromJWT = (token) => {
    try {
        let userId
        const decoded = jwtDecode(token);
        userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

        if (userId)
            return userId;

    } catch (decodeError) {;
        console.error('Ошибка при декодировании токена:', decodeError);
        return;
    }
};

export const GetJWT = () => {
    const token = Cookies.get('token');

    if (!token) {
        console.error('Ошибка: Токен отсутствует.');
        return null;
    }

    return token;
};

export const getUserInfo = async (token, userId) => {
    try {
        const response = await apiClient.get(`/Users/${userId}`,
            { 
                headers: { Authorization: `Bearer ${token}` } 
            }
        );
        return response.data;
    }
    catch (error) {
        console.error(`Ошибка при получении информациии пользователя #${userId}`, error);
    }
};

/**
 * Получает никнейм пользователя по его ID
 * @param {number} userId - ID пользователя
 * @returns {Promise<string|null>} - Никнейм пользователя или null при ошибке
 */
export const getUserNickname = async (userId) => {
  if (!userId || userId <= 0) {
    console.error('Неверный ID пользователя');
    return null;
  }

  try {
    const response = await apiClient.get(`/User/${userId}`);
    return response.data.nickname || response.data.username || 'Пользователь';
  } catch (error) {
    console.error(`Ошибка при получении никнейма пользователя ${userId}:`, error);
    return null;
  }
};