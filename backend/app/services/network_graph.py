"""
Generador de grafo de red de ataques
"""
import pandas as pd
from typing import Dict, List


class NetworkGraphGenerator:
    """Genera estructura de grafo de red para visualización"""
    
    def __init__(self, df: pd.DataFrame):
        self.df = df
    
    def generate_attack_graph(self) -> Dict:
        """
        Genera estructura de grafo con nodos y edges
        Compatible con D3.js, Cytoscape, vis.js
        """
        if self.df.empty:
            return {
                'nodes': [],
                'edges': [],
                'stats': {
                    'total_nodes': 0,
                    'total_edges': 0,
                    'attackers': 0,
                    'targets': 0
                }
            }
        
        nodes = []
        edges = []
        node_dict = {}
        
        # Crear nodos para IPs origen (atacantes)
        for ip in self.df['ip_origen'].unique():
            if ip not in node_dict:
                attacks_sent = len(self.df[self.df['ip_origen'] == ip])
                attacks_received = len(self.df[self.df['ip_destino'] == ip])
                
                # Determinar tipo de nodo
                if attacks_sent > 0 and attacks_received > 0:
                    node_type = 'both'
                elif attacks_sent > 0:
                    node_type = 'attacker'
                else:
                    node_type = 'target'
                
                node_dict[ip] = {
                    'id': ip,
                    'label': ip,
                    'type': node_type,
                    'attacks_sent': attacks_sent,
                    'attacks_received': attacks_received
                }
        
        # Crear nodos para IPs destino (objetivos)
        for ip in self.df['ip_destino'].unique():
            if ip not in node_dict:
                attacks_sent = len(self.df[self.df['ip_origen'] == ip])
                attacks_received = len(self.df[self.df['ip_destino'] == ip])
                
                # Determinar tipo de nodo
                if attacks_sent > 0 and attacks_received > 0:
                    node_type = 'both'
                elif attacks_received > 0:
                    node_type = 'target'
                else:
                    node_type = 'attacker'
                
                node_dict[ip] = {
                    'id': ip,
                    'label': ip,
                    'type': node_type,
                    'attacks_sent': attacks_sent,
                    'attacks_received': attacks_received
                }
        
        nodes = list(node_dict.values())
        
        # Crear edges (conexiones)
        edge_dict = {}
        for _, row in self.df.iterrows():
            source = row['ip_origen']
            target = row['ip_destino']
            edge_key = f"{source}-{target}"
            
            if edge_key not in edge_dict:
                edge_dict[edge_key] = {
                    'source': source,
                    'target': target,
                    'weight': 1,
                    'attacks': [row['alerta']],
                    'ports': [int(row['puerto'])]
                }
            else:
                edge_dict[edge_key]['weight'] += 1
                edge_dict[edge_key]['attacks'].append(row['alerta'])
                edge_dict[edge_key]['ports'].append(int(row['puerto']))
        
        # Consolidar edges
        for edge in edge_dict.values():
            edge['attacks'] = list(set(edge['attacks']))[:5]  # Top 5 tipos
            edge['ports'] = list(set(edge['ports']))[:10]      # Top 10 puertos
            edges.append(edge)
        
        # Estadísticas
        attackers = len([n for n in nodes if n['type'] in ['attacker', 'both']])
        targets = len([n for n in nodes if n['type'] in ['target', 'both']])
        
        return {
            'nodes': nodes,
            'edges': edges,
            'stats': {
                'total_nodes': len(nodes),
                'total_edges': len(edges),
                'attackers': attackers,
                'targets': targets
            }
        }
