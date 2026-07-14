import React, { useState } from 'react';
import { Mail, Phone, Lock, Eye, EyeOff, User as UserIcon, Building, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { CRM_API } from '../services/api';
import Swal from 'sweetalert2';
import { User } from '../types/crm';

interface AuthPageProps {
  onLoginSuccess: (user: User) => void;
}

export default function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Login States
  const [loginInput, setLoginInput] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Register States
  const [regName, setRegName] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  // Forgot Password / OTP States
  const [forgotInput, setForgotInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput || !loginPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulir Kosong',
        text: 'Harap masukkan Username/Nomor WhatsApp dan Password Anda.'
      });
      return;
    }

    setIsLoading(true);
    const res = await CRM_API.login(loginInput, loginPassword);
    setIsLoading(false);

    if (res.success && res.user) {
      Swal.fire({
        icon: 'success',
        title: 'Akses Diberikan',
        text: res.message,
        timer: 1200,
        showConfirmButton: false
      });
      onLoginSuccess(res.user);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Masuk',
        text: res.message
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regCompany || !regEmail || !regWhatsapp || !regUsername || !regPassword || !regConfirm) {
      Swal.fire({
        icon: 'warning',
        title: 'Data Belum Lengkap',
        text: 'Semua kolom registrasi wajib diisi.'
      });
      return;
    }

    // Basic Validation
    if (!regEmail.includes('@')) {
      Swal.fire('Error', 'Masukkan email yang valid.', 'error');
      return;
    }
    if (!regWhatsapp.startsWith('08') && !regWhatsapp.startsWith('62')) {
      Swal.fire('Error', 'Nomor WhatsApp harus berformat Indonesia (08... atau 62...)', 'error');
      return;
    }
    if (regPassword.length < 8) {
      Swal.fire('Error', 'Password minimal terdiri dari 8 karakter.', 'error');
      return;
    }
    if (regPassword !== regConfirm) {
      Swal.fire('Error', 'Konfirmasi password tidak cocok.', 'error');
      return;
    }

    setIsLoading(true);
    const res = await CRM_API.register({
      name: regName,
      company: regCompany,
      email: regEmail,
      whatsapp: regWhatsapp,
      username: regUsername,
      password: regPassword
    });
    setIsLoading(false);

    if (res.success && res.user) {
      Swal.fire({
        icon: 'success',
        title: 'Registrasi Sukses!',
        text: 'Akun Anda berhasil dibuat. Silakan login menggunakan akun baru Anda.',
        confirmButtonText: 'Login Sekarang',
        confirmButtonColor: '#2563EB'
      }).then(() => {
        setLoginInput(regUsername);
        setActiveTab('login');
      });
    } else {
      Swal.fire('Registrasi Gagal', res.message, 'error');
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotInput) {
      Swal.fire('Peringatan', 'Harap masukkan Username atau Nomor WhatsApp Anda.', 'warning');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
      Swal.fire({
        icon: 'success',
        title: 'OTP Terkirim!',
        text: 'Kode OTP tiruan (123456) telah dikirim ke WhatsApp Anda.',
        timer: 2000,
        showConfirmButton: false
      });
    }, 800);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode === '123456') {
      setOtpVerified(true);
      Swal.fire('Terverifikasi', 'OTP Berhasil diverifikasi. Silakan masukkan password baru.', 'success');
    } else {
      Swal.fire('Gagal', 'Kode OTP salah. Gunakan kode demo: 123456', 'error');
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      Swal.fire('Gagal', 'Password minimal 8 karakter.', 'error');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Swal.fire('Gagal', 'Konfirmasi password tidak cocok.', 'error');
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Password Diperbarui',
      text: 'Silakan masuk menggunakan password baru Anda.',
      confirmButtonText: 'Kembali ke Login',
      confirmButtonColor: '#2563EB'
    }).then(() => {
      // Reset states
      setActiveTab('login');
      setOtpSent(false);
      setOtpVerified(false);
      setOtpCode('');
      setNewPassword('');
      setConfirmNewPassword('');
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic Ambient Background Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] rounded-full bg-sky-400/10 blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <ShieldCheck size={28} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-sans tracking-tight text-slate-800 dark:text-white">
              EduTech Nusantara
            </h1>
            <p className="text-xs font-mono font-medium tracking-widest text-sky-500">
              DIGITAL CRM SYSTEM
            </p>
          </div>
        </div>
        <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
          SaaS-Grade Client & Project Lifecycle Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        {/* Main Card with light glassmorphism */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md py-8 px-4 shadow-xl border border-white/40 dark:border-slate-700/50 rounded-2xl sm:px-10">
          
          {/* Navigation tabs */}
          {activeTab !== 'forgot' && (
            <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
              <button
                onClick={() => setActiveTab('login')}
                className={`w-1/2 pb-3 text-sm font-semibold transition-all ${
                  activeTab === 'login'
                    ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                Masuk (Sign In)
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`w-1/2 pb-3 text-sm font-semibold transition-all ${
                  activeTab === 'register'
                    ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                Daftar Client
              </button>
            </div>
          )}

          {/* LOGIN VIEW */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Username atau No. WhatsApp
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-800 dark:text-white"
                    placeholder="rizkihandika atau 08123456..."
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('forgot')}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Lupa Password?
                  </button>
                </div>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-800 dark:text-white"
                    placeholder="Masukkan password..."
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember_me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                  <label htmlFor="remember_me" className="ml-2 block text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Ingat Saya
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Masuk CRM
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Login disclaimer or subtitle */}
              <div className="mt-4 pt-4 text-center border-t border-slate-100 dark:border-slate-700/80">
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  EduTech Nusantara Digital CRM System. All rights reserved.
                </p>
              </div>
            </form>
          )}

          {/* REGISTER VIEW */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="block w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white"
                  placeholder="Diana Putri"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1.5">
                  Nama Perusahaan / Instansi
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regCompany}
                    onChange={(e) => setRegCompany(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white"
                    placeholder="Nusantara Learn"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="block w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white"
                    placeholder="diana@gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1.5">
                    WhatsApp (ID)
                  </label>
                  <input
                    type="text"
                    required
                    value={regWhatsapp}
                    onChange={(e) => setRegWhatsapp(e.target.value)}
                    className="block w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white"
                    placeholder="0812345..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1.5">
                  Pilih Username Baru
                </label>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  className="block w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white"
                  placeholder="username_anda"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="block w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white"
                    placeholder="Min 8 karakter"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1.5">
                    Konfirmasi Password
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    className="block w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white"
                    placeholder="Konfirmasi..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Daftar Sebagai Client'
                )}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {activeTab === 'forgot' && (
            <div className="space-y-5">
              <div className="flex items-center gap-1 mb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  ← Kembali ke Login
                </button>
              </div>

              <div className="text-center mb-4">
                <h3 className="text-base font-bold text-slate-800 dark:text-white">Pulihkan Kata Sandi</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Masukkan Username / No. WhatsApp terdaftar untuk menerima OTP.
                </p>
              </div>

              {!otpSent && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-2">
                      Username / No. WhatsApp
                    </label>
                    <input
                      type="text"
                      required
                      value={forgotInput}
                      onChange={(e) => setForgotInput(e.target.value)}
                      className="block w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white"
                      placeholder="Contoh: andipratama atau 0812..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
                  >
                    Kirim Kode OTP
                  </button>
                </form>
              )}

              {otpSent && !otpVerified && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-2">
                      Masukkan 6-Digit OTP WhatsApp
                    </label>
                    <input
                      type="text"
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="block text-center tracking-widest text-lg font-bold w-full px-3 py-2 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="123456"
                      maxLength={6}
                    />
                    <p className="text-[10px] text-slate-400 mt-1.5 text-center">
                      Gunakan kode demo: <strong className="text-blue-500 font-mono">123456</strong>
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    Verifikasi OTP
                  </button>
                </form>
              )}

              {otpVerified && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1.5">
                      Password Baru
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white"
                      placeholder="Min 8 karakter..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1.5">
                      Konfirmasi Password Baru
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="block w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white"
                      placeholder="Ulangi password..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                  >
                    Simpan & Update Password
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
