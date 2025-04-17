// 📁 FrontEnd/src/pages/api/gallery.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// ✅ کانفیگ Cloudinary با env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// ❗ جلوگیری از پارس خودکار بادی
export const config = {
  api: {
    bodyParser: false,
  },
};

// ❇️ استفاده از multer برای فایل داخل مموری (نه روی دیسک)
const upload = multer({ storage: multer.memoryStorage() });

// ✅ اجرای middleware به شکل Promise
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ----------------------
  // 📤 POST - Upload Image
  // ----------------------
  if (req.method === 'POST') {
    await runMiddleware(req, res, upload.single('image'));

    const file = (req as any).file;
    if (!file) return res.status(400).json({ error: 'No image uploaded' });

    // آپلود تصویر از buffer به Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'modastyle-gallery' },
      (error, result) => {
        if (error || !result) {
          console.error('Upload error:', error);
          return res.status(500).json({ error: 'Upload failed' });
        }

        // برگردوندن url + public_id
        return res.status(201).json({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  }

  // ------------------------
  // 🗑 DELETE - Delete Image
  // ------------------------
  else if (req.method === 'DELETE') {
    const { public_id } = req.query;

    if (!public_id || typeof public_id !== 'string') {
      return res.status(400).json({ error: 'Missing public_id for deletion' });
    }

    try {
      const result = await cloudinary.uploader.destroy(public_id);
      return res.status(200).json({ result });
    } catch (error) {
      console.error('Delete error:', error);
      return res.status(500).json({ error: 'Delete failed' });
    }
  }

  // ------------------------
  // ❌ Unsupported Methods
  // ------------------------
  else {
    res.setHeader('Allow', ['POST', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
