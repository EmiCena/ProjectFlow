from rest_framework.views import exception_handler
from rest_framework.response import Response

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        # conserva errores de validación (serializer) y sanitiza detalles
        if isinstance(response.data, dict):
            if "detail" in response.data:
                response.data = {"detail": str(response.data["detail"])[:500], "code": response.status_code}
            else:
                # errores de campo (ej. {"number": ["..."]}) -> añade code sin ocultar campos
                response.data["code"] = response.status_code
                # limita longitud de mensajes
                for k, v in list(response.data.items()):
                    if k != "code" and isinstance(v, list):
                        response.data[k] = [str(x)[:300] for x in v]
                    elif k != "code" and isinstance(v, str):
                        response.data[k] = v[:500]
        else:
            response.data = {"detail": str(response.data)[:500], "code": response.status_code}
    return response
