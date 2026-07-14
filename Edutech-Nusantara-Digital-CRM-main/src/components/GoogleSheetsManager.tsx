import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Cloud,
  CloudUpload,
  CloudDownload,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  Database,
  LogOut,
  ExternalLink,
  PlusCircle,
  Lock,
  Link2,
  Trash2
} from 'lucide-react';
import Swal from 'sweetalert2';
import { motion } from 'motion/react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  googleSignOut,
  listSpreadsheets,
  createCRMSpreadsheet,
  exportCRMDataToSpreadsheet,
  importCRMDataFromSpreadsheet,
  getAccessToken,
  GoogleDriveFile
} from '../services/googleSheets';

export default function GoogleSheetsManager() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [spreadsheets, setSpreadsheets] = useState<GoogleDriveFile[]>([]);
  const [selectedSheetId, setSelectedSheetId] = useState<string>('');
  const [lastSynced, setLastSynced] = useState<string>('');
  const [syncDirection, setSyncDirection] = useState<'idle' | 'exporting' | 'importing'>('idle');

  // Initialize Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setFirebaseUser(user);
        setAccessToken(token);
        setLoading(false);
        loadSpreadsheetList(token);
      },
      () => {
        setFirebaseUser(null);
        setAccessToken(null);
        setLoading(false);
      }
    );

    // Retrieve saved Google Spreadsheet ID and Sync history from localStorage
    const savedId = localStorage.getItem('edutech_crm_active_spreadsheet_id');
    if (savedId) {
      setSelectedSheetId(savedId);
    }
    const savedSync = localStorage.getItem('edutech_crm_last_sheets_sync');
    if (savedSync) {
      setLastSynced(savedSync);
    }

    return () => unsubscribe();
  }, []);

  // Fetch lists of spreadsheets from user Google Drive
  const loadSpreadsheetList = async (token: string) => {
    try {
      const list = await listSpreadsheets(token);
      setSpreadsheets(list);
    } catch (err: any) {
      console.error('Failed to list spreadsheets', err);
    }
  };

  const handleSignIn = async () => {
    try {
      setLoading(true);
      const res = await googleSignIn();
      if (res) {
        setFirebaseUser(res.user);
        setAccessToken(res.accessToken);
        Swal.fire({
          icon: 'success',
          title: 'Google Terkoneksi!',
          text: `Selamat datang, ${res.user.displayName}. Izin akses Google Sheets berhasil diberikan.`,
          confirmButtonColor: '#2563EB'
        });
        loadSpreadsheetList(res.accessToken);
      }
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Koneksi Gagal',
        text: err.message || 'Gagal login menggunakan akun Google Anda.',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await googleSignOut();
      setFirebaseUser(null);
      setAccessToken(null);
      setSpreadsheets([]);
      Swal.fire({
        icon: 'info',
        title: 'Koneksi Diputus',
        text: 'Akun Google Anda berhasil dide-otorisasi dari aplikasi.',
        confirmButtonColor: '#64748B'
      });
    } catch (err: any) {
      console.error('Signout failed', err);
    }
  };

  // Create a brand new Spreadsheet in Drive
  const handleCreateNewSpreadsheet = async () => {
    if (!accessToken) return;
    try {
      Swal.fire({
        title: 'Mempersiapkan Spreadsheet...',
        text: 'Membuat file spreadsheet baru di Google Drive Anda...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const spreadsheetId = await createCRMSpreadsheet(accessToken);
      setSelectedSheetId(spreadsheetId);
      localStorage.setItem('edutech_crm_active_spreadsheet_id', spreadsheetId);

      // Refresh file list
      await loadSpreadsheetList(accessToken);

      Swal.fire({
        icon: 'success',
        title: 'Spreadsheet Dibuat!',
        text: 'File "EduTech Nusantara CRM Database" baru berhasil dibuat di Google Drive Anda.',
        confirmButtonColor: '#10B981'
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Membuat File',
        text: err.message || 'Gagal melakukan API Handshake dengan Google Drive.',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  // Connect spreadsheet via manual URL or ID input
  const handleConnectByUrl = async () => {
    Swal.fire({
      title: 'Hubungkan via URL Spreadsheet',
      input: 'text',
      inputLabel: 'Masukkan URL Google Sheets Anda',
      inputPlaceholder: 'https://docs.google.com/spreadsheets/d/.../edit',
      showCancelButton: true,
      confirmButtonText: 'Hubungkan',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#2563EB',
      inputValidator: (value) => {
        if (!value) {
          return 'URL Spreadsheet tidak boleh kosong!';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        let extractedId = result.value;
        const matches = result.value.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (matches && matches[1]) {
          extractedId = matches[1];
        }

        setSelectedSheetId(extractedId);
        localStorage.setItem('edutech_crm_active_spreadsheet_id', extractedId);

        Swal.fire({
          icon: 'success',
          title: 'Koneksi Berhasil',
          text: 'Google Sheet berhasil di-link-kan dengan ID: ' + extractedId,
          confirmButtonColor: '#2563EB'
        });
      }
    });
  };

  // Export database from localstorage to Sheets
  const handleExportData = async () => {
    if (!accessToken || !selectedSheetId) return;

    setSyncDirection('exporting');
    Swal.fire({
      title: 'Mengekspor Data...',
      text: 'Mengirimkan modul-modul database CRM ke Google Spreadsheet...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      await exportCRMDataToSpreadsheet(accessToken, selectedSheetId);

      const timestamp = new Date().toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
      setLastSynced(timestamp);
      localStorage.setItem('edutech_crm_last_sheets_sync', timestamp);

      Swal.fire({
        icon: 'success',
        title: 'Ekspor Sukses!',
        text: 'Seluruh tabel (Data Klien, Pesanan, Invoice, Progress, Chat) berhasil diekspor ke Google Sheets.',
        confirmButtonColor: '#10B981'
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Ekspor Gagal',
        text: err.message || 'Periksa apakah spreadsheet Anda memiliki tab-tab yang sesuai.',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setSyncDirection('idle');
    }
  };

  // Import database from Sheets into localStorage (MANDATORY: Destructive warning confirmation)
  const handleImportData = async () => {
    if (!accessToken || !selectedSheetId) return;

    // MANDATORY Confirmation dialog before destructive operation
    Swal.fire({
      title: 'Konfirmasi Sinkronisasi Masuk',
      text: 'PERINGATAN: Tindakan ini bersifat destruktif. Data lokal di browser Anda saat ini akan sepenuhnya DIGANTI dengan data dari file Google Spreadsheet terpilih. Apakah Anda yakin?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Ya, Timpa Data Lokal!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setSyncDirection('importing');
        Swal.fire({
          title: 'Mengimpor Data...',
          text: 'Mengunduh data dan menimpa database lokal CRM...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        try {
          await importCRMDataFromSpreadsheet(accessToken, selectedSheetId);

          const timestamp = new Date().toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short'
          });
          setLastSynced(timestamp);
          localStorage.setItem('edutech_crm_last_sheets_sync', timestamp);

          Swal.fire({
            icon: 'success',
            title: 'Impor Sukses!',
            text: 'Data CRM lokal Anda berhasil disinkronisasi dengan spreadsheet. Halaman akan dimuat ulang untuk menerapkan data.',
            confirmButtonColor: '#10B981'
          }).then(() => {
            window.location.reload();
          });
        } catch (err: any) {
          Swal.fire({
            icon: 'error',
            title: 'Impor Gagal',
            text: err.message || 'Mohon pastikan format data di Spreadsheet Anda benar.',
            confirmButtonColor: '#EF4444'
          });
        } finally {
          setSyncDirection('idle');
        }
      }
    });
  };

  const activeSheetName = spreadsheets.find(s => s.id === selectedSheetId)?.name || 'Koneksi Kustom';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <RefreshCw className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="mt-4 text-xs font-semibold text-slate-500">Mencari otentikasi Google Cloud...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header controls with Professional Polish styling */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Sinkronisasi & Integrasi Google Sheets</h3>
            <p className="text-xs text-slate-400">Hubungkan CRM ke spreadsheet cloud Google Drive untuk backup, pelaporan, dan sinkronisasi real-time</p>
          </div>
        </div>
        {firebaseUser && (
          <div className="flex items-center gap-3 self-end md:self-auto bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
            <img
              src={firebaseUser.photoURL || 'https://api.dicebear.com/7.x/adventurer/svg?seed=sheets'}
              alt={firebaseUser.displayName || 'User'}
              className="w-8 h-8 rounded-full border border-white"
              referrerPolicy="no-referrer"
            />
            <div className="text-left text-[10px]">
              <p className="font-bold text-slate-800 dark:text-white leading-none">{firebaseUser.displayName}</p>
              <p className="text-slate-400 font-mono leading-relaxed truncate max-w-[150px]">{firebaseUser.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1 text-slate-400 hover:text-red-500 rounded transition"
              title="De-otorisasi"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        {/* Connection Setup Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm space-y-6">
          {!firebaseUser ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Lock size={28} />
              </div>
              <div className="space-y-1 max-w-sm">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Otentikasi Akun Google Diperlukan</h4>
                <p className="text-xs text-slate-400">
                  Untuk melakukan ekspor, impor, dan mengelola spreadsheet Anda di Google Drive, silakan hubungkan dengan akun Google Anda terlebih dahulu.
                </p>
              </div>

              {/* Styled Sign In Button resembles Official Google Branding */}
              <button
                onClick={handleSignIn}
                className="gsi-material-button hover:shadow-md cursor-pointer transition-all duration-200"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'white',
                  border: '1px solid #dadce0',
                  borderRadius: '12px',
                  padding: '10px 24px',
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: '600',
                  color: '#3c4043'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block', width: '18px', height: '18px' }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                  <span className="text-xs font-semibold text-slate-700">Hubungkan ke Akun Google</span>
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Database size={16} className="text-blue-500" />
                  <span>Atur Tautan Google Spreadsheet</span>
                </h4>
                <p className="text-slate-400 mt-1">Pilih spreadsheet dari Drive Anda, buat baru, atau tempel URL spreadsheet yang ada.</p>
              </div>

              {/* Spreadsheets Selection Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Pilih Spreadsheet dari Drive</label>
                  <select
                    value={selectedSheetId}
                    onChange={(e) => {
                      setSelectedSheetId(e.target.value);
                      localStorage.setItem('edutech_crm_active_spreadsheet_id', e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Pilih Spreadsheet Anda --</option>
                    {spreadsheets.map((sheet) => (
                      <option key={sheet.id} value={sheet.id}>
                        {sheet.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 flex flex-col justify-end">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Aksi Pembuatan Cepat</span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateNewSpreadsheet}
                      className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-200/50 dark:border-emerald-800/40 font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <PlusCircle size={14} />
                      <span>Buat Database Baru</span>
                    </button>
                    <button
                      onClick={handleConnectByUrl}
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl border dark:border-slate-800 font-bold transition flex items-center justify-center gap-1.5"
                      title="Link by URL"
                    >
                      <Link2 size={14} />
                      <span>Input URL</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Display */}
              {selectedSheetId && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1.5">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Spreadsheet Terhubung:</p>
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet size={16} className="text-emerald-500" />
                      <span className="font-bold text-slate-700 dark:text-slate-300">{activeSheetName}</span>
                    </div>
                    <p className="text-[10px] font-mono text-slate-400 select-all truncate max-w-sm sm:max-w-md">ID: {selectedSheetId}</p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`https://docs.google.com/spreadsheets/d/${selectedSheetId}/edit`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/50 rounded-xl transition font-bold flex items-center gap-1"
                    >
                      <span>Buka Spreadsheet</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              )}

              {/* Core Synchronization Actions (Double directional sync) */}
              {selectedSheetId && (
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Pusat Sinkronisasi Data</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* EXPORT BUTTON */}
                    <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900/30 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
                      <div className="space-y-1 mb-4">
                        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs">
                          <CloudUpload size={16} />
                          <span>Ekspor ke Sheets</span>
                        </div>
                        <p className="text-slate-400 leading-relaxed">
                          Kirim data lokal Anda saat ini (klien baru, invoice, chat) ke Google Spreadsheet cloud. Sempurna untuk kolaborasi instan.
                        </p>
                      </div>
                      <button
                        onClick={handleExportData}
                        disabled={syncDirection !== 'idle'}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                      >
                        {syncDirection === 'exporting' ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Mengunggah...</span>
                          </>
                        ) : (
                          <>
                            <CloudUpload size={14} />
                            <span>Ekspor Semua Tabel</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* IMPORT BUTTON */}
                    <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900/30 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
                      <div className="space-y-1 mb-4">
                        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-xs">
                          <CloudDownload size={16} />
                          <span>Impor dari Sheets</span>
                        </div>
                        <p className="text-slate-400 leading-relaxed">
                          Muat data dari Google Spreadsheet Anda untuk menimpa dan memulihkan CRM lokal. Peringatan: Tindakan ini bersifat destruktif.
                        </p>
                      </div>
                      <button
                        onClick={handleImportData}
                        disabled={syncDirection !== 'idle'}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                      >
                        {syncDirection === 'importing' ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Mengunduh...</span>
                          </>
                        ) : (
                          <>
                            <CloudDownload size={14} />
                            <span>Sinkronkan & Timpa Lokal</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info & Schema Guide */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <CheckCircle size={16} className="text-emerald-500" />
              <span>Status Sinkronisasi</span>
            </h4>

            <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 p-3.5 rounded-xl space-y-2">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Google OAuth API</span>
                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase ${firebaseUser ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {firebaseUser ? 'Terhubung' : 'Terputus'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-slate-100/50 dark:border-slate-800/50">
                <span className="text-slate-500">Database Linked</span>
                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase ${selectedSheetId ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {selectedSheetId ? 'Link Aktif' : 'Belum Ada'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-slate-100/50 dark:border-slate-800/50">
                <span className="text-slate-500">Sinkronisasi Terakhir</span>
                <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400">{lastSynced || 'Belum Pernah'}</span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 rounded-xl leading-relaxed">
              <h5 className="font-bold text-[11px] mb-1 flex items-center gap-1">
                <AlertCircle size={12} />
                <span>Struktur Spreadsheet</span>
              </h5>
              <p className="text-[10px]">
                File spreadsheet Anda akan secara otomatis dibuat dengan tab-tab berikut untuk pemetaan data CRM:
              </p>
              <ul className="list-disc pl-4 mt-2 space-y-1 text-[9px] font-mono">
                <li>Users (Staff/Role access)</li>
                <li>Clients (Daftar Akun Klien)</li>
                <li>Services (Daftar Katalog Jasa)</li>
                <li>Orders (Kontrak pengerjaan)</li>
                <li>Progress (Milestone & checklist)</li>
                <li>Invoices (Tagihan Keuangan)</li>
                <li>Payments (Riwayat Pembayaran)</li>
                <li>Documents (File download/url)</li>
                <li>Chats (Log pesan internal)</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 text-center space-y-1">
            <p className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
              <Lock size={10} />
              <span>Secured OAuth 2.0 Access</span>
            </p>
            <p>Token Anda disimpan aman di dalam memori sandbox browser.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
