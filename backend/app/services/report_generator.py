"""
Generador de reportes ejecutivos
"""
import pandas as pd
from datetime import datetime
from typing import List
from ..api.models.schemas import ReportData, Recommendation, RiskLevel, SuspiciousIP
from ..utils.helpers import format_datetime_range


class ReportGenerator:
    """Generador de reportes de seguridad"""
    
    def __init__(self, df: pd.DataFrame):
        self.df = df
    
    def generate_executive_report(
        self, 
        ips_sospechosas: List[SuspiciousIP],
        attack_distribution: dict
    ) -> ReportData:
        """
        Genera reporte ejecutivo completo
        
        Args:
            ips_sospechosas: Lista de IPs identificadas como sospechosas
            attack_distribution: Distribución de tipos de ataques
            
        Returns:
            Datos estructurados del reporte
        """
        # Periodo de análisis
        if not self.df.empty:
            fecha_inicio = self.df['timestamp'].min()
            fecha_fin = self.df['timestamp'].max()
            periodo = format_datetime_range(fecha_inicio, fecha_fin)
        else:
            periodo = "Sin datos"
        
        # Resumen ejecutivo
        total_ataques = len(self.df)
        ips_unicas = self.df['ip_origen'].nunique() if not self.df.empty else 0
        
        resumen = f"""
        Durante el período analizado se detectaron {total_ataques} intentos de intrusión 
        desde {ips_unicas} direcciones IP únicas. Se identificaron {len(ips_sospechosas)} 
        IPs con comportamiento altamente sospechoso que requieren acción inmediata.
        
        Los vectores de ataque principales fueron: {', '.join(list(attack_distribution.keys())[:3])}.
        """
        
        # Hallazgos principales
        hallazgos = self._generate_key_findings(ips_sospechosas, attack_distribution)
        
        # Recomendaciones estratégicas
        recomendaciones = self._generate_strategic_recommendations(ips_sospechosas)
        
        # Métricas clave
        metricas = {
            'total_ataques': total_ataques,
            'ips_bloqueadas_sugeridas': len(ips_sospechosas),
            'vectores_ataque_unicos': len(attack_distribution),
            'nivel_riesgo_general': self._calculate_overall_risk(ips_sospechosas)
        }
        
        return ReportData(
            fecha_generacion=datetime.now(),
            periodo_analisis=periodo,
            resumen_ejecutivo=resumen.strip(),
            hallazgos_principales=hallazgos,
            ips_bloqueadas_sugeridas=ips_sospechosas[:10],  # Top 10
            recomendaciones=recomendaciones,
            metricas_clave=metricas
        )
    
    def _generate_key_findings(
        self, 
        ips: List[SuspiciousIP], 
        attacks: dict
    ) -> List[str]:
        """Genera hallazgos clave del análisis"""
        findings = []
        
        if ips:
            top_attacker = ips[0]
            findings.append(
                f"IP más agresiva: {top_attacker.ip} con {top_attacker.total_ataques} "
                f"ataques ({top_attacker.nivel_riesgo})"
            )
        
        if attacks:
            most_common = max(attacks.items(), key=lambda x: x[1])
            findings.append(
                f"Vector de ataque predominante: {most_common[0]} "
                f"({most_common[1]} ocurrencias)"
            )
        
        # Detectar si hay ataques a infraestructura SCADA
        if not self.df.empty:
            scada_attacks = self.df[self.df['puerto'].isin([502, 102, 2404, 20000])]
            if len(scada_attacks) > 0:
                findings.append(
                    f"⚠️ CRÍTICO: {len(scada_attacks)} ataques dirigidos a puertos "
                    "SCADA/ICS detectados"
                )
        
        return findings
    
    def _generate_strategic_recommendations(
        self, 
        ips: List[SuspiciousIP]
    ) -> List[Recommendation]:
        """Genera recomendaciones estratégicas"""
        recommendations = []
        
        # Recomendación 1: Bloqueo inmediato
        if ips:
            high_risk_ips = [ip for ip in ips if ip.nivel_riesgo == RiskLevel.HIGH]
            if high_risk_ips:
                recommendations.append(Recommendation(
                    prioridad=RiskLevel.CRITICAL,
                    categoria="Respuesta Inmediata",
                    titulo="Bloqueo de IPs de Alto Riesgo",
                    descripcion=f"Se identificaron {len(high_risk_ips)} direcciones IP "
                                "con actividad maliciosa confirmada.",
                    acciones=[
                        "Implementar reglas de bloqueo en firewall perimetral",
                        "Configurar bloqueo automático en IPS/IDS",
                        "Notificar al SOC y equipo de respuesta a incidentes"
                    ],
                    recursos_scada=[
                        "Firewall principal de planta",
                        "Sistema IPS Cisco/Fortinet",
                        "SIEM central"
                    ]
                ))
        
        # Recomendación 2: Segmentación de red
        recommendations.append(Recommendation(
            prioridad=RiskLevel.HIGH,
            categoria="Arquitectura de Seguridad",
            titulo="Segmentación de Red SCADA",
            descripcion="Implementar aislamiento estricto de la red de control industrial.",
            acciones=[
                "Crear VLAN dedicada para sistemas SCADA (sin acceso a Internet)",
                "Implementar firewall de capa 7 entre IT y OT",
                "Establecer whitelist de comunicaciones permitidas"
            ],
            recursos_scada=[
                "PLCs Siemens S7-1500",
                "HMI WinCC",
                "Servidores de historiado"
            ]
        ))
        
        # Recomendación 3: Monitoreo continuo
        recommendations.append(Recommendation(
            prioridad=RiskLevel.MEDIUM,
            categoria="Monitoreo y Detección",
            titulo="Implementar Monitoreo Continuo",
            descripcion="Establecer capacidades de detección 24/7 con alertas automatizadas.",
            acciones=[
                "Configurar dashboards en tiempo real",
                "Establecer umbrales de alerta automática",
                "Integrar logs con SIEM corporativo"
            ],
            recursos_scada=[
                "Sistema SCADA principal",
                "Switches industriales gestionados",
                "Servidor de logs centralizado"
            ]
        ))
        
        return recommendations
    
    def _calculate_overall_risk(self, ips: List[SuspiciousIP]) -> str:
        """Calcula nivel de riesgo general del sistema"""
        if not ips:
            return "Bajo"
        
        risk_scores = {
            RiskLevel.CRITICAL: 4,
            RiskLevel.HIGH: 3,
            RiskLevel.MEDIUM: 2,
            RiskLevel.LOW: 1
        }
        
        avg_score = sum(risk_scores.get(ip.nivel_riesgo, 1) for ip in ips) / len(ips)
        
        if avg_score >= 3:
            return "Crítico"
        elif avg_score >= 2:
            return "Alto"
        elif avg_score >= 1.5:
            return "Medio"
        return "Bajo"
