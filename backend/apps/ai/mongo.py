from django.conf import settings
from pymongo import MongoClient
from datetime import datetime, timezone

_client=None
def _col(name):
    global _client
    if _client is None:
        # 5s timeout so missing MONGO_URI doesn't block request
        _client = MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=5000, connectTimeoutMS=5000, socketTimeoutMS=5000)
    return _client[settings.MONGO_DB_NAME][name]

def save_conversation(workspace_id, user_id, prompt, response):
    try:
        _col('ai_conversations').insert_one({
            "workspace_id": workspace_id,
            "user_id": user_id,
            "prompt": prompt,
            "response": response,
            "model": getattr(settings, 'OPENROUTER_MODEL', settings.GEMINI_MODEL),
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    except Exception:
        pass  # don't block AI response if mongo down
