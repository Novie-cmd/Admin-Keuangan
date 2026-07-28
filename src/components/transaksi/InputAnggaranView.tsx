import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Anggaran } from '../../types';
import * as XLSX from 'xlsx';
import { safeDownloadExcel } from '../../utils/downloadHelper';
import {
  DollarSign,
  Plus,
  Trash2,
  Edit,
  Save,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
  Upload,
  Download,
  XCircle,
  FileCheck,
  Sparkles,
  AlertCircle,
  X
} from 'lucide-react';

interface PreviewAnggaranRow {
  rowNum: number;
  tahun: number;
  kodeProgram: string;
  kodeKegiatan: string;
  kodeSub: string;
  kodeBelanja: string;
  namaBelanja: string;
  pagu: number;
  revisi: number;
  nilaiSPD: number;
  sumberDana: string;
  isValid: boolean;
  status: string;
  validationError?: string;
}

export const InputAnggaranView: React.FC = () => {
  const {
    selectedTahun,
    programs,
    kegiatanList,
    subKegiatanList,
    belanjaList,
    sumberDanaList,
    anggaranList,
    addAnggaran,
    updateAnggaran,
    deleteAnggaran,
    importAnggaranBatch,
    currentUser
  } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Edit and Delete Modal States
  const [editingAnggaran, setEditingAnggaran] = useState<Anggaran | null>(null);
  const [deletingAnggaran, setDeletingAnggaran] = useState<Anggaran | null>(null);

  // Edit form state
  const [editPagu, setEditPagu] = useState<number>(0);
  const [editRevisi, setEditRevisi] = useState<number>(0);
  const [editNilaiSPD, setEditNilaiSPD] = useState<number>(0);
  const [editSumberDana, setEditSumberDana] = useState<string>('DAU');

  // Excel Import States
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedFileName, setImportedFileName] = useState('');
  const [previewData, setPreviewData] = useState<PreviewAnggaranRow[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Form State
  const [kodeProgram, setKodeProgram] = useState(programs[0]?.kodeProgram || '5.01.01');
  const [kodeKegiatan, setKodeKegiatan] = useState(kegiatanList[0]?.kodeKegiatan || '5.01.01.2.01');
  const [kodeSub, setKodeSub] = useState(subKegiatanList[0]?.kodeSub || '5.01.01.2.01.01');
  const [kodeBelanja, setKodeBelanja] = useState(belanjaList[0]?.kodeBelanja || '5.1.02.01.01.0024');
  const [pagu, setPagu] = useState<number>(500000000);
  const [revisi, setRevisi] = useState<number>(0);
  const [nilaiSPD, setNilaiSPD] = useState<number>(500000000);
  const [sumberDana, setSumberDana] = useState('DAU');

  const filteredKegiatan = kegiatanList.filter(k => k.kodeProgram === kodeProgram);
  const filteredSub = subKegiatanList.filter(s => s.kodeKegiatan === kodeKegiatan);

  const isReadOnly = currentUser.role === 'Auditor' || currentUser.role === 'Kepala Badan';

  // Open Edit Modal
  const handleOpenEdit = (a: Anggaran) => {
    setEditingAnggaran(a);
    setEditPagu(a.pagu);
    setEditRevisi(a.revisi);
    setEditNilaiSPD(a.nilaiSPD !== undefined ? a.nilaiSPD : a.paguAkhir);
    setEditSumberDana(a.sumberDana || 'DAU');
  };

  // Save Edit Anggaran
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnggaran) return;

    updateAnggaran(editingAnggaran.id, {
      pagu: editPagu,
      revisi: editRevisi,
      nilaiSPD: editNilaiSPD,
      sumberDana: editSumberDana
    });

    setEditingAnggaran(null);
  };

  // Confirm Delete Anggaran
  const handleConfirmDelete = () => {
    if (!deletingAnggaran) return;
    deleteAnggaran(deletingAnggaran.id);
    setDeletingAnggaran(null);
  };

  // Download Excel Template for Anggaran Pagu
  const handleDownloadTemplate = () => {
    const sampleData = [
      {
        'Tahun': selectedTahun,
        'Kode Program': '5.01.01',
        'Kode Kegiatan': '5.01.01.2.01',
        'Kode Sub Kegiatan': '5.01.01.2.01.01',
        'Kode Belanja': '5.1.02.01.01.0024',
        'Nama Belanja': 'Belanja Alat/Bahan untuk Kegiatan Kantor-Alat Tulis Kantor',
        'Pagu Murni': 150000000,
        'Revisi': 0,
        'Nilai SPD': 150000000,
        'Sumber Dana': 'DAU'
      },
      {
        'Tahun': selectedTahun,
        'Kode Program': '5.01.01',
        'Kode Kegiatan': '5.01.01.2.01',
        'Kode Sub Kegiatan': '5.01.01.2.01.01',
        'Kode Belanja': '5.1.02.01.01.0025',
        'Nama Belanja': 'Belanja Kertas dan Cover Cetakan Laporan',
        'Pagu Murni': 75000000,
        'Revisi': 5000000,
        'Nilai SPD': 80000000,
        'Sumber Dana': 'DAU'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pagu_Anggaran');
    safeDownloadExcel(wb, `Template_Import_Pagu_Anggaran_NTB_${selectedTahun}.xlsx`);
  };

  // Handle Upload Excel File
  const handleFileUploadExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportedFileName(file.name);
    setImportSuccessMsg(null);
    setImportErrors([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result;
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          setImportErrors(['File Excel kosong atau format tidak valid.']);
          setPreviewData([]);
          return;
        }

        const existingKeys = new Set(anggaranList.map(a => `${a.tahun}_${a.kodeBelanja}`));
        const parsedRows: PreviewAnggaranRow[] = [];
        const errs: string[] = [];

        rawJson.forEach((row, idx) => {
          const getVal = (...keys: string[]) => {
            for (const key of keys) {
              const matchedKey = Object.keys(row).find(
                k => k.trim().toLowerCase().replace(/[\s_-]/g, '') === key.toLowerCase().replace(/[\s_-]/g, '')
              );
              if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== '') {
                return String(row[matchedKey]).trim();
              }
            }
            return '';
          };

          const thn = parseInt(getVal('tahun', 'thn', 'tahunanggaran') || String(selectedTahun), 10) || selectedTahun;
          const prog = getVal('kodeprogram', 'kodeprog', 'program') || '5.01.01';
          const keg = getVal('kodekegiatan', 'kodekeg', 'kegiatan') || '5.01.01.2.01';
          const sub = getVal('kodesubkegiatan', 'kodesub', 'subkegiatan', 'sub') || '5.01.01.2.01.01';
          const bel = getVal('kodebelanja', 'koderekening', 'kode', 'rekening');
          const belObj = belanjaList.find(b => b.kodeBelanja === bel);
          const namaBel = getVal('namabelanja', 'uraianbelanja', 'uraian', 'namarekening') || belObj?.namaBelanja || `Belanja ${bel}`;
          const paguVal = parseFloat(getVal('pagumurni', 'pagu', 'nilaipagu', 'nilai') || '0') || 0;
          const revVal = parseFloat(getVal('revisi', 'pergeseran', 'perubahan') || '0') || 0;
          const spdValRaw = getVal('nilaispd', 'spd', 'paguspd', 'jumlahspd');
          const spdVal = spdValRaw ? parseFloat(spdValRaw) || 0 : (paguVal + revVal);
          const sdVal = getVal('sumberdana', 'sumber', 'sd') || 'DAU';

          const key = `${thn}_${bel}`;
          const isExisting = existingKeys.has(key);

          let err = '';
          if (!bel) {
            err = 'Kode Belanja/Rekening kosong.';
            errs.push(`Baris ${idx + 2}: Kode Belanja kosong.`);
          } else if (paguVal < 0) {
            err = 'Nilai pagu murni tidak boleh negatif.';
            errs.push(`Baris ${idx + 2}: Nilai pagu murni negatif.`);
          }

          parsedRows.push({
            rowNum: idx + 1,
            tahun: thn,
            kodeProgram: prog,
            kodeKegiatan: keg,
            kodeSub: sub,
            kodeBelanja: bel,
            namaBelanja: namaBel,
            pagu: paguVal,
            revisi: revVal,
            nilaiSPD: spdVal,
            sumberDana: sdVal,
            isValid: !err,
            status: isExisting ? 'Akan Diperbarui' : 'Data Baru',
            validationError: err
          });
        });

        setPreviewData(parsedRows);
        setImportErrors(errs);
      } catch (err: any) {
        console.error('Failed to parse Excel:', err);
        setImportErrors([`Gagal membaca file Excel: ${err?.message || 'Format tidak didukung'}`]);
        setPreviewData([]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Execute Import
  const handleProcessImportExcel = () => {
    const validRows = previewData.filter(r => r.isValid);
    if (validRows.length === 0) return;

    const res = importAnggaranBatch(
      validRows.map(r => ({
        tahun: r.tahun,
        kodeProgram: r.kodeProgram,
        kodeKegiatan: r.kodeKegiatan,
        kodeSub: r.kodeSub,
        kodeBelanja: r.kodeBelanja,
        namaBelanja: r.namaBelanja,
        pagu: r.pagu,
        revisi: r.revisi,
        nilaiSPD: r.nilaiSPD,
        sumberDana: r.sumberDana
      })),
      importedFileName || 'Import_Pagu_Anggaran.xlsx'
    );

    setImportSuccessMsg(
      `Berhasil mengimpor ${res.successCount} data Pagu Anggaran (${res.duplicateCount} data diperbarui secara otomatis).`
    );
    setPreviewData([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const belObj = belanjaList.find(b => b.kodeBelanja === kodeBelanja);
    addAnggaran({
      tahun: selectedTahun,
      kodeProgram,
      kodeKegiatan,
      kodeSub,
      kodeBelanja,
      namaBelanja: belObj?.namaBelanja || 'Belanja Operasional',
      pagu,
      revisi,
      nilaiSPD,
      operator: currentUser.nama,
      sumberDana
    });
    setShowForm(false);
    setPagu(100000000);
    setRevisi(0);
    setNilaiSPD(100000000);
  };

  const currentAnggaran = anggaranList.filter(a => a.tahun === selectedTahun);
  const totalPaguMurni = currentAnggaran.reduce((s, a) => s + a.pagu, 0);
  const totalRevisi = currentAnggaran.reduce((s, a) => s + a.revisi, 0);
  const totalNilaiSPD = currentAnggaran.reduce((s, a) => s + (a.nilaiSPD !== undefined ? a.nilaiSPD : a.paguAkhir), 0);
  const totalPaguAkhir = currentAnggaran.reduce((s, a) => s + a.paguAkhir, 0);

  const validPreviewCount = previewData.filter(r => r.isValid).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Input Anggaran & Pagu Belanja</h1>
          </div>
          <p className="text-xs text-slate-400">
            Penetapan Pagu Murni, Pergeseran / Revisi Anggaran & Nilai SPD Tahun Anggaran {selectedTahun}
          </p>
        </div>

        {!isReadOnly && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowImportModal(true);
                setImportSuccessMsg(null);
                setImportErrors([]);
                setPreviewData([]);
                setImportedFileName('');
              }}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-bold text-emerald-400 hover:border-emerald-500 hover:bg-slate-800 transition"
              id="btn-import-excel-anggaran"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Import File Excel</span>
            </button>

            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-950/50"
              id="btn-toggle-add-anggaran"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Pagu Anggaran</span>
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Pagu Murni</span>
          <div className="mt-1 text-base font-black text-white">Rp {totalPaguMurni.toLocaleString('id-ID')}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Revisi / Pergeseran</span>
          <div className="mt-1 text-base font-black text-amber-400">
            {totalRevisi >= 0 ? '+' : ''}Rp {totalRevisi.toLocaleString('id-ID')}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 border-l-4 border-l-sky-500">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">Total Nilai SPD</span>
          <div className="mt-1 text-base font-black text-sky-300">Rp {totalNilaiSPD.toLocaleString('id-ID')}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 border-l-4 border-l-emerald-500">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Total Pagu Akhir</span>
          <div className="mt-1 text-base font-black text-emerald-300">Rp {totalPaguAkhir.toLocaleString('id-ID')}</div>
        </div>
      </div>

      {/* INPUT FORM MODAL / SECTION */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-emerald-600/40 bg-slate-900 p-6 shadow-2xl space-y-4">
          <h2 className="text-sm font-bold text-emerald-300 border-b border-slate-800 pb-2">
            Form Penetapan Pagu Belanja
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-slate-300">Pilih Program:</label>
              <select
                value={kodeProgram}
                onChange={e => {
                  setKodeProgram(e.target.value);
                  const kegs = kegiatanList.filter(k => k.kodeProgram === e.target.value);
                  if (kegs.length > 0) setKodeKegiatan(kegs[0].kodeKegiatan);
                }}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white"
              >
                {programs.filter(p => p.tahun === selectedTahun).map(p => (
                  <option key={p.kodeProgram} value={p.kodeProgram}>
                    {p.kodeProgram} - {p.namaProgram}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Pilih Kegiatan:</label>
              <select
                value={kodeKegiatan}
                onChange={e => {
                  setKodeKegiatan(e.target.value);
                  const subs = subKegiatanList.filter(s => s.kodeKegiatan === e.target.value);
                  if (subs.length > 0) setKodeSub(subs[0].kodeSub);
                }}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white"
              >
                {filteredKegiatan.map(k => (
                  <option key={k.kodeKegiatan} value={k.kodeKegiatan}>
                    {k.kodeKegiatan} - {k.namaKegiatan}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Pilih Sub Kegiatan:</label>
              <select
                value={kodeSub}
                onChange={e => setKodeSub(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white"
              >
                {filteredSub.map(s => (
                  <option key={s.kodeSub} value={s.kodeSub}>
                    {s.kodeSub} - {s.namaSub}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Rekening Belanja:</label>
              <select
                value={kodeBelanja}
                onChange={e => setKodeBelanja(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white"
              >
                {belanjaList.map(b => (
                  <option key={b.kodeBelanja} value={b.kodeBelanja}>
                    {b.kodeBelanja} - {b.namaBelanja}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Nilai Pagu Murni (Rp):</label>
              <input
                type="number"
                required
                min={0}
                value={pagu}
                onChange={e => {
                  const val = Number(e.target.value);
                  setPagu(val);
                  setNilaiSPD(val + revisi);
                }}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-mono font-bold text-emerald-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Revisi / Pergeseran (Rp):</label>
              <input
                type="number"
                value={revisi}
                onChange={e => {
                  const val = Number(e.target.value);
                  setRevisi(val);
                  setNilaiSPD(pagu + val);
                }}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-mono font-bold text-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Nilai SPD (Surat Penyediaan Dana) (Rp):</label>
              <input
                type="number"
                required
                min={0}
                value={nilaiSPD}
                onChange={e => setNilaiSPD(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-mono font-bold text-sky-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Sumber Dana:</label>
              <select
                value={sumberDana}
                onChange={e => setSumberDana(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white"
              >
                {sumberDanaList.map(sd => (
                  <option key={sd.kodeSumber} value={sd.namaSumber || sd.kodeSumber}>
                    {sd.namaSumber}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-md"
            >
              Simpan Pagu Anggaran
            </button>
          </div>
        </form>
      )}

      {/* TABLE DATA ANGGARAN */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Rincian Pagu Anggaran TA {selectedTahun}
          </h3>
          <input
            type="text"
            placeholder="Cari kode/uraian belanja..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-300 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Kode Belanja</th>
                <th className="px-4 py-3">Uraian Belanja</th>
                <th className="px-4 py-3 text-right">Pagu Murni</th>
                <th className="px-4 py-3 text-right">Revisi</th>
                <th className="px-4 py-3 text-right text-sky-400">Nilai SPD</th>
                <th className="px-4 py-3 text-right">Pagu Akhir</th>
                <th className="px-4 py-3">Sumber Dana</th>
                <th className="px-4 py-3">Operator</th>
                {!isReadOnly && <th className="px-4 py-3 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {currentAnggaran
                .filter(
                  a =>
                    a.kodeBelanja.includes(searchTerm) ||
                    a.namaBelanja.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(a => (
                  <tr key={a.id} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono font-bold text-emerald-400">{a.kodeBelanja}</td>
                    <td className="px-4 py-3 font-semibold text-white max-w-xs">{a.namaBelanja}</td>
                    <td className="px-4 py-3 text-right font-mono">Rp {a.pagu.toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3 text-right font-mono text-amber-400">
                      {a.revisi >= 0 ? '+' : ''}Rp {a.revisi.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-sky-300">
                      Rp {(a.nilaiSPD !== undefined ? a.nilaiSPD : a.paguAkhir).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-300">
                      Rp {a.paguAkhir.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">{a.sumberDana || 'DAU'}</td>
                    <td className="px-4 py-3 text-slate-400">{a.operator}</td>
                    {!isReadOnly && (
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(a)}
                            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-amber-400 transition"
                            title="Edit Pagu Anggaran"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeletingAnggaran(a)}
                            className="rounded p-1 text-slate-400 hover:bg-rose-950 hover:text-rose-400 transition"
                            title="Hapus Data"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT ANGGARAN MODAL */}
      {editingAnggaran && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Edit Pagu Anggaran</h3>
              </div>
              <button
                onClick={() => setEditingAnggaran(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-mono font-bold text-[11px]">{editingAnggaran.kodeBelanja}</span>
                <span className="text-white font-semibold block mt-0.5">{editingAnggaran.namaBelanja}</span>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Nilai Pagu Murni (Rp):</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={editPagu}
                  onChange={e => setEditPagu(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-mono font-bold text-emerald-400"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Revisi / Pergeseran (Rp):</label>
                <input
                  type="number"
                  value={editRevisi}
                  onChange={e => setEditRevisi(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-mono font-bold text-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Nilai SPD (Surat Penyediaan Dana) (Rp):</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={editNilaiSPD}
                  onChange={e => setEditNilaiSPD(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-mono font-bold text-sky-400"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Sumber Dana:</label>
                <select
                  value={editSumberDana}
                  onChange={e => setEditSumberDana(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white"
                >
                  {sumberDanaList.map(sd => (
                    <option key={sd.kodeSumber} value={sd.namaSumber || sd.kodeSumber}>
                      {sd.namaSumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 flex justify-between font-bold">
                <span>Estimasi Pagu Akhir:</span>
                <span className="text-emerald-400 font-mono">Rp {(editPagu + editRevisi).toLocaleString('id-ID')}</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingAnggaran(null)}
                  className="rounded-xl bg-slate-800 px-4 py-2 font-bold text-slate-300 hover:bg-slate-700 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2 font-bold text-white transition shadow-md"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingAnggaran && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-rose-800/50 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-950 border border-rose-800/60">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Konfirmasi Hapus Data Pagu</h3>
                <p className="text-xs text-slate-400">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs space-y-1">
              <div className="text-emerald-400 font-mono font-bold">{deletingAnggaran.kodeBelanja}</div>
              <div className="text-white font-semibold">{deletingAnggaran.namaBelanja}</div>
              <div className="text-slate-400">Pagu Akhir: Rp {deletingAnggaran.paguAkhir.toLocaleString('id-ID')}</div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingAnggaran(null)}
                className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-bold text-slate-300 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-xl bg-rose-600 hover:bg-rose-500 px-5 py-2.5 text-xs font-bold text-white transition shadow-md"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT EXCEL MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-3xl rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Import Pagu Anggaran dari Excel</h3>
                  <p className="text-xs text-slate-400">
                    Upload file spreadsheet (.xlsx/.xls) untuk memperbarui atau menambah Pagu Anggaran TA {selectedTahun}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Success Banner */}
            {importSuccessMsg && (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-xs font-semibold text-emerald-300 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <span>{importSuccessMsg}</span>
              </div>
            )}

            {/* Error Banner */}
            {importErrors.length > 0 && (
              <div className="rounded-2xl border border-rose-500/40 bg-rose-950/40 p-3.5 text-xs text-rose-300 space-y-1">
                <div className="font-bold flex items-center gap-2 text-rose-400">
                  <AlertCircle className="h-4 w-4" /> Ada kesalahan pada data Excel:
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-300/90 max-h-24 overflow-y-auto">
                  {importErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Template Download & Upload Dropzone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">1. Unduh Format Template</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Gunakan template standar dengan kolom: Tahun, Kode Program, Kode Kegiatan, Kode Sub, Kode Belanja, Pagu Murni, Revisi, Nilai SPD, Sumber Dana.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-300 border border-slate-700 py-2.5 transition"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Template Excel</span>
                </button>
              </div>

              <div className="rounded-2xl border border-dashed border-emerald-600/50 bg-emerald-950/20 hover:bg-emerald-950/30 p-4 flex flex-col items-center justify-center text-center transition">
                <Upload className="h-8 w-8 text-emerald-400 mb-2" />
                <span className="text-xs font-bold text-slate-200">2. Upload File Excel Data Pagu</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Pilih file .xlsx atau .xls dari komputer Anda</p>
                <label className="mt-3 cursor-pointer rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-md transition inline-flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Pilih File Excel</span>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUploadExcel}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Preview Data Table */}
            {previewData.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" /> Pratinjau Data Parsed ({previewData.length} baris)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {validPreviewCount} data valid siap diimpor
                  </span>
                </div>

                <div className="max-h-56 overflow-y-auto border border-slate-800 rounded-2xl bg-slate-950 text-xs scrollbar-none">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900 text-slate-300 font-bold sticky top-0 border-b border-slate-800">
                      <tr>
                        <th className="px-3 py-2">No</th>
                        <th className="px-3 py-2">Kode Belanja</th>
                        <th className="px-3 py-2">Uraian Belanja</th>
                        <th className="px-3 py-2 text-right">Pagu Murni</th>
                        <th className="px-3 py-2 text-right">Revisi</th>
                        <th className="px-3 py-2 text-right text-sky-400">Nilai SPD</th>
                        <th className="px-3 py-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {previewData.slice(0, 15).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/50">
                          <td className="px-3 py-2 font-mono text-slate-500">{row.rowNum}</td>
                          <td className="px-3 py-2 font-mono text-emerald-400 font-bold">{row.kodeBelanja || '-'}</td>
                          <td className="px-3 py-2 text-white max-w-xs truncate">{row.namaBelanja}</td>
                          <td className="px-3 py-2 text-right font-mono">Rp {row.pagu.toLocaleString('id-ID')}</td>
                          <td className="px-3 py-2 text-right font-mono text-amber-400">Rp {row.revisi.toLocaleString('id-ID')}</td>
                          <td className="px-3 py-2 text-right font-mono text-sky-300">Rp {row.nilaiSPD.toLocaleString('id-ID')}</td>
                          <td className="px-3 py-2 text-center">
                            {row.isValid ? (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                row.status === 'Akan Diperbarui' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              }`}>
                                {row.status}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800" title={row.validationError}>
                                Error
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewData.length > 15 && (
                    <div className="p-2 text-center text-[11px] text-slate-400 border-t border-slate-800 bg-slate-900">
                      ... dan {previewData.length - 15} baris data lainnya
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-bold text-slate-300 transition"
              >
                Tutup
              </button>

              <button
                type="button"
                disabled={validPreviewCount === 0}
                onClick={handleProcessImportExcel}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-950/50 transition"
              >
                <FileCheck className="h-4 w-4" />
                <span>Proses Import {validPreviewCount} Data Pagu</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
