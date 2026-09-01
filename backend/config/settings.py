import os
from pathlib import Path
from datetime import timedelta
import dj_database_url
from decouple import config, Csv

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('DJANGO_SECRET_KEY', default='dev-secret-key-change-me')
DEBUG = config('DJANGO_DEBUG', default=True, cast=bool)
# Railway injects RAILWAY_PUBLIC_DOMAIN / PORT ; allow .railway.app in prod
_default_hosts = 'localhost,127.0.0.1,.up.railway.app,.railway.app'
if not DEBUG:
    _default_hosts += ',projectflow-api-production.up.railway.app,projectflow-web-production-981d.up.railway.app'
ALLOWED_HOSTS = config('DJANGO_ALLOWED_HOSTS', default=_default_hosts, cast=Csv())
# Trust Railway proxy for https
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
CSRF_TRUSTED_ORIGINS = config('CSRF_TRUSTED_ORIGINS', default='https://*.up.railway.app,https://*.railway.app', cast=Csv())

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'drf_spectacular',
    'storages',
    'django_otp',
    'django_otp.plugins.otp_totp',
    # Local
    'apps.accounts',
    'apps.workspaces',
    'apps.clients',
    'apps.projects',
    'apps.tasks',
    'apps.billing',
    'apps.analytics',
    'apps.activity',
    'apps.ai',
    'apps.documents',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'apps.activity.middleware.AuditMiddleware',
]

ROOT_URLCONF = 'config.urls'
WSGI_APPLICATION = 'config.wsgi.application'

TEMPLATES = [{ 'BACKEND': 'django.template.backends.django.DjangoTemplates', 'DIRS': [], 'APP_DIRS': True, 'OPTIONS': { 'context_processors': ['django.template.context_processors.debug','django.template.context_processors.request','django.contrib.auth.context_processors.auth','django.contrib.messages.context_processors.messages']}}]

# Database - PostgreSQL (Railway may provide DATABASE_PUBLIC_URL or POSTGRES_URL)
DATABASE_URL = config('DATABASE_URL', default=config('DATABASE_PUBLIC_URL', default=config('POSTGRES_URL', default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}")))
DATABASES = {'default': dj_database_url.parse(DATABASE_URL)}

# MongoDB
MONGO_URI = config('MONGO_URI', default='mongodb://localhost:27017/projectflow')
MONGO_DB_NAME = config('MONGO_DB_NAME', default='projectflow')

# Redis / Celery + Cache for throttling
REDIS_URL = config('REDIS_URL', default='redis://localhost:6379/0')
CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": REDIS_URL,
    }
}

# Auth
AUTH_USER_MODEL = 'accounts.User'
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': ('rest_framework_simplejwt.authentication.JWTAuthentication',),
    'DEFAULT_PERMISSION_CLASSES': ('rest_framework.permissions.IsAuthenticated',),
    'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend','rest_framework.filters.SearchFilter','rest_framework.filters.OrderingFilter'],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_THROTTLE_CLASSES': ['rest_framework.throttling.UserRateThrottle','rest_framework.throttling.AnonRateThrottle','rest_framework.throttling.ScopedRateThrottle'],
    'DEFAULT_THROTTLE_RATES': {'user': '1000/hour', 'user_burst': '60/minute', 'anon': '100/hour', 'anon_burst': '20/minute', 'ai': '20/hour', 'ai_burst': '5/minute'},
    'EXCEPTION_HANDLER': 'apps.activity.exceptions.custom_exception_handler',
}
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=config('JWT_ACCESS_MINUTES', default=15, cast=int)),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=config('JWT_REFRESH_DAYS', default=7, cast=int)),
    'ROTATE_REFRESH_TOKENS': True,
}

# CORS - prod must include frontend URL (Render + Railway)
_cors_default = 'http://localhost:5173,http://localhost:3000,https://projectflow-web-production-981d.up.railway.app,https://projectflow-web-4ccs.onrender.com,https://projectflow-web.onrender.com'
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default=_cors_default, cast=Csv())
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = ['authorization','content-type','accept','origin','x-csrftoken']
CSRF_TRUSTED_ORIGINS = config('CSRF_TRUSTED_ORIGINS', default='https://*.up.railway.app,https://*.railway.app,https://*.onrender.com', cast=Csv())
# Fallback regex for *.onrender.com and *.up.railway.app
CORS_ALLOWED_ORIGIN_REGEXES = [r"^https://.*\.up\.railway\.app$", r"^https://.*\.onrender\.com$"]


# Security headers
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000 if not DEBUG else 0
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG

# AI - OpenRouter (primary) + Gemini fallback
OPENROUTER_API_KEY = config('OPENROUTER_API_KEY', default=config('GEMINI_API_KEY', default=''))
OPENROUTER_MODEL = config('OPENROUTER_MODEL', default='nvidia/nemotron-3-ultra-550b-a55b:free')
GEMINI_API_KEY = config('GEMINI_API_KEY', default='')
GEMINI_MODEL = config('GEMINI_MODEL', default='gemini-3.6-flash')

# R2 / S3 - Cloudflare R2 S3-compatible
AWS_ACCESS_KEY_ID = config('R2_ACCESS_KEY_ID', default=config('AWS_ACCESS_KEY_ID', default=''))
AWS_SECRET_ACCESS_KEY = config('R2_SECRET_ACCESS_KEY', default=config('AWS_SECRET_ACCESS_KEY', default=''))
AWS_STORAGE_BUCKET_NAME = config('R2_BUCKET_NAME', default=config('AWS_STORAGE_BUCKET_NAME', default='projectflow-docs'))
AWS_S3_ENDPOINT_URL = config('R2_ENDPOINT_URL', default=config('AWS_S3_ENDPOINT_URL', default='https://9e6eec84788b8332f22fa9918375e6c7.r2.cloudflarestorage.com'))
AWS_S3_REGION_NAME = config('AWS_S3_REGION_NAME', default='auto')
AWS_S3_SIGNATURE_VERSION = 's3v4'
AWS_DEFAULT_ACL = None
# Use S3 for media if bucket configured, else local
if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY:
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    MEDIA_URL = f"{AWS_S3_ENDPOINT_URL}/{AWS_STORAGE_BUCKET_NAME}/"

# Stripe
STRIPE_SECRET_KEY = config('STRIPE_SECRET_KEY', default='')
STRIPE_PUBLISHABLE_KEY = config('STRIPE_PUBLISHABLE_KEY', default='')
STRIPE_WEBHOOK_SECRET = config('STRIPE_WEBHOOK_SECRET', default='')

# Email - SendGrid via SMTP
EMAIL_BACKEND = config('EMAIL_BACKEND', default='django.core.mail.backends.console.EmailBackend')
SENDGRID_API_KEY = config('SENDGRID_API_KEY', default='')
if SENDGRID_API_KEY:
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST = config('EMAIL_HOST', default='smtp.sendgrid.net')
    EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
    EMAIL_USE_TLS = True
    EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='apikey')
    EMAIL_HOST_PASSWORD = SENDGRID_API_KEY
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@projectflow.com')

# Static / Media (fallback local if no R2)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
if not AWS_ACCESS_KEY_ID:
    MEDIA_URL = '/media/'
    MEDIA_ROOT = BASE_DIR / 'media'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

SPECTACULAR_SETTINGS = {'TITLE': 'ProjectFlow API', 'VERSION': '1.0.0'}
