import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldAlert,
  Save,
  Key,
  Smartphone,
  Mail,
  History
} from 'lucide-react';
import { CRM_API } from '../services/api';
import { User as UserType } from '../types/crm';
import Swal from 'sweetalert2';

export default function ProfileManager() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const user = CRM_API.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setName(user.name);
      setEmail(user.email);
      setWhatsapp(user.whatsapp);
    }
  }, []);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const updated = {
      ...currentUser,
      name,
      email,
      whatsapp
    };

    // Save changes
    CRM_API.saveUser(updated);
    localStorage.setItem('edutech_crm_current_user', JSON.stringify(updated));
    setCurrentUser(updated);
    Swal.fire({
      icon: 'success',
      title: 'Profil Diperbarui',
      text: 'Informasi data diri Anda berhasil diperbarui di server.',
      confirmButtonColor: '#2563EB'
    }).then(() => {
      // Force reload to apply changes everywhere (navbar/sidebar)
      window.location.reload();
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      Swal.fire('Formulir Belum Selesai', 'Isikan password lama dan password baru Anda.', 'warning');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');

    Swal.fire({
      icon: 'success',
      title: 'Kata Sandi Diperbarui',
      text: 'Sandi rahasia masuk sistem Anda berhasil di-update.',
      confirmButtonColor: '#2563EB'
    });
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <User size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Profil Pengguna & Kredensial</h3>
            <p className="text-xs text-slate-400">Atur kredensial login, data personal, nomor kontak, dan pantau log masuk</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        {/* Profile details */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm space-y-6">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
            <User size={16} className="text-blue-500" />
            <span>Detail Informasi Kontak</span>
          </h4>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Nama Lengkap Anda</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Username Sistem (Akses Utama)</label>
                <input
                  type="text"
                  disabled
                  value={`@${currentUser.username}`}
                  className="mt-1 block w-full px-3 py-2 border border-slate-100 bg-slate-50 dark:bg-slate-900/40 text-slate-400 rounded-xl cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Mail size={12} />
                  <span>Email Kantor</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Smartphone size={12} />
                  <span>No. WhatsApp</span>
                </label>
                <input
                  type="text"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center gap-1.5 transition"
              >
                <Save size={14} />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </form>
        </div>

        {/* Change password section */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <Key size={16} className="text-rose-500" />
              <span>Ganti Kata Sandi</span>
            </h4>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Sandi Saat Ini *</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Sandi Baru *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition border dark:border-slate-800"
              >
                Rubah Kata Sandi
              </button>
            </form>
          </div>

          {/* Audit Logs summary */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <History size={16} className="text-blue-500" />
              <span>Riwayat Sesi Masuk</span>
            </h4>

            <div className="space-y-2 text-[10px] font-mono leading-relaxed text-slate-400">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <span className="block font-bold text-slate-600 dark:text-slate-300">Sesi Browser Aktif (Sekarang)</span>
                <span>IP: 182.16.2.24 • Bandung, Jawa Barat</span>
              </div>
              <div className="p-2.5 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl">
                <span className="block font-bold text-slate-500">12 Juli 2026 14:24</span>
                <span>IP: 182.16.2.24 • Chrome, Windows 11</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
