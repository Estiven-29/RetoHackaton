/**
 * Card para subir nuevos datasets
 */
import { useState } from 'react';
import { Upload, File, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { uploadDataset } from '../../services/api';

const UploadCard = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
    } else {
      setError('Por favor selecciona un archivo CSV válido');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Selecciona un archivo primero');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const result = await uploadDataset(file, description);
      setSuccess(true);
      setFile(null);
      setDescription('');
      
      if (onUploadSuccess) {
        onUploadSuccess(result.dataset);
      }

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al subir el archivo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-md p-6 border-2 border-dashed border-blue-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-blue-600 p-3 rounded-lg">
          <Upload className="text-white" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Subir Nuevo Dataset</h3>
          <p className="text-sm text-gray-600">Formato CSV con columnas requeridas</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Archivo CSV
          </label>
          <label className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-blue-400 focus:outline-none">
            <div className="flex flex-col items-center space-y-2">
              <File className="text-gray-400" size={32} />
              <span className="text-sm text-gray-600">
                {file ? file.name : 'Click para seleccionar archivo CSV'}
              </span>
              {file && (
                <span className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              )}
            </div>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Descripción (opcional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Logs de producción semana 48..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="3"
            disabled={uploading}
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
            !file || uploading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {uploading ? (
            <>
              <Loader className="animate-spin" size={20} />
              <span>Subiendo...</span>
            </>
          ) : (
            <>
              <Upload size={20} />
              <span>Subir Dataset</span>
            </>
          )}
        </button>

        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-100 border border-green-300 rounded-lg text-green-800">
            <CheckCircle size={20} />
            <span className="text-sm font-semibold">¡Dataset subido exitosamente!</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-100 border border-red-300 rounded-lg text-red-800">
            <AlertCircle size={20} />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs font-semibold text-blue-900 mb-2"> Formato Requerido:</p>
        <code className="text-xs text-blue-800 block">
          timestamp, ip_origen, ip_destino, puerto, protocolo, alerta
        </code>
      </div>
    </div>
  );
};

export default UploadCard;
