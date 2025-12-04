// Конфигурация
const BOT_TOKEN = '5718405917:AAEtLH8r_FEh98utTX7-1iSRBBifbMJ0REY';

// Таблица каналов для проверки
const CHANNELS_TABLE = [
    { id: 1, username: '@SimpleDLC', name: 'SimpleDLC', required: true },
    { id: 2, username: '@GameNews', name: 'Game News', required: true },
    { id: 3, username: '@PremiumContent', name: 'Premium Content', required: true }
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
        channelsList.innerHTML = '<p style="color: green; padding: 15px;">✅ Вы подписаны на все каналы!</p>';
    } else {
        channelsList.innerHTML = unsubscribedChannels.map(channel => `
            <div class="channel-item">
                <span class="channel-name">${channel.name}</span>
                <a href="https://t.me/${channel.username.substring(1)}" target="_blank" class="channel-link">Перейти</a>
            </div>
        `).join('');
    }
}

// Обновить статус
function updateStatus(subscribed, message = '') {
    const icon = document.getElementById('statusIcon');
    const title = document.getElementById('statusTitle');
    const text = document.getElementById('statusText');
    const checkBtn = document.getElementById('checkBtn');
    
    if (subscribed) {
        icon.innerHTML = '✓';
        icon.className = 'status-icon success';
        title.textContent = 'Доступ открыт!';
        text.textContent = message || 'Приятного пользования';
        
        // Обновляем список каналов
        updateChannelsList();
        
        // Если подписан на все каналы, скрываем баннер через 1.5 сек
        if (unsubscribedChannels.length === 0) {
            setTimeout(() => {
                hideSubscriptionModal();
                if (typeof window.showCards === 'function') {
                    window.showCards();
                }
            }, 1500);
        } else {
            // Показываем кнопку проверки
            if (checkBtn) {
                checkBtn.style.display = 'block';
            }
        }
        
    } else {
        icon.innerHTML = '✕';
        icon.className = 'status-icon';
        title.textContent = 'Требуется подписка';
        text.textContent = message || 'Подпишитесь на все обязательные каналы';
        
        // Обновляем список каналов
        updateChannelsList();
        
        // Показываем кнопку проверки
        if (checkBtn) {
            checkBtn.style.display = 'block';
        }
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
        
    } else {
        updateStatus(false, 'Откройте через Telegram бота');
        // Показываем все каналы если не в Telegram
        unsubscribedChannels = CHANNELS_TABLE.filter(ch => ch.required);
        updateChannelsList();
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
        
        // Проверяем статус подписки
        if (unsubscribedChannels.length === 0) {
            isSubscribed = true;
            updateStatus(true, 'Вы подписаны на все обязательные каналы!');
        } else {
            isSubscribed = false;
            updateStatus(false, `Осталось подписаться на ${unsubscribedChannels.length} канал(ов)`);
        }
        
    } catch (error) {
        console.error('Ошибка проверки:', error);
        updateStatus(false, 'Ошибка соединения');
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
        console.error(`Ошибка ${channelUsername}:`, error);
        return false;
    }
}

// Подписаться на все неподписанные каналы
function subscribeToAll() {
    // Берем только неподписанные каналы
    unsubscribedChannels.forEach(channel => {
        const channelName = channel.username.substring(1);
        const link = `https://t.me/${channelName}`;
        
        if (window.Telegram?.WebApp?.openTelegramLink) {
            window.Telegram.WebApp.openTelegramLink(link);
        } else {
            window.open(link, '_blank');
        }
    });
    
    // Если есть неподписанные каналы, предлагаем проверить через 3 сек
    if (unsubscribedChannels.length > 0) {
        setTimeout(() => {
            if (confirm('После подписки нажмите "Проверить подписку"')) {
                checkSubscription();
            }
        }, 3000);
    }
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
    
    // Назначаем обработчики кнопок
    document.getElementById('subscribeBtn').onclick = subscribeToAll;
    document.getElementById('checkBtn').onclick = checkSubscription;
    
    // Тема
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('change', function() {
            document.body.classList.toggle('dark-mode', this.checked);
        });
    }
    
    // Инициализируем проверку подписки
    initTelegram();
});

// Глобальные функции
window.isUserSubscribed = () => isSubscribed;
window.getUnsubscribedChannels = () => unsubscribedChannels;
window.getSubscribedChannels = () => subscribedChannels;
