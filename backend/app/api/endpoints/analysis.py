"""
Endpoints de análisis de datos
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from ...services.data_analyzer import DataAnalyzer
from ...services.threat_detector import ThreatDetector
from ...utils.data_loader import data_loader
from ...api.models.schemas import AnalysisResult, SuspiciousIP
from typing import List

router = APIRouter()


@router.get("/analysis/dashboard-stats", response_model=AnalysisResult)
async def get_dashboard_stats(
    ip_threshold: Optional[int] = Query(None, description="Umbral mínimo de ataques para IP sospechosa")
):
    """
    Obtiene estadísticas completas para el dashboard principal
    
    - **ip_threshold**: Umbral personalizado para detección de IPs sospechosas
    """
    df = data_loader.load_data()
    
    if df.empty:
        raise HTTPException(
            status_code=500, 
            detail="No se pudieron cargar los datos del sistema IDS"
        )
    
    # Inicializar analizadores
    analyzer = DataAnalyzer(df)
    threat_detector = ThreatDetector(df)
    
    # Obtener análisis
    ips_sospechosas = analyzer.get_suspicious_ips(threshold=ip_threshold)
    distribucion = analyzer.get_attack_distribution()
    timeline = analyzer.get_timeline_data()
    puertos = analyzer.get_port_analysis()
    patrones = analyzer.get_attack_patterns()
    alert_summary = threat_detector.get_alert_summary()
    
    # Convertir timeline a dict
    timeline_dict = {item.timestamp: item.count for item in timeline}
    
    # Obtener rango de fechas
    fecha_inicio, fecha_fin = data_loader.get_date_range()
    
    return AnalysisResult(
        total_logs=len(df),
        periodo_analizado={
            'inicio': fecha_inicio.strftime('%Y-%m-%d %H:%M:%S') if fecha_inicio else '',
            'fin': fecha_fin.strftime('%Y-%m-%d %H:%M:%S') if fecha_fin else ''
        },
        ips_sospechosas=ips_sospechosas,
        distribucion_ataques=distribucion,
        ataques_por_hora=timeline_dict,
        puertos_mas_atacados=puertos,
        patrones_detectados=patrones,
        alert_summary=alert_summary
    )


@router.get("/analysis/suspicious-ips", response_model=List[SuspiciousIP])
async def get_suspicious_ips(
    limit: int = Query(10, description="Número máximo de IPs a retornar"),
    min_attacks: int = Query(5, description="Mínimo de ataques para considerar")
):
    """
    Obtiene lista detallada de IPs sospechosas
    
    - **limit**: Número máximo de resultados
    - **min_attacks**: Umbral mínimo de ataques
    """
    df = data_loader.load_data()
    
    if df.empty:
        return []
    
    analyzer = DataAnalyzer(df)
    ips = analyzer.get_suspicious_ips(threshold=min_attacks)
    
    return ips[:limit]


@router.get("/analysis/timeline")
async def get_attack_timeline(interval: str = Query('H', regex='^(H|D)$')):
    """
    Obtiene timeline de ataques
    
    - **interval**: Intervalo de agrupación ('H' para hora, 'D' para día)
    """
    df = data_loader.load_data()
    
    if df.empty:
        return []
    
    analyzer = DataAnalyzer(df)
    return analyzer.get_timeline_data(interval=interval)


@router.get("/analysis/ports")
async def get_port_analysis(top_n: int = Query(15, ge=1, le=50)):
    """
    Analiza los puertos más atacados
    
    - **top_n**: Número de puertos a analizar (1-50)
    """
    df = data_loader.load_data()
    
    if df.empty:
        return []
    
    analyzer = DataAnalyzer(df)
    return analyzer.get_port_analysis(top_n=top_n)


@router.get("/analysis/patterns")
async def get_attack_patterns():
    """
    Detecta y retorna patrones de ataque identificados
    """
    df = data_loader.load_data()
    
    if df.empty:
        return []
    
    analyzer = DataAnalyzer(df)
    return analyzer.get_attack_patterns()
