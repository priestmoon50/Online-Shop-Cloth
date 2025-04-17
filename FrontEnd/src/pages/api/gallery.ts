// 📁 FrontEnd/src/pages/api/gallery.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer({ storage: multer.memoryStorage() });

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

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'modastyle-gallery' },
      (error, result) => {
        if (error || !result) {
          console.error('Upload error:', error);
          return res.status(500).json({ error: 'Upload failed' });
        }

        return res.status(201).json({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  }

  // -----------------------
  // 🗑 DELETE - Delete Image
  // -----------------------
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

  // -----------------------
  // 📥 GET - List Images
  // -----------------------
  else if (req.method === 'GET') {
    try {
      const result = await cloudinary.search
        .expression('folder:modastyle-gallery')
        .sort_by('created_at', 'desc')
        .max_results(30)
        .execute();

      const images = result.resources.map((file: any) => ({
        url: file.secure_url,
        public_id: file.public_id,
      }));

      return res.status(200).json(images);
    } catch (error) {
      console.error('Fetch gallery error:', error);
      return res.status(500).json({ error: 'Could not fetch gallery images' });
    }
  }

  // ------------------------
  // ❌ Unsupported Methods
  // ------------------------
  else {
    res.setHeader('Allow', ['POST', 'GET', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
