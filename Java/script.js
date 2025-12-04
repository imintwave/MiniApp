// Данные товаров
const products = [
    {
        id: 1,
        name: "Minecraft",
        price: 1999,
        oldPrice: 2499,
        img: "https://via.placeholder.com/300x200/4CAF50/fff?text=Minecraft",
        description: "Песочница с кубической графикой",
        version: "1.20"
    },
    {
        id: 2,
        name: "GTA V",
        price: 2999,
        oldPrice: 3499,
        img: "https://via.placeholder.com/300x200/2196F3/fff?text=GTA+V",
        description: "Криминальная сага в Лос-Сантосе",
        version: "Premium"
    },
    {
        id: 3,
        name: "CS:GO",
        price: 0,
        oldPrice: 1499,
        img: "https://via.placeholder.com/300x200/FF9800/fff?text=CS:GO",
        description: "Тактический шутер",
        version: "Free"
    },
    {
        id: 4,
        name: "Cyberpunk 2077",
        price: 3999,
        oldPrice: null,
        img: "https://via.placeholder.com/300x200/9C27B0/fff?text=Cyberpunk",
        description: "Ролевая игра в будущем",
        version: "2.0"
    },
    {
        id: 5,
        name: "The Witcher 3",
        price: 1499,
        oldPrice: 2999,
        img: "https://via.placeholder.com/300x200/E91E63/fff?text=Witcher+3",
        description: "Фэнтези РПГ про ведьмака",
        version: "Complete"
    },
    {
        id: 6,
        name: "Fortnite",
        price: 0,
        oldPrice: null,
        img: "https://via.placeholder.com/300x200/00BCD4/fff?text=Fortnite",
        description: "Королевская битва",
        version: "Chapter 5"
    }
];

// Создание карточки
function createCard(product) {
    return `
        <div class="product-card">
            <img src="${product.img}" alt="${product.name}">
            <div class="card-content">
                <div class="product-title">${product.name}</div>
                <div class="product-version">${product.version}</div>
                <div class="product-description">${product.description}</div>
                <div class="product-price">${product.price === 0 ? 'Бесплатно' : product.price + '₽'}</div>
                <button onclick="buyProduct(${product.id})">Купить</button>
            </div>
        </div>
    `;
}

// Показать все карточки
function showCards() {
    if (typeof window.isUserSubscribed === 'function' && !window.isUserSubscribed()) {
        return; // Не показываем если не подписан
    }
    
    const container = document.getElementById('results_search');
    if (container) {
        container.innerHTML = products.map(createCard).join('');
    }
}

// Поиск товаров
function searchGames() {
    const search = document.getElementById('search').value.toLowerCase();
    const container = document.getElementById('results_search');
    
    if (!container) return;
    
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
    );
    
    container.innerHTML = filtered.map(createCard).join('');
}

// Купить товар
function buyProduct(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        alert(`Вы купили: ${product.name} за ${product.price === 0 ? 'бесплатно' : product.price + '₽'}`);
    }
}

// Инициализация поиска
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.oninput = searchGames;
    }
});

// Глобальные функции
window.showCards = showCards;
window.searchGames = searchGames;
window.buyProduct = buyProduct;
