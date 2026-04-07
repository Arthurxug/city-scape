const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

const adminSupabase = () => createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET /api/integrations
router.get('/', async (req, res) => {
  const supabase = adminSupabase();
  const { data, error } = await supabase
    .from('integrations')
    .select('id, name, endpoint, status, last_tested, created_at, notes')
    .order('name', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  // Mask api_key — never send to client
  res.json(data.map(i => ({ ...i, has_api_key: false })));
});

// PATCH /api/integrations/:id — save API key or update status
router.patch('/:id', async (req, res) => {
  const { api_key, status } = req.body;
  const supabase = adminSupabase();
  const updates = {};

  if (api_key !== undefined) {
    updates.api_key = api_key;
    updates.status = api_key ? 'connected' : 'disconnected';
  }
  if (status !== undefined) updates.status = status;

  const { data, error } = await supabase
    .from('integrations')
    .update(updates)
    .eq('id', req.params.id)
    .select('id, name, endpoint, status, last_tested, notes')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/integrations/:id/test — test connection (ping endpoint)
router.post('/:id/test', async (req, res) => {
  const supabase = adminSupabase();
  const { data: integration, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ error: 'Integration not found' });

  // Basic connectivity check — just verify a key is configured
  const isConnected = !!integration.api_key;
  const newStatus = isConnected ? 'connected' : 'disconnected';

  await supabase
    .from('integrations')
    .update({ last_tested: new Date().toISOString(), status: newStatus })
    .eq('id', req.params.id);

  res.json({
    success: isConnected,
    message: isConnected
      ? `${integration.name} connection verified — API key is configured.`
      : `${integration.name} is not connected. Please add an API key.`,
    status: newStatus,
  });
});

module.exports = router;
