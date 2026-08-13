import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import * as XLSX from 'xlsx';
import {
  extractCode,
  parseNumber,
  parseExcelDate,
  makeRealisasiCompositeKey,
  parseRealisasiFromExcelData
} from '../../utils/codeUtils';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  ArrowRight,
  RefreshCw,
  FileCheck,
  Info
} from 'lucide-react';

interface PreviewRow {
  rowNum: number;
  tahun: number;
  program: string;
  kegiatan: string;
  sub: string;
  namaSub: string;
  belanja: string;
  namaBelanja: string;
  sp2d: string;
  spm: string;
  nilai: number;
  uraian: string;
  rekanan: string;
  tanggal: string;
  isValid: boolean;
  isDuplicate: boolean;
  validationError?: string;
}

export const UploadExcelView: React.FC = () => {
  const { selectedTahun, batchImportExcel, importLogs, realisasiList } = useApp();

  const [fileName, setFileName] = useState<string>('');
  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{
    successCount: number;
    duplicateCount: number;
    errors: string[];
  } | null>(null);

  // Existing composite keys for instant duplicate detection in preview
  const existingKeySet = new Set(
    realisasiList
      .filter(r => Number(r.tahun) !== Number(selectedTahun))
      .map(r =>
        makeRealisasiCompositeKey(r.noSP2D, r.kodeBelanja, r.kodeSub, r.nilai, r.uraian)
      )
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const buffer = evt.target?.result;
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const sheet2D: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        const sheetJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const rawResults = parseRealisasiFromExcelData(sheet2D, sheetJson, selectedTahun);
        const seenBatchKeys = new Set<string>();

        const parsedRows: PreviewRow[] = rawResults.map(r => {
          const key = makeRealisasiCompositeKey(r.noSP2D, r.kodeBelanja, r.kodeSub, r.nilai, r.uraian);
          const isDup = key ? (existingKeySet.has(key) || seenBatchKeys.has(key)) : false;
          if (key && !isDup) {
            seenBatchKeys.add(key);
          }

          let err = '';
          if (r.nilai <= 0) err = 'Nilai realisasi harus > 0.';
          else if (isDup) err = 'Data Realisasi ini duplikat dengan database/file ini.';

          return {
            rowNum: r.rowNum,
            tahun: r.tahun || selectedTahun,
            program: r.kodeProgram,
            kegiatan: r.kodeKegiatan,
            sub: r.kodeSub,
            namaSub: r.namaSub,
            belanja: r.kodeBelanja,
            namaBelanja: r.namaBelanja,
            sp2d: r.noSP2D,
            spm: r.noSPM,
            nilai: r.nilai,
            uraian: r.uraian,
            rekanan: r.rekanan,
            tanggal: r.tanggal,
            isValid: !err,
            isDuplicate: isDup,
            validationError: err
          };
        });

        setPreviewData(parsedRows);
      } catch (error) {
        console.error('Failed to parse Excel file:', error);
        alert('Gagal membaca file Excel. Pastikan format file .xlsx / .csv valid.');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleExecuteImport = () => {
    const validRows = previewData
      .filter(r => r.isValid)
      .map(r => ({
        tahun: r.tahun,
        kodeProgram: r.program,
        kodeKegiatan: r.kegiatan,
        kodeSub: r.sub,
        kodeBelanja: r.belanja,
        namaBelanja: r.namaBelanja,
        sp2d: r.sp2d,
        spm: r.spm,
        nilai: r.nilai,
        uraian: r.uraian,
        rekanan: r.rekanan,
        tanggal: r.tanggal
      }));

    if (validRows.length === 0) {
      alert('Tidak ada data valid yang dapat diimpor.');
      return;
    }

    const res = batchImportExcel(validRows, fileName || 'Data_Import_Realisasi.xlsx', true);
    setImportResult(res);
    setPreviewData([]);
  };

  const downloadSampleTemplate = () => {
    const wb = XLSX.utils.book_new();

    // 1. Sheet Layout Q6-AQ6
    const m6Data2D: any[][] = [
      ['PEMERINTAH PROVINSI NUSA TENGGARA BARAT'],
      ['BADAN KESATUAN BANGSA DAN POLITIK DALAM NEGERI (BAKESBANGPOLDAGRI)'],
      [`TEMPLATE IMPLEMENTASI IMPORT REALISASI SP2D - TAHUN ANGGARAN ${selectedTahun}`],
      ['Format Urutan Kolom: Q6 (Kode Sub) | R6 (Nama Sub) | S6 (Kode Belanja) | T6 (Nama Belanja) | AA6 (Nilai Realisasi) | AP6 (No SP2D) | AQ6 (Tanggal SP2D) | AO6 (No SPM) | Z6 (Uraian) | AD6 (Rekanan) | AE6 (Keterangan)'],
      [''],
      [] // Row 6 (index 5)
    ];

    // Populate Row 6 Header
    m6Data2D[5][0] = 'No';
    m6Data2D[5][1] = 'Tahun';
    m6Data2D[5][16] = 'Kode Sub Kegiatan'; // Col Q (index 16)
    m6Data2D[5][17] = 'Nama Sub Kegiatan'; // Col R (index 17)
    m6Data2D[5][18] = 'Kode Rekening Belanja'; // Col S (index 18)
    m6Data2D[5][19] = 'Nama Rekening Belanja'; // Col T (index 19)
    m6Data2D[5][25] = 'Uraian Transaksi / Pekerjaan'; // Col Z (index 25)
    m6Data2D[5][26] = 'Nilai Realisasi (Rp)'; // Col AA (index 26)
    m6Data2D[5][29] = 'Nama Rekanan / Penyedia'; // Col AD (index 29)
    m6Data2D[5][30] = 'Keterangan Rekanan / Bank / NPWP'; // Col AE (index 30)
    m6Data2D[5][40] = 'Nomor SPM'; // Col AO (index 40)
    m6Data2D[5][41] = 'Nomor SP2D'; // Col AP (index 41)
    m6Data2D[5][42] = 'Tanggal SP2D'; // Col AQ (index 42)

    // Row 7 Sample Data
    const row7: any[] = [];
    row7[0] = 1;
    row7[1] = selectedTahun; // Automatic based on selected year
    row7[16] = '5.01.01.2.01.01';
    row7[17] = 'Penyusunan Dokumen Perencanaan dan Evaluasi Kinerja Perangkat Daerah';
    row7[18] = '5.1.02.01.01.0024';
    row7[19] = 'Belanja Alat/Bahan untuk Kegiatan Kantor-Alat Tulis Kantor';
    row7[25] = 'Pembayaran Pengadaan ATK dan Cetak Laporan Triwulan I BAKESBANGPOLDAGRI';
    row7[26] = 15000000;
    row7[29] = 'CV Cahaya Gemilang';
    row7[30] = 'Bank NTB Syariah - NPWP 01.234.567.8-901.000';
    row7[40] = `900/101/SPM-LS/KESBANG/${selectedTahun}`;
    row7[41] = `900/101/SP2D-LS/KESBANG/${selectedTahun}`;
    row7[42] = `${selectedTahun}-02-10`;
    m6Data2D.push(row7);

    // Row 8 Sample Data (Maret)
    const row8: any[] = [];
    row8[0] = 2;
    row8[1] = selectedTahun;
    row8[16] = '5.01.01.2.01.01';
    row8[17] = 'Penyusunan Dokumen Perencanaan dan Evaluasi Kinerja Perangkat Daerah';
    row8[18] = '5.1.02.01.01.0025';
    row8[19] = 'Belanja Kertas dan Cover Cetakan Laporan';
    row8[25] = 'Cetak Laporan Akuntabilitas Kinerja Instansi Pemerintah (LKjIP) Bulan Maret';
    row8[26] = 22500000;
    row8[29] = 'PT Bank NTB Syariah';
    row8[30] = 'Bank NTB Syariah Mataram';
    row8[40] = `900/0302/SPM-LS/KESBANG/${selectedTahun}`;
    row8[41] = `900/0302/SP2D-LS/KESBANG/${selectedTahun}`;
    row8[42] = `${selectedTahun}-03-18`;
    m6Data2D.push(row8);

    // Row 9 Sample Data (April)
    const row9: any[] = [];
    row9[0] = 3;
    row9[1] = selectedTahun;
    row9[16] = '5.01.02.2.01.03';
    row9[17] = 'Fasilitasi Pembinaan Kerukunan Umat Beragama';
    row9[18] = '5.1.02.04.01.0001';
    row9[19] = 'Belanja Makanan dan Minuman Rapat';
    row9[20] = 0;
    row9[25] = 'Belanja Makanan dan Minuman Kegiatan Pembinaan FKUB Bulan April';
    row9[26] = 35000000;
    row9[29] = 'PT Lombok Utama Catering';
    row9[30] = 'Bank NTB Syariah Mataram';
    row9[40] = `900/0401/SPM-LS/KESBANG/${selectedTahun}`;
    row9[41] = `900/0401/SP2D-LS/KESBANG/${selectedTahun}`;
    row9[42] = `15 April ${selectedTahun}`;
    m6Data2D.push(row9);

    const wsM6 = XLSX.utils.aoa_to_sheet(m6Data2D);
    XLSX.utils.book_append_sheet(wb, wsM6, 'Template_Layout_Realisasi');

    // 2. Sheet Clean Standard Format
    const cleanStandardData = [
      {
        Tahun: selectedTahun,
        'Kode Program': '5.01.01',
        'Kode Kegiatan': '5.01.01.2.01',
        'Kode Sub Kegiatan': '5.01.01.2.01.01',
        'Nama Sub Kegiatan': 'Penyusunan Dokumen Perencanaan',
        'Kode Belanja': '5.1.02.01.01.0024',
        'Nama Belanja': 'Belanja ATK',
        'Nilai Realisasi': 15000000,
        'No SP2D': `900/0201/SP2D-LS/KESBANG/${selectedTahun}`,
        'Tanggal': `${selectedTahun}-02-10`,
        'No SPM': `900/0201/SPM-LS/KESBANG/${selectedTahun}`,
        Uraian: 'Pengadaan ATK Kegiatan Perencanaan Bulan Februari',
        Rekanan: 'CV Cahaya Gemilang',
        Keterangan: 'Bank NTB Syariah - NPWP 01.234.567.8-901.000'
      },
      {
        Tahun: selectedTahun,
        'Kode Program': '5.01.01',
        'Kode Kegiatan': '5.01.01.2.01',
        'Kode Sub Kegiatan': '5.01.01.2.01.01',
        'Nama Sub Kegiatan': 'Penyusunan Dokumen Perencanaan',
        'Kode Belanja': '5.1.02.01.01.0025',
        'Nama Belanja': 'Belanja Kertas',
        'Nilai Realisasi': 22500000,
        'No SP2D': `900/0301/SP2D-LS/KESBANG/${selectedTahun}`,
        'Tanggal': `18 Maret ${selectedTahun}`,
        'No SPM': `900/0301/SPM-LS/KESBANG/${selectedTahun}`,
        Uraian: 'Cetak Laporan Kinerja Instansi Bulan Maret',
        Rekanan: 'PT Bank NTB Syariah',
        Keterangan: 'Bank NTB Syariah Mataram'
      },
      {
        Tahun: selectedTahun,
        'Kode Program': '5.01.02',
        'Kode Kegiatan': '5.01.02.2.01',
        'Kode Sub Kegiatan': '5.01.02.2.01.03',
        'Nama Sub Kegiatan': 'Fasilitasi FKUB',
        'Kode Belanja': '5.1.02.04.01.0001',
        'Nama Belanja': 'Belanja Makan Minum Rapat',
        'Nilai Realisasi': 35000000,
        'No SP2D': `900/0401/SP2D-LS/KESBANG/${selectedTahun}`,
        'Tanggal': `20/04/${selectedTahun}`,
        'No SPM': `900/0401/SPM-LS/KESBANG/${selectedTahun}`,
        Uraian: 'Belanja Jamuan Rapat FKUB Bulan April',
        Rekanan: 'PT Lombok Utama Catering',
        Keterangan: 'Bank NTB Syariah'
      }
    ];
    const wsStandard = XLSX.utils.json_to_sheet(cleanStandardData);
    XLSX.utils.book_append_sheet(wb, wsStandard, 'Format_Standar_Sederhana');

    XLSX.writeFile(wb, `Template_Import_Realisasi_Q6_AQ6_NTB_${selectedTahun}.xlsx`);
  };

  const validCount = previewData.filter(r => r.isValid).length;
  const invalidCount = previewData.length - validCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Upload & Import File Excel</h1>
          </div>
          <p className="text-xs text-slate-400">
            Import Massal Transaksi Realisasi Keuangan dengan Validasi Deteksi Duplikat Otomatis (.xlsx, .xls, .csv)
          </p>
        </div>

        <button
          onClick={downloadSampleTemplate}
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-bold text-emerald-400 hover:border-emerald-500 hover:bg-slate-800"
          id="btn-download-template"
        >
          <Download className="h-4 w-4" />
          <span>Unduh Format Excel</span>
        </button>
      </div>

      {/* DROPZONE AREA */}
      <div className="rounded-2xl border-2 border-dashed border-emerald-600/40 bg-slate-900/80 p-6 text-center shadow-xl space-y-4">
        <FileSpreadsheet className="mx-auto h-12 w-12 text-emerald-400" />
        <div>
          <h2 className="text-sm font-bold text-white">
            Pilih File Excel Transaksi Realisasi Keuangan (.xlsx / .csv)
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Sistem mendukung format <span className="text-emerald-300 font-semibold">SIPD/SIMDA (Urutan Kolom Q6-AQ6)</span> maupun format header standar.
          </p>
        </div>

        {/* INFO COLUMN MAPPER */}
        <div className="mx-auto max-w-3xl rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-left text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1.5">
            <Info className="h-4 w-4" />
            <span>Pemetaan Otomatis Kolom Excel Import Realisasi:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-[11px] text-slate-300 font-mono">
            <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
              <span className="text-emerald-400 font-bold">Tahun:</span> Otomatis ({selectedTahun})
            </div>
            <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
              <span className="text-emerald-400 font-bold">Q6:</span> Kode Sub Kegiatan
            </div>
            <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
              <span className="text-emerald-400 font-bold">R6:</span> Nama Sub Kegiatan
            </div>
            <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
              <span className="text-emerald-400 font-bold">S6:</span> Kode Rekening Belanja
            </div>
            <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
              <span className="text-emerald-400 font-bold">T6:</span> Nama Rekening Belanja
            </div>
            <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
              <span className="text-emerald-400 font-bold">AA6:</span> Nilai Realisasi (Rp)
            </div>
            <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
              <span className="text-emerald-400 font-bold">AP6:</span> Nomor SP2D
            </div>
            <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
              <span className="text-emerald-400 font-bold">AQ6:</span> Tanggal SP2D
            </div>
            <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
              <span className="text-emerald-400 font-bold">AO6:</span> Nomor SPM
            </div>
            <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
              <span className="text-emerald-400 font-bold">Z6:</span> Uraian Transaksi
            </div>
            <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
              <span className="text-emerald-400 font-bold">AD6:</span> Nama Rekanan
            </div>
            <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
              <span className="text-emerald-400 font-bold">AE6:</span> Keterangan Rekanan
            </div>
          </div>
        </div>

        <div>
          <label className="inline-flex items-center gap-2 cursor-pointer rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-950/50">
            <span>{isProcessing ? 'Membaca File...' : 'Pilih File Excel dari Komputer'}</span>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
              id="input-excel-file"
            />
          </label>

          {fileName && (
            <p className="mt-3 text-xs font-semibold text-emerald-300">
              File Terpilih: {fileName}
            </p>
          )}
        </div>
      </div>

      {/* RESULT NOTIFICATION BANNER */}
      {importResult && (
        <div className="rounded-2xl border border-emerald-500 bg-emerald-950/60 p-5 shadow-2xl">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Import Berhasil Selesai</h3>
              <p className="text-xs text-emerald-200">
                {importResult.successCount} Transaksi berhasil diimpor ke database realisasi.{' '}
                {importResult.duplicateCount > 0 && `(${importResult.duplicateCount} Duplikat Diabaikan)`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW & VALIDATION TABLE */}
      {previewData.length > 0 && (
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Pratinjau & Validasi Data Import</h3>
              <p className="text-xs text-slate-400">
                Total: {previewData.length} baris | Valid:{' '}
                <span className="text-emerald-400 font-bold">{validCount}</span> | Invalid/Duplikat:{' '}
                <span className="text-rose-400 font-bold">{invalidCount}</span>
              </p>
            </div>

            <button
              onClick={handleExecuteImport}
              disabled={validCount === 0}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-md disabled:opacity-50"
            >
              <FileCheck className="h-4 w-4" />
              <span>Eksekusi Import ({validCount} Data Valid)</span>
            </button>
          </div>

          <div className="max-h-96 overflow-x-auto overflow-y-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-950 text-slate-300 font-bold uppercase border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2">Row</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">No. SP2D</th>
                  <th className="px-3 py-2">Belanja</th>
                  <th className="px-3 py-2 text-right">Nilai (Rp)</th>
                  <th className="px-3 py-2">Uraian / Rekanan</th>
                  <th className="px-3 py-2">Keterangan Validasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {previewData.map(r => (
                  <tr
                    key={r.rowNum}
                    className={
                      r.isValid
                        ? 'hover:bg-slate-800/50'
                        : 'bg-rose-950/30 hover:bg-rose-950/50 text-rose-200'
                    }
                  >
                    <td className="px-3 py-2 font-mono text-slate-400">{r.rowNum}</td>
                    <td className="px-3 py-2">
                      {r.isValid ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800">
                          <CheckCircle2 className="h-3 w-3" /> Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-950 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-800">
                          <XCircle className="h-3 w-3" /> Error
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 font-mono font-bold text-emerald-300">{r.sp2d}</td>
                    <td className="px-3 py-2 font-mono">{r.belanja}</td>
                    <td className="px-3 py-2 text-right font-mono font-bold">
                      Rp {r.nilai.toLocaleString('id-ID')}
                    </td>
                    <td className="px-3 py-2 max-w-xs truncate">
                      {r.uraian} ({r.rekanan})
                    </td>
                    <td className="px-3 py-2 text-[11px]">
                      {r.validationError ? (
                        <span className="text-rose-400 font-semibold">{r.validationError}</span>
                      ) : (
                        <span className="text-emerald-400">Siap Diimpor</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* IMPORT LOGS AUDIT */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
          Riwayat Log Import Excel
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-300 font-bold uppercase border-b border-slate-800">
              <tr>
                <th className="px-4 py-2">Waktu Import</th>
                <th className="px-4 py-2">Nama File Excel</th>
                <th className="px-4 py-2">Jumlah Data</th>
                <th className="px-4 py-2">Operator</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {importLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-800/50">
                  <td className="px-4 py-2 font-mono text-slate-400">{log.tanggal}</td>
                  <td className="px-4 py-2 font-semibold text-white">{log.namaFile}</td>
                  <td className="px-4 py-2 font-mono text-emerald-400">{log.jumlahData} data</td>
                  <td className="px-4 py-2 text-slate-300">{log.operator}</td>
                  <td className="px-4 py-2">
                    <span className="rounded-full bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
