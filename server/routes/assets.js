const express = require('express');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Unsupported file type'));
  },
});

const adminSupabase = () => createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function getFileType(mimetype) {
  if (mimetype === 'application/pdf') return 'pdf';
  if (mimetype.includes('wordprocessingml')) return 'docx';
  if (mimetype === 'text/plain') return 'txt';
  if (mimetype.startsWith('image/')) return 'image';
  return 'other';
}

async function extractText(buffer, mimetype) {
  try {
    if (mimetype === 'application/pdf') {
      const pdfParse = require('pdf-parse');
      const result = await pdfParse(buffer);
      return result.text?.slice(0, 50000) || ''; // cap at 50k chars
    }
    if (mimetype.includes('wordprocessingml')) {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      return result.value?.slice(0, 50000) || '';
    }
    if (mimetype === 'text/plain') {
      return buffer.toString('utf8').slice(0, 50000);
    }
  } catch (err) {
    console.error('Text extraction error:', err.message);
  }
  return null;
}

// GET /api/assets
router.get('/', async (req, res) => {
  const supabase = adminSupabase();
  const { tags } = req.query;

  let query = supabase
    .from('assets')
    .select('id, name, file_type, file_size, tags, created_at, file_path')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (tags) {
    query = query.overlaps('tags', tags.split(','));
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/assets/:id — full asset including extracted text
router.get('/:id', async (req, res) => {
  const supabase = adminSupabase();
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .single();

  if (error) return res.status(404).json({ error: 'Asset not found' });
  res.json(data);
});

// POST /api/assets/upload
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });

  const supabase = adminSupabase();
  const { tags = '' } = req.body;
  const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  const ext = req.file.originalname.split('.').pop();
  const filePath = `${req.user.id}/${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`;
  const fileType = getFileType(req.file.mimetype);

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('company-assets')
    .upload(filePath, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: false,
    });

  if (uploadError) {
    return res.status(500).json({ error: `Storage upload failed: ${uploadError.message}` });
  }

  // Extract text for document types
  const extractedText = await extractText(req.file.buffer, req.file.mimetype);

  // Insert asset row
  const { data: asset, error: dbError } = await supabase
    .from('assets')
    .insert({
      user_id: req.user.id,
      name: req.file.originalname,
      file_path: filePath,
      file_type: fileType,
      file_size: req.file.size,
      extracted_text: extractedText,
      tags: tagsArray,
    })
    .select()
    .single();

  if (dbError) {
    return res.status(500).json({ error: `Database insert failed: ${dbError.message}` });
  }

  res.status(201).json(asset);
});

// DELETE /api/assets/:id
router.delete('/:id', async (req, res) => {
  const supabase = adminSupabase();
  const { data: asset, error: fetchError } = await supabase
    .from('assets')
    .select('file_path')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .single();

  if (fetchError) return res.status(404).json({ error: 'Asset not found' });

  // Remove from storage
  await supabase.storage.from('company-assets').remove([asset.file_path]);

  // Remove from DB
  const { error } = await supabase
    .from('assets')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
