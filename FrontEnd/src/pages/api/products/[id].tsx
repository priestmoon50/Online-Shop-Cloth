import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { Product } from '@/data/types';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'products.json');
const uploadsDir = path.join(process.cwd(), 'public');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: 'Invalid product ID' });
  }

  const productId = Number(id);

  try {
    const file = await fsPromises.readFile(dataFilePath, 'utf-8');
    const products: Product[] = JSON.parse(file);
    const existingProduct = products.find((p) => p.id === productId);

    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // ✅ دریافت محصول با GET
    if (req.method === 'GET') {
      return res.status(200).json(existingProduct);
    }

    // 🗑 حذف محصول با DELETE
    if (req.method === 'DELETE') {
      if (Array.isArray(existingProduct.images)) {
        for (const imgPath of existingProduct.images) {
          const fullPath = path.join(uploadsDir, imgPath);
          if (fs.existsSync(fullPath)) {
            await fsPromises.unlink(fullPath);
          }
        }
      }

      const updatedProducts = products.filter((p) => p.id !== productId);
      await fsPromises.writeFile(dataFilePath, JSON.stringify(updatedProducts, null, 2), 'utf-8');

      return res.status(200).json({ success: true });
    }

    // ✏️ ویرایش محصول با PUT
    if (req.method === 'PUT') {
      const updatedData: Product = req.body;

      const updatedProducts = products.map((p) =>
        p.id === productId ? { ...p, ...updatedData } : p
      );

      await fsPromises.writeFile(dataFilePath, JSON.stringify(updatedProducts, null, 2), 'utf-8');

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
