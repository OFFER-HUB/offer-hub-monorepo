import React from 'react';
import { exportData, ExportOptions } from '../../utils/export-helpers';

interface ExportButtonProps {
  data: any[];
  filename?: string;
  className?: string;
}

/**
 * Button component for exporting data
 */
export const ExportButton: React.FC<ExportButtonProps> = ({ 
  data, 
  filename = 'data-export',
  className = ''
}) => {
  const handleCSVExport = () => {
    exportData(data, { format: 'csv', filename });
  };

  const handleJSONExport = () => {
    exportData(data, { format: 'json', filename });
  };

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <button
        onClick={handleCSVExport}
        className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
      >
        Export CSV
      </button>
      <button
        onClick={handleJSONExport}
        className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
      >
        Export JSON
      </button>
    </div>
  );
};