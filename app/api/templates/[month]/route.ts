import { NextResponse } from 'next/server';

interface SharedMonthlyTemplate {
  month: string;
  title: string;
  focus: string;
  morningRoutine: { id: string; text: string }[];
  healthHabits: { id: string; text: string }[];
  nightRoutine: { id: string; text: string }[];
  weeklyGoals: string[];
  readingGoal?: string;
}

// In-memory store (BFF mock). Replace with DB later.
const store: Map<string, SharedMonthlyTemplate> = new Map();

export async function GET(
  _req: Request,
  { params }: { params: { month: string } }
) {
  const month = params.month;
  if (!month) return NextResponse.json({ error: 'month required' }, { status: 400 });
  const template = store.get(month) ?? null;
  return NextResponse.json({ template });
}

export async function PUT(
  req: Request,
  { params }: { params: { month: string } }
) {
  const month = params.month;
  if (!month) return NextResponse.json({ error: 'month required' }, { status: 400 });

  let payload: SharedMonthlyTemplate;
  try {
    payload = (await req.json()) as SharedMonthlyTemplate;
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  if (!payload || payload.month !== month) {
    return NextResponse.json({ error: 'month mismatch or missing payload' }, { status: 400 });
  }

  store.set(month, payload);
  return NextResponse.json(payload);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { month: string } }
) {
  const month = params.month;
  if (!month) return NextResponse.json({ error: 'month required' }, { status: 400 });
  store.delete(month);
  return NextResponse.json({ ok: true });
}
