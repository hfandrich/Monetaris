#!/bin/bash
# Block modifications to sensitive files
#
# Claude Code Hook: PreToolUse (for Write/Edit tools)
#
# This hook prevents accidental modification of sensitive files
# containing secrets, credentials, or environment variables.

FILE="$1"

# List of patterns to block
SENSITIVE_PATTERNS=(
    "*.env"
    "*.env.*"
    ".env"
    ".env.*"
    "*secrets*"
    "*credentials*"
    "*password*"
    "*.pem"
    "*.key"
    "*.p12"
    "*.pfx"
    "appsettings.Production.json"
)

# Check if file matches any sensitive pattern
for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    if [[ "$FILE" == $pattern ]]; then
        echo "BLOCKED: Cannot modify sensitive file: $FILE"
        echo "Reason: File matches sensitive pattern: $pattern"
        echo ""
        echo "If you need to modify this file, please do it manually."
        exit 1
    fi
done

# Also check for common sensitive paths
if [[ "$FILE" == *"/.env"* ]] || \
   [[ "$FILE" == *"/secrets/"* ]] || \
   [[ "$FILE" == *"/credentials/"* ]] || \
   [[ "$FILE" == *"/private/"* ]]; then
    echo "BLOCKED: Cannot modify file in sensitive path: $FILE"
    exit 1
fi

# File is safe to modify
exit 0
