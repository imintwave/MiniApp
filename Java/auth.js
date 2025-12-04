// Конфигурация
const BOT_TOKEN = '5718405917:AAEtLH8r_FEh98utTX7-1iSRBBifbMJ0REY';
const REQUIRED_CHANNELS = [
    { id: '@SimpleDLC', name: 'SimpleDLC', link: 'https://t.me/SimpleDLC' },
    { id: '@legenssoft', name: 'legenssoft', link: 'https://t.me/legenssoft' }
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
        console.log('Проверка пользователя:', data);
        return data.ok;
        
    } catch (error) {
        console.error('Error checking user:', error);
        return false;
    }
}

// Показать/скрыть модальное окно
function showSubscribeModal() {
    const modal = document.getElementById('subscribeModal');
    const results = document.getElementById('results_search');
    const search = document.getElementById('search');
    
    if (modal) modal.style.display = 'flex';
    if (results) results.style.display = 'none';
    if (search) search.style.display = 'none';
}

function hideSubscribeModal() {
    const modal = document.getElementById('subscribeModal');
    const results = document.getElementById('results_search');
    const search = document.getElementById('search');
    
    if (modal) modal.style.display = 'none';
    if (results) results.style.display = 'flex';
    if (search) search.style.display = 'block';
}

// Настройка кнопок модального окна
function setupModalButtons() {
    const subscribeBtn = document.getElementById('subscribeBtn');
    const checkBtn = document.getElementById('checkBtn');
    
    if (subscribeBtn) {
        subscribeBtn.onclick = () => {
            REQUIRED_CHANNELS.forEach(channel => {
                window.open(channel.link, '_blank');
            });
        };
    }
    
    if (checkBtn) {
        checkBtn.onclick = () => {
            hideSubscribeModal();
            alert('Подписка проверена! Теперь вы можете использовать приложение.');
        };
    }
}

// Основная функция проверки доступа
async function checkAccess() {
    console.log('Начинаем проверку доступа...');
    
    // Инициализация Telegram Web App
    if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
        const tg = Telegram.WebApp;
        tg.expand();
        
        const user = tg.initDataUnsafe?.user;
        console.log('Данные пользователя из Telegram:', user);
        
        if (user && user.id) {
            const userExists = await checkUserExistence(user.id);
            
            if (userExists) {
                console.log('Пользователь найден, показываем контент');
                hideSubscribeModal();
            } else {
                console.log('Пользователь не найден или бот не имеет доступа');
                showSubscribeModal();
            }
        } else {
            console.log('Данные пользователя недоступны');
            showSubscribeModal();
        }
    } else {
        console.log('Запущено вне Telegram - режим разработки');
        hideSubscribeModal();
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    console.log('Загружен auth.js');
    setupModalButtons();
    checkAccess();
});
