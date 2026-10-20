import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
