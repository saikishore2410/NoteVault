# 📝 NoteVault

NoteVault is a full-stack study workspace for handwritten STEM notes, AI-powered digitization, research grounding, and focused study workflows.

## What it includes

- 🔍 Search and filter notes by subject, topic, tags, authors, and OCR content.
- 📖 Multi-page note viewer with zoom, thumbnails, bookmarks, upvotes, and study-history resume.
- 🤖 Handwritten-note OCR powered by Gemini.
- 💬 Multi-turn STEM tutor with optional Google Search grounding.
- 🎙️ Audio transcription and a live voice study tutor.
- 🎬 STEM concept video generation and 🎵 focus-music generation.
- 🧩 Diagram generation/editing and campus study-spot discovery.
- 🔐 Google authentication and Firestore-backed user study data.
- 🌗 Responsive dark/light UI.

## Tech stack

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Motion

**Backend:** Node.js, Express, Vercel serverless handlers, WebSocket

**AI:** Google Gemini via `@google/genai`

**Data/Auth:** Firebase Authentication and Cloud Firestore

## Local development

### Requirements

- Node.js 20+
- A Gemini API key for AI features
- Firebase project configuration for authentication and Firestore

### Setup

```bash
git clone https://github.com/saikishore2410/NoteVault.git
cd NoteVault
npm install
```

Create a local `.env` from `.env.example` and configure:

- `GEMINI_API_KEY`
- `APP_URL`

Then start the development server:

```bash
npm run dev
```

The app runs on `http://localhost:3000` by default.

## Quality checks

Run the same checks used by CI:

```bash
npm run lint
npm test
npm run build
```

## Deployment

### Vercel

The `api/` directory contains Vercel-compatible serverless handlers. Configure `GEMINI_API_KEY` in the Vercel project environment variables before deploying.

### Custom Node server

The root `server.ts` provides the full Express + WebSocket development/server runtime.

## Security notes

- Never commit a real `GEMINI_API_KEY` or other secrets.
- Firestore authorization is enforced in `firestore.rules`.
- Keep production API keys in the hosting provider's secret/environment-variable store.
