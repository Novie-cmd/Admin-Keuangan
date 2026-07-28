import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DollarSign,
  Plus,
  Trash2,
  Edit,
  Save,
  Layers,
  Search,
  Filter,
  CheckCircle2
} from 'lucide-react';

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
    deleteAnggaran,
    currentUser
  } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [kodeProgram, setKodeProgram] = useState(programs[0]?.kodeProgram || '5.01.01');
  const [kodeKegiatan, setKodeKegiatan] = useState(kegiatanList[0]?.kodeKegiatan || '5.01.01.2.01');
  const [kodeSub, setKodeSub] = useState(subKegiatanList[0]?.kodeSub || '5.01.01.2.01.01');
  const [kodeBelanja, setKodeBelanja] = useState(belanjaList[0]?.kodeBelanja || '5.1.02.01.01.0024');
  const [pagu, setPagu] = useState<number>(500000000);
  const [revisi, setRevisi] = useState<number>(0);
  const [sumberDana, setSumberDana] = useState('DAU');

  const filteredKegiatan = kegiatanList.filter(k => k.kodeProgram === kodeProgram);
  const filteredSub = subKegiatanList.filter(s => s.kodeKegiatan === kodeKegiatan);

  const isReadOnly = currentUser.role === 'Auditor' || currentUser.role === 'Kepala Badan';

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
      operator: currentUser.nama,
      sumberDana
    });
    setShowForm(false);
    setPagu(100000000);
    setRevisi(0);
  };

  const currentAnggaran = anggaranList.filter(a => a.tahun === selectedTahun);
  const totalPaguMurni = currentAnggaran.reduce((s, a) => s + a.pagu, 0);
  const totalRevisi = currentAnggaran.reduce((s, a) => s + a.revisi, 0);
  const totalPaguAkhir = currentAnggaran.reduce((s, a) => s + a.paguAkhir, 0);

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
            Penetapan Pagu Murni, Pergeseran / Revisi Anggaran Tahun Anggaran {selectedTahun}
          </p>
        </div>

        {!isReadOnly && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-950/50"
            id="btn-toggle-add-anggaran"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Pagu Anggaran</span>
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Pagu Murni</span>
          <div className="mt-1 text-lg font-black text-white">Rp {totalPaguMurni.toLocaleString('id-ID')}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Revisi / Pergeseran</span>
          <div className="mt-1 text-lg font-black text-amber-400">
            {totalRevisi >= 0 ? '+' : ''}Rp {totalRevisi.toLocaleString('id-ID')}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Pagu Akhir</span>
          <div className="mt-1 text-lg font-black text-emerald-400">Rp {totalPaguAkhir.toLocaleString('id-ID')}</div>
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
                onChange={e => setPagu(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-mono font-bold text-emerald-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Revisi / Pergeseran (Rp):</label>
              <input
                type="number"
                value={revisi}
                onChange={e => setRevisi(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-mono font-bold text-amber-400"
              />
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
                <th className="px-4 py-3 text-right">Pagu Akhir</th>
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
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-300">
                      Rp {a.paguAkhir.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{a.operator}</td>
                    {!isReadOnly && (
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => deleteAnggaran(a.id)}
                          className="rounded p-1 text-slate-400 hover:bg-rose-950 hover:text-rose-400"
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
