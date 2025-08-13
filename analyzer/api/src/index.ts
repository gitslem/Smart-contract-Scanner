mkdir -p api && cd api
npm init -y
npm i express multer cors ioredis bullmq pg dotenv execa uuid
npm i -D typescript ts-node nodemon @types/express @types/node @types/multer @types/cors
npx tsc --init

api/src/index.ts:

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
const redis = new IORedis(process.env.REDIS_URL!);
const scanQueue = new Queue('scan', { connection: redis as any });

const STORAGE_DIR = process.env.STORAGE_DIR || '/tmp/scanner';
const REPORT_BASE_URL = process.env.REPORT_BASE_URL || 'http://localhost:3001/reports';
fs.mkdirSync(STORAGE_DIR, { recursive: true });

const upload = multer({ dest: path.join(STORAGE_DIR, 'uploads') });

app.get('/health', (_, res) => res.json({ ok: true }));

// Serve static reports
app.use('/reports', express.static(path.join(STORAGE_DIR, 'reports')));

// Create a scan from pasted code or uploaded zip
app.post('/scan', upload.single('file'), async (req, res) => {
  const scanId = uuidv4();
  const userId = null; // add auth later
  const srcDir = path.join(STORAGE_DIR, 'src', scanId);
  fs.mkdirSync(srcDir, { recursive: true });

  let sourceOrigin = 'paste';
  if (req.file) {
    sourceOrigin = 'upload';
    // For simplicity, assume a single .sol file upload
    const dest = path.join(srcDir, req.file.originalname || 'Contract.sol');
    fs.renameSync(req.file.path, dest);
  } else if (req.body.code) {
    fs.writeFileSync(path.join(srcDir, 'Contract.sol'), req.body.code, 'utf-8');
  } else {
    return res.status(400).json({ error: 'Provide code (body.code) or file upload' });
  }

  await pool.query(
    ⁠ INSERT INTO scans (id, user_id, status, source_origin, created_at) VALUES ($1,$2,'queued',$3, now()) ⁠,
    [scanId, userId, sourceOrigin]
  );

  await scanQueue.add('run-scan', { scanId, srcDir });
  res.json({ scanId, status: 'queued' });
});

app.get('/scans/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM scans WHERE id=$1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'not found' });
  const scan = rows[0];
  const findings = await pool.query('SELECT * FROM findings WHERE scan_id=$1', [req.params.id]);
  res.json({ scan, findings: findings.rows });
});

const PORT = 3001;
app.listen(PORT, () => console.log(⁠ API on http://localhost:${PORT} ⁠));

Add api/package.json scripts:

{
  "scripts": {
    "dev": "nodemon --watch src --exec ts-node src/index.ts"
  }
}

