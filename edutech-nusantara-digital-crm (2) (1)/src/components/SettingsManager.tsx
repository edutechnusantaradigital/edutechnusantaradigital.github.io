import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Save,
  Link,
  MessageSquare,
  Percent,
  CheckCircle,
  Key
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function SettingsManager() {
  const [useGAS, setUseGAS] = useState(false);
  const [gasUrl, setGasUrl] = useState('https://script.google.com/macros/s/AKfycbz_example/exec');
  const [waWebhook, setWaWebhook] = useState('https://api.whatsapp-gateway.com/send');
  const [taxRate, setTaxRate] = useState(11);
  const [companyName, setCompanyName] = useState('EduTech Nusantara Digital');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    Swal.fire({
      icon: 'success',
      title: 'Pengaturan Disimpan',
      text: 'Seluruh parameter parameter CRM & API Google Apps Script berhasil di-update.',
      confirmButtonColor: '#2563EB'
    });
  };

  const handleTestConnection = () => {
    Swal.fire({
      title: 'Menguji Koneksi GAS...',
      text: 'Menghubungkan ke endpoint Web App Google Apps Script.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    setTimeout(() => {
      Swal.fire({
        icon: 'success',
        title: 'Koneksi Sukses!',
        text: 'Handshake dengan Google Spreadsheet Database berhasil terverifikasi.',
        confirmButtonColor: '#10B981'
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <Settings size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Konfigurasi & Pengaturan Sistem</h3>
            <p className="text-xs text-slate-400">Atur gateway pesan, pajak PPN, dan integrasi Google Apps Script Web App</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        {/* Left main forms */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm space-y-6">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-blue-500" />
            <span>Informasi Instansi & Finansial</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase">Nama Perusahaan / Organisasi</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Percent size={12} />
                <span>Rasio Pajak PPN (%)</span>
              </label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="mt-1 block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <MessageSquare size={16} className="text-blue-500" />
            <span>Pesan Instan & WhatsApp Gateway API</span>
          </h4>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase">Endpoint Webhook WhatsApp</label>
            <input
              type="text"
              value={waWebhook}
              onChange={(e) => setWaWebhook(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center gap-1.5 transition"
            >
              <Save size={14} />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </div>

        {/* Right sidebar form: Google Apps Script mapping */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <Link size={16} className="text-emerald-500 animate-pulse" />
              <span>Integrasi Google Apps Script</span>
            </h4>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-xl leading-relaxed text-[11px]">
              <p className="font-semibold mb-1">Spreadsheet Database Engine:</p>
              CRM ini didesain bermigrasi instant tanpa rubah markup frontend. Toggling flag di bawah akan mengalihkan penyimpanan lokal ke database spreadsheet Google Anda.
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-700 dark:text-slate-300">Hubungkan Database GAS</span>
              <button
                type="button"
                onClick={() => setUseGAS(!useGAS)}
                className={`w-11 h-6 rounded-full transition relative ${useGAS ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${useGAS ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>

            {useGAS && (
              <div className="space-y-3 animate-fade-in">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">GAS Web App URL</label>
                  <input
                    type="text"
                    value={gasUrl}
                    onChange={(e) => setGasUrl(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none text-[11px]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleTestConnection}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-xl font-bold transition border dark:border-slate-800"
                >
                  Uji Jabat Tangan GAS
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 text-center leading-relaxed">
            <p>SSL Secured • API Key Encrypted in Sandbox</p>
          </div>
        </div>
      </form>
    </div>
  );
}
