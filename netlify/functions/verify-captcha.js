// Подключаем библиотеку для отправки запросов
const fetch = require('node-fetch');

// Это основная функция, которую будет вызывать Netlify
exports.handler = async (event) => {
  // 1. Проверяем, что запрос пришел методом POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // 2. Получаем токен из тела запроса, который прислал фронтенд
    const { token } = JSON.parse(event.body);

    // 3. Получаем СЕКРЕТНЫЙ КЛЮЧ из переменных окружения Netlify.
    // Это безопасно! Никогда не вставляйте секретный ключ прямо в код.
    const SECRET_KEY = process.env.RECAPTCHA_V3_SECRET_KEY;

    // 4. Отправляем запрос на сервер Google для проверки токена
    const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${SECRET_KEY}&response=${token}`,
    });

    const data = await response.json();

    // 5. Анализируем ответ от Google
    // Google рекомендует порог 0.5 для определения бота
    const isBot = data.success === false || data.score < 0.5;

    // 6. Отправляем результат обратно на наш сайт (фронтенд)
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        isBot: isBot,
        score: data.score // Отправляем оценку для отладки
      }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};