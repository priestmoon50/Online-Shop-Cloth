// 📁 src/app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongo';

export async function GET(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const orders = await db.collection('orders').find().sort({ createdAt: -1 }).toArray();

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('❌ Error fetching orders:', error.message);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
