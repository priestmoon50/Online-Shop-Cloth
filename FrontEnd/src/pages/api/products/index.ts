// 📁 FrontEnd/src/pages/api/products.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/mongo';
import { Product } from '@/data/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { db } = await connectToDatabase();
  const collection = db.collection<Product>('products');

  try {
    switch (req.method) {
      // 🔍 دریافت همه محصولات یا یک محصول خاص
      case 'GET': {
        const { id } = req.query;

        if (id) {
          const numericId = Number(id);
          if (isNaN(numericId)) {
            return res.status(400).json({ message: 'Invalid product ID' });
          }

          const found = await collection.findOne({ id: numericId });
          if (!found) return res.status(404).json({ message: 'Product not found' });
          return res.status(200).json(found);
        }

        const all = await collection.find({}).toArray();
        return res.status(200).json(all);
      }

      // ➕ افزودن محصول جدید
      case 'POST': {
        const newProduct: Product = {
          ...req.body,
          id: Date.now(), // شناسه عددی
        };
        await collection.insertOne(newProduct);
        return res.status(201).json(newProduct);
      }

      // ✏️ ویرایش محصول
      case 'PUT': {
        const updatedProduct: Product = req.body;
        if (!updatedProduct.id) {
          return res.status(400).json({ message: 'Product ID is required for update' });
        }

        const result = await collection.updateOne(
          { id: updatedProduct.id },
          { $set: updatedProduct }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).json({ success: true, updated: updatedProduct });
      }

      // 🗑 حذف محصول
      case 'DELETE': {
        const { id } = req.query;
        const numericId = Number(id);

        if (!id || isNaN(numericId)) {
          return res.status(400).json({ message: 'Invalid product ID' });
        }

        const result = await collection.deleteOne({ id: numericId });

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).json({ success: true });
      }

      // ❌ متدهای غیرمجاز
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (err: any) {
    console.error('❌ MongoDB API Error:', err.message);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}
