import { NextResponse } from 'next/server';
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
  
  const template = getSharedTemplate(month);
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

  const savedTemplate = saveSharedTemplate(payload);
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
  
  const deleted = deleteSharedTemplate(month);
  return NextResponse.json({ ok: deleted });
}
