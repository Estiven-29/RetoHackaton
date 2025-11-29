"""
Gestor de múltiples datasets
"""
import pandas as pd
import os
import json
from datetime import datetime
from typing import List, Dict, Optional
from ..core.config import settings


class DatasetManager:
    """Gestiona múltiples datasets y su metadata"""
    
    def __init__(self):
        self.metadata_file = os.path.join(settings.UPLOAD_PATH, 'datasets_metadata.json')
        self.current_dataset = None
        self.load_metadata()
    
    def load_metadata(self) -> List[Dict]:
        """Carga metadata de datasets disponibles"""
        if os.path.exists(self.metadata_file):
            with open(self.metadata_file, 'r') as f:
                return json.load(f)
        return []
    
    def save_metadata(self, metadata: List[Dict]):
        """Guarda metadata de datasets"""
        with open(self.metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
    
    def add_dataset(
        self, 
        filename: str, 
        original_name: str, 
        description: str = ""
    ) -> Dict:
        """Registra un nuevo dataset"""
        df = pd.read_csv(os.path.join(settings.UPLOAD_PATH, filename))
        
        # Validar columnas requeridas
        required_cols = ['timestamp', 'ip_origen', 'ip_destino', 'puerto', 'protocolo', 'alerta']
        if not all(col in df.columns or col.lower() in [c.lower() for c in df.columns] for col in required_cols):
            # Intentar mapear columnas comunes
            df = self._normalize_columns(df)
        
        # Convertir timestamp
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Crear metadata
        dataset_info = {
            'id': filename.replace('.csv', ''),
            'filename': filename,
            'original_name': original_name,
            'description': description,
            'uploaded_at': datetime.now().isoformat(),
            'records': len(df),
            'date_range': {
                'start': df['timestamp'].min().isoformat(),
                'end': df['timestamp'].max().isoformat()
            },
            'unique_ips_origen': df['ip_origen'].nunique(),
            'unique_ips_destino': df['ip_destino'].nunique(),
            'attack_types': df['alerta'].value_counts().to_dict(),
            'status': 'active'
        }
        
        # Guardar metadata
        metadata = self.load_metadata()
        metadata.append(dataset_info)
        self.save_metadata(metadata)
        
        return dataset_info
    
    def list_datasets(self) -> List[Dict]:
        """Lista todos los datasets disponibles"""
        return self.load_metadata()
    
    def get_dataset(self, dataset_id: str) -> Optional[pd.DataFrame]:
        """Carga un dataset específico"""
        metadata = self.load_metadata()
        dataset_meta = next((d for d in metadata if d['id'] == dataset_id), None)
        
        if not dataset_meta:
            return None
        
        filepath = os.path.join(settings.UPLOAD_PATH, dataset_meta['filename'])
        if not os.path.exists(filepath):
            return None
        
        df = pd.read_csv(filepath)
        df = self._normalize_columns(df)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        return df
    
    def delete_dataset(self, dataset_id: str) -> bool:
        """Elimina un dataset"""
        metadata = self.load_metadata()
        dataset_meta = next((d for d in metadata if d['id'] == dataset_id), None)
        
        if not dataset_meta:
            return False
        
        # Eliminar archivo
        filepath = os.path.join(settings.UPLOAD_PATH, dataset_meta['filename'])
        if os.path.exists(filepath):
            os.remove(filepath)
        
        # Actualizar metadata
        metadata = [d for d in metadata if d['id'] != dataset_id]
        self.save_metadata(metadata)
        
        return True
    
    def compare_datasets(self, dataset_id1: str, dataset_id2: str) -> Dict:
        """Compara dos datasets"""
        df1 = self.get_dataset(dataset_id1)
        df2 = self.get_dataset(dataset_id2)
        
        if df1 is None or df2 is None:
            return {}
        
        comparison = {
            'dataset1': {
                'id': dataset_id1,
                'records': len(df1),
                'unique_attackers': df1['ip_origen'].nunique(),
                'attack_types': df1['alerta'].value_counts().to_dict()
            },
            'dataset2': {
                'id': dataset_id2,
                'records': len(df2),
                'unique_attackers': df2['ip_origen'].nunique(),
                'attack_types': df2['alerta'].value_counts().to_dict()
            },
            'differences': {
                'records_delta': len(df2) - len(df1),
                'attackers_delta': df2['ip_origen'].nunique() - df1['ip_origen'].nunique(),
                'new_attack_types': list(set(df2['alerta'].unique()) - set(df1['alerta'].unique())),
                'trend': 'increasing' if len(df2) > len(df1) else 'decreasing' if len(df2) < len(df1) else 'stable'
            }
        }
        
        return comparison
    
    def _normalize_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """Normaliza nombres de columnas comunes"""
        column_mapping = {
            'time': 'timestamp',
            'fecha': 'timestamp',
            'date': 'timestamp',
            'source_ip': 'ip_origen',
            'src_ip': 'ip_origen',
            'origin_ip': 'ip_origen',
            'destination_ip': 'ip_destino',
            'dest_ip': 'ip_destino',
            'dst_ip': 'ip_destino',
            'port': 'puerto',
            'destination_port': 'puerto',
            'dst_port': 'puerto',
            'protocol': 'protocolo',
            'proto': 'protocolo',
            'alert': 'alerta',
            'alert_type': 'alerta',
            'attack_type': 'alerta',
            'threat': 'alerta'
        }
        
        # Crear mapeo case-insensitive
        df.columns = df.columns.str.lower()
        df = df.rename(columns=column_mapping)
        
        return df


# Instancia global
dataset_manager = DatasetManager()
