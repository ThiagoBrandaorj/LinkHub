const db = require('../config/database');

class Visitor {
  static async addVisitor(ip, userAgent) {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      // Verificar se já existe registro para este IP hoje
      const existing = await db.query(
        'SELECT id FROM visitors WHERE date = $1 AND ip_address = $2',
        [today, ip]
      );
      
      if (existing.rows.length === 0) {
        // Adicionar novo visitante
        await db.query(
          'INSERT INTO visitors (ip_address, user_agent, date) VALUES ($1, $2, $3)',
          [ip, userAgent, today]
        );
        return { isNew: true };
      }
      return { isNew: false };
    } catch (error) {
      console.error('Erro ao adicionar visitante:', error);
      throw error;
    }
  }

  static async getTodayCount() {
    const today = new Date().toISOString().split('T')[0];
    
    const result = await db.query(
      'SELECT COUNT(*) as count FROM visitors WHERE date = $1',
      [today]
    );
    
    return parseInt(result.rows[0].count);
  }

  static async getTotalCount() {
    const result = await db.query('SELECT COUNT(*) as count FROM visitors');
    return parseInt(result.rows[0].count);
  }
}

module.exports = Visitor;