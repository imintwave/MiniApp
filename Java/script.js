// Конфигурация проверки подписки
const BOT_TOKEN = '5718405917:AAEtLH8r_FEh98utTX7-1iSRBBifbMJ0REY';
const CHANNELS = ['@SimpleDLC', '@GameNews']; // Каналы для проверки

let telegramUser = null;
let isSubscribed = false;
let checkInProgress = false;

// Показать баннер проверки
function showSubscriptionModal() {
    document.getElementById('subscriptionModal').style.display = 'flex';
    document.getElementById('mainContent').style.display = 'none';
    
    // Убираем скролл страницы
    document.body.style.overflow = 'hidden';
}

// Скрыть баннер и показать основной контент
function showMainContent() {
    document.getElementById('subscriptionModal').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    document.body.style.overflow = 'auto';
}

// Обновить статус в баннере
function updateStatus(subscribed, message = '') {
    const icon = document.getElementById('statusIcon');
    const title = document.getElementById('statusTitle');
    const text = document.getElementById('statusText');
    
    if (subscribed) {
        // Успех: подписан
        icon.innerHTML = '✓';
        icon.className = 'status success';
        title.textContent = 'Доступ открыт!';
        text.textContent = message || 'Приятного пользования';
        
        // Через 1.5 секунды показываем основной контент
        setTimeout(() => {
            showMainContent();
            // Запускаем основной скрипт
            if (typeof window.showCards === 'function') {
                window.showCards();
            }
        }, 1500);
        
    } else {
        // Ошибка: не подписан
        icon.innerHTML = '✕';
        icon.className = 'status';
        title.textContent = 'Требуется подписка';
        text.textContent = message || 'Для доступа подпишитесь на каналы';
    }
}

// Инициализация Telegram Web App
function initTelegram() {
    if (typeof window.Telegram !== 'undefined' && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        telegramUser = tg.initDataUnsafe?.user;
        tg.expand(); // Растягиваем на весь экран
        
        console.log('Telegram User ID:', telegramUser?.id);
        
        // Сразу начинаем проверку
        checkSubscription();
        
        // Автопроверка каждые 30 секунд
        setInterval(checkSubscription, 30000);
        
    } else {
        // Если не в Telegram
        updateStatus(false, 'Откройте через Telegram бота');
    }
}

// Проверка подписки на каналы
async function checkSubscription() {
    if (checkInProgress) return;
    checkInProgress = true;
    
    const checkBtn = document.getElementById('checkBtn');
    if (checkBtn) {
        checkBtn.textContent = 'Проверяем...';
        checkBtn.disabled = true;
    }
    
    // Если не в Telegram
    if (!window.Telegram?.WebApp) {
        updateStatus(false, 'Откройте через Telegram бота');
        resetButton();
        checkInProgress = false;
        return;
    }
    
    // Если нет данных пользователя
    if (!telegramUser) {
        updateStatus(false, 'Не удалось получить данные');
        resetButton();
        checkInProgress = false;
        return;
    }
    
    try {
        let allSubscribed = true;
        
        // Проверяем каждый канал
        for (const channel of CHANNELS) {
            const subscribed = await checkChannelSubscription(channel, telegramUser.id);
            if (!subscribed) {
                allSubscribed = false;
                break;
            }
        }
        
        if (allSubscribed) {
            isSubscribed = true;
            updateStatus(true, 'Вы подписаны на все каналы!');
        } else {
            isSubscribed = false;
            updateStatus(false, 'Подпишитесь на все каналы');
        }
        
    } catch (error) {
        console.error('Ошибка проверки:', error);
        updateStatus(false, 'Ошибка соединения');
    }
    
    resetButton();
    checkInProgress = false;
}

// Проверка подписки на один канал
async function checkChannelSubscription(channel, userId) {
    try {
        const response = await fetch(
            `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: channel,
                    user_id: userId
                })
            }
        );
        
        const data = await response.json();
        
        if (data.ok) {
            const status = data.result.status;
            const validStatuses = ['creator', 'administrator', 'member', 'restricted'];
            return validStatuses.includes(status);
        }
        
        return false;
    } catch (error) {
        console.error(`Ошибка проверки ${channel}:`, error);
        return false;
    }
}

// Подписаться на все каналы
function subscribeToAll() {
    CHANNELS.forEach(channel => {
        const channelName = channel.substring(1); // Убираем @
        const link = `https://t.me/${channelName}`;
        
        if (typeof window.Telegram !== 'undefined' && 
            window.Telegram.WebApp && 
            window.Telegram.WebApp.openTelegramLink) {
            window.Telegram.WebApp.openTelegramLink(link);
        } else {
            window.open(link, '_blank');
        }
    });
    
    // Через 5 секунд предлагаем проверить снова
    setTimeout(() => {
        if (confirm('После подписки нажмите "Проверить подписку"')) {
            checkSubscription();
        }
    }, 5000);
}

// Сброс кнопки проверки
function resetButton() {
    const checkBtn = document.getElementById('checkBtn');
    if (checkBtn) {
        checkBtn.textContent = 'Проверить подписку';
        checkBtn.disabled = false;
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Показываем баннер проверки
    showSubscriptionModal();
    
    // Назначаем обработчики кнопок
    document.getElementById('subscribeBtn').onclick = subscribeToAll;
    document.getElementById('checkBtn').onclick = checkSubscription;
    
    // Инициализируем Telegram
    initTelegram();
});

// Глобальная функция для доступа к статусу
window.isUserSubscribed = function() {
    return isSubscribed;
};
