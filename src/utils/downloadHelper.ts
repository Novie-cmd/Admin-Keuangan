import * as XLSX from 'xlsx';

/**
 * Downloads an XLSX workbook safely using multiple fallback mechanisms
 * to prevent "Need Permission" / browser iframe block errors.
 * Employs string replace patterns for filename normalization and CSV/Base64 fallback formatting.
 */
export function safeDownloadExcel(wb: XLSX.WorkBook, filename: string) {
  // Normalize and sanitize filename using replace pattern
  const cleanFilename = filename.replace(/[^\w\.\-]/g, '_');

  try {
    // Primary attempt: standard XLSX.writeFile
    XLSX.writeFile(wb, cleanFilename);
  } catch (err) {
    console.warn('XLSX.writeFile blocked by browser or iframe permissions, attempting Blob/ObjectURL fallback:', err);
    try {
      // Secondary attempt: Blob with ObjectURL
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = cleanFilename;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 300);
    } catch (blobErr) {
      console.warn('Blob URL download failed, attempting Base64 Data URI fallback:', blobErr);
      try {
        // Tertiary attempt: Base64 Data URI
        const base64 = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
        const dataUri = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`;

        const link = document.createElement('a');
        link.href = dataUri;
        link.download = cleanFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (dataUriErr) {
        console.warn('Data URI failed, falling back to CSV Data URI with BOM:', dataUriErr);
        try {
          // Quaternary fallback: CSV Data URI with UTF-8 BOM
          const sheetName = wb.SheetNames[0] || 'Sheet1';
          const ws = wb.Sheets[sheetName];
          const csvContent = XLSX.utils.sheet_to_csv(ws);

          const encodedCsv = encodeURIComponent(csvContent);
          const csvDataUri = 'data:text/csv;charset=utf-8,\uFEFF' + encodedCsv;

          // Replace extension using replace pattern
          const csvFilename = cleanFilename.replace(/\.xlsx$/i, '.csv');
          const link = document.createElement('a');
          link.href = csvDataUri;
          link.download = csvFilename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (csvErr: any) {
          alert('Gagal mengunduh file karena batasan izin browser: ' + (csvErr?.message || 'Izin ditolak'));
        }
      }
    }
  }
}
