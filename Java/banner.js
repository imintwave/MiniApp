// Конфигурация
const BOT_TOKEN = '5718405917:AAEtLH8r_FEh98utTX7-1iSRBBifbMJ0REY';
 
// Таблица каналов (добавляйте каналы здесь)
const CHANNELS_TABLE = [
    { id: 1, username: '@SimpleDLC', name: 'SimpleDLC', required: true },
    { id: 2, username: '@Legenssoft', name: 'Game News', required: true }
];

let telegramUser = null;
let isSubscribed = false;
let checkInProgress = false;
let subscribedChannels = [];
let unsubscribedChannels = [];

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

// Обновить список каналов в баннере
function updateChannelsList() {
    const channelsList = document.getElementById('channelsList');
    
    if (!channelsList) return;
    
    if (unsubscribedChannels.length === 0) {
        // Все каналы подписаны
        channelsList.innerHTML = '<div class="all-subscribed">✅ Вы подписаны на все каналы!</div>';
    } else {
        // Показываем только неподписанные каналы
        channelsList.innerHTML = unsubscribedChannels.map(channel => `
            <div class="channel-item">
                <span class="channel-name">${channel.name}</span>
                <a href="https://t.me/${channel.username.substring(1)}" target="_blank" class="channel-link">Перейти →</a>
            </div>
        `).join('');
    }
}

// Обновить статус
function updateStatus() {
    const icon = document.getElementById('statusIcon');
    const title = document.getElementById('statusTitle');
    const text = document.getElementById('statusText');
    const checkBtn = document.getElementById('checkBtn');
    const subscribeBtn = document.getElementById('subscribeBtn');
    
    if (unsubscribedChannels.length === 0) {
        // Подписан на все каналы
        icon.innerHTML = '✓';
        icon.className = 'status-icon success';
        title.textContent = 'Доступ открыт!';
        text.textContent = 'Вы подписаны на все каналы';
        subscribeBtn.style.display = 'none';
        
        // Скрываем баннер через 1.5 секунды
        setTimeout(() => {
            hideSubscriptionModal();
            if (typeof window.showCards === 'function') {
                window.showCards();
            }
        }, 1500);
        
    } else {
        // Есть неподписанные каналы
        icon.innerHTML = '✕';
        icon.className = 'status-icon';
        title.textContent = 'Требуется подписка';
        text.textContent = `Осталось подписаться на ${unsubscribedChannels.length} канал(ов)`;
        subscribeBtn.style.display = 'block';
        subscribeBtn.textContent = `Подписаться на ${unsubscribedChannels.length} канал(ов)`;
    }
}

// Инициализация Telegram
function initTelegram() {
    if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        telegramUser = tg.initDataUnsafe?.user;
        tg.expand();
        tg.enableClosingConfirmation();
        
        console.log('Telegram User ID:', telegramUser?.id);
        
        // Начинаем проверку
        checkSubscription();
        
    } else {
        // Если не в Telegram, показываем все каналы
        unsubscribedChannels = CHANNELS_TABLE.filter(ch => ch.required);
        updateChannelsList();
        updateStatus();
    }
}

// Проверка подписки на все каналы
async function checkSubscription() {
    if (checkInProgress) return;
    checkInProgress = true;
    
    const checkBtn = document.getElementById('checkBtn');
    if (checkBtn) {
        checkBtn.textContent = 'Проверяем...';
        checkBtn.disabled = true;
    }
    
    if (!window.Telegram?.WebApp) {
        unsubscribedChannels = CHANNELS_TABLE.filter(ch => ch.required);
        updateChannelsList();
        updateStatus();
        resetButton();
        checkInProgress = false;
        return;
    }
    
    if (!telegramUser) {
        unsubscribedChannels = CHANNELS_TABLE.filter(ch => ch.required);
        updateChannelsList();
        updateStatus();
        resetButton();
        checkInProgress = false;
        return;
    }
    
    try {
        // Сбрасываем списки
        subscribedChannels = [];
        unsubscribedChannels = [];
        
        // Проверяем каждый канал из таблицы
        for (const channel of CHANNELS_TABLE) {
            if (channel.required) {
                const isSub = await checkSingleChannel(channel.username, telegramUser.id);
                if (isSub) {
                    subscribedChannels.push(channel);
                } else {
                    unsubscribedChannels.push(channel);
                }
            }
        }
        
        // Обновляем отображение
        updateChannelsList();
        updateStatus();
        
        // Проверяем статус подписки
        isSubscribed = unsubscribedChannels.length === 0;
        
    } catch (error) {
        console.error('Ошибка проверки:', error);
        unsubscribedChannels = CHANNELS_TABLE.filter(ch => ch.required);
        updateChannelsList();
        updateStatus();
    }
    
    resetButton();
    checkInProgress = false;
}

// Проверка одного канала
async function checkSingleChannel(channelUsername, userId) {
    try {
        const response = await fetch(
            `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember`,
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    chat_id: channelUsername,
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
        console.error(`Ошибка проверки ${channelUsername}:`, error);
        return false;
    }
}

// Подписаться на неподписанные каналы
function subscribeToUnsubscribed() {
    // Открываем только неподписанные каналы
    unsubscribedChannels.forEach(channel => {
        const channelName = channel.username.substring(1);
        const link = `https://t.me/${channelName}`;
        
        if (window.Telegram?.WebApp?.openTelegramLink) {
            window.Telegram.WebApp.openTelegramLink(link);
        } else {
            window.open(link, '_blank');
        }
    });
    
    // Предлагаем проверить через 3 секунды
    setTimeout(() => {
        alert('После подписки нажмите "Проверить подписку"');
    }, 3000);
}

// Сброс кнопки проверки
function resetButton() {
    const checkBtn = document.getElementById('checkBtn');
    if (checkBtn) {
        checkBtn.textContent = 'Проверить подписку';
        checkBtn.disabled = false;
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Показываем баннер
    showSubscriptionModal();
    
    // Назначаем обработчики кнопок
    document.getElementById('subscribeBtn').onclick = subscribeToUnsubscribed;
    document.getElementById('checkBtn').onclick = checkSubscription;
    
    // Переключатель темы
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('change', function() {
        document.body.classList.toggle('dark-mode', this.checked);
        localStorage.setItem('darkMode', this.checked);
    });
    
    // Восстанавливаем тему
    const savedTheme = localStorage.getItem('darkMode') === 'true';
    if (savedTheme) {
        themeToggle.checked = true;
        document.body.classList.add('dark-mode');
    }
    
    // Инициализируем проверку подписки
    initTelegram();
});

// Глобальные функции для доступа из других скриптов
window.telegramChecker = {
    isUserSubscribed: () => isSubscribed,
    getUnsubscribedChannels: () => unsubscribedChannels,
    getSubscribedChannels: () => subscribedChannels,
    checkSubscription: checkSubscription
};
