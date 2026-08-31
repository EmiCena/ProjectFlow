# Run ProjectFlow sin Docker (SQLite + mock Mongo) — para probar F0 ya
# Uso: powershell -ExecutionPolicy Bypass -File run-local.ps1

Write-Host "=== ProjectFlow local (sin Docker) ===" -ForegroundColor Cyan

# Backend
if (!(Test-Path ".venv")) { python -m venv .venv }
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
if (!(Test-Path ".env")) { Copy-Item .env.example .env; Write-Host "Creado .env desde .env.example — edita GEMINI_API_KEY si tienes" -ForegroundColor Yellow }
# Usa SQLite si no hay DATABASE_URL
$env:DJANGO_DEBUG="True"
$env:DATABASE_URL="sqlite:///db.sqlite3"
python backend\manage.py migrate
Write-Host "Backend listo. Ejecuta en otra terminal: python backend/manage.py runserver 0.0.0.0:8000" -ForegroundColor Green

# Frontend (en otra terminal)
Write-Host "En OTRA terminal corre:" -ForegroundColor Cyan
Write-Host "  npm --prefix frontend install; npm --prefix frontend run dev" -ForegroundColor White
Write-Host "Luego abre http://localhost:5173 y http://localhost:8000/api/health/" -ForegroundColor White
