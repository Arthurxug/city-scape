import React, { useEffect, useRef } from 'react';
import { Copy, CheckCircle, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import AgentAvatar from './AgentAvatar';
import LoadingSpinner from './LoadingSpinner';

function renderMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^---$/gm, '<hr/>')
    .replace(/^[*-] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]+?<\/li>)/g, '<ul>$1</ul>')
    .replace(/<\/ul>\s*<ul>/g, '')
    .replace(/\n\n/g, '</p><p>')
    .trim();
}

function TurnBubble({ turn, isActive, isDone, colorTag }) {
  const endRef = useRef(null);

  useEffect(() => {
    if (isActive) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turn.output, isActive]);

  return (
    <div className={`transition-all duration-300 ${isDone && !isActive ? 'opacity-70' : 'opacity-100'}`}>
      {/* Agent header */}
      <div className="flex items-center gap-2.5 mb-2">
        <div className="relative flex-shrink-0">
          <AgentAvatar agentName={turn.agentName} size={28} />
          {isActive && (
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-gold animate-pulse shadow-gold-glow" />
          )}
          {isDone && (
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-success" />
          )}
        </div>
        <div>
          <span className="font-label text-xs uppercase tracking-wider font-semibold" style={{ color: colorTag }}>
            {turn.agentName}
          </span>
          <span className="text-text-faint font-mono text-[10px] ml-2">Turn {turn.turnOrder}</span>
        </div>
        {isActive && (
          <span className="flex items-center gap-1 text-gold font-mono text-[10px] ml-auto">
            <LoadingSpinner size="sm" /> Analyzing...
          </span>
        )}
        {isDone && (
          <span className="flex items-center gap-1 text-success font-mono text-[10px] ml-auto">
            <CheckCircle size={10} /> Done
          </span>
        )}
      </div>

      {/* Output bubble */}
      <div
        className="ml-9 rounded-lg p-3.5 border transition-all duration-300"
        style={{
          background: `${colorTag}08`,
          borderColor: `${colorTag}25`,
        }}
      >
        {turn.output ? (
          <div
            className="prose-atc text-sm"
            dangerouslySetInnerHTML={{ __html: `<p>${renderMarkdown(turn.output)}</p>` }}
          />
        ) : (
          <div className="h-4 flex items-center">
            <span className="inline-block w-0.5 h-4 animate-pulse" style={{ background: colorTag }} />
          </div>
        )}
        {isActive && (
          <span className="inline-block w-0.5 h-4 animate-pulse ml-0.5 align-middle" style={{ background: colorTag }} />
        )}
        <div ref={endRef} />
      </div>

      {/* Copy button when done */}
      {isDone && turn.output && (
        <div className="ml-9 mt-1">
          <button
            onClick={() => { navigator.clipboard.writeText(turn.output); toast.success('Copied'); }}
            className="btn-ghost flex items-center gap-1 text-[11px] py-0.5"
          >
            <Copy size={10} /> Copy
          </button>
        </div>
      )}
    </div>
  );
}

function HandoffArrow({ color }) {
  return (
    <div className="flex items-center gap-2 my-3 ml-3 animate-fade-in">
      <div className="flex flex-col items-center">
        <div className="w-px h-3 bg-gold/30" />
        <ChevronDown size={14} className="text-gold/60" />
      </div>
      <span className="font-label text-[10px] uppercase tracking-widest text-text-faint">
        Passing context
      </span>
    </div>
  );
}

export default function CollaborationThread({ turns, activeAgentName, isComplete, sessionId }) {
  if (!turns || turns.length === 0) return null;

  return (
    <div className="card border-gold/20 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-bg-elevated">
        <div className="flex items-center gap-2.5">
          <div className="flex -space-x-1">
            {turns.slice(0, 3).map((t) => (
              <AgentAvatar key={t.agentName} agentName={t.agentName} size={18} />
            ))}
            {turns.length > 3 && (
              <div className="w-[18px] h-[18px] rounded-full bg-bg-elevated border border-white/10 flex items-center justify-center">
                <span className="text-[8px] text-text-muted">+{turns.length - 3}</span>
              </div>
            )}
          </div>
          <span className="font-label text-xs uppercase tracking-wider text-gold">
            Collaboration — {turns.length} agents
          </span>
          {!isComplete && (
            <span className="flex items-center gap-1 text-text-muted font-mono text-xs">
              <LoadingSpinner size="sm" />
            </span>
          )}
          {isComplete && (
            <span className="flex items-center gap-1 text-success font-mono text-xs">
              <CheckCircle size={11} /> Session complete
            </span>
          )}
        </div>
      </div>

      {/* Thread */}
      <div className="px-4 py-4 max-h-[700px] overflow-y-auto space-y-1">
        {turns.map((turn, idx) => (
          <React.Fragment key={turn.agentName + idx}>
            <TurnBubble
              turn={turn}
              isActive={turn.agentName === activeAgentName && !isComplete}
              isDone={turn.status === 'done'}
              colorTag={turn.colorTag || '#C8A96E'}
            />
            {idx < turns.length - 1 && turn.status === 'done' && (
              <HandoffArrow color={turns[idx + 1]?.colorTag} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
