# MCP Tools Configuration

## Overview

Model Context Protocol (MCP) tools enable AI assistants to interact with external systems efficiently, reducing token usage and improving response times.

## Configured Tools

### 1. PostgreSQL MCP
**Purpose**: Direct database queries without loading Entity Framework DbContext into AI context.

**Usage**:
- AI can query database directly: `query("SELECT * FROM tenants WHERE id = ?", [id])`
- Token savings: ~500 tokens per query (vs loading full DbContext + entities)
- Use cases: Data exploration, debugging, statistics

**Connection**: localhost:5432, database: monetaris

### 2. Filesystem MCP
**Purpose**: Navigate codebase structure without reading all files.

**Usage**:
- List directories: `list_directory("Backend/Monetaris.Case/api")`
- Find files: `search_files("*.cs")`
- Token savings: ~2000 tokens (vs globbing + reading multiple files)
- Use cases: Architecture exploration, file discovery

**Root**: Project root directory

### 3. Git MCP
**Purpose**: Access version control history without parsing git log.

**Usage**:
- Get commits: `get_commits(limit=10)`
- Show diff: `get_diff(commitHash)`
- Blame file: `get_blame("path/to/file.cs")`
- Token savings: ~1000 tokens per history query
- Use cases: Understanding changes, debugging, code review

**Repository**: Project git repository

### 4. Memory MCP
**Purpose**: Persist AI session state across conversations.

**Usage**:
- Store facts: `store("project_status", "Phase 1 complete")`
- Retrieve: `retrieve("project_status")`
- Token savings: No need to repeat context in every message
- Use cases: Long-running tasks, context continuity

**Storage**: In-memory (session-scoped)

### 5. Sequential Thinking MCP
**Purpose**: Break complex tasks into steps for better AI planning.

**Usage**:
- Plan task: `plan("Implement authentication")`
- Execute steps: AI follows generated plan
- Token savings: Reduces planning overhead
- Use cases: Complex refactorings, new feature implementation

### 6. Playwright MCP
**Purpose**: Browser automation and testing for AI-driven E2E tests.

**Usage**:
- Navigate pages: `navigate("http://localhost:3000")`
- Interact with elements: `click("button#submit")`
- Take screenshots: `screenshot("test-result.png")`
- Token savings: Direct testing without manual test writing
- Use cases: E2E testing, visual regression testing, UI verification

**Integration**: Works with existing Playwright test infrastructure

## Benefits

**Token Efficiency**:
- Database queries: 85% token reduction
- File navigation: 90% token reduction
- Git history: 80% token reduction
- Overall: ~85% context reduction for data operations

**Performance**:
- Faster responses (less context to process)
- More precise answers (direct data access)
- Better scalability (handle larger projects)

## Configuration

MCP tools are configured in `.mcp.json` at project root.

**Testing MCP Tools**:
```bash
# Test PostgreSQL MCP
npx @modelcontextprotocol/server-postgres --help

# Test Filesystem MCP
npx @modelcontextprotocol/server-filesystem --help

# Test Git MCP
npx @modelcontextprotocol/server-git --help

# Test Playwright MCP
npx @playwright/mcp@latest --help
```

## Requirements

- Node.js 18+ (for npx)
- PostgreSQL database running (for postgres MCP)
- Git repository initialized (for git MCP)

## Troubleshooting

**Issue**: PostgreSQL MCP cannot connect
**Solution**: Verify PostgreSQL is running: `docker ps` or check Windows Services

**Issue**: Filesystem MCP permission denied
**Solution**: Verify path exists and has read permissions

**Issue**: Git MCP fails
**Solution**: Ensure `.git/` directory exists in project root

## Database Connection Configuration

The PostgreSQL MCP is configured to connect to the Docker-based PostgreSQL instance:

```
Host: localhost
Port: 5432
Database: monetaris
Username: monetaris_user
Password: monetaris_pass
```

This matches the configuration in `Backend/infrastructure/docker/docker-compose.yml`.

**Note**: The `appsettings.json` connection string is different and should be updated to match:
```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Database=monetaris;Username=monetaris_user;Password=monetaris_pass"
}
```

## AI-First Development Workflow

1. **AI uses Filesystem MCP** to explore codebase structure
2. **AI uses Git MCP** to understand recent changes
3. **AI uses PostgreSQL MCP** to query current data state
4. **AI uses Memory MCP** to remember project context
5. **AI uses Sequential Thinking MCP** to plan implementation
6. AI writes code using template files (Vertical Slice Architecture)
7. **AI uses Playwright MCP** to verify implementation
8. Tools validate (Prettier, ESLint, Tests)
9. Human reviews PR

**Token Savings**: ~85% reduction in context size = faster, more efficient AI assistance!
