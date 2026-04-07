import React from 'react';

const configs = {
  idle:      { dot: 'bg-text-faint',                          label: 'Idle',      text: 'text-text-muted' },
  active:    { dot: 'bg-success shadow-success-glow animate-pulse', label: 'Active',    text: 'text-success' },
  running:   { dot: 'bg-gold shadow-gold-glow animate-pulse',  label: 'Running',   text: 'text-gold' },
  pending:   { dot: 'bg-gold/60',                              label: 'Pending',   text: 'text-gold/80' },
  completed: { dot: 'bg-success',                              label: 'Completed', text: 'text-success' },
  failed:    { dot: 'bg-danger shadow-danger-glow',            label: 'Failed',    text: 'text-danger' },
  error:     { dot: 'bg-danger shadow-danger-glow',            label: 'Error',     text: 'text-danger' },
  connected: { dot: 'bg-success shadow-success-glow',          label: 'Connected', text: 'text-success' },
  disconnected: { dot: 'bg-text-faint',                        label: 'Disconnected', text: 'text-text-muted' },
};

export default function StatusBadge({ status = 'idle', showLabel = true, size = 'sm' }) {
  const cfg = configs[status] || configs.idle;
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`rounded-full flex-shrink-0 ${dotSize} ${cfg.dot}`} />
      {showLabel && (
        <span className={`font-label text-xs uppercase tracking-wider ${cfg.text}`}>
          {cfg.label}
        </span>
      )}
    </span>
  );
}
