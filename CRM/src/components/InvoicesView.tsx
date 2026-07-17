/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Plus,
  FileText,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Table,
  UploadCloud,
  Printer,
  FileDown,
  ShieldAlert,
  Smartphone
} from 'lucide-react';
import { Invoice, Client, Order, Payment } from '../types';

interface InvoicesProps {
  invoices: Invoice[];
  clients: Client[];
  orders: Order[];
  payments: Payment[];
  role: 'Super Admin' | 'IT Developer' | 'Marketing' | 'Customer Service' | 'Client';
  onAddInvoice: (invData: any) => Promise<any>;
  onUpdateInvoice: (id: string, updatedData: any) => Promise<any>;
  onAddPayment: (payData: any) => Promise<any>;
  onUpdatePayment: (id: string, updatedData: any) => Promise<any>;
}

export default function InvoicesView({
  invoices,
  clients,
  orders,
  payments,
  role,
  onAddInvoice,
  onUpdateInvoice,
  onAddPayment,
  onUpdatePayment
}: InvoicesProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(invoices[0] || null);

  // Modal Create states
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    order_id: '',
    client_id: '',
    subtotal: 0,
    discount: 0,
    tax: 0,
    due_date: '',
    status: 'Unpaid'
  });

  // Client payment proof upload states
  const [showUploadPaymentModal, setShowUploadPaymentModal] = useState(false);
  const [payForm, setPayForm] = useState({
    amount: 0,
    bank_id: 'BNK00001',
    notes: '',
    proof_url: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=600&q=80' // default placeholder proof image
  });

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const getClientName = (clientId: string) => {
    const c = clients.find(cl => cl.id === clientId);
    return c ? c.name : 'Unknown Client';
  };

  const handleAddInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const taxValue = Number(invoiceForm.tax || 0);
    const discountValue = Number(invoiceForm.discount || 0);
    const subtotalValue = Number(invoiceForm.subtotal || 0);
    const grandTotalValue = subtotalValue + taxValue - discountValue;

    try {
      const saved = await onAddInvoice({
        ...invoiceForm,
        grand_total: grandTotalValue
      });
      setShowAddInvoiceModal(false);
      setInvoiceForm({
        order_id: '',
        client_id: '',
        subtotal: 0,
        discount: 0,
        tax: 0,
        due_date: '',
        status: 'Unpaid'
      });
      if (saved) setSelectedInvoice(saved);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setIsSubmitting(true);
    try {
      await onAddPayment({
        invoice_id: selectedInvoice.id,
        amount: payForm.amount,
        bank_id: payForm.bank_id,
        proof_url: payForm.proof_url,
        notes: payForm.notes,
        status: 'Pending'
      });
      // Mark invoice status as Partial
      await onUpdateInvoice(selectedInvoice.id, { ...selectedInvoice, status: 'Partial' });
      setSelectedInvoice({ ...selectedInvoice, status: 'Partial' });
      setShowUploadPaymentModal(false);
      alert('Bukti transfer berhasil diunggah! Admin kami akan memverifikasi secepatnya.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyPayment = async (payment: Payment, action: 'Approved' | 'Rejected') => {
    const confirmed = window.confirm(`Apakah Anda yakin ingin memverifikasi bukti transfer pembayaran ini sebagai [${action}]?`);
    if (!confirmed) return;

    try {
      await onUpdatePayment(payment.id, { ...payment, status: action, verified_by: role });
      if (action === 'Approved' && selectedInvoice) {
        // Mark Invoice as fully paid
        await onUpdateInvoice(selectedInvoice.id, { ...selectedInvoice, status: 'Paid' });
        setSelectedInvoice({ ...selectedInvoice, status: 'Paid' });
      }
      alert(`Bukti transfer berhasil diverifikasi: [${action}]`);
    } catch (err) {
      console.error(err);
    }
  };

  const selectedInvoicePayments = payments.filter(p => p.invoice_id === selectedInvoice?.id);

  return (
    <div className="space-y-6" id="invoices-view-container">
      {/* 1. Header and Quick Stats */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="text-left">
          <h2 className="text-sm font-bold text-slate-800">Invoicing, Pembayaran & QRIS Portal</h2>
          <p className="text-xs text-slate-400">Generate, tagih, verifikasi invoice dan bukti transfer secara realtime</p>
        </div>
        {['Super Admin', 'Marketing', 'Customer Service'].includes(role) && (
          <button
            id="create-invoice-modal-btn"
            onClick={() => setShowAddInvoiceModal(true)}
            className="flex items-center space-x-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition"
          >
            <Plus size={16} />
            <span>Buat Invoice Baru</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. Invoice Registry Grid / Left panel */}
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-3 text-left">Daftar Invoice</h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {invoices.map(invoice => (
                <div
                  key={invoice.id}
                  onClick={() => setSelectedInvoice(invoice)}
                  className={`p-3 rounded-xl border cursor-pointer transition text-left ${
                    selectedInvoice?.id === invoice.id
                      ? 'border-indigo-600 bg-indigo-50/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-400">{invoice.id}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                      invoice.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' :
                      invoice.status === 'Partial' ? 'bg-indigo-50 text-indigo-700' :
                      invoice.status === 'Unpaid' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-xs text-slate-800 mt-2 truncate">
                    {getClientName(invoice.client_id)}
                  </h4>
                  <div className="mt-3 flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-700">{formatIDR(invoice.grand_total)}</span>
                    <span className="text-slate-400 font-medium">Jatuh Tempo: {invoice.due_date}</span>
                  </div>
                </div>
              ))}

              {invoices.length === 0 && (
                <p className="text-center text-slate-400 py-12 text-xs">Belum ada invoice diterbitkan.</p>
              )}
            </div>
          </div>
        </div>

        {/* 3. Invoice Printable Template Detail Panel & QRIS Layout */}
        <div className="lg:col-span-2 space-y-6">
          {selectedInvoice ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Main PDF Template Layout (Col span 2) */}
              <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-left text-xs text-slate-700 space-y-6" id="invoice-bill-pdf">
                {/* PDF Header logo details */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-5">
                  <div className="space-y-1">
                    <img
                      src="https://edutechnusantaradigital.github.io/assets/images/logo.png"
                      alt="EduTech Logo"
                      className="w-10 h-10 rounded shadow-sm"
                    />
                    <h3 className="font-black text-sm text-slate-800 uppercase">EduTech Nusantara</h3>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Jl. Nusantara Raya No. 45<br />Malang, Jawa Timur<br />WhatsApp: 087850934303
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide">Invoice</h2>
                    <p className="font-bold text-indigo-600">{selectedInvoice.id}</p>
                    <p className="text-[10px] text-slate-400">Dibuat: {selectedInvoice.created_at?.substring(0, 10) || '-'}</p>
                    <p className="text-[10px] text-slate-400">Jatuh Tempo: {selectedInvoice.due_date}</p>
                  </div>
                </div>

                {/* Relational details Client PIC */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ditagihkan Kepada:</p>
                    <p className="font-extrabold text-slate-800 mt-1">{getClientName(selectedInvoice.client_id)}</p>
                    <p className="text-slate-500 mt-0.5">PIC Instansi terdaftar di CRM</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Metode Pembayaran:</p>
                    <p className="font-bold text-slate-800 mt-1">Bank Mandiri Transfer</p>
                    <p className="text-slate-500 mt-0.5">A/C: 1440029341103<br />A/N: EduTech Nusantara Digital</p>
                  </div>
                </div>

                {/* Line calculation table */}
                <div className="border-y border-slate-100 py-3 my-4">
                  <div className="grid grid-cols-3 font-bold text-slate-400 pb-2 border-b border-slate-50 text-[10px]">
                    <span>Keterangan Layanan</span>
                    <span className="text-center">Order ID</span>
                    <span className="text-right">Harga (IDR)</span>
                  </div>
                  <div className="grid grid-cols-3 py-3 font-semibold text-slate-800">
                    <span>Layanan Pengembangan Sistem IT Enterprise</span>
                    <span className="text-center text-slate-400">{selectedInvoice.order_id || '-'}</span>
                    <span className="text-right">{formatIDR(selectedInvoice.subtotal)}</span>
                  </div>
                </div>

                {/* Subtotal grand totals */}
                <div className="flex flex-col items-end space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between w-48 border-b border-slate-50 pb-1">
                    <span>Subtotal:</span>
                    <span className="font-bold">{formatIDR(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between w-48 border-b border-slate-50 pb-1 text-red-500">
                    <span>Diskon Potongan:</span>
                    <span className="font-bold">-{formatIDR(selectedInvoice.discount || 0)}</span>
                  </div>
                  <div className="flex justify-between w-48 border-b border-slate-100 pb-2">
                    <span>PPN (0%):</span>
                    <span className="font-bold">+{formatIDR(selectedInvoice.tax || 0)}</span>
                  </div>
                  <div className="flex justify-between w-48 text-indigo-700 font-black text-sm pt-1">
                    <span>Grand Total:</span>
                    <span>{formatIDR(selectedInvoice.grand_total)}</span>
                  </div>
                </div>

                {/* Terms and print action */}
                <div className="flex justify-between items-center border-t border-slate-100 pt-5 text-[10px] text-slate-400">
                  <p>Terima kasih atas kepercayaan Anda bermitra dengan EduTech Nusantara Digital.</p>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 text-white rounded font-bold hover:bg-slate-900 transition"
                  >
                    <Printer size={12} />
                    <span>Print PDF</span>
                  </button>
                </div>
              </div>

              {/* QRIS / Verification panel (Col 1) */}
              <div className="space-y-6">
                {/* QRIS widget card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
                  <div className="flex items-center space-x-1 mb-3">
                    <Smartphone size={14} className="text-indigo-600" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Scan QRIS Instant</span>
                  </div>
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=00020101021126570022ID.CO.EDUTECHNUSANTARA.WWW"
                    alt="Mock QRIS QR Code"
                    className="w-36 h-36 p-1 border border-slate-100 rounded-lg shadow-sm"
                  />
                  <p className="text-[10px] text-slate-400 text-center mt-3 font-semibold leading-tight">
                    Mendukung GoPay, OVO, ShopeePay, LinkAja & BCA Mobile
                  </p>

                  {/* Client action upload button */}
                  {role === 'Client' && selectedInvoice.status !== 'Paid' && (
                    <button
                      id="client-upload-payment-btn"
                      onClick={() => setShowUploadPaymentModal(true)}
                      className="w-full mt-4 flex items-center justify-center space-x-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                    >
                      <UploadCloud size={14} />
                      <span>Upload Bukti Transfer</span>
                    </button>
                  )}
                </div>

                {/* Verification list (Admins / Staff view) */}
                {selectedInvoicePayments.length > 0 && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                    <h4 className="font-extrabold text-xs text-slate-800 text-left uppercase tracking-wider">Log Bukti Transfer</h4>
                    <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                      {selectedInvoicePayments.map(payment => (
                        <div key={payment.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-left space-y-1.5">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-indigo-600">{payment.id}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              payment.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                              payment.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {payment.status}
                            </span>
                          </div>
                          <p className="font-bold text-[11px] text-slate-800">{formatIDR(payment.amount)}</p>
                          <p className="text-[9px] text-slate-400">Catatan: {payment.notes || '-'}</p>
                          
                          {/* Proof image thumb with links */}
                          {payment.proof_url && (
                            <a
                              href={payment.proof_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-[10px] text-indigo-600 hover:underline font-semibold"
                            >
                              Lihat Lampiran Bukti Transfer ↗
                            </a>
                          )}

                          {/* Approval tools for admins */}
                          {payment.status === 'Pending' && ['Super Admin', 'Marketing', 'Customer Service'].includes(role) && (
                            <div className="flex space-x-1.5 pt-2">
                              <button
                                id={`approve-payment-btn-${payment.id}`}
                                onClick={() => handleVerifyPayment(payment, 'Approved')}
                                className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] rounded transition"
                              >
                                Terima
                              </button>
                              <button
                                id={`reject-payment-btn-${payment.id}`}
                                onClick={() => handleVerifyPayment(payment, 'Rejected')}
                                className="flex-1 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[9px] rounded transition"
                              >
                                Tolak
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-100 shadow-sm text-center text-slate-400 text-xs">
              Pilih invoice untuk melihat rincian penagihan atau melampirkan bukti transfer.
            </div>
          )}
        </div>
      </div>

      {/* --- CREATE NEW INVOICE MODAL --- */}
      {showAddInvoiceModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-sm text-slate-800 text-left">Buat Invoice Baru</h3>
              <button onClick={() => setShowAddInvoiceModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>
            <form onSubmit={handleAddInvoiceSubmit} className="p-6 space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Pilih Client *</label>
                <select
                  required
                  value={invoiceForm.client_id}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, client_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                >
                  <option value="">-- Pilih Client --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Subtotal Layanan (IDR) *</label>
                  <input
                    type="number"
                    required
                    value={invoiceForm.subtotal}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, subtotal: Number(e.target.value) })}
                    placeholder="Harga Pokok"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Potongan Diskon (IDR)</label>
                  <input
                    type="number"
                    value={invoiceForm.discount}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, discount: Number(e.target.value) })}
                    placeholder="Diskon"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">PPN Tambahan (IDR)</label>
                  <input
                    type="number"
                    value={invoiceForm.tax}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, tax: Number(e.target.value) })}
                    placeholder="PPN"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Jatuh Tempo Pembayaran *</label>
                  <input
                    type="date"
                    required
                    value={invoiceForm.due_date}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddInvoiceModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1"
                >
                  {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                  <span>Daftarkan Invoice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CLIENT UPLOAD PAYMENT PROOF MODAL --- */}
      {showUploadPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-sm w-full overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-sm text-slate-800 text-left">Upload Bukti Pembayaran</h3>
              <button onClick={() => setShowUploadPaymentModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>
            <form onSubmit={handleUploadPaymentSubmit} className="p-6 space-y-4 text-left">
              <p className="text-[10px] font-semibold text-slate-400">Mengonfirmasi untuk invoice: <span className="font-bold text-indigo-600">{selectedInvoice.id}</span></p>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nominal yang Ditransfer (IDR) *</label>
                <input
                  type="number"
                  required
                  value={payForm.amount}
                  onChange={(e) => setPayForm({ ...payForm, amount: Number(e.target.value) })}
                  placeholder="Masukkan jumlah transfer"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Pilih Bank Rekening Pengirim *</label>
                <select
                  value={payForm.bank_id}
                  onChange={(e) => setPayForm({ ...payForm, bank_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                >
                  <option value="BNK00001">Bank Mandiri (1440029341103)</option>
                  <option value="QRIS">QRIS Instant Merchant</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  value={payForm.notes}
                  onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })}
                  placeholder="Contoh: Pembayaran DP 50%"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                />
              </div>
              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadPaymentModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1"
                >
                  {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                  <span>Kirim Bukti Pembayaran</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
