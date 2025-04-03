import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    // درخواست برای دریافت محصول با id از API
    const { data } = await axios.get(`http://localhost:3001/products/${id}`);

    if (data) {
      res.status(200).json(data); // محصول را برمی‌گرداند
    } else {
      res.status(404).json({ message: 'Product not found' }); // اگر محصول یافت نشد
    }
  } catch {
    res.status(500).json({ message: 'Error fetching product' }); // مدیریت خطاها
  }
}
