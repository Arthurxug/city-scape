import React, { useState, useEffect } from 'react';
import { User, Key, Download, Sliders, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { getAgents, exportTasksCSV } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';

function SettingsSection({ icon: Icon, title, children }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/5">
        <Icon size={15} className="text-gold" />
        <h2 className="font-display font-semibold text-base text-text-primary">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const [session, setSession] = useState(null);
  const [agents, setAgents] = useState([]);
  const [defaultAgent, setDefaultAgent] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    getAgents().then(setAgents).catch(() => {});
  }, []);

  async function handleExport() {
    setIsExporting(true);
    try {
      await exportTasksCSV();
      toast.success('Task history exported');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsExporting(false);
    }
  }

  const user = session?.user;
  const meta = user?.user_metadata || {};

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="mb-6">
        <h1 className="font-display font-black text-2xl text-text-primary">Settings</h1>
        <p className="font-mono text-sm text-text-muted mt-1">Command center configuration and preferences</p>
      </div>

      {/* Profile */}
      <SettingsSection icon={User} title="Profile">
        <div className="space-y-3">
          <div>
            <p className="label mb-1">Name</p>
            <p className="font-mono text-sm text-text-primary">Arthur</p>
          </div>
          <div>
            <p className="label mb-1">Email</p>
            <p className="font-mono text-sm text-text-primary">{user?.email || '—'}</p>
          </div>
          <div>
            <p className="label mb-1">User ID</p>
            <p className="font-mono text-xs text-text-faint break-all">{user?.id || '—'}</p>
          </div>
          <div>
            <p className="label mb-1">Last Sign In</p>
            <p className="font-mono text-sm text-text-muted">
              {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : '—'}
            </p>
          </div>
        </div>
      </SettingsSection>

      {/* Agent preferences */}
      <SettingsSection icon={Sliders} title="Agent Preferences">
        <div>
          <p className="label mb-2">Default Agent</p>
          <p className="font-mono text-xs text-text-faint mb-2">
            Used when no specific agent is selected for a quick task.
          </p>
          <select
            className="input text-sm max-w-xs"
            value={defaultAgent}
            onChange={(e) => {
              setDefaultAgent(e.target.value);
              toast.success('Default agent saved');
            }}
          >
            <option value="">None — always choose manually</option>
            {agents.map(a => (
              <option key={a.id} value={a.id}>{a.name} — {a.role}</option>
            ))}
          </select>
        </div>
      </SettingsSection>

      {/* API Keys info */}
      <SettingsSection icon={Key} title="API Keys">
        <p className="font-mono text-sm text-text-muted mb-4">
          API keys are stored server-side in environment variables and never exposed to the client.
          To update keys, edit the <code className="bg-bg-elevated px-1.5 py-0.5 rounded text-gold text-xs">.env</code> file
          and restart the server.
        </p>
        <div className="space-y-2">
          {[
            { key: 'ANTHROPIC_API_KEY', desc: 'Anthropic Claude — AI engine' },
            { key: 'SUPABASE_URL', desc: 'Supabase — Database URL' },
            { key: 'SUPABASE_ANON_KEY', desc: 'Supabase — Client key' },
            { key: 'SUPABASE_SERVICE_ROLE_KEY', desc: 'Supabase — Service role key' },
          ].map(({ key, desc }) => (
            <div key={key} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
              <div className="flex-1">
                <p className="font-label text-[10px] uppercase tracking-wider text-text-faint">{desc}</p>
                <code className="font-mono text-xs text-text-muted">{key}</code>
              </div>
              <span className="font-mono text-xs text-text-faint">••••••••</span>
            </div>
          ))}
        </div>
        <p className="font-mono text-xs text-text-faint mt-3">
          Go to <a href="/integrations" className="text-gold hover:underline">Integrations</a> to connect third-party APIs.
        </p>
      </SettingsSection>

      {/* Notifications placeholder */}
      <SettingsSection icon={Bell} title="Notifications">
        <p className="font-mono text-sm text-text-muted mb-3">
          Toast notifications are always active for task completions, errors, and system events.
        </p>
        <div className="space-y-2">
          {[
            'Task completion alerts',
            'Agent errors and failures',
            'Integration status changes',
          ].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <div className="w-8 h-5 bg-success/20 border border-success/30 rounded-full flex items-center justify-end px-0.5">
                <div className="w-3.5 h-3.5 rounded-full bg-success" />
              </div>
              <span className="font-mono text-sm text-text-muted">{item}</span>
            </div>
          ))}
        </div>
      </SettingsSection>

      {/* Data export */}
      <SettingsSection icon={Download} title="Data Export">
        <p className="font-mono text-sm text-text-muted mb-4">
          Download your complete task history as a CSV file for external analysis or archiving.
        </p>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="btn-secondary flex items-center gap-2"
        >
          {isExporting ? <LoadingSpinner size="sm" /> : <Download size={13} />}
          Export All Tasks (CSV)
        </button>
      </SettingsSection>

      {/* System info */}
      <div className="card p-4 border-white/5">
        <div className="flex flex-wrap gap-6 text-center">
          {[
            { label: 'Version', value: '1.0.0' },
            { label: 'Model', value: 'claude-sonnet-4' },
            { label: 'Database', value: 'Supabase' },
            { label: 'Theme', value: 'Dark' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="label mb-1">{label}</p>
              <p className="font-mono text-sm text-text-primary">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
