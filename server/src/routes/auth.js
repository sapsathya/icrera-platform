const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { nanoid } = require('nanoid');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email/password required' });
  const existing = await prisma.user.findUnique({ where: { email }});
  if (existing) return res.status(400).json({ error: 'Email exists' });
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, password_hash: hash, is_active: true }});
  // In production send email verification. Here auto-activate.
  res.json({ ok: true, user: { id: user.id, email: user.email, name: user.name }});
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email }});
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(400).json({ error: 'Invalid credentials' });
  if (user.is_suspended) return res.status(403).json({ error: 'Account suspended' });
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role }});
});

module.exports = router;