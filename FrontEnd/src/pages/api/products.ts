// 📁 فایل: pages/api/products.ts (نسخه متصل به MongoDB)

import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
import { Product } from '@/data/types';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);
const dbName = 'mopastyle';
const collectionName = 'products';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection<Product>(collectionName);

    switch (req.method) {
      case 'GET': {
        const { id } = req.query;

        if (id) {
          const found = await collection.findOne({ id: Number(id) });
          if (!found) return res.status(404).json({ message: 'Product not found' });
          return res.status(200).json(found);
        }

        const allProducts = await collection.find({}).toArray();
        res.status(200).json(allProducts);
        break;
      }

      case 'POST': {
        const newProduct: Product = {
          ...req.body,
          id: Date.now(),
        };
        await collection.insertOne(newProduct);
        res.status(201).json(newProduct);
        break;
      }

      case 'PUT': {
        const updatedProduct: Product = req.body;
        await collection.updateOne(
          { id: updatedProduct.id },
          { $set: updatedProduct }
        );
        res.status(200).json(updatedProduct);
        break;
      }

      case 'DELETE': {
        const { id } = req.query;
        await collection.deleteOne({ id: Number(id) });
        res.status(200).json({ success: true });
        break;
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (err: any) {
    console.error("❌ MongoDB API Error:", err.message);
    console.error(err); // کل جزئیات رو لاگ کن
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
  
}