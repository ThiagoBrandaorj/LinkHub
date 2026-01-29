// Elementos DOM
let elements = {
    totalClicks: null,
    visitorNumber: null,
    visitorsToday: null
};

// Estado da aplicação
let appState = {
    totalClicks: 0,
    visitorCount: 1
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    
    // Tentar carregar estatísticas do localStorage
    loadFromLocalStorage();
    
    // Inicializar contador de visitantes
    initializeVisitorCounter();
    
    // Adicionar eventos de clique aos links
    setupLinkTracking();
});

// Inicializar elementos DOM
function initializeElements() {
    elements = {
        totalClicks: document.getElementById('total-clicks'),
        visitorNumber: document.getElementById('visitor-number'),
        visitorsToday: document.getElementById('visitors-today')
    };
}

// Carregar dados do localStorage
function loadFromLocalStorage() {
    const savedClicks = localStorage.getItem('linkhub_total_clicks');
    const savedVisitors = localStorage.getItem('linkhub_visitor_count');
    
    if (savedClicks) {
        appState.totalClicks = parseInt(savedClicks);
        updateTotalClicks();
    }
    
    if (savedVisitors) {
        appState.visitorCount = parseInt(savedVisitors);
        updateVisitorCounter();
    }
}

// Inicializar contador de visitantes
function initializeVisitorCounter() {
    // Incrementar visitante atual
    appState.visitorCount++;
    
    // Salvar no localStorage
    localStorage.setItem('linkhub_visitor_count', appState.visitorCount.toString());
    
    // Atualizar display
    updateVisitorCounter();
    
    // Animar contador
    animateCounter('visitors-today', appState.visitorCount);
    animateCounter('visitor-number', appState.visitorCount);
}

// Atualizar contador de visitantes
function updateVisitorCounter() {
    if (elements.visitorNumber) {
        elements.visitorNumber.textContent = appState.visitorCount;
    }
    if (elements.visitorsToday) {
        elements.visitorsToday.textContent = appState.visitorCount;
    }
}

// Configurar tracking de cliques nos links
function setupLinkTracking() {
    const links = document.querySelectorAll('.link-card');
    
    links.forEach(link => {
        link.addEventListener('click', function(event) {
            // Incrementar contador de cliques
            appState.totalClicks++;
            
            // Atualizar display
            updateTotalClicks();
            
            // Animar contador
            animateCounter('total-clicks', appState.totalClicks);
            
            // Salvar no localStorage
            localStorage.setItem('linkhub_total_clicks', appState.totalClicks.toString());
            
            // Permitir que o link continue normalmente
            // (não prevenir default para que o link abra)
        });
    });
}

// Atualizar contador total de cliques
function updateTotalClicks() {
    if (elements.totalClicks) {
        elements.totalClicks.textContent = appState.totalClicks;
    }
}

// Animar contadores
function animateCounter(elementId, target) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const current = parseInt(element.textContent) || 0;
    if (current === target) return;
    
    const increment = target > current ? 1 : -1;
    const duration = 500; // ms
    const steps = Math.abs(target - current);
    const stepTime = duration / steps;
    
    let currentValue = current;
    const timer = setInterval(() => {
        currentValue += increment;
        element.textContent = currentValue;
        
        if (currentValue === target) {
            clearInterval(timer);
        }
    }, stepTime);
}

// Serviço de notificações (opcional)
class NotificationService {
    static show(message, type = 'info') {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        // Estilos da notificação
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-width: 300px;
            animation: slideInRight 0.3s ease-out;
        `;
        
        // Adicionar ao documento
        document.body.appendChild(notification);
        
        // Configurar botão de fechar
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
        
        // Adicionar animações CSS se não existirem
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 20px;
                    cursor: pointer;
                    margin-left: 10px;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: background 0.2s;
                }
                .notification-close:hover {
                    background: rgba(255,255,255,0.2);
                }
            `;
            document.head.appendChild(style);
        }
    }
}