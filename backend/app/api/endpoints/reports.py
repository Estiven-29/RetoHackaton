"""
Endpoints de reportes y recomendaciones
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from ...services.data_analyzer import DataAnalyzer
from ...services.report_generator import ReportGenerator
from ...services.professional_recommender import professional_recommender
from ...utils.data_loader import data_loader
from ...core.config import settings

router = APIRouter()


@router.get("/reports/executive-summary")
async def get_executive_summary():
    """
    Obtiene resumen ejecutivo del análisis
    """
    df = data_loader.load_data()
    
    if df.empty:
        raise HTTPException(status_code=500, detail="No hay datos para generar reporte")
    
    analyzer = DataAnalyzer(df)
    generator = ReportGenerator(df)
    
    return generator.generate_executive_summary(analyzer)


@router.get("/reports/recommendations")
async def get_recommendations():
    """
    Obtiene recomendaciones de seguridad básicas
    """
    df = data_loader.load_data()
    
    if df.empty:
        return []
    
    analyzer = DataAnalyzer(df)
    generator = ReportGenerator(df)
    
    return generator.generate_recommendations(analyzer)


@router.get("/reports/professional-recommendations")
async def get_professional_recommendations(
    dataset_id: Optional[str] = Query(None, description="ID del dataset")
):
    """
    Obtiene recomendaciones profesionales basadas en frameworks internacionales
    (NIST, ISO 27001, IEC 62443, CIS Controls)
    """
    df = data_loader.load_data(dataset_id)
    
    if df.empty:
        return {
            'total_recommendations': 0,
            'frameworks_applied': [],
            'scada_specific': False,
            'recommendations': []
        }
    
    analyzer = DataAnalyzer(df)
    ips = analyzer.get_suspicious_ips()
    distribution = analyzer.get_attack_distribution()
    
    # Detectar si hay ataques SCADA
    scada_targeted = any(
        ip.nivel_riesgo in ['Alto', 'Crítico'] and 
        any(p in settings.SCADA_CRITICAL_PORTS for p in ip.puertos_afectados)
        for ip in ips
    )
    
    recommendations = professional_recommender.generate_recommendations(
        ips_sospechosas=ips,
        attack_distribution=distribution,
        scada_targeted=scada_targeted
    )
    
    return {
        'total_recommendations': len(recommendations),
        'frameworks_applied': [
            'NIST Cybersecurity Framework',
            'ISO/IEC 27001:2022',
            'IEC 62443 (Industrial Security)',
            'CIS Critical Security Controls'
        ],
        'scada_specific': scada_targeted,
        'recommendations': [r.dict() for r in recommendations]
    }
