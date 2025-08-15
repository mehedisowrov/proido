# IdoPro Backend v2 — Express + Postgres + Prisma + Stripe + S3 (MinIO)
# ---------------------------------------------------------------------
# This single file contains multiple project files separated by markers.
# Create a folder (e.g., idopro-backend-v2) and copy each section
# into the corresponding file path.

==================== package.json ====================
{
  "name": "idopro-backend-v2",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev --name init",
    "prisma:deploy": "prisma migrate deploy"
  },
  "dependencies": {
    "@prisma/client": "^5.18.0",
    "aws-sdk": "^2.1519.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "stripe": "^16.6.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "nodemon": "^3.1.0",
    "prisma": "^5.18.0"
  }
}

==================== docker-compose.yml ====================
version: '3.9'
services:
  db:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_USER: idopro
      POSTGRES_PASSWORD: idopro
      POSTGRES_DB: idopro
    ports: ["5432:5432"]
    volumes: ["db_data:/var/lib/postgresql/data"]
  minio:
    image: minio/minio:RELEASE.2024-05-28T17-19-04Z
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minio
      MINIO_ROOT_PASSWORD: minio12345
    ports: ["9000:9000", "9001:9001"]
    volumes: ["minio_data:/data"]
volumes:
  db_data: {}
  minio_data: {}

==================== .env.example ====================
# Server
PORT=4000
NODE_ENV=development
JWT_SECRET=replace_with_long_random_string
JWT_REFRESH_SECRET=replace_with_another_long_random_string

# Database (Prisma)
DATABASE_URL="postgresql://idopro:idopro@localhost:5432/idopro?schema=public"

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
PUBLIC_APP_URL=http://localhost:3000

# S3 / MinIO
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY=minio
S3_SECRET_KEY=minio12345
S3_BUCKET=idopro-assets
S3_FORCE_PATH_STYLE=true

==================== prisma/schema.prisma ====================
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                 Int       @id @default(autoincrement())
  email              String    @unique
  passwordHash       String
  name               String?
  role               Role      @default(USER)
  subscriptionStatus SubStatus @default(INACTIVE)
  createdAt          DateTime  @default(now())
  assets             Asset[]
  downloads          Download[]
}

enum Role {
  USER
  CONTRIBUTOR
  ADMIN
}

enum SubStatus {
  ACTIVE
  INACTIVE
  CANCELED
  PAST_DUE
}

model Asset {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  type        String?
  tags        String?
  author      User     @relation(fields: [authorId], references: [id])
  authorId    Int
  objectKey   String   // S3 object key
  thumbUrl    String?
  status      AssetStatus @default(APPROVED)
  downloads   Int      @default(0)
  createdAt   DateTime @default(now())
  downloadsLog Download[]
}

enum AssetStatus {
  PENDING
  APPROVED
  REJECTED
}

model Download {
  id         Int      @id @default(autoincrement())
  asset      Asset    @relation(fields: [assetId], references: [id])
  assetId    Int
  user       User     @relation(fields: [userId], references: [id])
  userId     Int
  licenseKey String
  createdAt  DateTime @default(now())
}

==================== src/db.js ====================
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();

==================== src/utils/jwt.js ====================
import jwt from 'jsonwebtoken';
const ACCESS_TTL = '15m';
const REFRESH_TTL = '30d';

