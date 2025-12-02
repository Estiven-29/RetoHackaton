"""
Endpoints para gestión de datasets
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import JSONResponse
from typing import Optional
import os
import shutil
from datetime import datetime
from ...services.dataset_manager import dataset_manager
from ...core.config import settings

router = APIRouter()


@router.post("/datasets/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    description: str = Query("", description="Descripción del dataset")
):
    """
    Sube un nuevo dataset CSV para análisis
    
    - **file**: Archivo CSV con columnas: timestamp, ip_origen, ip_destino, puerto, protocolo, alerta
    - **description**: Descripción opcional del dataset
    """
    # Validar tipo de archivo
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Solo se permiten archivos CSV")
    
    # Validar tamaño
    file_size = 0
    chunk_size = 1024 * 1024  # 1MB chunks
    
    # Generar nombre único
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    safe_filename = f"dataset_{timestamp}_{file.filename}"
    filepath = os.path.join(settings.UPLOAD_PATH, safe_filename)
    
    try:
        # Guardar archivo
        with open(filepath, 'wb') as buffer:
            while chunk := await file.read(chunk_size):
                file_size += len(chunk)
                
                if file_size > settings.MAX_UPLOAD_SIZE:
                    os.remove(filepath)
                    raise HTTPException(
                        status_code=413, 
                        detail=f"Archivo muy grande. Máximo: {settings.MAX_UPLOAD_SIZE / (1024*1024)}MB"
                    )
                
                buffer.write(chunk)
        
        # Registrar dataset
        dataset_info = dataset_manager.add_dataset(
            filename=safe_filename,
            original_name=file.filename,
            description=description
        )
        
        return {
            "message": "Dataset cargado exitosamente",
            "dataset": dataset_info
        }
        
    except ValueError as e:
        # Error de validación de columnas
        if os.path.exists(filepath):
            os.remove(filepath)
        raise HTTPException(status_code=400, detail=str(e))
    
    except Exception as e:
        # Limpiar archivo si hay error
        if os.path.exists(filepath):
            os.remove(filepath)
        raise HTTPException(status_code=500, detail=f"Error procesando archivo: {str(e)}")


@router.get("/datasets/list")
async def list_datasets():
    """
    Lista todos los datasets disponibles con su metadata
    """
    datasets = dataset_manager.list_datasets()
    
    return {
        "total": len(datasets),
        "datasets": datasets
    }


@router.get("/datasets/{dataset_id}/info")
async def get_dataset_info(dataset_id: str):
    """
    Obtiene información detallada de un dataset específico
    
    - **dataset_id**: ID del dataset
    """
    datasets = dataset_manager.list_datasets()
    dataset = next((d for d in datasets if d['id'] == dataset_id), None)
    
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset no encontrado")
    
    return dataset


@router.delete("/datasets/{dataset_id}")
async def delete_dataset(dataset_id: str):
    """
    Elimina un dataset
    
    - **dataset_id**: ID del dataset a eliminar
    """
    success = dataset_manager.delete_dataset(dataset_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Dataset no encontrado")
    
    return {
        "message": "Dataset eliminado exitosamente",
        "dataset_id": dataset_id
    }


@router.post("/datasets/compare")
async def compare_datasets(dataset_id1: str, dataset_id2: str):
    """
    Compara dos datasets para análisis temporal
    
    - **dataset_id1**: ID del primer dataset
    - **dataset_id2**: ID del segundo dataset
    """
    comparison = dataset_manager.compare_datasets(dataset_id1, dataset_id2)
    
    if not comparison:
        raise HTTPException(status_code=404, detail="Uno o ambos datasets no encontrados")
    
    return comparison


@router.post("/datasets/{dataset_id}/analyze")
async def analyze_specific_dataset(dataset_id: str):
    """
    Ejecuta análisis completo sobre un dataset específico
    
    - **dataset_id**: ID del dataset a analizar
    """
    from ...services.data_analyzer import DataAnalyzer
    from ...services.threat_detector import ThreatDetector
    from ...services.professional_recommender import professional_recommender
    
    df = dataset_manager.get_dataset(dataset_id)
    
    if df is None:
        raise HTTPException(status_code=404, detail="Dataset no encontrado")
    
    if df.empty:
        raise HTTPException(status_code=400, detail="Dataset vacío")
    
    # Ejecutar análisis
    analyzer = DataAnalyzer(df)
    detector = ThreatDetector(df)
    
    ips_sospechosas = analyzer.get_suspicious_ips()
    distribucion = analyzer.get_attack_distribution()
    timeline = analyzer.get_timeline_data()
    puertos = analyzer.get_port_analysis()
    patrones = analyzer.get_attack_patterns()
    alert_summary = detector.get_alert_summary()
    
    # Detectar si hay ataques SCADA
    scada_targeted = any(
        ip.nivel_riesgo in ['Alto', 'Crítico'] and 
        any(p in settings.SCADA_CRITICAL_PORTS for p in ip.puertos_afectados)
        for ip in ips_sospechosas
    )
    
    # Generar recomendaciones profesionales
    recommendations = professional_recommender.generate_recommendations(
        ips_sospechosas=ips_sospechosas,
        attack_distribution=distribucion,
        scada_targeted=scada_targeted
    )
    
    return {
        'dataset_id': dataset_id,
        'total_logs': len(df),
        'periodo_analizado': {
            'inicio': df['timestamp'].min().isoformat(),
            'fin': df['timestamp'].max().isoformat()
        },
        'ips_sospechosas': [ip.dict() for ip in ips_sospechosas],
        'distribucion_ataques': distribucion,
        'ataques_por_hora': {
            item.timestamp: item.count 
            for item in timeline
        },
        'puertos_mas_atacados': [p.dict() for p in puertos],
        'patrones_detectados': [p.dict() for p in patrones],
        'alert_summary': alert_summary.dict(),
        'professional_recommendations': [r.dict() for r in recommendations],
        'scada_targeted': scada_targeted
    }


@router.get("/datasets/current")
async def get_current_dataset():
    """
    Obtiene el dataset actualmente en uso por el sistema
    """
    # Por defecto usa el dataset original
    return {
        'dataset_id': 'default',
        'filename': settings.CSV_FILENAME,
        'source': 'original'
    }
