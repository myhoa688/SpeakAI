# SpeakAI — Superpowers Skills

This project uses the [Superpowers](https://github.com/obra/superpowers) agentic skills framework.

## Active Skills

All skills live in `.agent/skills/`. Read and apply them automatically as appropriate:

- `.agent/skills/using-superpowers/SKILL.md` — Core framework: how to use all skills
- `.agent/skills/writing-plans/SKILL.md` — Write specs & implementation plans
- `.agent/skills/subagent-driven-development/SKILL.md` — Dispatch subagents to implement tasks
- `.agent/skills/executing-plans/SKILL.md` — Execute plans step by step
- `.agent/skills/test-driven-development/SKILL.md` — TDD: red/green/refactor
- `.agent/skills/systematic-debugging/SKILL.md` — Debug systematically, find root cause
- `.agent/skills/verification-before-completion/SKILL.md` — Verify before marking done
- `.agent/skills/requesting-code-review/SKILL.md` — Request code review from subagent
- `.agent/skills/finishing-a-development-branch/SKILL.md` — Finish branch cleanly
- `.agent/skills/dispatching-parallel-agents/SKILL.md` — Run agents in parallel
- `.agent/skills/brainstorming/SKILL.md` — Visual brainstorming with diagrams

## Project Structure

```
doancoso/
├── backend/        # Express + MongoDB API (Node.js, TypeScript)
├── frontend/       # React + Vite SPA (TypeScript)
├── .agent/         # Agent skills & configuration (Superpowers)
│   ├── CLAUDE.md   # Contributor guidelines
│   └── skills/     # All SKILL.md files
└── .docs/          # Non-runtime docs (plans, implementation notes)
    └── implementation_plan.md
```

## Key Commands

```bash
npm run dev        # Start both frontend + backend
npm run build      # Build production bundle
npm run seed:admin # Seed admin account
```
