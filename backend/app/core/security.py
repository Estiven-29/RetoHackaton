"""
Configuración de seguridad y CORS
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings


def setup_cors(app: FastAPI) -> None:
    """
    Configura CORS para permitir peticiones desde el frontend
    
    Args:
        app: Instancia de FastAPI
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


def setup_security_headers(app: FastAPI) -> None:
    """
    Configura headers de seguridad adicionales
    
    Args:
        app: Instancia de FastAPI
    """
    @app.middleware("http")
    async def add_security_headers(request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        return response
