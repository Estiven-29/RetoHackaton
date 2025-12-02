"""
Detector de anomalías con Machine Learning
"""
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from typing import List, Dict, Tuple
from datetime import datetime, timedelta


class MLAnomalyDetector:
    """Detector de anomalías usando Isolation Forest"""
    
    def __init__(self, df: pd.DataFrame):
        self.df = df
        self.model = None
        self.scaler = StandardScaler()
        
    def prepare_features(self) -> pd.DataFrame:
        """Prepara features para el modelo ML"""
        if self.df.empty:
            return pd.DataFrame()
        
        # Feature engineering
        features = pd.DataFrame()
        
        # Por IP origen
        ip_stats = self.df.groupby('ip_origen').agg({
            'puerto': ['nunique', 'count'],  # Diversidad de puertos
            'alerta': 'nunique',  # Tipos de ataque
            'protocolo': lambda x: (x == 'TCP').sum()  # Proporción TCP
        })
        ip_stats.columns = ['unique_ports', 'total_attacks', 'attack_types', 'tcp_count']
        ip_stats['tcp_ratio'] = ip_stats['tcp_count'] / ip_stats['total_attacks']
        
        # Agregar timestamp features
        self.df['hour'] = self.df['timestamp'].dt.hour
        self.df['day_of_week'] = self.df['timestamp'].dt.dayofweek
        
        hourly_activity = self.df.groupby('ip_origen')['hour'].agg(['mean', 'std'])
        ip_stats = ip_stats.join(hourly_activity, how='left')
        
        # Agregar flags de puertos SCADA
        scada_ports = [502, 102, 2404, 20000, 44818]
        ip_stats['targets_scada'] = self.df.groupby('ip_origen')['puerto'].apply(
            lambda x: any(port in scada_ports for port in x)
        ).astype(int)
        
        return ip_stats.fillna(0)
    
    def train_model(self, contamination=0.1):
        """Entrena el modelo de detección de anomalías"""
        features = self.prepare_features()
        
        if features.empty:
            return None
        
        # Normalizar features
        X = self.scaler.fit_transform(features)
        
        # Entrenar Isolation Forest
        self.model = IsolationForest(
            contamination=contamination,
            random_state=42,
            n_estimators=100
        )
        
        predictions = self.model.fit_predict(X)
        scores = self.model.score_samples(X)
        
        # Agregar predicciones al dataframe
        features['anomaly'] = predictions
        features['anomaly_score'] = scores
        features['is_anomaly'] = features['anomaly'] == -1
        
        return features
    
    def detect_anomalies(self) -> List[Dict]:
        """Detecta IPs anómalas usando ML"""
        results = self.train_model()
        
        if results is None:
            return []
        
        # Filtrar solo anomalías
        anomalies = results[results['is_anomaly'] == True].copy()
        anomalies = anomalies.sort_values('anomaly_score')
        
        anomaly_list = []
        for ip, row in anomalies.iterrows():
            # Obtener detalles del IP
            ip_data = self.df[self.df['ip_origen'] == ip]
            
            anomaly_list.append({
                'ip': ip,
                'anomaly_score': float(row['anomaly_score']),
                'confidence': self._calculate_confidence(row['anomaly_score']),
                'total_attacks': int(row['total_attacks']),
                'unique_ports': int(row['unique_ports']),
                'attack_types': int(row['attack_types']),
                'targets_scada': bool(row['targets_scada']),
                'behavioral_pattern': self._classify_behavior(row),
                'risk_level': self._calculate_ml_risk(row),
                'first_seen': ip_data['timestamp'].min().isoformat(),
                'last_seen': ip_data['timestamp'].max().isoformat(),
                'attack_timeline': self._get_attack_timeline(ip_data)
            })
        
        return anomaly_list
    
    def predict_next_attack(self) -> Dict:
        """Predice probabilidad de próximo ataque en las siguientes horas"""
        if self.df.empty:
            return {}
        
        # Analizar patrón temporal
        hourly_attacks = self.df.groupby(self.df['timestamp'].dt.hour).size()
        
        # Calcular tendencia
        hours = list(range(24))
        attacks = [hourly_attacks.get(h, 0) for h in hours]
        
        # Simple predicción basada en promedio móvil
        window = 3
        moving_avg = pd.Series(attacks).rolling(window=window).mean()
        
        current_hour = datetime.now().hour
        next_hours = [(current_hour + i) % 24 for i in range(1, 7)]
        
        predictions = []
        for hour in next_hours:
            predicted_attacks = int(moving_avg[hour]) if not np.isnan(moving_avg[hour]) else 0
            probability = min((predicted_attacks / max(attacks)) * 100, 100) if max(attacks) > 0 else 0
            
            predictions.append({
                'hour': f"{hour:02d}:00",
                'predicted_attacks': predicted_attacks,
                'probability': round(probability, 2),
                'risk_level': 'Alto' if probability > 70 else 'Medio' if probability > 40 else 'Bajo'
            })
        
        return {
            'next_6_hours': predictions,
            'highest_risk_hour': max(predictions, key=lambda x: x['probability']),
            'model_confidence': 'Media',  # Mejorar con más datos históricos
            'recommendation': self._get_prediction_recommendation(predictions)
        }
    
    def _calculate_confidence(self, score: float) -> str:
        """Calcula nivel de confianza de la detección"""
        # Scores más negativos = mayor anomalía
        if score < -0.5:
            return "Muy Alta"
        elif score < -0.3:
            return "Alta"
        elif score < -0.1:
            return "Media"
        return "Baja"
    
    def _classify_behavior(self, row: pd.Series) -> str:
        """Clasifica el patrón de comportamiento"""
        if row['unique_ports'] > 20:
            return "Escaneo Masivo de Puertos"
        elif row['attack_types'] > 2 and row['total_attacks'] > 15:
            return "Ataque Multi-Vector Sofisticado"
        elif row['targets_scada']:
            return "Ataque Dirigido a Infraestructura Crítica"
        elif row['total_attacks'] > 30:
            return "Ataque Sostenido de Alta Frecuencia"
        else:
            return "Comportamiento Sospechoso General"
    
    def _calculate_ml_risk(self, row: pd.Series) -> str:
        """Calcula riesgo basado en features ML"""
        score = 0
        
        if row['targets_scada']:
            score += 4
        if row['unique_ports'] > 20:
            score += 3
        if row['attack_types'] > 2:
            score += 2
        if row['total_attacks'] > 20:
            score += 2
        
        if score >= 8:
            return "Crítico"
        elif score >= 5:
            return "Alto"
        elif score >= 3:
            return "Medio"
        return "Bajo"
    
    def _get_attack_timeline(self, ip_data: pd.DataFrame) -> List[Dict]:
        """Genera timeline de ataques de una IP"""
        timeline = []
        for _, attack in ip_data.head(5).iterrows():
            timeline.append({
                'timestamp': attack['timestamp'].isoformat(),
                'type': attack['alerta'],
                'target': attack['ip_destino'],
                'port': int(attack['puerto'])
            })
        return timeline
    
    def _get_prediction_recommendation(self, predictions: List[Dict]) -> str:
        """Genera recomendación basada en predicción"""
        max_prob = max(p['probability'] for p in predictions)
        
        if max_prob > 70:
            return " CRÍTICO: Alta probabilidad de ataque inminente. Activar modo de monitoreo intensivo y preparar equipo de respuesta."
        elif max_prob > 40:
            return " Probabilidad moderada de ataque. Revisar logs en tiempo real y verificar reglas de firewall."
        else:
            return " Riesgo bajo en las próximas horas. Mantener monitoreo estándar."
