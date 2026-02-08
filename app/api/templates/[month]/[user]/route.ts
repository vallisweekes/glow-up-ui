import { NextResponse } from 'next/server';
import { getMonthlyTemplate, saveMonthlyTemplate, deleteMonthlyTemplate } from '@/lib/bff-store';
import { getUserByName } from '@/lib/prisma-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isValidMonth(month: string): boolean {
  const regex = /^\d{4}-\d{2}$/;
  return regex.test(month);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ month: string; user: string }> }
) {
  const { month, user } = await params;

  if (!month || !user) {
    return NextResponse.json({ error: 'month and user required' }, { status: 400 });
  }
  if (!isValidMonth(month)) {
    return NextResponse.json({ error: 'invalid month format (expected YYYY-MM)' }, { status: 400 });
  }

  const dbUser = await getUserByName(user);
  if (!dbUser) {
    return NextResponse.json({ error: 'user not found in database' }, { status: 404 });
  }

  const template = await getMonthlyTemplate(month, dbUser.id);
  return NextResponse.json({ template });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ month: string; user: string }> }
) {
  const { month, user } = await params;

  if (!month || !user) {
    return NextResponse.json({ error: 'month and user required' }, { status: 400 });
  }
  if (!isValidMonth(month)) {
    return NextResponse.json({ error: 'invalid month format (expected YYYY-MM)' }, { status: 400 });
  }

  const dbUser = await getUserByName(user);
  if (!dbUser) {
    return NextResponse.json({ error: 'user not found in database' }, { status: 404 });
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  if (!payload || payload.month !== month) {
    return NextResponse.json({ error: 'month mismatch or missing payload' }, { status: 400 });
  }

  const saved = await saveMonthlyTemplate(payload, dbUser.id);
  return NextResponse.json(saved);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ month: string; user: string }> }
) {
  const { month, user } = await params;

  if (!month || !user) {
    return NextResponse.json({ error: 'month and user required' }, { status: 400 });
  }
  if (!isValidMonth(month)) {
    return NextResponse.json({ error: 'invalid month format (expected YYYY-MM)' }, { status: 400 });
  }

  const dbUser = await getUserByName(user);
  if (!dbUser) {
    return NextResponse.json({ error: 'user not found in database' }, { status: 404 });
  }

  const ok = await deleteMonthlyTemplate(month, dbUser.id);
  return NextResponse.json({ ok });
}
