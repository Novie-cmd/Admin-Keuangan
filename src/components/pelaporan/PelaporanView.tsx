import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { isCodeEqual } from '../../utils/codeUtils';
import { NTBLogo } from '../common/NTBLogo';
import * as XLSX from 'xlsx';
import { safeDownloadExcel } from '../../utils/downloadHelper';
import { Realisasi, Belanja, SubKegiatan } from '../../types';
import {
  FileText,
  Printer,
  Download,
  Filter,
  Search,
  BookOpen,
  Calendar,
  Layers,
  Building2,
  ChevronDown,
  Check,
  X,
  Eye,
  Info,
  Sparkles
} from 'lucide-react';

interface SubKegiatanComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ kodeSub: string; namaSub: string }>;
}

const SubKegiatanCombobox: React.FC<SubKegiatanComboboxProps> = ({
  value,
  onChange,
  options
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.kodeSub === value);

  const filteredOptions = options.filter(
    o =>
      o.kodeSub.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.namaSub.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayLabel =
    value === 'all'
      ? '-- Semua Sub Kegiatan (Rekapitulasi Global) --'
      : selectedOption
      ? `${selectedOption.kodeSub} - ${selectedOption.namaSub}`
      : value;

  return (
    <div ref={wrapperRef} className="relative max-w-xl w-full">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between bg-slate-900 border border-slate-700 hover:border-amber-500 rounded-xl px-3 py-2 cursor-pointer text-xs transition-colors shadow-sm"
      >
        <span className="font-semibold text-white truncate mr-2">
          {displayLabel}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform ${
            isOpen ? 'rotate-180 text-amber-400' : ''
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-xs">
          <div className="p-2 border-b border-slate-800 flex items-center gap-2 bg-slate-950">
            <Search className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Ketik kode atau nama Sub Kegiatan..."
              className="bg-transparent text-white font-medium text-xs focus:outline-none w-full placeholder:text-slate-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-slate-400 hover:text-white text-[10px] bg-slate-800 px-2 py-0.5 rounded-lg"
              >
                Hapus
              </button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/50 scrollbar-thin">
            <div
              onClick={() => {
                onChange('all');
                setIsOpen(false);
                setSearchTerm('');
              }}
              className={`p-2.5 cursor-pointer font-semibold transition-colors hover:bg-amber-500/10 hover:text-amber-300 ${
                value === 'all'
                  ? 'bg-amber-500/20 text-amber-300 font-bold'
                  : 'text-slate-300'
              }`}
            >
              -- Semua Sub Kegiatan (Rekapitulasi Global) --
            </div>

            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-slate-500 italic">
                Sub Kegiatan dengan pencarian "{searchTerm}" tidak ditemukan.
              </div>
            ) : (
              filteredOptions.map(s => {
                const isSelected = s.kodeSub === value;
                return (
                  <div
                    key={s.kodeSub}
                    onClick={() => {
                      onChange(s.kodeSub);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`p-2.5 cursor-pointer transition-colors hover:bg-amber-500/10 hover:text-amber-300 flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 font-bold'
                        : 'text-slate-200'
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="font-semibold text-white text-xs leading-snug">
                        {s.namaSub}
                      </span>
                      <span className="font-mono text-amber-400 text-[11px] font-bold">
                        {s.kodeSub}
                      </span>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-amber-400 shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface BelanjaComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ kodeBelanja: string; namaBelanja: string }>;
}

const BelanjaCombobox: React.FC<BelanjaComboboxProps> = ({
  value,
  onChange,
  options
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.kodeBelanja === value);

  const filteredOptions = options.filter(
    o =>
      o.kodeBelanja.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.namaBelanja.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayLabel =
    value === 'all'
      ? '-- Semua Rekening Belanja (Rekapitulasi Global) --'
      : selectedOption
      ? `${selectedOption.namaBelanja} (${selectedOption.kodeBelanja})`
      : value;

  return (
    <div ref={wrapperRef} className="relative max-w-xl w-full">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between bg-slate-900 border border-slate-700 hover:border-amber-500 rounded-xl px-3 py-2 cursor-pointer text-xs transition-colors shadow-sm"
      >
        <span className="font-semibold text-white truncate mr-2">
          {displayLabel}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform ${
            isOpen ? 'rotate-180 text-amber-400' : ''
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-xs">
          <div className="p-2 border-b border-slate-800 flex items-center gap-2 bg-slate-950">
            <Search className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Ketik nama atau kode Rekening Belanja..."
              className="bg-transparent text-white font-medium text-xs focus:outline-none w-full placeholder:text-slate-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-slate-400 hover:text-white text-[10px] bg-slate-800 px-2 py-0.5 rounded-lg"
              >
                Hapus
              </button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/50 scrollbar-thin">
            <div
              onClick={() => {
                onChange('all');
                setIsOpen(false);
                setSearchTerm('');
              }}
              className={`p-2.5 cursor-pointer font-semibold transition-colors hover:bg-amber-500/10 hover:text-amber-300 ${
                value === 'all'
                  ? 'bg-amber-500/20 text-amber-300 font-bold'
                  : 'text-slate-300'
              }`}
            >
              -- Semua Rekening Belanja (Rekapitulasi Global) --
            </div>

            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-slate-500 italic">
                Rekening Belanja dengan pencarian "{searchTerm}" tidak ditemukan.
              </div>
            ) : (
              filteredOptions.map(b => {
                const isSelected = b.kodeBelanja === value;
                return (
                  <div
                    key={b.kodeBelanja}
                    onClick={() => {
                      onChange(b.kodeBelanja);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`p-2.5 cursor-pointer transition-colors hover:bg-amber-500/10 hover:text-amber-300 flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 font-bold'
                        : 'text-slate-200'
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="font-semibold text-white text-xs leading-snug">
                        {b.namaBelanja}
                      </span>
                      <span className="font-mono text-emerald-400 text-[11px] font-bold">
                        {b.kodeBelanja}
                      </span>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-amber-400 shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface RealisasiDetailFilter {
  title: string;
  subtitle?: string;
  kodeSub?: string;
  kodeBelanja?: string;
  kodeKegiatan?: string;
  kodeProgram?: string;
}

interface RealisasiDetailModalProps {
  filter: RealisasiDetailFilter;
  onClose: () => void;
  currentRealisasi: Realisasi[];
  belanjaList: Belanja[];
  subKegiatanList: SubKegiatan[];
  selectedTahun: number;
}

const RealisasiDetailModal: React.FC<RealisasiDetailModalProps> = ({
  filter,
  onClose,
  currentRealisasi,
  belanjaList,
  subKegiatanList,
  selectedTahun
}) => {
  const [modalSearch, setModalSearch] = useState('');

  const matchingRealisasi = currentRealisasi.filter(r => {
    if (filter.kodeSub && !isCodeEqual(r.kodeSub, filter.kodeSub)) return false;
    if (filter.kodeBelanja && !isCodeEqual(r.kodeBelanja, filter.kodeBelanja)) return false;
    if (filter.kodeKegiatan && !isCodeEqual(r.kodeKegiatan, filter.kodeKegiatan)) return false;
    if (filter.kodeProgram && !isCodeEqual(r.kodeProgram, filter.kodeProgram)) return false;
    return true;
  });

  const searchedRealisasi = matchingRealisasi.filter(r => {
    if (!modalSearch.trim()) return true;
    const q = modalSearch.toLowerCase();
    const bObj = belanjaList.find(b => isCodeEqual(b.kodeBelanja, r.kodeBelanja));
    const namaBel = bObj?.namaBelanja || '';
    const sObj = subKegiatanList.find(s => isCodeEqual(s.kodeSub, r.kodeSub));
    const namaSub = sObj?.namaSub || '';
    return (
      (r.uraian && r.uraian.toLowerCase().includes(q)) ||
      (r.noSP2D && r.noSP2D.toLowerCase().includes(q)) ||
      (r.noSPM && r.noSPM.toLowerCase().includes(q)) ||
      (r.rekanan && r.rekanan.toLowerCase().includes(q)) ||
      r.kodeBelanja.toLowerCase().includes(q) ||
      namaBel.toLowerCase().includes(q) ||
      r.kodeSub.toLowerCase().includes(q) ||
      namaSub.toLowerCase().includes(q)
    );
  });

  const totalNilaiModal = searchedRealisasi.reduce((s, r) => s + r.nilai, 0);

  const exportModalExcel = () => {
    const rows = searchedRealisasi.map((r, idx) => {
      const bObj = belanjaList.find(b => isCodeEqual(b.kodeBelanja, r.kodeBelanja));
      const sObj = subKegiatanList.find(s => isCodeEqual(s.kodeSub, r.kodeSub));
      return {
        'No': idx + 1,
        'Tanggal SP2D': r.tanggal,
        'Nomor SP2D': r.noSP2D,
        'Nomor SPM': r.noSPM || '-',
        'Kode Sub Kegiatan': r.kodeSub,
        'Nama Sub Kegiatan': sObj?.namaSub || r.kodeSub,
        'Kode Belanja': r.kodeBelanja,
        'Nama Rekening Belanja': bObj?.namaBelanja || `Belanja ${r.kodeBelanja}`,
        'Uraian Realisasi': r.uraian || '-',
        'Rekanan / Penyedia': r.rekanan || '-',
        'Nilai Realisasi (Rp)': r.nilai
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Uraian_Realisasi');
    safeDownloadExcel(wb, `Rincian_Uraian_Realisasi_${selectedTahun}.xlsx`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 p-5 bg-slate-950">
          <div className="space-y-1 pr-6">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                Rincian Uraian Realisasi
              </span>
              <span className="text-xs font-semibold text-slate-400">TA {selectedTahun}</span>
            </div>
            <h2 className="text-lg font-bold text-white leading-tight">
              {filter.title}
            </h2>
            {filter.subtitle && (
              <p className="text-xs text-amber-400 font-semibold">
                {filter.subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Stat Summary Bar */}
        <div className="flex flex-col gap-3 p-4 bg-slate-900/90 border-b border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Stat Card 1: Jumlah Transaksi */}
            <div className="flex items-center gap-3 rounded-2xl bg-slate-950 p-3 border border-emerald-500/30">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Jumlah Transaksi</span>
                <div className="text-lg font-black font-mono text-emerald-400">
                  {searchedRealisasi.length} <span className="text-xs font-normal text-slate-300">Transaksi SP2D</span>
                </div>
              </div>
            </div>

            {/* Stat Card 2: Total Nilai Realisasi */}
            <div className="flex items-center gap-3 rounded-2xl bg-slate-950 p-3 border border-emerald-500/30">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Nilai Realisasi</span>
                <div className="text-lg font-black font-mono text-amber-400">
                  Rp {totalNilaiModal.toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            {/* Stat Card 3: Pencarian Uraian */}
            <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-1">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={modalSearch}
                  onChange={e => setModalSearch(e.target.value)}
                  placeholder="Cari uraian, No SP2D, rekanan..."
                  className="w-full bg-slate-950 text-white rounded-xl pl-9 pr-8 py-2.5 text-xs border border-slate-700 focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
                />
                {modalSearch && (
                  <button
                    onClick={() => setModalSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <button
                onClick={exportModalExcel}
                disabled={searchedRealisasi.length === 0}
                className="flex items-center gap-1.5 shrink-0 rounded-xl bg-emerald-950 hover:bg-emerald-900 px-3 py-2 text-xs font-bold text-emerald-300 border border-emerald-700 disabled:opacity-50 transition-colors"
                title="Ekspor daftar uraian ke Excel"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Excel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {searchedRealisasi.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <FileText className="h-10 w-10 text-slate-600 mx-auto" />
              <p className="font-semibold text-sm">Tidak ada data realisasi yang ditemukan.</p>
              <p className="text-xs text-slate-500">Coba gunakan kata kunci pencarian yang berbeda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 text-slate-300 font-bold uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3 text-center w-12">No</th>
                    <th className="p-3 min-w-[140px]">Tanggal & SP2D</th>
                    <th className="p-3 min-w-[200px]">Sub Kegiatan & Rekening</th>
                    <th className="p-3 min-w-[300px]">Uraian Realisasi Belanja</th>
                    <th className="p-3 min-w-[150px]">Penyedia / Rekanan</th>
                    <th className="p-3 text-right min-w-[140px]">Nilai SP2D (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {searchedRealisasi.map((item, idx) => {
                    const bObj = belanjaList.find(b => isCodeEqual(b.kodeBelanja, item.kodeBelanja));
                    const sObj = subKegiatanList.find(s => isCodeEqual(s.kodeSub, item.kodeSub));
                    return (
                      <tr key={item.id || idx} className="hover:bg-slate-900/80 transition-colors">
                        <td className="p-3 text-center text-slate-500 font-mono font-bold">{idx + 1}</td>
                        <td className="p-3 space-y-1">
                          <div className="font-semibold text-white">{item.tanggal}</div>
                          <div className="font-mono text-[11px] text-amber-400 font-bold">{item.noSP2D}</div>
                          {item.noSPM && (
                            <div className="text-[10px] text-slate-400 font-mono">SPM: {item.noSPM}</div>
                          )}
                        </td>
                        <td className="p-3 space-y-1">
                          <div className="text-[11px] font-bold text-slate-200">
                            {sObj?.namaSub || item.kodeSub}
                          </div>
                          <div className="font-mono text-[10px] text-slate-400">{item.kodeSub}</div>
                          <div className="pt-1 flex items-center gap-1">
                            <span className="font-mono font-bold text-emerald-400 text-[10px] bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60">
                              {item.kodeBelanja}
                            </span>
                            <span className="text-slate-300 text-[10px] truncate max-w-[160px]">
                              {bObj?.namaBelanja || `Belanja ${item.kodeBelanja}`}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3 text-slate-100 text-xs font-normal leading-relaxed break-words shadow-inner">
                            <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Uraian Transaksi:</div>
                            {item.uraian || '-'}
                          </div>
                        </td>
                        <td className="p-3 font-medium text-slate-300 text-xs">
                          {item.rekanan || '-'}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-400 text-sm whitespace-nowrap bg-emerald-950/10">
                          Rp {item.nilai.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-800 p-4 bg-slate-950 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <span className="rounded-lg bg-emerald-950 border border-emerald-700/60 px-2.5 py-1 text-emerald-300 font-mono">
              Total {searchedRealisasi.length} Transaksi
            </span>
            <span className="text-slate-400">Rincian Realisasi SP2D</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Total Nilai Realisasi:</span>
            <span className="text-lg font-black font-mono text-emerald-400">
              Rp {totalNilaiModal.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PelaporanViewProps {
  initialReportType?: string;
}

export const PelaporanView: React.FC<PelaporanViewProps> = ({
  initialReportType = 'laporan-program'
}) => {
  const {
    selectedTahun,
    programs,
    kegiatanList,
    subKegiatanList,
    belanjaList,
    anggaranList,
    realisasiList,
    opd,
    users
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>(initialReportType);
  const [selectedRealisasiFilter, setSelectedRealisasiFilter] = useState<RealisasiDetailFilter | null>(null);

  React.useEffect(() => {
    if (initialReportType) {
      setActiveTab(initialReportType);
    }
  }, [initialReportType]);

  // Penandatangan Signatories State (Synced with Data Pengguna)
  const [selectedPpkId, setSelectedPpkId] = useState<string>('');
  const [selectedKabanId, setSelectedKabanId] = useState<string>('');

  React.useEffect(() => {
    if (users.length > 0) {
      if (!selectedPpkId || !users.some(u => u.id === selectedPpkId)) {
        const ppk = users.find(u => u.role === 'PPK');
        if (ppk) setSelectedPpkId(ppk.id);
        else if (users[0]) setSelectedPpkId(users[0].id);
      }
      if (!selectedKabanId || !users.some(u => u.id === selectedKabanId)) {
        const kaban = users.find(u => u.role === 'Kepala Badan');
        if (kaban) setSelectedKabanId(kaban.id);
        else if (users[0]) setSelectedKabanId(users[0].id);
      }
    }
  }, [users, selectedPpkId, selectedKabanId]);

  const activePpkUser = users.find(u => u.id === selectedPpkId) || users.find(u => u.role === 'PPK');
  const activeKabanUser = users.find(u => u.id === selectedKabanId) || users.find(u => u.role === 'Kepala Badan');

  // Filters
  const [filterProgram, setFilterProgram] = useState<string>('all');
  const [filterBulan, setFilterBulan] = useState<number | 'all'>('all');
  const [filterSelectedSub, setFilterSelectedSub] = useState<string>('all');
  const [filterSelectedBelanja, setFilterSelectedBelanja] = useState<string>('all');

  const currentAnggaran = anggaranList.filter(a => Number(a.tahun) === Number(selectedTahun));
  const currentRealisasi = realisasiList.filter(r => Number(r.tahun) === Number(selectedTahun));

  // Helper calculation for Laporan Per Program (Syced with Input Anggaran Pagu & Realisasi)
  const allProgramKodes = Array.from(
    new Set([
      ...programs.filter(p => Number(p.tahun) === Number(selectedTahun)).map(p => p.kodeProgram.trim()),
      ...currentAnggaran.map(a => a.kodeProgram.trim()),
      ...currentRealisasi.map(r => r.kodeProgram.trim())
    ])
  );

  const programReportData = allProgramKodes.map(kode => {
    const pObj = programs.find(p => isCodeEqual(p.kodeProgram, kode));
    const paguMurni = currentAnggaran
      .filter(a => isCodeEqual(a.kodeProgram, kode))
      .reduce((s, a) => s + a.pagu, 0);

    const revisi = currentAnggaran
      .filter(a => isCodeEqual(a.kodeProgram, kode))
      .reduce((s, a) => s + a.revisi, 0);

    const nilaiSPD = currentAnggaran
      .filter(a => isCodeEqual(a.kodeProgram, kode))
      .reduce((s, a) => s + (a.nilaiSPD !== undefined ? a.nilaiSPD : a.paguAkhir), 0);

    const paguAkhir = currentAnggaran
      .filter(a => isCodeEqual(a.kodeProgram, kode))
      .reduce((s, a) => s + a.paguAkhir, 0);

    const real = currentRealisasi
      .filter(r => isCodeEqual(r.kodeProgram, kode))
      .reduce((s, r) => s + r.nilai, 0);

    const sisa = paguAkhir - real;
    const pct = paguAkhir > 0 ? (real / paguAkhir) * 100 : 0;

    return {
      kode,
      nama: pObj?.namaProgram || `PROGRAM ${kode}`,
      paguMurni,
      revisi,
      nilaiSPD,
      paguAkhir,
      realisasi: real,
      sisa,
      persen: pct
    };
  });

  // Helper calculation for Laporan Per Kegiatan
  const allKegiatanKodes = Array.from(
    new Set([
      ...kegiatanList.filter(k => Number(k.tahun) === Number(selectedTahun)).map(k => k.kodeKegiatan.trim()),
      ...currentAnggaran.map(a => a.kodeKegiatan.trim()),
      ...currentRealisasi.map(r => r.kodeKegiatan.trim())
    ])
  );

  const kegiatanReportData = allKegiatanKodes.map(kode => {
    const kObj = kegiatanList.find(k => isCodeEqual(k.kodeKegiatan, kode));
    const paguMurni = currentAnggaran
      .filter(a => isCodeEqual(a.kodeKegiatan, kode))
      .reduce((s, a) => s + a.pagu, 0);

    const revisi = currentAnggaran
      .filter(a => isCodeEqual(a.kodeKegiatan, kode))
      .reduce((s, a) => s + a.revisi, 0);

    const nilaiSPD = currentAnggaran
      .filter(a => isCodeEqual(a.kodeKegiatan, kode))
      .reduce((s, a) => s + (a.nilaiSPD !== undefined ? a.nilaiSPD : a.paguAkhir), 0);

    const paguAkhir = currentAnggaran
      .filter(a => isCodeEqual(a.kodeKegiatan, kode))
      .reduce((s, a) => s + a.paguAkhir, 0);

    const real = currentRealisasi
      .filter(r => isCodeEqual(r.kodeKegiatan, kode))
      .reduce((s, r) => s + r.nilai, 0);

    const sisa = paguAkhir - real;
    const pct = paguAkhir > 0 ? (real / paguAkhir) * 100 : 0;

    return {
      kodeProg: kObj?.kodeProgram || currentAnggaran.find(a => isCodeEqual(a.kodeKegiatan, kode))?.kodeProgram || '',
      kodeKeg: kode,
      namaKeg: kObj?.namaKegiatan || `Kegiatan ${kode}`,
      paguMurni,
      revisi,
      nilaiSPD,
      paguAkhir,
      realisasi: real,
      sisa,
      persen: pct
    };
  });

  // Helper calculation for Laporan Per Sub Kegiatan
  const allSubKodes = Array.from(
    new Set([
      ...subKegiatanList.filter(s => Number(s.tahun) === Number(selectedTahun)).map(s => s.kodeSub.trim()),
      ...currentAnggaran.map(a => a.kodeSub.trim()),
      ...currentRealisasi.map(r => r.kodeSub.trim())
    ])
  );

  const subReportData = allSubKodes.map(kode => {
    const sObj = subKegiatanList.find(s => isCodeEqual(s.kodeSub, kode));
    const paguMurni = currentAnggaran
      .filter(a => isCodeEqual(a.kodeSub, kode))
      .reduce((s, a) => s + a.pagu, 0);

    const revisi = currentAnggaran
      .filter(a => isCodeEqual(a.kodeSub, kode))
      .reduce((s, a) => s + a.revisi, 0);

    const nilaiSPD = currentAnggaran
      .filter(a => isCodeEqual(a.kodeSub, kode))
      .reduce((s, a) => s + (a.nilaiSPD !== undefined ? a.nilaiSPD : a.paguAkhir), 0);

    const paguAkhir = currentAnggaran
      .filter(a => isCodeEqual(a.kodeSub, kode))
      .reduce((s, a) => s + a.paguAkhir, 0);

    const real = currentRealisasi
      .filter(r => isCodeEqual(r.kodeSub, kode))
      .reduce((s, r) => s + r.nilai, 0);

    const sisa = paguAkhir - real;
    const pct = paguAkhir > 0 ? (real / paguAkhir) * 100 : 0;

    return {
      kodeSub: kode,
      namaSub: sObj?.namaSub || `Sub-Kegiatan ${kode}`,
      paguMurni,
      revisi,
      nilaiSPD,
      paguAkhir,
      realisasi: real,
      sisa,
      persen: pct
    };
  });

  // Options & calculation for detailed Rekening Belanja under selected Sub Kegiatan
  const availableSubKegiatanOptions = Array.from(
    new Set([
      ...subKegiatanList.filter(s => Number(s.tahun) === Number(selectedTahun)).map(s => s.kodeSub.trim()),
      ...currentAnggaran.map(a => a.kodeSub.trim()),
      ...currentRealisasi.map(r => r.kodeSub.trim())
    ])
  ).map(kode => {
    const sObj = subKegiatanList.find(s => isCodeEqual(s.kodeSub, kode));
    const aMatch = currentAnggaran.find(a => isCodeEqual(a.kodeSub, kode));
    const kObj = kegiatanList.find(k => isCodeEqual(k.kodeKegiatan, sObj?.kodeKegiatan || aMatch?.kodeKegiatan));
    const pObj = programs.find(p => isCodeEqual(p.kodeProgram, aMatch?.kodeProgram));
    return {
      kodeSub: kode,
      namaSub: sObj?.namaSub || `Sub-Kegiatan ${kode}`,
      kodeKegiatan: sObj?.kodeKegiatan || aMatch?.kodeKegiatan || '',
      namaKegiatan: kObj?.namaKegiatan || '',
      kodeProgram: aMatch?.kodeProgram || '',
      namaProgram: pObj?.namaProgram || ''
    };
  });

  const selectedSubDetail = availableSubKegiatanOptions.find(s => isCodeEqual(s.kodeSub, filterSelectedSub));
  const selectedSubAnggaran = currentAnggaran.filter(a => isCodeEqual(a.kodeSub, filterSelectedSub));

  const selectedSubBelanjaKodes = Array.from(
    new Set([
      ...selectedSubAnggaran.map(a => a.kodeBelanja.trim()),
      ...currentRealisasi.filter(r => isCodeEqual(r.kodeSub, filterSelectedSub)).map(r => r.kodeBelanja.trim())
    ])
  );

  const selectedSubBelanjaData = selectedSubBelanjaKodes.map(kodeBelanja => {
    const bObj = belanjaList.find(b => isCodeEqual(b.kodeBelanja, kodeBelanja));
    const aMatches = selectedSubAnggaran.filter(a => isCodeEqual(a.kodeBelanja, kodeBelanja));
    const aMatch = aMatches[0];

    const paguMurni = aMatches.reduce((s, a) => s + a.pagu, 0);
    const revisi = aMatches.reduce((s, a) => s + a.revisi, 0);
    const nilaiSPD = aMatches.reduce((s, a) => s + (a.nilaiSPD !== undefined ? a.nilaiSPD : a.paguAkhir), 0);
    const paguAkhir = aMatches.reduce((s, a) => s + a.paguAkhir, 0);

    const realisasi = currentRealisasi
      .filter(r => isCodeEqual(r.kodeSub, filterSelectedSub) && isCodeEqual(r.kodeBelanja, kodeBelanja))
      .reduce((s, r) => s + r.nilai, 0);

    const sisa = paguAkhir - realisasi;
    const persen = paguAkhir > 0 ? (realisasi / paguAkhir) * 100 : 0;

    return {
      kodeBelanja,
      namaBelanja: aMatch?.namaBelanja || bObj?.namaBelanja || `Belanja ${kodeBelanja}`,
      jenisBelanja: bObj?.jenisBelanja || 'Operasional',
      paguMurni,
      revisi,
      nilaiSPD,
      paguAkhir,
      realisasi,
      sisa,
      persen
    };
  });

  // Helper calculation for Laporan Per Belanja
  const allBelanjaKodes = Array.from(
    new Set([
      ...belanjaList.map(b => b.kodeBelanja.trim()),
      ...currentAnggaran.map(a => a.kodeBelanja.trim()),
      ...currentRealisasi.map(r => r.kodeBelanja.trim())
    ])
  );

  const belanjaReportData = allBelanjaKodes.map(kode => {
    const bObj = belanjaList.find(b => isCodeEqual(b.kodeBelanja, kode));
    const aMatch = currentAnggaran.find(a => isCodeEqual(a.kodeBelanja, kode));

    const paguMurni = currentAnggaran
      .filter(a => isCodeEqual(a.kodeBelanja, kode))
      .reduce((s, a) => s + a.pagu, 0);

    const revisi = currentAnggaran
      .filter(a => isCodeEqual(a.kodeBelanja, kode))
      .reduce((s, a) => s + a.revisi, 0);

    const nilaiSPD = currentAnggaran
      .filter(a => isCodeEqual(a.kodeBelanja, kode))
      .reduce((s, a) => s + (a.nilaiSPD !== undefined ? a.nilaiSPD : a.paguAkhir), 0);

    const paguAkhir = currentAnggaran
      .filter(a => isCodeEqual(a.kodeBelanja, kode))
      .reduce((s, a) => s + a.paguAkhir, 0);

    const real = currentRealisasi
      .filter(r => isCodeEqual(r.kodeBelanja, kode))
      .reduce((s, r) => s + r.nilai, 0);

    const sisa = paguAkhir - real;
    const pct = paguAkhir > 0 ? (real / paguAkhir) * 100 : 0;

    return {
      kode,
      nama: aMatch?.namaBelanja || bObj?.namaBelanja || `Belanja ${kode}`,
      jenis: bObj?.jenisBelanja || 'Operasional',
      paguMurni,
      revisi,
      nilaiSPD,
      paguAkhir,
      realisasi: real,
      sisa,
      persen: pct
    };
  });

  // Options & calculation for detailed Sub Kegiatan under selected Rekening Belanja
  const availableBelanjaOptions = Array.from(
    new Set([
      ...belanjaList.map(b => b.kodeBelanja.trim()),
      ...currentAnggaran.map(a => a.kodeBelanja.trim()),
      ...currentRealisasi.map(r => r.kodeBelanja.trim())
    ])
  ).map(kode => {
    const bObj = belanjaList.find(b => isCodeEqual(b.kodeBelanja, kode));
    const aMatch = currentAnggaran.find(a => isCodeEqual(a.kodeBelanja, kode));
    return {
      kodeBelanja: kode,
      namaBelanja: aMatch?.namaBelanja || bObj?.namaBelanja || `Belanja ${kode}`,
      jenisBelanja: bObj?.jenisBelanja || 'Operasional'
    };
  });

  const selectedBelanjaDetail = availableBelanjaOptions.find(b => isCodeEqual(b.kodeBelanja, filterSelectedBelanja));

  const selectedBelanjaSubKodes = Array.from(
    new Set([
      ...currentAnggaran.filter(a => isCodeEqual(a.kodeBelanja, filterSelectedBelanja)).map(a => a.kodeSub.trim()),
      ...currentRealisasi.filter(r => isCodeEqual(r.kodeBelanja, filterSelectedBelanja)).map(r => r.kodeSub.trim())
    ])
  );

  const selectedBelanjaSubData = selectedBelanjaSubKodes.map(kodeSub => {
    const sObj = subKegiatanList.find(s => isCodeEqual(s.kodeSub, kodeSub));
    const aMatches = currentAnggaran.filter(a => isCodeEqual(a.kodeSub, kodeSub) && isCodeEqual(a.kodeBelanja, filterSelectedBelanja));

    const paguMurni = aMatches.reduce((s, a) => s + a.pagu, 0);
    const revisi = aMatches.reduce((s, a) => s + a.revisi, 0);
    const nilaiSPD = aMatches.reduce((s, a) => s + (a.nilaiSPD !== undefined ? a.nilaiSPD : a.paguAkhir), 0);
    const paguAkhir = aMatches.reduce((s, a) => s + a.paguAkhir, 0);

    const realisasi = currentRealisasi
      .filter(r => isCodeEqual(r.kodeSub, kodeSub) && isCodeEqual(r.kodeBelanja, filterSelectedBelanja))
      .reduce((s, r) => s + r.nilai, 0);

    const sisa = paguAkhir - realisasi;
    const persen = paguAkhir > 0 ? (realisasi / paguAkhir) * 100 : 0;

    return {
      kodeSub,
      namaSub: sObj?.namaSub || `Sub-Kegiatan ${kodeSub}`,
      paguMurni,
      revisi,
      nilaiSPD,
      paguAkhir,
      realisasi,
      sisa,
      persen
    };
  });

  // Helper Export Excel
  const exportToExcel = () => {
    let exportRows: any[] = [];
    let titleName = 'Laporan_Keuangan_BFMS_NTB';

    if (activeTab === 'laporan-program') {
      titleName = `Realisasi_Program_NTB_${selectedTahun}`;
      exportRows = programReportData.map(r => ({
        'Kode Program': r.kode,
        'Nama Program': r.nama,
        'Pagu Murni (Rp)': r.paguMurni,
        'Pergeseran/Revisi (Rp)': r.revisi,
        'Nilai SPD (Rp)': r.nilaiSPD,
        'Pagu Akhir (Rp)': r.paguAkhir,
        'Realisasi SP2D (Rp)': r.realisasi,
        'Sisa Pagu (Rp)': r.sisa,
        'Persentase (%)': r.persen.toFixed(2)
      }));
    } else if (activeTab === 'laporan-kegiatan') {
      titleName = `Realisasi_Kegiatan_NTB_${selectedTahun}`;
      exportRows = kegiatanReportData.map(r => ({
        'Kode Kegiatan': r.kodeKeg,
        'Nama Kegiatan': r.namaKeg,
        'Pagu Murni (Rp)': r.paguMurni,
        'Pergeseran/Revisi (Rp)': r.revisi,
        'Nilai SPD (Rp)': r.nilaiSPD,
        'Pagu Akhir (Rp)': r.paguAkhir,
        'Realisasi SP2D (Rp)': r.realisasi,
        'Sisa Pagu (Rp)': r.sisa,
        'Persentase (%)': r.persen.toFixed(2)
      }));
    } else if (activeTab === 'laporan-subkegiatan') {
      if (filterSelectedSub !== 'all') {
        titleName = `Realisasi_Rekening_SubKegiatan_${filterSelectedSub}_${selectedTahun}`;
        exportRows = selectedSubBelanjaData.map(r => ({
          'Kode Sub Kegiatan': filterSelectedSub,
          'Nama Sub Kegiatan': selectedSubDetail?.namaSub || filterSelectedSub,
          'Kode Rekening Belanja': r.kodeBelanja,
          'Uraian Rekening Belanja': r.namaBelanja,
          'Jenis Belanja': r.jenisBelanja,
          'Pagu Murni (Rp)': r.paguMurni,
          'Pergeseran/Revisi (Rp)': r.revisi,
          'Nilai SPD (Rp)': r.nilaiSPD,
          'Pagu Akhir (Rp)': r.paguAkhir,
          'Realisasi SP2D (Rp)': r.realisasi,
          'Sisa Pagu (Rp)': r.sisa,
          'Persentase (%)': r.persen.toFixed(2)
        }));
      } else {
        titleName = `Realisasi_SubKegiatan_NTB_${selectedTahun}`;
        exportRows = subReportData.map(r => ({
          'Kode Sub Kegiatan': r.kodeSub,
          'Nama Sub Kegiatan': r.namaSub,
          'Pagu Murni (Rp)': r.paguMurni,
          'Pergeseran/Revisi (Rp)': r.revisi,
          'Nilai SPD (Rp)': r.nilaiSPD,
          'Pagu Akhir (Rp)': r.paguAkhir,
          'Realisasi SP2D (Rp)': r.realisasi,
          'Sisa Pagu (Rp)': r.sisa,
          'Persentase (%)': r.persen.toFixed(2)
        }));
      }
    } else {
      if (filterSelectedBelanja !== 'all') {
        titleName = `Realisasi_SubKegiatan_Belanja_${filterSelectedBelanja}_${selectedTahun}`;
        exportRows = selectedBelanjaSubData.map(r => ({
          'Kode Belanja': filterSelectedBelanja,
          'Uraian Belanja': selectedBelanjaDetail?.namaBelanja || filterSelectedBelanja,
          'Kode Sub Kegiatan': r.kodeSub,
          'Nama Sub Kegiatan': r.namaSub,
          'Pagu Murni (Rp)': r.paguMurni,
          'Pergeseran/Revisi (Rp)': r.revisi,
          'Nilai SPD (Rp)': r.nilaiSPD,
          'Pagu Akhir (Rp)': r.paguAkhir,
          'Realisasi SP2D (Rp)': r.realisasi,
          'Sisa Pagu (Rp)': r.sisa,
          'Persentase (%)': r.persen.toFixed(2)
        }));
      } else {
        titleName = `Realisasi_Belanja_NTB_${selectedTahun}`;
        exportRows = belanjaReportData.map(r => ({
          'Kode Belanja': r.kode,
          'Uraian Belanja': r.nama,
          'Jenis Belanja': r.jenis,
          'Pagu Murni (Rp)': r.paguMurni,
          'Pergeseran/Revisi (Rp)': r.revisi,
          'Nilai SPD (Rp)': r.nilaiSPD,
          'Pagu Akhir (Rp)': r.paguAkhir,
          'Realisasi SP2D (Rp)': r.realisasi,
          'Sisa Pagu (Rp)': r.sisa,
          'Persentase (%)': r.persen.toFixed(2)
        }));
      }
    }

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan_Keuangan');
    safeDownloadExcel(wb, `${titleName}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Controls (Hidden during print) */}
      <div className="print:hidden flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">Laporan Keuangan Eksekutif</h1>
          </div>
          <p className="text-xs text-slate-400">
            Penyusunan Laporan Realisasi Anggaran (LRA) BAKESBANGPOLDAGRI NTB TA {selectedTahun}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Penandatangan Selectors (Synced with Data Pengguna) */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 p-1.5 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-bold text-[11px] pl-1">PPK:</span>
              <select
                value={selectedPpkId}
                onChange={e => setSelectedPpkId(e.target.value)}
                className="bg-slate-950 text-white rounded-lg px-2 py-1 border border-slate-700 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.nama} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-bold text-[11px] pl-1">Kepala Badan:</span>
              <select
                value={selectedKabanId}
                onChange={e => setSelectedKabanId(e.target.value)}
                className="bg-slate-950 text-white rounded-lg px-2 py-1 border border-slate-700 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.nama} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-bold text-emerald-400 hover:border-emerald-500 hover:bg-slate-800"
          >
            <Download className="h-4 w-4" />
            <span>Ekspor Excel</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-500 shadow-md"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs Navigation (Hidden during print) */}
      <div className="print:hidden flex overflow-x-auto gap-2 border-b border-slate-800 pb-2 scrollbar-none">
        {[
          { id: 'laporan-program', label: '1. Per Program' },
          { id: 'laporan-kegiatan', label: '2. Per Kegiatan' },
          { id: 'laporan-subkegiatan', label: '3. Per Sub Kegiatan' },
          { id: 'laporan-belanja', label: '4. Per Rekening Belanja' },
          { id: 'laporan-bulanan', label: '5. Laporan Bulanan' },
          { id: 'laporan-triwulan', label: '6. Laporan Triwulan' },
          { id: 'laporan-semester', label: '7. Laporan Semester' },
          { id: 'laporan-tahunan', label: '8. Laporan Tahunan' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
              activeTab === tab.id
                ? 'bg-amber-600 text-white shadow font-bold'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tip Banner for Interactive Realisasi Click */}
      <div className="print:hidden flex items-center justify-between gap-2 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl px-4 py-2.5 text-xs text-emerald-300">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Petunjuk: Klik pada nilai <strong className="text-emerald-200">Realisasi SP2D (Rp)</strong> pada tabel untuk menampilkan rincian <strong>Uraian Belanja</strong> dari transaksi tersebut.</span>
        </div>
      </div>

      {/* REPORT CANVAS SHEET FOR PRINT & DISPLAY */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl text-slate-100 print:border-none print:p-0 print:bg-white print:text-slate-950">
        
        {/* OFFICIAL GOVERNMENT REPORT KOP SURAT / HEADER */}
        <div className="text-center border-b-2 border-slate-700 print:border-slate-900 pb-4 mb-6">
          <div className="flex justify-center mb-2">
            <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-slate-950 print:bg-transparent p-0.5 border border-emerald-500/40 print:border-none shadow-md overflow-hidden">
              {opd?.logoUrl ? (
                <img
                  src={opd.logoUrl}
                  alt="Logo NTB"
                  className="h-full w-full object-cover rounded-lg"
                />
              ) : (
                <NTBLogo className="h-full w-full" />
              )}
            </div>
          </div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 print:text-slate-700">
            PEMERINTAH PROVINSI NUSA TENGGARA BARAT
          </h2>
          <h1 className="text-base font-black uppercase text-white print:text-black sm:text-lg">
            {opd.namaOPD}
          </h1>
          <p className="text-[11px] font-medium text-emerald-400 print:text-slate-600">
            LAPORAN REALISASI ANGGARAN (LRA) TAHUN ANGGARAN {selectedTahun}
          </p>
        </div>

        {/* 1. LAPORAN PER PROGRAM */}
        {activeTab === 'laporan-program' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase text-amber-400 print:text-slate-900 border-b border-slate-800 pb-1">
              I. Laporan Realisasi Keuangan Per Program
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 print:bg-slate-200 text-slate-300 print:text-slate-900 font-bold uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3">Kode Program</th>
                    <th className="p-3">Nama Program</th>
                    <th className="p-3 text-right">Pagu Murni (Rp)</th>
                    <th className="p-3 text-right">Pergeseran (Rp)</th>
                    <th className="p-3 text-right">Nilai SPD (Rp)</th>
                    <th className="p-3 text-right">Pagu Akhir (Rp)</th>
                    <th className="p-3 text-right">Realisasi SP2D (Rp)</th>
                    <th className="p-3 text-right">Sisa Pagu (Rp)</th>
                    <th className="p-3 text-center">% Serapan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                  {programReportData.map(r => (
                    <tr key={r.kode} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-amber-400 print:text-slate-900">{r.kode}</td>
                      <td className="p-3 font-semibold text-white print:text-slate-900">{r.nama}</td>
                      <td className="p-3 text-right font-mono text-slate-300 print:text-slate-800">Rp {r.paguMurni.toLocaleString('id-ID')}</td>
                      <td className="p-3 text-right font-mono text-amber-400/80 print:text-slate-800">Rp {r.revisi.toLocaleString('id-ID')}</td>
                      <td className="p-3 text-right font-mono text-blue-300 print:text-slate-800">Rp {r.nilaiSPD.toLocaleString('id-ID')}</td>
                      <td className="p-3 text-right font-mono font-bold text-white print:text-slate-900">Rp {r.paguAkhir.toLocaleString('id-ID')}</td>
                      <td
                        onClick={() => setSelectedRealisasiFilter({
                          title: `Rincian Uraian Realisasi Program`,
                          subtitle: `${r.kode} - ${r.nama}`,
                          kodeProgram: r.kode
                        })}
                        className="p-3 text-right font-mono text-emerald-400 hover:text-emerald-200 hover:underline cursor-pointer print:text-slate-900 font-bold"
                        title="Klik untuk melihat rincian uraian realisasi"
                      >
                        <span className="inline-flex items-center gap-1 justify-end">
                          <span>Rp {r.realisasi.toLocaleString('id-ID')}</span>
                          <Eye className="h-3.5 w-3.5 text-emerald-400/80 print:hidden" />
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono text-amber-300 print:text-slate-900">
                        Rp {r.sisa.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 text-center font-bold text-emerald-300 print:text-slate-900">
                        {r.persen.toFixed(2)} %
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-950 font-bold border-t-2 border-slate-700 text-white print:bg-slate-100 print:text-black">
                  {(() => {
                    const totalMurni = programReportData.reduce((s, r) => s + r.paguMurni, 0);
                    const totalRev = programReportData.reduce((s, r) => s + r.revisi, 0);
                    const totalSPD = programReportData.reduce((s, r) => s + r.nilaiSPD, 0);
                    const totalAkhir = programReportData.reduce((s, r) => s + r.paguAkhir, 0);
                    const totalReal = programReportData.reduce((s, r) => s + r.realisasi, 0);
                    const totalSisa = totalAkhir - totalReal;
                    const totalPct = totalAkhir > 0 ? (totalReal / totalAkhir) * 100 : 0;
                    return (
                      <tr>
                        <td colSpan={2} className="p-3 text-right uppercase">TOTAL KESELURUHAN PROGRAM:</td>
                        <td className="p-3 text-right font-mono">Rp {totalMurni.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-mono text-amber-300">Rp {totalRev.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-mono text-blue-300">Rp {totalSPD.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-mono text-emerald-400">Rp {totalAkhir.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-mono text-emerald-300">Rp {totalReal.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-mono text-amber-300">Rp {totalSisa.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-center text-emerald-300">{totalPct.toFixed(2)} %</td>
                      </tr>
                    );
                  })()}
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* 2. LAPORAN PER KEGIATAN */}
        {activeTab === 'laporan-kegiatan' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase text-amber-400 print:text-slate-900 border-b border-slate-800 pb-1">
              II. Laporan Realisasi Keuangan Per Kegiatan
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 print:bg-slate-200 text-slate-300 print:text-slate-900 font-bold uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3">Kode Kegiatan</th>
                    <th className="p-3">Nama Kegiatan</th>
                    <th className="p-3 text-right">Pagu Murni (Rp)</th>
                    <th className="p-3 text-right">Pergeseran (Rp)</th>
                    <th className="p-3 text-right">Nilai SPD (Rp)</th>
                    <th className="p-3 text-right">Pagu Akhir (Rp)</th>
                    <th className="p-3 text-right">Realisasi SP2D (Rp)</th>
                    <th className="p-3 text-right">Sisa Pagu (Rp)</th>
                    <th className="p-3 text-center">% Serapan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                  {kegiatanReportData.map(r => (
                    <tr key={r.kodeKeg} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-teal-400 print:text-slate-900">{r.kodeKeg}</td>
                      <td className="p-3 font-semibold text-white print:text-slate-900">{r.namaKeg}</td>
                      <td className="p-3 text-right font-mono text-slate-300 print:text-slate-800">Rp {r.paguMurni.toLocaleString('id-ID')}</td>
                      <td className="p-3 text-right font-mono text-amber-400/80 print:text-slate-800">Rp {r.revisi.toLocaleString('id-ID')}</td>
                      <td className="p-3 text-right font-mono text-blue-300 print:text-slate-800">Rp {r.nilaiSPD.toLocaleString('id-ID')}</td>
                      <td className="p-3 text-right font-mono font-bold text-white print:text-slate-900">Rp {r.paguAkhir.toLocaleString('id-ID')}</td>
                      <td
                        onClick={() => setSelectedRealisasiFilter({
                          title: `Rincian Uraian Realisasi Kegiatan`,
                          subtitle: `${r.kodeKeg} - ${r.namaKeg}`,
                          kodeKegiatan: r.kodeKeg
                        })}
                        className="p-3 text-right font-mono text-emerald-400 hover:text-emerald-200 hover:underline cursor-pointer print:text-slate-900 font-bold"
                        title="Klik untuk melihat rincian uraian realisasi"
                      >
                        <span className="inline-flex items-center gap-1 justify-end">
                          <span>Rp {r.realisasi.toLocaleString('id-ID')}</span>
                          <Eye className="h-3.5 w-3.5 text-emerald-400/80 print:hidden" />
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono text-amber-300 print:text-slate-900">
                        Rp {r.sisa.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 text-center font-bold text-emerald-300 print:text-slate-900">
                        {r.persen.toFixed(2)} %
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-950 font-bold border-t-2 border-slate-700 text-white print:bg-slate-100 print:text-black">
                  {(() => {
                    const totalMurni = kegiatanReportData.reduce((s, r) => s + r.paguMurni, 0);
                    const totalRev = kegiatanReportData.reduce((s, r) => s + r.revisi, 0);
                    const totalSPD = kegiatanReportData.reduce((s, r) => s + r.nilaiSPD, 0);
                    const totalAkhir = kegiatanReportData.reduce((s, r) => s + r.paguAkhir, 0);
                    const totalReal = kegiatanReportData.reduce((s, r) => s + r.realisasi, 0);
                    const totalSisa = totalAkhir - totalReal;
                    const totalPct = totalAkhir > 0 ? (totalReal / totalAkhir) * 100 : 0;
                    return (
                      <tr>
                        <td colSpan={2} className="p-3 text-right uppercase">TOTAL KESELURUHAN KEGIATAN:</td>
                        <td className="p-3 text-right font-mono">Rp {totalMurni.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-mono text-amber-300">Rp {totalRev.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-mono text-blue-300">Rp {totalSPD.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-mono text-emerald-400">Rp {totalAkhir.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-mono text-emerald-300">Rp {totalReal.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-mono text-amber-300">Rp {totalSisa.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-center text-emerald-300">{totalPct.toFixed(2)} %</td>
                      </tr>
                    );
                  })()}
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* 3. LAPORAN PER SUB KEGIATAN */}
        {activeTab === 'laporan-subkegiatan' && (
          <div className="space-y-4">
            {/* Filter Droplist Sub Kegiatan */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 print:hidden">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-amber-400" />
                <label className="text-xs font-bold text-slate-200">Filter Sub Kegiatan:</label>
              </div>
              <SubKegiatanCombobox
                value={filterSelectedSub}
                onChange={setFilterSelectedSub}
                options={availableSubKegiatanOptions}
              />
            </div>

            <h3 className="text-xs font-bold uppercase text-amber-400 print:text-slate-900 border-b border-slate-800 pb-1">
              {filterSelectedSub === 'all'
                ? 'III. Laporan Realisasi Keuangan Per Sub-Kegiatan (Rekapitulasi)'
                : `III. Laporan Realisasi Rekening Belanja - Sub-Kegiatan ${filterSelectedSub}`}
            </h3>

            {filterSelectedSub !== 'all' && selectedSubDetail && (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5 print:bg-slate-100 print:border-slate-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold">Kode Sub Kegiatan: </span>
                    <span className="font-mono font-bold text-amber-400 print:text-black">{selectedSubDetail.kodeSub}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold">Nama Sub Kegiatan: </span>
                    <span className="font-bold text-white print:text-black">{selectedSubDetail.namaSub}</span>
                  </div>
                  {selectedSubDetail.namaKegiatan && (
                    <div className="md:col-span-2">
                      <span className="text-slate-400 font-bold">Kegiatan: </span>
                      <span className="text-slate-300 print:text-slate-800">{selectedSubDetail.kodeKegiatan} - {selectedSubDetail.namaKegiatan}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {filterSelectedSub === 'all' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 print:bg-slate-200 text-slate-300 print:text-slate-900 font-bold uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Kode Sub</th>
                      <th className="p-3">Uraian Sub Kegiatan</th>
                      <th className="p-3 text-right">Pagu Murni (Rp)</th>
                      <th className="p-3 text-right">Pergeseran (Rp)</th>
                      <th className="p-3 text-right">Nilai SPD (Rp)</th>
                      <th className="p-3 text-right">Pagu Akhir (Rp)</th>
                      <th className="p-3 text-right">Realisasi SP2D (Rp)</th>
                      <th className="p-3 text-right">Sisa Pagu (Rp)</th>
                      <th className="p-3 text-center">% Serapan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                    {subReportData.map(r => (
                      <tr key={r.kodeSub} className="hover:bg-slate-800/40 cursor-pointer" onClick={() => setFilterSelectedSub(r.kodeSub)}>
                        <td className="p-3 font-mono font-bold text-amber-400 print:text-slate-900">{r.kodeSub}</td>
                        <td className="p-3 font-semibold text-white print:text-slate-900">{r.namaSub}</td>
                        <td className="p-3 text-right font-mono text-slate-300 print:text-slate-800">Rp {r.paguMurni.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-mono text-amber-400/80 print:text-slate-800">Rp {r.revisi.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-mono text-blue-300 print:text-slate-800">Rp {r.nilaiSPD.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-mono font-bold text-white print:text-slate-900">Rp {r.paguAkhir.toLocaleString('id-ID')}</td>
                        <td
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRealisasiFilter({
                              title: `Rincian Uraian Realisasi Sub-Kegiatan`,
                              subtitle: `${r.kodeSub} - ${r.namaSub}`,
                              kodeSub: r.kodeSub
                            });
                          }}
                          className="p-3 text-right font-mono text-emerald-400 hover:text-emerald-200 hover:underline cursor-pointer print:text-slate-900 font-bold"
                          title="Klik untuk melihat rincian uraian realisasi belanja"
                        >
                          <span className="inline-flex items-center gap-1 justify-end">
                            <span>Rp {r.realisasi.toLocaleString('id-ID')}</span>
                            <Eye className="h-3.5 w-3.5 text-emerald-400/80 print:hidden" />
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono text-amber-300 print:text-slate-900">
                          Rp {r.sisa.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-center font-bold text-emerald-300 print:text-slate-900">
                          {r.persen.toFixed(2)} %
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-950 font-bold border-t-2 border-slate-700 text-white print:bg-slate-100 print:text-black">
                    {(() => {
                      const totalMurni = subReportData.reduce((s, r) => s + r.paguMurni, 0);
                      const totalRev = subReportData.reduce((s, r) => s + r.revisi, 0);
                      const totalSPD = subReportData.reduce((s, r) => s + r.nilaiSPD, 0);
                      const totalAkhir = subReportData.reduce((s, r) => s + r.paguAkhir, 0);
                      const totalReal = subReportData.reduce((s, r) => s + r.realisasi, 0);
                      const totalSisa = totalAkhir - totalReal;
                      const totalPct = totalAkhir > 0 ? (totalReal / totalAkhir) * 100 : 0;
                      return (
                        <tr>
                          <td colSpan={2} className="p-3 text-right uppercase">TOTAL KESELURUHAN SUB-KEGIATAN:</td>
                          <td className="p-3 text-right font-mono">Rp {totalMurni.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-amber-300">Rp {totalRev.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-blue-300">Rp {totalSPD.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-emerald-400">Rp {totalAkhir.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-emerald-300">Rp {totalReal.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-amber-300">Rp {totalSisa.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-center text-emerald-300">{totalPct.toFixed(2)} %</td>
                        </tr>
                      );
                    })()}
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 print:bg-slate-200 text-slate-300 print:text-slate-900 font-bold uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Kode Rekening</th>
                      <th className="p-3">Nama Uraian Belanja</th>
                      <th className="p-3">Jenis Belanja</th>
                      <th className="p-3 text-right">Pagu Murni (Rp)</th>
                      <th className="p-3 text-right">Pergeseran (Rp)</th>
                      <th className="p-3 text-right">Nilai SPD (Rp)</th>
                      <th className="p-3 text-right">Pagu Akhir (Rp)</th>
                      <th className="p-3 text-right">Realisasi SP2D (Rp)</th>
                      <th className="p-3 text-right">Sisa Pagu (Rp)</th>
                      <th className="p-3 text-center">% Serapan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                    {selectedSubBelanjaData.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-6 text-center text-slate-500 italic">
                          Tidak ada data rekening belanja pada sub kegiatan ini.
                        </td>
                      </tr>
                    ) : (
                      selectedSubBelanjaData.map(r => (
                        <tr key={r.kodeBelanja} className="hover:bg-slate-800/40">
                          <td className="p-3 font-mono font-bold text-emerald-400 print:text-slate-900">{r.kodeBelanja}</td>
                          <td className="p-3 font-semibold text-white print:text-slate-900">{r.namaBelanja}</td>
                          <td className="p-3 text-slate-300 print:text-slate-700">{r.jenisBelanja}</td>
                          <td className="p-3 text-right font-mono text-slate-300 print:text-slate-800">Rp {r.paguMurni.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-amber-400/80 print:text-slate-800">Rp {r.revisi.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-blue-300 print:text-slate-800">Rp {r.nilaiSPD.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono font-bold text-white print:text-slate-900">Rp {r.paguAkhir.toLocaleString('id-ID')}</td>
                          <td
                            onClick={() => {
                              setSelectedRealisasiFilter({
                                title: `Rincian Uraian Realisasi Belanja`,
                                subtitle: `Sub Kegiatan: ${selectedSubDetail?.namaSub || filterSelectedSub} (${filterSelectedSub}) | Rekening: ${r.namaBelanja} (${r.kodeBelanja})`,
                                kodeSub: filterSelectedSub,
                                kodeBelanja: r.kodeBelanja
                              });
                            }}
                            className="p-3 text-right font-mono text-emerald-400 hover:text-emerald-200 hover:underline cursor-pointer print:text-slate-900 font-bold"
                            title="Klik untuk melihat rincian uraian realisasi belanja"
                          >
                            <span className="inline-flex items-center gap-1 justify-end">
                              <span>Rp {r.realisasi.toLocaleString('id-ID')}</span>
                              <Eye className="h-3.5 w-3.5 text-emerald-400/80 print:hidden" />
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono text-amber-300 print:text-slate-900">
                            Rp {r.sisa.toLocaleString('id-ID')}
                          </td>
                          <td className="p-3 text-center font-bold text-emerald-300 print:text-slate-900">
                            {r.persen.toFixed(2)} %
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="bg-slate-950 font-bold border-t-2 border-slate-700 text-white print:bg-slate-100 print:text-black">
                    {(() => {
                      const totalMurni = selectedSubBelanjaData.reduce((s, r) => s + r.paguMurni, 0);
                      const totalRev = selectedSubBelanjaData.reduce((s, r) => s + r.revisi, 0);
                      const totalSPD = selectedSubBelanjaData.reduce((s, r) => s + r.nilaiSPD, 0);
                      const totalAkhir = selectedSubBelanjaData.reduce((s, r) => s + r.paguAkhir, 0);
                      const totalReal = selectedSubBelanjaData.reduce((s, r) => s + r.realisasi, 0);
                      const totalSisa = totalAkhir - totalReal;
                      const totalPct = totalAkhir > 0 ? (totalReal / totalAkhir) * 100 : 0;
                      return (
                        <tr>
                          <td colSpan={3} className="p-3 text-right uppercase">TOTAL SUB-KEGIATAN INI:</td>
                          <td className="p-3 text-right font-mono">Rp {totalMurni.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-amber-300">Rp {totalRev.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-blue-300">Rp {totalSPD.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-emerald-400">Rp {totalAkhir.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-emerald-300">Rp {totalReal.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-amber-300">Rp {totalSisa.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-center text-emerald-300">{totalPct.toFixed(2)} %</td>
                        </tr>
                      );
                    })()}
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 4. LAPORAN PER BELANJA */}
        {activeTab === 'laporan-belanja' && (
          <div className="space-y-4">
            {/* Filter Droplist Rekening Belanja */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 print:hidden">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-amber-400" />
                <label className="text-xs font-bold text-slate-200">Filter Rekening Belanja:</label>
              </div>
              <BelanjaCombobox
                value={filterSelectedBelanja}
                onChange={setFilterSelectedBelanja}
                options={availableBelanjaOptions}
              />
            </div>

            <h3 className="text-xs font-bold uppercase text-amber-400 print:text-slate-900 border-b border-slate-800 pb-1">
              {filterSelectedBelanja === 'all'
                ? 'IV. Laporan Realisasi Per Rekening Belanja (Rekapitulasi Global)'
                : `IV. Laporan Realisasi Sub-Kegiatan Per Rekening Belanja - ${filterSelectedBelanja}`}
            </h3>

            {filterSelectedBelanja !== 'all' && selectedBelanjaDetail && (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5 print:bg-slate-100 print:border-slate-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold">Kode Rekening: </span>
                    <span className="font-mono font-bold text-emerald-400 print:text-black">{selectedBelanjaDetail.kodeBelanja}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold">Uraian Belanja: </span>
                    <span className="font-bold text-white print:text-black">{selectedBelanjaDetail.namaBelanja}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold">Jenis Belanja: </span>
                    <span className="text-slate-300 print:text-slate-800">{selectedBelanjaDetail.jenisBelanja}</span>
                  </div>
                </div>
              </div>
            )}

            {filterSelectedBelanja === 'all' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 print:bg-slate-200 text-slate-300 print:text-slate-900 font-bold uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Kode Rekening</th>
                      <th className="p-3">Nama Uraian Belanja</th>
                      <th className="p-3">Jenis Belanja</th>
                      <th className="p-3 text-right">Pagu Murni (Rp)</th>
                      <th className="p-3 text-right">Pergeseran (Rp)</th>
                      <th className="p-3 text-right">Nilai SPD (Rp)</th>
                      <th className="p-3 text-right">Pagu Akhir (Rp)</th>
                      <th className="p-3 text-right">Realisasi SP2D (Rp)</th>
                      <th className="p-3 text-right">Sisa Pagu (Rp)</th>
                      <th className="p-3 text-center">% Serapan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                    {belanjaReportData.map(r => (
                      <tr key={r.kode} className="hover:bg-slate-800/40 cursor-pointer" onClick={() => setFilterSelectedBelanja(r.kode)}>
                        <td className="p-3 font-mono font-bold text-emerald-400 print:text-slate-900">{r.kode}</td>
                        <td className="p-3 font-semibold text-white print:text-slate-900">{r.nama}</td>
                        <td className="p-3 text-slate-300 print:text-slate-700">{r.jenis}</td>
                        <td className="p-3 text-right font-mono text-slate-300 print:text-slate-800">Rp {r.paguMurni.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-mono text-amber-400/80 print:text-slate-800">Rp {r.revisi.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-mono text-blue-300 print:text-slate-800">Rp {r.nilaiSPD.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-mono font-bold text-white print:text-slate-900">Rp {r.paguAkhir.toLocaleString('id-ID')}</td>
                        <td
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRealisasiFilter({
                              title: `Rincian Uraian Realisasi Rekening Belanja`,
                              subtitle: `${r.kode} - ${r.nama}`,
                              kodeBelanja: r.kode
                            });
                          }}
                          className="p-3 text-right font-mono text-emerald-400 hover:text-emerald-200 hover:underline cursor-pointer print:text-slate-900 font-bold"
                          title="Klik untuk melihat rincian uraian realisasi belanja"
                        >
                          <span className="inline-flex items-center gap-1 justify-end">
                            <span>Rp {r.realisasi.toLocaleString('id-ID')}</span>
                            <Eye className="h-3.5 w-3.5 text-emerald-400/80 print:hidden" />
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono text-amber-300 print:text-slate-900">
                          Rp {r.sisa.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-center font-bold text-emerald-300 print:text-slate-900">
                          {r.persen.toFixed(2)} %
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-950 font-bold border-t-2 border-slate-700 text-white print:bg-slate-100 print:text-black">
                    {(() => {
                      const totalMurni = belanjaReportData.reduce((s, r) => s + r.paguMurni, 0);
                      const totalRev = belanjaReportData.reduce((s, r) => s + r.revisi, 0);
                      const totalSPD = belanjaReportData.reduce((s, r) => s + r.nilaiSPD, 0);
                      const totalAkhir = belanjaReportData.reduce((s, r) => s + r.paguAkhir, 0);
                      const totalReal = belanjaReportData.reduce((s, r) => s + r.realisasi, 0);
                      const totalSisa = totalAkhir - totalReal;
                      const totalPct = totalAkhir > 0 ? (totalReal / totalAkhir) * 100 : 0;
                      return (
                        <tr>
                          <td colSpan={3} className="p-3 text-right uppercase">TOTAL KESELURUHAN BELANJA:</td>
                          <td className="p-3 text-right font-mono">Rp {totalMurni.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-amber-300">Rp {totalRev.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-blue-300">Rp {totalSPD.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-emerald-400">Rp {totalAkhir.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-emerald-300">Rp {totalReal.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-amber-300">Rp {totalSisa.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-center text-emerald-300">{totalPct.toFixed(2)} %</td>
                        </tr>
                      );
                    })()}
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 print:bg-slate-200 text-slate-300 print:text-slate-900 font-bold uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Kode Sub</th>
                      <th className="p-3">Uraian Sub Kegiatan</th>
                      <th className="p-3 text-right">Pagu Murni (Rp)</th>
                      <th className="p-3 text-right">Pergeseran (Rp)</th>
                      <th className="p-3 text-right">Nilai SPD (Rp)</th>
                      <th className="p-3 text-right">Pagu Akhir (Rp)</th>
                      <th className="p-3 text-right">Realisasi SP2D (Rp)</th>
                      <th className="p-3 text-right">Sisa Pagu (Rp)</th>
                      <th className="p-3 text-center">% Serapan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                    {selectedBelanjaSubData.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-6 text-center text-slate-500 italic">
                          Tidak ada data sub kegiatan yang memiliki rekening belanja ini.
                        </td>
                      </tr>
                    ) : (
                      selectedBelanjaSubData.map(r => (
                        <tr key={r.kodeSub} className="hover:bg-slate-800/40">
                          <td className="p-3 font-mono font-bold text-amber-400 print:text-slate-900">{r.kodeSub}</td>
                          <td className="p-3 font-semibold text-white print:text-slate-900">{r.namaSub}</td>
                          <td className="p-3 text-right font-mono text-slate-300 print:text-slate-800">Rp {r.paguMurni.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-amber-400/80 print:text-slate-800">Rp {r.revisi.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-blue-300 print:text-slate-800">Rp {r.nilaiSPD.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono font-bold text-white print:text-slate-900">Rp {r.paguAkhir.toLocaleString('id-ID')}</td>
                          <td
                            onClick={() => {
                              setSelectedRealisasiFilter({
                                title: `Rincian Uraian Realisasi Belanja Sub-Kegiatan`,
                                subtitle: `Rekening: ${selectedBelanjaDetail?.namaBelanja || filterSelectedBelanja} (${filterSelectedBelanja}) | Sub Kegiatan: ${r.namaSub} (${r.kodeSub})`,
                                kodeBelanja: filterSelectedBelanja,
                                kodeSub: r.kodeSub
                              });
                            }}
                            className="p-3 text-right font-mono text-emerald-400 hover:text-emerald-200 hover:underline cursor-pointer print:text-slate-900 font-bold"
                            title="Klik untuk melihat rincian uraian realisasi belanja"
                          >
                            <span className="inline-flex items-center gap-1 justify-end">
                              <span>Rp {r.realisasi.toLocaleString('id-ID')}</span>
                              <Eye className="h-3.5 w-3.5 text-emerald-400/80 print:hidden" />
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono text-amber-300 print:text-slate-900">
                            Rp {r.sisa.toLocaleString('id-ID')}
                          </td>
                          <td className="p-3 text-center font-bold text-emerald-300 print:text-slate-900">
                            {r.persen.toFixed(2)} %
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="bg-slate-950 font-bold border-t-2 border-slate-700 text-white print:bg-slate-100 print:text-black">
                    {(() => {
                      const totalMurni = selectedBelanjaSubData.reduce((s, r) => s + r.paguMurni, 0);
                      const totalRev = selectedBelanjaSubData.reduce((s, r) => s + r.revisi, 0);
                      const totalSPD = selectedBelanjaSubData.reduce((s, r) => s + r.nilaiSPD, 0);
                      const totalAkhir = selectedBelanjaSubData.reduce((s, r) => s + r.paguAkhir, 0);
                      const totalReal = selectedBelanjaSubData.reduce((s, r) => s + r.realisasi, 0);
                      const totalSisa = totalAkhir - totalReal;
                      const totalPct = totalAkhir > 0 ? (totalReal / totalAkhir) * 100 : 0;
                      return (
                        <tr>
                          <td colSpan={2} className="p-3 text-right uppercase">TOTAL REKENING BELANJA INI:</td>
                          <td className="p-3 text-right font-mono">Rp {totalMurni.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-amber-300">Rp {totalRev.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-blue-300">Rp {totalSPD.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-emerald-400">Rp {totalAkhir.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-emerald-300">Rp {totalReal.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-amber-300">Rp {totalSisa.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-center text-emerald-300">{totalPct.toFixed(2)} %</td>
                        </tr>
                      );
                    })()}
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 5, 6, 7, 8. BULANAN / TRIWULAN / SEMESTER / TAHUNAN */}
        {activeTab !== 'laporan-program' &&
          activeTab !== 'laporan-kegiatan' &&
          activeTab !== 'laporan-subkegiatan' &&
          activeTab !== 'laporan-belanja' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase text-amber-400 print:text-slate-900 border-b border-slate-800 pb-1">
                Rekapitulasi {activeTab.replace('laporan-', '').toUpperCase()} TA {selectedTahun}
              </h3>
              <div className="p-4 rounded-2xl bg-slate-950 print:bg-slate-100 border border-slate-800">
                <p className="text-xs text-slate-300 print:text-slate-800 leading-relaxed">
                  Laporan rekapitulasi ini menyajikan data agregasi berkala seluruh realisasi SP2D
                  BAKESBANGPOLDAGRI Provinsi NTB.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-950 print:bg-slate-200 text-slate-300 print:text-slate-900 font-bold uppercase">
                    <tr>
                      <th className="p-3">Periode</th>
                      <th className="p-3 text-right">Target (Rp)</th>
                      <th className="p-3 text-right">Realisasi SP2D (Rp)</th>
                      <th className="p-3 text-center">Capaian Kinerja</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                    {['Triwulan I', 'Triwulan II', 'Triwulan III', 'Triwulan IV'].map((tw, idx) => {
                      const realTw = currentRealisasi
                        .filter(r => Math.ceil(r.bulan / 3) === idx + 1)
                        .reduce((s, r) => s + r.nilai, 0);

                      return (
                        <tr key={tw}>
                          <td className="p-3 font-bold text-white print:text-black">{tw}</td>
                          <td className="p-3 text-right font-mono">
                            Rp {(currentAnggaran.reduce((s, a) => s + a.paguAkhir, 0) / 4).toLocaleString('id-ID')}
                          </td>
                          <td className="p-3 text-right font-mono text-emerald-400 print:text-black font-bold">
                            Rp {realTw.toLocaleString('id-ID')}
                          </td>
                          <td className="p-3 text-center font-bold text-emerald-300 print:text-black">
                            Tercapai
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        {/* SIGNATURE BLOCK FOR PRINT */}
        <div className="mt-12 grid grid-cols-2 gap-8 text-center text-xs text-slate-300 print:text-slate-900">
          <div>
            <p>Mengetahui,</p>
            <p className="font-bold">Pejabat Pembuat Komitmen (PPK)</p>
            <div className="h-16" />
            <p className="font-bold underline">{activePpkUser?.nama || 'Drs. Supriadi, M.M'}</p>
            <p className="text-[10px] font-mono">
              {activePpkUser?.nip ? `NIP. ${activePpkUser.nip}` : 'NIP. -'}
            </p>
          </div>

          <div>
            <p>Mataram, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-bold">Kepala Badan Kesbangpoldagri NTB</p>
            <div className="h-16" />
            <p className="font-bold underline">
              {activeKabanUser?.nama || opd.kepalaBadan || 'H. Lalu Gita Ariadi, M.Si'}
            </p>
            <p className="text-[10px] font-mono">
              {activeKabanUser?.nip
                ? `NIP. ${activeKabanUser.nip}`
                : opd.nipKepala
                ? `NIP. ${opd.nipKepala}`
                : 'NIP. -'}
            </p>
          </div>
        </div>
      </div>

      {/* MODAL BREAKDOWN DETAIL URAIAN REALISASI */}
      {selectedRealisasiFilter && (
        <RealisasiDetailModal
          filter={selectedRealisasiFilter}
          onClose={() => setSelectedRealisasiFilter(null)}
          currentRealisasi={currentRealisasi}
          belanjaList={belanjaList}
          subKegiatanList={subKegiatanList}
          selectedTahun={selectedTahun}
        />
      )}
    </div>
  );
};
