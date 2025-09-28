/**
 * Utility functions for data export functionality
 */

export interface ExportOptions {
  format: 'csv' | 'json';
  filename?: string;
}

/**
 * Exports data to CSV or JSON format
 * @param data - Array of objects to export
 * @param options - Export configuration
 */
export const exportData = (data: any[], options: ExportOptions): void => {
  const { format, filename = 'export' } = options;
  
  if (format === 'csv') {
    exportToCSV(data, filename);
  } else if (format === 'json') {
    exportToJSON(data, filename);
  }
};

/**
 * Exports data to CSV format
 */
const exportToCSV = (data: any[], filename: string): void => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n');
  
  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
};

/**
 * Exports data to JSON format
 */
const exportToJSON = (data: any[], filename: string): void => {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${filename}.json`, 'application/json');
};

/**
 * Downloads file to user's device
 */
const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};