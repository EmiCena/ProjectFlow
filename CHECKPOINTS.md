# Checkpoints de Test por Fase — ProjectFlow

> No avances de fase hasta pasar TODOS los checks de la fase actual. Marca ✅ cada uno.

## F0 — Setup (AHORA - debes testear esto primero)
- [ ] `docker-compose up --build` levanta 6 servicios sin error (postgres, mongo, redis, backend, frontend, celery)
- [ ] `http://localhost:8000/api/health/` → `{"status":"ok"}`
- [ ] `http://localhost:8000/api/docs/` carga Swagger con todas las rutas
- [ ] `http://localhost:5173` carga login y switch ES/EN funciona
- [ ] `docker-compose exec backend python manage.py migrate` sin errores (si no, revisa DATABASE_URL)
- [ ] Crear `.env` real con `GEMINI_API_KEY` (si no la pones, AI usará mock OK para F0)

**Comando rápido:** `docker-compose logs -f backend` no debe mostrar `connection refused` a postgres/mongo

## F1 — Auth & Workspace (siguiente)
- [ ] `POST /api/auth/register/` crea user + workspace automático (ver en admin o GET /workspaces/)
- [ ] `POST /api/auth/login/` devuelve `access` + `refresh`
- [ ] `GET /api/auth/me/` con token devuelve user + active_workspace
- [ ] `POST /api/workspaces/` crea 2º workspace y asigna owner
- [ ] `POST /api/workspaces/switch/` cambia active_workspace
- [ ] **Aislamiento:** login con user A, intenta `GET /api/clients/` → no ve datos de user B (cross-workspace 200 vacío o 403)
- [ ] `POST /api/auth/refresh/` renueva token sin relogin
- [ ] Frontend: registro → login → dashboard redirige, logout limpia storage

## F2 — Clients & Projects
- [ ] CRUD `POST/GET/PATCH/DELETE /api/clients/` filtra por workspace activo
- [ ] Filtros `?status=lead&search=acme` funcionan
- [ ] `GET /api/clients/:id` muestra `active_projects, total_revenue, outstanding` (si implementado)
- [ ] CRUD `POST /api/projects/` con `client_id`, `GET /api/projects/?client=1`
- [ ] `POST /api/projects/:id/milestones/` crea hito
- [ ] Frontend: páginas `/clients` y `/projects` listan/crean/editar, detalle client muestra stats

## F3 — Kanban Board
- [ ] `POST /api/tasks/` crea task con `project, status, priority, position`
- [ ] `PATCH /api/tasks/:id/move` con `{status:"in_progress", position:0}` mueve columna + reordena
- [ ] Drag&drop con dnd-kit persiste tras refresh (position guardada en PG)
- [ ] `POST /api/tasks/:id/comments/` + thread `parent` funciona
- [ ] Filtro `GET /api/tasks/?project=1&status=todo`
- [ ] **Revisar:** mover task crea `activity_logs` en Mongo (ver `GET /api/activity/`)

## F4 — Invoices & PDF
- [ ] `POST /api/invoices/` con `items[{description,qty,rate,amount}]` calcula `subtotal/total`
- [ ] `GET /api/invoices/` lista, `PATCH` cambia `status` draft→sent→paid
- [ ] `GET /api/invoices/:id/pdf` descarga PDF (no 500)
- [ ] `POST /api/invoices/:id/payments/` registra pago
- [ ] Frontend `/invoices` muestra tabla, detalle con PDF preview/download

## F5 — Dashboard & Analytics
- [ ] `GET /api/analytics/summary/` devuelve `{active_projects, completed, outstanding_total, monthly_revenue[12], status_distribution, task_completion_rate, upcoming_deadlines}`
- [ ] Dashboard cards + Recharts bar/pie renderizan sin error (datos reales, no mock)
- [ ] upcoming_deadlines ordenado por fecha

## F6 — Activity Logs (Mongo)
- [ ] Cada `task_status_changed`, `task_created`, `invoice_paid` inserta doc en `activity_logs` con `workspace_id, user_id, metadata`
- [ ] `GET /api/activity/` filtra por workspace, orden desc, paginado 50
- [ ] Feed en dashboard o página `/activity` muestra eventos en tiempo relativo

## F7 — AI Planner (Gemini)
- [ ] Sin `GEMINI_API_KEY` → `POST /api/ai/plan/` devuelve mock 10 tasks (no 500)
- [ ] Con key válida → brief “We need an ecommerce website with Stripe…” devuelve JSON `{title, milestones, tasks[8-12]}`
- [ ] `POST /api/ai/plan/confirm/` con payload generado crea Project + Tasks + Milestones (transacción)
- [ ] `GET /api/ai/summary/:project_id` devuelve resumen semanal (mock si no key, real si key)
- [ ] Conversación guardada en `ai_conversations` Mongo + visible en logs
- [ ] Manejo error: brief <20 chars → 400, Gemini timeout → fallback legible

## F8 — Polish & Deploy (Render)
- [ ] `render.yaml` deploy verde: `projectflow-api` healthcheck pasa, `projectflow-web` sirve SPA con fallback `index.html`
- [ ] CORS en prod: frontend prod puede llamar API prod
- [ ] Env vars `GEMINI_API_KEY`, `MONGO_URI` Atlas, `DATABASE_URL` Render PG configuradas
- [ ] Seed data: `python manage.py createsuperuser` + datos demo
- [ ] README + CHECKPOINTS actualizados, `gh actions` CI pasa

---

## Cómo testear rápido por fase (snippets)

**F0 curl:**
```bash
curl http://localhost:8000/api/health/
curl -X POST http://localhost:8000/api/auth/register/ -H "Content-Type: application/json" -d '{"username":"test1","email":"test1@test.com","password":"Test12345!"}'
```

**F1 aislamiento:**
```bash
# registra user2, login ambos, compara GET /api/clients/ con token distinto
```

**F7 AI:**
```bash
curl -X POST http://localhost:8000/api/ai/plan/ -H "Authorization: Bearer <access>" -H "Content-Type: application/json" -d '{"brief":"We need an ecommerce website where customers browse products, create accounts, purchase using Stripe, and track orders."}'
```
