
const cron = require('node-cron');
const { scrapeShotgun } = require('./index');

// Roda todos os dias às 03:00 da manhã
cron.schedule('0 3 * * *', async () => {
  console.log('Iniciando sincronização de eventos...');
  await scrapeShotgun();
  // Adicione outras plataformas aqui (Sympla, Ticket360)
});
