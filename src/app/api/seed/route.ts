import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
  const eventosExemplo = [
    {
      title: "Rave Underground Techno",
      city: "São Paulo",
      state: "SP",
      genre: "Techno",
      platform: "Shotgun",
      date: new Date("2026-11-15T22:00:00Z"),
      location: "São Paulo - SP",
      ticketUrl: "https://shotgun.live/pt-br/events/exemplo-1",
      imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7"
    },
    {
      title: "Psytrance Open Air",
      city: "Rio de Janeiro",
      state: "RJ",
      genre: "Psytrance",
      platform: "Sympla",
      date: new Date("2026-12-05T18:00:00Z"),
      location: "Rio de Janeiro - RJ",
      ticketUrl: "https://www.sympla.com.br/exemplo-2",
      imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745"
    }
  ];

  try {
    let inseridos = 0;
    for (const evento of eventosExemplo) {
      // Procura se já existe evento com este ticketUrl
      const existente = await prisma.event.findFirst({
        where: { ticketUrl: evento.ticketUrl }
      });

      if (!existente) {
        await prisma.event.create({
          data: evento
        });
        inseridos++;
      }
    }

    return NextResponse.json({ 
      mensagem: `Sucesso! ${inseridos} eventos foram adicionados ao Supabase.` 
    });
  } catch (error) {
    console.error("Erro no Seed:", error);
    return NextResponse.json({ erro: "Falha ao popular o banco de dados." }, { status: 500 });
  }
}
