import os
from .nodes import NODE_CLASS_MAPPINGS, NODE_DISPLAY_NAME_MAPPINGS
from server import PromptServer
from aiohttp import web

WEB_DIRECTORY = "./web"

STANDALONE_APP_DIR = os.path.join(os.path.dirname(__file__), "standalone_app")

if os.path.exists(STANDALONE_APP_DIR):
    PromptServer.instance.app.add_routes([
        web.static("/layout-studio-moss-image-comfy-node/standalone_app", STANDALONE_APP_DIR)
    ])

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]
