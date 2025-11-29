"""
FastAPI Application Principal - IDS SCADA Dashboard
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .core.security import setup_cors, setup_security_headers
from .api.endpoints import analysis, alerts, reports
from .api.endpoints import ml_analysis, auto_response, network_graph
from .api.endpoints import datasets  # ← NUEVO
from .utils.data_loader import data_loader

# Crear instancia de FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar seguridad
setup_cors(app)
setup_security_headers(app)

# Registrar routers
app.include_router(
    analysis.router,
    prefix=f"{settings.API_V1_PREFIX}",
    tags=["Analysis"]
)
app.include_router(
    alerts.router,
    prefix=f"{settings.API_V1_PREFIX}",
    tags=["Alerts"]
)
app.include_router(
    reports.router,
    prefix=f"{settings.API_V1_PREFIX}",
    tags=["Reports"]
)
app.include_router(
    ml_analysis.router,
    prefix=f"{settings.API_V1_PREFIX}",
    tags=[" Machine Learning"]
)
app.include_router(
    auto_response.router,
    prefix=f"{settings.API_V1_PREFIX}",
    tags=[" Auto Response"]
)
app.include_router(
    network_graph.router,
    prefix=f"{settings.API_V1_PREFIX}",
    tags=[" Network Graph"]
)
app.include_router(  # ← NUEVO
    datasets.router,
    prefix=f"{settings.API_V1_PREFIX}",
    tags=[" Dataset Management"]
)


@app.on_event("startup")
async def startup_event():
    """Evento de inicio - Precarga de datos"""
    print("=" * 60)
    print(" Iniciando IDS SCADA Dashboard API v2.0...")
    print("=" * 60)
    
    # Precargar datos
    df = data_loader.load_data()
    if not df.empty:
        print(f"✓ Dataset cargado: {len(df)} registros")
        fecha_inicio, fecha_fin = data_loader.get_date_range()
        print(f"✓ Período: {fecha_inicio} - {fecha_fin}")
    else:
        print("  Advertencia: No se pudieron cargar los datos")
    
    print("=" * 60)
    print(f" API disponible en: http://localhost:8000")
    print(f" Documentación: http://localhost:8000/docs")
    print(f" Machine Learning: Activo")
    print(f" Auto Response: Activo")
    print(f" Upload Datasets: Activo")
    print(f"🎓 Professional Recommendations: NIST, ISO, IEC 62443")
    print("=" * 60)


@app.get("/")
async def root():
    """Endpoint raíz - Health check"""
    return {
        "message": "IDS SCADA Dashboard API - Professional Edition v2.0",
        "version": settings.APP_VERSION,
        "status": "online",
        "features": [
            "Machine Learning Anomaly Detection",
            "Automated Response System",
            "Attack Network Visualization",
            "Predictive Analytics",
            "Multi-Dataset Management",
            "Professional Recommendations (NIST, ISO 27001, IEC 62443, CIS)"
        ],
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    df = data_loader.load_data()
    
    return {
        "status": "healthy",
        "version": "2.0.0",
        "data_loaded": not df.empty,
        "records_count": len(df) if not df.empty else 0,
        "ml_enabled": True,
        "auto_response_enabled": True,
        "multi_dataset_enabled": True,
        "professional_recommendations": True
    }
