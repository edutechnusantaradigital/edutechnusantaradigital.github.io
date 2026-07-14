import React, { useState, useEffect } from 'react';
import {
  FileText,
  CreditCard,
  MessageSquare,
  Send,
  Upload,
  CheckSquare,
  Calendar,
  AlertTriangle,
  User,
  ShieldCheck,
  FileDown,
  Clock,
  Sparkles
} from 'lucide-react';
import { ProjectProgress, Invoice, Payment, ChatMessage, User as UserType } from '../types/crm';
import { CRM_API } from '../services/api';
import { formatRupiah, getStatusColor, formatDate } from '../utils';
import Swal from 'sweetalert2';

interface ClientDashboardProps {
  clientUser: UserType;
  onNavigateToTab: (tab: string) => void;
}

export default function ClientDashboard({ clientUser, onNavigateToTab }: ClientDashboardProps) {
  // Database states
  const [activeProjects, setActiveProjects] = useState<ProjectProgress[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectProgress | null>(null);
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Payment upload modal state
  const [showPayModal, setShowPayModal] = useState(false);
  const [targetInvoice, setTargetInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState('Transfer Bank Mandiri');
  const [receiptUrl, setReceiptUrl] = useState('');

  // Comment input
  const [commentInput, setCommentInput] = useState('');

  // Load client data
  const loadClientData = async () => {
    setIsLoading(true);
    try {
      const allProgress = await CRM_API.getProgress();
      const clientProgress = allProgress.filter(p => p.clientName === clientUser.name);
      setActiveProjects(clientProgress);
      if (clientProgress.length > 0) {
        setSelectedProject(clientProgress[0]);
      }

      const allInvoices = await CRM_API.getInvoices();
      const clientInvoices = allInvoices.filter(i => i.clientName === clientUser.name);
      setInvoices(clientInvoices);

      const allPayments = await CRM_API.getPayments();
      const clientPayments = allPayments.filter(p => p.clientName === clientUser.name);
      setPayments(clientPayments);

      const allChats = await CRM_API.getChats();
      setChats(allChats);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClientData();
  }, [clientUser]);

  // Submit comment on progress tracker
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !selectedProject) return;

    const newComment = {
      id: `co-${Date.now()}`,
      authorName: clientUser.name,
      authorRole: 'Client',
      content: commentInput,
      timestamp: new Date().toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })
    };

    const updatedProject = {
      ...selectedProject,
      comments: [...selectedProject.comments, newComment],
      activities: [
        {
          id: `ac-${Date.now()}`,
          user: clientUser.name,
          action: 'Menulis komentar di papan diskusi',
          timestamp: new Date().toLocaleString()
        },
        ...selectedProject.activities
      ]
    };

    await CRM_API.saveProgress(updatedProject);
    setCommentInput('');
    loadClientData();
    Swal.fire({
      icon: 'success',
      title: 'Komentar Terkirim',
      text: 'Komentar Anda berhasil ditambahkan di timeline diskusi project.',
      timer: 1500,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  };

  // Submit chat message
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg: ChatMessage = {
      id: `ch-m-${Date.now()}`,
      senderId: clientUser.id,
      senderName: clientUser.name,
      senderRole: 'Client',
      content: chatInput,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };

    await CRM_API.sendChatMessage(newMsg);
    setChatInput('');
    loadClientData();

    // Trigger dummy auto-reply from developer for rich experience
    setTimeout(async () => {
      const replyMsg: ChatMessage = {
        id: `ch-m-${Date.now() + 1}`,
        senderId: 'u-4',
        senderName: 'Budi Santoso',
        senderRole: 'Developer',
        content: `Halo ${clientUser.name}, pesan Anda telah kami terima. Tim developer EduTech akan segera merespon di jam kerja (08:00 - 17:00). Terima kasih!`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        isRead: false
      };
      await CRM_API.sendChatMessage(replyMsg);
      loadClientData();
    }, 1500);
  };

  // Open pay modal
  const handleOpenPayModal = (invoice: Invoice) => {
    setTargetInvoice(invoice);
    setPayAmount(invoice.total);
    setReceiptUrl('https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=400&h=300&q=80'); // preset mock upload preview
    setShowPayModal(true);
  };

  // Submit Payment confirmation
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetInvoice) return;

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      paymentNumber: '', // will be set by API
      invoiceNumber: targetInvoice.invoiceNumber,
      clientName: clientUser.name,
      amount: payAmount,
      paymentDate: new Date().toISOString().split('T')[0],
      method: payMethod,
      receiptUrl: receiptUrl,
      status: 'Verifikasi'
    };

    await CRM_API.submitPayment(newPayment);
    setShowPayModal(false);
    loadClientData();

    Swal.fire({
      icon: 'success',
      title: 'Bukti Pembayaran Diunggah!',
      text: 'Staf keuangan kami akan segera memverifikasi transaksi Anda dalam waktu maksimal 1x24 jam kerja.',
      confirmButtonColor: '#2563EB'
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Memuat Workspace Client Anda...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Board */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-sky-600 p-6 md:p-8 rounded-2xl text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 pointer-events-none">
          <svg width="240" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="20" width="160" height="160" rx="30" stroke="white" strokeWidth="8" />
            <circle cx="100" cy="100" r="40" stroke="white" strokeWidth="4" />
          </svg>
        </div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-full text-xs font-semibold">
            <Sparkles size={13} className="text-amber-300 animate-pulse" />
            <span>WORKSPACE KLIEN AKTIF</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold">Halo, {clientUser.name}!</h2>
          <p className="text-xs md:text-sm text-blue-100 font-light max-w-xl">
            Selamat datang di pusat kontrol layanan Anda pada instansi <strong className="font-semibold text-white">{clientUser.company || 'EduTech Nusantara'}</strong>. Pantau timeline pengerjaan, beri feedback diskusi, dan tuntaskan tagihan administrasi Anda secara transparan di sini.
          </p>
        </div>
      </div>

      {activeProjects.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm text-center">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
            <CheckSquare size={32} />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">Belum Ada Proyek Aktif</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Anda belum memiliki project yang sedang diproses oleh developer kami. Jika Anda baru melakukan pemesanan, tim marketing kami akan segera membuatkan detail project setelah pembayaran diverifikasi.
          </p>
        </div>
      ) : (
        /* Grid Layout: Progress Project & Timelines vs Billing & Support */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Active project tracking card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm space-y-5">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Linimasa Pekerjaan Proyek</h3>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mt-0.5">
                    {selectedProject?.orderNumber} - {selectedProject?.projectName}
                  </span>
                </div>
                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-lg border border-emerald-200/30">
                  {selectedProject?.percentage}% Selesai
                </span>
              </div>

              {/* Progress bar visual container */}
              <div className="space-y-2">
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3.5 overflow-hidden">
                  <div
                    style={{ width: `${selectedProject?.percentage}%` }}
                    className="bg-gradient-to-r from-blue-600 to-sky-400 h-full rounded-full transition-all duration-700"
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} strokeWidth={2.5} />
                    {selectedProject?.timeline}
                  </span>
                  <span>Target Estimasi</span>
                </div>
              </div>

              {/* Project checklists / task indicators */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Milestone & Checklist Pekerjaan</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedProject?.checklists.map((chk) => (
                    <div
                      key={chk.id}
                      className={`p-3 rounded-xl border flex items-center gap-3 transition ${
                        chk.isCompleted
                          ? 'border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-950/10'
                          : 'border-slate-100 dark:border-slate-700/40 bg-slate-50/20 dark:bg-slate-800/20'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                        chk.isCompleted
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {chk.isCompleted && <ShieldCheck size={14} strokeWidth={3} />}
                      </div>
                      <span className={`text-xs font-semibold leading-snug ${
                        chk.isCompleted ? 'text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {chk.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comment discussion board */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700/80 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Diskusi Proyek / Log Feedback</h4>
                
                {/* Comments Stream */}
                <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
                  {selectedProject?.comments.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Belum ada diskusi tertulis. Ketik feedback Anda di bawah ini.</p>
                  ) : (
                    selectedProject?.comments.map((comm) => (
                      <div key={comm.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/50">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800 dark:text-white">{comm.authorName}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold uppercase ${
                              comm.authorRole === 'Client' ? 'bg-sky-100 text-sky-800' : 'bg-blue-100 text-blue-800'
                            }`}>{comm.authorRole}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{comm.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">{comm.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Comment input form */}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    className="flex-1 px-4 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white"
                    placeholder="Tulis feedback atau pertanyaan tentang project..."
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
                  >
                    <Send size={12} />
                    <span>Kirim</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Documents section */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Pusat Dokumen Proyek</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="text-blue-500 flex-shrink-0" size={18} />
                    <div className="leading-tight overflow-hidden">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block truncate">Kontrak_Kerjasama_EduTech.pdf</span>
                      <span className="text-[9px] text-slate-400 font-mono">1.2 MB • Kontrak Pekerjaan</span>
                    </div>
                  </div>
                  <button onClick={() => Swal.fire('Downloaded', 'Dokumen disimulasikan didownload!', 'success')} className="p-1.5 text-slate-400 hover:text-blue-600 transition">
                    <FileDown size={16} />
                  </button>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="text-emerald-500 flex-shrink-0" size={18} />
                    <div className="leading-tight overflow-hidden">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block truncate">Panduan_Pengecekan_Legalitas.pdf</span>
                      <span className="text-[9px] text-slate-400 font-mono">850 KB • Dokumen Panduan</span>
                    </div>
                  </div>
                  <button onClick={() => Swal.fire('Downloaded', 'Dokumen disimulasikan didownload!', 'success')} className="p-1.5 text-slate-400 hover:text-emerald-600 transition">
                    <FileDown size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar right section: Billing & Instant Chat support */}
          <div className="space-y-6">
            
            {/* Invoice & Payment confirmation */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <CreditCard className="text-blue-600" size={18} />
                <span>Invoice & Tagihan Administrasi</span>
              </h3>

              <div className="space-y-3.5">
                {invoices.map((inv) => {
                  const badge = getStatusColor(inv.status);
                  return (
                    <div key={inv.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/50 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-800 dark:text-white">{inv.invoiceNumber}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${badge.bg} ${badge.text}`}>
                          {inv.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-end text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Total Tagihan</span>
                          <span className="font-bold text-slate-800 dark:text-white mt-0.5 block">{formatRupiah(inv.total)}</span>
                        </div>
                        {inv.status !== 'Lunas' && (
                          <button
                            onClick={() => handleOpenPayModal(inv)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition"
                          >
                            Konfirmasi Pembayaran
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chat Consultation Mock box */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm flex flex-col h-96 justify-between space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <MessageSquare className="text-blue-600" size={18} />
                  <span>Konsultasi Proyek & Support</span>
                </h3>
                <span className="text-[10px] text-slate-400">Hubungi PIC Developer secara real-time</span>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                {chats.map((chat) => {
                  const isMe = chat.senderId === clientUser.id;
                  return (
                    <div key={chat.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-[9px] text-slate-400 mb-0.5">
                        {chat.senderName} ({chat.senderRole})
                      </span>
                      <div className={`p-2.5 rounded-2xl max-w-[85%] leading-normal ${
                        isMe
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'
                      }`}>
                        <p>{chat.content}</p>
                        <span className={`text-[8px] mt-1 block text-right ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                          {chat.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat input form */}
              <form onSubmit={handleSendChat} className="flex gap-1.5">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-xl focus:outline-none"
                  placeholder="Ketik pesan konsultasi..."
                />
                <button type="submit" className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                  <Send size={14} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payment Confirmation Modal Form */}
      {showPayModal && targetInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200/50 dark:border-slate-700/50 space-y-5 animate-fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Konfirmasi Pembayaran</h3>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Tutup</button>
            </div>

            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Nomor Invoice</label>
                <input
                  type="text"
                  readOnly
                  value={targetInvoice.invoiceNumber}
                  className="mt-1 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 text-xs font-mono font-bold rounded-xl border border-slate-100 dark:border-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Nominal Transfer (Rupiah)</label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="mt-1 block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-xs rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Metode Transfer Bank</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-xs rounded-xl focus:outline-none"
                >
                  <option value="Transfer Bank Mandiri">Transfer Bank Mandiri (131-00-241512-3)</option>
                  <option value="Transfer Bank BCA">Transfer Bank BCA (283-049811-4)</option>
                  <option value="Transfer Bank BNI">Transfer Bank BNI (082-948123-5)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Bukti Transfer (Upload Slip)</label>
                <div className="border border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-3 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition flex flex-col items-center">
                  <Upload size={20} className="text-slate-400 mb-1" />
                  <span className="text-[10px] font-medium text-slate-500">Preset slip transfer terdeteksi</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition"
              >
                Kirim Pembayaran untuk Verifikasi
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
