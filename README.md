# NextFlow — LLM Workflow Builder

A pixel-perfect, production-grade LLM workflow builder inspired by Krea.ai. Build, connect, and execute visual AI pipelines with Google Gemini, real file uploads via Transloadit, and background task execution via Trigger.dev.

---
## 📺 Demo

[![NextFlow Demo](https://img.shields.io/badge/🎥_Watch-Demo_Video-4da6ff?style=for-the-badge&logo=youtube)](https://drive.google.com/file/d/1rMCtLLECRE26G2rbGpYRHmUWtqJXyVZ5/view?usp=sharing)

## ✨ Features

- **Visual Workflow Canvas** — ReactFlow with dot-grid, pan/zoom, minimap
- **6 Node Types** — Text, Upload Image, Upload Video, Run LLM, Crop Image, Extract Frame
- **Clerk Authentication** — Protected routes, user-scoped data
- **PostgreSQL + Prisma** — Workflows and run history persisted to Neon
- **Trigger.dev Tasks** — All node executions run as real background tasks
- **Google Gemini API** — Vision-capable LLM with multimodal support
- **Transloadit Uploads** — Real image/video upload and processing
- **FFmpeg Processing** — Crop and frame extraction via Trigger.dev + Transloadit
- **Type-Safe Connections** — Prevents invalid cross-type wiring
- **DAG Validation** — Circular connections blocked at the UI level
- **Parallel Execution** — Independent branches run concurrently
- **Undo/Redo** — Full workflow history via Zustand temporal
- **Auto-Save** — Debounced save to PostgreSQL on every change
- **Run History** — Right panel with expandable node-level execution details
- **Export/Import** — Workflows as JSON
- **Responsive** — Collapsible sidebars, full overflow handling

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/Sidd2712/Galaxy-ai.git
cd Galaxy-ai
npm install
```

### 2. Set Up API Keys

```bash
cp .env.local.example .env.local
```

Fill in the following in `.env.local`:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | [clerk.com](https://clerk.com) → Create App |
| `CLERK_SECRET_KEY` | Same Clerk dashboard |
| `DATABASE_URL` | [neon.tech](https://neon.tech) → Create project |
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| `TRIGGER_SECRET_KEY` | [trigger.dev](https://trigger.dev) → Project Settings |
| `NEXT_PUBLIC_TRANSLOADIT_KEY` | [transloadit.com](https://transloadit.com) → Account |
| `TRANSLOADIT_SECRET` | Same Transloadit dashboard |
| `NEXT_PUBLIC_TRANSLOADIT_IMAGE_TEMPLATE_ID` | Create template in Transloadit |
| `NEXT_PUBLIC_TRANSLOADIT_VIDEO_TEMPLATE_ID` | Create template in Transloadit |

### 3. Set Up Database

```bash
npx prisma generate
npx prisma db push
# or for migrations:
npx prisma migrate dev --name init
```

### 4. Run Trigger.dev Worker

In a second terminal:

```bash
npx trigger.dev@latest dev
```

### 5. Start Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to sign in.

---

## 🏗 Project Structure

```
src/
├── app/
│   ├── (auth)/sign-in/         # Clerk sign-in page
│   ├── (auth)/sign-up/         # Clerk sign-up page
│   ├── (app)/workflow/         # Main workflow builder (server component)
│   └── api/
│       ├── workflow/save/      # POST — save to PostgreSQL (Zod validated)
│       ├── workflow/export/    # GET  — export workflow as JSON
│       ├── workflow/import/    # POST — import workflow from JSON
│       ├── run/execute/        # POST — orchestrate Trigger.dev tasks
│       ├── run/history/        # GET  — fetch run history
│       └── upload/params/      # POST — Transloadit HMAC signing
├── trigger/
│   └── tasks.ts                # llmTask, cropImageTask, extractFrameTask
├── components/
│   ├── workflow/
│   │   ├── WorkflowCanvas.tsx  # Main ReactFlow canvas (client)
│   │   ├── WorkflowHeader.tsx  # Top bar with controls
│   │   ├── WorkflowToolbar.tsx # Floating canvas toolbar
│   │   ├── NodeSidebar.tsx     # Left panel — draggable node buttons
│   │   └── HistoryPanel.tsx    # Right panel — run history
│   └── nodes/
│       ├── BaseNode.tsx        # Shared wrapper (glow, status badge, delete)
│       ├── TextNode.tsx
│       ├── ImageNode.tsx       # Transloadit upload
│       ├── VideoNode.tsx       # Transloadit upload
│       ├── LLMNode.tsx         # Gemini, model selector, inline output
│       ├── CropNode.tsx        # FFmpeg via Trigger.dev
│       └── ExtractFrameNode.tsx
├── store/
│   └── workflow-store.ts       # Zustand + temporal (undo/redo)
├── lib/
│   ├── db.ts                   # Prisma singleton
│   ├── validations.ts          # Zod schemas
│   ├── node-definitions.ts     # Node config (handles, colors, icons)
│   ├── sample-workflow.ts      # Pre-built Product Marketing Kit
│   └── utils.ts
└── types/index.ts              # All TypeScript types
```

---

## 🔧 Transloadit Templates

Create two templates in the Transloadit dashboard:

**Image Template:**
```json
{
  "steps": {
    ":original": { "robot": "/upload/handle" },
    "optimised": {
      "use": ":original",
      "robot": "/image/optimize",
      "result": true
    }
  }
}
```

**Video Template:**
```json
{
  "steps": {
    ":original": { "robot": "/upload/handle" },
    "stored": {
      "use": ":original",
      "robot": "/file/store",
      "result": true
    }
  }
}
```

---

## 📦 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Add secrets to Vercel
vercel secret add clerk_publishable_key "pk_live_..."
vercel secret add clerk_secret_key "sk_live_..."
vercel secret add database_url "postgresql://..."
vercel secret add gemini_api_key "AIza..."
vercel secret add trigger_secret_key "tr_prod_..."
vercel secret add transloadit_key "..."
vercel secret add transloadit_secret "..."
vercel secret add transloadit_image_template_id "..."
vercel secret add transloadit_video_template_id "..."

# Deploy
vercel --prod
```

---

## 🗺 Node Reference

| Node | Inputs | Output | Execution |
|---|---|---|---|
| Text | — | text | Instant (client) |
| Upload Image | — | image_url | Transloadit |
| Upload Video | — | video_url | Transloadit |
| Run LLM | system_prompt, user_message, images | text | Trigger.dev → Gemini API |
| Crop Image | image_url, x%, y%, w%, h% | image_url | Trigger.dev → FFmpeg |
| Extract Frame | video_url, timestamp | image_url | Trigger.dev → FFmpeg |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `⌘Z` | Undo |
| `⌘⇧Z` / `⌘Y` | Redo |
| `⌘S` | Save |
| `⌘A` | Select All |
| `Delete` / `Backspace` | Delete selected nodes |
| `Shift+Click` | Multi-select nodes |

---

## 🧪 Sample Workflow

Click **"✦ Sample Workflow"** in the canvas toolbar to load the pre-built **Product Marketing Kit Generator**:

- **Branch A**: Upload Image → Crop → LLM (product description)
- **Branch B**: Upload Video → Extract Frame
- **Convergence**: LLM #2 merges both branches into a marketing tweet

Both branches run **in parallel** (Phases 1–3), then the convergence node waits for both before firing.

---
..

