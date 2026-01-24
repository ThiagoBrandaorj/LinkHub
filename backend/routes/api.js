const express = require('express');
const router = express.Router();
const visitorCounter = require('../middleware/visitorCounter');
const Link = require('../models/Link');
const Visitor = require('../models/Visitor');
const Click = require('../models/Click');

// Middleware para contar visitantes em todas as rotas da API
router.use(visitorCounter);

// GET /api/links - Listar todos os links
router.get('/links', async (req, res) => {
  try {
    const links = await Link.getAll();
    res.json({ links });
  } catch (error) {
    console.error('Erro ao buscar links:', error);
    res.status(500).json({ error: 'Erro ao buscar links' });
  }
});

// POST /api/links/:id/click - Registrar clique em um link
router.post('/links/:id/click', async (req, res) => {
  try {
    const linkId = parseInt(req.params.id);
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    
    // Verificar se o link existe
    const link = await Link.getById(linkId);
    if (!link) {
      return res.status(404).json({ error: 'Link não encontrado' });
    }
    
    // Registrar clique
    await Link.addClick(linkId, ip, userAgent);
    
    res.json({ 
      success: true, 
      message: 'Clique registrado',
      linkId 
    });
  } catch (error) {
    console.error('Erro ao registrar clique:', error);
    res.status(500).json({ error: 'Erro ao registrar clique' });
  }
});

// GET /api/stats - Obter estatísticas gerais
router.get('/stats', async (req, res) => {
  try {
    const [totalLinks, totalClicks, todayVisitors, todayClicks] = await Promise.all([
      Link.getAll().then(links => links.length),
      Click.getTotalClicks(),
      Visitor.getTodayCount(),
      Click.getTodayClicks()
    ]);
    
    res.json({
      total_links: totalLinks,
      total_clicks: totalClicks,
      visitors_today: todayVisitors,
      clicks_today: todayClicks,
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// GET /api/stats/detailed - Estatísticas detalhadas
router.get('/stats/detailed', async (req, res) => {
  try {
    const [todayVisitors, totalVisitors, topLinks, clickStats] = await Promise.all([
      Visitor.getTodayCount(),
      Visitor.getTotalCount(),
      Click.getTopLinks(),
      Link.getClickStats()
    ]);
    
    res.json({
      visitors: {
        today: todayVisitors,
        total: totalVisitors
      },
      top_links: topLinks,
      click_history: clickStats,
      period: '30_dias'
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas detalhadas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas detalhadas' });
  }
});

module.exports = router;