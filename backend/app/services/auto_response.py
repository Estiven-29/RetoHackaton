"""
Sistema de respuesta automatizada a amenazas
"""
from typing import List, Dict
from datetime import datetime
from ..api.models.schemas import SuspiciousIP


class AutoResponseSystem:
    """Sistema de respuesta automática a incidentes"""
    
    def __init__(self):
        self.actions_log = []
    
    def generate_firewall_rules(self, ips: List[SuspiciousIP]) -> Dict:
        """Genera reglas de firewall listas para aplicar"""
        
        # Filtrar solo IPs de alto y crítico riesgo
        high_risk_ips = [
            ip for ip in ips 
            if ip.nivel_riesgo in ['Alto', 'Crítico']
        ]
        
        rules = {
            'iptables': [],
            'cisco_asa': [],
            'windows_firewall': [],
            'pfsense': []
        }
        
        for ip_obj in high_risk_ips:
            ip = ip_obj.ip
            
            # iptables (Linux)
            rules['iptables'].append(
                f"iptables -A INPUT -s {ip} -j DROP  # Bloquear {ip} - {ip_obj.nivel_riesgo}"
            )
            
            # Cisco ASA
            rules['cisco_asa'].append(
                f"access-list OUTSIDE_IN deny ip host {ip} any  ! Bloquear {ip}"
            )
            
            # Windows Firewall (PowerShell)
            rules['windows_firewall'].append(
                f'New-NetFirewallRule -DisplayName "Block {ip}" -Direction Inbound -RemoteAddress {ip} -Action Block'
            )
            
            # pfSense (FreeBSD)
            rules['pfsense'].append(
                f"block in quick on wan from {ip} to any  # {ip_obj.nivel_riesgo}"
            )
        
        return {
            'generated_at': datetime.now().isoformat(),
            'total_rules': len(high_risk_ips),
            'rules': rules,
            'apply_instructions': self._get_apply_instructions(),
            'rollback_script': self._generate_rollback_script(high_risk_ips)
        }
    
    def generate_fail2ban_config(self, ips: List[SuspiciousIP]) -> str:
        """Genera configuración de Fail2Ban"""
        
        config = """# Fail2Ban configuration for IDS SCADA Dashboard
# Generated at: {timestamp}

[ids-scada-protection]
enabled = true
port = all
filter = ids-scada
logpath = /var/log/scada/*.log
maxretry = 3
bantime = 86400
findtime = 3600

# IPs to ban immediately (from ML detection)
banip = {banned_ips}

action = %(action_mwl)s
         %(action_)s

# Email notification
destemail = security@company.com
sender = fail2ban@scada-plant.com
""".format(
            timestamp=datetime.now().isoformat(),
            banned_ips=', '.join([ip.ip for ip in ips[:10]])
        )
        
        return config
    
    def generate_remediation_playbook(self, ip: SuspiciousIP) -> Dict:
        """Genera playbook de remediación paso a paso"""
        
        playbook = {
            'incident_id': f"INC-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
            'target_ip': ip.ip,
            'severity': ip.nivel_riesgo,
            'steps': []
        }
        
        # Paso 1: Verificación inicial
        playbook['steps'].append({
            'step': 1,
            'phase': 'Identificación',
            'action': 'Verificar IP en sistemas',
            'commands': [
                f"ping {ip.ip} -c 4",
                f"nslookup {ip.ip}",
                f"whois {ip.ip}",
                f"grep -r '{ip.ip}' /var/log/firewall/*.log"
            ],
            'expected_duration': '2 minutos'
        })
        
        # Paso 2: Contención
        playbook['steps'].append({
            'step': 2,
            'phase': 'Contención',
            'action': 'Bloquear IP en firewall',
            'commands': [
                f"iptables -A INPUT -s {ip.ip} -j DROP",
                f"iptables -A OUTPUT -d {ip.ip} -j DROP",
                "iptables-save > /etc/iptables/rules.v4"
            ],
            'validation': f"iptables -L -n | grep {ip.ip}",
            'expected_duration': '1 minuto'
        })
        
        # Paso 3: Análisis específico según tipo de ataque
        for attack_type in ip.tipos_ataques:
            if attack_type == "SQL Injection":
                playbook['steps'].append({
                    'step': len(playbook['steps']) + 1,
                    'phase': 'Análisis',
                    'action': 'Revisar logs de aplicaciones web',
                    'commands': [
                        "grep -i 'select\\|union\\|drop' /var/log/apache2/access.log | tail -50",
                        "grep -i 'sql' /var/log/webapp/error.log"
                    ],
                    'expected_duration': '5 minutos'
                })
            
            elif attack_type == "Brute force SSH":
                playbook['steps'].append({
                    'step': len(playbook['steps']) + 1,
                    'phase': 'Análisis',
                    'action': 'Revisar intentos SSH fallidos',
                    'commands': [
                        f"grep 'Failed password' /var/log/auth.log | grep {ip.ip}",
                        "lastb | head -20"
                    ],
                    'expected_duration': '3 minutos'
                })
        
        # Paso 4: Notificación
        playbook['steps'].append({
            'step': len(playbook['steps']) + 1,
            'phase': 'Notificación',
            'action': 'Alertar al equipo de seguridad',
            'commands': [
                f"echo 'Bloqueada IP {ip.ip} - Nivel: {ip.nivel_riesgo}' | mail -s 'Alerta SCADA' security@company.com"
            ],
            'expected_duration': '1 minuto'
        })
        
        # Paso 5: Documentación
        playbook['steps'].append({
            'step': len(playbook['steps']) + 1,
            'phase': 'Documentación',
            'action': 'Registrar incidente',
            'commands': [
                f"echo '[{datetime.now()}] Bloqueada {ip.ip} - {ip.nivel_riesgo} - Ataques: {ip.total_ataques}' >> /var/log/incidents.log"
            ],
            'expected_duration': '2 minutos'
        })
        
        playbook['total_estimated_time'] = f"{sum(self._parse_duration(step.get('expected_duration', '0 minutos')) for step in playbook['steps'])} minutos"
        
        return playbook
    
    def simulate_attack_scenario(self, attack_type: str, target: str) -> Dict:
        """Simula un escenario de ataque y calcula impacto"""
        
        scenarios = {
            'SQL Injection': {
                'name': 'Inyección SQL en HMI Web',
                'target_systems': ['Base de datos de historiado', 'Panel de control web'],
                'potential_impact': [
                    'Extracción de credenciales de operadores',
                    'Modificación de setpoints críticos',
                    'Acceso a datos de producción sensibles'
                ],
                'estimated_downtime': '2-4 horas',
                'business_impact': 'Alto - Posible parada de planta',
                'data_at_risk': 'Credenciales, configuraciones PLC, datos operativos',
                'mitigation_steps': [
                    'Aislar servidor web inmediatamente',
                    'Cambiar credenciales de base de datos',
                    'Revisar logs de accesos recientes',
                    'Restaurar desde backup si es necesario'
                ],
                'recovery_time': '4-6 horas'
            },
            'Port scan': {
                'name': 'Reconocimiento de Red SCADA',
                'target_systems': ['Toda la red OT', 'PLCs', 'HMIs'],
                'potential_impact': [
                    'Mapeo completo de infraestructura',
                    'Identificación de servicios vulnerables',
                    'Preparación para ataque dirigido'
                ],
                'estimated_downtime': '0 horas (reconocimiento)',
                'business_impact': 'Medio - Precursor de ataques mayores',
                'data_at_risk': 'Topología de red, versiones de software',
                'mitigation_steps': [
                    'Bloquear IP origen inmediatamente',
                    'Activar IPS en modo preventivo',
                    'Revisar segmentación de red',
                    'Auditar servicios expuestos'
                ],
                'recovery_time': '1-2 horas'
            },
            'Brute force SSH': {
                'name': 'Fuerza Bruta en Acceso SSH',
                'target_systems': ['Servidores SCADA', 'Gateways industriales'],
                'potential_impact': [
                    'Acceso no autorizado a sistemas críticos',
                    'Instalación de backdoors',
                    'Escalación de privilegios'
                ],
                'estimated_downtime': '1-3 horas si tiene éxito',
                'business_impact': 'Crítico - Control total del sistema',
                'data_at_risk': 'Acceso root, configuraciones de sistema',
                'mitigation_steps': [
                    'Bloquear IP con fail2ban',
                    'Cambiar puerto SSH por defecto',
                    'Implementar autenticación por clave',
                    'Limitar acceso SSH por whitelist'
                ],
                'recovery_time': '2-4 horas'
            }
        }
        
        scenario = scenarios.get(attack_type, {
            'name': 'Ataque Genérico',
            'target_systems': [target],
            'potential_impact': ['Impacto no especificado'],
            'estimated_downtime': 'Desconocido',
            'business_impact': 'Requiere análisis',
            'data_at_risk': 'Por determinar',
            'mitigation_steps': ['Iniciar protocolo de respuesta estándar'],
            'recovery_time': 'Por determinar'
        })
        
        scenario['simulation_timestamp'] = datetime.now().isoformat()
        scenario['target'] = target
        scenario['attack_type'] = attack_type
        
        return scenario
    
    def _get_apply_instructions(self) -> Dict:
        """Instrucciones para aplicar reglas"""
        return {
            'iptables': {
                'apply': 'Ejecutar comandos en terminal con sudo',
                'persist': 'sudo iptables-save > /etc/iptables/rules.v4',
                'verify': 'sudo iptables -L -n'
            },
            'cisco_asa': {
                'apply': 'Copiar comandos en modo configuración',
                'persist': 'write memory',
                'verify': 'show access-list OUTSIDE_IN'
            },
            'windows_firewall': {
                'apply': 'Ejecutar en PowerShell como Administrador',
                'persist': 'Las reglas persisten automáticamente',
                'verify': 'Get-NetFirewallRule | Where-Object {$_.DisplayName -like "Block*"}'
            }
        }
    
    def _generate_rollback_script(self, ips: List[SuspiciousIP]) -> List[str]:
        """Genera script para revertir cambios"""
        rollback = []
        for ip_obj in ips:
            ip = ip_obj.ip
            rollback.append(f"iptables -D INPUT -s {ip} -j DROP")
        rollback.append("echo 'Rollback completado'")
        return rollback
    
    def _parse_duration(self, duration_str: str) -> int:
        """Parse duration string to minutes"""
        try:
            return int(duration_str.split()[0])
        except:
            return 0
