"""
Funciones auxiliares generales
"""
from typing import Dict, List
from datetime import datetime, timedelta
import re


def is_valid_ip(ip: str) -> bool:
    """
    Valida formato de dirección IP
    
    Args:
        ip: Cadena con la IP
        
    Returns:
        True si es válida
    """
    pattern = re.compile(r'^(\d{1,3}\.){3}\d{1,3}$')
    if not pattern.match(ip):
        return False
    return all(0 <= int(octet) <= 255 for octet in ip.split('.'))


def classify_ip_subnet(ip: str) -> str:
    """
    Clasifica la IP según su subred
    
    Args:
        ip: Dirección IP
        
    Returns:
        Tipo de subred
    """
    if ip.startswith('192.168.'):
        return 'Red Interna - Administración'
    elif ip.startswith('10.0.'):
        return 'Red Interna - SCADA/Control'
    elif ip.startswith('172.16.'):
        return 'Red Interna - DMZ'
    else:
        return 'Red Externa/Desconocida'


def get_scada_port_info(puerto: int) -> Dict[str, any]:
    """
    Obtiene información sobre puertos SCADA críticos
    
    Args:
        puerto: Número de puerto
        
    Returns:
        Dict con información del puerto
    """
    scada_ports = {
        502: {'servicio': 'Modbus TCP', 'criticidad': 'ALTA', 'protocolo': 'SCADA'},
        102: {'servicio': 'S7comm (Siemens)', 'criticidad': 'ALTA', 'protocolo': 'PLC'},
        2404: {'servicio': 'IEC 60870-5-104', 'criticidad': 'ALTA', 'protocolo': 'SCADA'},
        20000: {'servicio': 'DNP3', 'criticidad': 'ALTA', 'protocolo': 'SCADA'},
        44818: {'servicio': 'Ethernet/IP', 'criticidad': 'ALTA', 'protocolo': 'Industrial'},
        22: {'servicio': 'SSH', 'criticidad': 'MEDIA', 'protocolo': 'Administración'},
        80: {'servicio': 'HTTP', 'criticidad': 'MEDIA', 'protocolo': 'Web'},
        443: {'servicio': 'HTTPS', 'criticidad': 'MEDIA', 'protocolo': 'Web'},
    }
    
    if puerto in scada_ports:
        info = scada_ports[puerto].copy()
        info['puerto'] = puerto
        info['es_scada'] = info['protocolo'] in ['SCADA', 'PLC', 'Industrial']
        return info
    
    return {
        'puerto': puerto,
        'servicio': 'Desconocido',
        'criticidad': 'BAJA',
        'protocolo': 'Genérico',
        'es_scada': False
    }


def format_datetime_range(start: datetime, end: datetime) -> str:
    """
    Formatea rango de fechas para visualización
    
    Args:
        start: Fecha de inicio
        end: Fecha de fin
        
    Returns:
        String formateado
    """
    return f"{start.strftime('%d/%m/%Y %H:%M')} - {end.strftime('%d/%m/%Y %H:%M')}"


def calculate_trend(data: List[int]) -> str:
    """
    Calcula tendencia de una serie temporal simple
    
    Args:
        data: Lista de valores numéricos
        
    Returns:
        'ascendente', 'descendente' o 'estable'
    """
    if len(data) < 2:
        return 'estable'
    
    first_half = sum(data[:len(data)//2])
    second_half = sum(data[len(data)//2:])
    
    diff_percentage = ((second_half - first_half) / first_half * 100) if first_half > 0 else 0
    
    if diff_percentage > 10:
        return 'ascendente'
    elif diff_percentage < -10:
        return 'descendente'
    return 'estable'
