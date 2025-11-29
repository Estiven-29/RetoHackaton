"""
Endpoints de generación de reportes
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from ...services.report_generator import ReportGenerator
from ...services.data_analyzer import DataAnalyzer
from ...utils.data_loader import data_loader
from ...api.models.schemas import ReportData

router = APIRouter()


@router.get("/reports/executive", response_model=ReportData)
async def generate_executive_report():
    """
    Genera reporte ejecutivo completo con hallazgos y recomendaciones
    """
    df = data_loader.load_data()
    
    if df.empty:
        raise HTTPException(
            status_code=500,
            detail="No hay datos suficientes para generar el reporte"
        )
    
    # Obtener datos necesarios
    analyzer = DataAnalyzer(df)
    ips_sospechosas = analyzer.get_suspicious_ips()
    distribucion = analyzer.get_attack_distribution()
    
    # Generar reporte
    report_gen = ReportGenerator(df)
    report = report_gen.generate_executive_report(ips_sospechosas, distribucion)
    
    return report


@router.get("/reports/recommendations")
async def get_recommendations():
    """
    Obtiene solo las recomendaciones de seguridad
    """
    df = data_loader.load_data()
    
    if df.empty:
        return []
    
    analyzer = DataAnalyzer(df)
    ips_sospechosas = analyzer.get_suspicious_ips()
    distribucion = analyzer.get_attack_distribution()
    
    report_gen = ReportGenerator(df)
    report = report_gen.generate_executive_report(ips_sospechosas, distribucion)
    
    return report.recomendaciones


@router.get("/reports/metrics")
async def get_key_metrics():
    """
    Obtiene métricas clave del sistema
    """
    df = data_loader.load_data()
    
    if df.empty:
        return {}
    
    analyzer = DataAnalyzer(df)
    ips = analyzer.get_suspicious_ips()
    distribucion = analyzer.get_attack_distribution()
    report_gen = ReportGenerator(df)
    report = report_gen.generate_executive_report(ips, distribucion)
    
    return report.metricas_clave
