"""
Detector de amenazas - Lógica avanzada de detección
"""
import pandas as pd
from typing import List, Dict, Tuple
from collections import Counter
from ..api.models.schemas import AlertSummary, RiskLevel
from ..utils.helpers import calculate_trend


class ThreatDetector:
    """Detector de amenazas y anomalías en tráfico IDS"""
    
    def __init__(self, df: pd.DataFrame):
        self.df = df
    
    def get_alert_summary(self) -> AlertSummary:
        """
        Genera resumen de alertas del sistema
        
        Returns:
            Resumen de alertas con métricas clave
        """
        if self.df.empty:
            return AlertSummary(
                total_alertas=0,
                alertas_criticas=0,
                alertas_activas=0,
                tendencia="estable"
            )
        
        # Contar alertas críticas (SQL Injection y ataques a puertos SCADA)
        alertas_criticas = len(self.df[
            (self.df['alerta'] == 'SQL Injection') | 
            (self.df['puerto'].isin([502, 102, 2404, 20000]))
        ])
        
        # Alertas activas (últimas 24 horas simuladas - últimos 24 registros por hora)
        if len(self.df) > 24:
            recent = self.df.tail(24)
            alertas_activas = len(recent)
            
            # Calcular tendencia
            hourly_counts = [len(self.df[self.df['timestamp'].dt.hour == h]) for h in range(24)]
            tendencia = calculate_trend(hourly_counts)
        else:
            alertas_activas = len(self.df)
            tendencia = "estable"
        
        return AlertSummary(
            total_alertas=len(self.df),
            alertas_criticas=alertas_criticas,
            alertas_activas=alertas_activas,
            tendencia=tendencia
        )
    
    def detect_coordinated_attacks(self) -> List[Dict]:
        """
        Detecta ataques coordinados (múltiples IPs atacando mismo objetivo)
        
        Returns:
            Lista de ataques coordinados detectados
        """
        if self.df.empty:
            return []
        
        # Agrupar por IP destino y ventana temporal de 1 hora
        self.df['hour_window'] = self.df['timestamp'].dt.floor('H')
        
        coordinated = []
        for (target_ip, hour), group in self.df.groupby(['ip_destino', 'hour_window']):
            unique_sources = group['ip_origen'].nunique()
            
            # Si 3 o más IPs distintas atacan el mismo objetivo en 1 hora
            if unique_sources >= 3:
                coordinated.append({
                    'target_ip': target_ip,
                    'timestamp': hour.strftime('%Y-%m-%d %H:%M'),
                    'attacking_ips': group['ip_origen'].unique().tolist(),
                    'attack_types': group['alerta'].unique().tolist(),
                    'severity': RiskLevel.CRITICAL
                })
        
        return coordinated
    
    def detect_port_sweep(self) -> List[Dict]:
        """
        Detecta barridos de puertos (una IP escaneando múltiples puertos)
        
        Returns:
        Lista de barridos detectados
        """
        if self.df.empty:
            return []
        
        sweeps = []
        for ip, group in self.df.groupby('ip_origen'):
            unique_ports = group['puerto'].nunique()
            
            # Si una IP ataca 10 o más puertos diferentes
            if unique_ports >= 10:
                sweeps.append({
                    'source_ip': ip,
                    'ports_scanned': unique_ports,
                    'target_ips': group['ip_destino'].unique().tolist(),
                    'timeframe': f"{group['timestamp'].min()} - {group['timestamp'].max()}",
                    'risk_level': RiskLevel.HIGH
                })
        
        return sweeps
    
    def get_attack_velocity(self) -> Dict[str, float]:
        """
        Calcula la velocidad de ataques (ataques por hora promedio)
        
        Returns:
            Dict con métricas de velocidad
        """
        if self.df.empty or len(self.df) < 2:
            return {'avg_per_hour': 0, 'max_per_hour': 0, 'min_per_hour': 0}
        
        hourly = self.df.groupby(self.df['timestamp'].dt.floor('H')).size()
        
        return {
            'avg_per_hour': round(hourly.mean(), 2),
            'max_per_hour': int(hourly.max()),
            'min_per_hour': int(hourly.min())
        }
