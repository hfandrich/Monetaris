---
description: "Starte den vollständigen AI-Orchestrator-Workflow für eine Aufgabe"
argument-hint: "Aufgabenbeschreibung"
---

# Implement Command

Du hast eine neue Aufgabe erhalten:

**$ARGUMENTS**

## MANDATORY WORKFLOW

Führe den vollständigen Orchestrator-Workflow aus `.claude/CLAUDE.md` aus:

### Step 1: ANALYZE & PLAN
1. Analysiere die Aufgabe vollständig
2. Identifiziere betroffene Domains/Dateien
3. **Erstelle TodoWrite** mit allen notwendigen Schritten
4. Jeder Todo sollte spezifisch genug sein um an einen Subagent zu delegieren

### Step 2: DELEGATE TO SUBAGENTS
Für jeden Todo-Eintrag:
1. Delegiere an **coder** Subagent mit spezifischer Aufgabe
2. Coder arbeitet in eigenem Context Window
3. Warte auf Completion Report

### Step 3: PARALLEL VALIDATION
Nach JEDEM coder-Completion, starte PARALLEL:
- **security** Agent (OWASP Audit)
- **tester** Agent (Playwright Visual Testing)
- **runner** Agent (Build + Tests + Coverage)

### Step 4: HANDLE RESULTS
- **Alle PASS**: Markiere Todo als complete, nächster Todo
- **MEDIUM Security**: Coder erneut aufrufen zum Fixen (max 3 Iterationen)
- **CRITICAL/HIGH Security oder Test Failures**: **stuck** Agent für Human Input

### Step 5: ITERATE
1. Update TodoWrite (markiere completed items)
2. Nächster Todo-Eintrag
3. Wiederhole Steps 2-4 bis ALLE Todos erledigt

## Regeln

- Du implementierst NICHT selbst - delegiere an coder
- NIEMALS Validation überspringen (immer Security + Tester + Runner)
- Bei Unsicherheit: stuck Agent für Human Decision
- Coverage Gates: Backend ≥90%, Frontend ≥80%

## Start

Beginne jetzt mit Step 1 - Analysiere die Aufgabe und erstelle die Todo-Liste.
