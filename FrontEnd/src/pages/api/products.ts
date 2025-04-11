// 📁 فایل: pages/api/products.ts

import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';
import { Product } from '@/data/types';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'products.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    const products: Product[] = JSON.parse(data);

    switch (req.method) {
        case 'GET': {
            const { id } = req.query;
          
            if (id) {
              const found = products.find(p => p.id === Number(id));
              if (!found) return res.status(404).json({ message: 'Product not found' });
              return res.status(200).json(found);
            }
          
            res.status(200).json(products);
            break;
          }
          

      case 'POST': {
        const newProduct: Product = {
          ...req.body,
          id: Date.now(), // شناسه منحصربه‌فرد ساده
        };
        const updated = [...products, newProduct];
        await fs.writeFile(dataFilePath, JSON.stringify(updated, null, 2));
        res.status(201).json(newProduct);
        break;
      }

      case 'DELETE': {
        const { id } = req.query;
        const filtered = products.filter(p => p.id !== Number(id));
        await fs.writeFile(dataFilePath, JSON.stringify(filtered, null, 2));
        res.status(200).json({ success: true });
        break;
      }

      case 'PUT': {
        const updatedProduct: Product = req.body;
        const updated = products.map(p => (p.id === updatedProduct.id ? updatedProduct : p));
        await fs.writeFile(dataFilePath, JSON.stringify(updated, null, 2));
        res.status(200).json(updatedProduct);
        break;
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (err) {
    console.error('Error handling product API:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}