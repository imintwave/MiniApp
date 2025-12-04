// Проверяем, открыто ли в Telegram
if (window.Telegram && window.Telegram.WebApp) {
    
    // Включаем Telegram WebApp
    Telegram.WebApp.ready();
    
    // Получаем данные пользователя
    const user = Telegram.WebApp.initDataUnsafe.user;
    
    // Если есть данные пользователя
    if (user && user.id) {
        
        // Ваши настройки
        const TOKEN = '5718405917:AAEtLH8r_FEh98utTX7-1iSRBBifbMJ0REY';
        const USER_ID = user.id;
        const CHANNEL = '@simpledlc';
        
        // Проверяем подписку
        fetch(`https://api.telegram.org/bot${TOKEN}/getChatMember?chat_id=${CHANNEL}&user_id=${USER_ID}`)
        .then(response => response.json())
        .then(data => {
            if (data.ok && (data.result.status === 'member' || 
                            data.result.status === 'administrator' || 
                            data.result.status === 'creator')) {
                document.getElementById('result').innerHTML = '✅ Вы подписаны на канал!';
            } else {
                document.getElementById('result').innerHTML = '❌ Вы не подписаны на канал';
            }
        })
        .catch(error => {
            document.getElementById('result').innerHTML = '⚠️ Ошибка при проверке';
        });
        
    } else {
        document.getElementById('result').innerHTML = '❌ Не удалось получить данные';
    }
    
} else {
    document.getElementById('result').innerHTML = '📱 Откройте через Telegram бота';
}
