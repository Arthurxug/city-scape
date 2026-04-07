const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

const adminSupabase = () => createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// POST /api/delegate — single-agent streaming task delegation
router.post('/', async (req, res) => {
  const { agentId, taskInput, priority = 'medium', attachedAssets = [] } = req.body;

  if (!agentId || !taskInput?.trim()) {
    return res.status(400).json({ error: 'agentId and taskInput are required' });
  }

  const supabase = adminSupabase();

  // Fetch agent
  const { data: agent, error: agentError } = await supabase
    .from('agents')
    .select('*')
    .eq('id', agentId)
    .single();

  if (agentError || !agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  // Build message content with any attached asset context
  let userMessage = taskInput;
  if (attachedAssets.length > 0) {
    const contextBlocks = attachedAssets
      .filter(a => a.extracted_text)
      .map(a => `[ATTACHED CONTEXT — ${a.name}]\n${a.extracted_text}\n[END CONTEXT]`)
      .join('\n\n');
    if (contextBlocks) {
      userMessage = `${contextBlocks}\n\n---\n\n${taskInput}`;
    }
  }

  // Insert task row
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .insert({
      user_id: req.user.id,
      agent_id: agentId,
      agent_name: agent.name,
      task_input: taskInput,
      priority,
      status: 'running',
    })
    .select()
    .single();

  if (taskError) {
    return res.status(500).json({ error: 'Failed to create task record' });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  let fullOutput = '';
  let streamAborted = false;

  req.on('close', () => { streamAborted = true; });

  try {
    // Update agent status to active
    await supabase.from('agents').update({ status: 'active' }).eq('id', agentId);

    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: agent.system_prompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    for await (const event of stream) {
      if (streamAborted) break;
      if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
        const text = event.delta.text;
        fullOutput += text;
        res.write(`data: ${JSON.stringify({ type: 'delta', text })}\n\n`);
      }
    }

    // Persist completed task
    await supabase
      .from('tasks')
      .update({
        task_output: fullOutput,
        status: streamAborted ? 'failed' : 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', task.id);

    // Increment agent task count and reset status
    await supabase
      .from('agents')
      .update({ status: 'idle', task_count: (agent.task_count || 0) + 1 })
      .eq('id', agentId);

    if (!streamAborted) {
      res.write(`data: ${JSON.stringify({ type: 'done', taskId: task.id })}\n\n`);
    }
  } catch (err) {
    console.error('Delegate stream error:', err);
    await supabase
      .from('tasks')
      .update({ status: 'failed', completed_at: new Date().toISOString() })
      .eq('id', task.id);
    await supabase.from('agents').update({ status: 'idle' }).eq('id', agentId);
    res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
  } finally {
    res.end();
  }
});

module.exports = router;
