// Elementos DOM
let elements = {
    totalClicks: null,
    visitorNumber: null,
    visitorsToday: null
};

// Estado da aplicação
let appState = {
    totalClicks: 0,
    visitorCount: 1,
    todayVisitors: 1,
    lastVisitDate: null
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
    
    // Configurar logo com interação adicional
    setupLogoInteractions();
});

// Inicializar elementos DOM
function initializeElements() {
    elements = {
        totalClicks: document.getElementById('total-clicks'),
        visitorNumber: document.getElementById('visitor-number'),
        visitorsToday: document.getElementById('visitors-today')
    };
}

// Configurar interações com a logo
function setupLogoInteractions() {
    const logo = document.querySelector('.logo');
    const footerLogo = document.querySelector('.footer-logo');
    
    if (logo) {
        logo.addEventListener('click', function() {
            this.style.transform = 'scale(1.1) rotate(10deg)';
            setTimeout(() => {
                this.style.transform = '';
            }, 300);
        });
    }
    
    if (footerLogo) {
        footerLogo.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Carregar dados do localStorage
function loadFromLocalStorage() {
    const savedClicks = localStorage.getItem('chef_total_clicks');
    const savedVisitors = localStorage.getItem('chef_visitor_count');
    const savedTodayVisitors = localStorage.getItem('chef_today_visitors');
    const savedLastDate = localStorage.getItem('chef_last_visit_date');
    
    // Obter data atual
    const today = new Date().toDateString();
    
    if (savedClicks) {
        appState.totalClicks = parseInt(savedClicks);
        updateTotalClicks();
    }
    
    if (savedVisitors) {
        appState.visitorCount = parseInt(savedVisitors);
    }
    
    // Verificar se é um novo dia
    if (savedLastDate === today && savedTodayVisitors) {
        appState.todayVisitors = parseInt(savedTodayVisitors);
    } else {
        // Novo dia, resetar contador diário
        appState.todayVisitors = 0;
        localStorage.setItem('chef_last_visit_date', today);
    }
    
    updateVisitorCounters();
}

// Inicializar contador de visitantes
function initializeVisitorCounter() {
    const today = new Date().toDateString();
    
    // Incrementar contadores
    appState.visitorCount++;
    appState.todayVisitors++;
    
    // Salvar no localStorage
    localStorage.setItem('chef_visitor_count', appState.visitorCount.toString());
    localStorage.setItem('chef_today_visitors', appState.todayVisitors.toString());
    localStorage.setItem('chef_last_visit_date', today);
    
    // Atualizar display
    updateVisitorCounters();
    
    // Animar contadores
    animateCounter('visitor-number', appState.visitorCount);
    animateCounter('visitors-today', appState.todayVisitors);
}

// Atualizar contadores de visitantes
function updateVisitorCounters() {
    if (elements.visitorNumber) {
        elements.visitorNumber.textContent = appState.visitorCount;
    }
    if (elements.visitorsToday) {
        elements.visitorsToday.textContent = appState.todayVisitors;
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
            
            // Efeito visual no card clicado
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
            
            // Salvar no localStorage
            localStorage.setItem('chef_total_clicks', appState.totalClicks.toString());
            
            // Mostrar notificação
            showClickNotification(this.querySelector('h3').textContent);
        });
    });
}

// Mostrar notificação de clique
function showClickNotification(platform) {
    const notifications = [
        `Ótimo! Indo para ${platform}...`,
        `Redirecionando para ${platform}!`,
        `Conectando com ${platform}...`,
        `${platform} aguarda você!`
    ];
    
    const randomMessage = notifications[Math.floor(Math.random() * notifications.length)];
    NotificationService.show(randomMessage, 'success');
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
    const duration = 800; // ms
    const steps = Math.abs(target - current);
    const stepTime = Math.max(20, duration / steps);
    
    let currentValue = current;
    
    // Efeito visual no elemento
    element.style.color = '#e74c3c';
    element.style.transform = 'scale(1.2)';
    
    const timer = setInterval(() => {
        currentValue += increment;
        element.textContent = currentValue;
        
        if (currentValue === target) {
            clearInterval(timer);
            // Resetar estilo
            setTimeout(() => {
                element.style.color = '';
                element.style.transform = '';
            }, 300);
        }
    }, stepTime);
}

// Serviço de notificações
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
            padding: 15px 25px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            border-radius: 10px;
            box-shadow: 0 8px 20px rgba(0,0,0,0.2);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-width: 300px;
            max-width: 90vw;
            animation: slideInRight 0.3s ease-out;
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
            border-left: 5px solid ${type === 'success' ? '#2ecc71' : type === 'error' ? '#c0392b' : '#2980b9'};
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255,255,255,0.2);
        `;
        
        // Adicionar ao documento
        document.body.appendChild(notification);
        
        // Configurar botão de fechar
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto-remover após 4 segundos
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, 4000);
        
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
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    font-size: 20px;
                    cursor: pointer;
                    margin-left: 15px;
                    padding: 0;
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: background 0.2s;
                }
                .notification-close:hover {
                    background: rgba(255,255,255,0.3);
                }
            `;
            document.head.appendChild(style);
        }
    }
}