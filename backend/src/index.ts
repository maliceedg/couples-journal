import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { authMiddleware } from './middleware/auth.js';
import { authRouter } from './routes/auth.js';
import { journalRouter } from './routes/journal.js';
import { memoriesRouter } from './routes/memories.js';
import { uploadRouter } from './routes/upload.js';
import { cuteTextsRouter } from './routes/cuteTexts.js';
import { profileRouter } from './routes/profile.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ?? 3001;

const uploadsPath = path.resolve(__dirname, '../uploads');
app.use(cors({ origin: true }));
app.use(express.json());
app.use('/uploads', express.static(uploadsPath));

app.use('/api/auth', authRouter);

app.use('/api/journal', authMiddleware, journalRouter);
app.use('/api/memories', authMiddleware, memoriesRouter);
app.use('/api/upload', authMiddleware, uploadRouter);
app.use('/api/cute-texts', authMiddleware, cuteTextsRouter);
app.use('/api/profile', authMiddleware, profileRouter);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
