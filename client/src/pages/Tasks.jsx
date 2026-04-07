import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Download, ChevronRight, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { getTasks, exportTasksCSV } from '../lib/api';
import AgentAvatar from '../components/AgentAvatar';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';

const AGENTS = ['ATLAS','MAYA','SALES AGENT','SEO & CONTENT','MARKETING STRATEGIST','SOCIAL MEDIA MANAGER','PERFORMANCE MANAGER','DATA ANALYST'];
const STATUSES = ['pending', 'running', 'completed', 'failed'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const priorityColor = { low: '#888888', medium: '#C8A96E', high: '#D4843E', urgent: '#E05252' };

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [filterAgent, setFilterAgent] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  // Drawer
  const [selectedTask, setSelectedTask] = useState(null);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getTasks({
        search: search || undefined,
        agent_name: filterAgent || undefined,
        status: filterStatus || undefined,
        from: filterFrom || undefined,
        to: filterTo || undefined,
        limit: 100,
      });
      setTasks(data.data || []);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, [search, filterAgent, filterStatus, filterFrom, filterTo]);

  useEffect(() => {
    const t = setTimeout(loadTasks, 300);
    return () => clearTimeout(t);
  }, [loadTasks]);

  async function handleExport() {
    setIsExporting(true);
    try {
      await exportTasksCSV();
      toast.success('CSV downloaded');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsExporting(false);
    }
  }

  function clearFilters() {
    setSearch(''); setFilterAgent(''); setFilterStatus(''); setFilterFrom(''); setFilterTo('');
  }

  const hasFilters = search || filterAgent || filterStatus || filterFrom || filterTo;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display font-black text-2xl text-text-primary">Task History</h1>
          <p className="font-mono text-sm text-text-muted mt-1">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          {isExporting ? <LoadingSpinner size="sm" /> : <Download size={13} />}
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
            <input
              className="input pl-8 text-sm"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Agent filter */}
          <select
            className="input text-sm"
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
          >
            <option value="">All Agents</option>
            {AGENTS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>

          {/* Status filter */}
          <select
            className="input text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Clear */}
          <button
            onClick={clearFilters}
            disabled={!hasFilters}
            className="btn-ghost flex items-center justify-center gap-1.5 text-sm disabled:opacity-30"
          >
            <X size={12} /> Clear
          </button>
        </div>

        {/* Date range */}
        <div className="flex gap-3 mt-3">
          <div className="flex items-center gap-2">
            <label className="font-label text-[10px] uppercase tracking-wider text-text-faint">From</label>
            <input type="date" className="input text-xs py-1.5" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <label className="font-label text-[10px] uppercase tracking-wider text-text-faint">To</label>
            <input type="date" className="input text-xs py-1.5" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-text-faint">
            <Filter size={32} className="mb-3 opacity-30" />
            <p className="font-mono text-sm">No tasks found</p>
            {hasFilters && (
              <button onClick={clearFilters} className="mt-2 text-gold font-mono text-xs hover:underline">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 font-label text-[10px] uppercase tracking-wider text-text-faint">Agent</th>
                  <th className="text-left px-4 py-3 font-label text-[10px] uppercase tracking-wider text-text-faint">Task</th>
                  <th className="text-left px-4 py-3 font-label text-[10px] uppercase tracking-wider text-text-faint">Priority</th>
                  <th className="text-left px-4 py-3 font-label text-[10px] uppercase tracking-wider text-text-faint">Status</th>
                  <th className="text-left px-4 py-3 font-label text-[10px] uppercase tracking-wider text-text-faint">Date</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-white/2 cursor-pointer transition-colors"
                    onClick={() => setSelectedTask(task)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <AgentAvatar agentName={task.agent_name} size={20} />
                        <span className="font-mono text-xs text-text-muted whitespace-nowrap">{task.agent_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-mono text-xs text-text-primary truncate">{task.task_input}</p>
                      {task.task_output && (
                        <p className="font-mono text-[10px] text-text-faint truncate mt-0.5">
                          {task.task_output.slice(0, 80)}...
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="font-label text-[9px] uppercase tracking-wider px-2 py-1 rounded border"
                        style={{
                          color: priorityColor[task.priority],
                          borderColor: `${priorityColor[task.priority]}40`,
                          background: `${priorityColor[task.priority]}10`,
                        }}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={task.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono text-xs text-text-faint">
                        {new Date(task.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight size={13} className="text-text-faint" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Task detail drawer */}
      <Modal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title={`Task — ${selectedTask?.agent_name}`}
        size="xl"
      >
        {selectedTask && (
          <div className="space-y-4">
            {/* Meta */}
            <div className="flex flex-wrap gap-4 pb-4 border-b border-white/5">
              <div>
                <p className="label mb-1">Agent</p>
                <div className="flex items-center gap-2">
                  <AgentAvatar agentName={selectedTask.agent_name} size={20} />
                  <span className="font-mono text-sm">{selectedTask.agent_name}</span>
                </div>
              </div>
              <div>
                <p className="label mb-1">Priority</p>
                <span className="font-label text-xs" style={{ color: priorityColor[selectedTask.priority] }}>
                  {selectedTask.priority}
                </span>
              </div>
              <div>
                <p className="label mb-1">Status</p>
                <StatusBadge status={selectedTask.status} />
              </div>
              <div>
                <p className="label mb-1">Created</p>
                <span className="font-mono text-xs text-text-muted">
                  {new Date(selectedTask.created_at).toLocaleString()}
                </span>
              </div>
              {selectedTask.completed_at && (
                <div>
                  <p className="label mb-1">Completed</p>
                  <span className="font-mono text-xs text-text-muted">
                    {new Date(selectedTask.completed_at).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Input */}
            <div>
              <p className="label mb-2">Task Input</p>
              <div className="bg-bg-elevated rounded border border-white/5 p-3">
                <p className="font-mono text-sm text-text-primary whitespace-pre-wrap">{selectedTask.task_input}</p>
              </div>
            </div>

            {/* Output */}
            {selectedTask.task_output && (
              <div>
                <p className="label mb-2">Agent Output</p>
                <div className="bg-bg-elevated rounded border border-white/5 p-3 max-h-80 overflow-y-auto">
                  <p className="font-mono text-sm text-text-primary whitespace-pre-wrap">{selectedTask.task_output}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
