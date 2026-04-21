document.addEventListener('DOMContentLoaded', () => {
    fetchOrdersAndRender();
    
    // Auto-refresh every 2 seconds to check for new localStorage updates
    // (In case the user places an order in another tab)
    setInterval(fetchOrdersAndRender, 2000);
    
    // Also tap into storage events for immediate sync across tabs
    window.addEventListener('storage', (event) => {
        if (event.key === 'drink_orders') {
            fetchOrdersAndRender();
        }
    });
});

function getOrdersFromStorage() {
    const savedOrders = localStorage.getItem('drink_orders');
    return savedOrders ? JSON.parse(savedOrders) : [];
}

function fetchOrdersAndRender() {
    const orders = getOrdersFromStorage();
    renderAdminDashboard(orders);
}

function renderAdminDashboard(orders) {
    const revenue = orders.reduce((sum, order) => sum + order.total_price, 0);
    
    document.getElementById('total-revenue').textContent = revenue.toLocaleString();
    document.getElementById('total-orders').textContent = orders.length;
    
    const tbody = document.getElementById('orders-tbody');
    tbody.innerHTML = '';
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px; color: var(--text-muted);">本機尚無訂單紀錄</td></tr>';
        return;
    }
    
    // Reverse to show newest first
    const sortedOrders = [...orders].reverse();
    
    sortedOrders.forEach(order => {
        const tr = document.createElement('tr');
        
        const itemsStr = order.items.map(item => `${item.name} x${item.quantity}`).join('<br>');
        
        tr.innerHTML = `
            <td>${order.timestamp}</td>
            <td style="font-weight:bold; color:#4a5568;">#${order.id.toString().padStart(4, '0')}</td>
            <td>${itemsStr}</td>
            <td>$<span style="font-weight: bold; color: var(--primary-hover)">${order.total_price.toLocaleString()}</span></td>
            <td><span class="status-badge">已出單</span></td>
            <td><button class="btn-danger" onclick="deleteOrder(${order.id})">刪除</button></td>
        `;
        tbody.appendChild(tr);
    });
}

// Optional function to let admins delete an order easily
function deleteOrder(id) {
    if (confirm('確定要刪除這筆訂單嗎？')) {
        let orders = getOrdersFromStorage();
        orders = orders.filter(o => o.id !== id);
        localStorage.setItem('drink_orders', JSON.stringify(orders));
        fetchOrdersAndRender();
    }
}
