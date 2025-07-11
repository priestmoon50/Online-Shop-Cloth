// 📁 src/app/api/products/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongo';
import { Product } from '@/data/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  const { db } = await connectToDatabase();
  const collection = db.collection<Product>('products');

  try {
    if (id) {
      const numericId = Number(id);
      if (isNaN(numericId)) {
        return NextResponse.json({ message: 'invalidProductId' }, { status: 400 });
      }

      const found = await collection.findOne({ id: numericId });
      if (!found) {
        return NextResponse.json({ message: 'productNotFound' }, { status: 404 });
      }

      return NextResponse.json(found, { status: 200 });
    }

    const all = await collection.find({}).toArray();
    return NextResponse.json(all, { status: 200 });
  } catch (error: any) {
    console.error('❌ GET Error:', error);
    return NextResponse.json({ message: 'serverError', error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection<Product>('products');
    const body = await req.json();

    const newProduct: Product = {
      ...body,
      id: Date.now(),
      isNew: !!body.isNew,
      createdAt: new Date(),
      sizes: body.sizes || [],
      colors: body.colors || [],
    };

    await collection.insertOne(newProduct);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    console.error('❌ POST Error:', error);
    return NextResponse.json({ message: 'serverError', error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const updatedProduct: Product = {
      ...body,
      isNew: !!body.isNew,
      sizes: body.sizes || [],
      colors: body.colors || [],
    };

    if (!updatedProduct.id) {
      return NextResponse.json({ message: 'productIdRequired' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const collection = db.collection<Product>('products');

    const result = await collection.updateOne(
      { id: updatedProduct.id },
      { $set: updatedProduct }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'productNotFound' }, { status: 404 });
    }

    return NextResponse.json({ success: true, updated: updatedProduct }, { status: 200 });
  } catch (error: any) {
    console.error('❌ PUT Error:', error);
    return NextResponse.json({ message: 'serverError', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ message: 'invalidProductId' }, { status: 400 });
  }

  const numericId = Number(id);

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection<Product>('products');

    const result = await collection.deleteOne({ id: numericId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'productNotFound' }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('❌ DELETE Error:', error);
    return NextResponse.json({ message: 'serverError', error: error.message }, { status: 500 });
  }
}
