from django.core import signing
from django.conf import settings

SALT = "email-verify"
MAX_AGE = 60 * 60 * 24  # 24h

RESET_SALT = "password-reset"
RESET_MAX_AGE = 60 * 60 * 1  # 1h para reset

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

def generate_reset_token(user):
    return signing.dumps({"user_id": user.id, "email": user.email}, salt=RESET_SALT)

def verify_reset_token(token):
    try:
        data = signing.loads(token, salt=RESET_SALT, max_age=RESET_MAX_AGE)
        return data
    except signing.SignatureExpired:
        raise ValueError("Token expirado (1h). Solicita uno nuevo.")
    except signing.BadSignature:
        raise ValueError("Token inválido.")