export function signAccess(user) {
  return jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: ACCESS_TTL });
}
export function signRefresh(user) {
  return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TTL });
}
export function verifyAccess(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
export function verifyRefresh(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

==================== src/middleware/auth.js ====================
import { verifyAccess } from '../utils/jwt.js';

export function auth(required = true, roles = []) {
  return (req, res, next) => {
    const hdr = req.headers.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
    if (!token) return required ? res.status(401).json({ error: 'Unauthorized' }) : next();
    try {
      const payload = verifyAccess(token);
      if (roles.length && !roles.includes(payload.role)) return res.status(403).json({ error: 'Forbidden' });
      req.user = payload;
      next();
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

==================== src/services/storage.js ====================
// S3/MinIO signed URL service
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  endpoint: process.env.S3_ENDPOINT,
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  s3ForcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  region: process.env.S3_REGION
});

export async function ensureBucket() {
  try { await s3.headBucket({ Bucket: process.env.S3_BUCKET }).promise(); }
  catch { await s3.createBucket({ Bucket: process.env.S3_BUCKET }).promise(); }
}

export async function putObject(objectKey, buffer, contentType) {
  await s3.putObject({ Bucket: process.env.S3_BUCKET, Key: objectKey, Body: buffer, ContentType: contentType }).promise();
  return objectKey;
}

export function getSignedUrl(objectKey, expiresSeconds = 300) {
  return s3.getSignedUrl('getObject', { Bucket: process.env.S3_BUCKET, Key: objectKey, Expires: expiresSeconds });
}

==================== src/routes/auth.js ====================
import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';
import { z } from 'zod';
import { signAccess, signRefresh, verifyRefresh } from '../utils/jwt.js';

export const authRouter = express.Router();

const Register = z.object({ email: z.string().email(), password: z.string().min(6), name: z.string().optional() });
const Login = z.object({ email: z.string().email(), password: z.string() });

authRouter.post('/register', async (req, res) => {
  try {
    const { email, password, name } = Register.parse(req.body);
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, passwordHash: hash, name } });
    res.json({ access: signAccess(user), refresh: signRefresh(user), user: { id: user.id, email: user.email } });
  } catch (e) {
    if (String(e.message).includes('Unique constraint')) return res.status(409).json({ error: 'Email already registered' });
    return res.status(400).json({ error: e.message });
  }
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = Login.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ access: signAccess(user), refresh: signRefresh(user), user: { id: user.id, email: user.email, role: user.role, subscriptionStatus: user.subscriptionStatus } });
});

authRouter.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;
    const payload = verifyRefresh(token);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return res.status(401).json({ error: 'Invalid refresh' });
    res.json({ access: signAccess(user) });
  } catch {
    res.status(401).json({ error: 'Invalid refresh' });
  }
});

==================== src/routes/subscriptions.js ====================
import express from 'express';
import Stripe from 'stripe';
import { prisma } from '../db.js';

export const subRouter = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

