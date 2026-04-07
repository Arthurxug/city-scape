import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, Paperclip, ChevronDown, X, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAgents, getAssets, delegateTask, collaborateTask, readSSEStream } from '../lib/api';
import AgentCard from '../components/AgentCard';
import OutputPanel from '../components/OutputPanel';
import CollaborationThread from '../components/CollaborationThread';
import { AssetSelector } from '../components/AssetUploader';
import LoadingSpinner from '../components/LoadingSpinner';

const PRIORITIES = [
  { value: 'low',    label: 'Low',    color: '#888888' },
  { value: 'medium', label: 'Normal', color: '#C8A96E' },
  { value: 'high',   label: 'High',   color: '#D4843E' },
  { value: 'urgent', label: 'Urgent', color: '#E05252' },
];

export default function Delegate() {
  const location = useLocation();

  const [agents, setAgents] = useState([]);
  const [assets, setAssets] = useState([]);
  const [selectedAgentIds, setSelectedAgentIds] = useState([]);
  const [taskInput, setTaskInput] = useState(location.state?.prefillTask || '');
  const [priority, setPriority] = useState('medium');
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [showAssets, setShowAssets] = useState(false);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Single-agent output
  const [output, setOutput] = useState('');
  const [outputAgent, setOutputAgent] = useState(null);

  // Collaboration output
  const [collabTurns, setCollabTurns] = useState([]);
  const [activeCollab, setActiveCollab] = useState(null); // agentName of current turn
  const [collabDone, setCollabDone] = useState(false);

  const isCollabMode = selectedAgentIds.length >= 2;

  useEffect(() => {
    getAgents()
      .then(setAgents)
      .catch(() => toast.error('Failed to load agents'))
      .finally(() => setIsLoadingAgents(false));
  }, []);

  async function loadAssets() {
    if (assets.length > 0) return;
    setIsLoadingAssets(true);
    try {
      const data = await getAssets();
      setAssets(data);
    } catch (err) {
      toast.error('Failed to load assets');
    } finally {
      setIsLoadingAssets(false);
    }
  }

  function toggleAgent(agent) {
    setSelectedAgentIds(prev =>
      prev.includes(agent.id)
        ? prev.filter(id => id !== agent.id)
        : [...prev, agent.id]
    );
  }

  function toggleAsset(asset) {
    setSelectedAssets(prev =>
      prev.some(a => a.id === asset.id)
        ? prev.filter(a => a.id !== asset.id)
        : [...prev, asset]
    );
  }

  async function handleDelegate() {
    if (!taskInput.trim()) { toast.error('Please enter a task'); return; }
    if (selectedAgentIds.length === 0) { toast.error('Select at least one agent'); return; }

    setIsStreaming(true);
    setOutput('');
    setCollabTurns([]);
    setCollabDone(false);
    setActiveCollab(null);

    try {
      if (isCollabMode) {
        await runCollaboration();
      } else {
        await runSingleAgent();
      }
    } catch (err) {
      toast.error(err.message);
      setIsStreaming(false);
    }
  }

  async function runSingleAgent() {
    const agentId = selectedAgentIds[0];
    const agent = agents.find(a => a.id === agentId);
    setOutputAgent(agent);

    const response = await delegateTask(agentId, taskInput, priority, selectedAssets);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Delegation failed');
    }

    for await (const event of readSSEStream(response)) {
      if (event.type === 'delta') {
        setOutput(prev => prev + event.text);
      } else if (event.type === 'done') {
        setIsStreaming(false);
        toast.success('Task complete');
      } else if (event.type === 'error') {
        throw new Error(event.message);
      }
    }
    setIsStreaming(false);
  }

  async function runCollaboration() {
    // Initialize turn slots
    const orderedAgents = selectedAgentIds
      .map(id => agents.find(a => a.id === id))
      .filter(Boolean);

    const initialTurns = orderedAgents.map((agent, i) => ({
      agentName: agent.name,
      colorTag: agent.color_tag,
      turnOrder: i + 1,
      output: '',
      status: 'pending',
    }));
    setCollabTurns(initialTurns);

    const response = await collaborateTask(selectedAgentIds, taskInput, priority, selectedAssets);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Collaboration failed');
    }

    for await (const event of readSSEStream(response)) {
      if (event.type === 'turn_start') {
        setActiveCollab(event.agentName);
        setCollabTurns(prev => prev.map(t =>
          t.agentName === event.agentName ? { ...t, status: 'running' } : t
        ));
      } else if (event.type === 'delta') {
        setCollabTurns(prev => prev.map(t =>
          t.agentName === event.agentName
            ? { ...t, output: t.output + event.text }
            : t
        ));
      } else if (event.type === 'turn_done') {
        setCollabTurns(prev => prev.map(t =>
          t.agentName === event.agentName ? { ...t, status: 'done' } : t
        ));
      } else if (event.type === 'session_done') {
        setCollabDone(true);
        setActiveCollab(null);
        setIsStreaming(false);
        toast.success('Collaboration complete');
      } else if (event.type === 'error') {
        throw new Error(event.message);
      }
    }
    setIsStreaming(false);
  }

  const selectedAgents = selectedAgentIds.map(id => agents.find(a => a.id === id)).filter(Boolean);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-black text-2xl text-text-primary">Delegate Task</h1>
        <p className="font-mono text-sm text-text-muted mt-1">
          Select agent(s), write your task, and deploy. Select 2+ agents to enable collaboration mode.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left: Agent selector + task input */}
        <div className="xl:col-span-2 space-y-4">

          {/* Agent grid */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="label">Select Agent(s)</p>
              {selectedAgentIds.length > 0 && (
                <div className="flex items-center gap-1.5">
                  {isCollabMode && (
                    <span className="flex items-center gap-1 font-label text-[10px] uppercase tracking-wider text-gold border border-gold/30 px-2 py-0.5 rounded">
                      <Users size={9} /> Collab
                    </span>
                  )}
                  <button
                    onClick={() => setSelectedAgentIds([])}
                    className="text-text-faint hover:text-text-muted font-mono text-xs"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {isLoadingAgents ? (
              <div className="flex justify-center py-8"><LoadingSpinner /></div>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-[500px] overflow-y-auto pr-1">
                {agents.map((agent) => (
                  <div key={agent.id} className="relative">
                    <AgentCard
                      agent={agent}
                      selectable
                      selected={selectedAgentIds.includes(agent.id)}
                      onSelect={() => toggleAgent(agent)}
                      compact
                    />
                    {selectedAgentIds.includes(agent.id) && (
                      <div
                        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-bg-base"
                        style={{ background: agent.color_tag }}
                      >
                        {selectedAgentIds.indexOf(agent.id) + 1}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Priority */}
          <div className="card p-4">
            <p className="label mb-2">Priority</p>
            <div className="flex gap-2 flex-wrap">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPriority(p.value)}
                  className={`font-label text-[10px] uppercase tracking-wider px-3 py-1.5 rounded border transition-all ${
                    priority === p.value
                      ? 'border-current'
                      : 'border-white/10 text-text-faint hover:border-white/20 hover:text-text-muted'
                  }`}
                  style={priority === p.value ? { color: p.color, borderColor: `${p.color}60`, background: `${p.color}10` } : {}}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Task input + output */}
        <div className="xl:col-span-3 space-y-4">
          {/* Task input */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="label">Task</p>
              <button
                onClick={() => { setShowAssets(!showAssets); if (!showAssets) loadAssets(); }}
                className={`flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded border transition-all ${
                  showAssets
                    ? 'border-gold/40 text-gold bg-gold/5'
                    : 'border-white/10 text-text-muted hover:border-gold/30 hover:text-gold'
                } ${selectedAssets.length > 0 ? 'border-gold/40 text-gold' : ''}`}
              >
                <Paperclip size={11} />
                {selectedAssets.length > 0 ? `${selectedAssets.length} asset${selectedAssets.length > 1 ? 's' : ''} attached` : 'Attach Assets'}
              </button>
            </div>

            {/* Asset selector panel */}
            {showAssets && (
              <div className="mb-3 p-3 bg-bg-elevated rounded border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-label text-[10px] uppercase tracking-wider text-text-muted">Company Assets</p>
                  <button onClick={() => setShowAssets(false)} className="text-text-faint hover:text-text-muted">
                    <X size={12} />
                  </button>
                </div>
                <AssetSelector
                  assets={assets}
                  selectedAssets={selectedAssets}
                  onToggle={toggleAsset}
                  isLoading={isLoadingAssets}
                />
              </div>
            )}

            <textarea
              className="input w-full resize-none text-sm leading-relaxed"
              rows={isCollabMode ? 8 : 10}
              placeholder={
                isCollabMode
                  ? `Describe your task for the collaboration team (${selectedAgents.map(a => a.name).join(' → ')})...`
                  : "Describe the task in detail. Be specific about the deliverable, context, and any constraints..."
              }
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
            />

            {/* Collab chain preview */}
            {isCollabMode && selectedAgents.length > 0 && (
              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                <span className="font-label text-[10px] text-text-faint uppercase tracking-wider">Chain:</span>
                {selectedAgents.map((agent, i) => (
                  <React.Fragment key={agent.id}>
                    <span
                      className="font-label text-[10px] px-2 py-0.5 rounded border"
                      style={{ color: agent.color_tag, borderColor: `${agent.color_tag}40`, background: `${agent.color_tag}10` }}
                    >
                      {agent.name}
                    </span>
                    {i < selectedAgents.length - 1 && (
                      <span className="text-text-faint text-xs">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {/* Delegate button */}
          <button
            onClick={handleDelegate}
            disabled={isStreaming || !taskInput.trim() || selectedAgentIds.length === 0}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
          >
            {isStreaming ? (
              <>
                <LoadingSpinner size="sm" />
                {isCollabMode ? 'Collaborating...' : 'Delegating...'}
              </>
            ) : (
              <>
                <Send size={15} />
                {isCollabMode
                  ? `Start Collaboration (${selectedAgentIds.length} agents)`
                  : 'Delegate Task'}
              </>
            )}
          </button>

          {/* Output area */}
          {isCollabMode ? (
            collabTurns.length > 0 && (
              <CollaborationThread
                turns={collabTurns}
                activeAgentName={activeCollab}
                isComplete={collabDone}
              />
            )
          ) : (
            (output || isStreaming) && (
              <OutputPanel
                output={output}
                isStreaming={isStreaming}
                agentName={outputAgent?.name}
                colorTag={outputAgent?.color_tag}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
