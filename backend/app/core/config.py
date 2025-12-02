"""
Configuración centralizada de la aplicación
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Configuración de la aplicación"""
    
    # Metadata de la aplicación
    APP_NAME: str = "IDS SCADA Dashboard API"
    APP_VERSION: str = "2.0.0"  # ← ACTUALIZADO
    APP_DESCRIPTION: str = "API para análisis de amenazas en sistemas IDS de infraestructura SCADA"
    
    # Configuración de API
    API_V1_PREFIX: str = "/api/v1"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
    ]
    
    # Configuración de datos
    DATA_PATH: str = os.path.join(os.path.dirname(__file__), "../data")
    UPLOAD_PATH: str = os.path.join(os.path.dirname(__file__), "../uploads")  # ← NUEVO
    CSV_FILENAME: str = "cbs_6_dataset_1_ids.csv"
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024  # 50MB ← NUEVO
    
    # Umbrales de detección
    SUSPICIOUS_IP_THRESHOLD: int = 10
    HIGH_RISK_THRESHOLD: int = 20
    MEDIUM_RISK_THRESHOLD: int = 10
    
    # Puertos críticos SCADA
    SCADA_CRITICAL_PORTS: List[int] = [
        502,   # Modbus
        102,   # S7comm (Siemens)
        2404,  # IEC 60870-5-104
        20000, # DNP3
        44818, # Ethernet/IP
    ]
    
    class Config:
        case_sensitive = True
        env_file = ".env"


# Instancia global de configuración
settings = Settings()

# Crear directorios si no existen
os.makedirs(settings.DATA_PATH, exist_ok=True)
os.makedirs(settings.UPLOAD_PATH, exist_ok=True)  # ← NUEVO
