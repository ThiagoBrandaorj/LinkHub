-- Banco de dados para LinkTree
CREATE DATABASE linktree_db;

-- Conectar ao banco
\c linktree_db;

-- Tabela de visitantes
CREATE TABLE visitors (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45),
    user_agent TEXT,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, ip_address)
);

-- Tabela de links
CREATE TABLE links (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    url VARCHAR(500) NOT NULL,
    type VARCHAR(50),
    icon VARCHAR(100),
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de cliques
CREATE TABLE clicks (
    id SERIAL PRIMARY KEY,
    link_id INTEGER REFERENCES links(id) ON DELETE CASCADE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date DATE DEFAULT CURRENT_DATE
);

-- Inserir dados de exemplo
INSERT INTO links (title, description, url, type, icon, order_index) VALUES
('Whatsapp', 'Agende seu churrasco', 'http://wa.me/5521965970932', 'whatsapp', 'fab fa-whatsapp', 1),
('Instagram', 'Assista aos meus vídeos', 'https://www.instagram.com/cheffabriciodiniz', 'instagram', 'fab fa-instagram', 2),
('E-mail', 'Explore meus projetos', 'mailto:cheffabriciodiniz@gmail.com', 'email', 'fas fa-envelope', 3),
('TikTok', 'Conecte-se profissionalmente', 'https://www.tiktok.com/@cheffabriciodiniz', 'tiktok', 'fab fa-tiktok', 4),
('Kwai', 'Siga-me no Kwai', 'https://kwai-video.com/u/@cheffabriciodiniz', 'kwai', 'fas fa-video', 5);

-- Criar índices para melhor performance
CREATE INDEX idx_visitors_date ON visitors(date);
CREATE INDEX idx_clicks_date ON clicks(date);
CREATE INDEX idx_clicks_link_id ON clicks(link_id);