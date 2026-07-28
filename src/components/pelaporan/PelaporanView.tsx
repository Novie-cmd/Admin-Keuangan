import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NTBLogo } from '../common/NTBLogo';
import * as XLSX from 'xlsx';
import { safeDownloadExcel } from '../../utils/downloadHelper';
import {
  FileText,
  Printer,
  Download,
  Filter,
  Search,
  BookOpen,
  Calendar,
  Layers,
  Building2
} from 'lucide-react';

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

  const currentAnggaran = anggaranList.filter(a => a.tahun === selectedTahun);
  const currentRealisasi = realisasiList.filter(r => r.tahun === selectedTahun);

  // Helper calculation for Laporan Per Program (Syced with Input Anggaran Pagu & Realisasi)
  const allProgramKodes = Array.from(
    new Set([
      ...programs.filter(p => p.tahun === selectedTahun).map(p => p.kodeProgram),
      ...currentAnggaran.map(a => a.kodeProgram)
    ])
  );

  const programReportData = allProgramKodes.map(kode => {
    const pObj = programs.find(p => p.kodeProgram === kode);
    const paguMurni = currentAnggaran
      .filter(a => a.kodeProgram === kode)
      .reduce((s, a) => s + a.pagu, 0);

    const revisi = currentAnggaran
      .filter(a => a.kodeProgram === kode)
      .reduce((s, a) => s + a.revisi, 0);

    const nilaiSPD = currentAnggaran
      .filter(a => a.kodeProgram === kode)
      .reduce((s, a) => s + (a.nilaiSPD !== undefined ? a.nilaiSPD : a.paguAkhir), 0);

    const paguAkhir = currentAnggaran
      .filter(a => a.kodeProgram === kode)
      .reduce((s, a) => s + a.paguAkhir, 0);

    const real = currentRealisasi
      .filter(r => r.kodeProgram === kode)
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
      ...kegiatanList.filter(k => k.tahun === selectedTahun).map(k => k.kodeKegiatan),
      ...currentAnggaran.map(a => a.kodeKegiatan)
    ])
  );

  const kegiatanReportData = allKegiatanKodes.map(kode => {
    const kObj = kegiatanList.find(k => k.kodeKegiatan === kode);
    const paguMurni = currentAnggaran
      .filter(a => a.kodeKegiatan === kode)
      .reduce((s, a) => s + a.pagu, 0);

    const revisi = currentAnggaran
      .filter(a => a.kodeKegiatan === kode)
      .reduce((s, a) => s + a.revisi, 0);

    const nilaiSPD = currentAnggaran
      .filter(a => a.kodeKegiatan === kode)
      .reduce((s, a) => s + (a.nilaiSPD !== undefined ? a.nilaiSPD : a.paguAkhir), 0);

    const paguAkhir = currentAnggaran
      .filter(a => a.kodeKegiatan === kode)
      .reduce((s, a) => s + a.paguAkhir, 0);

    const real = currentRealisasi
      .filter(r => r.kodeKegiatan === kode)
      .reduce((s, r) => s + r.nilai, 0);

    const sisa = paguAkhir - real;
    const pct = paguAkhir > 0 ? (real / paguAkhir) * 100 : 0;

    return {
      kodeProg: kObj?.kodeProgram || currentAnggaran.find(a => a.kodeKegiatan === kode)?.kodeProgram || '',
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
      ...subKegiatanList.filter(s => s.tahun === selectedTahun).map(s => s.kodeSub),
      ...currentAnggaran.map(a => a.kodeSub)
    ])
  );

  const subReportData = allSubKodes.map(kode => {
    const sObj = subKegiatanList.find(s => s.kodeSub === kode);
    const paguMurni = currentAnggaran
      .filter(a => a.kodeSub === kode)
      .reduce((s, a) => s + a.pagu, 0);

    const revisi = currentAnggaran
      .filter(a => a.kodeSub === kode)
      .reduce((s, a) => s + a.revisi, 0);

    const nilaiSPD = currentAnggaran
      .filter(a => a.kodeSub === kode)
      .reduce((s, a) => s + (a.nilaiSPD !== undefined ? a.nilaiSPD : a.paguAkhir), 0);

    const paguAkhir = currentAnggaran
      .filter(a => a.kodeSub === kode)
      .reduce((s, a) => s + a.paguAkhir, 0);

    const real = currentRealisasi
      .filter(r => r.kodeSub === kode)
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

  // Helper calculation for Laporan Per Belanja
  const allBelanjaKodes = Array.from(
    new Set([
      ...belanjaList.map(b => b.kodeBelanja),
      ...currentAnggaran.map(a => a.kodeBelanja)
    ])
  );

  const belanjaReportData = allBelanjaKodes.map(kode => {
    const bObj = belanjaList.find(b => b.kodeBelanja === kode);
    const aMatch = currentAnggaran.find(a => a.kodeBelanja === kode);

    const paguMurni = currentAnggaran
      .filter(a => a.kodeBelanja === kode)
      .reduce((s, a) => s + a.pagu, 0);

    const revisi = currentAnggaran
      .filter(a => a.kodeBelanja === kode)
      .reduce((s, a) => s + a.revisi, 0);

    const nilaiSPD = currentAnggaran
      .filter(a => a.kodeBelanja === kode)
      .reduce((s, a) => s + (a.nilaiSPD !== undefined ? a.nilaiSPD : a.paguAkhir), 0);

    const paguAkhir = currentAnggaran
      .filter(a => a.kodeBelanja === kode)
      .reduce((s, a) => s + a.paguAkhir, 0);

    const real = currentRealisasi
      .filter(r => r.kodeBelanja === kode)
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

      {/* REPORT CANVAS SHEET FOR PRINT & DISPLAY */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl text-slate-100 print:border-none print:p-0 print:bg-white print:text-slate-950">
        
        {/* OFFICIAL GOVERNMENT REPORT KOP SURAT / HEADER */}
        <div className="text-center border-b-2 border-slate-700 print:border-slate-900 pb-4 mb-6">
          <div className="flex justify-center mb-2">
            {opd?.logoUrl ? (
              <img
                src={opd.logoUrl}
                alt="Logo NTB"
                className="h-14 w-14 object-contain rounded-xl bg-slate-950 print:bg-transparent p-1 border border-emerald-500/40 print:border-none shadow-md"
              />
            ) : (
              <NTBLogo size={56} />
            )}
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
                      <td className="p-3 text-right font-mono text-emerald-400 print:text-slate-900 font-bold">
                        Rp {r.realisasi.toLocaleString('id-ID')}
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
                      <td className="p-3 text-right font-mono text-emerald-400 print:text-slate-900 font-bold">
                        Rp {r.realisasi.toLocaleString('id-ID')}
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
            <h3 className="text-xs font-bold uppercase text-amber-400 print:text-slate-900 border-b border-slate-800 pb-1">
              III. Laporan Realisasi Keuangan Per Sub-Kegiatan
            </h3>
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
                    <tr key={r.kodeSub} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-amber-400 print:text-slate-900">{r.kodeSub}</td>
                      <td className="p-3 font-semibold text-white print:text-slate-900">{r.namaSub}</td>
                      <td className="p-3 text-right font-mono text-slate-300 print:text-slate-800">Rp {r.paguMurni.toLocaleString('id-ID')}</td>
                      <td className="p-3 text-right font-mono text-amber-400/80 print:text-slate-800">Rp {r.revisi.toLocaleString('id-ID')}</td>
                      <td className="p-3 text-right font-mono text-blue-300 print:text-slate-800">Rp {r.nilaiSPD.toLocaleString('id-ID')}</td>
                      <td className="p-3 text-right font-mono font-bold text-white print:text-slate-900">Rp {r.paguAkhir.toLocaleString('id-ID')}</td>
                      <td className="p-3 text-right font-mono text-emerald-400 print:text-slate-900 font-bold">
                        Rp {r.realisasi.toLocaleString('id-ID')}
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
          </div>
        )}

        {/* 4. LAPORAN PER BELANJA */}
        {activeTab === 'laporan-belanja' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase text-amber-400 print:text-slate-900 border-b border-slate-800 pb-1">
              IV. Laporan Realisasi Per Rekening Belanja
            </h3>
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
                    <tr key={r.kode} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-emerald-400 print:text-slate-900">{r.kode}</td>
                      <td className="p-3 font-semibold text-white print:text-slate-900">{r.nama}</td>
                      <td className="p-3 text-slate-300 print:text-slate-700">{r.jenis}</td>
                      <td className="p-3 text-right font-mono text-slate-300 print:text-slate-800">Rp {r.paguMurni.toLocaleString('id-ID')}</td>
                      <td className="p-3 text-right font-mono text-amber-400/80 print:text-slate-800">Rp {r.revisi.toLocaleString('id-ID')}</td>
                      <td className="p-3 text-right font-mono text-blue-300 print:text-slate-800">Rp {r.nilaiSPD.toLocaleString('id-ID')}</td>
                      <td className="p-3 text-right font-mono font-bold text-white print:text-slate-900">Rp {r.paguAkhir.toLocaleString('id-ID')}</td>
                      <td className="p-3 text-right font-mono text-emerald-400 print:text-slate-900 font-bold">
                        Rp {r.realisasi.toLocaleString('id-ID')}
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
    </div>
  );
};
