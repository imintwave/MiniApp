// Конфигурация
const BOT_TOKEN = '5718405917:AAEtLH8r_FEh98utTX7-1iSRBBifbMJ0REY';
const CHANNELS = ['@SimpleDLC', '@LegensSoft'];

let telegramUser = null;
let isSubscribed = false;
let checkInProgress = false;

// Показать баннер
function showSubscriptionModal() {
    document.getElementById('subscriptionModal').style.display = 'flex';
    document.getElementById('mainContent').style.display = 'none';
    document.body.style.overflow = 'hidden';
}

// Скрыть баннер
function hideSubscriptionModal() {
    document.getElementById('subscriptionModal').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    document.body.style.overflow = 'auto';
}

// Обновить статус
function updateStatus(subscribed, message = '') {
    const icon = document.getElementById('statusIcon');
    const title = document.getElementById('statusTitle');
    const text = document.getElementById('statusText');
    
    if (subscribed) {
        icon.innerHTML = '✓';
        icon.className = 'status-icon success';
        title.textContent = 'Доступ открыт!';
        text.textContent = message || 'Приятного пользования';
        
        setTimeout(() => {
            hideSubscriptionModal();
            if (typeof window.showCards === 'function') {
                window.showCards();
            }
        }, 1500);
        
    } else {
        icon.innerHTML = '✕';
        icon.className = 'status-icon';
        title.textContent = 'Требуется подписка';
        text.textContent = message || 'Для доступа подпишитесь на каналы';
    }
}

// Инициализация Telegram
function initTelegram() {
    if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        telegramUser = tg.initDataUnsafe?.user;
        tg.expand();
        
        console.log('Telegram User ID:', telegramUser?.id);
        checkSubscription();
        setInterval(checkSubscription, 30000);
        
    } else {
        updateStatus(false, 'Откройте через Telegram бота');
    }
}

// Проверка подписки
async function checkSubscription() {
    if (checkInProgress) return;
    checkInProgress = true;
    
    const checkBtn = document.getElementById('checkBtn');
    if (checkBtn) {
        checkBtn.textContent = 'Проверяем...';
        checkBtn.disabled = true;
    }
    
    if (!window.Telegram?.WebApp) {
        updateStatus(false, 'Откройте через Telegram бота');
        resetButton();
        checkInProgress = false;
        return;
    }
    
    if (!telegramUser) {
        updateStatus(false, 'Не удалось получить данные');
        resetButton();
        checkInProgress = false;
        return;
    }
    
    try {
        let allSubscribed = true;
        
        for (const channel of CHANNELS) {
            const isSub = await checkSingleChannel(channel, telegramUser.id);
            if (!isSub) {
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

// Проверка одного канала
async function checkSingleChannel(channel, userId) {
    try {
        const response = await fetch(
            `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember`,
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
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
        console.error(`Ошибка ${channel}:`, error);
        return false;
    }
}

// Подписаться на все каналы
function subscribeToAll() {
    CHANNELS.forEach(channel => {
        const channelName = channel.substring(1);
        const link = `https://t.me/${channelName}`;
        
        if (window.Telegram?.WebApp?.openTelegramLink) {
            window.Telegram.WebApp.openTelegramLink(link);
        } else {
            window.open(link, '_blank');
        }
    });
    
    setTimeout(() => {
        if (confirm('После подписки нажмите "Проверить подписку"')) {
            checkSubscription();
        }
    }, 3000);
}

// Сброс кнопки
function resetButton() {
    const checkBtn = document.getElementById('checkBtn');
    if (checkBtn) {
        checkBtn.textContent = 'Проверить подписку';
        checkBtn.disabled = false;
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    showSubscriptionModal();
    
    document.getElementById('subscribeBtn').onclick = subscribeToAll;
    document.getElementById('checkBtn').onclick = checkSubscription;
    
    // Тема
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('change', function() {
        document.body.classList.toggle('dark-mode', this.checked);
    });
    
    initTelegram();
});

// Глобальная функция
window.isUserSubscribed = () => isSubscribed;
