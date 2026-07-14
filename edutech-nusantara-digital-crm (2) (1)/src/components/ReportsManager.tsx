import React from 'react';
import {
  TrendingUp,
  Award,
  Users,
  Target,
  FileSpreadsheet,
  Download,
  AlertCircle
} from 'lucide-react';
import { formatRupiah } from '../utils';
import Swal from 'sweetalert2';

export default function ReportsManager() {
  const stats = [
    { label: 'Konversi Leads', value: '42.8%', desc: 'Rasio deal marketing team', icon: <TrendingUp className="text-emerald-500" /> },
    { label: 'Project Sukses', value: '98%', desc: 'Rasio kepuasan klien', icon: <Award className="text-amber-500" /> },
    { label: 'Klien Aktif', value: '24 Instansi', desc: 'Siklus retensi berlangganan', icon: <Users className="text-blue-500" /> },
    { label: 'Target Pendapatan', value: '89.4%', desc: 'Pencapaian Q3 target', icon: <Target className="text-rose-500" /> }
  ];

  const handleExportExcel = () => {
    Swal.fire({
      icon: 'success',
      title: 'Laporan Keuangan Diekspor',
      text: 'Format spreadsheet Excel (.xlsx) berhasil di-generate dan tersimpan.',
      timer: 1500,
      showConfirmButton: false
    });
  };

  return (
    <div className="space-y-6">
      {/* Control Header */}
      <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <TrendingUp size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Analisis Performa Bisnis & Omset</h3>
            <p className="text-xs text-slate-400">Rangkuman grafik konversi marketing, total pengerjaan project, dan status tagihan</p>
          </div>
        </div>

        <button
          onClick={handleExportExcel}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition shadow-md"
        >
          <FileSpreadsheet size={14} />
          <span>Unduh Laporan Excel</span>
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</span>
              <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                {s.icon}
              </div>
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">{s.value}</h4>
              <p className="text-[10px] text-slate-400 mt-1">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two-Column Chart Layout using Custom High-Contrast SVG Vectors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sales Omset performance chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Pertumbuhan Omset Kuartalan (Juta Rp)</h4>
            <p className="text-xs text-slate-400">Pendapatan kotor akumulasi pengerjaan digital</p>
          </div>

          <div className="h-64 flex items-end justify-between pt-4 pb-2 border-b border-slate-100 dark:border-slate-800 relative">
            {/* Background grids */}
            <div className="absolute inset-x-0 top-10 border-t border-dashed border-slate-100 dark:border-slate-800 text-[9px] text-slate-400 pt-0.5">75M</div>
            <div className="absolute inset-x-0 top-28 border-t border-dashed border-slate-100 dark:border-slate-800 text-[9px] text-slate-400 pt-0.5">50M</div>
            <div className="absolute inset-x-0 top-44 border-t border-dashed border-slate-100 dark:border-slate-800 text-[9px] text-slate-400 pt-0.5">25M</div>

            <div className="flex flex-col items-center w-12 z-10">
              <div className="bg-gradient-to-t from-blue-600 to-sky-400 w-6 rounded-t-lg h-24"></div>
              <span className="text-[10px] font-semibold text-slate-500 mt-2">Jan</span>
            </div>
            <div className="flex flex-col items-center w-12 z-10">
              <div className="bg-gradient-to-t from-blue-600 to-sky-400 w-6 rounded-t-lg h-36"></div>
              <span className="text-[10px] font-semibold text-slate-500 mt-2">Feb</span>
            </div>
            <div className="flex flex-col items-center w-12 z-10">
              <div className="bg-gradient-to-t from-blue-600 to-sky-400 w-6 rounded-t-lg h-44"></div>
              <span className="text-[10px] font-semibold text-slate-500 mt-2">Mar</span>
            </div>
            <div className="flex flex-col items-center w-12 z-10">
              <div className="bg-gradient-to-t from-blue-600 to-sky-400 w-6 rounded-t-lg h-52"></div>
              <span className="text-[10px] font-semibold text-slate-500 mt-2">Apr</span>
            </div>
            <div className="flex flex-col items-center w-12 z-10">
              <div className="bg-gradient-to-t from-blue-600 to-sky-400 w-6 rounded-t-lg h-48"></div>
              <span className="text-[10px] font-semibold text-slate-500 mt-2">Mei</span>
            </div>
          </div>
        </div>

        {/* Project categories division */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Pembagian Kategori Pengerjaan Jasa</h4>
            <p className="text-xs text-slate-400">Distribusi project yang paling banyak dipesan klien</p>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="text-slate-600 dark:text-slate-300">Website & Landing Page</span>
                <span className="text-slate-800 dark:text-white">45%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full w-[45%] rounded-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="text-slate-600 dark:text-slate-300">OJS Jurnal & ISBN</span>
                <span className="text-slate-800 dark:text-white">30%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[30%] rounded-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="text-slate-600 dark:text-slate-300">Hosting & Domain Bisnis</span>
                <span className="text-slate-800 dark:text-white">15%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[15%] rounded-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="text-slate-600 dark:text-slate-300">AI Automation & Digital Marketing</span>
                <span className="text-slate-800 dark:text-white">10%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full w-[10%] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
