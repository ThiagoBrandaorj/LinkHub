const express = require('express');
const router = express.Router();
const Click = require('../models/Click');
const Visitor = require('../models/Visitor');
const Link = require('../models/Link');

// GET /api/stats/detailed - Estatísticas detalhadas
router.get('/detailed', async (req, res) => {
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