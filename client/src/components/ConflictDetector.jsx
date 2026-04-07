import React, { useEffect, useState } from 'react';
import { AlertTriangle, Check, AlertCircle } from 'lucide-react';

export default function ConflictDetector() {
  const [potentialConflicts, setPotentialConflicts] = useState([]);
  const [resolutions, setResolutions] = useState([]);

  useEffect(() => {
    // Simulate potential conflicts
    const conflicts = [
      {
        id: 1,
        aircraft1: 'SKY101',
        aircraft2: 'JET202',
        severity: 'high',
        distance: 2.1,
        timeToConflict: 4.2,
        status: 'alert',
        recommendation: 'Climb SKY101 to FL360',
      },
      {
        id: 2,
        aircraft1: 'AIR303',
        aircraft2: 'CARGO04',
        severity: 'medium',
        distance: 3.8,
        timeToConflict: 7.5,
        status: 'warning',
        recommendation: 'Turn CARGO04 heading 270',
      },
      {
        id: 3,
        aircraft1: 'MED505',
        aircraft2: 'EXEC06',
        severity: 'low',
        distance: 4.5,
        timeToConflict: 10.2,
        status: 'info',
        recommendation: 'Monitor separation',
      },
    ];

    setPotentialConflicts(conflicts);

    // Simulated resolutions
    const resolutionData = [
      { id: 1, type: 'climb', description: 'Vertical separation maintained', success: true },
      { id: 2, type: 'turn', description: 'Heading change executed', success: true },
      { id: 3, type: 'speed', description: 'Monitoring in progress', success: null },
    ];

    setResolutions(resolutionData);
  }, []);

  const severityColors = {
    high: { bg: '#E05252', text: '#FF6B6B', border: '#E05252' },
    medium: { bg: '#C8A96E', text: '#F0C850', border: '#C8A96E' },
    low: { bg: '#4CAF7D', text: '#7DFFB8', border: '#4CAF7D' },
  };

  const statusIcon = {
    alert: <AlertTriangle size={12} />,
    warning: <AlertCircle size={12} />,
    info: <Check size={12} />,
  };

  return (
    <div className="space-y-4">
      {/* Conflict Detection Header */}
      <div className="card p-4 border-gold/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="label text-sm">Conflict Detection System</h3>
          <span className="font-mono text-xs text-text-muted">{potentialConflicts.length} monitored</span>
        </div>

        {/* Active Conflicts */}
        <div className="space-y-3">
          {potentialConflicts.map((conflict) => {
            const colors = severityColors[conflict.severity];
            return (
              <div
                key={conflict.id}
                className="p-3 rounded border"
                style={{
                  backgroundColor: `${colors.bg}15`,
                  borderColor: `${colors.border}40`,
                }}
              >
                {/* Conflict Title */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div style={{ color: colors.text }}>{statusIcon[conflict.status]}</div>
                    <span className="font-mono text-xs font-semibold" style={{ color: colors.text }}>
                      {conflict.aircraft1} ↔ {conflict.aircraft2}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-black/30" style={{ color: colors.text }}>
                      {conflict.severity.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[10px] text-text-faint">
                    {conflict.timeToConflict}m
                  </span>
                </div>

                {/* Conflict Details */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[10px] text-text-muted mb-1">
                      <span>Separation</span>
                      <span style={{ color: colors.text }}>{conflict.distance} NM</span>
                    </div>
                    <div className="w-full bg-bg-elevated rounded h-1 overflow-hidden border border-white/5">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (conflict.distance / 5) * 100)}%`,
                          backgroundColor: colors.bg,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="text-[10px] text-text-muted bg-black/20 rounded px-2 py-1.5">
                  <p className="font-mono">
                    <span style={{ color: colors.text }}>→</span> {conflict.recommendation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Statistics */}
        <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-3 gap-2">
          <div className="text-center">
            <p className="text-[10px] text-text-muted mb-1">High Priority</p>
            <p className="font-mono font-semibold text-red-400">
              {potentialConflicts.filter((c) => c.severity === 'high').length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-text-muted mb-1">Medium Priority</p>
            <p className="font-mono font-semibold text-yellow-400">
              {potentialConflicts.filter((c) => c.severity === 'medium').length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-text-muted mb-1">Low Priority</p>
            <p className="font-mono font-semibold text-emerald-400">
              {potentialConflicts.filter((c) => c.severity === 'low').length}
            </p>
          </div>
        </div>
      </div>

      {/* Resolution Actions */}
      <div className="card p-4">
        <h3 className="label text-sm mb-3">Active Resolutions</h3>
        <div className="space-y-2">
          {resolutions.map((resolution) => (
            <div key={resolution.id} className="flex items-center gap-3 p-2 rounded bg-bg-elevated border border-white/5">
              {resolution.success === true ? (
                <Check size={14} className="text-emerald-400 flex-shrink-0" />
              ) : resolution.success === false ? (
                <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse flex-shrink-0"></div>
              )}
              <div className="flex-1">
                <p className="text-xs font-mono">{resolution.description}</p>
              </div>
              <span className="text-[10px] text-text-faint">{resolution.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
