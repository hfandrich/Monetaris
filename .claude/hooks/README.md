# Claude Code Hooks

This directory contains hooks for Claude Code to enhance security and workflow.

## Available Hooks

### block-sensitive-files.sh

**Purpose:** Prevents accidental modification of sensitive files containing secrets, credentials, or environment variables.

**Blocked patterns:**
- `.env`, `.env.*`, `*.env`
- Files containing `secrets`, `credentials`, `password` in name
- Private key files: `*.pem`, `*.key`, `*.p12`, `*.pfx`
- `appsettings.Production.json`
- Files in `/secrets/`, `/credentials/`, `/private/` directories

## Configuration

To enable these hooks in Claude Code, add to your `settings.json` or project configuration:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "bash .claude/hooks/block-sensitive-files.sh \"$FILE_PATH\""
      }
    ]
  }
}
```

## Testing

To test the hook manually:

```bash
# Should be blocked
bash .claude/hooks/block-sensitive-files.sh ".env"
bash .claude/hooks/block-sensitive-files.sh "config/secrets.json"
bash .claude/hooks/block-sensitive-files.sh "appsettings.Production.json"

# Should pass
bash .claude/hooks/block-sensitive-files.sh "src/service.ts"
bash .claude/hooks/block-sensitive-files.sh "appsettings.Development.json"
```

## Why This Hook?

AI assistants might accidentally:
1. Log sensitive values while debugging
2. Commit `.env` files with real credentials
3. Modify production config files

This hook adds a safety layer by blocking these operations entirely.
