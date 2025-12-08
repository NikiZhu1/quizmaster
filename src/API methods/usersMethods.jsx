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
        const token = response.data.Token;
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

