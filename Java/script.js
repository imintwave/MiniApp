// Данные товаров
const products = [
    {
        id: 1,
        name: "Minecraft",
        price: 1999,
        oldPrice: 2499,
        img: "https://via.placeholder.com/250x150/4CAF50/fff?text=Minecraft",
        category: "игра",
        description: "Песочница с кубической графикой",
        version: "1.20"
    },
    { 
        id: 2,
        name: "GTA V",
        price: 2999,
        oldPrice: 3499,
        img: "https://via.placeholder.com/250x150/2196F3/fff?text=GTA+V",
        category: "игра",
        description: "Криминальная сага в Лос-Сантосе",
        version: "Premium"
    },
    {
        id: 3,
        name: "CS:GO",
        price: 0,
        oldPrice: 1499,
        img: "https://via.placeholder.com/250x150/FF9800/fff?text=CS:GO",
        category: "игра",
        description: "Тактический шутер",
        version: "Free"
    },
    {
        id: 4,
        name: "Cyberpunk 2077",
        price: 3999,
        oldPrice: null,
        img: "https://via.placeholder.com/250x150/9C27B0/fff?text=Cyberpunk",
        category: "игра",
        description: "Ролевая игра в будущем",
        version: "2.0"
    },
    {
        id: 5,
        name: "The Witcher 3",
        price: 1499,
        oldPrice: 2999,
        img: "https://via.placeholder.com/250x150/E91E63/fff?text=Witcher+3",
        category: "игра",
        description: "Фэнтези РПГ про ведьмака",
        version: "Complete"
    },
    {
        id: 6,
        name: "Fortnite",
        price: 0,
        oldPrice: null,
        img: "https://via.placeholder.com/250x150/00BCD4/fff?text=Fortnite",
        category: "игра",
        description: "Королевская битва",
        version: "Chapter 5"
    }
];

// Создание карточки
function createCard(product) {
    return `
        <div class="card">
            <img src="${product.img}" alt="${product.name}">
            <div class='card-text'>
                <p1>${product.name}</p1><br><br>
                <div class='product-version'>${product.version}</div><br>
                <p2>${product.description}</p2><br>
                <p>Цена: ${product.price === 0 ? 'Бесплатно' : product.price + '₽'}</p>
            </div>
            <button onclick="buy(${product.id})">Купить</button>
        </div>
    `;
}

// Показать все карточки
function showCards() {
    const container = document.getElementById('results_search');
    if (container) {
        container.innerHTML = `<div class="cards-container">${products.map(createCard).join('')}</div>`;
    }
}

// Поиск товаров
function searchGames() {
    const search = document.getElementById('search').value.toLowerCase();
    const container = document.getElementById('results_search');
    
    if (container) {
        const filtered = products.filter(p => 
            p.name.toLowerCase().includes(search) ||
            p.description.toLowerCase().includes(search) ||
            p.category.toLowerCase().includes(search)
        );
        
        container.innerHTML = `<div class="cards-container">${filtered.map(createCard).join('')}</div>`;
    }
}

// Функция покупки
function buy(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        alert(`Вы купили: ${product.name} за ${product.price === 0 ? 'бесплатно' : product.price + '₽'}`);
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    console.log('Загружен products.js');
    showCards();
});

// Экспорт функций для использования в HTML
window.searchGames = searchGames;
window.buy = buy;
