# MONETARIS

> **All instructions have been consolidated into `.claude/CLAUDE.md`**
>
> This file exists only for backwards compatibility.

See [.claude/CLAUDE.md](.claude/CLAUDE.md) for:
- Project Overview & Architecture
- AI Orchestration Workflow
- Subagent Definitions (coder, tester, security, runner, planner, martin-fowler, stuck)
- Vertical Slice Architecture Rules
- Quality Gates & Feedback Loops
- Development Commands

## Quick Reference

```bash
# Frontend (Port 3000)
cd Frontend && npm run dev

# Backend (Port 3002)
cd Backend && dotnet run --project MonetarisApi
```

**Tech Stack:**
- Frontend: React 19 + TypeScript + Vite
- Backend: .NET 9 + EF Core + PostgreSQL
- Architecture: Vertical Slice (AI-optimized)
