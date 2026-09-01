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

# Redis / Celery
REDIS_URL = config('REDIS_URL', default='redis://localhost:6379/0')
CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'

# Auth
AUTH_USER_MODEL = 'accounts.User'
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': ('rest_framework_simplejwt.authentication.JWTAuthentication',),
    'DEFAULT_PERMISSION_CLASSES': ('rest_framework.permissions.IsAuthenticated',),
    'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend','rest_framework.filters.SearchFilter','rest_framework.filters.OrderingFilter'],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_THROTTLE_CLASSES': ['rest_framework.throttling.UserRateThrottle','rest_framework.throttling.AnonRateThrottle'],
    'DEFAULT_THROTTLE_RATES': {'user': '1000/hour', 'anon': '100/hour', 'ai': '20/hour'},
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
# Fallback regex for *.onrender.com and *.up.railway.app
CORS_ALLOWED_ORIGIN_REGEXES = [r"^https://.*\.up\.railway\.app$", r"^https://.*\.onrender\.com$"]

# Security headers
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000 if not DEBUG else 0
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG

# Gemini
GEMINI_API_KEY = config('GEMINI_API_KEY', default='')
GEMINI_MODEL = config('GEMINI_MODEL', default='gemini-1.5-flash')

# Static / Media
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

SPECTACULAR_SETTINGS = {'TITLE': 'ProjectFlow API', 'VERSION': '1.0.0'}
