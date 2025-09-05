const express = require('express');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const prisma = require('../lib/prisma');
const { auth } = require('../lib/authMiddleware');
const router = express.Router();

const REGION = process.env.AWS_REGION;
const BUCKET = process.env.S3_BUCKET;
const s3 = new S3Client({ region: REGION });

router.post('/presign', auth, async (req, res) => {
  const { filename, mimeType } = req.body;
  if (!filename) return res.status(400).json({ error: 'filename required' });
  const key = `uploads/${Date.now()}_${Math.random().toString(36).slice(2)}_${filename}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: mimeType || 'application/octet-stream',
    ACL: 'private'
  });
  try {
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: Number(process.env.S3_SIGNED_URL_EXPIRES || 300) });
    res.json({ signedUrl, storageKey: key });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not create presigned url' });
  }
});

router.post('/files', auth, async (req, res) => {
  const { title, description, tags, filename, storageKey, mimeType, size } = req.body;
  if (!title || !storageKey) return res.status(400).json({ error: 'title and storageKey required' });
  const file = await prisma.file.create({ data: {
    userId: req.user.id,
    title,
    description: description || '',
    tags: tags || [],
    filename,
    storageKey,
    mimeType,
    size: size ? Number(size) : null,
    status: 'pending'
  }});
  res.json({ ok: true, file });
});

router.get('/mine', auth, async (req, res) => {
  const files = await prisma.file.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' }});
  res.json(files);
});

// public approved files
router.get('/', async (req, res) => {
  const files = await prisma.file.findMany({ where: { status: 'approved' }, orderBy: { createdAt: 'desc' }});
  res.json(files);
});

module.exports = router;