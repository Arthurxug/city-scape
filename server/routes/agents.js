const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

const adminSupabase = () => createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET /api/agents — list all agents
router.get('/', async (req, res) => {
  const supabase = adminSupabase();
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/agents/:id — single agent
router.get('/:id', async (req, res) => {
  const supabase = adminSupabase();
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ error: 'Agent not found' });
  res.json(data);
});

// PATCH /api/agents/:id — update system prompt or other fields
router.patch('/:id', async (req, res) => {
  const { system_prompt, status } = req.body;
  if (!system_prompt && !status) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  const supabase = adminSupabase();
  const updates = {};
  if (system_prompt !== undefined) {
    if (!system_prompt.trim()) return res.status(400).json({ error: 'system_prompt cannot be empty' });
    updates.system_prompt = system_prompt;
  }
  if (status !== undefined) updates.status = status;

  const { data, error } = await supabase
    .from('agents')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/agents/:id/increment-task-count
router.post('/:id/increment-task-count', async (req, res) => {
  const supabase = adminSupabase();
  const { data: agent } = await supabase
    .from('agents')
    .select('task_count')
    .eq('id', req.params.id)
    .single();

  const { data, error } = await supabase
    .from('agents')
    .update({ task_count: (agent?.task_count || 0) + 1 })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
