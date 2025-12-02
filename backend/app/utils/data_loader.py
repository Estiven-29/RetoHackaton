"""
Carga de datos desde CSV
"""
import pandas as pd
import os
from ..core.config import settings


class DataLoader:
    """Gestor de carga de datos"""
    
    def __init__(self):
        self.default_csv_path = os.path.join(settings.DATA_PATH, settings.CSV_FILENAME)
        self.current_dataset = None
        
    def load_data(self, dataset_id: str = None) -> pd.DataFrame:
        """
        Carga datos desde CSV
        
        Args:
            dataset_id: ID del dataset a cargar (None = default)
        """
        try:
            if dataset_id:
                # Cargar dataset específico desde uploads
                filepath = os.path.join(settings.UPLOAD_PATH, f"{dataset_id}.csv")
                if not os.path.exists(filepath):
                    # Buscar por metadata
                    from ..services.dataset_manager import dataset_manager
                    datasets = dataset_manager.list_datasets()
                    dataset = next((d for d in datasets if d['id'] == dataset_id), None)
                    if dataset:
                        filepath = os.path.join(settings.UPLOAD_PATH, dataset['filename'])
                    else:
                        print(f" Dataset {dataset_id} no encontrado, usando default")
                        filepath = self.default_csv_path
            else:
                filepath = self.default_csv_path
            
            if not os.path.exists(filepath):
                print(f" Archivo no encontrado: {filepath}")
                return pd.DataFrame()
            
            df = pd.read_csv(filepath)
            
            # Normalizar nombres de columnas
            df.columns = df.columns.str.lower().str.strip()
            
            # Convertir timestamp
            if 'timestamp' in df.columns:
                df['timestamp'] = pd.to_datetime(df['timestamp'])
            
            return df
            
        except Exception as e:
            print(f" Error cargando datos: {e}")
            return pd.DataFrame()
    
    def get_date_range(self, dataset_id: str = None) -> tuple:
        """Obtiene rango de fechas del dataset"""
        df = self.load_data(dataset_id)
        if df.empty or 'timestamp' not in df.columns:
            return ("Sin datos", "Sin datos")
        
        return (
            df['timestamp'].min().strftime('%Y-%m-%d %H:%M:%S'),
            df['timestamp'].max().strftime('%Y-%m-%d %H:%M:%S')
        )


# Instancia global
data_loader = DataLoader()
