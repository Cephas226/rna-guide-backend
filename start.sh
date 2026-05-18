#!/bin/sh
set -e

echo "Checking migration status..."

STATUS=$(npx prisma migrate status 2>&1 || true)
echo "$STATUS"

if echo "$STATUS" | grep -q "Database schema is up to date"; then
  echo "No pending migrations. Skipping migrate deploy."
else
  echo "Pending migrations detected. Running migrate deploy..."
  MAX_RETRIES=5
  RETRY_DELAY=5
  for i in $(seq 1 $MAX_RETRIES); do
    if npx prisma migrate deploy; then
      echo "Migrations completed."
      break
    else
      if [ "$i" -eq "$MAX_RETRIES" ]; then
        echo "Migrations failed after $MAX_RETRIES attempts. Exiting."
        exit 1
      fi
      echo "Attempt $i failed, retrying in ${RETRY_DELAY}s..."
      sleep "$RETRY_DELAY"
      RETRY_DELAY=$((RETRY_DELAY * 2))
    fi
  done
fi

echo "Starting NestJS application..."
exec node dist/main
