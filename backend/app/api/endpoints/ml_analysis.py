"""
Endpoints de análisis con Machine Learning
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from ...services.ml_detector import MLAnomalyDetector
from ...utils.data_loader import data_loader

router = APIRouter()


@router.get("/ml/anomalies")
async def detect_ml_anomalies(contamination: float = Query(0.1, ge=0.01, le=0.5)):
    """
    Detecta anomalías usando Machine Learning (Isolation Forest)
    
    - **contamination**: Proporción esperada de anomalías (0.01-0.5)
    """
    df = data_loader.load_data()
    
    if df.empty:
        raise HTTPException(status_code=500, detail="No hay datos para analizar")
    
    detector = MLAnomalyDetector(df)
    anomalies = detector.detect_anomalies()
    
    return {
        'total_anomalies': len(anomalies),
        'detection_method': 'Isolation Forest',
        'contamination_rate': contamination,
        'anomalies': anomalies
    }


@router.get("/ml/predict-attacks")
async def predict_next_attacks():
    """
    Predice probabilidad de ataques en las próximas 6 horas
    usando análisis de patrones temporales
    """
    df = data_loader.load_data()
    
    if df.empty:
        raise HTTPException(status_code=500, detail="No hay datos suficientes")
    
    detector = MLAnomalyDetector(df)
    predictions = detector.predict_next_attack()
    
    return predictions


@router.get("/ml/behavioral-analysis/{ip}")
async def analyze_ip_behavior(ip: str):
    """
    Análisis de comportamiento profundo de una IP específica
    
    - **ip**: Dirección IP a analizar
    """
    df = data_loader.load_data()
    
    if df.empty:
        return {}
    
    ip_data = df[df['ip_origen'] == ip]
    
    if ip_data.empty:
        raise HTTPException(status_code=404, detail=f"IP {ip} no encontrada en los datos")
    
    detector = MLAnomalyDetector(df)
    features = detector.prepare_features()
    
    if ip not in features.index:
        raise HTTPException(status_code=404, detail=f"No hay suficientes datos para analizar {ip}")
    
    ip_features = features.loc[ip]
    
    return {
        'ip': ip,
        'total_attacks': int(ip_features['total_attacks']),
        'unique_ports': int(ip_features['unique_ports']),
        'attack_diversity': int(ip_features['attack_types']),
        'tcp_ratio': round(float(ip_features['tcp_ratio']), 2),
        'targets_scada': bool(ip_features.get('targets_scada', False)),
        'activity_pattern': {
            'mean_hour': round(float(ip_features['mean']), 2) if 'mean' in ip_features else None,
            'consistency': 'Alta' if ip_features.get('std', 100) < 3 else 'Media' if ip_features.get('std', 100) < 6 else 'Baja'
        },
        'timeline': ip_data.groupby(ip_data['timestamp'].dt.floor('H')).size().to_dict()
    }
