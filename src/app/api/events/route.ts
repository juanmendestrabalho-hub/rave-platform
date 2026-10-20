import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get('genre');
  const search = searchParams.get('search');

  try {
    const events = await prisma.event.findMany({
      where: {
        AND: [
          genre ? { genre: { equals: genre, mode: 'insensitive' } } : {},
          search ? { title: { contains: search, mode: 'insensitive' } } : {},
          { date: { gte: new Date() } } // Apenas eventos futuros
        ]
      },
      orderBy: { date: 'asc' } // Organização cronológica
    });
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar eventos' }, { status: 500 });
  }
}
