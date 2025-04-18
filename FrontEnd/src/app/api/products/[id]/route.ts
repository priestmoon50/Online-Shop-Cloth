// 📁 src/app/api/products/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongo';
import { Product } from '@/data/types';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const numericId = Number(params.id);
  if (isNaN(numericId)) {
    return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 });
  }

  const { db } = await connectToDatabase();
  const collection = db.collection<Product>('products');
  const product = await collection.findOne({ id: numericId });

  if (!product) {
    return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json(product, { status: 200 });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const numericId = Number(params.id);
  if (isNaN(numericId)) {
    return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 });
  }

  const updatedData: Product = await request.json();

  const { db } = await connectToDatabase();
  const collection = db.collection<Product>('products');

  const result = await collection.updateOne(
    { id: numericId },
    { $set: updatedData }
  );

  if (result.matchedCount === 0) {
    return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, updated: updatedData }, { status: 200 });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const numericId = Number(params.id);
  if (isNaN(numericId)) {
    return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 });
  }

  const { db } = await connectToDatabase();
  const collection = db.collection<Product>('products');

  const result = await collection.deleteOne({ id: numericId });

  if (result.deletedCount === 0) {
    return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
