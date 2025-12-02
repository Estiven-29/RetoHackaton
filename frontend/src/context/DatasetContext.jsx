/**
 * Context para gestionar el dataset activo
 */
import { createContext, useContext, useState } from 'react';

const DatasetContext = createContext();

export const useDataset = () => {
  const context = useContext(DatasetContext);
  if (!context) {
    throw new Error('useDataset debe usarse dentro de DatasetProvider');
  }
  return context;
};

export const DatasetProvider = ({ children }) => {
  const [activeDatasetId, setActiveDatasetId] = useState(null);
  const [activeDatasetInfo, setActiveDatasetInfo] = useState(null);

  const setActiveDataset = (datasetId, datasetInfo) => {
    setActiveDatasetId(datasetId);
    setActiveDatasetInfo(datasetInfo);
    console.log('📊 Dataset activo cambiado:', datasetId, datasetInfo);
  };

  const clearActiveDataset = () => {
    setActiveDatasetId(null);
    setActiveDatasetInfo(null);
    console.log('📊 Dataset activo limpiado - usando default');
  };

  return (
    <DatasetContext.Provider
      value={{
        activeDatasetId,
        activeDatasetInfo,
        setActiveDataset,
        clearActiveDataset,
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
};
