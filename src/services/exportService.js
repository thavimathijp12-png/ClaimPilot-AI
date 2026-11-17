export function exportToCSV(filename, rows) {
  if (!rows || !rows.length) return;

  const separator = ',';
  const keys = Object.keys(rows[0]);

  const csvContent = [
    keys.map(k => `"${String(k).replace(/"/g, '""')}"`).join(separator),
    ...rows.map(row =>
      keys.map(k => {
        const val = row[k] === null || row[k] === undefined ? '' : row[k];
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(separator)
    )
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
