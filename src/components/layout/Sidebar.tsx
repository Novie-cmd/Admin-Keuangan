import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Database,
  FileSpreadsheet,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
  Layers,
  FileText,
  UploadCloud,
  CheckSquare,
  TrendingUp,
  PieChart,
  CalendarDays,
  Users,
  Shield,
  Activity,
  Award,
  DollarSign,
  Building2,
  FolderKanban,
  FileSearch,
  BookOpen
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  // Master Data
  | 'master-tahun'
  | 'master-opd'
  | 'master-program'
  | 'master-kegiatan'
  | 'master-subkegiatan'
  | 'master-belanja'
  | 'master-sumberdana'
  | 'master-rekanan'
  // Transaksi
  | 'transaksi-anggaran'
  | 'transaksi-realisasi'
  | 'transaksi-excel'
  | 'transaksi-koreksi'
  // Pelaporan
  | 'laporan-program'
  | 'laporan-kegiatan'
  | 'laporan-subkegiatan'
  | 'laporan-belanja'
  | 'laporan-bulanan'
  | 'laporan-triwulan'
  | 'laporan-semester'
  | 'laporan-tahunan'
  // Analisis
  | 'analisis-grafik'
  | 'analisis-target'
  | 'analisis-progress'
  | 'analisis-monitoring'
  // Pengaturan
  | 'pengaturan';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen
}) => {
  const { currentUser, switchRole, resetAllData } = useApp();

  // Accordion state for sidebar sub-menus
  const [openMaster, setOpenMaster] = useState(false);
  const [openTransaksi, setOpenTransaksi] = useState(true);
  const [openPelaporan, setOpenPelaporan] = useState(true);
  const [openAnalisis, setOpenAnalisis] = useState(false);

  // Role permissions filter helper
  const role = currentUser.role;

  const canAccessMaster = role === 'Administrator' || role === 'Operator Program' || role === 'Auditor';
  const canAccessTransaksi = role === 'Administrator' || role === 'Operator Program' || role === 'PPK' || role === 'Auditor';
  const canAccessPengaturan = role === 'Administrator' || role === 'Auditor';

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-800 bg-slate-950 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Sidebar Header Brand Badge */}
      <div className="flex h-20 items-center justify-between border-b border-slate-800/80 px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 font-bold text-white shadow-lg shadow-emerald-950/50">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              BFMS ERP PORTAL
            </span>
            <span className="text-xs text-slate-400 font-medium">
              NTB Province System
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
        
        {/* DASHBOARD */}
        <button
          onClick={() => {
            setActiveTab('dashboard');
            if (window.innerWidth < 1024) setIsOpen(false);
          }}
          className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
            activeTab === 'dashboard'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/60 font-bold'
              : 'text-slate-300 hover:bg-slate-900 hover:text-white'
          }`}
          id="menu-dashboard"
        >
          <LayoutDashboard className="h-4 w-4 text-emerald-400" />
          <span>Dashboard Utama</span>
        </button>

        {/* MASTER DATA ACCORDION */}
        {canAccessMaster && (
          <div>
            <button
              onClick={() => setOpenMaster(!openMaster)}
              className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-white"
              id="accordion-master-data"
            >
              <span className="flex items-center gap-3">
                <Database className="h-4 w-4 text-emerald-400" />
                <span>Master Data</span>
              </span>
              {openMaster ? (
                <ChevronDown className="h-4 w-4 text-slate-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-slate-500" />
              )}
            </button>

            {openMaster && (
              <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-800 pl-3">
                {[
                  { id: 'master-tahun', label: 'Tahun Anggaran' },
                  { id: 'master-opd', label: 'OPD / Unit Kerja' },
                  { id: 'master-program', label: 'Program' },
                  { id: 'master-kegiatan', label: 'Kegiatan' },
                  { id: 'master-subkegiatan', label: 'Sub Kegiatan' },
                  { id: 'master-belanja', label: 'Belanja Rekening' },
                  { id: 'master-sumberdana', label: 'Sumber Dana' },
                  { id: 'master-rekanan', label: 'Data Rekanan' }
                ].map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setActiveTab(sub.id as ActiveTab);
                      if (window.innerWidth < 1024) setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs transition ${
                      activeTab === sub.id
                        ? 'bg-emerald-900/60 text-emerald-200 font-bold border-l-2 border-emerald-400'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span>{sub.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TRANSAKSI ACCORDION */}
        {canAccessTransaksi && (
          <div>
            <button
              onClick={() => setOpenTransaksi(!openTransaksi)}
              className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-white"
              id="accordion-transaksi"
            >
              <span className="flex items-center gap-3">
                <FileSpreadsheet className="h-4 w-4 text-teal-400" />
                <span>Transaksi Keuangan</span>
              </span>
              {openTransaksi ? (
                <ChevronDown className="h-4 w-4 text-slate-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-slate-500" />
              )}
            </button>

            {openTransaksi && (
              <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-800 pl-3">
                {[
                  { id: 'transaksi-anggaran', label: 'Input Anggaran Pagu', icon: DollarSign },
                  { id: 'transaksi-realisasi', label: 'Input Realisasi (SP2D)', icon: FileText },
                  { id: 'transaksi-excel', label: 'Upload / Import Excel', icon: UploadCloud },
                  { id: 'transaksi-koreksi', label: 'Koreksi Data / Approval', icon: CheckSquare }
                ].map(sub => {
                  const Icon = sub.icon;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setActiveTab(sub.id as ActiveTab);
                        if (window.innerWidth < 1024) setIsOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs transition ${
                        activeTab === sub.id
                          ? 'bg-emerald-900/60 text-emerald-200 font-bold border-l-2 border-emerald-400'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 text-teal-400" />
                      <span>{sub.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PELAPORAN ACCORDION */}
        <div>
          <button
            onClick={() => setOpenPelaporan(!openPelaporan)}
            className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-white"
            id="accordion-pelaporan"
          >
            <span className="flex items-center gap-3">
              <BookOpen className="h-4 w-4 text-amber-400" />
              <span>Pelaporan (Reports)</span>
            </span>
            {openPelaporan ? (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-500" />
            )}
          </button>

          {openPelaporan && (
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-800 pl-3">
              {[
                { id: 'laporan-program', label: 'Realisasi Program' },
                { id: 'laporan-kegiatan', label: 'Realisasi Kegiatan' },
                { id: 'laporan-subkegiatan', label: 'Realisasi Sub Kegiatan' },
                { id: 'laporan-belanja', label: 'Realisasi Belanja' },
                { id: 'laporan-bulanan', label: 'Laporan Bulanan' },
                { id: 'laporan-triwulan', label: 'Laporan Triwulan' },
                { id: 'laporan-semester', label: 'Laporan Semester' },
                { id: 'laporan-tahunan', label: 'Laporan Tahunan' }
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => {
                    setActiveTab(sub.id as ActiveTab);
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs transition ${
                    activeTab === sub.id
                      ? 'bg-amber-950/60 text-amber-200 font-bold border-l-2 border-amber-400'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span>{sub.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ANALISIS & GRAFIK ACCORDION */}
        <div>
          <button
            onClick={() => setOpenAnalisis(!openAnalisis)}
            className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-white"
            id="accordion-analisis"
          >
            <span className="flex items-center gap-3">
              <BarChart3 className="h-4 w-4 text-cyan-400" />
              <span>Analisis & Grafik</span>
            </span>
            {openAnalisis ? (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-500" />
            )}
          </button>

          {openAnalisis && (
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-800 pl-3">
              {[
                { id: 'analisis-grafik', label: 'Grafik Interaktif' },
                { id: 'analisis-target', label: 'Target vs Realisasi' },
                { id: 'analisis-progress', label: 'Progress Bulanan' },
                { id: 'analisis-monitoring', label: 'Monitoring Evaluasi (Monev)' }
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => {
                    setActiveTab(sub.id as ActiveTab);
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs transition ${
                    activeTab === sub.id
                      ? 'bg-cyan-950/60 text-cyan-200 font-bold border-l-2 border-cyan-400'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span>{sub.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* PENGATURAN */}
        {canAccessPengaturan && (
          <button
            onClick={() => {
              setActiveTab('pengaturan');
              if (window.innerWidth < 1024) setIsOpen(false);
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
              activeTab === 'pengaturan'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
            id="menu-pengaturan"
          >
            <Settings className="h-4 w-4 text-slate-400" />
            <span>Pengaturan & Audit</span>
          </button>
        )}
      </div>

      {/* User Session Footer & Quick Switch */}
      <div className="border-t border-slate-800 p-4 bg-slate-900/60">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-white truncate max-w-[150px]">
              {currentUser.nama}
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">
              Role: {currentUser.role}
            </span>
          </div>

          <button
            onClick={() => switchRole(role === 'Administrator' ? 'Kepala Badan' : 'Administrator')}
            className="rounded-lg bg-slate-800 p-2 text-slate-400 hover:bg-rose-950 hover:text-rose-300 transition"
            title="Keluar / Ganti User"
            id="btn-logout-sidebar"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
