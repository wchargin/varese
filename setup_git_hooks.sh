#!/bin/bash
# Idempotent script to set up '.git/hooks' files.

set -o errexit

cd "$(dirname "$(readlink -f "$0")")"

HOOKS_DIR="./.git/hooks"
mkdir -p "$HOOKS_DIR"

PRE_COMMIT_FILE="$HOOKS_DIR/pre-commit"
PRE_COMMIT_TEXT='npm run lint'
if ! grep -x "$PRE_COMMIT_TEXT" "$PRE_COMMIT_FILE" 1>/dev/null 2>&1; then
    echo "$PRE_COMMIT_TEXT" >> "$PRE_COMMIT_FILE" 
    echo 'Installed pre-commit hook.'
else
    echo 'Pre-commit hook already installed.'
fi
if [[ ! -x "$PRE_COMMIT_FILE" ]]; then
    chmod +x "$PRE_COMMIT_FILE"
fi

echo 'Done.'
