import React, { useState } from 'react';
import { CheckCircle, XCircle, Loader, Plug, TestTube } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateIntegration, testIntegration } from '../lib/api';
import Modal from './Modal';

// Icon colors per integration
const brandColors = {
  'Anthropic Claude':    '#C8A96E',
  'Supabase':            '#3ECF8E',
  'Google Analytics 4':  '#E37400',
  'Google Search Console': '#4285F4',
  'Google Ads':          '#4285F4',
  'Gmail':               '#EA4335',
  'Google Drive':        '#0F9D58',
  'Google Calendar':     '#4285F4',
  'Meta Ads':            '#1877F2',
  'Ahrefs':              '#FF8000',
  'WhatsApp Business':   '#25D366',
  'Slack':               '#4A154B',
  'Canva':               '#00C4CC',
  'Zapier / Make':       '#FF4A00',
};

export default function IntegrationCard({ integration, onUpdate }) {
  const [showModal, setShowModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const isConnected = integration.status === 'connected';
  const color = brandColors[integration.name] || '#888888';

  async function handleSave() {
    if (!apiKey.trim()) return;
    setIsSaving(true);
    try {
      const updated = await updateIntegration(integration.id, { api_key: apiKey });
      onUpdate(updated);
      toast.success(`${integration.name} connected`);
      setShowModal(false);
      setApiKey('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDisconnect() {
    try {
      const updated = await updateIntegration(integration.id, { api_key: '', status: 'disconnected' });
      onUpdate(updated);
      toast.success(`${integration.name} disconnected`);
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleTest() {
    setIsTesting(true);
    try {
      const result = await testIntegration(integration.id);
      onUpdate({ ...integration, status: result.status, last_tested: new Date().toISOString() });
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsTesting(false);
    }
  }

  const initial = integration.name[0];

  return (
    <>
      <div className="card p-4 hover:border-white/10 transition-all duration-200">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-display font-bold text-sm"
            style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
          >
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-mono text-sm text-text-primary truncate">{integration.name}</h3>
            {integration.endpoint && (
              <p className="font-mono text-[10px] text-text-faint truncate">{integration.endpoint}</p>
            )}
          </div>
          <div className="flex-shrink-0">
            {isConnected ? (
              <CheckCircle size={14} className="text-success" />
            ) : (
              <XCircle size={14} className="text-text-faint" />
            )}
          </div>
        </div>

        {/* Notes */}
        {integration.notes && (
          <p className="font-mono text-[11px] text-text-faint mb-3 leading-relaxed">{integration.notes}</p>
        )}

        {/* Status + last tested */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`font-label text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
            isConnected
              ? 'bg-success/10 text-success border border-success/20'
              : 'bg-white/5 text-text-faint border border-white/10'
          }`}>
            {integration.status}
          </span>
          {integration.last_tested && (
            <span className="text-text-faint font-mono text-[10px]">
              Tested {new Date(integration.last_tested).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {!isConnected ? (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 btn-secondary text-xs py-1.5"
            >
              <Plug size={11} /> Connect
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-1.5 btn-danger text-xs py-1.5"
            >
              Disconnect
            </button>
          )}
          {isConnected && (
            <button
              onClick={handleTest}
              disabled={isTesting}
              className="flex items-center gap-1.5 btn-ghost text-xs"
            >
              {isTesting ? <Loader size={11} className="animate-spin" /> : <TestTube size={11} />}
              Test
            </button>
          )}
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setApiKey(''); }}
        title={`Connect ${integration.name}`}
        size="sm"
      >
        <p className="text-text-muted font-mono text-sm mb-4">{integration.notes}</p>
        {integration.endpoint && (
          <p className="font-mono text-xs text-text-faint mb-4">
            Endpoint: <span className="text-gold">{integration.endpoint}</span>
          </p>
        )}
        <label className="label mb-1.5 block">API Key / Token</label>
        <input
          type="password"
          className="input mb-4"
          placeholder="Paste your API key..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
          autoFocus
        />
        <div className="flex gap-2 justify-end">
          <button onClick={() => setShowModal(false)} className="btn-ghost">Cancel</button>
          <button onClick={handleSave} disabled={isSaving || !apiKey.trim()} className="btn-primary">
            {isSaving ? 'Saving...' : 'Save & Connect'}
          </button>
        </div>
      </Modal>
    </>
  );
}
