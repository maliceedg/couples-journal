import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, '../../uploads');

const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 80;

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = file.mimetype.startsWith('image/');
    cb(null, ok);
  },
});

export const uploadRouter = Router();

uploadRouter.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.jpg`;
  const filepath = path.join(uploadsDir, filename);

  try {
    await sharp(req.file.buffer)
      .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: JPEG_QUALITY })
      .toFile(filepath);
  } catch (err) {
    console.error('Image optimization failed:', err);
    return res.status(400).json({ error: 'Invalid or unsupported image' });
  }

  res.json({ url: `/uploads/${filename}` });
});
