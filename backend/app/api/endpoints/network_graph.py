"""
Endpoints para grafo de red de ataques
"""
from fastapi import APIRouter, HTTPException
from ...services.network_graph import NetworkGraphGenerator
from ...utils.data_loader import data_loader

router = APIRouter()


@router.get("/graph/attack-network")
async def get_attack_network_graph():
    """
    Obtiene estructura de grafo de red de ataques
    para visualización (compatible con D3.js, Cytoscape, etc.)
    """
    df = data_loader.load_data()
    
    if df.empty:
        raise HTTPException(status_code=500, detail="No hay datos para generar grafo")
    
    generator = NetworkGraphGenerator(df)
    graph = generator.generate_attack_graph()
    
    return graph


@router.get("/graph/attack-paths")
async def get_attack_paths():
    """
    Identifica rutas de ataque más comunes
    """
    df = data_loader.load_data()
    
    if df.empty:
        return {'paths': []}
    
    # Analizar secuencias de ataques
    paths = []
    
    for ip_origen in df['ip_origen'].unique():
        ip_attacks = df[df['ip_origen'] == ip_origen].sort_values('timestamp')
        
        if len(ip_attacks) > 3:
            path = {
                'attacker': ip_origen,
                'targets': ip_attacks['ip_destino'].unique().tolist(),
                'sequence': [
                    {
                        'target': row['ip_destino'],
                        'port': int(row['puerto']),
                        'attack': row['alerta'],
                        'time': row['timestamp'].isoformat()
                    }
                    for _, row in ip_attacks.head(10).iterrows()
                ],
                'total_steps': len(ip_attacks),
                'duration': str(ip_attacks['timestamp'].max() - ip_attacks['timestamp'].min())
            }
            paths.append(path)
    
    # Ordenar por número de pasos (más sofisticados primero)
    paths.sort(key=lambda x: x['total_steps'], reverse=True)
    
    return {
        'total_paths': len(paths),
        'paths': paths[:10]  # Top 10
    }


@router.get("/graph/hotspots")
async def get_attack_hotspots():
    """
    Identifica IPs más atacadas (hotspots)
    """
    df = data_loader.load_data()
    
    if df.empty:
        return {'hotspots': []}
    
    target_stats = df.groupby('ip_destino').agg({
        'ip_origen': 'nunique',
        'alerta': 'count',
        'puerto': lambda x: list(x.unique())
    }).reset_index()
    
    target_stats.columns = ['ip', 'unique_attackers', 'total_attacks', 'ports_targeted']
    target_stats = target_stats.sort_values('total_attacks', ascending=False)
    
    hotspots = []
    for _, row in target_stats.head(10).iterrows():
        hotspots.append({
            'ip': row['ip'],
            'total_attacks': int(row['total_attacks']),
            'unique_attackers': int(row['unique_attackers']),
            'ports_targeted': row['ports_targeted'][:10],
            'severity': 'Crítico' if row['unique_attackers'] > 3 else 'Alto' if row['unique_attackers'] > 1 else 'Medio'
        })
    
    return {
        'total_hotspots': len(hotspots),
        'hotspots': hotspots
    }
