import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Search,
  Plus,
  X,
  Printer,
  Download,
  Mail,
  Send,
  QrCode,
  QrCode as QrIcon
} from 'lucide-react';
import { Invoice } from '../types/crm';
import { CRM_API } from '../services/api';
import { formatRupiah, getStatusColor, formatDate } from '../utils';
import Swal from 'sweetalert2';

export default function InvoicesManager() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [isLoading, setIsLoading] = useState(false);

  // Focus invoice for viewing/printing
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const loadInvoices = async () => {
    setIsLoading(true);
    const data = await CRM_API.getInvoices();
    setInvoices(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const filteredInvoices = invoices.filter(i => {
    const matchesSearch = i.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
                          i.clientName.toLowerCase().includes(search.toLowerCase()) ||
                          i.serviceName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'Semua' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenInvoice = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setShowInvoiceModal(true);
  };

  // Simulated actions with high-fidelity Swal alerts
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    Swal.fire({
      icon: 'success',
      title: 'PDF Berhasil Dibuat',
      text: 'File invoice digital telah berhasil dieksport dan didownload ke perangkat Anda.',
      timer: 1800,
      showConfirmButton: false,
      confirmButtonColor: '#2563EB'
    });
  };

  const handleSendWhatsApp = (inv: Invoice) => {
    Swal.fire({
      icon: 'success',
      title: 'WhatsApp Terkirim',
      text: `Notifikasi link invoice ${inv.invoiceNumber} telah dikirimkan secara otomatis via WhatsApp API ke nomor ${inv.clientName}.`,
      confirmButtonColor: '#2563EB'
    });
  };

  const handleSendEmail = (inv: Invoice) => {
    Swal.fire({
      icon: 'success',
      title: 'Email Terkirim',
      text: `Faktur tagihan PDF telah dilampirkan dan terkirim ke alamat email resmi klien.`,
      confirmButtonColor: '#2563EB'
    });
  };

  return (
    <div className="space-y-6">
      {/* Control Panel Header */}
      <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <FileCheck size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Faktur Penjualan & Billing Tagihan</h3>
            <p className="text-xs text-slate-400">Kelola termin pembayaran, detail PPN 11%, cetak bukti tanda terima fisik klien</p>
          </div>
        </div>
      </div>

      {/* Filter and search */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative col-span-2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none text-slate-800 dark:text-white"
            placeholder="Cari berdasarkan No. Invoice, nama klien, atau layanan..."
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 whitespace-nowrap font-medium">Status Pembayaran:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none text-slate-800 dark:text-white"
          >
            <option value="Semua">Semua Status</option>
            <option value="Belum Dibayar">Belum Dibayar</option>
            <option value="DP">DP (Termin)</option>
            <option value="Lunas">Lunas</option>
          </select>
        </div>
      </div>

      {/* Invoice list grid table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-20 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-400">Sinkronisasi catatan akunting...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-20 text-center">
            <p className="text-xs text-slate-400 italic">Belum ada faktur tagihan yang diterbitkan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">No. Invoice / Tanggal</th>
                  <th className="p-4">Klien & Lembaga</th>
                  <th className="p-4">Deskripsi Layanan</th>
                  <th className="p-4">Subtotal (DP / termin)</th>
                  <th className="p-4">Total + PPN (11%)</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredInvoices.map((inv) => {
                  const badge = getStatusColor(inv.status);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-700/10 transition">
                      <td className="p-4 whitespace-nowrap">
                        <span className="font-bold text-slate-800 dark:text-white block font-mono">{inv.invoiceNumber}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{formatDate(inv.date)}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-800 dark:text-white block">{inv.clientName}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{inv.clientCompany}</span>
                      </td>
                      <td className="p-4 font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                        {inv.serviceName}
                      </td>
                      <td className="p-4 whitespace-nowrap font-medium text-slate-600 dark:text-slate-400">
                        {formatRupiah(inv.subtotal)}
                      </td>
                      <td className="p-4 whitespace-nowrap font-bold text-slate-800 dark:text-white">
                        {formatRupiah(inv.total)}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badge.bg} ${badge.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenInvoice(inv)}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold rounded-lg text-[10px] transition"
                        >
                          Tinjau Faktur
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Elegant Invoice layout detail modal */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-6 md:p-8 shadow-2xl border border-slate-200/50 dark:border-slate-800 space-y-6 animate-fade-in relative">
            
            {/* Header controls */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800 print:hidden">
              <span className="text-xs font-bold text-slate-400 font-mono">TAMPILAN FAKTUR RESMI</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowQrModal(true)}
                  className="p-1.5 rounded-lg border text-slate-400 hover:text-blue-600 hover:border-blue-100 transition"
                  title="Tampilkan QRIS"
                >
                  <QrIcon size={14} />
                </button>
                <button
                  onClick={handlePrint}
                  className="p-1.5 rounded-lg border text-slate-400 hover:text-slate-600 hover:border-slate-200 transition"
                  title="Cetak Kertas"
                >
                  <Printer size={14} />
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="p-1.5 rounded-lg border text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition"
                  title="Ekspor PDF"
                >
                  <Download size={14} />
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="p-1.5 rounded-lg border text-slate-400 hover:text-rose-600 hover:border-rose-200 transition text-xs font-semibold"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Printable Area */}
            <div className="space-y-6 text-slate-700 dark:text-slate-300">
              {/* Brand logo & invoice number */}
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">EduTech Nusantara Digital</h2>
                  <p className="text-[10px] text-slate-400 leading-normal max-w-sm">
                    Jl. Ganesha No. 15, Siliwangi, Coblong, Kota Bandung, Jawa Barat 40132
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block font-mono">FAKTUR PENJUALAN</span>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white font-mono">{selectedInvoice.invoiceNumber}</h3>
                  <span className="text-[10px] text-slate-400 block">Tanggal: {formatDate(selectedInvoice.date)}</span>
                </div>
              </div>

              {/* Client addresses and details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">DITERBITKAN UNTUK:</span>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">{selectedInvoice.clientName}</h4>
                  <p className="text-[11px] text-slate-500 font-semibold">{selectedInvoice.clientCompany}</p>
                  <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs">
                    {selectedInvoice.clientAddress || 'Jl. Raya Pendidikan Nusantara, Bandung, Jawa Barat'}
                  </p>
                </div>

                <div className="sm:text-right space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">STATUS TERMIN:</span>
                  <span className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px] rounded-lg">
                    {selectedInvoice.status.toUpperCase()}
                  </span>
                  <div className="pt-2 text-[10px] text-slate-400 leading-normal">
                    <p>Pembayaran via Transfer Mandiri:</p>
                    <p className="font-mono font-bold text-slate-800 dark:text-white mt-0.5">131-00-241512-3</p>
                  </div>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden mt-6">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 font-bold text-slate-500">
                      <th className="p-3">DESKRIPSI JASA DIGITAL</th>
                      <th className="p-3 text-center">KUANTITAS</th>
                      <th className="p-3 text-right">HARGA SATUAN</th>
                      <th className="p-3 text-right">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-3 font-semibold text-slate-800 dark:text-white">
                        {selectedInvoice.serviceName}
                      </td>
                      <td className="p-3 text-center">1 Paket</td>
                      <td className="p-3 text-right">{formatRupiah(selectedInvoice.subtotal)}</td>
                      <td className="p-3 text-right font-bold text-slate-800 dark:text-white">{formatRupiah(selectedInvoice.subtotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Sums totals calculations */}
              <div className="flex justify-end pt-4">
                <div className="w-64 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="font-semibold">{formatRupiah(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">PPN (11%)</span>
                    <span className="font-semibold">{formatRupiah(selectedInvoice.tax)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2 font-bold text-slate-800 dark:text-white">
                    <span>Total Tagihan</span>
                    <span className="text-sm">{formatRupiah(selectedInvoice.total)}</span>
                  </div>
                </div>
              </div>

              {/* Footer disclaimers */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 leading-relaxed text-center">
                <p>EduTech Nusantara Digital — Faktur resmi yang diterbitkan secara elektronik dan diakui secara sah.</p>
                <p className="mt-1">Untuk klaim atau asistensi keuangan hubungi WhatsApp Finance: +62 812-3456-7890</p>
              </div>
            </div>

            {/* Simulated Action Row at bottom */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800 print:hidden flex-wrap gap-2">
              <span className="text-[10px] text-slate-400">Fungsi Gateway WhatsApp Aktif</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSendWhatsApp(selectedInvoice)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Send size={12} />
                  <span>Kirim WhatsApp</span>
                </button>
                <button
                  onClick={() => handleSendEmail(selectedInvoice)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Mail size={12} />
                  <span>Kirim Email</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code / QRIS payment modal */}
      {showQrModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200/50 dark:border-slate-700/50 text-center space-y-4 animate-fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase">QRIS Dinamis Pembayaran</h3>
              <button onClick={() => setShowQrModal(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Tutup</button>
            </div>

            <div className="bg-white p-4 rounded-xl inline-block border mx-auto">
              {/* Modern representation of payment QR Code */}
              <div className="w-48 h-48 bg-slate-100 flex flex-col items-center justify-center relative">
                <QrCode size={120} className="text-slate-800" />
                <span className="text-[8px] font-mono font-bold tracking-widest text-blue-600 mt-2">GPN • QRIS INTERNASIONAL</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 block font-mono">{selectedInvoice.invoiceNumber}</span>
              <span className="text-base font-bold text-slate-800 dark:text-white block">{formatRupiah(selectedInvoice.total)}</span>
              <p className="text-[10px] text-slate-400 leading-normal max-w-xs mx-auto">
                Silakan scan QRIS di atas menggunakan aplikasi M-Banking atau E-Wallet pilihan Anda untuk penyelesaian administrasi instant.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
