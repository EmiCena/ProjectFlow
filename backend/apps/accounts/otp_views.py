from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_otp.plugins.otp_totp.models import TOTPDevice
import qrcode, io, base64

class Setup2FAView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        # create or get device
        device, created = TOTPDevice.objects.get_or_create(user=request.user, name="default")
        if not device.key:
            device.save()  # generates key
        # generate provisioning uri
        uri = device.config_url
        # generate QR
        img = qrcode.make(uri)
        buf = io.BytesIO()
        img.save(buf, format='PNG')
        b64 = base64.b64encode(buf.getvalue()).decode()
        return Response({"uri": uri, "qr": f"data:image/png;base64,{b64}", "secret": device.key})

class Verify2FAView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        token = request.data.get('token','')
        device = TOTPDevice.objects.filter(user=request.user, name="default").first()
        if not device:
            return Response({"detail": "No device"}, status=404)
        if device.verify_token(token):
            device.confirmed = True
            device.save()
            return Response({"verified": True})
        return Response({"detail": "Invalid token"}, status=400)
