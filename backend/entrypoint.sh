#!/bin/sh
set -e
echo "=== ProjectFlow entrypoint ==="
echo "DATABASE_URL prefix: $(echo $DATABASE_URL | cut -c1-30)..."
echo "PORT=$PORT"
echo "Running migrations..."
python manage.py migrate --noinput || echo "migrate failed exit=$? - continuing to start gunicorn"
echo "Collecting static..."
python manage.py collectstatic --noinput || true
if [ $# -gt 0 ]; then
  echo "Executing custom command: $@"
  exec "$@"
else
  echo "Starting gunicorn on PORT=${PORT:-8000}"
  exec gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 2 --timeout 60
fi
