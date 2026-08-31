from django.conf import settings
from pymongo import MongoClient
from datetime import datetime, timezone

_client = None
def get_collection(name):
    global _client
    if _client is None:
        _client = MongoClient(settings.MONGO_URI)
    db_name = settings.MONGO_DB_NAME
    return _client[db_name][name]

def log_activity(workspace_id, user_id, event, entity, entity_id, metadata=None):
    col = get_collection('activity_logs')
    doc = {
        "workspace_id": workspace_id,
        "user_id": user_id,
        "event": event,
        "entity": entity,
        "entity_id": entity_id,
        "metadata": metadata or {},
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    col.insert_one(doc)
    return doc
