const BOT_TOKEN = '5718405917:AAEtLH8r_FEh98utTX7-1iSRBBifbMJ0REY';

const REQUIRED_CHANNELS = [
    { id: '@SimpleDLC', name: 'SimpleDLC', link: 'https://t.me/SimpleDLC' },
    { id: '@legenssoft', name: 'LegensSoft', link: 'https://t.me/LegensSoft' }
];



let userId = null;

function getUserId() {
    if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
        const tg = Telegram.WebApp;
        const user = tg.initDataUnsafe?.user;
        
        if (user && user.id) {
            userId = user.id;
            return userId;
        }
    }
    
    return null;
}

async function checkChannelSubscription(channelId) {
    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChatMember`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: channelId,
                user_id: userId
            })
        });
        
        const data = await response.json();
        
        if (data.ok) {
            const status = data.result.status;
            const isSubscribed = status === 'member' || 
                                status === 'administrator' || 
                                status === 'creator';
            return isSubscribed;
        }
        
        return false;
        
    } catch (error) {
        return false;
    }
}

async function checkAllSubscriptions() {
    if (!userId) {
        return { allSubscribed: false, failedChannels: REQUIRED_CHANNELS };
    }
    
    const failedChannels = [];
    
    for (const channel of REQUIRED_CHANNELS) {
        const isSubscribed = await checkChannelSubscription(channel.id);
        
        if (!isSubscribed) {
            failedChannels.push(channel);
        }
    }
    
    const allSubscribed = failedChannels.length === 0;
    
    return { allSubscribed, failedChannels };
}

function showSubscriptionBanner(failedChannels) {
    const modal = document.getElementById('subscribeModal');
    const channelsList = document.getElementById('channelsList');
    const results = document.getElementById('results_search');
    const search = document.getElementById('search');
    
    if (!modal || !channelsList) return;
    
    channelsList.innerHTML = '';
    
    failedChannels.forEach(channel => {
        const channelItem = document.createElement('div');
        channelItem.className = 'channel-item';
        channelItem.innerHTML = `
            <span class="channel-name">${channel.name}</span>
            <a href="${channel.link}" target="_blank" class="channel-link">Перейти →</a>
        `;
        channelsList.appendChild(channelItem);
    });
    
    modal.style.display = 'flex';
    if (results) results.style.display = 'none';
    if (search) search.style.display = 'none';
}

function hideSubscriptionBanner() {
    const modal = document.getElementById('subscribeModal');
    const results = document.getElementById('results_search');
    const search = document.getElementById('search');
    
    if (modal) modal.style.display = 'none';
    if (results) results.style.display = 'flex';
    if (search) search.style.display = 'block';
    
    // ПОКАЗЫВАЕМ КАРТОЧКИ ПОСЛЕ СКРЫТИЯ БАННЕРА
    if (typeof showCards === 'function') {
        showCards();
    }
}

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
        checkBtn.onclick = async () => {
            const { allSubscribed, failedChannels } = await checkAllSubscriptions();
            
            if (allSubscribed) {
                hideSubscriptionBanner();
            } else {
                showSubscriptionBanner(failedChannels);
                alert('Вы подписаны не на все каналы!');
            }
        };
    }
}

async function checkAccess() {
    userId = getUserId();
    
    if (!userId) {
        showSubscriptionBanner(REQUIRED_CHANNELS);
        return;
    }
    
    const { allSubscribed, failedChannels } = await checkAllSubscriptions();
    
    if (!allSubscribed) {
        showSubscriptionBanner(failedChannels);
    } else {
        hideSubscriptionBanner();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupModalButtons();
    checkAccess();
});
