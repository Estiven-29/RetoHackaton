"""
Sistema de recomendaciones profesionales basado en frameworks internacionales
"""
from typing import List, Dict
from ..api.models.schemas import Recommendation, RiskLevel, SuspiciousIP


class ProfessionalRecommender:
    """Genera recomendaciones basadas en NIST, ISO 27001, IEC 62443"""
    
    def __init__(self):
        self.frameworks = {
            'NIST_CSF': 'NIST Cybersecurity Framework',
            'ISO_27001': 'ISO/IEC 27001:2022',
            'IEC_62443': 'IEC 62443 - Industrial Security',
            'CIS_CONTROLS': 'CIS Critical Security Controls'
        }
    
    def generate_recommendations(
        self, 
        ips_sospechosas: List[SuspiciousIP],
        attack_distribution: Dict[str, int],
        scada_targeted: bool = False
    ) -> List[Recommendation]:
        """Genera recomendaciones profesionales completas"""
        
        recommendations = []
        
        # 1. Recomendaciones basadas en NIST CSF
        recommendations.extend(self._nist_recommendations(ips_sospechosas, scada_targeted))
        
        # 2. Recomendaciones basadas en ISO 27001
        recommendations.extend(self._iso27001_recommendations(attack_distribution))
        
        # 3. Recomendaciones específicas IEC 62443 (SCADA)
        if scada_targeted:
            recommendations.extend(self._iec62443_recommendations())
        
        # 4. Recomendaciones operativas CIS Controls
        recommendations.extend(self._cis_recommendations(ips_sospechosas))
        
        return recommendations
    
    def _nist_recommendations(
        self, 
        ips: List[SuspiciousIP], 
        scada_targeted: bool
    ) -> List[Recommendation]:
        """Recomendaciones basadas en NIST Cybersecurity Framework"""
        recs = []
        
        # IDENTIFY
        recs.append(Recommendation(
            prioridad=RiskLevel.HIGH,
            categoria="NIST CSF - IDENTIFY (ID.AM)",
            titulo="Inventario de Activos Críticos SCADA",
            descripcion=f"Identificadas {len(ips)} fuentes de amenaza activas. Se requiere mapeo completo de activos críticos para evaluar superficie de ataque.",
            acciones=[
                "ID.AM-1: Inventariar todos los dispositivos físicos y sistemas conectados a la red SCADA",
                "ID.AM-2: Inventariar plataformas de software y aplicaciones dentro del entorno industrial",
                "ID.AM-3: Mapear flujos de comunicación organizacional entre sistemas IT/OT",
                "ID.AM-4: Catalogar recursos externos (proveedores, conexiones cloud)",
                "ID.AM-5: Priorizar recursos según criticidad operativa (ICS/SCADA primero)"
            ],
            recursos_scada=[
                "PLCs y RTUs en campo",
                "Servidores SCADA/HMI",
                "Switches industriales",
                "Gateways IT/OT",
                "Sistemas de historiado"
            ]
        ))
        
        # PROTECT
        recs.append(Recommendation(
            prioridad=RiskLevel.CRITICAL if scada_targeted else RiskLevel.HIGH,
            categoria="NIST CSF - PROTECT (PR.AC)",
            titulo="Control de Acceso y Segmentación de Red",
            descripcion="Implementar controles de acceso estrictos y segmentación de red según el modelo Purdue.",
            acciones=[
                "PR.AC-3: Implementar acceso remoto seguro mediante VPN con MFA",
                "PR.AC-4: Gestionar permisos de acceso según principio de mínimo privilegio",
                "PR.AC-5: Proteger integridad de red mediante segmentación (Modelo Purdue niveles 0-4)",
                "PR.AC-7: Autenticación de usuarios basada en certificados para acceso crítico",
                "PR.DS-5: Implementar protecciones contra data leaks en zona desmilitarizada (DMZ)"
            ],
            recursos_scada=[
                "Firewall industrial Nivel 2 (Control)",
                "Firewall Nivel 3 (Supervisión)",
                "Sistema NAC (Network Access Control)",
                "VPN concentrator",
                "Active Directory para OT"
            ]
        ))
        
        # DETECT
        recs.append(Recommendation(
            prioridad=RiskLevel.HIGH,
            categoria="NIST CSF - DETECT (DE.CM)",
            titulo="Monitoreo Continuo de Seguridad",
            descripcion="Establecer capacidades de detección continua y análisis de anomalías en tiempo real.",
            acciones=[
                "DE.CM-1: Monitorear red en busca de eventos y conexiones no autorizadas",
                "DE.CM-3: Monitorear actividad del personal para detectar eventos anómalos",
                "DE.CM-4: Detectar código malicioso mediante análisis de comportamiento",
                "DE.CM-7: Implementar monitoreo de acceso no autorizado físico y lógico",
                "DE.AE-3: Establecer baseline de operación normal para detectar desviaciones"
            ],
            recursos_scada=[
                "IDS/IPS industrial (CyberX, Nozomi, Claroty)",
                "SIEM con capacidades OT",
                "Herramienta de análisis de tráfico Modbus/DNP3",
                "Sistema de detección de anomalías basado en ML"
            ]
        ))
        
        # RESPOND
        if len(ips) > 0:
            recs.append(Recommendation(
                prioridad=RiskLevel.CRITICAL,
                categoria="NIST CSF - RESPOND (RS.AN)",
                titulo="Plan de Respuesta a Incidentes OT",
                descripcion=f"Respuesta inmediata requerida ante {len(ips)} amenazas activas identificadas.",
                acciones=[
                    "RS.AN-1: Analizar notificaciones de sistemas de detección (IDS actual)",
                    "RS.AN-2: Comprender impacto del incidente en operaciones críticas",
                    "RS.AN-3: Establecer forense para entender vectores de ataque",
                    "RS.MI-1: Contener incidente bloqueando IPs maliciosas identificadas",
                    "RS.MI-2: Mitigar vulnerabilidades explotadas mediante parches/workarounds",
                    "RS.CO-2: Notificar a stakeholders (Gerencia, CERT nacional si aplica)"
                ],
                recursos_scada=[
                    "Equipo de respuesta ICS-CERT",
                    "Procedimientos de aislamiento de red",
                    "Backup offline de configuraciones PLC",
                    "Plan de continuidad operativa"
                ]
            ))
        
        # RECOVER
        recs.append(Recommendation(
            prioridad=RiskLevel.MEDIUM,
            categoria="NIST CSF - RECOVER (RC.RP)",
            titulo="Planificación de Recuperación",
            descripcion="Establecer procedimientos de recuperación para restaurar operaciones tras incidente.",
            acciones=[
                "RC.RP-1: Ejecutar plan de recuperación durante o después del incidente",
                "RC.IM-1: Incorporar lecciones aprendidas en planes de respuesta",
                "RC.CO-3: Comunicar actividades de recuperación a stakeholders internos/externos"
            ],
            recursos_scada=[
                "Plan de recuperación ante desastres (DRP)",
                "Backups verificados de lógica PLC",
                "Procedimientos de reconstrucción de HMI",
                "Contactos de fabricantes para soporte"
            ]
        ))
        
        return recs
    
    def _iso27001_recommendations(self, attack_distribution: Dict[str, int]) -> List[Recommendation]:
        """Recomendaciones basadas en ISO/IEC 27001:2022"""
        recs = []
        
        recs.append(Recommendation(
            prioridad=RiskLevel.HIGH,
            categoria="ISO 27001 - A.8 Gestión de Activos",
            titulo="Clasificación y Control de Activos de Información",
            descripcion="Implementar control A.8.1.1 - Inventario de activos y A.8.1.2 - Propiedad de activos.",
            acciones=[
                "A.8.1.1: Mantener inventario actualizado de activos de información y OT",
                "A.8.1.2: Asignar propietarios (owners) a cada activo crítico",
                "A.8.1.3: Definir reglas de uso aceptable para sistemas SCADA",
                "A.8.2.1: Clasificar información según criticidad (Público, Interno, Confidencial, Crítico)"
            ],
            recursos_scada=[
                "Base de datos CMDB (Configuration Management Database)",
                "Sistema de gestión de activos OT",
                "Matriz RACI de responsabilidades"
            ]
        ))
        
        recs.append(Recommendation(
            prioridad=RiskLevel.HIGH,
            categoria="ISO 27001 - A.13 Seguridad de las Comunicaciones",
            titulo="Controles de Seguridad en Redes",
            descripcion="Implementar A.13.1 - Gestión de seguridad de redes y A.13.2 - Transferencia de información.",
            acciones=[
                "A.13.1.1: Implementar controles de red mediante segmentación física/lógica",
                "A.13.1.2: Definir políticas de seguridad para servicios de red",
                "A.13.1.3: Segregar redes IT de redes OT mediante DMZ industrial",
                "A.13.2.1: Establecer políticas de transferencia de información con cifrado"
            ],
            recursos_scada=[
                "Firewall de próxima generación (NGFW)",
                "Sistema de prevención de intrusiones (IPS)",
                "VPN con cifrado AES-256",
                "Data diodes para transferencia unidireccional"
            ]
        ))
        
        # Control específico para tipo de ataque dominante
        if attack_distribution:
            top_attack = max(attack_distribution.items(), key=lambda x: x[1])[0]
            
            if 'SQL' in top_attack:
                recs.append(Recommendation(
                    prioridad=RiskLevel.CRITICAL,
                    categoria="ISO 27001 - A.14 Seguridad en el Desarrollo",
                    titulo="Secure Coding - Prevención de Inyección SQL",
                    descripcion=f"Control A.14.2.5 ante {attack_distribution.get(top_attack, 0)} ataques de inyección SQL detectados.",
                    acciones=[
                        "A.14.2.1: Implementar política de desarrollo seguro",
                        "A.14.2.5: Usar prepared statements y parametrización de queries",
                        "A.14.2.8: Realizar pruebas de seguridad de sistemas (SAST/DAST)",
                        "Implementar WAF (Web Application Firewall) con reglas OWASP"
                    ],
                    recursos_scada=[
                        "Aplicaciones web SCADA/HMI",
                        "Servidor de bases de datos",
                        "WAF (ModSecurity, Cloudflare)"
                    ]
                ))
        
        return recs
    
    def _iec62443_recommendations(self) -> List[Recommendation]:
        """Recomendaciones específicas IEC 62443 para sistemas industriales"""
        recs = []
        
        recs.append(Recommendation(
            prioridad=RiskLevel.CRITICAL,
            categoria="IEC 62443-3-3 - Security Levels (SL)",
            titulo="Establecer Security Level Target para Zona SCADA",
            descripcion="Definir SL-T (Security Level Target) mínimo de SL2 para red de control.",
            acciones=[
                "SR 1.1: Identificación y autenticación de usuarios mediante autenticación multifactor",
                "SR 1.2: Restricción de uso basada en roles (RBAC) para operadores",
                "SR 1.3: Integridad del sistema mediante firma digital de firmware PLC",
                "SR 2.1: Protección contra código malicioso en estaciones de ingeniería",
                "SR 3.1: Integridad de comunicaciones mediante protocolos seguros (TLS para Modbus)",
                "SR 3.3: Segmentación de red mediante firewall industrial conforme Purdue"
            ],
            recursos_scada=[
                "Zona 0: Sensores y actuadores",
                "Zona 1: PLCs y controladores",
                "Zona 2: SCADA/HMI servers",
                "Zona 3: DMZ industrial",
                "Conduit (firewall) entre zonas"
            ]
        ))
        
        recs.append(Recommendation(
            prioridad=RiskLevel.HIGH,
            categoria="IEC 62443-2-1 - CSMS Program",
            titulo="Cybersecurity Management System (CSMS) para OT",
            descripcion="Establecer programa de gestión de ciberseguridad industrial según IEC 62443-2-1.",
            acciones=[
                "4.2.3.1: Identificar y documentar zonas y conductos de red industrial",
                "4.2.3.4: Implementar gestión de riesgos específica para ICS",
                "4.2.3.6: Monitorear ambiente de amenazas ICS (alertas ICS-CERT)",
                "4.2.3.9: Establecer procedimientos de respuesta a incidentes OT",
                "4.2.4.1: Implementar gestión de identidades para sistemas OT",
                "4.3.2.6.7: Gestionar vulnerabilidades con ventana de parcheo extendida (testing previo)"
            ],
            recursos_scada=[
                "Equipo CSMS multidisciplinario (IT + OT + Operaciones)",
                "Políticas de seguridad ICS",
                "Matriz de riesgos específica OT",
                "Laboratorio de testing para patches"
            ]
        ))
        
        recs.append(Recommendation(
            prioridad=RiskLevel.HIGH,
            categoria="IEC 62443-4-2 - Component Requirements",
            titulo="Hardening de Componentes Industriales",
            descripcion="Aplicar requisitos técnicos de seguridad a componentes individuales (PLCs, HMIs, switches).",
            acciones=[
                "CR 1.1: Autenticación humano-componente (passwords fuertes en PLCs)",
                "CR 2.1: Protección contra malware en estaciones de ingeniería",
                "CR 3.1: Integridad de datos en tránsito (cifrado Modbus TCP)",
                "CR 7.1: Deshabilitar/remover funciones innecesarias (puertos, servicios)",
                "CR 7.6: Establecer monitoreo de eventos de seguridad en switches industriales"
            ],
            recursos_scada=[
                "PLCs Siemens S7-1500, Allen-Bradley ControlLogix",
                "HMI Schneider Electric Vijeo, Siemens WinCC",
                "Switches industriales Cisco IE, Hirschmann",
                "Protocolos: Modbus TCP, Ethernet/IP, PROFINET"
            ]
        ))
        
        return recs
    
    def _cis_recommendations(self, ips: List[SuspiciousIP]) -> List[Recommendation]:
        """Recomendaciones operativas basadas en CIS Controls"""
        recs = []
        
        if len(ips) > 0:
            recs.append(Recommendation(
                prioridad=RiskLevel.CRITICAL,
                categoria="CIS Control 13 - Network Monitoring",
                titulo="Implementación de Monitoreo de Red Industrial",
                descripcion=f"CIS Control 13.1 ante {len(ips)} amenazas activas - Centralizar colección de logs de seguridad.",
                acciones=[
                    "CIS 13.1: Centralizar logs de red en SIEM con capacidad OT (Splunk, QRadar, Elastic)",
                    "CIS 13.2: Implementar IDS para tráfico de red OT (Zeek, Suricata con reglas ICS)",
                    "CIS 13.3: Establecer baseline de comportamiento normal de red",
                    "CIS 13.6: Colectar logs de DNS queries (detectar C2, exfiltración)",
                    "CIS 13.7: Implementar proxy para tráfico saliente de red OT"
                ],
                recursos_scada=[
                    "SIEM con parser para protocolos industriales",
                    "IDS industrial (Nozomi Networks, Claroty, Dragos)",
                    "Colectores de logs (syslog, WinEvent)",
                    "Span/mirror ports en switches para análisis"
                ]
            ))
        
        recs.append(Recommendation(
            prioridad=RiskLevel.HIGH,
            categoria="CIS Control 4 - Secure Configuration",
            titulo="Configuración Segura de Activos OT",
            descripcion="CIS Control 4 - Establecer y mantener configuración segura de sistemas industriales.",
            acciones=[
                "CIS 4.1: Establecer baseline de configuración segura para cada tipo de activo",
                "CIS 4.2: Cambiar credenciales por defecto en todos los dispositivos OT",
                "CIS 4.7: Gestionar configuraciones de sistemas mediante control de versiones",
                "CIS 4.8: Restringir binarios no autorizados (application whitelisting)"
            ],
            recursos_scada=[
                "Sistema de gestión de configuraciones (Ansible para OT)",
                "Repository Git para configuraciones PLC",
                "Herramienta de compliance (Nessus, Tenable.ot)"
            ]
        ))
        
        return recs


# Instancia global
professional_recommender = ProfessionalRecommender()
