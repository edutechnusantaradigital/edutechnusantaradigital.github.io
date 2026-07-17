/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Mail, User, Phone, Sparkles, Loader2, Key, 
  AlertCircle, CheckCircle2, Eye, EyeOff, Building, 
  Sun, Moon, ArrowRight
} from 'lucide-react';

interface LoginViewProps {
  onGoogleSignIn: () => void;
  onCredentialSignIn: (credential: string, password: string, rememberMe: boolean) => Promise<any>;
  onResetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  loading: boolean;
}

const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // ignore
    }
  }
};

export default function LoginView({
  onGoogleSignIn,
  onCredentialSignIn,
  onResetPassword,
  loading
}: LoginViewProps) {
  // Tabs: 'login' | 'register'
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login form states
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Registration form states
  const [regName, setRegName] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regMarketing, setRegMarketing] = useState('Akim');
  const [regReferral, setRegReferral] = useState('');
  const [regAgree, setRegAgree] = useState(false);

  // Forgot Mode
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  // Feedback states
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Theme states (Defaults to light as requested for standard off-white/charcoal palette, supports switching)
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load theme from preference or system
  useEffect(() => {
    const savedTheme = safeLocalStorage.getItem('crm_login_theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    safeLocalStorage.setItem('crm_login_theme', nextTheme);
  };

  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credential.trim() || !password) {
      setError('Username, Email, atau WhatsApp serta Password harus diisi dengan benar.');
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      await onCredentialSignIn(credential.trim(), password, rememberMe);
      setSuccess('Autentikasi berhasil! Mengalihkan ke Dashboard Nusantara Digital...');
    } catch (err: any) {
      setError(err.message || 'Gagal masuk. Silakan periksa kembali kredensial Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!regAgree) {
      setError('Anda harus menyetujui syarat dan ketentuan layanan.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Sandi baru dan konfirmasi sandi tidak cocok.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Sandi minimal harus terdiri dari 6 karakter.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          companyName: regCompany.trim(),
          email: regEmail.trim(),
          whatsapp: regWhatsapp.trim(),
          username: regUsername.trim(),
          password: regPassword,
          marketingId: regMarketing,
          referralCode: regReferral.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mendaftar client.');

      setSuccess('Pendaftaran berhasil! Akun Anda siap digunakan. Silakan beralih ke halaman Masuk.');
      
      // Clear registration form
      setRegName('');
      setRegCompany('');
      setRegEmail('');
      setRegWhatsapp('');
      setRegUsername('');
      setRegPassword('');
      setRegConfirmPassword('');
      setRegReferral('');
      setRegAgree(false);

      // Switch tab to login after short delay
      setTimeout(() => {
        setActiveTab('login');
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Gagal melakukan pendaftaran client.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setError('Masukkan alamat email terdaftar Anda.');
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const res = await onResetPassword(forgotEmail.trim());
      if (res.success) {
        setSuccess(res.message || 'Tautan untuk mengatur ulang sandi telah dikirim ke email Anda.');
        setForgotEmail('');
      } else {
        setError('Gagal memproses tautan reset password.');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memproses reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col justify-between p-4 sm:p-6 md:p-8 relative overflow-hidden transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#0F172A] text-slate-100' : 'bg-[#F8FAFC] text-slate-800'
    }`} id="premium-login-view">
      
      {/* Decorative Blob Accents - Subtle & Soft */}
      <div className="absolute w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-[#14B8A6]/10 rounded-full blur-3xl -top-40 -left-40 pointer-events-none" />
      <div className="absolute w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-[#0EA5E9]/10 rounded-full blur-3xl -bottom-40 -right-40 pointer-events-none" />

      {/* Floating Theme Switcher */}
      <div className="w-full max-w-5xl mx-auto flex justify-end items-center z-20">
        <button
          onClick={toggleTheme}
          type="button"
          aria-label="Ubah tema visual"
          className={`p-2.5 rounded-full border transition-all duration-200 cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${
            theme === 'dark' 
              ? 'border-slate-800 bg-slate-900/90 text-amber-400 hover:text-amber-300 hover:bg-slate-800/80' 
              : 'border-[#E5E7EB] bg-white text-[#0F766E] hover:bg-slate-50'
          }`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Main Container - Absolute Center Card Layout */}
      <div className="w-full max-w-[480px] mx-auto my-auto py-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`w-full p-6 sm:p-10 rounded-[20px] border transition-shadow duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.25)] ${
            theme === 'dark' ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-[#E5E7EB]'
          }`}
        >
          
          {/* Logo & Headline */}
          <div className="flex flex-col items-center justify-center text-center space-y-4 mb-8">
            <div className={`p-2 rounded-2xl border transition-all duration-200 ${
              theme === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-[#F8FAFC] border-[#E5E7EB]'
            }`}>
              <img
                src="https://edutechnusantaradigital.github.io/assets/images/logo.png"
                alt="Logo EduTech Nusantara Digital"
                className="w-14 h-14 object-contain"
                loading="eager"
              />
            </div>
            <div className="space-y-1.5">
              <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                {isForgotMode ? 'Atur Ulang Sandi' : activeTab === 'login' ? 'Masuk ke CRM' : 'Daftar Mitra Baru'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {isForgotMode 
                  ? 'Masukkan email resmi instansi atau personal Anda' 
                  : activeTab === 'login' 
                    ? 'Kelola sistem operasional EduTech Nusantara Digital' 
                    : 'Pendaftaran portal client sekolah & mitra kerja'}
              </p>
            </div>
          </div>

          {/* Tab Selection (Masuk vs Daftar) */}
          {!isForgotMode && (
            <div className={`p-1 rounded-xl grid grid-cols-2 gap-1 mb-6 transition-all ${
              theme === 'dark' ? 'bg-slate-950/60' : 'bg-[#F8FAFC]'
            }`}>
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setError(null); setSuccess(null); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-gradient-to-r from-[#0F766E] to-[#14B8A6] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Masuk (Sign In)
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('register'); setError(null); setSuccess(null); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-gradient-to-r from-[#0F766E] to-[#14B8A6] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Daftar Client
              </button>
            </div>
          )}

          {/* Feedback Messages with Smooth Animations */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error-box"
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-3.5 mb-5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl flex items-start space-x-2.5 text-left"
                role="alert"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span className="font-semibold leading-relaxed">{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                key="success-box"
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-3.5 mb-5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl flex items-start space-x-2.5 text-left"
                role="status"
              >
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                <span className="font-semibold leading-relaxed">{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FORMS */}
          {isForgotMode ? (
            
            /* RESET PASSWORD MODE */
            <form onSubmit={handleResetSubmit} className="space-y-5 text-left" noValidate>
              <div className="space-y-1.5">
                <label htmlFor="reset-email" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Email Resmi Terdaftar <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 opacity-50 text-slate-400 dark:text-slate-500">
                    <Mail size={16} />
                  </span>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="nama@instansi.sch.id"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl text-xs outline-none transition-all duration-200 border focus:ring-2 focus:ring-[#0F766E]/10 dark:focus:ring-[#0F766E]/25 ${
                      theme === 'dark' 
                        ? 'bg-slate-950/60 border-slate-800 text-white focus:border-[#0F766E]' 
                        : 'bg-white border-[#E5E7EB] text-slate-900 focus:border-[#0F766E]'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#0F766E] to-[#14B8A6] hover:from-[#0D635C] hover:to-[#0F9F8F] active:scale-[0.98] disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2 shadow-md shadow-[#0F766E]/10"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  <span>Kirim Tautan Atur Ulang</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setIsForgotMode(false); setError(null); setSuccess(null); }}
                className="w-full text-center text-xs font-bold text-[#0F766E] dark:text-[#14B8A6] hover:underline transition"
              >
                Kembali ke Halaman Masuk
              </button>
            </form>

          ) : activeTab === 'login' ? (

            /* STANDARD LOGIN MODE */
            <form onSubmit={handleSubmitLogin} className="space-y-5 text-left" noValidate>
              
              {/* Credential Field */}
              <div className="space-y-1.5">
                <label htmlFor="user-credential" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Username / Email / WhatsApp <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 opacity-50 text-slate-400 dark:text-slate-500">
                    <User size={16} />
                  </span>
                  <input
                    id="user-credential"
                    type="text"
                    required
                    autoComplete="username"
                    placeholder="Masukkan Username, Email, atau No. WhatsApp"
                    value={credential}
                    onChange={(e) => setCredential(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-xs outline-none transition-all duration-200 border focus:ring-2 focus:ring-[#0F766E]/10 dark:focus:ring-[#0F766E]/25 ${
                      theme === 'dark' 
                        ? 'bg-slate-950/60 border-slate-800 text-white focus:border-[#0F766E]' 
                        : 'bg-white border-[#E5E7EB] text-slate-900 focus:border-[#0F766E]'
                    }`}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="user-password" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => { setIsForgotMode(true); setError(null); setSuccess(null); }}
                    className="text-xs text-[#0F766E] dark:text-[#14B8A6] font-bold hover:underline"
                  >
                    Lupa Password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 opacity-50 text-slate-400 dark:text-slate-500">
                    <Lock size={16} />
                  </span>
                  <input
                    id="user-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="Masukkan Password Anda"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-11 pr-12 py-3.5 rounded-xl text-xs outline-none transition-all duration-200 border focus:ring-2 focus:ring-[#0F766E]/10 dark:focus:ring-[#0F766E]/25 ${
                      theme === 'dark' 
                        ? 'bg-slate-950/60 border-slate-800 text-white focus:border-[#0F766E]' 
                        : 'bg-white border-[#E5E7EB] text-slate-900 focus:border-[#0F766E]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                    title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me Toggle */}
              <div className="flex items-center justify-between py-0.5">
                <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0F766E] bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-800 focus:ring-[#0F766E]/30 cursor-pointer accent-[#0F766E]"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Ingat Saya</span>
                </label>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full py-3.5 px-4 rounded-xl bg-[#0F766E] hover:bg-[#0D635C] active:scale-[0.98] disabled:opacity-50 text-white text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2 shadow-md shadow-[#0F766E]/15"
              >
                {isSubmitting || loading ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" />
                    <span>Menghubungkan...</span>
                  </>
                ) : (
                  <span>Masuk Ke Aplikasi</span>
                )}
              </button>
            </form>

          ) : (

            /* REGISTER CLIENT MODE */
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
              
              {/* Full Name */}
              <div className="space-y-1">
                <label htmlFor="reg-fullname" className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  id="reg-fullname"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Nama Lengkap Anda"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs outline-none transition border focus:ring-2 focus:ring-[#0F766E]/10 dark:focus:ring-[#0F766E]/20 ${
                    theme === 'dark' ? 'bg-slate-950/60 border-slate-800 text-white focus:border-[#0F766E]' : 'bg-white border-[#E5E7EB] text-slate-900 focus:border-[#0F766E]'
                  }`}
                />
              </div>

              {/* Institution Name */}
              <div className="space-y-1">
                <label htmlFor="reg-company" className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Nama Instansi / Perusahaan <span className="text-rose-500">*</span>
                </label>
                <input
                  id="reg-company"
                  type="text"
                  required
                  placeholder="Contoh: Universitas Nusantara atau SMK Maluku"
                  value={regCompany}
                  onChange={(e) => setRegCompany(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs outline-none transition border focus:ring-2 focus:ring-[#0F766E]/10 dark:focus:ring-[#0F766E]/20 ${
                    theme === 'dark' ? 'bg-slate-950/60 border-slate-800 text-white focus:border-[#0F766E]' : 'bg-white border-[#E5E7EB] text-slate-900 focus:border-[#0F766E]'
                  }`}
                />
              </div>

              {/* Email & Whatsapp Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label htmlFor="reg-email" className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Email Resmi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="mitra@instansi.sch.id"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs outline-none transition border focus:ring-2 focus:ring-[#0F766E]/10 dark:focus:ring-[#0F766E]/20 ${
                      theme === 'dark' ? 'bg-slate-950/60 border-slate-800 text-white focus:border-[#0F766E]' : 'bg-white border-[#E5E7EB] text-slate-900 focus:border-[#0F766E]'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="reg-whatsapp" className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Nomor WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="reg-whatsapp"
                    type="tel"
                    required
                    placeholder="08xxxxxxxxxx"
                    value={regWhatsapp}
                    onChange={(e) => setRegWhatsapp(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs outline-none transition border focus:ring-2 focus:ring-[#0F766E]/10 dark:focus:ring-[#0F766E]/20 ${
                      theme === 'dark' ? 'bg-slate-950/60 border-slate-800 text-white focus:border-[#0F766E]' : 'bg-white border-[#E5E7EB] text-slate-900 focus:border-[#0F766E]'
                    }`}
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1">
                <label htmlFor="reg-username" className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Username Baru <span className="text-rose-500">*</span>
                </label>
                <input
                  id="reg-username"
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="Gunakan kombinasi huruf/angka kecil"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs outline-none transition border focus:ring-2 focus:ring-[#0F766E]/10 dark:focus:ring-[#0F766E]/20 ${
                    theme === 'dark' ? 'bg-slate-950/60 border-slate-800 text-white focus:border-[#0F766E]' : 'bg-white border-[#E5E7EB] text-slate-900 focus:border-[#0F766E]'
                  }`}
                />
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label htmlFor="reg-password" className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Sandi Baru <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="reg-password"
                    type="password"
                    required
                    placeholder="Minimal 6 karakter"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs outline-none transition border focus:ring-2 focus:ring-[#0F766E]/10 dark:focus:ring-[#0F766E]/20 ${
                      theme === 'dark' ? 'bg-slate-950/60 border-slate-800 text-white focus:border-[#0F766E]' : 'bg-white border-[#E5E7EB] text-slate-900 focus:border-[#0F766E]'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="reg-confirm" className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Konfirmasi Sandi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="reg-confirm"
                    type="password"
                    required
                    placeholder="Ulangi Sandi"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs outline-none transition border focus:ring-2 focus:ring-[#0F766E]/10 dark:focus:ring-[#0F766E]/20 ${
                      theme === 'dark' ? 'bg-slate-950/60 border-slate-800 text-white focus:border-[#0F766E]' : 'bg-white border-[#E5E7EB] text-slate-900 focus:border-[#0F766E]'
                    }`}
                  />
                </div>
              </div>

              {/* Marketing & Referral */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 rounded-xl border border-teal-500/15 bg-teal-500/[0.02] dark:bg-teal-500/[0.04]">
                <div className="space-y-1">
                  <label htmlFor="reg-marketing" className="block text-[10px] font-black uppercase tracking-wider text-[#0F766E] dark:text-[#14B8A6]">
                    Konsultan Marketing
                  </label>
                  <select
                    id="reg-marketing"
                    value={regMarketing}
                    onChange={(e) => setRegMarketing(e.target.value)}
                    className={`w-full p-2.5 rounded-xl text-xs font-bold outline-none border focus:ring-1 focus:ring-[#0F766E] ${
                      theme === 'dark' 
                        ? 'bg-slate-950/80 border-slate-800 text-white' 
                        : 'bg-white border-[#E5E7EB] text-slate-800'
                    }`}
                  >
                    <option value="Akim">Akim (Konsultan Aktif)</option>
                    <option value="Rizkihandika">Rizki Handika (General Manager)</option>
                    <option value="Badrul">Badrul Muhayyat (IT Dev)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label htmlFor="reg-referral" className="block text-[10px] font-black uppercase tracking-wider text-[#0F766E] dark:text-[#14B8A6]">
                    Kode Rujukan (Opsional)
                  </label>
                  <input
                    id="reg-referral"
                    type="text"
                    placeholder="Contoh: AKIM99"
                    value={regReferral}
                    onChange={(e) => setRegReferral(e.target.value)}
                    className={`w-full p-2.5 rounded-xl text-xs outline-none border focus:ring-1 focus:ring-[#0F766E] ${
                      theme === 'dark' 
                        ? 'bg-slate-950/80 border-slate-800 text-white' 
                        : 'bg-white border-[#E5E7EB] text-slate-800'
                    }`}
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start space-x-2.5 cursor-pointer select-none py-1">
                <input
                  type="checkbox"
                  checked={regAgree}
                  onChange={(e) => setRegAgree(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0F766E] bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-800 focus:ring-[#0F766E]/30 cursor-pointer mt-0.5 accent-[#0F766E]"
                />
                <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  Saya menyetujui seluruh syarat, ketentuan layanan, serta kebijakan keamanan data CRM EduTech Nusantara Digital.
                </span>
              </label>

              {/* Submit Register Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0F766E] to-[#14B8A6] hover:from-[#0D635C] hover:to-[#0F9F8F] active:scale-[0.98] disabled:opacity-50 text-white text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2 shadow-md shadow-[#0F766E]/15"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  <span>Daftar Sebagai Client</span>
                )}
              </button>
            </form>
          )}

          {/* Google SSO Alternative Option */}
          <div className="relative flex py-5 items-center">
            <div className={`flex-grow border-t ${theme === 'dark' ? 'border-slate-800' : 'border-[#E5E7EB]'}`} />
            <span className="flex-shrink mx-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              ATAU LANJUTKAN DENGAN
            </span>
            <div className={`flex-grow border-t ${theme === 'dark' ? 'border-slate-800' : 'border-[#E5E7EB]'}`} />
          </div>

          <button
            type="button"
            onClick={onGoogleSignIn}
            className={`w-full py-3 rounded-xl border font-bold text-xs transition-all duration-200 flex items-center justify-center space-x-3 cursor-pointer hover:scale-[1.01] active:scale-[0.99] shadow-sm ${
              theme === 'dark' 
                ? 'border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-200' 
                : 'border-[#E5E7EB] bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Masuk Lewat Google</span>
          </button>

        </motion.div>
      </div>

      {/* Modern Centered Footer */}
      <footer className="w-full max-w-md mx-auto text-center space-y-2 z-10 opacity-70">
        <div className="flex flex-col items-center justify-center space-y-1 text-xs">
          <p className="flex items-center justify-center space-x-1">
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">&copy; 2026</span>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">EduTech Nusantara Digital.</span>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">All rights reserved.</span>
          </p>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="text-slate-400 dark:text-slate-600">|</span>
            <a 
              href="https://edutechnusantaradigital.com" 
              target="_blank" 
              rel="noreferrer" 
              className="font-bold text-[#0F766E] dark:text-[#14B8A6] hover:underline"
            >
              Kunjungi Situs Utama
            </a>
            <span className="text-slate-400 dark:text-slate-600">|</span>
            <a 
              href="https://wa.me/6287850934303" 
              target="_blank" 
              rel="noreferrer" 
              className="font-bold text-[#0F766E] dark:text-[#14B8A6] hover:underline"
            >
              Layanan Bantuan
            </a>
            <span className="text-slate-400 dark:text-slate-600">|</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
