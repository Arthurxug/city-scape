import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import Sidebar from './components/Sidebar';
import LoadingSpinner from './components/LoadingSpinner';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Delegate from './pages/Delegate';
import Agents from './pages/Agents';
import Tasks from './pages/Tasks';
import Assets from './pages/Assets';
import Integrations from './pages/Integrations';
import Settings from './pages/Settings';

function ProtectedLayout() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-base">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg-base">
      <Sidebar session={session} />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1A1A1A',
            color: '#F5F5F5',
            border: '1px solid rgba(200,169,110,0.4)',
            fontFamily: '"DM Mono", monospace',
            fontSize: '13px',
            borderRadius: '6px',
          },
          success: {
            iconTheme: { primary: '#4CAF7D', secondary: '#1A1A1A' },
            duration: 3000,
          },
          error: {
            iconTheme: { primary: '#E05252', secondary: '#1A1A1A' },
            duration: 5000,
          },
          loading: {
            iconTheme: { primary: '#C8A96E', secondary: '#1A1A1A' },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/delegate" element={<Delegate />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
