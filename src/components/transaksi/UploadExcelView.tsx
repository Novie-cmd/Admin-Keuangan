import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import * as XLSX from 'xlsx';
import {
  extractCode,
  findRowValueByKeys,
  parseNumber,
  parseExcelDate,
  makeRealisasiCompositeKey
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
  FileCheck
} from 'lucide-react';

interface PreviewRow {
  rowNum: number;
  tahun: number;
  program: string;
  kegiatan: string;
  sub: string;
  belanja: string;
  sp2d: string;
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
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet);
        const seenBatchKeys = new Set<string>();

        // Parse and validate rows
        const parsedRows: PreviewRow[] = jsonRows.map((row, index) => {
          const thnStr = findRowValueByKeys(row, ['tahun', 'thn', 'tahunanggaran', 'ta']);
          const thn = parseInt(thnStr || String(selectedTahun), 10) || selectedTahun;

          const progRaw = findRowValueByKeys(row, ['kodeprogram', 'kodeprog', 'program'], true);
          const kegRaw = findRowValueByKeys(row, ['kodekegiatan', 'kodekeg', 'kegiatan'], true);
          const subRaw = findRowValueByKeys(row, ['kodesubkegiatan', 'kodesub', 'subkegiatan', 'sub'], true);
          const belRaw = findRowValueByKeys(row, ['kodebelanja', 'koderekening', 'rekening', 'kode', 'belanja'], true);

          const prog = extractCode(progRaw) || '5.01.01';
          const keg = extractCode(kegRaw) || '5.01.01.2.01';
          const sub = extractCode(subRaw) || '5.01.01.2.01.01';
          const bel = extractCode(belRaw) || '5.1.02.01.01.0024';

          const sp2d = findRowValueByKeys(row, ['sp2d', 'nosp2d', 'nomorsp2d', 'sp2dno']);
          const nilaiRaw = findRowValueByKeys(row, ['nilai', 'realisasi', 'jumlah', 'nilaisp2d', 'nilairealisasi']);
          const nilai = parseNumber(nilaiRaw);
          const uraian = findRowValueByKeys(row, ['uraian', 'keterangan', 'uraianrealisasi']) || 'Realisasi Import Excel';
          const rekanan = findRowValueByKeys(row, ['rekanan', 'penyedia', 'pihakketiga']) || 'PT Bank NTB Syariah';
          const tanggalRaw = findRowValueByKeys(row, ['tanggal', 'tgl', 'tanggalsp2d']);
          const parsedDate = parseExcelDate(tanggalRaw, thn);

          const key = makeRealisasiCompositeKey(sp2d, bel, sub, nilai, uraian);
          const isDup = key ? (existingKeySet.has(key) || seenBatchKeys.has(key)) : false;
          if (key && !isDup) {
            seenBatchKeys.add(key);
          }

          let err = '';
          if (nilai <= 0) err = 'Nilai realisasi harus > 0.';
          else if (isDup) err = 'Data Realisasi ini duplikat dengan database/file ini.';

          return {
            rowNum: index + 1,
            tahun: thn,
            program: prog,
            kegiatan: keg,
            sub,
            belanja: bel,
            sp2d: sp2d || `SP2D-${thn}-${index + 1}`,
            nilai,
            uraian,
            rekanan,
            tanggal: parsedDate.isoDate,
            isValid: !err,
            isDuplicate: isDup,
            validationError: err
          };
        });

        setPreviewData(parsedRows);
      } catch (error) {
        alert('Gagal membaca file Excel. Pastikan format file .xlsx / .csv valid.');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsBinaryString(file);
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
        namaBelanja: 'Belanja ' + r.belanja,
        sp2d: r.sp2d,
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
    const sampleData = [
      {
        Tahun: selectedTahun,
        Program: '5.01.01',
        Kegiatan: '5.01.01.2.01',
        SubKegiatan: '5.01.01.2.01.01',
        Belanja: '5.1.02.01.01.0024',
        SP2D: `900/${Math.floor(1000 + Math.random() * 9000)}/SP2D-LS/KESBANG/${selectedTahun}`,
        Nilai: 150000000,
        Uraian: 'Pengadaan Alat Tulis Kantor & Cetak Laporan Perencanaan',
        Rekanan: 'CV Nusa Media Grafindo',
        Tanggal: new Date().toISOString().split('T')[0]
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_Import_BFMS');
    XLSX.writeFile(wb, `Template_Import_Realisasi_NTB_${selectedTahun}.xlsx`);
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
      <div className="rounded-2xl border-2 border-dashed border-emerald-600/40 bg-slate-900/80 p-8 text-center shadow-xl">
        <FileSpreadsheet className="mx-auto h-12 w-12 text-emerald-400" />
        <h2 className="mt-3 text-sm font-bold text-white">
          Pilih File Excel Transaksi Keuangan (.xlsx / .csv)
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Format Kolom Required: <code className="text-emerald-300">| Tahun | Program | Kegiatan | SubKegiatan | Belanja | SP2D | Nilai |</code>
        </p>

        <label className="mt-4 inline-flex items-center gap-2 cursor-pointer rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-950/50">
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
