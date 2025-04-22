// 📁 src/app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongo';
import { ObjectId } from 'mongodb';

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  try {
    const orderId = context.params.id;
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const result = await db.collection('orders').updateOne(
      { _id: new ObjectId(orderId) },
      { $set: { status } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Order not found or status unchanged' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Order status updated successfully' });
  } catch (error: any) {
    console.error('❌ Error updating order status:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
