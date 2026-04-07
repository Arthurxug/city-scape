import React, { useState, useEffect } from 'react';
import { Activity, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAgents, updateAgent, delegateTask, readSSEStream } from '../lib/api';
import AgentCard from '../components/AgentCard';
import Modal from '../components/Modal';
import OutputPanel from '../components/OutputPanel';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // View prompt modal
  const [viewAgent, setViewAgent] = useState(null);

  // Edit prompt modal
  const [editAgent, setEditAgent] = useState(null);
  const [editedPrompt, setEditedPrompt] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Test modal
  const [testAgent, setTestAgent] = useState(null);
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    getAgents()
      .then(setAgents)
      .catch(() => toast.error('Failed to load agents'))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSavePrompt() {
    if (!editedPrompt.trim()) return;
    setIsSaving(true);
    try {
      const updated = await updateAgent(editAgent.id, { system_prompt: editedPrompt });
      setAgents(prev => prev.map(a => a.id === updated.id ? updated : a));
      toast.success(`${editAgent.name} prompt updated`);
      setEditAgent(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTest() {
    const task = testInput.trim() || 'Hello, introduce yourself briefly and describe your role at ATC.';
    setTestOutput('');
    setIsTesting(true);
    try {
      const response = await delegateTask(testAgent.id, task, 'medium');
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Test failed');
      }
      for await (const event of readSSEStream(response)) {
        if (event.type === 'delta') setTestOutput(prev => prev + event.text);
        else if (event.type === 'done') { toast.success('Test complete'); break; }
        else if (event.type === 'error') throw new Error(event.message);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsTesting(false);
    }
  }

  async function handleSystemHealth() {
    const atlas = agents.find(a => a.name === 'ATLAS');
    if (!atlas) return;
    const prompt = `Perform a system health check for the ATC Command Center. Analyze the current state, identify any areas for improvement, and provide a structured report. Consider: agent utilization patterns, workflow efficiency, integration gaps, and UI/UX improvements that could enhance Arthur's daily operations.`;
    setTestAgent(atlas);
    setTestInput(prompt);
    setTestOutput('');
    setTimeout(() => handleTestWithPrompt(atlas, prompt), 100);
  }

  async function handleTestWithPrompt(agent, prompt) {
    setIsTesting(true);
    setTestOutput('');
    try {
      const response = await delegateTask(agent.id, prompt, 'high');
      if (!response.ok) throw new Error('Test failed');
      for await (const event of readSSEStream(response)) {
        if (event.type === 'delta') setTestOutput(prev => prev + event.text);
        else if (event.type === 'done') break;
        else if (event.type === 'error') throw new Error(event.message);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsTesting(false);
    }
  }

  const atlas = agents.find(a => a.name === 'ATLAS');
  const regularAgents = agents.filter(a => a.name !== 'ATLAS');

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-black text-2xl text-text-primary">Agents</h1>
        <p className="font-mono text-sm text-text-muted mt-1">
          {agents.length} agents deployed — view, edit, and test their system prompts
        </p>
      </div>

      {/* ATLAS — System agent (featured) */}
      {atlas && (
        <div className="mb-6">
          <p className="label mb-3">System Intelligence</p>
          <div className="max-w-sm">
            <AgentCard
              agent={atlas}
              onViewPrompt={() => setViewAgent(atlas)}
              onEditPrompt={() => { setEditAgent(atlas); setEditedPrompt(atlas.system_prompt); }}
              onTest={() => { setTestAgent(atlas); setTestInput(''); setTestOutput(''); }}
              onSystemHealth={handleSystemHealth}
              onProposeImprovement={() => {
                setTestAgent(atlas);
                setTestInput('Based on a modern digital agency operating in East Africa, propose 3 specific improvements to the ATC Command Center — one UI/UX improvement, one workflow automation, and one new agent capability. Format as a structured proposal Arthur can act on.');
                setTestOutput('');
              }}
            />
          </div>
        </div>
      )}

      {/* Regular agents grid */}
      <p className="label mb-3">Agent Roster</p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {regularAgents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onViewPrompt={() => setViewAgent(agent)}
            onEditPrompt={() => { setEditAgent(agent); setEditedPrompt(agent.system_prompt); }}
            onTest={() => { setTestAgent(agent); setTestInput(''); setTestOutput(''); }}
          />
        ))}
      </div>

      {/* View Prompt Modal */}
      <Modal
        isOpen={!!viewAgent}
        onClose={() => setViewAgent(null)}
        title={`${viewAgent?.name} — System Prompt`}
        size="lg"
      >
        {viewAgent && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="font-mono text-xs text-text-muted">{viewAgent.role}</span>
            </div>
            <pre className="bg-bg-elevated border border-white/5 rounded p-4 text-text-muted font-mono text-xs leading-relaxed whitespace-pre-wrap overflow-y-auto max-h-96">
              {viewAgent.system_prompt}
            </pre>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => { setViewAgent(null); setEditAgent(viewAgent); setEditedPrompt(viewAgent.system_prompt); }}
                className="btn-secondary text-sm"
              >
                Edit Prompt
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Prompt Modal */}
      <Modal
        isOpen={!!editAgent}
        onClose={() => setEditAgent(null)}
        title={`Edit — ${editAgent?.name}`}
        size="lg"
      >
        {editAgent && (
          <div>
            <p className="text-text-muted font-mono text-xs mb-3">
              Editing the system prompt will affect all future tasks delegated to {editAgent.name}.
            </p>
            <textarea
              className="input w-full font-mono text-xs leading-relaxed resize-y"
              rows={14}
              value={editedPrompt}
              onChange={(e) => setEditedPrompt(e.target.value)}
            />
            <div className="flex items-center justify-between mt-3">
              <span className="font-mono text-xs text-text-faint">{editedPrompt.length} chars</span>
              <div className="flex gap-2">
                <button onClick={() => setEditAgent(null)} className="btn-ghost">Cancel</button>
                <button
                  onClick={handleSavePrompt}
                  disabled={isSaving || !editedPrompt.trim()}
                  className="btn-primary"
                >
                  {isSaving ? 'Saving...' : 'Save Prompt'}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Test Agent Modal */}
      <Modal
        isOpen={!!testAgent}
        onClose={() => { setTestAgent(null); setTestOutput(''); setTestInput(''); }}
        title={`Test — ${testAgent?.name}`}
        size="lg"
      >
        {testAgent && (
          <div className="space-y-4">
            <div>
              <label className="label mb-1.5 block">Test Message</label>
              <textarea
                className="input w-full text-sm resize-none"
                rows={4}
                placeholder="Hello, introduce yourself briefly..."
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
              />
            </div>
            <button
              onClick={handleTest}
              disabled={isTesting}
              className="btn-primary flex items-center gap-2"
            >
              {isTesting ? <><LoadingSpinner size="sm" /> Running...</> : <><Zap size={13} /> Run Test</>}
            </button>
            {(testOutput || isTesting) && (
              <OutputPanel
                output={testOutput}
                isStreaming={isTesting}
                agentName={testAgent.name}
                colorTag={testAgent.color_tag}
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
