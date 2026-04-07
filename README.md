# ATC Agent Command Center

The operational hub for **Anotha Tech Company (ATC)** — a private internal tool for delegating tasks to AI agents, monitoring workloads, and integrating with external APIs. Built for a high-performance digital growth agency operating in East Africa.

---

## Overview

- **8 AI Agents** with distinct personalities and system prompts, stored and editable in Supabase
- **Real-time streaming** responses via Anthropic Claude API (SSE)
- **Agent-to-agent collaboration** — chain multiple agents on a single task
- **Company asset library** — upload PDFs/DOCX/images as context for agent tasks
- **14 integrations** — Google Workspace, Meta, Slack, Ahrefs, Canva, and more
- **Full task history** with search, filter, and CSV export
- Dark editorial command center aesthetic with gold accents

---

## Prerequisites

- **Node.js** v18+ (check with `node -v`)
- **npm** v9+
- A **Supabase** account and project ([supabase.com](https://supabase.com))
- An **Anthropic API key** ([console.anthropic.com](https://console.anthropic.com))

---

## Local Setup

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd city-scape
```

### 2. Configure environment variables

Copy `.env` and fill in your keys:

```bash
cp .env .env.local
```

Edit `.env` with your actual values (see [Environment Variables](#environment-variables) below).

### 3. Set up Supabase database

In your Supabase project dashboard, go to **SQL Editor** and run the contents of:

```
server/db/schema.sql
```

This creates the `agents`, `tasks`, `integrations`, `assets`, `collaboration_sessions`, `collaboration_turns`, and `proposals` tables with proper RLS policies.

Also create a **Storage bucket** named `company-assets` in your Supabase project (Storage → New bucket → name: `company-assets`, public: false).

### 4. Seed the database

```bash
cd server
npm install
node db/seed.js
```

This inserts all 8 agents (ATLAS, MAYA, Sales, SEO, Marketing, Social, Performance, Data) and 14 integrations. The script is idempotent — safe to run multiple times.

### 5. Start the backend

```bash
# From /server
npm run dev
# Server starts on http://localhost:3000
```

### 6. Start the frontend

```bash
# From /client (new terminal)
npm install
npm run dev
# Vite starts on http://localhost:5173
```

### 7. Create your user account

Go to your Supabase project → **Authentication → Users → Add user** and create a user with your email and password. This is the single admin account for the command center.

Then visit `http://localhost:5173` and log in.

---

## Environment Variables

| Variable | Description | Where to get it |
|---|---|---|
| `ANTHROPIC_API_KEY` | API key for Claude | [console.anthropic.com](https://console.anthropic.com) → API Keys |
| `SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Public anon key (safe for client) | Supabase Dashboard → Settings → API → anon/public |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server only, bypasses RLS) | Supabase Dashboard → Settings → API → service_role |
| `PORT` | Express server port (default: 3000) | Set to any available port |
| `VITE_SUPABASE_URL` | Same as `SUPABASE_URL` but exposed to Vite client | Same as above |
| `VITE_SUPABASE_ANON_KEY` | Same as `SUPABASE_ANON_KEY` but exposed to Vite client | Same as above |

> **Security note**: Never commit `.env` to version control. `SUPABASE_SERVICE_ROLE_KEY` must stay server-side only and is never sent to the browser.

---

## Seeding Agents

The seed script (`server/db/seed.js`) populates the `agents` and `integrations` tables. To reseed or update:

```bash
cd server
node db/seed.js
```

To modify an agent's system prompt without reseeding, use the `/agents` page in the UI — click "Edit Prompt" on any agent card and save. Changes are written directly to Supabase.

---

## Deployment

### Frontend → Vercel

1. Push your repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → import repo
3. Set **Root Directory** to `client`
4. Add environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
5. Deploy

### Backend → Railway

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select your repo, set **Root Directory** to `server`
3. Add all environment variables from `.env`
4. Railway auto-detects Node.js and runs `npm start`
5. Copy the Railway deployment URL and update Vercel's `VITE_API_BASE_URL` if needed

### CORS

In `server/index.js`, update the `cors` origin to your Vercel frontend URL for production.

---

## Agent Roster

| Agent | Role | Color |
|---|---|---|
| ATLAS | Command Center AI — system health & evolution | Silver |
| MAYA | Strategy & Operations | Gold |
| SALES AGENT | Acquisition & Revenue | Amber |
| SEO & CONTENT | Search & Content Strategy | Blue |
| MARKETING STRATEGIST | Campaign Creative Direction | Purple |
| SOCIAL MEDIA MANAGER | Platform & Community | Teal |
| PERFORMANCE MANAGER | Paid Media Optimization | Red |
| DATA ANALYST | Insights & Reporting | Green |

---

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS v3
- **Backend**: Node.js + Express
- **AI**: Anthropic Claude (`claude-sonnet-4-20250514`) with SSE streaming
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (email/password)
- **Charts**: Recharts
- **File parsing**: pdf-parse, mammoth
