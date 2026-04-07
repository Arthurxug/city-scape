import React from 'react';
import { Eye, Edit2, Play, Activity } from 'lucide-react';
import AgentAvatar from './AgentAvatar';
import StatusBadge from './StatusBadge';

export default function AgentCard({
  agent,
  selectable = false,
  selected = false,
  onSelect,
  onViewPrompt,
  onEditPrompt,
  onTest,
  onSystemHealth,
  onProposeImprovement,
  compact = false,
}) {
  const isATLAS = agent.name === 'ATLAS';

  return (
    <div
      className={`card p-4 transition-all duration-200 ${
        selectable ? 'cursor-pointer hover:border-gold/30' : ''
      } ${
        selected
          ? 'border-gold/60 bg-gold/5 shadow-gold-glow'
          : 'border-white/5'
      } ${isATLAS ? 'border-white/20' : ''}`}
      onClick={selectable ? onSelect : undefined}
      style={selected ? { borderColor: `${agent.color_tag}60` } : {}}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <AgentAvatar agentName={agent.name} size={compact ? 36 : 48} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className="font-display font-bold text-sm"
              style={{ color: agent.color_tag || '#C8A96E' }}
            >
              {agent.name}
            </h3>
            {isATLAS && (
              <span className="font-label text-[9px] uppercase tracking-widest border border-white/20 text-text-muted px-1.5 py-0.5 rounded">
                System
              </span>
            )}
          </div>
          <p className="font-mono text-xs text-text-muted mt-0.5">{agent.role}</p>
          {agent.personality_tagline && (
            <p className="font-label text-[10px] italic text-text-faint mt-1">
              "{agent.personality_tagline}"
            </p>
          )}
        </div>

        {/* Status indicator */}
        <div className="flex-shrink-0">
          <StatusBadge status={agent.status || 'idle'} showLabel={false} size="md" />
        </div>
      </div>

      {/* Stats row */}
      {!compact && (
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
          <div>
            <p className="font-label text-[9px] uppercase tracking-wider text-text-faint">Tasks</p>
            <p className="font-display font-bold text-sm" style={{ color: agent.color_tag }}>
              {agent.task_count || 0}
            </p>
          </div>
          <div>
            <p className="font-label text-[9px] uppercase tracking-wider text-text-faint">Status</p>
            <StatusBadge status={agent.status || 'idle'} size="sm" />
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!selectable && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/5">
          {onViewPrompt && (
            <button onClick={onViewPrompt} className="btn-ghost flex items-center gap-1 text-xs">
              <Eye size={11} /> Prompt
            </button>
          )}
          {onEditPrompt && (
            <button onClick={onEditPrompt} className="btn-ghost flex items-center gap-1 text-xs">
              <Edit2 size={11} /> Edit
            </button>
          )}
          {onTest && (
            <button onClick={onTest} className="btn-ghost flex items-center gap-1 text-xs">
              <Play size={11} /> Test
            </button>
          )}
          {isATLAS && onSystemHealth && (
            <button
              onClick={onSystemHealth}
              className="flex items-center gap-1 text-xs font-mono px-2 py-1 rounded bg-white/5 border border-white/10 text-text-muted hover:text-text-primary hover:border-white/20 transition-all"
            >
              <Activity size={11} /> System Health
            </button>
          )}
          {isATLAS && onProposeImprovement && (
            <button
              onClick={onProposeImprovement}
              className="flex items-center gap-1 text-xs font-mono px-2 py-1 rounded bg-gold/5 border border-gold/20 text-gold hover:bg-gold/10 transition-all"
            >
              + Propose
            </button>
          )}
        </div>
      )}

      {/* Selection indicator for selectable mode */}
      {selectable && selected && (
        <div
          className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
          style={{ background: agent.color_tag }}
        >
          <span className="text-bg-base text-[10px] font-bold">✓</span>
        </div>
      )}
    </div>
  );
}
