// Configuração da API
const API_BASE_URL = 'http://localhost:5000/api';

// Elementos DOM
let elements = {
    name: null,
    title: null,
    bio: null,
    avatar: null,
    linksContainer: null,
    statsContainer: null,
    socialContainer: null,
    footerText: null,
    visitorNumber: null,
    apiStatus: null
};

// Estado da aplicação
let appState = {
    profile: null,
    links: [],
    stats: {},
    socialLinks: [],
    visitorCount: 0,
    apiConnected: false
};

// Inicialização
document.addEventListener('DOMContentLoaded', async function() {
    initializeElements();
    updateApiStatus('Conectando...', 'connecting');
    
    try {
        await checkApiConnection();
        await loadAllData();
        updateApiStatus('Conectado', 'connected');
        appState.apiConnected = true;
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        updateApiStatus('Desconectado', 'disconnected');
        loadFallbackData();
    }
    
    // Atualizar contador de visitantes a cada 10 segundos
    setInterval(updateVisitorCount, 10000);
});

// Inicializar elementos DOM
function initializeElements() {
    elements = {
        name: document.getElementById('name'),
        title: document.getElementById('title'),
        bio: document.getElementById('bio'),
        avatar: document.getElementById('avatar'),
        linksContainer: document.getElementById('links-container'),
        statsContainer: document.getElementById('stats'),
        socialContainer: document.getElementById('social-container'),
        footerText: document.getElementById('footer-text'),
        visitorNumber: document.getElementById('visitor-number'),
        apiStatus: document.getElementById('api-status')
    };
}

// Verificar conexão com a API
async function checkApiConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('API não respondeu corretamente');
        }
        
        const data = await response.json();
        return data.status === 'healthy';
    } catch (error) {
        throw new Error('Não foi possível conectar à API');
    }
}

// Carregar todos os dados da API
async function loadAllData() {
    try {
        // Carregar dados em paralelo
        const [profileData, linksData, statsData] = await Promise.all([
            fetchData('/profile'),
            fetchData('/links'),
            fetchData('/stats')
        ]);
        
        appState.profile = profileData;
        appState.links = linksData.links || [];
        appState.stats = statsData;
        appState.socialLinks = profileData.socialLinks || [];
        appState.visitorCount = statsData.visitors_today || 0;
        
        renderAll();
    } catch (error) {
        throw error;
    }
}

// Função genérica para buscar dados
async function fetchData(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
        throw new Error(`Erro ao buscar ${endpoint}`);
    }
    return await response.json();
}

// Renderizar todos os componentes
function renderAll() {
    renderProfile();
    renderLinks();
    renderStats();
    renderSocialLinks();
    updateVisitorCount();
}

// Renderizar perfil
function renderProfile() {
    if (!appState.profile) return;
    
    const { name, title, bio, avatarUrl } = appState.profile;
    
    elements.name.textContent = name;
    elements.title.textContent = title;
    elements.bio.textContent = bio;
    
    if (avatarUrl) {
        elements.avatar.innerHTML = '';
        const img = document.createElement('img');
        img.src = avatarUrl;
        img.alt = name;
        img.className = 'avatar-img';
        elements.avatar.appendChild(img);
    }
}

// Renderizar links
function renderLinks() {
    if (!appState.links.length) {
        elements.linksContainer.innerHTML = `
            <div class="no-links">
                <p>Nenhum link disponível no momento.</p>
            </div>
        `;
        return;
    }
    
    elements.linksContainer.innerHTML = appState.links.map(link => `
        <a href="${link.url}" target="_blank" class="link-card" data-link-id="${link.id}">
            <div class="link-icon">
                <i class="${link.icon || getDefaultIcon(link.type)}"></i>
            </div>
            <div class="link-content">
                <h3>${link.title}</h3>
                <p>${link.description}</p>
            </div>
        </a>
    `).join('');
    
    // Adicionar eventos de clique para tracking
    document.querySelectorAll('.link-card').forEach(card => {
        card.addEventListener('click', trackLinkClick);
    });
}

// Renderizar estatísticas
function renderStats() {
    if (!appState.stats) return;
    
    const { total_links, total_clicks, visitors_today } = appState.stats;
    
    elements.statsContainer.innerHTML = `
        <div class="stat-item">
            <span class="stat-number" id="total-links">${total_links || 0}</span>
            <span class="stat-label">Links</span>
        </div>
        <div class="stat-item">
            <span class="stat-number" id="total-clicks">${total_clicks || 0}</span>
            <span class="stat-label">Cliques</span>
        </div>
        <div class="stat-item">
            <span class="stat-number" id="visitors-today">${visitors_today || 0}</span>
            <span class="stat-label">Visitantes Hoje</span>
        </div>
    `;
    
    // Animar contadores
    animateCounter('total-links', total_links || 0);
    animateCounter('total-clicks', total_clicks || 0);
    animateCounter('visitors-today', visitors_today || 0);
}

