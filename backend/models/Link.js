const db = require('../config/database');

class Link {
  static async getAll() {
    const result = await db.query(
      'SELECT * FROM links WHERE is_active = true ORDER BY order_index ASC'
    );
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query('SELECT * FROM links WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async addClick(linkId, ip, userAgent) {
    const today = new Date().toISOString().split('T')[0];
    
    await db.query(
      'INSERT INTO clicks (link_id, ip_address, user_agent, date) VALUES ($1, $2, $3, $4)',
      [linkId, ip, userAgent, today]
    );
    
    return { success: true };
  }

  static async getClickStats(linkId = null) {
    let query;
    let params = [];
    
    if (linkId) {
      query = `
        SELECT 
          COUNT(*) as total_clicks,
          COUNT(DISTINCT ip_address) as unique_clicks,
          DATE(clicked_at) as date
        FROM clicks 
        WHERE link_id = $1 
        GROUP BY DATE(clicked_at)
        ORDER BY date DESC
        LIMIT 30
      `;
      params = [linkId];
    } else {
      query = `
        SELECT 
          COUNT(*) as total_clicks,
          DATE(clicked_at) as date
        FROM clicks 
        GROUP BY DATE(clicked_at)
        ORDER BY date DESC
        LIMIT 30
      `;
    }
    
    const result = await db.query(query, params);
    return result.rows;
  }
}

module.exports = Link;