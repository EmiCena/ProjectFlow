import json
from django.conf import settings

SYSTEM_PROMPT = """You are a senior project planner for freelancers/agencies.
Given a client brief, return ONLY valid JSON with this schema:
{
  "title": "string - concise project title",
  "estimated_duration_days": 30,
  "milestones": [{"title": "string", "due_offset_days": 7}],
  "tasks": [{"title":"string","description":"short","priority":"low|medium|high|urgent","estimated_hours":8,"status":"todo"}]
}
Generate 8-12 tasks. Keep JSON valid, no markdown.
"""

MOCK_PLAN = {
    "title": "Ecommerce Website",
    "estimated_duration_days": 45,
    "milestones": [{"title": "MVP Ready", "due_offset_days": 21}, {"title": "Launch", "due_offset_days": 45}],
    "tasks": [
        {"title": "Project setup", "description": "Init repo and CI", "priority": "high", "estimated_hours": 8, "status": "backlog"},
        {"title": "Database schema", "description": "Design models", "priority": "high", "estimated_hours": 12, "status": "todo"},
        {"title": "Authentication", "description": "JWT + roles", "priority": "high", "estimated_hours": 16, "status": "todo"},
        {"title": "Product catalog", "description": "CRUD products", "priority": "medium", "estimated_hours": 16, "status": "todo"},
        {"title": "Shopping cart", "description": "Cart logic", "priority": "medium", "estimated_hours": 12, "status": "todo"},
        {"title": "Stripe checkout", "description": "Payment integration", "priority": "urgent", "estimated_hours": 20, "status": "todo"},
        {"title": "Order management", "description": "Orders + tracking", "priority": "medium", "estimated_hours": 16, "status": "todo"},
        {"title": "Admin dashboard", "description": "Admin views", "priority": "low", "estimated_hours": 12, "status": "todo"},
        {"title": "Testing", "description": "Unit + e2e", "priority": "medium", "estimated_hours": 16, "status": "todo"},
        {"title": "Deployment", "description": "Deploy to Render", "priority": "high", "estimated_hours": 8, "status": "todo"},
    ]
}

def _try_openrouter(brief: str):
    # Try OpenRouter first if key present
    if getattr(settings, 'OPENROUTER_API_KEY', ''):
        try:
            from .openrouter import generate_plan_openrouter
            return generate_plan_openrouter(brief)
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"OpenRouter failed, falling back to Gemini/mock: {e}")
            # fall through to Gemini/mock
    return None

def generate_plan(brief: str):
    # 1. Try OpenRouter
    data = _try_openrouter(brief)
    if data:
        return data
    if not settings.GEMINI_API_KEY:
        # fallback mock for dev without key
        return dict(MOCK_PLAN)
    import google.generativeai as genai
    import logging
    logger = logging.getLogger(__name__)
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model_name = settings.GEMINI_MODEL or "gemini-3.6-flash"
    text = None
    last_err = None
    for try_model in [model_name, "gemini-3.6-flash", "gemini-3.5-flash", "gemini-flash-latest"]:
        try:
            model = genai.GenerativeModel(try_model, system_instruction=SYSTEM_PROMPT, generation_config={"response_mime_type": "application/json", "temperature": 0.7})
            # 30s for Render cold start
            resp = model.generate_content(f"Client brief: {brief}", request_options={"timeout": 30})
            text = resp.text or "{}"
            logger.info(f"Gemini success with {try_model}")
            break
        except Exception as e:
            last_err = e
            logger.warning(f"Gemini failed {try_model}: {e}")
            continue
    if text is None:
        # No lanza 500 — devuelve mock + error visible en UI
        logger.error(f"All Gemini models failed, returning mock. Last: {last_err}")
        mock = dict(MOCK_PLAN)
        mock["title"] = f"Ecommerce Website (mock - Gemini error: {str(last_err)[:120]})"
        mock["_mock"] = True
        mock["_error"] = str(last_err)[:300]
        return mock
    try:
        data = json.loads(text)
    except Exception:
        import re
        m = re.search(r"\{.*\}", text, re.S)
        data = json.loads(m.group(0)) if m else {"title": "Generated Project", "estimated_duration_days": 30, "milestones": [], "tasks": []}
    # seguridad: sanitiza y limita
    for t in data.get("tasks", []):
        t["title"] = str(t.get("title",""))[:120]
        t["description"] = str(t.get("description",""))[:300]
        if t.get("priority") not in ["low","medium","high","urgent"]:
            t["priority"] = "medium"
        t["estimated_hours"] = min(max(int(t.get("estimated_hours",8)),1),80)
    return data

def _try_summary_openrouter(project_data: dict):
    if getattr(settings, 'OPENROUTER_API_KEY', ''):
        try:
            from .openrouter import generate_summary_openrouter
            return generate_summary_openrouter(project_data)
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"OpenRouter summary failed: {e}")
    return None

def generate_weekly_summary(project_data: dict):
    data = _try_summary_openrouter(project_data)
    if data:
        return data
    if not settings.GEMINI_API_KEY:
        return "Mock weekly summary: Project progressing well. 3 tasks completed, 2 blockers, next: Stripe integration."
    import google.generativeai as genai
    import logging
    logger = logging.getLogger(__name__)
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model_name = settings.GEMINI_MODEL or "gemini-3.6-flash"
    text = None
    last_err = None
    for try_model in [model_name, "gemini-3.6-flash", "gemini-3.5-flash"]:
        try:
            model = genai.GenerativeModel(try_model)
            prompt = f"Generate concise weekly status report (progress, blockers, next steps) for: {json.dumps(project_data)[:6000]}"
            resp = model.generate_content(prompt, request_options={"timeout": 30})
            text = resp.text[:2000]
            break
        except Exception as e:
            last_err = e
            logger.warning(f"Gemini summary failed {try_model}: {e}")
            continue
    if text is not None:
        return text
    return f"Error generating summary (all models failed): {last_err}"
