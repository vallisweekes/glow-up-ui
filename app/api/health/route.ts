import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await prisma.$queryRawUnsafe<{ ok: number }[]>(`SELECT 1 as ok`);
    return NextResponse.json({ 
      ok: true, 
      db: result?.[0]?.ok === 1,
      version: '2.0.0-imports-fixed',
      timestamp: new Date().toISOString()
    });
  } catch (e: any) {
    const details = {
      message: e?.message,
      code: e?.code,
      name: e?.name,
      cause: e?.cause?.message || e?.cause,
    };
    return NextResponse.json({ ok: false, error: 'Error connecting to database', details }, { status: 500 });
  }
}
