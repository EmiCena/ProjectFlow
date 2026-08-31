# ProjectFlow — AI-Powered Freelancer & Agency Management Platform

Monorepo `React + Django + PostgreSQL + MongoDB + Gemini`

## Quick start (local)
```bash
cp .env.example .env  # añade GEMINI_API_KEY
docker-compose up --build
# Frontend http://localhost:5173  Backend http://localhost:8000/api  Docs http://localhost:8000/api/docs/
```

Sin Docker:
```bash
# backend
pip install -r backend/requirements.txt
python backend/manage.py migrate
python backend/manage.py runserver

# frontend
npm --prefix frontend install
npm --prefix frontend run dev
```

## Render deploy
1. Conectar repo en render.com → `render.yaml` crea `projectflow-api`, `projectflow-web`, `projectflow-pg`, `projectflow-redis`
2. Crear MongoDB Atlas (free) y pegar URI en `MONGO_URI`
3. Añadir `GEMINI_API_KEY` y `CORS_ALLOWED_ORIGINS` en dashboard
4. Deploy auto en push a main

## Stack confirmado
- Frontend: Vite + TS + Tailwind + TanStack Query + dnd-kit + Recharts + react-i18next (ES/EN)
- Backend: Django 5 + DRF + SimpleJWT + Celery/Redis + Mongo via pymongo + Gemini (google-generativeai)
- DB: PostgreSQL (negocio) + MongoDB (activity/ai/docs/audit)

## Rutas API ver: /api/docs/
