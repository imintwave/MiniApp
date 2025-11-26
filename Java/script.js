// Основные переменные
let tg = window.Telegram.WebApp;
let currentEditingProductId = null;

// ID администраторов (замените на реальные ID пользователей)
const ADMIN_IDS = [
    '123456789', // Замените на ваш ID
    '987654321'  // Можно добавить других админов
];

// Инициализация приложения
function initApp() {
    tg.expand();
    tg.enableClosingConfirmation();
    
    checkAdminStatus();
    loadProducts();
    loadCart();
    setupEventListeners();
}

// Проверка прав администратора
function checkAdminStatus() {
    const user = tg.initDataUnsafe.user;
    
    if (user && ADMIN_IDS.includes(user.id.toString())) {
        document.getElementById('adminBadge').classList.remove('hidden');
        document.getElementById('adminPanel').classList.remove('hidden');
        console.log('Пользователь является администратором');
    }
}

// Загрузка товаров из localStorage
function loadProducts() {
    const products = getProducts();
    displayProducts(products);
    
    // Если пользователь админ, загружаем админскую версию
    if (isAdmin()) {
        displayAdminProducts(products);
    }
}

// Отображение товаров для покупателей
function displayProducts(products) {
    const productsList = document.getElementById('productsList');
    
    if (products.length === 0) {
        productsList.innerHTML = '<p style="text-align: center; color: var(--tg-theme-hint-color);">Товаров пока нет</p>';
        return;
    }
    
    productsList.innerHTML = products.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            ${product.image ? `<img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.style.display='none'">` : ''}
            <div class="product-name">${product.name}</div>
            <div class="product-description">${product.description}</div>
            <div class="product-price">${product.price} руб.</div>
            <div class="product-actions">
                <button onclick="addToCart(${product.id})" class="btn btn-primary">В корзину</button>
            </div>
        </div>
    `).join('');
}

// Отображение товаров для администратора
function displayAdminProducts(products) {
    const adminProductsList = document.getElementById('adminProductsList');
    
    adminProductsList.innerHTML = products.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            ${product.image ? `<img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.style.display='none'">` : ''}
            <div class="product-name">${product.name}</div>
            <div class="product-description">${product.description}</div>
            <div class="product-price">${product.price} руб.</div>
            <div class="admin-actions">
                <button onclick="openEditModal(${product.id})" class="btn btn-warning">✏️</button>
                <button onclick="deleteProduct(${product.id})" class="btn btn-danger">🗑️</button>
            </div>
        </div>
    `).join('');
}

// Добавление товара
function addProduct() {
    if (!isAdmin()) {
        showAlert('У вас нет прав для добавления товаров');
        return;
    }
    
    const name = document.getElementById('productName').value.trim();
    const price = document.getElementById('productPrice').value.trim();
    const description = document.getElementById('productDescription').value.trim();
    const image = document.getElementById('productImage').value.trim();
    
    // Валидация
    if (!name || !price) {
        showAlert('Заполните название и цену товара');
        return;
    }
    
    if (isNaN(price) || price <= 0) {
        showAlert('Введите корректную цену');
        return;
    }
    
    const products = getProducts();
    const newProduct = {
        id: Date.now(), // Простой ID на основе времени
        name: name,
        price: parseInt(price),
        description: description,
        image: image || null
    };
    
    products.push(newProduct);
    saveProducts(products);
    
    // Очистка формы
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productImage').value = '';
    
    // Обновление отображения
    loadProducts();
    
    showAlert('Товар успешно добавлен!');
    tg.HapticFeedback.impactOccurred('medium');
}

// Удаление товара
function deleteProduct(productId) {
    if (!isAdmin()) {
        showAlert('У вас нет прав для удаления товаров');
        return;
    }
    
    tg.showPopup({
        title: 'Удаление товара',
        message: 'Вы уверены, что хотите удалить этот товар?',
        buttons: [
            { id: 'delete', type: 'destructive', text: 'Удалить' },
            { type: 'cancel', text: 'Отмена' }
        ]
    }, (buttonId) => {
        if (buttonId === 'delete') {
            const products = getProducts().filter(p => p.id !== productId);
            saveProducts(products);
            loadProducts();
            showAlert('Товар удален');
            tg.HapticFeedback.impactOccurred('heavy');
        }
    });
}

// Открытие модального окна редактирования
function openEditModal(productId) {
    if (!isAdmin()) return;
    
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    currentEditingProductId = productId;
    document.getElementById('editName').value = product.name;
    document.getElementById('editPrice').value = product.price;
    document.getElementById('editDescription').value = product.description || '';
    document.getElementById('editImage').value = product.image || '';
    
    document.getElementById('editModal').classList.remove('hidden');
}

// Закрытие модального окна
function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
    currentEditingProductId = null;
}

// Обновление товара
function updateProduct() {
    if (!isAdmin() || !currentEditingProductId) return;
    
    const name = document.getElementById('editName').value.trim();
    const price = document.getElementById('editPrice').value.trim();
    const description = document.getElementById('editDescription').value.trim();
    const image = document.getElementById('editImage').value.trim();
    
    if (!name || !price) {
        showAlert('Заполните название и цену товара');
        return;
    }
    
    const products = getProducts();
    const productIndex = products.findIndex(p => p.id === currentEditingProductId);
    
    if (productIndex !== -1) {
        products[productIndex] = {
            ...products[productIndex],
            name: name,
            price: parseInt(price),
            description: description,
            image: image || null
        };
        
        saveProducts(products);
        loadProducts();
        closeEditModal();
        showAlert('Товар обновлен!');
        tg.HapticFeedback.impactOccurred('medium');
    }
}

// Работа с корзиной
function addToCart(productId) {
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    const cart = getCart();
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            productId: productId,
            quantity: 1,
            name: product.name,
            price: product.price
        });
    }
    
    saveCart(cart);
    loadCart();
    tg.HapticFeedback.impactOccurred('light');
    showAlert(`${product.name} добавлен в корзину!`);
}

function removeFromCart(productId) {
    const cart = getCart().filter(item => item.productId !== productId);
    saveCart(cart);
    loadCart();
    tg.HapticFeedback.impactOccurred('light');
}

function updateQuantity(productId, change) {
    const cart = getCart();
    const item = cart.find(item => item.productId === productId);
    
    if (item) {
        item.quantity += change;
        
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart(cart);
            loadCart();
        }
    }
}

function loadCart() {
    const cart = getCart();
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: var(--tg-theme-hint-color);">Корзина пуста</p>';
        cartTotal.textContent = '0';
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${item.price} руб. × ${item.quantity}</div>
            </div>
            <div class="cart-item-quantity">
                <button onclick="updateQuantity(${item.productId}, -1)" class="quantity-btn">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity(${item.productId}, 1)" class="quantity-btn">+</button>
                <button onclick="removeFromCart(${item.productId})" class="btn btn-danger" style="margin-left: 10px; padding: 5px 10px;">🗑️</button>
            </div>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total;
}

function checkout() {
    const cart = getCart();
    
    if (cart.length === 0) {
        showAlert('Корзина пуста');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderDetails = cart.map(item => 
        `${item.name} × ${item.quantity} = ${item.price * item.quantity} руб.`
    ).join('\n');
    
    tg.showPopup({
        title: 'Оформление заказа',
        message: `Ваш заказ:\n\n${orderDetails}\n\nИтого: ${total} руб.\n\nДля завершения заказа свяжитесь с администратором.`,
        buttons: [{ type: 'ok', text: 'Понятно' }]
    });
}

// Вспомогательные функции
function isAdmin() {
    const user = tg.initDataUnsafe.user;
    return user && ADMIN_IDS.includes(user.id.toString());
}

function getProducts() {
    try {
        return JSON.parse(localStorage.getItem('tg_shop_products') || '[]');
    } catch (error) {
        console.error('Error loading products:', error);
        return [];
    }
}

function saveProducts(products) {
    localStorage.setItem('tg_shop_products', JSON.stringify(products));
}

function getCart() {
    try {
        return JSON.parse(localStorage.getItem('tg_shop_cart') || '[]');
    } catch (error) {
        console.error('Error loading cart:', error);
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem('tg_shop_cart', JSON.stringify(cart));
}

function showAlert(message) {
    tg.showAlert(message);
}

function setupEventListeners() {
    // Закрытие модального окна по клику вне его
    document.getElementById('editModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeEditModal();
        }
    });
    
    // Обработка Enter в формах
    document.getElementById('productName').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addProduct();
    });
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', initApp);
