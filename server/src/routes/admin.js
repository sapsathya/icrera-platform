const express = require('express');
const prisma = require('../lib/prisma');
const { auth, adminOnly } = require('../lib/authMiddleware');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const router = express.Router();

router.use(auth);
router.use(adminOnly);

router.get('/review_queue', async (req, res) => {
  const pending = await prisma.file.findMany({ where: { status: 'pending' }, orderBy: { createdAt: 'desc' }});
  res.json(pending);
});

router.post('/files/:id/approve', async (req, res) => {
  const id = req.params.id;
  const file = await prisma.file.update({ where: { id }, data: { status: 'approved' }});
  res.json({ ok: true, file });
});

router.post('/files/:id/reject', async (req, res) => {
  const id = req.params.id;
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ error: 'reason required' });
  const file = await prisma.file.update({ where: { id }, data: { status: 'rejected', rejectionReason: reason }});
  res.json({ ok: true, file });
});

router.get('/users', async (req, res) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }});
  res.json(users);
});

router.get('/analytics', async (req, res) => {
  const total_users = await prisma.user.count();
  const total_files = await prisma.file.count();
  const files_pending = await prisma.file.count({ where: { status: 'pending' }});
  res.json({ total_users, total_files, files_pending });
});

module.exports = router;