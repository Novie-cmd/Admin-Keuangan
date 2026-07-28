import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NTBLogo } from '../common/NTBLogo';
import { OPD } from '../../types';
import { INITIAL_OPD } from '../../data/initialData';
import {
  Database,
  Plus,
  Search,
  Building,
  Calendar,
  Layers,
  FileCode,
  Users,
  CreditCard,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Upload,
  RotateCcw,
  AlertTriangle,
  Image as ImageIcon
} from 'lucide-react';

interface MasterDataViewProps {
  initialSubTab?: string;
}

export const MasterDataView: React.FC<MasterDataViewProps> = ({ initialSubTab = 'master-program' }) => {
  const {
    selectedTahun,
    tahunList,
    opd,
    opdList,
    programs,
    kegiatanList,
    subKegiatanList,
    belanjaList,
    rekananList,
    addProgram,
    addKegiatan,
    addSubKegiatan,
    addBelanja,
    addRekanan,
    addOpd,
    updateOpd,
    deleteOpd,
    importOpdLogo,
    currentUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>(initialSubTab);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal forms state
  const [showAddModal, setShowAddModal] = useState(false);

  // OPD Edit & Delete Modal States
  const [editingOpd, setEditingOpd] = useState<OPD | null>(null);
  const [deletingOpd, setDeletingOpd] = useState<OPD | null>(null);

  // Form states
  const [formProgram, setFormProgram] = useState({ kodeProgram: '', namaProgram: '' });
  const [formKegiatan, setFormKegiatan] = useState({ kodeProgram: '', kodeKegiatan: '', namaKegiatan: '' });
  const [formSub, setFormSub] = useState({ kodeProgram: '', kodeKegiatan: '', kodeSub: '', namaSub: '' });
  const [formBelanja, setFormBelanja] = useState({ kodeBelanja: '', namaBelanja: '', jenisBelanja: 'Belanja Barang dan Jasa' });
  const [formRekanan, setFormRekanan] = useState({
    namaRekanan: '',
    npwp: '',
    bank: 'Bank NTB Syariah',
    noRekening: '',
    alamat: '',
    kontak: ''
  });
  const [formOpd, setFormOpd] = useState<OPD>({
    kodeOPD: '',
    namaOPD: '',
    singkatan: '',
    kepalaBadan: '',
    nipKepala: '',
    logoUrl: ''
  });

  const isReadonly = currentUser.role === 'Auditor';

  // Logo file upload handler
  const handleFileUploadLogo = (e: React.ChangeEvent<HTMLInputElement>, targetOpd: OPD) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        importOpdLogo(targetOpd.id || targetOpd.kodeOPD, dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Reset to default NTB logo
  const handleResetDefaultLogo = (targetOpd: OPD) => {
    importOpdLogo(targetOpd.id || targetOpd.kodeOPD, '');
  };

  // Save edited OPD
  const handleSaveEditOpd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOpd) return;
    updateOpd(editingOpd.id || editingOpd.kodeOPD, editingOpd);
    setEditingOpd(null);
  };

  // Confirm delete OPD
  const handleConfirmDeleteOpd = () => {
    if (!deletingOpd) return;
    deleteOpd(deletingOpd.id || deletingOpd.kodeOPD);
    setDeletingOpd(null);
  };

  // Save new OPD
  const handleSaveAddOpd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formOpd.namaOPD || !formOpd.kodeOPD) return;
    addOpd({
      ...formOpd,
      id: `OPD-${Date.now().toString().slice(-4)}`
    });
    setFormOpd({
      kodeOPD: '',
      namaOPD: '',
      singkatan: '',
      kepalaBadan: '',
      nipKepala: '',
      logoUrl: ''
    });
    setShowAddModal(false);
  };

  const handleSaveProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProgram.kodeProgram || !formProgram.namaProgram) return;
    addProgram({
      kodeProgram: formProgram.kodeProgram,
      namaProgram: formProgram.namaProgram,
      tahun: selectedTahun
    });
    setFormProgram({ kodeProgram: '', namaProgram: '' });
    setShowAddModal(false);
  };

  const handleSaveKegiatan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKegiatan.kodeKegiatan || !formKegiatan.namaKegiatan) return;
    addKegiatan({
      kodeProgram: formKegiatan.kodeProgram || (programs[0]?.kodeProgram || '5.01.01'),
      kodeKegiatan: formKegiatan.kodeKegiatan,
      namaKegiatan: formKegiatan.namaKegiatan,
      tahun: selectedTahun
    });
    setFormKegiatan({ kodeProgram: '', kodeKegiatan: '', namaKegiatan: '' });
    setShowAddModal(false);
  };

  const handleSaveSubKegiatan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSub.kodeSub || !formSub.namaSub) return;
    addSubKegiatan({
      kodeProgram: formSub.kodeProgram || (programs[0]?.kodeProgram || '5.01.01'),
      kodeKegiatan: formSub.kodeKegiatan || (kegiatanList[0]?.kodeKegiatan || '5.01.01.2.01'),
      kodeSub: formSub.kodeSub,
      namaSub: formSub.namaSub,
      tahun: selectedTahun
    });
    setFormSub({ kodeProgram: '', kodeKegiatan: '', kodeSub: '', namaSub: '' });
    setShowAddModal(false);
  };

  const handleSaveBelanja = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBelanja.kodeBelanja || !formBelanja.namaBelanja) return;
    addBelanja({
      kodeBelanja: formBelanja.kodeBelanja,
      namaBelanja: formBelanja.namaBelanja,
      jenisBelanja: formBelanja.jenisBelanja,
      tahun: selectedTahun
    });
    setFormBelanja({ kodeBelanja: '', namaBelanja: '', jenisBelanja: 'Belanja Barang dan Jasa' });
    setShowAddModal(false);
  };

  const handleSaveRekanan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRekanan.namaRekanan) return;
    addRekanan(formRekanan);
    setFormRekanan({
      namaRekanan: '',
      npwp: '',
      bank: 'Bank NTB Syariah',
      noRekening: '',
      alamat: '',
      kontak: ''
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Master Data Keuangan</h1>
          </div>
          <p className="text-xs text-slate-400">
            Pengelolaan Referensi Master Tahun, OPD, Program, Kegiatan, Sub-Kegiatan, Rekening Belanja & Rekanan
          </p>
        </div>

        {!isReadonly && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-950/50"
            id="btn-add-master"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Data Master</span>
          </button>
        )}
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-800 pb-2 scrollbar-none">
        {[
          { id: 'master-tahun', label: 'Tahun Anggaran' },
          { id: 'master-opd', label: 'OPD / Unit Kerja' },
          { id: 'master-program', label: 'Program' },
          { id: 'master-kegiatan', label: 'Kegiatan' },
          { id: 'master-subkegiatan', label: 'Sub Kegiatan' },
          { id: 'master-belanja', label: 'Belanja Rekening' },
          { id: 'master-sumberdana', label: 'Sumber Dana' },
          { id: 'master-rekanan', label: 'Data Rekanan' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSearchTerm('');
            }}
            className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900 px-3 py-2">
        <Search className="h-4 w-4 text-slate-400 mr-2" />
        <input
          type="text"
          placeholder="Cari kata kunci di master data..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* TAB CONTENT: MASTER TAHUN */}
      {activeTab === 'master-tahun' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-300 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Tahun Anggaran</th>
                <th className="px-4 py-3">Status Sistem</th>
                <th className="px-4 py-3">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {tahunList.map(t => (
                <tr key={t.id} className="hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-mono font-bold text-emerald-400">{t.id}</td>
                  <td className="px-4 py-3 text-sm font-bold text-white">{t.tahun}</td>
                  <td className="px-4 py-3">
                    {t.tahun === selectedTahun ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950 px-2.5 py-1 text-[11px] font-bold text-emerald-300 ring-1 ring-emerald-500">
                        <CheckCircle2 className="h-3 w-3" /> Sedang Dipilih
                      </span>
                    ) : (
                      <span className="text-slate-500">Inaktif</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{t.keterangan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: OPD / UNIT KERJA */}
      {activeTab === 'master-opd' && (
        <div className="space-y-6">
          {/* Header Banner for OPD */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
            <div className="flex items-center gap-3">
              <Building className="h-7 w-7 text-emerald-400" />
              <div>
                <h2 className="text-base font-bold text-white">Daftar OPD & Unit Kerja Sub-Sistem</h2>
                <p className="text-xs text-slate-400">
                  Kelola identitas Organisasi Perangkat Daerah, Pejabat Kepala Badan, Edit/Hapus Data & Import Logo Resmi Provinsi NTB
                </p>
              </div>
            </div>
            {!isReadonly && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow transition"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah OPD Baru</span>
              </button>
            )}
          </div>

          {/* OPD Cards List */}
          {opdList.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center space-y-3">
              <Building className="h-10 w-10 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400">Belum ada data OPD/Unit Kerja terdaftar.</p>
              <button
                onClick={() => addOpd(INITIAL_OPD)}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow"
              >
                Muat Ulang Default BAKESBANGPOLDAGRI NTB
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {opdList
                .filter(
                  item =>
                    item.namaOPD.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.singkatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.kodeOPD.includes(searchTerm)
                )
                .map(item => (
                  <div
                    key={item.id || item.kodeOPD}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5 shadow-xl hover:border-emerald-500/40 transition"
                  >
                    {/* Header: Logo + Title */}
                    <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                      <div className="flex items-center gap-4">
                        {/* Logo Container with Upload Trigger */}
                        <div className="relative group flex-shrink-0">
                          {item.logoUrl ? (
                            <img
                              src={item.logoUrl}
                              alt="Logo NTB"
                              className="h-16 w-16 object-contain rounded-2xl bg-slate-950 p-2 border border-emerald-500/30 shadow-inner"
                            />
                          ) : (
                            <div className="p-1 rounded-2xl bg-slate-950 border border-emerald-500/30">
                              <NTBLogo size={52} />
                            </div>
                          )}

                          {!isReadonly && (
                            <label
                              className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-slate-950/85 text-emerald-300 opacity-0 group-hover:opacity-100 transition cursor-pointer p-1 text-center"
                              title="Klik untuk Upload Logo Baru"
                            >
                              <Upload className="h-4 w-4 text-emerald-400" />
                              <span className="text-[9px] font-bold mt-0.5">Ubah Logo</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={e => handleFileUploadLogo(e, item)}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>

                        <div>
                          <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800">
                            {item.singkatan}
                          </span>
                          <h3 className="text-sm font-bold text-white mt-1 leading-snug">
                            {item.namaOPD}
                          </h3>
                          <p className="font-mono text-slate-400 text-[11px] mt-0.5">
                            Kode SKPD: {item.kodeOPD}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Detail Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
                        <span className="text-slate-400 text-[11px]">Kepala Badan / SKPD:</span>
                        <p className="font-bold text-white mt-0.5">{item.kepalaBadan}</p>
                        <p className="font-mono text-slate-400 text-[10px]">NIP. {item.nipKepala}</p>
                      </div>

                      <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 flex flex-col justify-between">
                        <span className="text-slate-400 text-[11px]">Logo Provinsi NTB:</span>
                        <div className="flex items-center gap-2 mt-1">
                          {item.logoUrl ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Logo Kustom Impor
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-400 font-bold text-[11px]">
                              <NTBLogo size={14} /> Vector NTB Default
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: Import Logo, Edit, Delete */}
                    {!isReadonly && (
                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-4">
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1.5 cursor-pointer rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30 transition">
                            <Upload className="h-3.5 w-3.5" />
                            <span>Import Logo NTB</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={e => handleFileUploadLogo(e, item)}
                              className="hidden"
                            />
                          </label>

                          {item.logoUrl && (
                            <button
                              onClick={() => handleResetDefaultLogo(item)}
                              className="flex items-center gap-1 rounded-xl bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition"
                              title="Reset ke Logo Vector NTB Default"
                            >
                              <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
                              <span className="text-[11px]">Reset Logo</span>
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingOpd(item)}
                            className="flex items-center gap-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900 border border-amber-600/40 px-3 py-1.5 text-xs font-bold text-amber-300 transition"
                            title="Edit Data OPD"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => setDeletingOpd(item)}
                            className="flex items-center gap-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-600/40 px-3 py-1.5 text-xs font-bold text-rose-300 transition"
                            title="Hapus Data OPD"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: PROGRAM */}
      {activeTab === 'master-program' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-300 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Kode Program</th>
                <th className="px-4 py-3">Nama Program</th>
                <th className="px-4 py-3">Tahun</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {programs
                .filter(
                  p =>
                    p.tahun === selectedTahun &&
                    (p.kodeProgram.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      p.namaProgram.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono font-bold text-emerald-400">{p.kodeProgram}</td>
                    <td className="px-4 py-3 font-semibold text-white">{p.namaProgram}</td>
                    <td className="px-4 py-3">{p.tahun}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: KEGIATAN */}
      {activeTab === 'master-kegiatan' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-300 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Kode Program</th>
                <th className="px-4 py-3">Kode Kegiatan</th>
                <th className="px-4 py-3">Nama Kegiatan</th>
                <th className="px-4 py-3">Tahun</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {kegiatanList
                .filter(
                  k =>
                    k.tahun === selectedTahun &&
                    (k.kodeKegiatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      k.namaKegiatan.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .map((k, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono text-slate-400">{k.kodeProgram}</td>
                    <td className="px-4 py-3 font-mono font-bold text-teal-400">{k.kodeKegiatan}</td>
                    <td className="px-4 py-3 font-semibold text-white">{k.namaKegiatan}</td>
                    <td className="px-4 py-3">{k.tahun}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: SUB KEGIATAN */}
      {activeTab === 'master-subkegiatan' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-300 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Kode Kegiatan</th>
                <th className="px-4 py-3">Kode Sub Kegiatan</th>
                <th className="px-4 py-3">Nama Sub Kegiatan</th>
                <th className="px-4 py-3">Tahun</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {subKegiatanList
                .filter(
                  s =>
                    s.tahun === selectedTahun &&
                    (s.kodeSub.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      s.namaSub.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono text-slate-400">{s.kodeKegiatan}</td>
                    <td className="px-4 py-3 font-mono font-bold text-amber-400">{s.kodeSub}</td>
                    <td className="px-4 py-3 font-semibold text-white">{s.namaSub}</td>
                    <td className="px-4 py-3">{s.tahun}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: BELANJA */}
      {activeTab === 'master-belanja' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-300 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Kode Rekening</th>
                <th className="px-4 py-3">Nama Uraian Belanja</th>
                <th className="px-4 py-3">Jenis Belanja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {belanjaList
                .filter(
                  b =>
                    b.kodeBelanja.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    b.namaBelanja.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((b, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono font-bold text-emerald-400">{b.kodeBelanja}</td>
                    <td className="px-4 py-3 font-semibold text-white">{b.namaBelanja}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                        {b.jenisBelanja}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: REKANAN */}
      {activeTab === 'master-rekanan' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-300 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Nama Rekanan / Penyedia</th>
                <th className="px-4 py-3">NPWP</th>
                <th className="px-4 py-3">Bank & No Rekening</th>
                <th className="px-4 py-3">Alamat</th>
                <th className="px-4 py-3">Kontak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {rekananList
                .filter(
                  r =>
                    r.namaRekanan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    r.npwp.includes(searchTerm)
                )
                .map(r => (
                  <tr key={r.id} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-bold text-white">{r.namaRekanan}</td>
                    <td className="px-4 py-3 font-mono text-amber-300">{r.npwp}</td>
                    <td className="px-4 py-3 font-mono text-emerald-400">
                      {r.bank} - {r.noRekening}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{r.alamat}</td>
                    <td className="px-4 py-3 text-slate-300">{r.kontak}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* EDIT OPD MODAL */}
      {editingOpd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Edit Data OPD / Unit Kerja</h3>
              </div>
              <button onClick={() => setEditingOpd(null)} className="text-slate-400 hover:text-white">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditOpd} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300">Kode SKPD / OPD:</label>
                <input
                  type="text"
                  required
                  value={editingOpd.kodeOPD}
                  onChange={e => setEditingOpd({ ...editingOpd, kodeOPD: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300">Nama Resmi OPD / SKPD:</label>
                <input
                  type="text"
                  required
                  value={editingOpd.namaOPD}
                  onChange={e => setEditingOpd({ ...editingOpd, namaOPD: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300">Singkatan OPD:</label>
                  <input
                    type="text"
                    required
                    value={editingOpd.singkatan}
                    onChange={e => setEditingOpd({ ...editingOpd, singkatan: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300">NIP Kepala Badan:</label>
                  <input
                    type="text"
                    required
                    value={editingOpd.nipKepala}
                    onChange={e => setEditingOpd({ ...editingOpd, nipKepala: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300">Nama Kepala Badan / Dinas:</label>
                <input
                  type="text"
                  required
                  value={editingOpd.kepalaBadan}
                  onChange={e => setEditingOpd({ ...editingOpd, kepalaBadan: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Logo Preview & File Import Input inside Edit Modal */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-2">
                <label className="font-bold text-slate-300 block">Logo Resmi Provinsi NTB:</label>
                <div className="flex items-center gap-3">
                  {editingOpd.logoUrl ? (
                    <img
                      src={editingOpd.logoUrl}
                      alt="Preview Logo"
                      className="h-12 w-12 object-contain rounded-xl bg-slate-900 p-1 border border-emerald-500/30"
                    />
                  ) : (
                    <div className="p-1 rounded-xl bg-slate-900 border border-emerald-500/30">
                      <NTBLogo size={40} />
                    </div>
                  )}

                  <label className="flex items-center gap-1.5 cursor-pointer rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 px-3 py-2 font-bold text-emerald-300">
                    <Upload className="h-4 w-4" />
                    <span>Unggah File Logo Baru</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = ev => {
                            setEditingOpd({ ...editingOpd, logoUrl: ev.target?.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>

                  {editingOpd.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setEditingOpd({ ...editingOpd, logoUrl: '' })}
                      className="text-slate-400 hover:text-amber-400 text-[11px] underline"
                    >
                      Reset Logo
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingOpd(null)}
                  className="w-1/2 rounded-xl bg-slate-800 py-2.5 font-bold text-slate-300 hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 rounded-xl bg-amber-600 py-2.5 font-bold text-white hover:bg-amber-500 shadow"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE OPD CONFIRMATION MODAL */}
      {deletingOpd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-rose-800/80 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400 border-b border-slate-800 pb-3">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-base font-bold text-white">Konfirmasi Hapus OPD</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus Unit Kerja / OPD{' '}
              <span className="font-bold text-white">"{deletingOpd.namaOPD}"</span> ({deletingOpd.singkatan})?
            </p>

            <div className="rounded-xl bg-rose-950/40 p-3 border border-rose-800/50 text-[11px] text-rose-200">
              Tindakan ini akan menghapus entitas OPD dari daftar master data lokal.
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingOpd(null)}
                className="w-1/2 rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteOpd}
                className="w-1/2 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-500 shadow"
              >
                Ya, Hapus OPD
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MASTER DATA MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Form Master Data</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Input for OPD */}
            {activeTab === 'master-opd' && (
              <form onSubmit={handleSaveAddOpd} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-300">Kode SKPD / OPD:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 5.01.0.00.0.00.01.0000"
                    value={formOpd.kodeOPD}
                    onChange={e => setFormOpd({ ...formOpd, kodeOPD: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300">Nama Resmi OPD:</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap Dinas / Badan"
                    value={formOpd.namaOPD}
                    onChange={e => setFormOpd({ ...formOpd, namaOPD: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-300">Singkatan:</label>
                    <input
                      type="text"
                      required
                      placeholder="BAKESBANGPOLDAGRI NTB"
                      value={formOpd.singkatan}
                      onChange={e => setFormOpd({ ...formOpd, singkatan: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300">NIP Kepala Badan:</label>
                    <input
                      type="text"
                      required
                      placeholder="19680312..."
                      value={formOpd.nipKepala}
                      onChange={e => setFormOpd({ ...formOpd, nipKepala: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-300">Nama Kepala Badan / Dinas:</label>
                  <input
                    type="text"
                    required
                    placeholder="Gelar & Nama Lengkap"
                    value={formOpd.kepalaBadan}
                    onChange={e => setFormOpd({ ...formOpd, kepalaBadan: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                  />
                </div>

                {/* Logo Uploader */}
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Logo Provinsi NTB (Opsional):</label>
                  <label className="flex items-center justify-center gap-2 cursor-pointer rounded-xl border border-dashed border-emerald-600/50 bg-slate-950 p-3 text-emerald-300 hover:bg-emerald-950/40 transition">
                    <Upload className="h-4 w-4" />
                    <span>{formOpd.logoUrl ? 'Logo Terpilih (Klik untuk Ganti)' : 'Pilih Gambar Logo NTB'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = ev => {
                            setFormOpd({ ...formOpd, logoUrl: ev.target?.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow mt-2"
                >
                  Simpan Data OPD Baru
                </button>
              </form>
            )}

            {/* Modal Input for Program */}
            {activeTab === 'master-program' && (
              <form onSubmit={handleSaveProgram} className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300">Kode Program:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 5.01.05"
                    value={formProgram.kodeProgram}
                    onChange={e => setFormProgram({ ...formProgram, kodeProgram: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300">Nama Program:</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Program Lengkap"
                    value={formProgram.namaProgram}
                    onChange={e => setFormProgram({ ...formProgram, namaProgram: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500"
                >
                  Simpan Program Master
                </button>
              </form>
            )}

            {/* Modal Input for Rekanan */}
            {activeTab === 'master-rekanan' && (
              <form onSubmit={handleSaveRekanan} className="mt-4 space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-300">Nama Rekanan / Penyedia:</label>
                  <input
                    type="text"
                    required
                    placeholder="CV / PT / Bank / Lembaga"
                    value={formRekanan.namaRekanan}
                    onChange={e => setFormRekanan({ ...formRekanan, namaRekanan: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-300">NPWP:</label>
                    <input
                      type="text"
                      placeholder="00.000.000.0-000.000"
                      value={formRekanan.npwp}
                      onChange={e => setFormRekanan({ ...formRekanan, npwp: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300">Bank:</label>
                    <input
                      type="text"
                      value={formRekanan.bank}
                      onChange={e => setFormRekanan({ ...formRekanan, bank: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300">Nomor Rekening:</label>
                  <input
                    type="text"
                    value={formRekanan.noRekening}
                    onChange={e => setFormRekanan({ ...formRekanan, noRekening: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500"
                >
                  Simpan Data Rekanan
                </button>
              </form>
            )}

            {activeTab !== 'master-program' && activeTab !== 'master-rekanan' && activeTab !== 'master-opd' && (
              <div className="py-6 text-center text-xs text-slate-400">
                Data master {activeTab} secara otomatis disinkronkan dengan Struktur Tabel Google Spreadsheet BAKESBANGPOLDAGRI NTB.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
