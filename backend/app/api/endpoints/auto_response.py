"""
Endpoints de respuesta automatizada
"""
from fastapi import APIRouter, HTTPException, Body
from typing import List
from ...services.auto_response import AutoResponseSystem
from ...services.data_analyzer import DataAnalyzer
from ...utils.data_loader import data_loader
from ...api.models.schemas import SuspiciousIP

router = APIRouter()

auto_response = AutoResponseSystem()


@router.get("/response/firewall-rules")
async def generate_firewall_rules(min_risk_level: str = "Alto"):
    """
    Genera reglas de firewall para múltiples plataformas
    
    - **min_risk_level**: Nivel mínimo de riesgo (Alto, Crítico)
    """
    df = data_loader.load_data()
    
    if df.empty:
        raise HTTPException(status_code=500, detail="No hay datos")
    
    analyzer = DataAnalyzer(df)
    ips = analyzer.get_suspicious_ips()
    
    # Filtrar por nivel de riesgo
    if min_risk_level:
        ips = [ip for ip in ips if ip.nivel_riesgo in [min_risk_level, 'Crítico']]
    
    rules = auto_response.generate_firewall_rules(ips)
    
    return rules


@router.get("/response/fail2ban-config")
async def get_fail2ban_config():
    """
    Genera configuración de Fail2Ban lista para usar
    """
    df = data_loader.load_data()
    
    if df.empty:
        raise HTTPException(status_code=500, detail="No hay datos")
    
    analyzer = DataAnalyzer(df)
    ips = analyzer.get_suspicious_ips()
    
    config = auto_response.generate_fail2ban_config(ips[:20])
    
    return {
        'config_file': '/etc/fail2ban/jail.d/ids-scada.conf',
        'content': config,
        'ips_to_ban': [ip.ip for ip in ips[:20]],
        'instructions': [
            '1. Guardar contenido en /etc/fail2ban/jail.d/ids-scada.conf',
            '2. Ejecutar: sudo fail2ban-client reload',
            '3. Verificar: sudo fail2ban-client status ids-scada-protection'
        ]
    }


@router.get("/response/remediation-playbook/{ip}")
async def get_remediation_playbook(ip: str):
    """
    Genera playbook de remediación paso a paso para una IP
    
    - **ip**: Dirección IP maliciosa
    """
    df = data_loader.load_data()
    
    if df.empty:
        raise HTTPException(status_code=500, detail="No hay datos")
    
    analyzer = DataAnalyzer(df)
    ips = analyzer.get_suspicious_ips()
    
    target_ip = next((i for i in ips if i.ip == ip), None)
    
    if not target_ip:
        raise HTTPException(status_code=404, detail=f"IP {ip} no está en la lista de sospechosas")
    
    playbook = auto_response.generate_remediation_playbook(target_ip)
    
    return playbook


@router.post("/response/simulate-attack")
async def simulate_attack_scenario(
    attack_type: str = Body(..., embed=True),
    target: str = Body(..., embed=True)
):
    """
    Simula un escenario de ataque y calcula impacto
    
    - **attack_type**: Tipo de ataque (SQL Injection, Port scan, Brute force SSH)
    - **target**: Sistema objetivo
    """
    scenario = auto_response.simulate_attack_scenario(attack_type, target)
    
    return scenario


@router.get("/response/quick-actions")
async def get_quick_actions():
    """
    Obtiene acciones rápidas recomendadas para el estado actual
    """
    df = data_loader.load_data()
    
    if df.empty:
        return {'actions': []}
    
    analyzer = DataAnalyzer(df)
    ips = analyzer.get_suspicious_ips()
    
    critical_ips = [ip for ip in ips if ip.nivel_riesgo == 'Crítico']
    high_ips = [ip for ip in ips if ip.nivel_riesgo == 'Alto']
    
    actions = []
    
    if critical_ips:
        actions.append({
            'priority': 'CRÍTICA',
            'action': f'Bloquear {len(critical_ips)} IPs críticas inmediatamente',
            'command': f'iptables -A INPUT -s {critical_ips[0].ip} -j DROP',
            'affected_ips': [ip.ip for ip in critical_ips[:5]],
            'estimated_time': '1 minuto'
        })
    
    if high_ips:
        actions.append({
            'priority': 'ALTA',
            'action': f'Revisar {len(high_ips)} IPs de alto riesgo',
            'command': 'tail -f /var/log/firewall/blocked.log',
            'affected_ips': [ip.ip for ip in high_ips[:5]],
            'estimated_time': '5 minutos'
        })
    
    # Acción de monitoreo
    actions.append({
        'priority': 'MEDIA',
        'action': 'Activar monitoreo intensivo',
        'command': 'systemctl restart fail2ban && systemctl enable ids-monitor',
        'estimated_time': '2 minutos'
    })
    
    return {
        'total_actions': len(actions),
        'actions': actions,
        'generated_at': df['timestamp'].max().isoformat() if not df.empty else None
    }
