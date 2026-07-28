import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Check,
  X
} from 'lucide-react';

export const InputRealisasiView: React.FC = () => {
  const {
    selectedTahun,
    programs,
    kegiatanList,
    subKegiatanList,
    belanjaList,
    rekananList,
    realisasiList,
    anggaranList,
    addRealisasi,
    deleteRealisasi,
    currentUser
  } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [kodeProgram, setKodeProgram] = useState(programs[0]?.kodeProgram || '5.01.01');
  const [kodeKegiatan, setKodeKegiatan] = useState(kegiatanList[0]?.kodeKegiatan || '5.01.01.2.01');
  const [kodeSub, setKodeSub] = useState(subKegiatanList[0]?.kodeSub || '5.01.01.2.01.01');
  const [kodeBelanja, setKodeBelanja] = useState(belanjaList[0]?.kodeBelanja || '5.1.02.01.01.0024');
  const [nilai, setNilai] = useState<number>(250000000);
  const [noSP2D, setNoSP2D] = useState(`900/${Math.floor(1000 + Math.random() * 9000)}/SP2D-LS/KESBANG/${selectedTahun}`);
  const [noSPM, setNoSPM] = useState(`900/${Math.floor(1000 + Math.random() * 9000)}/SPM-LS/KESBANG/${selectedTahun}`);
  const [uraian, setUraian] = useState('Pembayaran Kegiatan Operasional BAKESBANGPOLDAGRI NTB');
  const [rekanan, setRekanan] = useState(rekananList[0]?.namaRekanan || 'PT Bank NTB Syariah');
  const [buktiFileName, setBuktiFileName] = useState<string>('');

  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  const filteredKegiatan = kegiatanList.filter(k => k.kodeProgram === kodeProgram);
  const filteredSub = subKegiatanList.filter(s => s.kodeKegiatan === kodeKegiatan);

  const isReadOnly = currentUser.role === 'Auditor' || currentUser.role === 'Kepala Badan';

  const handleSimpan = (e: React.FormEvent) => {
    e.preventDefault();
    setWarningMsg(null);

    // Validation 1: Check duplicate SP2D
    const isDup = realisasiList.some(r => r.noSP2D.trim().toLowerCase() === noSP2D.trim().toLowerCase());
    if (isDup) {
      setWarningMsg(`PERINGATAN: Nomor SP2D "${noSP2D}" sudah terdaftar dalam sistem! Mohon periksa kembali.`);
      return;
    }

    // Validation 2: Check remaining budget
    const angObj = anggaranList.find(a => a.kodeBelanja === kodeBelanja && a.tahun === selectedTahun);
    const paguAkhir = angObj ? angObj.paguAkhir : 0;
    const existingRealSum = realisasiList
      .filter(r => r.kodeBelanja === kodeBelanja && r.tahun === selectedTahun)
      .reduce((s, r) => s + r.nilai, 0);

    if (paguAkhir > 0 && existingRealSum + nilai > paguAkhir) {
      const confirmOver = window.confirm(
        `PERINGATAN: Realisasi (Rp ${(existingRealSum + nilai).toLocaleString('id-ID')}) MELEBIHI PAGU ANGGARAN (Rp ${paguAkhir.toLocaleString('id-ID')}). Apakah Anda yakin tetap ingin menyimpan transaksi ini?`
      );
      if (!confirmOver) return;
    }

    const monthNum = new Date(tanggal).getMonth() + 1;

    addRealisasi({
      tanggal,
      bulan: monthNum,
      tahun: selectedTahun,
      kodeProgram,
      kodeKegiatan,
      kodeSub,
      kodeBelanja,
      nilai,
      noSP2D,
      noSPM,
      uraian,
      rekanan,
      operator: currentUser.nama,
      buktiUrl: buktiFileName || 'Kwitansi_Lampiran_SP2D.pdf'
    });

    setShowForm(false);
    setNilai(100000000);
    setWarningMsg(null);
  };

  const handleFileUploadSim = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBuktiFileName(e.target.files[0].name);
    }
  };

  const currentRealisasi = realisasiList.filter(r => r.tahun === selectedTahun);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-teal-400" />
            <h1 className="text-xl font-bold text-white">Input Realisasi Keuangan (SP2D)</h1>
          </div>
          <p className="text-xs text-slate-400">
            Pencatatan Realisasi Belanja, Penerbitan SP2D, SPM & Lampiran Bukti SPJ TA {selectedTahun}
          </p>
        </div>

        {!isReadOnly && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-500 shadow-lg shadow-teal-950/50"
            id="btn-toggle-add-realisasi"
          >
            <Plus className="h-4 w-4" />
            <span>Input Transaksi Realisasi</span>
          </button>
        )}
      </div>

      {/* INPUT FORM */}
      {showForm && (
        <form onSubmit={handleSimpan} className="rounded-2xl border border-teal-600/40 bg-slate-900 p-6 shadow-2xl space-y-4">
          <h2 className="text-sm font-bold text-teal-300 border-b border-slate-800 pb-2">
            Formulir Transaksi Realisasi Keuangan
          </h2>

          {warningMsg && (
            <div className="rounded-xl border border-rose-800 bg-rose-950/60 p-3 text-xs font-semibold text-rose-200 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              <span>{warningMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="text-xs font-bold text-slate-300">Tanggal SP2D:</label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={e => setTanggal(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Nomor SP2D:</label>
              <input
                type="text"
                required
                value={noSP2D}
                onChange={e => setNoSP2D(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-mono font-bold text-teal-300"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Nomor SPM:</label>
              <input
                type="text"
                required
                value={noSPM}
                onChange={e => setNoSPM(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-mono text-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-slate-300">Program:</label>
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
              <label className="text-xs font-bold text-slate-300">Kegiatan:</label>
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
              <label className="text-xs font-bold text-slate-300">Sub Kegiatan:</label>
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
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-slate-300">Nilai Realisasi SP2D (Rp):</label>
              <input
                type="number"
                required
                min={1}
                value={nilai}
                onChange={e => setNilai(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-mono font-bold text-teal-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Penyedia / Rekanan / Penerima:</label>
              <select
                value={rekanan}
                onChange={e => setRekanan(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white"
              >
                {rekananList.map(r => (
                  <option key={r.id} value={r.namaRekanan}>
                    {r.namaRekanan} ({r.bank})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300">Uraian / Keterangan Transaksi:</label>
            <textarea
              required
              rows={2}
              value={uraian}
              onChange={e => setUraian(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:outline-none"
            />
          </div>

          {/* Upload Bukti */}
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950 p-4 text-center">
            <Upload className="mx-auto h-6 w-6 text-slate-400" />
            <label className="mt-2 block text-xs font-bold text-teal-400 cursor-pointer">
              <span>Klik Upload File Bukti Kuitansi / SPJ (PDF/JPG)</span>
              <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileUploadSim} className="hidden" />
            </label>
            {buktiFileName && (
              <p className="mt-1 text-xs text-emerald-400 font-semibold">
                Lampiran terpilih: {buktiFileName}
              </p>
            )}
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
              className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white hover:bg-teal-500 shadow-md"
            >
              Simpan Realisasi & Kirim ke PPK
            </button>
          </div>
        </form>
      )}

      {/* TABLE REALISASI */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Daftar Transaksi Realisasi SP2D ({currentRealisasi.length} Data)
          </h3>
          <input
            type="text"
            placeholder="Cari SP2D, Uraian, Rekanan..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-300 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">No. SP2D</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Kode Belanja</th>
                <th className="px-4 py-3">Uraian Transaksi</th>
                <th className="px-4 py-3 text-right">Nilai Realisasi (Rp)</th>
                <th className="px-4 py-3">Penyedia / Rekanan</th>
                <th className="px-4 py-3">Status PPK</th>
                {!isReadOnly && <th className="px-4 py-3 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {currentRealisasi
                .filter(
                  r =>
                    r.noSP2D.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    r.uraian.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    r.rekanan.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(r => (
                  <tr key={r.id} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono font-bold text-teal-300">{r.noSP2D}</td>
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{r.tanggal}</td>
                    <td className="px-4 py-3 font-mono text-emerald-400">{r.kodeBelanja}</td>
                    <td className="px-4 py-3 font-medium text-white max-w-xs">{r.uraian}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">
                      Rp {r.nilai.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{r.rekanan}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          r.statusValidation === 'Disetujui PPK'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : r.statusValidation === 'Ditolak'
                            ? 'bg-rose-950 text-rose-300 border border-rose-700'
                            : 'bg-amber-950 text-amber-300 border border-amber-700'
                        }`}
                      >
                        {r.statusValidation || 'Disetujui PPK'}
                      </span>
                    </td>
                    {!isReadOnly && (
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => deleteRealisasi(r.id)}
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
