import { getAuthToken } from './supabase';

async function authHeaders() {
  const token = await getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(path, options = {}) {
  const headers = await authHeaders();
  const res = await fetch(path, { ...options, headers: { ...headers, ...options.headers } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ── Agents ──────────────────────────────────────────────────────────────────
export const getAgents = () => request('/api/agents');
export const getAgent = (id) => request(`/api/agents/${id}`);
export const updateAgent = (id, body) =>
  request(`/api/agents/${id}`, { method: 'PATCH', body: JSON.stringify(body) });

// ── Tasks ────────────────────────────────────────────────────────────────────
export const getTasks = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
  ).toString();
  return request(`/api/tasks${qs ? `?${qs}` : ''}`);
};
export const getTask = (id) => request(`/api/tasks/${id}`);
export const getTaskStats = () => request('/api/tasks/stats');

export async function exportTasksCSV() {
  const token = await getAuthToken();
  const res = await fetch('/api/tasks/export', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `atc-tasks-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Delegate (single agent, returns raw Response for streaming) ──────────────
export async function delegateTask(agentId, taskInput, priority, attachedAssets = []) {
  const token = await getAuthToken();
  return fetch('/api/delegate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ agentId, taskInput, priority, attachedAssets }),
  });
}

// ── Collaborate (multi-agent, returns raw Response for streaming) ─────────────
export async function collaborateTask(agentIds, taskInput, priority, attachedAssets = []) {
  const token = await getAuthToken();
  return fetch('/api/collaborate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ agentIds, taskInput, priority, attachedAssets }),
  });
}

// ── Integrations ─────────────────────────────────────────────────────────────
export const getIntegrations = () => request('/api/integrations');
export const updateIntegration = (id, body) =>
  request(`/api/integrations/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
export const testIntegration = (id) =>
  request(`/api/integrations/${id}/test`, { method: 'POST' });

// ── Assets ────────────────────────────────────────────────────────────────────
export const getAssets = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
  ).toString();
  return request(`/api/assets${qs ? `?${qs}` : ''}`);
};
export const getAsset = (id) => request(`/api/assets/${id}`);
export const deleteAsset = (id) => request(`/api/assets/${id}`, { method: 'DELETE' });

export async function uploadAsset(file, tags = []) {
  const token = await getAuthToken();
  const formData = new FormData();
  formData.append('file', file);
  if (tags.length) formData.append('tags', tags.join(','));

  const res = await fetch('/api/assets/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Upload failed');
  }
  return res.json();
}

// ── SSE stream reader helper ──────────────────────────────────────────────────
export async function* readSSEStream(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const parts = buffer.split('\n\n');
    buffer = parts.pop(); // keep incomplete chunk

    for (const part of parts) {
      const line = part.trim();
      if (line.startsWith('data: ')) {
        try {
          yield JSON.parse(line.slice(6));
        } catch {
          // skip malformed
        }
      }
    }
  }
}
