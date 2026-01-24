const Visitor = require('../models/Visitor');
const UAParser = require('ua-parser-js');

const visitorCounter = async (req, res, next) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    
    // Parse do User Agent para informações adicionais
    const parser = new UAParser(userAgent);
    const uaResult = parser.getResult();
    
    // Adicionar visitante (se for novo)
    await Visitor.addVisitor(ip, userAgent);
    
    // Adicionar informações do user agent ao request (opcional)
    req.userAgentInfo = {
      browser: `${uaResult.browser.name} ${uaResult.browser.version}`,
      os: `${uaResult.os.name} ${uaResult.os.version}`,
      device: uaResult.device.type || 'desktop'
    };
    
    next();
  } catch (error) {
    console.error('Erro no middleware de contador de visitantes:', error);
    next(); // Continuar mesmo com erro
  }
};

module.exports = visitorCounter;