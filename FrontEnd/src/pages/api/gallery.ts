// 📁 FrontEnd/src/pages/api/gallery.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File, Files, Fields } from 'formidable';
import fs from 'fs';
import fsPromise from 'fs/promises';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, // ❗ لازم برای آپلود فایل
  },
};

const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
const galleryFile = path.join(process.cwd(), 'src', 'data', 'gallery.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // ایجاد پوشه uploads در صورت نبود
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // خواندن فایل گالری یا مقدار پیش‌فرض
    const images: string[] = fs.existsSync(galleryFile)
      ? JSON.parse(await fsPromise.readFile(galleryFile, 'utf8'))
      : [];

    // --- GET ---
    if (req.method === 'GET') {
      return res.status(200).json(images);
    }

    // --- POST ---
    if (req.method === 'POST') {
      const form = formidable({ multiples: false, uploadDir: uploadsDir, keepExtensions: true });

      form.parse(req, async (err: any, fields: Fields, files: Files) => {
        if (err) {
          console.error('Form parsing error:', err);
          return res.status(500).json({ error: 'Form parsing error' });
        }

        const uploadedFile = Array.isArray(files.image)
          ? files.image[0]
          : files.image;

        if (!uploadedFile) {
          return res.status(400).json({ error: 'No image uploaded' });
        }

        const file = uploadedFile as File;
        const filename = path.basename(file.filepath); // نام نهایی فایل
        const publicUrl = `/uploads/${filename}`;

        const updatedImages = [...images, publicUrl];
        await fsPromise.writeFile(galleryFile, JSON.stringify(updatedImages, null, 2));

        return res.status(201).json({ url: publicUrl });
      });

      return;
    }

    // --- DELETE ---
    if (req.method === 'DELETE') {
      const { filename } = req.query;
      if (!filename || typeof filename !== 'string') {
        return res.status(400).json({ error: 'Filename is required' });
      }

      const updated = images.filter((img) => !img.endsWith(filename));
      await fsPromise.writeFile(galleryFile, JSON.stringify(updated, null, 2));

      const filePath = path.join(uploadsDir, filename);
      if (fs.existsSync(filePath)) {
        await fsPromise.unlink(filePath);
      }

      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('Gallery API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
