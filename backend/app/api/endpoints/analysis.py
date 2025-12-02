"""
Endpoints de análisis de datos IDS
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from ...services.data_analyzer import DataAnalyzer
from ...services.threat_detector import ThreatDetector
from ...utils.data_loader import data_loader

router = APIRouter()


@router.get("/analysis/dashboard-stats")
async def get_dashboard_stats(
    ip_threshold: int = Query(10, description="Umbral mínimo de ataques"),
    dataset_id: Optional[str] = Query(None, description="ID del dataset a analizar")  # ← NUEVO
):
    """
    Obtiene estadísticas completas para el dashboard
    """
    df = data_loader.load_data(dataset_id)  # ← MODIFICADO
    
    if df.empty:
        raise HTTPException(status_code=500, detail="No hay datos para analizar")
    
    analyzer = DataAnalyzer(df)
    detector = ThreatDetector(df)
    
    # Obtener análisis
    ips = analyzer.get_suspicious_ips(ip_threshold)
    distribucion = analyzer.get_attack_distribution()
    timeline = analyzer.get_timeline_data()
    puertos = analyzer.get_port_analysis()
    patrones = analyzer.get_attack_patterns()
    alert_summary = detector.get_alert_summary()
    
    return {
        'dataset_id': dataset_id or 'default',  # ← NUEVO
        'total_logs': len(df),
        'periodo_analizado': {
            'inicio': df['timestamp'].min().isoformat(),
            'fin': df['timestamp'].max().isoformat()
        },
        'ips_sospechosas': [ip.dict() for ip in ips],
        'distribucion_ataques': distribucion,
        'ataques_por_hora': {
            item.timestamp: item.count 
            for item in timeline
        },
        'puertos_mas_atacados': [p.dict() for p in puertos],
        'patrones_detectados': [p.dict() for p in patrones],
        'alert_summary': alert_summary.dict()
    }


@router.get("/analysis/suspicious-ips")
async def get_suspicious_ips(
    limit: int = Query(10, ge=1, le=100),
    min_attacks: int = Query(5, ge=1),
    dataset_id: Optional[str] = Query(None, description="ID del dataset")  # ← NUEVO
):
    """Obtiene lista de IPs sospechosas"""
    df = data_loader.load_data(dataset_id)  # ← MODIFICADO
    
    if df.empty:
        return []
    
    analyzer = DataAnalyzer(df)
    ips = analyzer.get_suspicious_ips(min_attacks)
    
    return [ip.dict() for ip in ips[:limit]]


@router.get("/analysis/timeline")
async def get_timeline(
    interval: str = Query('H', regex='^(H|D)$'),
    dataset_id: Optional[str] = Query(None, description="ID del dataset")  # ← NUEVO
):
    """Obtiene timeline de ataques"""
    df = data_loader.load_data(dataset_id)  # ← MODIFICADO
    
    if df.empty:
        return []
    
    analyzer = DataAnalyzer(df)
    timeline = analyzer.get_timeline_data(interval)
    
    return [item.dict() for item in timeline]


@router.get("/analysis/ports")
async def get_port_analysis(
    top_n: int = Query(15, ge=1, le=50),
    dataset_id: Optional[str] = Query(None, description="ID del dataset")  # ← NUEVO
):
    """Análisis de puertos más atacados"""
    df = data_loader.load_data(dataset_id)  # ← MODIFICADO
    
    if df.empty:
        return []
    
    analyzer = DataAnalyzer(df)
    ports = analyzer.get_port_analysis(top_n)
    
    return [p.dict() for p in ports]


@router.get("/analysis/patterns")
async def get_attack_patterns(
    dataset_id: Optional[str] = Query(None, description="ID del dataset")  # ← NUEVO
):
    """Obtiene patrones de ataque identificados"""
    df = data_loader.load_data(dataset_id)  # ← MODIFICADO
    
    if df.empty:
        return []
    
    analyzer = DataAnalyzer(df)
    patterns = analyzer.get_attack_patterns()
    
    return [p.dict() for p in patterns]
