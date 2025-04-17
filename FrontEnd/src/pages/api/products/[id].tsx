// 📁 FrontEnd/src/pages/api/products/[id].ts

import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/mongo';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: 'Invalid product ID' });
  }

  const { db } = await connectToDatabase();
  const collection = db.collection('products');

  try {
    // ✅ دریافت محصول با GET
    if (req.method === 'GET') {
      const product = await collection.findOne({ _id: new ObjectId(id) });
      if (!product) return res.status(404).json({ message: 'Product not found' });
      return res.status(200).json(product);
    }

    // 🗑 حذف محصول با DELETE
    if (req.method === 'DELETE') {
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }
      return res.status(200).json({ success: true });
    }

    // ✏️ ویرایش محصول با PUT
    if (req.method === 'PUT') {
      const updatedData = req.body;
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }

      return res.status(200).json({ success: true, updated: updatedData });
    }

    // ❌ اگر متدی غیرمجاز باشد
    res.setHeader('Allow', ['GET', 'DELETE', 'PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('Error handling product by id:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}