#!/bin/sh
set -e

DB_FILE="${DB_PATH:-/db/lms.sqlite}"

if [ ! -f "$DB_FILE" ] || ! sqlite3 "$DB_FILE" "SELECT 1 FROM users LIMIT 1" 2>/dev/null; then
  echo "Database empty or missing, running seeds..."
  node seed/seed-courses.ts
  node seed/seed-users.ts
  echo "Seeds completed!"
fi

echo "Starting application..."
exec "$@"
