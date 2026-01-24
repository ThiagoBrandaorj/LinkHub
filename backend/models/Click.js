const db = require('../config/database');

class Click {
  static async getTotalClicks() {
    const result = await db.query('SELECT COUNT(*) as count FROM clicks');
    return parseInt(result.rows[0].count);
  }

  static async getTodayClicks() {
    const today = new Date().toISOString().split('T')[0];
    
    const result = await db.query(
      'SELECT COUNT(*) as count FROM clicks WHERE date = $1',
      [today]
    );
    
    return parseInt(result.rows[0].count);
  }

  static async getTopLinks(limit = 5) {
    const result = await db.query(`
      SELECT 
        l.id,
        l.title,
        COUNT(c.id) as click_count
      FROM links l
      LEFT JOIN clicks c ON l.id = c.link_id
      GROUP BY l.id, l.title
      ORDER BY click_count DESC
      LIMIT $1
    `, [limit]);
    
    return result.rows;
  }
}

module.exports = Click;