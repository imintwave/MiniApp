// Основные переменные
let tg = window.Telegram.WebApp;

// Инициализация приложения
function initApp() {
    // Расширяем на всю высоту
    tg.expand();
    
    // Показываем информацию о пользователе
    displayUserInfo();
    
    // Загружаем сохраненное число
    loadSavedNumber();
    
    // Настраиваем обработчики событий
    setupEventListeners();
}

// Отображение информации о пользователе
function displayUserInfo() {
    const user = tg.initDataUnsafe.user;
    
    if (user) {
        // ID пользователя
        document.getElementById('userId').textContent = user.id || 'Не указан';
        
        // Username
        const username = user.username ? '@' + user.username : 'Не указан';
        document.getElementById('userUsername').textContent = username;
        
        // Имя и фамилия
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        document.getElementById('userName').firstChild.textContent = fullName || 'Не указано';
        
        // Язык
        document.getElementById('userLanguage').textContent = tg.initDataUnsafe.user?.language_code || 'Не указан';
    } else {
        // Если данные пользователя недоступны
        document.getElementById('userId').textContent = 'Недоступно';
        document.getElementById('userUsername').textContent = 'Недоступно';
        document.getElementById('userName').firstChild.textContent = 'Недоступно';
        document.getElementById('userLanguage').textContent = 'Недоступно';
    }
}

// Загрузка сохраненного числа
function loadSavedNumber() {
    const savedNumber = getSavedNumber();
    const savedNumberElement = document.getElementById('savedNumber');
    
    if (savedNumber !== null) {
        savedNumberElement.textContent = savedNumber;
        savedNumberElement.classList.remove('hidden');
    } else {
        savedNumberElement.classList.add('hidden');
    }
}

// Сохранение числа
function saveNumber() {
    const numberInput = document.getElementById('numberInput');
    const number = numberInput.value.trim();
    const statusMessage = document.getElementById('statusMessage');
    
    // Проверка ввода
    if (!number) {
        showStatus('Пожалуйста, введите число', 'error');
        return;
    }
    
    if (isNaN(number)) {
        showStatus('Пожалуйста, введите корректное число', 'error');
        return;
    }
    
    // Сохраняем число в localStorage
    try {
        localStorage.setItem('tg_saved_number', number);
        showStatus(`Число ${number} успешно сохранено!`, 'success');
        
        // Очищаем поле ввода
        numberInput.value = '';
        
        // Обновляем отображение сохраненного числа
        loadSavedNumber();
        
        // Показываем уведомление в Telegram
        tg.showPopup({
            title: 'Успех!',
            message: `Число ${number} сохранено`,
            buttons: [{ type: 'ok' }]
        });
        
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        showStatus('Ошибка при сохранении числа', 'error');
    }
}

// Получение сохраненного числа
function getSavedNumber() {
    try {
        return localStorage.getItem('tg_saved_number');
    } catch (error) {
        console.error('Ошибка чтения:', error);
        return null;
    }
}

// Показ статусных сообщений
function showStatus(message, type) {
    const statusMessage = document.getElementById('statusMessage');
    
    statusMessage.textContent = message;
    statusMessage.className = 'status-message';
    
    if (type === 'success') {
        statusMessage.classList.add('status-success');
    } else if (type === 'error') {
        statusMessage.classList.add('status-error');
    }
    
    statusMessage.classList.remove('hidden');
    
    // Автоматическое скрытие через 3 секунды
    setTimeout(() => {
        statusMessage.classList.add('hidden');
    }, 3000);
}

// Перезапуск приложения
function restartApp() {
    tg.showPopup({
        title: 'Перезапуск',
        message: 'Вы уверены, что хотите перезапустить приложение?',
        buttons: [
            { 
                id: 'restart', 
                type: 'destructive', 
                text: 'Да, перезапустить' 
            },
            { 
                type: 'cancel', 
                text: 'Отмена' 
            }
        ]
    }, (buttonId) => {
        if (buttonId === 'restart') {
            // Закрываем и перезапускаем приложение
            tg.close();
        }
    });
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Обработчик ввода по Enter
    document.getElementById('numberInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            saveNumber();
        }
    });
    
    // Обработчик изменения темы Telegram
    tg.onEvent('themeChanged', function() {
        // При изменении темы можно обновить стили
        document.body.style.backgroundColor = tg.themeParams.bg_color || '#ffffff';
        document.body.style.color = tg.themeParams.text_color || '#000000';
    });
    
    // Обработчик изменения размера viewport
    tg.onEvent('viewportChanged', function() {
        tg.expand(); // Всегда расширяем на всю высоту
    });
}

// Дополнительные утилиты
function showUserData() {
    // Для отладки: показываем все данные в консоли
    console.log('Telegram WebApp:', tg);
    console.log('Init Data:', tg.initData);
    console.log('Init Data Unsafe:', tg.initDataUnsafe);
    console.log('User:', tg.initDataUnsafe.user);
    console.log('Theme:', tg.themeParams);
    console.log('Platform:', tg.platform);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    
    // Для отладки (можно удалить в продакшене)
    if (tg.initDataUnsafe.user) {
        console.log('Приложение инициализировано для пользователя:', tg.initDataUnsafe.user.username);
    }
});

// Обработчик видимости страницы (для случаев, когда приложение восстанавливается из фона)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // При возвращении на страницу обновляем данные
        loadSavedNumber();
    }
});
