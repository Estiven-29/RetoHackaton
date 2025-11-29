"""
Generador de grafo de red de ataques
"""
from typing import Dict, List
import pandas as pd


class NetworkGraphGenerator:
    """Genera datos para visualización de grafo de red"""
    
    def __init__(self, df: pd.DataFrame):
        self.df = df
    
    def generate_attack_graph(self) -> Dict:
        """Genera estructura de grafo de ataques"""
        if self.df.empty:
            return {'nodes': [], 'edges': []}
        
        nodes = []
        edges = []
        node_ids = {}
        current_id = 0
        
        # Crear nodos para IPs únicas (origen y destino)
        all_ips = pd.concat([self.df['ip_origen'], self.df['ip_destino']]).unique()
        
        for ip in all_ips:
            # Determinar si es atacante o objetivo
            is_attacker = ip in self.df['ip_origen'].values
            is_target = ip in self.df['ip_destino'].values
            
            attack_count = len(self.df[self.df['ip_origen'] == ip]) if is_attacker else 0
            target_count = len(self.df[self.df['ip_destino'] == ip]) if is_target else 0
            
            node_type = 'attacker' if is_attacker and not is_target else \
                       'target' if is_target and not is_attacker else \
                       'both'
            
            nodes.append({
                'id': current_id,
                'label': ip,
                'type': node_type,
                'attacks_sent': attack_count,
                'attacks_received': target_count,
                'size': max(attack_count, target_count, 5),
                'color': self._get_node_color(node_type, attack_count)
            })
            
            node_ids[ip] = current_id
            current_id += 1
        
        # Crear edges (conexiones)
        for _, row in self.df.iterrows():
            source_id = node_ids[row['ip_origen']]
            target_id = node_ids[row['ip_destino']]
            
            # Buscar si ya existe este edge
            existing_edge = next(
                (e for e in edges if e['source'] == source_id and e['target'] == target_id),
                None
            )
            
            if existing_edge:
                existing_edge['weight'] += 1
                existing_edge['attacks'].append(row['alerta'])
            else:
                edges.append({
                    'source': source_id,
                    'target': target_id,
                    'weight': 1,
                    'attacks': [row['alerta']],
                    'protocol': row['protocolo'],
                    'port': int(row['puerto'])
                })
        
        # Agregar metadata de edges
        for edge in edges:
            edge['color'] = self._get_edge_color(edge['weight'])
            edge['width'] = min(edge['weight'] / 2, 10)
            edge['attack_types'] = list(set(edge['attacks']))
        
        return {
            'nodes': nodes,
            'edges': edges,
            'stats': {
                'total_nodes': len(nodes),
                'total_edges': len(edges),
                'attackers': len([n for n in nodes if n['type'] in ['attacker', 'both']]),
                'targets': len([n for n in nodes if n['type'] in ['target', 'both']]),
                'total_connections': sum(e['weight'] for e in edges)
            }
        }
    
    def _get_node_color(self, node_type: str, attack_count: int) -> str:
        """Determina color del nodo"""
        if node_type == 'attacker':
            if attack_count > 20:
                return '#dc2626'  # Rojo oscuro
            elif attack_count > 10:
                return '#f97316'  # Naranja
            return '#fbbf24'  # Amarillo
        elif node_type == 'target':
            return '#3b82f6'  # Azul
        else:
            return '#8b5cf6'  # Púrpura (ambos)
    
    def _get_edge_color(self, weight: int) -> str:
        """Determina color del edge según peso"""
        if weight > 10:
            return '#dc2626'
        elif weight > 5:
            return '#f97316'
        return '#94a3b8'
