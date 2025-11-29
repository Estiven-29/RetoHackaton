"""
Schemas Pydantic para validación de datos
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Dict, Optional
from enum import Enum


class RiskLevel(str, Enum):
    """Niveles de riesgo"""
    CRITICAL = "Crítico"
    HIGH = "Alto"
    MEDIUM = "Medio"
    LOW = "Bajo"


class AttackType(str, Enum):
    """Tipos de ataque soportados"""
    PORT_SCAN = "Port scan"
    SQL_INJECTION = "SQL Injection"
    BRUTE_FORCE_SSH = "Brute force SSH"
    DDOS = "DDoS"
    MALWARE = "Malware"


class LogEntry(BaseModel):
    """Entrada de log IDS"""
    timestamp: datetime
    ip_origen: str = Field(..., description="IP de origen del ataque")
    ip_destino: str = Field(..., description="IP de destino")
    puerto: int = Field(..., ge=0, le=65535, description="Puerto objetivo")
    protocolo: str = Field(..., description="Protocolo de red (TCP/UDP)")
    alerta: str = Field(..., description="Tipo de alerta detectada")
    
    class Config:
        json_schema_extra = {
            "example": {
                "timestamp": "2025-07-03T07:00:00",
                "ip_origen": "192.168.1.2",
                "ip_destino": "192.168.100.2",
                "puerto": 916,
                "protocolo": "TCP",
                "alerta": "Port scan"
            }
        }


class SuspiciousIP(BaseModel):
    """IP sospechosa identificada"""
    ip: str
    total_ataques: int = Field(..., ge=0)
    tipos_ataques: List[str]
    nivel_riesgo: RiskLevel
    puertos_afectados: List[int]
    ultima_actividad: datetime
    recomendaciones: List[str] = []
    
    class Config:
        json_schema_extra = {
            "example": {
                "ip": "192.168.1.2",
                "total_ataques": 25,
                "tipos_ataques": ["Port scan", "SQL Injection"],
                "nivel_riesgo": "Alto",
                "puertos_afectados": [80, 443, 502],
                "ultima_actividad": "2025-07-05T15:00:00",
                "recomendaciones": ["Bloquear en firewall perimetral"]
            }
        }


class AttackPattern(BaseModel):
    """Patrón de ataque detectado"""
    tipo_ataque: str
    frecuencia: int
    porcentaje: float
    ips_involucradas: List[str]
    horario_pico: str
    severidad: RiskLevel


class PortAnalysis(BaseModel):
    """Análisis de puerto específico"""
    puerto: int
    total_intentos: int
    ips_origen: List[str]
    protocolos: List[str]
    es_scada_critico: bool
    descripcion_servicio: Optional[str] = None


class TimelineData(BaseModel):
    """Datos para timeline de ataques"""
    timestamp: str
    count: int
    ataques_detallados: Dict[str, int]


class AlertSummary(BaseModel):
    """Resumen de alertas"""
    total_alertas: int
    alertas_criticas: int
    alertas_activas: int
    tendencia: str  # "ascendente", "descendente", "estable"


class Recommendation(BaseModel):
    """Recomendación de seguridad"""
    prioridad: RiskLevel
    categoria: str
    titulo: str
    descripcion: str
    acciones: List[str]
    recursos_scada: List[str]


class AnalysisResult(BaseModel):
    """Resultado completo de análisis"""
    total_logs: int
    periodo_analizado: Dict[str, str]
    ips_sospechosas: List[SuspiciousIP]
    distribucion_ataques: Dict[str, int]
    ataques_por_hora: Dict[str, int]
    puertos_mas_atacados: List[PortAnalysis]
    patrones_detectados: List[AttackPattern]
    alert_summary: AlertSummary


class ReportData(BaseModel):
    """Datos para generación de reporte"""
    fecha_generacion: datetime
    periodo_analisis: str
    resumen_ejecutivo: str
    hallazgos_principales: List[str]
    ips_bloqueadas_sugeridas: List[SuspiciousIP]
    recomendaciones: List[Recommendation]
    metricas_clave: Dict[str, any]
