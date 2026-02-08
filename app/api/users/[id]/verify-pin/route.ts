import { NextRequest, NextResponse } from 'next/server';
import { verifyUserPin } from '@/lib/prisma-service';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { pin } = await req.json();
    
    if (!pin) {
      return NextResponse.json(
        { error: 'PIN is required' },
        { status: 400 }
      );
    }

    const isValid = await verifyUserPin(params.id, pin);
    return NextResponse.json({ isValid });
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return NextResponse.json(
      { error: 'Failed to verify PIN' },
      { status: 500 }
    );
  }
}
