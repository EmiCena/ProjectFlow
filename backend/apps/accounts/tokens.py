from django.core import signing
from django.conf import settings

SALT = "email-verify"
MAX_AGE = 60 * 60 * 24  # 24h

def generate_verification_token(user):
    return signing.dumps({"user_id": user.id, "email": user.email}, salt=SALT)

def verify_token(token):
    try:
        data = signing.loads(token, salt=SALT, max_age=MAX_AGE)
        return data
    except signing.SignatureExpired:
        raise ValueError("Token expirado. Solicita uno nuevo.")
    except signing.BadSignature:
        raise ValueError("Token inválido.")
