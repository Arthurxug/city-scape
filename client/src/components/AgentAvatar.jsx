import React from 'react';

// Abstract geometric SVG avatars — one per agent
const avatars = {
  ATLAS: ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="38" stroke={color} strokeWidth="1.5" strokeDasharray="4 2" opacity="0.4"/>
      <circle cx="40" cy="40" r="28" stroke={color} strokeWidth="1" opacity="0.3"/>
      <circle cx="40" cy="40" r="8" fill={color} opacity="0.9"/>
      {[0,60,120,180,240,300].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 40 + 12 * Math.cos(rad);
        const y1 = 40 + 12 * Math.sin(rad);
        const x2 = 40 + 26 * Math.cos(rad);
        const y2 = 40 + 26 * Math.sin(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1.5" opacity="0.7"/>;
      })}
      {[0,60,120,180,240,300].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const cx = 40 + 28 * Math.cos(rad);
        const cy = 40 + 28 * Math.sin(rad);
        return <circle key={i} cx={cx} cy={cy} r="2.5" fill={color} opacity="0.8"/>;
      })}
    </svg>
  ),

  MAYA: ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <polygon points="40,6 74,62 6,62" stroke={color} strokeWidth="1.5" fill="none" opacity="0.5"/>
      <polygon points="40,18 64,56 16,56" stroke={color} strokeWidth="1" fill={color} fillOpacity="0.08" opacity="0.8"/>
      <polygon points="40,28 54,50 26,50" fill={color} opacity="0.7"/>
      <line x1="40" y1="6" x2="40" y2="62" stroke={color} strokeWidth="0.75" opacity="0.3"/>
      <line x1="6" y1="62" x2="74" y2="62" stroke={color} strokeWidth="0.75" opacity="0.3"/>
      <circle cx="40" cy="36" r="3" fill="#0A0A0A"/>
      <circle cx="40" cy="36" r="1.5" fill={color}/>
    </svg>
  ),

  'SALES AGENT': ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="32" stroke={color} strokeWidth="1" opacity="0.3"/>
      <circle cx="40" cy="40" r="22" stroke={color} strokeWidth="1.5" opacity="0.5"/>
      <circle cx="40" cy="40" r="12" stroke={color} strokeWidth="2" opacity="0.8"/>
      <circle cx="40" cy="40" r="4" fill={color}/>
      {[0,45,90,135,180,225,270,315].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const cx = 40 + 32 * Math.cos(rad);
        const cy = 40 + 32 * Math.sin(rad);
        return <circle key={i} cx={cx} cy={cy} r="1.5" fill={color} opacity="0.6"/>;
      })}
    </svg>
  ),

  'SEO & CONTENT': ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      {[12,22,32,42].map((r, i) => (
        <path key={i}
          d={`M 10 ${40 + r * 0.3} Q 25 ${40 - r * 0.6} 40 ${40} Q 55 ${40 + r * 0.6} 70 ${40 - r * 0.3}`}
          stroke={color} strokeWidth="1.5" fill="none"
          opacity={0.3 + i * 0.15}
        />
      ))}
      <circle cx="40" cy="40" r="6" fill={color} opacity="0.9"/>
      <line x1="44" y1="44" x2="56" y2="56" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.8"/>
    </svg>
  ),

  'MARKETING STRATEGIST': ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <polygon points="40,8 72,70 8,70" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.06"/>
      <polygon points="40,20 62,62 18,62" stroke={color} strokeWidth="1" fill={color} fillOpacity="0.1"/>
      <line x1="40" y1="8" x2="40" y2="70" stroke={color} strokeWidth="1" opacity="0.4"/>
      <line x1="8" y1="70" x2="72" y2="70" stroke={color} strokeWidth="1" opacity="0.4"/>
      <line x1="40" y1="8" x2="8" y2="70" stroke={color} strokeWidth="0.75" opacity="0.3"/>
      <line x1="40" y1="8" x2="72" y2="70" stroke={color} strokeWidth="0.75" opacity="0.3"/>
      <polygon points="40,28 50,48 30,48" fill={color} opacity="0.9"/>
    </svg>
  ),

  'SOCIAL MEDIA MANAGER': ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      {[
        [40, 40], [20, 25], [60, 25], [15, 55], [65, 55], [40, 12], [40, 68],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={i === 0 ? 5 : 4} fill={color} opacity={i === 0 ? 1 : 0.7}/>
      ))}
      {[
        [40,40,20,25],[40,40,60,25],[40,40,15,55],[40,40,65,55],[40,40,40,12],[40,40,40,68],
        [20,25,60,25],[15,55,65,55],[20,25,40,12],[60,25,40,12],[15,55,40,68],[65,55,40,68],
      ].map(([x1,y1,x2,y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="0.75" opacity="0.35"/>
      ))}
    </svg>
  ),

  'PERFORMANCE MANAGER': ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <rect x="10" y="52" width="8" height="18" fill={color} opacity="0.4" rx="1"/>
      <rect x="22" y="40" width="8" height="30" fill={color} opacity="0.55" rx="1"/>
      <rect x="34" y="28" width="8" height="42" fill={color} opacity="0.7" rx="1"/>
      <rect x="46" y="18" width="8" height="52" fill={color} opacity="0.85" rx="1"/>
      <rect x="58" y="10" width="8" height="60" fill={color} opacity="1" rx="1"/>
      <polyline points="14,52 26,40 38,28 50,18 62,10" stroke="#0A0A0A" strokeWidth="2" strokeLinejoin="round"/>
      <polygon points="68,6 64,18 56,14" fill={color}/>
    </svg>
  ),

  'DATA ANALYST': ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      {/* Hexagonal grid */}
      {[
        [40, 20], [22, 30], [22, 50], [40, 60], [58, 50], [58, 30],
        [40, 40],
      ].map(([cx, cy], i) => (
        <polygon key={i}
          points={`${cx},${cy-9} ${cx+8},${cy-4.5} ${cx+8},${cy+4.5} ${cx},${cy+9} ${cx-8},${cy+4.5} ${cx-8},${cy-4.5}`}
          stroke={color} strokeWidth="1"
          fill={i === 6 ? color : 'none'}
          fillOpacity={i === 6 ? 0.2 : 0}
          opacity={i === 6 ? 0.9 : 0.4 + i * 0.08}
        />
      ))}
      <circle cx="40" cy="40" r="3" fill={color}/>
    </svg>
  ),
};

export default function AgentAvatar({ agentName, size = 48, className = '' }) {
  const AvatarSVG = avatars[agentName];
  // Find the agent color based on name for the fallback
  const colorMap = {
    ATLAS: '#E8E8E8',
    MAYA: '#C8A96E',
    'SALES AGENT': '#D4843E',
    'SEO & CONTENT': '#5B8DEF',
    'MARKETING STRATEGIST': '#9B6DFF',
    'SOCIAL MEDIA MANAGER': '#3ECFCF',
    'PERFORMANCE MANAGER': '#E05252',
    'DATA ANALYST': '#4CAF7D',
  };
  const color = colorMap[agentName] || '#C8A96E';

  if (!AvatarSVG) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-bg-elevated ${className}`}
        style={{ width: size, height: size, border: `1px solid ${color}40` }}
      >
        <span style={{ color, fontSize: size * 0.4 }} className="font-display font-bold">
          {agentName?.[0] || '?'}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      <AvatarSVG size={size} color={color} />
    </div>
  );
}
