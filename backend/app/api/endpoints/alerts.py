"""
Endpoints de alertas y detección de amenazas
"""
from fastapi import APIRouter, HTTPException
from ...services.threat_detector import ThreatDetector
from ...utils.data_loader import data_loader
from ...api.models.schemas import AlertSummary

router = APIRouter()


@router.get("/alerts/summary", response_model=AlertSummary)
async def get_alert_summary():
    """
    Obtiene resumen de alertas del sistema
    """
    df = data_loader.load_data()
    
    if df.empty:
        raise HTTPException(status_code=500, detail="No hay datos disponibles")
    
    detector = ThreatDetector(df)
    return detector.get_alert_summary()


@router.get("/alerts/coordinated-attacks")
async def get_coordinated_attacks():
    """
    Detecta ataques coordinados (múltiples orígenes al mismo objetivo)
    """
    df = data_loader.load_data()
    
    if df.empty:
        return []
    
    detector = ThreatDetector(df)
    return detector.detect_coordinated_attacks()


@router.get("/alerts/port-sweeps")
async def get_port_sweeps():
    """
    Detecta barridos de puertos
    """
    df = data_loader.load_data()
    
    if df.empty:
        return []
    
    detector = ThreatDetector(df)
    return detector.detect_port_sweep()


@router.get("/alerts/attack-velocity")
async def get_attack_velocity():
    """
    Calcula velocidad de ataques (ataques por hora)
    """
    df = data_loader.load_data()
    
    if df.empty:
        return {'avg_per_hour': 0, 'max_per_hour': 0, 'min_per_hour': 0}
    
    detector = ThreatDetector(df)
    return detector.get_attack_velocity()
