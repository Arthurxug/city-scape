import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getIntegrations } from '../lib/api';
import IntegrationCard from '../components/IntegrationCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Integrations() {
  const [integrations, setIntegrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getIntegrations()
      .then(setIntegrations)
      .catch(() => toast.error('Failed to load integrations'))
      .finally(() => setIsLoading(false));
  }, []);

  function handleUpdate(updated) {
    setIntegrations(prev => prev.map(i => i.id === updated.id ? { ...i, ...updated } : i));
  }

  const connected = integrations.filter(i => i.status === 'connected').length;
  const total = integrations.length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display font-black text-2xl text-text-primary">Integrations</h1>
          <p className="font-mono text-sm text-text-muted mt-1">
            Connect external APIs and services to power your agents
          </p>
        </div>
        <div className="flex items-center gap-2 card px-4 py-2">
          <CheckCircle size={14} className="text-success" />
          <span className="font-mono text-sm text-text-primary">{connected}</span>
          <span className="font-mono text-sm text-text-faint">/ {total} connected</span>
        </div>
      </div>

      {/* Status bar */}
      <div className="card p-4 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <p className="label flex-1">Connection Status</p>
          <span className="font-mono text-xs text-text-muted">{Math.round((connected / total) * 100) || 0}%</span>
        </div>
        <div className="w-full h-1.5 bg-bg-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold to-success rounded-full transition-all duration-500"
            style={{ width: `${(connected / total) * 100 || 0}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="font-mono text-[10px] text-text-faint">{connected} connected</span>
          <span className="font-mono text-[10px] text-text-faint">{total - connected} disconnected</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {integrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
