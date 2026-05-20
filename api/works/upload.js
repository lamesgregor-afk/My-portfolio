// POST /api/works/upload
// Admin only. Accepts a file from multipart form, uploads to Vercel Blob.
// Returns: { url: string }

import { put } from '@vercel/blob';
import { requireAdmin, allowMethods } from '../../lib/middleware.js';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return;

  const admin = requireAdmin(req, res);
  if (!admin) return;

  // Vercel Blob: stream the raw request body directly
  const filename   = req.headers['x-filename'] || `work-${Date.now()}.jpg`;
  const blob = await put(filename, req, {
    access: 'public',
    token:  process.env.BLOB_READ_WRITE_TOKEN,
  });

  res.status(200).json({ url: blob.url });
}
