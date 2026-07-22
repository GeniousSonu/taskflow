# TaskFlow — Real-Time Collaborative Task Management

A premium, production-ready collaborative task management web application for development teams, mixing features from **Linear + Jira + Notion + Trello**. Features full real-time collaboration, instant task state synchronisation, subtask auto-progress calculation, interactive team workload management, burndown charts, and task due-date calendars.

Built with **Next.js 15 (App Router) + TypeScript + Tailwind CSS + Socket.IO + SQLite/PostgreSQL + Prisma + NextAuth**.

Pre-seeded with the **Blue Lane Cabinetry** WooCommerce storefront redesign project workspace.

---

## 🚀 Getting Started

### 1. Installation

Install all dependencies:

```bash
npm install
```

### 2. Configure Environment

Set up your local configuration by copying `.env.example`:

```bash
cp .env.example .env
```

### 3. Initialize SQLite Database & Seed Data

Generate Prisma client, push models, and preload the **Blue Lane Cabinetry** milestone data:

```bash
npx prisma db push
npx prisma db seed
```

### 4. Run the Dev Server

Starts both the Next.js server compiler and the integrated Socket.IO server at port `3000`:

```bash
npm run dev
```

---

## 👥 Seed Credentials (Demo Login)

The seed script registers the following developers with default password: `password123`.

| Name              | Email               | Role   | Department  | Color              |
| ----------------- | ------------------- | ------ | ----------- | ------------------ |
| **Sahinur islam** | `sahinur@ibarts.in` | Admin  | Development | Indigo (`#6366f1`) |
| **Faisal**        | `sandip@ibarts.in`  | Member | QA          | Amber (`#f59e0b`)  |

---

## 📋 Features Checklist Integration

The **Final Pre-Deployment Checklist** from the Blue Lane Cabinetry handoff document is fully integrated as actionable subtasks under **Milestone 5 — QA, Documentation & Handoff**:

1. **Backup** (Child theme backup, DB exports, functions.php backups)
2. **Code Review & Assets** (style.css cleanups, debug cleanup, assets check)
3. **Elementor** (Regenerate CSS & Data, Clear cache)
4. **Product Pages** (Gallery QA, Sticky Add to Cart, material indicators)
5. **Cart & Checkout** (Purchase validation, PayPal smart buttons responsive checks)
6. **Payment & Responsive QA** (iOS Safari, Android Chrome, iPad test order validation)
7. **Performance & Console** (Incognito validation, CDN cache clears, zero errors)

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Zustand global store, Framer Motion animations.
- **Backend & DB**: Route handlers, Prisma ORM, SQLite (local development), path to Postgres/Supabase ready in `.env.example`.
- **Real-Time Sync**: Integrated `server.ts` combines Node HTTP, Socket.IO, and Next.js instance on port `3000`. Emits:
  - `workspace-presence` (Real-time online status indicators)
  - `user-typing` (Typing indicator alerts on comments)
  - `task-sync` (Instant drag-and-drop state sync across users)
