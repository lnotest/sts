// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// Конфигурация
const config = {
    spinCost: 50,
    spinDuration: 5000,
    spinSpeed: 50
};

// Состояние приложения
const state = {
    balance: 0,
    selectedCase: null,
    isSpinning: false,
    currentGift: null
};

// Примеры кейсов и подарков (в реальном приложении будут загружаться с сервера)
const cases = [
    {
        id: 1,
        name: 'Обычный кейс',
        price: 50,
        gifts: [
            { id: 1, name: 'Подарок 1', value: 30, chance: 40 },
            { id: 2, name: 'Подарок 2', value: 50, chance: 30 },
            { id: 3, name: 'Подарок 3', value: 100, chance: 20 },
            { id: 4, name: 'Подарок 4', value: 200, chance: 10 }
        ]
    },
    {
        id: 2,
        name: 'Премиум кейс',
        price: 100,
        gifts: [
            { id: 5, name: 'Премиум подарок 1', value: 80, chance: 35 },
            { id: 6, name: 'Премиум подарок 2', value: 150, chance: 25 },
            { id: 7, name: 'Премиум подарок 3', value: 300, chance: 25 },
            { id: 8, name: 'Премиум подарок 4', value: 500, chance: 15 }
        ]
    }
];

// Инициализация приложения
function init() {
    // Загрузка баланса пользователя
    loadUserBalance();
    
    // Отображение доступных кейсов
    renderCases();
    
    // Добавление обработчиков событий
    addEventListeners();
}

// Загрузка баланса пользователя
function loadUserBalance() {
    // В реальном приложении здесь будет запрос к серверу
    state.balance = 1000; // Пример начального баланса
    updateBalanceDisplay();
}

// Обновление отображения баланса
function updateBalanceDisplay() {
    document.getElementById('stars').textContent = state.balance;
}

// Отображение доступных кейсов
function renderCases() {
    const container = document.getElementById('cases-container');
    container.innerHTML = '';

    cases.forEach(caseItem => {
        const caseElement = document.createElement('div');
        caseElement.className = 'case-item';
        caseElement.innerHTML = `
            <h3>${caseItem.name}</h3>
            <p>Цена: ${caseItem.price} ⭐</p>
        `;
        caseElement.onclick = () => selectCase(caseItem);
        container.appendChild(caseElement);
    });
}

// Выбор кейса
function selectCase(caseItem) {
    if (state.balance < caseItem.price) {
        tg.showAlert('Недостаточно звезд!');
        return;
    }

    state.selectedCase = caseItem;
    document.getElementById('cases').classList.add('hidden');
    document.getElementById('roulette').classList.remove('hidden');
    initializeRoulette(caseItem.gifts);
}

// Инициализация рулетки
function initializeRoulette(gifts) {
    const container = document.getElementById('roulette-items');
    container.innerHTML = '';

    // Создаем элементы рулетки
    gifts.forEach(gift => {
        const item = document.createElement('div');
        item.className = 'roulette-item';
        item.textContent = gift.name;
        container.appendChild(item);
    });
}

// Запуск рулетки
function startSpin() {
    if (state.isSpinning) return;

    state.balance -= config.spinCost;
    updateBalanceDisplay();
    state.isSpinning = true;

    const container = document.getElementById('roulette-items');
    const items = container.children;
    let position = 0;
    const totalWidth = items.length * 170; // 150px + 20px margin

    const spinInterval = setInterval(() => {
        position += config.spinSpeed;
        if (position >= totalWidth) {
            position = 0;
        }
        container.style.transform = `translateX(-${position}px)`;
    }, 50);

    // Остановка рулетки через заданное время
    setTimeout(() => {
        clearInterval(spinInterval);
        state.isSpinning = false;
        
        // Выбор случайного подарка с учетом шансов
        const selectedGift = selectRandomGift(state.selectedCase.gifts);
        state.currentGift = selectedGift;
        
        showResult(selectedGift);
    }, config.spinDuration);
}

// Выбор случайного подарка с учетом шансов
function selectRandomGift(gifts) {
    const totalChance = gifts.reduce((sum, gift) => sum + gift.chance, 0);
    let random = Math.random() * totalChance;
    
    for (const gift of gifts) {
        random -= gift.chance;
        if (random <= 0) {
            return gift;
        }
    }
    
    return gifts[0];
}

// Показать результат
function showResult(gift) {
    document.getElementById('roulette').classList.add('hidden');
    document.getElementById('result').classList.remove('hidden');
    document.getElementById('gift-result').textContent = `Вы выиграли: ${gift.name} (${gift.value} ⭐)`;
}

// Обработка продажи подарка
function sellGift() {
    if (!state.currentGift) return;
    
    state.balance += state.currentGift.value;
    updateBalanceDisplay();
    tg.showAlert(`Подарок продан за ${state.currentGift.value} ⭐`);
    resetGame();
}

// Обработка сохранения подарка
function keepGift() {
    if (!state.currentGift) return;
    
    tg.showAlert(`Подарок ${state.currentGift.name} добавлен в вашу коллекцию!`);
    resetGame();
}

// Сброс игры
function resetGame() {
    state.selectedCase = null;
    state.currentGift = null;
    document.getElementById('result').classList.add('hidden');
    document.getElementById('cases').classList.remove('hidden');
}

// Добавление обработчиков событий
function addEventListeners() {
    document.getElementById('spin-button').onclick = startSpin;
    document.getElementById('sell-button').onclick = sellGift;
    document.getElementById('keep-button').onclick = keepGift;
}

// Инициализация приложения при загрузке
document.addEventListener('DOMContentLoaded', init); 