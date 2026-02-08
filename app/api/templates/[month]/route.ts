import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { getSharedTemplate, saveSharedTemplate, deleteSharedTemplate } from '@/lib/bff-store';

function isValidMonth(month: string): boolean {
  // Check format YYYY-MM
  const regex = /^\d{4}-\d{2}$/;
  return regex.test(month);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ month: string }> }
) {
  const { month } = await params;
  
  if (!month) {
    return NextResponse.json({ error: 'month required' }, { status: 400 });
  }
  
  if (!isValidMonth(month)) {
    return NextResponse.json({ error: 'invalid month format (expected YYYY-MM)' }, { status: 400 });
  }
  
  const template = await getSharedTemplate(month);
  return NextResponse.json({ template });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ month: string }> }
) {
  const { month } = await params;
  
  if (!month) {
    return NextResponse.json({ error: 'month required' }, { status: 400 });
  }
  
  if (!isValidMonth(month)) {
    return NextResponse.json({ error: 'invalid month format (expected YYYY-MM)' }, { status: 400 });
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  if (!payload || payload.month !== month) {
    return NextResponse.json({ error: 'month mismatch or missing payload' }, { status: 400 });
  }

  const savedTemplate = await saveSharedTemplate(payload);
  return NextResponse.json(savedTemplate);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ month: string }> }
) {
  const { month } = await params;
  
  if (!month) {
    return NextResponse.json({ error: 'month required' }, { status: 400 });
  }
  
  if (!isValidMonth(month)) {
    return NextResponse.json({ error: 'invalid month format (expected YYYY-MM)' }, { status: 400 });
  }
  
  const deleted = await deleteSharedTemplate(month);
  return NextResponse.json({ ok: deleted });
}
