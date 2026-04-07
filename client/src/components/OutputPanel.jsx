import React, { useEffect, useRef } from 'react';
import { Copy, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import AgentAvatar from './AgentAvatar';
import LoadingSpinner from './LoadingSpinner';

// Minimal markdown renderer
function renderMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^---$/gm, '<hr/>')
    .replace(/^\* (.+)$/gm, '<li>$1</li>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    .replace(/(<li>[\s\S]+?<\/li>)/g, '<ul>$1</ul>')
    .replace(/<\/ul>\s*<ul>/g, '')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hup]|<li|<hr)(.+)$/gm, '$1')
    .trim();
}

export default function OutputPanel({ output, isStreaming, agentName, colorTag }) {
  const endRef = useRef(null);

  useEffect(() => {
    if (isStreaming) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output, isStreaming]);

  function handleCopy() {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast.success('Copied to clipboard');
  }

  if (!output && !isStreaming) return null;

  return (
    <div className="card border-gold/20 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-bg-elevated">
        <div className="flex items-center gap-2.5">
          {agentName && <AgentAvatar agentName={agentName} size={22} />}
          <span className="font-label text-xs uppercase tracking-wider" style={{ color: colorTag || '#C8A96E' }}>
            {agentName || 'Agent'}
          </span>
          {isStreaming && (
            <span className="flex items-center gap-1.5 text-text-muted font-mono text-xs">
              <LoadingSpinner size="sm" />
              Generating...
            </span>
          )}
          {!isStreaming && output && (
            <span className="flex items-center gap-1 text-success font-mono text-xs">
              <CheckCircle size={11} /> Complete
            </span>
          )}
        </div>
        {output && !isStreaming && (
          <button onClick={handleCopy} className="btn-ghost flex items-center gap-1 text-xs">
            <Copy size={11} /> Copy
          </button>
        )}
      </div>

      {/* Output content */}
      <div className="px-5 py-4 max-h-[600px] overflow-y-auto">
        <div
          className="prose-atc"
          dangerouslySetInnerHTML={{ __html: `<p>${renderMarkdown(output)}</p>` }}
        />
        {isStreaming && (
          <span className="inline-block w-0.5 h-4 bg-gold animate-pulse ml-0.5 align-middle" />
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
