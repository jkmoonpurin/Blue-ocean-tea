let cart = [];

// Static data directly embedded
const menuData = [
    {id: 1, name: "珍珠奶茶 (Pearl Milk Tea)", price: 60, image: "images/pearl.png"},
    {id: 2, name: "經典紅茶 (Black Tea)", price: 30, image: "images/black.png"},
    {id: 3, name: "茉莉綠茶 (Green Tea)", price: 30, image: "images/green.png"},
    {id: 4, name: "鮮奶茶 (Milk Tea)", price: 50, image: "images/milk.png"},
    {id: 5, name: "烏龍茶 (Oolong Tea)", price: 35, image: "images/oolong.png"},
    {id: 6, name: "桂花奶青 (Osmanthus Milk Green Tea)", price: 65, image: "images/osmanthus.png"}
];

document.addEventListener('DOMContentLoaded', () => {
    renderMenu();
    document.getElementById('checkout-btn').addEventListener('click', checkout);
    document.getElementById('clear-data-btn').addEventListener('click', () => {
        if(confirm('確定要清除手機端資料與訂單紀錄嗎？')) {
            localStorage.removeItem('drink_orders');
            cart = [];
            renderCart();
            alert('本機資料已清除');
        }
    });
});

function renderMenu() {
    const container = document.getElementById('menu-container');
    container.innerHTML = '';
    
    menuData.forEach(item => {
        const div = document.createElement('div');
        div.className = 'menu-item';
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="menu-img">
            <div class="menu-info">
                <div class="menu-name">${item.name}</div>
                <div class="menu-price">$${item.price}</div>
                <button class="btn-add" onclick="addToCart(${item.id})">加入購物車</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function addToCart(id) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        const menuItem = menuData.find(item => item.id === id);
        if (menuItem) {
            cart.push({
                id: menuItem.id,
                name: menuItem.name,
                price: menuItem.price,
                quantity: 1
            });
        }
    }
    renderCart();
}

function updateQuantity(id, delta) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== id);
        }
    }
    renderCart();
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const totalSpan = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    container.innerHTML = '';
    let total = 0;
    
    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-cart">購物車還是空的哦！</p>';
        checkoutBtn.disabled = true;
    } else {
        checkoutBtn.disabled = false;
        cart.forEach(item => {
            total += item.price * item.quantity;
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            `;
            container.appendChild(div);
        });
    }
    
    totalSpan.textContent = total;
}

function checkout() {
    if (cart.length === 0) return;
    
    // Calculate total price
    const total_price = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Fetch existing orders from localStorage
    const savedOrders = localStorage.getItem('drink_orders');
    let orders = savedOrders ? JSON.parse(savedOrders) : [];
    
    // Generate new ID based on existing orders
    const newId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1;
    
    // Make timestamp
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;

    // Create order object
    const newOrder = {
        id: newId,
        items: cart,
        total_price: total_price,
        status: "completed",
        timestamp: timestamp
    };
    
    // Save to localStorage
    orders.push(newOrder);
    localStorage.setItem('drink_orders', JSON.stringify(orders));
    
    // Clear cart
    cart = [];
    renderCart();
    showToast();
}

function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
