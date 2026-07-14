import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  X,
  ExternalLink,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import { Payment } from '../types/crm';
import { CRM_API } from '../services/api';
import { formatRupiah, getStatusColor, formatDate } from '../utils';
import Swal from 'sweetalert2';

export default function PaymentsManager() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [isLoading, setIsLoading] = useState(false);

  // Selected payment for previewing uploaded receipt slip
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showSlipModal, setShowSlipModal] = useState(false);

  const loadPayments = async () => {
    setIsLoading(true);
    const data = await CRM_API.getPayments();
    setPayments(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
                          p.clientName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'Semua' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenSlip = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowSlipModal(true);
  };

  const handleVerify = async (paymentId: string, status: 'Disetujui' | 'Ditolak') => {
    Swal.fire({
      title: status === 'Disetujui' ? 'Setujui Pembayaran?' : 'Tolak Transaksi?',
      text: status === 'Disetujui' 
        ? 'Anda memverifikasi bahwa dana telah masuk ke rekening koran instansi. Invoice terkait akan otomatis diperbarui.'
        : 'Silakan tolak jika bukti transfer palsu atau nominal tidak sesuai.',
      icon: status === 'Disetujui' ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: status === 'Disetujui' ? '#22C55E' : '#EF4444',
      cancelButtonColor: '#64748B',
      confirmButtonText: status === 'Disetujui' ? 'Ya, Valid & Setujui!' : 'Ya, Tolak Transaksi'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await CRM_API.verifyPayment(paymentId, status);
        setShowSlipModal(false);
        loadPayments();
        Swal.fire({
          icon: 'success',
          title: status === 'Disetujui' ? 'Transaksi Disetujui' : 'Pembayaran Ditolak',
          text: status === 'Disetujui' ? 'Faktur tagihan klien terupdate menjadi Lunas/DP.' : 'Status penolakan terkirim ke panel klien.',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Control Header */}
      <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <CreditCard size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Pemberitahuan & Verifikasi Transaksi Masuk</h3>
            <p className="text-xs text-slate-400">Tinjau mutasi rekening, lampiran bukti transfer, setujui pelunasan otomatis</p>
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
            placeholder="Cari berdasarkan No. Invoice, nama klien..."
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 whitespace-nowrap font-medium">Status Verifikasi:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none text-slate-800 dark:text-white"
          >
            <option value="Semua">Semua Verifikasi</option>
            <option value="Verifikasi">Verifikasi (Pending)</option>
            <option value="Disetujui">Disetujui (Approved)</option>
            <option value="Ditolak">Ditolak (Rejected)</option>
          </select>
        </div>
      </div>

      {/* Table Database payment submissions */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-20 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-400">Menghubungkan kas negara...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-20 text-center">
            <p className="text-xs text-slate-400 italic">Belum ada unggahan pembayaran dari klien.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">No. Transaksi / Tgl</th>
                  <th className="p-4">Terkait Invoice</th>
                  <th className="p-4">Nama Pengirim (Client)</th>
                  <th className="p-4">Jumlah Transfer</th>
                  <th className="p-4">Metode Bank</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredPayments.map((pay) => {
                  const badge = getStatusColor(pay.status);
                  return (
                    <tr key={pay.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-700/10 transition">
                      <td className="p-4 whitespace-nowrap">
                        <span className="font-bold text-slate-800 dark:text-white block font-mono">{pay.paymentNumber || 'MOCK-PAY'}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{formatDate(pay.paymentDate)}</span>
                      </td>
                      <td className="p-4 font-mono font-bold text-blue-600">
                        {pay.invoiceNumber}
                      </td>
                      <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                        {pay.clientName}
                      </td>
                      <td className="p-4 whitespace-nowrap font-bold text-slate-800 dark:text-white">
                        {formatRupiah(pay.amount)}
                      </td>
                      <td className="p-4 text-slate-500">
                        {pay.method}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badge.bg} ${badge.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                          {pay.status}
                        </span>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenSlip(pay)}
                          className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-lg text-[10px] transition"
                        >
                          Tinjau Bukti
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

      {/* Slip Verification Modal */}
      {showSlipModal && selectedPayment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200/50 dark:border-slate-700/50 space-y-5 animate-fade-in text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase">Verifikasi Bukti Unggahan</h3>
              <button onClick={() => setShowSlipModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Nama Pengirim:</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white block mt-0.5">{selectedPayment.clientName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Terkait Faktur:</span>
                <span className="text-sm font-mono font-bold text-blue-600 block mt-0.5">{selectedPayment.invoiceNumber}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Nominal Transfer:</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-white block mt-0.5">{formatRupiah(selectedPayment.amount)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Metode Transfer:</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mt-0.5">{selectedPayment.method}</span>
              </div>
            </div>

            {/* Slip Attachment Slip Image container */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Gambar Bukti Transfer (Resi):</span>
              <div className="border rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 flex justify-center items-center p-2 border-slate-100 dark:border-slate-800">
                <img
                  src={selectedPayment.receiptUrl || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=400&h=300&q=80'}
                  alt="Bukti Transfer"
                  className="max-h-56 object-contain rounded-lg border shadow-sm"
                />
              </div>
            </div>

            {/* Verification Button Controls (Only show if still in verification) */}
            {selectedPayment.status === 'Verifikasi' ? (
              <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                  onClick={() => handleVerify(selectedPayment.id, 'Ditolak')}
                  className="w-full py-2.5 px-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-center transition flex justify-center items-center gap-1.5"
                >
                  <XCircle size={15} />
                  <span>Tolak Bukti</span>
                </button>
                <button
                  onClick={() => handleVerify(selectedPayment.id, 'Disetujui')}
                  className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-center transition flex justify-center items-center gap-1.5 animate-pulse"
                >
                  <CheckCircle size={15} />
                  <span>Setujui Pelunasan</span>
                </button>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center gap-2 text-slate-500">
                <AlertCircle size={16} />
                <span>Transaksi ini telah selesai diverifikasi sebelumnya dengan status: <strong>{selectedPayment.status}</strong></span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
