// src/pages/api/orders.ts
import { NextApiRequest, NextApiResponse } from 'next';

// فرضاً داده‌های سفارشات نمونه
const orders = [
  { id: '1', user: 'John Doe', totalPrice: 99.99, status: 'Delivered' },
  { id: '2', user: 'Jane Smith', totalPrice: 149.99, status: 'Shipped' },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(orders);
}
