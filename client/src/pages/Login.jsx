import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState(undefined);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
  }, []);

  if (session) return <Navigate to="/dashboard" replace />;
  if (session === undefined) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-base">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    }
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-gold/3 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold/10 border border-gold/30 mb-4">
            <span className="font-display font-black text-2xl text-gold">ATC</span>
          </div>
          <h1 className="font-display font-black text-3xl text-text-primary">Command Center</h1>
          <p className="font-mono text-sm text-text-muted mt-2">Anotha Tech Company — Internal Access</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card p-6 border-gold/15 space-y-4">
          <div>
            <label className="label mb-1.5 block">Email</label>
            <input
              type="email"
              className="input"
              placeholder="arthur@anothatechtco.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
            />
          </div>
          <div>
            <label className="label mb-1.5 block">Password</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 mt-2"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Authenticating...</span>
              </>
            ) : (
              'Access Command Center'
            )}
          </button>
        </form>

        <p className="text-center font-mono text-[11px] text-text-faint mt-6">
          Restricted access. Authorized personnel only.
        </p>
      </div>
    </div>
  );
}
