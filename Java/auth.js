// Конфигурация
const BOT_TOKEN = '5718405917:AAEtLH8r_FEh98utTX7-1iSRBBifbMJ0REY';
const REQUIRED_CHANNELS = [
    { id: '@SimpleDLC', name: 'SimpleDLC', link: 'https://t.me/SimpleDLC' },
    { id: '@legenssoft', name: 'GameNews', link: 'https://t.me/GameNews' }
];

// Проверка существования пользователя через бота
async function checkUserExistence(userId) {
    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: parseInt(userId)
            })
        });
        
        const data = await response.json();
        return data.ok;
        
    } catch (error) {
        console.error('Error checking user:', error);
        return false;
    }
}

// Показать/скрыть модальное окно
function showSubscribeModal() {
    document.getElementById('subscribeModal').style.display = 'flex';
    document.getElementById('results_search').style.display = 'none';
    document.getElementById('search').style.display = 'none';
}

function hideSubscribeModal() {
    document.getElementById('subscribeModal').style.display = 'none';
    document.getElementById('results_search').style.display = 'flex';
    document.getElementById('search').style.display = 'block';
}

// Настройка кнопок модального окна
function setupModalButtons() {
    const subscribeBtn = document.getElementById('subscribeBtn');
    const checkBtn = document.getElementById('checkBtn');
    
    subscribeBtn.onclick = () => {
        REQUIRED_CHANNELS.forEach(channel => {
            window.open(channel.link, '_blank');
        });
    };
    
    checkBtn.onclick = () => {
        // Здесь должна быть реальная проверка подписки через бэкенд
        // Для демонстрации просто скрываем модалку
        hideSubscribeModal();
        alert('Подписка проверена!');
    };
}

// Основная функция проверки
async function checkAccess() {
    // Получаем данные пользователя из Telegram Web App
    if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
        const tg = Telegram.WebApp;
        const user = tg.initDataUnsafe?.user;
        
        if (user && user.id) {
            const userExists = await checkUserExistence(user.id);
            
            if (userExists) {
                // Пользователь существует, можно показывать контент
                hideSubscribeModal();
            } else {
                // Пользователь не найден или бот не имеет доступа
                showSubscribeModal();
            }
        } else {
            // Данные пользователя недоступны
            showSubscribeModal();
        }
    } else {
        // Запущено не в Telegram
        console.log('Запущено вне Telegram');
        hideSubscribeModal();
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    setupModalButtons();
    checkAccess();
});
