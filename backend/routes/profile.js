const express = require('express');
const router = express.Router();

// GET /api/profile - Dados do perfil
router.get('/', (req, res) => {
  const profileData = {
    name: "Fabrício Diniz",
    title: "Chef de Cozinha • Especialista em Gastronomia",
    bio: "Transformando ingredientes em experiências memoráveis. Apaixonado por sabores autênticos e técnicas refinadas. Bem-vindo à minha cozinha!",
    avatarUrl: "images/fabricio.jpg",
    socialLinks: [
      { name: "Whatsapp", url: "http://wa.me/5521965970932", icon: "fab fa-whatsapp" },
      { name: "Instagram", url: "https://www.instagram.com/cheffabriciodiniz", icon: "fab fa-instagram" },
      { name: "E-mail", url: "mailto:cheffabriciodiniz@gmail.com", icon: "fas fa-envelope" },
      { name: "TikTok", url: "https://www.tiktok.com/@cheffabriciodiniz", icon: "fab fa-tiktok" },
      { name: "Kwai", url: "https://kwai-video.com/u/@cheffabriciodiniz", icon: "fas fa-video" }
    ]
  };
  
  res.json(profileData);
});

module.exports = router;