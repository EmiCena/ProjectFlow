import json
import requests
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

def _call_openrouter(prompt: str, system_prompt: str = SYSTEM_PROMPT) -> str:
    api_key = settings.OPENROUTER_API_KEY
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY missing")
    model = settings.OPENROUTER_MODEL or "nvidia/nemotron-3-ultra-550b-a55b:free"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://projectflow-web-4ccs.onrender.com",
        "X-Title": "ProjectFlow",
    }
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 2000,
    }
    resp = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    # OpenRouter returns choices[0].message.content
    content = data["choices"][0]["message"]["content"] or "{}"
    return content

def generate_plan_openrouter(brief: str):
    text = _call_openrouter(f"Client brief: {brief}")
    # try to extract JSON
    try:
        data = json.loads(text)
    except Exception:
        import re
        m = re.search(r"\{.*\}", text, re.S)
        data = json.loads(m.group(0)) if m else {"title": "Generated Project", "estimated_duration_days": 30, "milestones": [], "tasks": []}
    for t in data.get("tasks", []):
        t["title"] = str(t.get("title",""))[:120]
        t["description"] = str(t.get("description",""))[:300]
        if t.get("priority") not in ["low","medium","high","urgent"]:
            t["priority"] = "medium"
        t["estimated_hours"] = min(max(int(t.get("estimated_hours",8)),1),80)
        if t.get("status") not in ["backlog","todo","in_progress","review","done"]:
            t["status"] = "todo"
    return data

def generate_summary_openrouter(project_data: dict):
    prompt = f"Generate concise weekly status report (progress, blockers, next steps) for: {json.dumps(project_data)[:6000]}"
    text = _call_openrouter(prompt, system_prompt="You are a senior project manager. Generate a concise weekly report.")
    return text[:2000]
