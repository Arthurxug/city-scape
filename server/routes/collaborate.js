const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

const adminSupabase = () => createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// POST /api/collaborate — multi-agent chained streaming collaboration
router.post('/', async (req, res) => {
  const { agentIds, taskInput, priority = 'medium', attachedAssets = [] } = req.body;

  if (!Array.isArray(agentIds) || agentIds.length < 2 || !taskInput?.trim()) {
    return res.status(400).json({ error: 'agentIds (array, min 2) and taskInput are required' });
  }

  const supabase = adminSupabase();

  // Fetch all agents in order
  const { data: agents, error: agentsError } = await supabase
    .from('agents')
    .select('*')
    .in('id', agentIds);

  if (agentsError || !agents || agents.length !== agentIds.length) {
    return res.status(404).json({ error: 'One or more agents not found' });
  }

  // Preserve the requested order
  const orderedAgents = agentIds.map(id => agents.find(a => a.id === id));

  // Build initial message with asset context
  let baseMessage = taskInput;
  if (attachedAssets.length > 0) {
    const contextBlocks = attachedAssets
      .filter(a => a.extracted_text)
      .map(a => `[ATTACHED CONTEXT — ${a.name}]\n${a.extracted_text}\n[END CONTEXT]`)
      .join('\n\n');
    if (contextBlocks) {
      baseMessage = `${contextBlocks}\n\n---\n\n${taskInput}`;
    }
  }

  // Create collaboration session
  const { data: session, error: sessionError } = await supabase
    .from('collaboration_sessions')
    .insert({
      user_id: req.user.id,
      task_input: taskInput,
      priority,
      status: 'running',
    })
    .select()
    .single();

  if (sessionError) {
    return res.status(500).json({ error: 'Failed to create collaboration session' });
  }

  // Create turn rows
  const turnRows = orderedAgents.map((agent, i) => ({
    session_id: session.id,
    agent_id: agent.id,
    agent_name: agent.name,
    turn_order: i + 1,
    input_context: '',
    status: 'pending',
  }));

  const { data: turns } = await supabase
    .from('collaboration_turns')
    .insert(turnRows)
    .select();

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  let streamAborted = false;
  const turnOutputs = [];

  req.on('close', () => { streamAborted = true; });

  try {
    for (let i = 0; i < orderedAgents.length; i++) {
      if (streamAborted) break;
      const agent = orderedAgents[i];
      const turn = turns[i];

      // Build context: original task + all previous agents' outputs
      let contextMessage = baseMessage;
      if (turnOutputs.length > 0) {
        const priorContext = turnOutputs
          .map((out, idx) => `[${orderedAgents[idx].name} ANALYSIS]:\n${out}`)
          .join('\n\n---\n\n');
        contextMessage = `${baseMessage}\n\n===PRIOR ANALYSIS FROM TEAM===\n\n${priorContext}\n\n===YOUR TURN===\nBased on the above task and your colleagues' analyses, provide your perspective and contribution.`;
      }

      // Update turn with actual input context
      await supabase
        .from('collaboration_turns')
        .update({ input_context: contextMessage, status: 'running' })
        .eq('id', turn.id);

      // Set agent active
      await supabase.from('agents').update({ status: 'active' }).eq('id', agent.id);

      // Emit turn start event
      res.write(`data: ${JSON.stringify({
        type: 'turn_start',
        agentId: agent.id,
        agentName: agent.name,
        colorTag: agent.color_tag,
        turnOrder: i + 1,
        totalTurns: orderedAgents.length,
      })}\n\n`);

      let turnOutput = '';

      const stream = await anthropic.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        system: agent.system_prompt,
        messages: [{ role: 'user', content: contextMessage }],
      });

      for await (const event of stream) {
        if (streamAborted) break;
        if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
          const text = event.delta.text;
          turnOutput += text;
          res.write(`data: ${JSON.stringify({ type: 'delta', agentName: agent.name, turnOrder: i + 1, text })}\n\n`);
        }
      }

      turnOutputs.push(turnOutput);

      // Persist turn output
      await supabase
        .from('collaboration_turns')
        .update({
          output: turnOutput,
          status: streamAborted ? 'failed' : 'completed',
        })
        .eq('id', turn.id);

      // Reset agent status and increment count
      await supabase
        .from('agents')
        .update({ status: 'idle', task_count: (agent.task_count || 0) + 1 })
        .eq('id', agent.id);

      if (!streamAborted) {
        res.write(`data: ${JSON.stringify({ type: 'turn_done', agentName: agent.name, turnOrder: i + 1 })}\n\n`);
      }
    }

    // Complete session
    await supabase
      .from('collaboration_sessions')
      .update({
        status: streamAborted ? 'failed' : 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', session.id);

    if (!streamAborted) {
      res.write(`data: ${JSON.stringify({ type: 'session_done', sessionId: session.id })}\n\n`);
    }
  } catch (err) {
    console.error('Collaborate stream error:', err);
    await supabase
      .from('collaboration_sessions')
      .update({ status: 'failed', completed_at: new Date().toISOString() })
      .eq('id', session.id);
    res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
  } finally {
    res.end();
  }
});

module.exports = router;
