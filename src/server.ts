import express, { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';
import path from 'path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// simple auth middleware that sets req.userId if Authorization header contains a valid token
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

app.use(async (req: Request, _res, next) => {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.slice(7);
    try {
      const payload: any = jwt.verify(token, JWT_SECRET);
      req.userId = payload.userId;
    } catch (e) {
      // ignore invalid token
    }
  }
  next();
});

const PORT = process.env.PORT || 3000;

// Serve static frontend from the public folder
app.use(express.static(path.join(__dirname, '../public')));

app.post('/api/chat', async (req: Request, res: Response) => {
  const { message, conversationId } = req.body as { message?: string; conversationId?: number };
  if (!message) return res.status(400).json({ error: 'message required' });

  // Persist user message (create conversation if needed)
  let convId = conversationId;
  try {
    if (!convId) {
      const conv = await prisma.conversation.create({ data: { userId: req.userId ?? undefined } });
      convId = conv.id;
    }
    await prisma.message.create({ data: { conversationId: convId, role: 'user', content: message } });
  } catch (e) {
    console.error('DB error (saving user message)', e);
  }

  const key = process.env.OPENAI_API_KEY;
  if (key) {
    try {
      const resp = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: message },
          ],
          max_tokens: 400,
        },
        {
          headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const reply = resp.data?.choices?.[0]?.message?.content || 'No reply';
      // save bot reply
      try { await prisma.message.create({ data: { conversationId: convId!, role: 'bot', content: reply } }); } catch (e) { console.error('DB error (saving bot reply)', e); }
      return res.json({ reply, conversationId: convId });
    } catch (err: any) {
      console.error('OpenAI error', err?.response?.data ?? err?.message ?? err);
      return res.status(500).json({ error: 'model error' });
    }
  }

  // Fallback: echo
  const reply = `Echo: ${message}`;
  try { await prisma.message.create({ data: { conversationId: convId!, role: 'bot', content: reply } }); } catch (e) { console.error('DB error (saving bot echo)', e); }
  return res.json({ reply, conversationId: convId });
});

// Auth: signup
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  const { email, name, password } = req.body as { email?: string; name?: string; password?: string };
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({ data: { email, name: name || '', password: hashed } });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token });
  } catch (e: any) {
    console.error('Signup error', e);
    return res.status(500).json({ error: 'signup failed' });
  }
});

// Auth: login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) return res.status(401).json({ error: 'invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token });
  } catch (e) {
    console.error('Login error', e);
    return res.status(500).json({ error: 'login failed' });
  }
});

// Get conversations for current user
app.get('/api/conversations', async (req: Request, res: Response) => {
  if (!req.userId) return res.status(401).json({ error: 'unauthenticated' });
  const convs = await prisma.conversation.findMany({ where: { userId: req.userId }, include: { messages: true } });
  return res.json({ conversations: convs });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
});
