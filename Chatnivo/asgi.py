"""
ASGI config for Chatnivo project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""


import os
import django
from channels.routing import get_default_application
from . import routing 
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chat.settings')
django.setup()
#asgi ile communication halinde eszamanli gateway
application = get_default_application()
application = routing.application