// Renderizar links sociais
function renderSocialLinks() {
    if (!appState.socialLinks.length) return;
    
    elements.socialContainer.innerHTML = appState.socialLinks.map(social => `
        <a href="${social.url}" target="_blank" class="social-icon" title="${social.name}">
            <i class="${social.icon}"></i>
        </a>
    `).join('');
}

// Atualizar contador de visitantes
function updateVisitorCount() {
    if (appState.apiConnected) {
        // Buscar dados atualizados da API
        fetchData('/stats')
            .then(stats => {
                appState.visitorCount = stats.visitors_today || 0;
                elements.visitorNumber.textContent = appState.visitorCount;
                animateCounter('visitors-today', appState.visitorCount);
            })
            .catch(console.error);
    } else {
        // Incrementar contador local
        appState.visitorCount++;
        elements.visitorNumber.textContent = appState.visitorCount;
    }
}

// Track de cliques nos links
async function trackLinkClick(event) {
    const linkId = event.currentTarget.getAttribute('data-link-id');
    
    if (appState.apiConnected && linkId) {
        try {
            await fetch(`${API_BASE_URL}/links/${linkId}/click`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            // Atualizar contador local
            const totalClicksElement = document.getElementById('total-clicks');
            if (totalClicksElement) {
                const current = parseInt(totalClicksElement.textContent) || 0;
                totalClicksElement.textContent = current + 1;
                animateCounter('total-clicks', current + 1);
            }
        } catch (error) {
            console.error('Erro ao registrar clique:', error);
        }
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

// Atualizar status da API
function updateApiStatus(text, status) {
    if (!elements.apiStatus) return;
    
    elements.apiStatus.textContent = text;
    elements.apiStatus.className = '';
    
    switch(status) {
        case 'connected':
            elements.apiStatus.classList.add('api-connected');
            break;
        case 'disconnected':
            elements.apiStatus.classList.add('api-disconnected');
            break;
        case 'connecting':
            elements.apiStatus.style.color = '#f59e0b';
            break;
    }
}

// Carregar dados de fallback
function loadFallbackData() {
    appState.profile = {
        name: "Fabrício Diniz",
        title: "Chef de Cozinha • Especialista em Gastronomia",
        bio: "Transformando ingredientes em experiências memoráveis. Apaixonado por sabores autênticos e técnicas refinadas. Bem-vindo à minha cozinha!",
        socialLinks: [
            { name: "Whatsapp", url: "http://wa.me/5521965970932", icon: "fab fa-whatsapp" },
            { name: "Instagram", url: "https://www.instagram.com/cheffabriciodiniz?igsh=ZDZvd2E4OXU1eHV4&utm_source=qr", icon: "fab fa-instagram" },
            { name: "E-mail", url: "cheffabriciodiniz@gmail.com", icon: "fas fa-envelope" },
            { name: "TikTok", url: "https://www.tiktok.com/@cheffabriciodiniz?_r=1&_t=ZS-92oovDhabLs", icon: "fab fa-tiktok" },
            { name: "Kwai", url: "https://kwai-video.com/u/@cheffabriciodiniz/QCN6nvYN", icon: "fas fa-video" }
        ]
    };
    
    appState.links = [
        { id: 1, title: "Whatsapp", description: "Agende seu churrasco", url: "http://wa.me/5521965970932", type: "whatsapp", icon: "fab fa-whatsapp" },
        { id: 2, title: "Instagram", description: "Assista aos meus vídeos", url: "https://www.instagram.com/cheffabriciodiniz?igsh=ZDZvd2E4OXU1eHV4&utm_source=qr", type: "instagram", icon: "fab fa-instagram" },
        { id: 3, title: "E-mail", description: "Explore meus projetos", url: "cheffabriciodiniz@gmail.com", type: "email", icon: "fas fa-envelope" },
        { id: 4, title: "TikTok", description: "Conecte-se profissionalmente", url: "https://www.tiktok.com/@cheffabriciodiniz?_r=1&_t=ZS-92oovDhabLs", type: "tiktok", icon: "fab fa-tiktok" },
        { id: 5, title: "Kwai", description: "Siga-me no Kwai", url: "https://kwai-video.com/u/@cheffabriciodiniz/QCN6nvYN", type: "kwai", icon: "fas fa-video" }
    ];
    
    appState.stats = {
        total_links: 4,
        total_clicks: 0,
        visitors_today: 1
    };
    
    renderAll();
}

// Obter ícone padrão baseado no tipo
function getDefaultIcon(type) {
    const iconMap = {
        'instagram': 'fab fa-instagram',
        'youtube': 'fab fa-youtube',
        'github': 'fab fa-github',
        'linkedin': 'fab fa-linkedin',
        'twitter': 'fab fa-twitter',
        'facebook': 'fab fa-facebook',
        'whatsapp': 'fab fa-whatsapp',
        'website': 'fas fa-globe',
        'portfolio': 'fas fa-briefcase',
        'blog': 'fas fa-blog',
        'email': 'fas fa-envelope',
        'default': 'fas fa-link'
    };
    
    return iconMap[type] || iconMap.default;
}

// Serviço de notificações (opcional)
class NotificationService {
    static show(message, type = 'info') {
        // Implementar sistema de notificações se necessário
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}