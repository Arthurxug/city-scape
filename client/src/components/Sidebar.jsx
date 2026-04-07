import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Send, Users, ClipboardList,
  FolderOpen, Plug, Settings, LogOut, ChevronRight, Radar,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard',      label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/command-center', label: 'Command Ctr',  icon: Radar },
  { to: '/delegate',       label: 'Delegate',     icon: Send },
  { to: '/agents',         label: 'Agents',       icon: Users },
  { to: '/tasks',          label: 'Task History', icon: ClipboardList },
  { to: '/assets',         label: 'Assets',       icon: FolderOpen },
  { to: '/integrations',   label: 'Integrations', icon: Plug },
  { to: '/settings',       label: 'Settings',     icon: Settings },
];

export default function Sidebar({ session }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success('Signed out');
    navigate('/login');
  }

  const email = session?.user?.email || '';
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <aside
      className={`flex flex-col bg-bg-surface border-r border-white/5 transition-all duration-300 flex-shrink-0 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/5">
        {!collapsed && (
          <div>
            <span className="font-display font-black text-2xl text-gold tracking-tight">ATC</span>
            <p className="text-text-faint font-label text-[10px] uppercase tracking-[0.15em] mt-0.5">Command Center</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-text-muted hover:text-gold transition-colors p-1 rounded hover:bg-white/5 ml-auto"
        >
          <ChevronRight size={14} className={`transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-150 group relative ${
                isActive
                  ? 'bg-gold/10 text-gold border-l-2 border-gold'
                  : 'text-text-muted hover:text-text-primary hover:bg-white/5 border-l-2 border-transparent'
              }`
            }
          >
            <Icon size={16} className="flex-shrink-0" />
            {!collapsed && (
              <span className="font-mono text-sm">{label}</span>
            )}
            {collapsed && (
              <span className="absolute left-full ml-2 px-2 py-1 bg-bg-elevated border border-white/10 rounded text-xs font-mono text-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                {label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Gold divider */}
      <div className="mx-3 h-px bg-gold/10" />

      {/* User section */}
      <div className="px-3 py-4">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center flex-shrink-0">
            <span className="font-display font-bold text-gold text-xs">{initials}</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-mono text-xs text-text-primary truncate">Arthur</p>
              <p className="font-mono text-[10px] text-text-faint truncate">{email}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleSignOut}
          className={`mt-3 flex items-center gap-2 text-text-faint hover:text-danger transition-colors font-mono text-xs py-1.5 px-2 rounded hover:bg-danger/5 w-full ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut size={13} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
