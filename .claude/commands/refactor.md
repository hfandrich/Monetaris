---
description: "Delegiere Code-Refactoring an martin-fowler Agent"
argument-hint: "datei[:zeilen] refactoring-pattern"
---

# Refactoring Command

Refactoring-Aufgabe:
- **Datei/Zeilen**: $1
- **Pattern**: $2

## Verfügbare Refactoring Patterns

| Pattern | Wann verwenden |
|---------|----------------|
| `ExtractMethod` | Lange Methode (>20-30 Zeilen), wiederholter Code-Block |
| `ExtractVariable` | Komplexer Ausdruck, mehrfach verwendet |
| `InlineMethod` | Methode ist so klar wie ihr Name |
| `IntroduceParameterObject` | >3-4 Parameter die zusammengehören |
| `ReplaceConditionalWithPolymorphism` | Switch/If auf Type-Code |
| `DecomposeConditional` | Komplizierte Conditional-Logik |
| `ReplaceTempWithQuery` | Temporäre Variable hält Ausdruck |
| `ReplaceLoopWithPipeline` | Schleife könnte LINQ/Pipeline sein |

## Workflow

### 1. Pre-Check: Tests vorhanden?

```bash
# Finde zugehörige Test-Datei
find . -name "*Tests.cs" | grep -i [filename]

# Führe Tests aus
dotnet test [test-project] --filter "[test-name]"
```

**STOP wenn keine Tests oder Tests failing!**
→ Zuerst Tests schreiben/fixen, dann refactoren.

### 2. Delegiere an martin-fowler Agent

Invoke Task mit subagent_type=martin-fowler:

```
Refactoring Task:
- File: $1
- Pattern: $2
- Scope: [Spezifische Zeilen wenn angegeben]

Instructions:
1. Read the file and understand current structure
2. Apply ONE refactoring step
3. Run tests immediately after change
4. If tests fail: REVERT and report
5. If tests pass: Commit with descriptive message
6. Report results with before/after metrics
```

### 3. Validation

Nach Refactoring:
- [ ] Tests immer noch grün
- [ ] Keine neuen Warnings
- [ ] Coverage nicht gesunken
- [ ] Code-Metriken verbessert (Complexity, Lines)

## Code Smell Detection

Wenn kein Pattern angegeben, analysiere auf Smells:

### Method-Level
- **Long Method**: >30 Zeilen → ExtractMethod
- **Long Parameter List**: >4 params → IntroduceParameterObject
- **Dead Code**: Unused vars → Remove

### Class-Level
- **Large Class**: >200 Zeilen, >15 Methods → Extract Class
- **Data Clumps**: Gleiche 2-3 Felder immer zusammen → Extract Class
- **Feature Envy**: Method nutzt andere Klasse mehr als eigene → Move Method

### Conditional-Level
- **Switch Statements**: Type-Code Switch → Replace with Polymorphism
- **Nested Conditionals**: Tiefe >3 → Decompose Conditional

## Output Format

```
REFACTORING REPORT
==================

Pattern Applied: [Pattern Name]
File: [File Path]
Lines: [Before/After line numbers]

Code Smell Addressed:
[Description of the smell]

Changes Made:
- [Change 1]
- [Change 2]

Metrics:
- Lines: [Before] → [After] ([Delta])
- Complexity: [Before] → [After] ([Delta])
- Methods: [Before] → [After] ([Delta])

Test Results:
✅ All tests passing (X/X)

Commit:
[Commit hash and message]

Recommendations:
[Next logical refactoring, if any]
```

## Constraints

- ❌ NEVER add new features during refactoring
- ❌ NEVER change external behavior/API
- ❌ NEVER proceed with failing tests
- ❌ NEVER skip test validation
- ✅ ONE refactoring at a time
- ✅ Test after EVERY change
- ✅ Commit after each successful refactoring
