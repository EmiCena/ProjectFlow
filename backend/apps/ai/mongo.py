from django.conf import settings
from pymongo import MongoClient
from datetime import datetime, timezone

_client=None
def _col(name):
    global _client
    if _client is None:
        _client = MongoClient(settings.MONGO_URI)
    return _client[settings.MONGO_DB_NAME][name]

def save_conversation(workspace_id, user_id, prompt, response):
    _col('ai_conversations').insert_one({
        "workspace_id": workspace_id,
        "user_id": user_id,
        "prompt": prompt,
        "response": response,
        "model": settings.GEMINI_MODEL,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
