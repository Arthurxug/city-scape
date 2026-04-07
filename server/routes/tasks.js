const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

const adminSupabase = () => createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET /api/tasks — list tasks for the user with optional filters
router.get('/', async (req, res) => {
  const supabase = adminSupabase();
  const { agent_name, status, search, from, to, limit = 50, offset = 0 } = req.query;

  let query = supabase
    .from('tasks')
    .select('*')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (agent_name) query = query.eq('agent_name', agent_name);
  if (status) query = query.eq('status', status);
  if (from) query = query.gte('created_at', from);
  if (to) query = query.lte('created_at', to);
  if (search) query = query.ilike('task_input', `%${search}%`);

  const { data, error, count } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data, count });
});

// GET /api/tasks/stats — weekly task counts per agent
router.get('/stats', async (req, res) => {
  const supabase = adminSupabase();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('tasks')
    .select('agent_name, created_at, status')
    .eq('user_id', req.user.id)
    .gte('created_at', sevenDaysAgo)
    .order('created_at', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  // Group by day
  const dayMap = {};
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  data.forEach(task => {
    const d = new Date(task.created_at);
    const key = days[d.getDay()];
    dayMap[key] = (dayMap[key] || 0) + 1;
  });

  const chartData = days.map(day => ({ day, tasks: dayMap[day] || 0 }));

  // Active tasks count
  const activeTasks = data.filter(t => t.status === 'running').length;

  // Per-agent counts
  const agentCounts = {};
  data.forEach(task => {
    agentCounts[task.agent_name] = (agentCounts[task.agent_name] || 0) + 1;
  });

  res.json({ chartData, activeTasks, agentCounts, total: data.length });
});

// GET /api/tasks/export — CSV download
router.get('/export', async (req, res) => {
  const supabase = adminSupabase();
  const { data, error } = await supabase
    .from('tasks')
    .select('id, agent_name, task_input, task_output, priority, status, created_at, completed_at')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  const escape = v => {
    if (v == null) return '';
    const s = String(v).replace(/"/g, '""');
    return s.includes(',') || s.includes('\n') || s.includes('"') ? `"${s}"` : s;
  };

  const headers = ['id', 'agent_name', 'task_input', 'task_output', 'priority', 'status', 'created_at', 'completed_at'];
  const rows = data.map(row => headers.map(h => escape(row[h])).join(','));
  const csv = [headers.join(','), ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="atc-tasks-export.csv"');
  res.send(csv);
});

// GET /api/tasks/:id
router.get('/:id', async (req, res) => {
  const supabase = adminSupabase();
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .single();

  if (error) return res.status(404).json({ error: 'Task not found' });
  res.json(data);
});

module.exports = router;
