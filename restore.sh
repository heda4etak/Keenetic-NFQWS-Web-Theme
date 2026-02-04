#!/bin/sh
set -e

TARGET=""
BACKUP=""

if [ -d "/opt" ] && [ -w "/opt" ]; then
    TARGET="/opt/share/www/nfqws"
else
    TARGET="/share/www/nfqws"
fi

BACKUP="${TARGET}.bak"

if [ ! -d "$BACKUP" ]; then
    echo "Backup not found: $BACKUP"
    exit 1
fi

PREV=""
if [ -d "$TARGET" ]; then
    PREV="${TARGET}.prev.$(date +%s)"
    mv "$TARGET" "$PREV" || true
fi

mkdir -p "$(dirname "$TARGET")"
cp -a "$BACKUP/." "$TARGET/"

rm -rf "${TARGET}.bak" >/dev/null 2>&1 || true
if [ -n "$PREV" ]; then
    rm -rf "$PREV" >/dev/null 2>&1 || true
fi

echo "OK: restored backup from ${BACKUP} to ${TARGET}"