subRouter.post('/checkout', async (req, res) => {
  const { email } = req.body; // pass current user's email from client
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${process.env.PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.PUBLIC_APP_URL}/cancel`,
    customer_email: email,
  });
  res.json({ url: session.url });
});

// NOTE: mount in server BEFORE express.json() because of raw body
export function stripeWebhookHandler() {
  return async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const email = event.data.object.customer_email;
      if (email) {
        await prisma.user.update({ where: { email }, data: { subscriptionStatus: 'ACTIVE' } }).catch(() => {});
      }
    }
    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object; // contains customer_email only if you expand
      // In production, map Stripe customer -> user in DB and set CANCELED
    }
    res.json({ received: true });
  };
}

==================== src/routes/assets.js ====================
import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import { prisma } from '../db.js';
import { auth } from '../middleware/auth.js';
import { ensureBucket, putObject, getSignedUrl } from '../services/storage.js';

export const assetsRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024 * 200 } }); // 200MB

await ensureBucket();

assetsRouter.post('/', auth(true, ['CONTRIBUTOR', 'ADMIN']), upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'file required' });
  const { title, description, type, tags, thumbUrl } = req.body;
  const objectKey = `assets/${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${req.file.originalname}`;
  await putObject(objectKey, req.file.buffer, req.file.mimetype);
  const asset = await prisma.asset.create({
    data: { title, description, type, tags, thumbUrl, objectKey, authorId: req.user.id, status: req.user.role === 'ADMIN' ? 'APPROVED' : 'PENDING' }
  });
  res.status(201).json(asset);
});

assetsRouter.get('/', async (req, res) => {
  const { page = 1, limit = 20, q, type } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const where = { status: 'APPROVED', ...(q ? { OR: [ { title: { contains: q, mode: 'insensitive' } }, { tags: { contains: q, mode: 'insensitive' } } ] } : {}), ...(type ? { type } : {}) };
  const [items, total] = await Promise.all([
    prisma.asset.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: Number(limit) }),
    prisma.asset.count({ where })
  ]);
  res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

assetsRouter.get('/:id', async (req, res) => {
  const a = await prisma.asset.findUnique({ where: { id: Number(req.params.id) } });
  if (!a) return res.status(404).json({ error: 'Not found' });
  res.json(a);
});

assetsRouter.patch('/:id', auth(true, ['ADMIN']), async (req, res) => {
  const { title, description, type, tags, status } = req.body;
  const updated = await prisma.asset.update({ where: { id: Number(req.params.id) }, data: { title, description, type, tags, status } });
  res.json(updated);
});

assetsRouter.delete('/:id', auth(true, ['ADMIN']), async (req, res) => {
  await prisma.asset.delete({ where: { id: Number(req.params.id) } });
  res.status(204).send();
});

assetsRouter.post('/:id/download', auth(), async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (user.subscriptionStatus !== 'ACTIVE') return res.status(402).json({ error: 'Active subscription required' });
  const asset = await prisma.asset.findFirst({ where: { id: Number(req.params.id), status: 'APPROVED' } });
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  const license = Buffer.from(`${asset.id}-${user.id}-${Date.now()}`).toString('base64').replace(/=+/g, '');
  await prisma.download.create({ data: { assetId: asset.id, userId: user.id, licenseKey: license } });
  await prisma.asset.update({ where: { id: asset.id }, data: { downloads: { increment: 1 } } });
  const url = getSignedUrl(asset.objectKey, 300);
  res.json({ license_key: license, file_url: url, title: asset.title });
});

assetsRouter.get('/licenses/:key', auth(), async (req, res) => {
  const row = await prisma.download.findFirst({ where: { licenseKey: req.params.key, userId: req.user.id }, include: { asset: true } });
  if (!row) return res.status(404).json({ valid: false });
  res.json({ valid: true, asset_id: row.assetId, title: row.asset.title, issued_at: row.createdAt });
});

==================== src/server.js ====================
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { authRouter } from './routes/auth.js';
import { subRouter, stripeWebhookHandler } from './routes/subscriptions.js';
import { assetsRouter } from './routes/assets.js';

const app = express();

// Stripe webhook must use raw body
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhookHandler());

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/auth', authRouter);
app.use('/subscriptions', subRouter);
app.use('/assets', assetsRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`IdoPro v2 API running on :${PORT}`));

==================== README.md ====================
# IdoPro Backend v2 — Quick Start

## 1) Run services
```bash
docker compose up -d
```

## 2) Install deps
```bash
npm i
cp .env.example .env
# edit .env values (Stripe keys, etc.)
```

## 3) Prisma init
```bash
npm run prisma:generate
npm run prisma:migrate
```

## 4) Start API
```bash
npm run dev
```

## 5) Stripe webhook (local)
```bash
stripe listen --forward-to localhost:4000/webhooks/stripe
```

## 6) Test Flow
- POST /auth/register { email, password, name }
- POST /auth/login -> save access & refresh
- POST /subscriptions/checkout { email } -> open URL returned
- On success, webhook sets user.subscriptionStatus=ACTIVE
- As CONTRIBUTOR/ADMIN upload: POST /assets (multipart: file, title, tags)
- ADMIN approves: PATCH /assets/:id { status: 'APPROVED' }
- USER downloads: POST /assets/:id/download -> returns signed file_url + license

> Tip: Promote a user to CONTRIBUTOR/ADMIN via Prisma Studio: `npx prisma studio`.
