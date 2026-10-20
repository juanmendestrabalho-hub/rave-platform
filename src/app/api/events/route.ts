import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
  const eventosExemplo = [
    {
      title: "Rave Underground Techno",
      description: "Festa de música eletrónica com DJs nacionais.",
      date: new Date("2026-11-15T22:00:00Z"),
      location: "São Paulo - SP",
      ticketUrl: "https://shotgun.live/pt-br/events/exemplo-1",
      imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7"
    },
    {
      title: "Psytrance Open Air",
      description: "12 horas de música e arte ao ar livre.",
      date: new Date("2026-12-05T18:00:00Z"),
      location: "Rio de Janeiro - RJ",
      ticketUrl: "https://www.sympla.com.br/exemplo-2",
      imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745"
    }
  ];

  try {
    let inseridos = 0;
    for (const evento of eventosExemplo) {
      await prisma.event.upsert({
        where: { ticketUrl: evento.ticketUrl },
        update: {},
        create: evento,
      });
      inseridos++;
    }

    return NextResponse.json({ 
      mensagem: `Sucesso! ${inseridos} eventos foram adicionados ao Supabase.` 
    });
  } catch (error) {
    return NextResponse.json({ erro: "Falha ao popular o banco de dados." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: 'asc' },
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error("Erro ao procurar eventos:", error);
    // Retorna uma lista vazia em vez de derrubar a API com erro 500
    return NextResponse.json([], { status: 200 });
  }
}
