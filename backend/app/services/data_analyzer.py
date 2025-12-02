"""
Analizador de datos IDS - Lógica principal de detección de patrones
"""
import pandas as pd
from typing import List, Dict
from datetime import datetime
from ..api.models.schemas import (
    SuspiciousIP, 
    AttackPattern, 
    PortAnalysis, 
    RiskLevel,
    TimelineData
)
from ..core.config import settings
from ..utils.helpers import get_scada_port_info, calculate_trend


class DataAnalyzer:
    """Analizador de datos de IDS para detección de amenazas"""
    
    def __init__(self, df: pd.DataFrame):
        """
        Inicializa el analizador con un DataFrame
        
        Args:
            df: DataFrame de pandas con los logs de IDS
        """
        self.df = df
        
    def get_suspicious_ips(self, threshold: int = None) -> List[SuspiciousIP]:
        """
        Identifica IPs sospechosas basándose en frecuencia de ataques
        
        Args:
            threshold: Umbral mínimo de ataques para considerar sospechosa
            
        Returns:
            Lista de IPs sospechosas ordenadas por riesgo
        """
        if self.df.empty:
            return []
        
        threshold = threshold or settings.SUSPICIOUS_IP_THRESHOLD
        
        # Agrupar por IP de origen
        ip_analysis = self.df.groupby('ip_origen').agg({
            'alerta': [('total', 'count'), ('tipos', lambda x: list(x.unique()))],
            'puerto': [('puertos', lambda x: list(x.unique()))],
            'timestamp': [('ultima', 'max')]
        })
        
        ip_analysis.columns = ['_'.join(col).strip() for col in ip_analysis.columns.values]
        ip_analysis = ip_analysis.reset_index()
        
        # Filtrar por umbral
        ip_analysis = ip_analysis[ip_analysis['alerta_total'] >= threshold]
        
        resultados = []
        for _, row in ip_analysis.iterrows():
            # Clasificar riesgo
            total = row['alerta_total']
            if total > settings.HIGH_RISK_THRESHOLD:
                riesgo = RiskLevel.HIGH
            elif total > settings.MEDIUM_RISK_THRESHOLD:
                riesgo = RiskLevel.MEDIUM
            else:
                riesgo = RiskLevel.LOW
            
            # Generar recomendaciones específicas
            recomendaciones = self._generate_recommendations(
                row['alerta_tipos'],
                row['puerto_puertos']
            )
            
            resultados.append(SuspiciousIP(
                ip=row['ip_origen'],
                total_ataques=int(total),
                tipos_ataques=row['alerta_tipos'],
                nivel_riesgo=riesgo,
                puertos_afectados=row['puerto_puertos'],
                ultima_actividad=row['timestamp_ultima'],
                recomendaciones=recomendaciones
            ))
        
        # Ordenar por total de ataques descendente
        return sorted(resultados, key=lambda x: x.total_ataques, reverse=True)
    
    def get_attack_distribution(self) -> Dict[str, int]:
        """
        Obtiene la distribución de tipos de ataques
        
        Returns:
            Dict con conteo por tipo de ataque
        """
        return self.df['alerta'].value_counts().to_dict()
    
    def get_timeline_data(self, interval: str = 'H') -> List[TimelineData]:
        """
        Genera datos de timeline de ataques
        
        Args:
            interval: Intervalo de agrupación ('H' hora, 'D' día)
            
        Returns:
            Lista de datos para timeline
        """
        if self.df.empty:
            return []
        
        # Agrupar por timestamp
        df_timeline = self.df.copy()
        df_timeline['time_group'] = df_timeline['timestamp'].dt.floor(interval)
        
        timeline = []
        for time_point, group in df_timeline.groupby('time_group'):
            ataques_detallados = group['alerta'].value_counts().to_dict()
            
            timeline.append(TimelineData(
                timestamp=time_point.strftime('%Y-%m-%d %H:%M:%S'),
                count=len(group),
                ataques_detallados=ataques_detallados
            ))
        
        return sorted(timeline, key=lambda x: x.timestamp)
    
    def get_port_analysis(self, top_n: int = 10) -> List[PortAnalysis]:
        """
        Analiza los puertos más atacados
        
        Args:
            top_n: Número de puertos a retornar
            
        Returns:
            Lista de análisis de puertos
        """
        if self.df.empty:
            return []
        
        port_data = self.df.groupby('puerto').agg({
            'ip_origen': lambda x: list(x.unique()),
            'protocolo': lambda x: list(x.unique()),
            'alerta': 'count'
        }).reset_index()
        
        port_data.columns = ['puerto', 'ips_origen', 'protocolos', 'total_intentos']
        port_data = port_data.nlargest(top_n, 'total_intentos')
        
        resultados = []
        for _, row in port_data.iterrows():
            port_info = get_scada_port_info(row['puerto'])
            
            resultados.append(PortAnalysis(
                puerto=row['puerto'],
                total_intentos=int(row['total_intentos']),
                ips_origen=row['ips_origen'][:5],  # Limitar a 5 IPs
                protocolos=row['protocolos'],
                es_scada_critico=port_info['es_scada'],
                descripcion_servicio=port_info['servicio']
            ))
        
        return resultados
    
    def get_attack_patterns(self) -> List[AttackPattern]:
        """
        Detecta patrones de ataque en los datos
        
        Returns:
            Lista de patrones identificados
        """
        if self.df.empty:
            return []
        
        total_ataques = len(self.df)
        patterns = []
        
        for tipo_ataque, group in self.df.groupby('alerta'):
            frecuencia = len(group)
            porcentaje = (frecuencia / total_ataques) * 100
            
            # Determinar horario pico
            hourly = group.groupby(group['timestamp'].dt.hour).size()
            hora_pico = hourly.idxmax()
            
            # Clasificar severidad
            if porcentaje > 40:
                severidad = RiskLevel.CRITICAL
            elif porcentaje > 25:
                severidad = RiskLevel.HIGH
            elif porcentaje > 15:
                severidad = RiskLevel.MEDIUM
            else:
                severidad = RiskLevel.LOW
            
            patterns.append(AttackPattern(
                tipo_ataque=tipo_ataque,
                frecuencia=frecuencia,
                porcentaje=round(porcentaje, 2),
                ips_involucradas=group['ip_origen'].unique().tolist()[:10],
                horario_pico=f"{hora_pico}:00 - {hora_pico+1}:00",
                severidad=severidad
            ))
        
        return sorted(patterns, key=lambda x: x.frecuencia, reverse=True)
    
    def _generate_recommendations(self, tipos_ataques: List[str], puertos: List[int]) -> List[str]:
        """
        Genera recomendaciones específicas basadas en el análisis
        
        Args:
            tipos_ataques: Lista de tipos de ataques detectados
            puertos: Lista de puertos afectados
            
        Returns:
            Lista de recomendaciones
        """
        recommendations = ["Bloquear IP en firewall perimetral inmediatamente"]
        
        if "SQL Injection" in tipos_ataques:
            recommendations.append("Revisar logs del WAF y parametrización de consultas SQL")
            recommendations.append("Implementar validación de entrada en aplicaciones web")
        
        if "Brute force SSH" in tipos_ataques:
            recommendations.append("Implementar Fail2Ban con umbral de 3 intentos")
            recommendations.append("Cambiar puerto SSH por defecto (22) y usar autenticación por clave")
        
        if "Port scan" in tipos_ataques:
            recommendations.append("Configurar IPS para bloqueo automático de escaneos")
            recommendations.append("Implementar rate limiting en firewall")
        
        # Recomendaciones específicas SCADA
        scada_ports = [p for p in puertos if get_scada_port_info(p)['es_scada']]
        if scada_ports:
            recommendations.append(f"⚠️ CRÍTICO: Puertos SCADA comprometidos ({scada_ports})")
            recommendations.append("Segregar red SCADA en VLAN aislada sin acceso a Internet")
            recommendations.append("Activar monitoreo 24/7 en sistemas de control industrial")
        
        return recommendations
