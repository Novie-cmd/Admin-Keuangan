import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Settings,
  Users,
  Database,
  Shield,
  Activity,
  RefreshCw,
  Plus,
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  Key,
  Globe,
  HardDrive
} from 'lucide-react';

export const PengaturanView: React.FC = () => {
  const {
    users,
    addUser,
    updateUserStatus,
    sheetConfig,
    setSheetConfig,
    syncStatus,
    syncWithSpreadsheet,
    activityLogs,
    resetAllData,
    currentUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'spreadsheet' | 'backup' | 'logs'>('users');

  // New User Form State
  const [showAddUser, setShowAddUser] = useState(false);
  const [newNama, setNewNama] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Operator Program');

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama || !newUsername) return;
    addUser({
      nama: newNama,
      username: newUsername,
      role: newRole,
      status: 'Aktif'
    });
    setNewNama('');
    setNewUsername('');
    setShowAddUser(false);
  };

  const exportBackupJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(localStorage));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `BFMS_NTB_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-emerald-400" />
          <h1 className="text-xl font-bold text-white">Pengaturan Sistem & Audit Trail</h1>
        </div>
        <p className="text-xs text-slate-400">
          Manajemen Pengguna, Integrasi Google Spreadsheet API, Cadangan Data & Audit Trail Aktivitas Pengguna
        </p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'users', label: 'Manajemen Pengguna (User)', icon: Users },
          { id: 'spreadsheet', label: 'Integrasi Google Spreadsheet', icon: Database },
          { id: 'backup', label: 'Backup & Restore Database', icon: HardDrive },
          { id: 'logs', label: 'Audit Trail (Log Aktivitas)', icon: Activity }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: MANAJEMEN PENGGUNA */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Daftar Pengguna Sistem (Hak Akses)</h2>
            <button
              onClick={() => setShowAddUser(!showAddUser)}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-500"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah User Baru</span>
            </button>
          </div>

          {showAddUser && (
            <form onSubmit={handleAddUserSubmit} className="rounded-2xl border border-emerald-600/40 bg-slate-900 p-5 space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div>
                  <label className="text-xs font-bold text-slate-300">Nama Lengkap & Gelar:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso, S.E."
                    value={newNama}
                    onChange={e => setNewNama(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300">Username Login:</label>
                  <input
                    type="text"
                    required
                    placeholder="username_ntb"
                    value={newUsername}
                    onChange={e => setNewUsername(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300">Role / Hak Akses:</label>
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value as UserRole)}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-white font-bold"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Operator Program">Operator Program</option>
                    <option value="PPK">PPK</option>
                    <option value="Kepala Badan">Kepala Badan</option>
                    <option value="Auditor">Auditor</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500"
              >
                Simpan User
              </button>
            </form>
          )}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-300 font-bold uppercase border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">ID User</th>
                  <th className="px-4 py-3">Nama Pengguna</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Role / Hak Akses</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono text-emerald-400 font-bold">{u.id}</td>
                    <td className="px-4 py-3 font-semibold text-white">{u.nama}</td>
                    <td className="px-4 py-3 font-mono text-slate-300">{u.username}</td>
                    <td className="px-4 py-3 font-bold text-amber-300">{u.role}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          u.status === 'Aktif'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          updateUserStatus(u.id, u.status === 'Aktif' ? 'Nonaktif' : 'Aktif')
                        }
                        className="text-xs font-semibold text-emerald-400 hover:underline"
                      >
                        {u.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: GOOGLE SPREADSHEET */}
      {activeTab === 'spreadsheet' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Konfigurasi Google Apps Script WebApp</h3>
              </div>
              <span className="rounded-full bg-emerald-950 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-700">
                Status: {sheetConfig.status}
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Spreadsheet ID:</label>
              <input
                type="text"
                value={sheetConfig.spreadsheetId}
                onChange={e => setSheetConfig({ ...sheetConfig, spreadsheetId: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-emerald-300 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Google Apps Script Web App URL:</label>
              <input
                type="text"
                value={sheetConfig.webAppUrl}
                onChange={e => setSheetConfig({ ...sheetConfig, webAppUrl: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Terakhir Sinkronisasi: {sheetConfig.lastSyncedAt || 'Belum'}
              </span>
              <button
                onClick={syncWithSpreadsheet}
                disabled={syncStatus === 'syncing'}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-md"
              >
                <RefreshCw className={`h-4 w-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                <span>Test & Sinkronkan Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BACKUP */}
      {activeTab === 'backup' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white">Cadangan (Backup) & Pemulihan Data Database</h3>
          <p className="text-xs text-slate-400">
            Ekspor seluruh data transaksi anggaran, realisasi, dan master data ke format JSON aman.
          </p>

          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={exportBackupJSON}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-md"
            >
              <Download className="h-4 w-4" />
              <span>Unduh Cadangan JSON</span>
            </button>

            <button
              onClick={resetAllData}
              className="flex items-center gap-2 rounded-xl border border-rose-800 bg-rose-950/60 px-5 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-900"
            >
              <span>Reset Seluruh Data</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL */}
      {activeTab === 'logs' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Log Aktivitas / Audit Trail Pengguna
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-300 font-bold uppercase border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Tanggal & Jam</th>
                  <th className="px-4 py-3">User & Role</th>
                  <th className="px-4 py-3">Aktivitas Sistem</th>
                  <th className="px-4 py-3">IP / Device</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {activityLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">
                      {log.tanggal} {log.jam}
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">
                      {log.user} <span className="text-emerald-400 font-normal">({log.role})</span>
                    </td>
                    <td className="px-4 py-3 text-slate-200">{log.aktivitas}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
