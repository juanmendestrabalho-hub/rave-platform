import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Token privado da Eventbrite e cidade de busca
const EVENTBRITE_TOKEN = process.env.EVENTBRITE_TOKEN;
const CITY_QUERY = 'São Paulo'; // Altere para a cidade desejada
const SEARCH_CATEGORY = 'rave';    // Termo de busca (ex: techno, rave, party)

interface EventbriteEvent {
  name: { text: string };
  description: { text: string };
  start: { utc: string };
  url: string;
  logo?: { url: string };
}

async function fetchAndSeedEvents() {
  if (!EVENTBRITE_TOKEN) {
    console.error('❌ Por favor, defina a variável EVENTBRITE_TOKEN no arquivo .env');
    return;
  }

  console.log(`🔎 Buscando eventos na Eventbrite para: "${SEARCH_CATEGORY}" em ${CITY_QUERY}...`);

  try {
    // Chamada para a API da Eventbrite
    const response = await fetch(
      `https://www.eventbriteapi.com/v3/events/search/?q=${encodeURIComponent(SEARCH_CATEGORY)}&location.address=${encodeURIComponent(CITY_QUERY)}&expand=venue`,
      {
        headers: {
          Authorization: `Bearer ${EVENTBRITE_TOKEN}`,
        },
      }
    );

    const data = await response.json();
    const events: EventbriteEvent[] = data.events || [];

    console.log(`⚡ ${events.length} eventos encontrados na Eventbrite!`);

    let importedCount = 0;

    for (const item of events) {
      // Formata os dados da Eventbrite para a estrutura do seu banco (Prisma)
      await prisma.event.upsert({
        where: { ticketUrl: item.url }, // Evita duplicados baseando-se no link do ingresso
        update: {
          title: item.name.text,
          description: item.description?.text || '',
          date: new Date(item.start.utc),
          imageUrl: item.logo?.url || null,
        },
        create: {
          title: item.name.text,
          description: item.description?.text || '',
          date: new Date(item.start.utc),
          location: CITY_QUERY,
          ticketUrl: item.url,
          imageUrl: item.logo?.url || null,
        },
      });
      importedCount++;
    }

    console.log(`✅ Sucesso! ${importedCount} eventos foram cadastrados/atualizados no Supabase.`);
  } catch (error) {
    console.error('❌ Erro durante a importação de eventos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fetchAndSeedEvents();
