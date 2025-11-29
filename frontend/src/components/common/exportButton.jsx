/**
 * Botón para exportar datos
 */
import { Download } from 'lucide-react';

const ExportButton = ({ data, filename = 'export', format = 'json' }) => {
  const handleExport = () => {
    let content, mimeType;

    if (format === 'json') {
      content = JSON.stringify(data, null, 2);
      mimeType = 'application/json';
    } else if (format === 'csv') {
      // Conversión simple a CSV (mejorar según necesidad)
      const headers = Object.keys(data[0] || {}).join(',');
      const rows = data.map(obj => Object.values(obj).join(','));
      content = [headers, ...rows].join('\n');
      mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      title={`Exportar como ${format.toUpperCase()}`}
    >
      <Download size={18} />
      <span>Exportar {format.toUpperCase()}</span>
    </button>
  );
};

export default ExportButton;