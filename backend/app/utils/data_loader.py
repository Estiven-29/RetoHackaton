"""
Cargador de datos CSV
"""
import pandas as pd
import os
from typing import Optional
from ..core.config import settings


class DataLoader:
    """Clase para cargar y cachear datos del CSV"""
    
    _instance = None
    _dataframe: Optional[pd.DataFrame] = None
    
    def __new__(cls):
        """Singleton pattern para evitar recargar el CSV múltiples veces"""
        if cls._instance is None:
            cls._instance = super(DataLoader, cls).__new__(cls)
        return cls._instance
    
    def load_data(self, force_reload: bool = False) -> pd.DataFrame:
        """
        Carga el dataset de IDS desde CSV
        
        Args:
            force_reload: Forzar recarga del archivo
            
        Returns:
            DataFrame de pandas con los datos
        """
        if self._dataframe is not None and not force_reload:
            return self._dataframe
        
        csv_path = os.path.join(settings.DATA_PATH, settings.CSV_FILENAME)
        
        try:
            df = pd.read_csv(csv_path)
            
            # Renombrar columnas para mantener consistencia
            df.columns = ['timestamp', 'ip_origen', 'ip_destino', 'puerto', 'protocolo', 'alerta']
            
            # Convertir timestamp a datetime
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            
            # Limpiar datos
            df['puerto'] = df['puerto'].astype(int)
            df['ip_origen'] = df['ip_origen'].str.strip()
            df['ip_destino'] = df['ip_destino'].str.strip()
            df['alerta'] = df['alerta'].str.strip()
            
            self._dataframe = df
            print(f"✓ Datos cargados: {len(df)} registros desde {csv_path}")
            return df
            
        except FileNotFoundError:
            print(f"✗ Error: No se encontró el archivo en {csv_path}")
            return pd.DataFrame()
        except Exception as e:
            print(f"✗ Error al cargar datos: {str(e)}")
            return pd.DataFrame()
    
    def get_date_range(self) -> tuple:
        """Obtiene el rango de fechas del dataset"""
        if self._dataframe is not None and not self._dataframe.empty:
            return (
                self._dataframe['timestamp'].min(),
                self._dataframe['timestamp'].max()
            )
        return (None, None)


# Instancia global
data_loader = DataLoader()
