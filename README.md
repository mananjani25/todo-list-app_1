# TaskFlow — AI-Powered Task Management

A production-grade Todo application built with React 18, TypeScript, Supabase, and Groq AI. Features a Jira-style Kanban board, AI-powered multi-task generation, natural language task creation, and a premium shadcn/ui + dark-mode interface.

---

## ✨ Features

### Core
- **Jira-style Kanban Board** — Drag and drop tasks between **To Do**, **In Progress**, and **Completed** columns.
- **Full CRUD** — Create, read, update, delete tasks with optimistic UI updates.
- **Authentication** — Supabase Auth (email + password) with protected routes.
- **Row Level Security (RLS)** — Secure backend ensuring users only access their own data.
- **Real-time Synchronization** — Live updates across tabs/devices via Supabase Realtime.
- **List & Board Views** — Toggle between a traditional list and a modern Kanban board.

### AI Features (Powered by Groq Llama 3)
- **🤖 Smart Multi-Task Add** — Type a complex plan like "Draft report for Monday, email Sarah on Tuesday, and call John on Friday". The AI instantly creates **3 separate tasks** with correct due dates and implied priorities.
- **✨ AI Enhance** — One-click improvement: auto-generates detailed descriptions, suggests priority, and determines due dates.
- **📊 AI Suggestions** — Context-aware productivity panel analyzing your tasks to provide actionable advice.
- **🛡️ Secure AI Proxy** — AI calls are proxied through a **Supabase Edge Function** to keep API keys server-side.

### Design
- **shadcn/ui** — Built with accessible Radix UI primitives.
- **Premium Aesthetics** — Glassmorphism, custom gradients, and smooth Framer Motion animations.
- **Responsive** — Seamless experience across mobile, tablet, and desktop.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **Components** | Radix UI Primitives |
| **Backend** | Supabase (PostgreSQL + Auth + Realtime) |
| **Server Logic** | Supabase Edge Functions (Deno + TS) |
| **AI Provider** | **Groq** (Llama 3.3 70B Versatile) |
| **State** | TanStack React Query v5 |
| **Forms** | React Hook Form + Zod |
| **Animations** | Framer Motion |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in your Supabase & Groq credentials:
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GROQ_API_KEY=gsk_your_groq_api_key (for local fallback)
```

### 3. Database Setup (Supabase SQL Editor)
Run these migrations in order:

**Migration 1: Tables**
```sql
CREATE TABLE public.todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Migration 2: Security (RLS)**
```sql
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own todos" ON public.todos
  FOR ALL USING (auth.uid() = user_id);
```

**Migration 3: Realtime**
Enable Realtime for the `todos` table in the Supabase Dashboard (Database -> Replication).

### 4. Deploy AI Edge Function (Recommended)
This secures your API key and enables the backend proxy.

```bash
# Set your Groq API Key on Supabase
npx supabase secrets set GROQ_API_KEY=gsk_...

# Deploy the function
npx supabase functions deploy ai-proxy --no-verify-jwt
```

### 5. Run App
```bash
npm run dev
```

---

## 🔌 Backend API & OpenAPI Documentation

### Supabase REST API
This project utilizes Supabase's auto-generated REST API which follows the OpenAPI (Swagger) specification.

**Access Points:**
- **OpenAPI/Swagger Docs**: `https://[YOUR_PROJECT_REF].supabase.co/rest/v1/`
- **Interactive Playground**: Supabase Dashboard → **API Docs** section
- **Authentication**: Use `apikey=[ANON_KEY]` header or `?apikey=` query param

### Core Endpoints

#### Todos Table
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/rest/v1/todos` | Fetch all user's todos |
| `POST` | `/rest/v1/todos` | Create new todo |
| `PATCH` | `/rest/v1/todos?id=eq.{id}` | Update todo |
| `DELETE` | `/rest/v1/todos?id=eq.{id}` | Delete todo |

**Example Request:**
```bash
curl -X GET "https://[PROJECT_REF].supabase.co/rest/v1/todos" \
  -H "Authorization: Bearer [SESSION_TOKEN]" \
  -H "apikey: [ANON_KEY]"
```

### Edge Functions (Custom API)
- **AI Proxy**: `POST /functions/v1/ai-proxy` — Enhanced task generation via Groq Llama 3
  - Requires: `Authorization: Bearer [SESSION_TOKEN]`
  - Body: `{ "prompt": "string", "action": "create_tasks" | "enhance_task" }`

---

## 📁 Source Code Structure

- `src/features/todos`: Kanban board, list view, and task logic.
- `src/features/ai`: Groq integration service and Edge Function proxy client.
- `src/components/ui`: Custom-styled shadcn/ui components.
- `supabase/functions/ai-proxy`: Deno-based secure AI proxy (Llama 3).

---

## 📄 License
MIT
