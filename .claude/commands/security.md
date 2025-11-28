---
description: "OWASP Security-Audit auf geänderte oder spezifizierte Dateien"
argument-hint: "[datei-pattern] (default: geänderte Dateien)"
---

# Security Audit

Führe ein umfassendes Security-Audit durch.

## Scope

Wenn Argument gegeben: Prüfe Dateien matching `$ARGUMENTS`
Sonst: Prüfe geänderte Dateien seit letztem Commit

```bash
# Geänderte Dateien finden
git diff --name-only HEAD~1
git diff --name-only --staged
```

## OWASP Top 10 Checks

### A01: Broken Access Control
- [ ] Alle Endpoints haben `[Authorize]` Attribute
- [ ] Rollen-Prüfung (ADMIN, AGENT, CLIENT, DEBTOR)
- [ ] TenantId-Filter in ALLEN Datenbankabfragen
- [ ] Keine direkten Object References ohne Autorisierung

### A02: Cryptographic Failures
- [ ] Keine hardcoded Secrets, API Keys, Passwörter
- [ ] Keine Secrets in Logs
- [ ] Sensitive Daten nicht in URLs
- [ ] Passwörter mit sicherem Hashing (BCrypt/Argon2)

### A03: Injection
- [ ] Parameterisierte SQL Queries (EF Core)
- [ ] Keine String-Concatenation für SQL
- [ ] Input Validation mit FluentValidation
- [ ] Output Encoding für HTML/JS

### A04: Insecure Design
- [ ] Business Logic Validation
- [ ] Rate Limiting auf sensitive Endpoints
- [ ] Workflow-Validierung (CaseStatus Transitions)

### A05: Security Misconfiguration
- [ ] Keine Debug-Informationen in Production
- [ ] CORS korrekt konfiguriert
- [ ] Security Headers gesetzt

### A06: Vulnerable Components
- [ ] NuGet Packages aktuell
- [ ] npm audit clean

### A07: Authentication Failures
- [ ] JWT Token Validation
- [ ] Token Expiration
- [ ] Sichere Token Storage

### A08: Software and Data Integrity
- [ ] Keine unsichere Deserialisierung
- [ ] File Upload Validation (Typ, Größe, Content)

### A09: Security Logging
- [ ] Security Events werden geloggt
- [ ] Keine sensitive Daten in Logs

### A10: Server-Side Request Forgery
- [ ] URL Validation bei externen Requests

## Monetaris-Spezifisch

### Multi-Tenancy
- [ ] TenantId in WHERE-Klauseln
- [ ] Keine Cross-Tenant Data Leaks
- [ ] Tenant-Isolation in File Storage

### Workflow Security
- [ ] CaseStatus-Übergänge validiert
- [ ] Nur erlaubte Transitions möglich
- [ ] Audit Log für alle Änderungen

### File Upload
- [ ] Erlaubte MIME-Types geprüft
- [ ] Dateigröße limitiert
- [ ] Virus-Scan (wenn konfiguriert)
- [ ] Sichere Speicherung außerhalb Webroot

## Ausgabe

```
SECURITY AUDIT REPORT
=====================

Geprüfte Dateien: X
Gefundene Issues: Y

CRITICAL (Immediate Fix Required):
- [FILE:LINE] Description

HIGH (Fix Before Merge):
- [FILE:LINE] Description

MEDIUM (Fix Soon):
- [FILE:LINE] Description

LOW (Consider Fixing):
- [FILE:LINE] Description

Overall Status: PASS / WARN / FAIL
```

## Decision Logic

- **CRITICAL/HIGH gefunden** → FAIL → Invoke stuck Agent für Human Decision
- **MEDIUM gefunden** → WARN → Coder erneut aufrufen zum Auto-Fix
- **LOW/NONE** → PASS → Continue
