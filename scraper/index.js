const puppeteer = require('puppeteer');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function scrapeShotgun() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Exemplo de URL de busca
  await page.goto('https://shotgun.live/pt-br/festivals', { waitUntil: 'networkidle2' });

  // Lógica de extração (Adaptar os seletores conforme o site oficial)
  const events = await page.evaluate(() => {
    const eventCards = Array.from(document.querySelectorAll('.event-card-selector'));
    return eventCards.map(card => ({
      title: card.querySelector('.title-selector')?.innerText || 'Rave XYZ',
      date: new Date(card.querySelector('.date-selector')?.getAttribute('datetime') || Date.now()),
      location: card.querySelector('.location-selector')?.innerText || 'São Paulo',
      city: 'São Paulo',
      state: 'SP',
      genre: 'Techno', // Simplificação - extrair via tags
      imageUrl: card.querySelector('img')?.src || '',
      ticketUrl: card.querySelector('a')?.href || '',
      platform: 'Shotgun'
    }));
  });

  await browser.close();

  // Salvar ou atualizar no Banco de Dados
  for (const event of events) {
    await prisma.event.create({ data: event });
  }
  console.log(`Foram sincronizados ${events.length} eventos da Shotgun.`);
}

module.exports = { scrapeShotgun };
