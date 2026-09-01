#!/bin/sh
set -e
echo "=== ProjectFlow entrypoint ==="
echo "DATABASE_URL prefix: $(echo $DATABASE_URL | cut -c1-30)..."
echo "PORT=$PORT"
echo "Running migrations..."
python manage.py migrate --noinput || echo "migrate failed exit=$? - continuing"
# Fix for Railway where django_migrations says applied but tables missing (accounts_user)
python manage.py shell -c "from django.db import connection; exit(0 if 'accounts_user' in connection.introspection.table_names() else 1)" || (
  echo "accounts_user missing -> resetting fake migrations..."
  python manage.py migrate accounts zero --fake --noinput || true
  python manage.py migrate workspaces zero --fake --noinput || true
  python manage.py migrate --noinput || echo "second migrate failed"
)
echo "Collecting static..."
python manage.py collectstatic --noinput || true
if [ $# -gt 0 ]; then
  echo "Executing custom command: $@"
  exec "$@"
else
  echo "Starting gunicorn on PORT=${PORT:-8000}"
  exec gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 2 --timeout 60
fi
