import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';
import axios from 'axios';
import puppeteer from 'puppeteer';

const prisma = new PrismaClient();

// Interface padrão dos eventos capturados
interface ScrapedEvent {
  title: string;
  description?: string;
  date: Date;
  location: string;
  ticketUrl: string;
  imageUrl?: string;
}

// -------------------------------------------------------------
// 1. SCRAPER DA SYMPLA (Usa Cheerio / HTML Estático)
// -------------------------------------------------------------
async function scrapeSympla(term: string, city: string): Promise<ScrapedEvent[]> {
  console.log(`🔎 [Sympla] Buscando por "${term}" em ${city}...`);
  const events: ScrapedEvent[] = [];

  try {
    const url = `https://www.sympla.com.br/eventos/${encodeURIComponent(city)}?s=${encodeURIComponent(term)}`;
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const $ = cheerio.load(data);

    // Percorre cada card de evento na lista da Sympla
    $('.sympla-card').each((_, element) => {
      const title = $(element).find('.event-name').text().trim();
      const ticketUrl = $(element).attr('href') || '';
      const imageUrl = $(element).find('img').attr('src') || '';
      const locationText = $(element).find('.event-location').text().trim() || city;

      if (title && ticketUrl) {
        events.push({
          title,
          description: `Evento importado da Sympla: ${title}`,
          date: new Date(), // A Sympla requer parsing de texto para data exata
          location: locationText,
          ticketUrl: ticketUrl.startsWith('http') ? ticketUrl : `https://www.sympla.com.br${ticketUrl}`,
          imageUrl,
        });
      }
    });

    console.log(`✅ [Sympla] Encontrados: ${events.length} eventos.`);
  } catch (error) {
    console.error('❌ [Sympla] Erro na raspagem:', error);
  }

  return events;
}

// -------------------------------------------------------------
// 2. SCRAPER DA SHOTGUN (Usa Puppeteer / Renderização Dinâmica)
// -------------------------------------------------------------
async function scrapeShotgun(city: string): Promise<ScrapedEvent[]> {
  console.log(`🔎 [Shotgun] Buscando festas em ${city}...`);
  const events: ScrapedEvent[] = [];

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    // Acessa a busca da Shotgun por cidade
    await page.goto(`https://shotgun.live/pt-br/cities/${encodeURIComponent(city.toLowerCase())}`, {
      waitUntil: 'networkidle2',
    });

    // Espera os cards de evento carregarem na tela
    await page.waitForSelector('a[href*="/events/"]', { timeout: 10000 }).catch(() => null);

    // Extrai os dados do DOM renderizado
    const rawEvents = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="/events/"]'));
      return links.map((link) => {
        const anchor = link as HTMLAnchorElement;
        const titleEl = anchor.querySelector('h2, h3, [class*="title"]');
        const imgEl = anchor.querySelector('img');

        return {
          title: titleEl ? titleEl.textContent?.trim() : '',
          ticketUrl: anchor.href,
          imageUrl: imgEl ? imgEl.src : '',
        };
      });
    });

    await browser.close();

    // Filtra e formata os eventos capturados
    for (const item of rawEvents) {
      if (item.title && item.ticketUrl) {
        events.push({
          title: item.title,
          description: `Festa capturada via Shotgun: ${item.title}`,
          date: new Date(),
          location: city,
          ticketUrl: item.ticketUrl,
          imageUrl: item.imageUrl,
        });
      }
    }

    console.log(`✅ [Shotgun] Encontrados: ${events.length} eventos.`);
  } catch (error) {
    console.error('❌ [Shotgun] Erro na raspagem:', error);
  }

  return events;
}

// -------------------------------------------------------------
// EXECUTOR E GRAVAÇÃO NO SUPABASE
// -------------------------------------------------------------
async function runAllScrapers() {
  const city = 'sao-paulo';
  
  // Roda ambos os robôs
  const symplaEvents = await scrapeSympla('rave', city);
  const shotgunEvents = await scrapeShotgun(city);

  const allEvents = [...symplaEvents, ...shotgunEvents];

  console.log(`\n🚀 Salvando ${allEvents.length} eventos no Supabase...`);

  let inserted = 0;
  for (const event of allEvents) {
    try {
      await prisma.event.upsert({
        where: { ticketUrl: event.ticketUrl }, // Evita duplicar se o link já existir no banco
        update: {
          title: event.title,
          imageUrl: event.imageUrl,
        },
        create: {
          title: event.title,
          description: event.description || '',
          date: event.date,
          location: event.location,
          ticketUrl: event.ticketUrl,
          imageUrl: event.imageUrl,
        },
      });
      inserted++;
    } catch (err) {
      console.error(`Erro ao salvar evento ${event.title}:`, err);
    }
  }

  console.log(`🎉 Processo concluído! ${inserted} eventos foram sincronizados.`);
  await prisma.$disconnect();
}

runAllScrapers();
