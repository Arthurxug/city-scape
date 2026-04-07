import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Send, Activity, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { getAgents, getTaskStats, getTasks } from '../lib/api';
import AgentAvatar from '../components/AgentAvatar';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import CommandCenterCore from '../components/CommandCenterCore';
import toast from 'react-hot-toast';

const statusIcon = { completed: CheckCircle, running: Clock, failed: AlertCircle, pending: Clock };
const statusColor = { completed: '#4CAF7D', running: '#C8A96E', failed: '#E05252', pending: '#888888' };

function StatCard({ label, value, sub, color = '#C8A96E' }) {
  return (
    <div className="card p-4">
      <p className="label mb-2">{label}</p>
      <p className="font-display font-black text-3xl" style={{ color }}>{value}</p>
      {sub && <p className="font-mono text-xs text-text-muted mt-1">{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-elevated border border-gold/30 rounded px-3 py-2 font-mono text-xs">
      <p className="text-text-muted">{label}</p>
      <p className="text-gold font-semibold">{payload[0].value} tasks</p>
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [quickTask, setQuickTask] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [agentData, statsData, tasksData] = await Promise.all([
          getAgents(),
          getTaskStats(),
          getTasks({ limit: 5 }),
        ]);
        setAgents(agentData || []);
        setStats(statsData);
        setRecentTasks(tasksData.data || []);
      } catch (err) {
        toast.error('Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  function handleQuickDelegate(e) {
    e.preventDefault();
    if (!quickTask.trim()) return;
    navigate('/delegate', { state: { prefillTask: quickTask } });
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const activeAgents = agents.filter(a => a.status === 'active').length;
  const weekTotal = stats?.total || 0;

  // Show command center view
  return <CommandCenterCore />;

  // Legacy dashboard code below (kept for reference)
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-black text-2xl text-text-primary">Command Center</h1>
          <p className="font-mono text-sm text-text-muted mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button onClick={() => navigate('/delegate')} className="btn-primary flex items-center gap-2">
          <Send size={14} /> Delegate Task
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Agents" value={activeAgents} sub={`${agents.length} total agents`} />
        <StatCard label="Tasks This Week" value={weekTotal} sub="All agents combined" color="#4CAF7D" />
        <StatCard
          label="Completed"
          value={stats?.agentCounts ? Object.values(stats.agentCounts).reduce((a, b) => a + b, 0) : 0}
          sub="7-day period"
          color="#4CAF7D"
        />
        <StatCard label="Active Tasks" value={stats?.activeTasks || 0} sub="Currently running" color={stats?.activeTasks > 0 ? '#C8A96E' : '#888888'} />
      </div>

      {/* Chart + Quick Delegate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly chart */}
        <div className="card p-5 lg:col-span-2">
          <p className="label mb-4">Task Volume — Last 7 Days</p>
          {stats?.chartData ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={stats.chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C8A96E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C8A96E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" />
                <XAxis dataKey="day" tick={{ fill: '#888', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#888', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="tasks" stroke="#C8A96E" strokeWidth={2} fill="url(#goldGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-text-faint font-mono text-sm">No data yet</div>
          )}
        </div>

        {/* Quick delegate */}
        <div className="card p-5">
          <p className="label mb-3">Quick Delegate</p>
          <form onSubmit={handleQuickDelegate} className="space-y-3">
            <textarea
              className="input resize-none text-sm"
              rows={5}
              placeholder="Type a quick task and press Delegate..."
              value={quickTask}
              onChange={(e) => setQuickTask(e.target.value)}
            />
            <button type="submit" disabled={!quickTask.trim()} className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
              <Send size={13} /> Delegate
            </button>
          </form>
        </div>
      </div>

      {/* Agent Status Board */}
      <div className="card p-5">
        <p className="label mb-4">Agent Status Board</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-bg-elevated border border-white/5 hover:border-gold/20 transition-all cursor-pointer"
              onClick={() => navigate('/agents')}
            >
              <AgentAvatar agentName={agent.name} size={36} />
              <p className="font-label text-[9px] uppercase tracking-wider text-center truncate w-full" style={{ color: agent.color_tag }}>
                {agent.name}
              </p>
              <StatusBadge status={agent.status || 'idle'} showLabel={false} size="sm" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Outputs */}
      {recentTasks.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <p className="label">Recent Outputs</p>
            <button onClick={() => navigate('/tasks')} className="text-gold hover:text-gold/80 font-mono text-xs">
              View all →
            </button>
          </div>
          <div className="divide-y divide-white/5">
            {recentTasks.map((task) => {
              const agent = agents.find(a => a.name === task.agent_name);
              const Icon = statusIcon[task.status] || Clock;
              return (
                <div key={task.id} className="flex items-start gap-3 px-5 py-3 hover:bg-white/2 transition-colors">
                  {agent && <AgentAvatar agentName={agent.name} size={24} />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-label text-[10px] uppercase tracking-wider" style={{ color: agent?.color_tag || '#C8A96E' }}>
                        {task.agent_name}
                      </span>
                      <span className="font-mono text-[10px] text-text-faint">
                        {new Date(task.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-text-muted mt-0.5 truncate">{task.task_input}</p>
                    {task.task_output && (
                      <p className="font-mono text-xs text-text-faint mt-0.5 truncate">
                        {task.task_output.slice(0, 120)}...
                      </p>
                    )}
                  </div>
                  <Icon size={13} style={{ color: statusColor[task.status], flexShrink: 0, marginTop: 2 }} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
