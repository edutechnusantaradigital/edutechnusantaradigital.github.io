/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Gift, Percent, Landmark, CheckCircle2, XCircle, AlertCircle, 
  ChevronRight, ArrowRight, Sparkles, Send, Loader2, Coins, ArrowUpRight
} from 'lucide-react';

interface Referral {
  id: string;
  referred_client: string;
  referrer_name: string;
  status: string;
  created_at?: string;
}

interface Commission {
  id: string;
  referral_id: string;
  amount: number;
  status: string;
  created_at?: string;
}

interface Cashout {
  id: string;
  user_id: string;
  user_name: string;
  amount: number;
  payment_method: string;
  account_info: string;
  status: string;
  created_at: string;
}

interface AffiliateViewProps {
  referrals: Referral[];
  commissions: Commission[];
  cashouts: Cashout[];
  currentUser: any;
  onAddCashout: (data: any) => Promise<any>;
  onUpdateCashout: (id: string, data: any) => Promise<any>;
  role: string;
}

export default function AffiliateView({
  referrals,
  commissions,
  cashouts,
  currentUser,
  onAddCashout,
  onUpdateCashout,
  role
}: AffiliateViewProps) {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [method, setMethod] = useState('Bank');

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  // Filter based on logged-in user if they are not Super Admin / IT Developer
  const isPrivileged = role === 'Super Admin' || role === 'IT Developer';
  
  const userReferrals = isPrivileged
    ? referrals
    : referrals.filter(r => r.referrer_name?.toLowerCase() === currentUser?.name?.toLowerCase());

  const userCommissions = isPrivileged
    ? commissions
    : commissions.filter(c => {
        const refObj = referrals.find(r => r.id === c.referral_id);
        return refObj?.referrer_name?.toLowerCase() === currentUser?.name?.toLowerCase();
      });

  const userCashouts = isPrivileged
    ? cashouts
    : cashouts.filter(c => c.user_id === currentUser?.id);

  // Stats computations
  const totalReferralsCount = userReferrals.length;
  const closedWonCount = userReferrals.filter(r => r.status === 'Closed Won').length;
  
  const totalCommissionEarned = userCommissions.reduce((sum, c) => sum + Number(c.amount || 0), 0);
  const paidCommission = userCommissions
    .filter(c => c.status === 'Paid')
    .reduce((sum, c) => sum + Number(c.amount || 0), 0);

  const pendingCashouts = userCashouts
    .filter(c => c.status === 'Pending')
    .reduce((sum, c) => sum + Number(c.amount || 0), 0);

  const approvedCashouts = userCashouts
    .filter(c => c.status === 'Approved')
    .reduce((sum, c) => sum + Number(c.amount || 0), 0);

  const availableBalance = Math.max(0, totalCommissionEarned - paidCommission - pendingCashouts - approvedCashouts);

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount <= 0) {
      alert('Nominal penarikan harus lebih besar dari 0');
      return;
    }
    if (withdrawAmount > availableBalance) {
      alert('Saldo komisi tidak mencukupi');
      return;
    }

    setIsSubmitting(true);
    try {
      const accountInfo = method === 'Bank'
        ? `${currentUser.bank} (No: ${currentUser.account_number}) a.n. ${currentUser.account_name}`
        : `${currentUser.ewallet} (No: ${currentUser.ewallet_number})`;

      await onAddCashout({
        user_id: currentUser.id || 'USR999',
        user_name: currentUser.name || 'Staff User',
        amount: withdrawAmount,
        payment_method: method,
        account_info: accountInfo,
        status: 'Pending'
      });
      setShowWithdrawModal(false);
      setWithdrawAmount(0);
      alert('Permohonan pencairan dana komisi berhasil diajukan dan sedang diproses!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveCashout = async (id: string) => {
    if (confirm('Setujui dan cairkan dana bonus komisi ini ke rekening staff?')) {
      await onUpdateCashout(id, { status: 'Approved' });
    }
  };

  const handleRejectCashout = async (id: string) => {
    if (confirm('Tolak permohonan pencairan bonus komisi ini?')) {
      await onUpdateCashout(id, { status: 'Rejected' });
    }
  };

  return (
    <div className="space-y-6 text-left" id="affiliate-view-root">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 p-6 rounded-2xl shadow-xl text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-indigo-300">Program Kemitraan & Afiliasi</h2>
          <h1 className="text-2xl font-black mt-1">Nusantara Digital Partner Club</h1>
          <p className="text-slate-300 text-xs mt-1 max-w-xl">
            Selamat datang {currentUser?.name}. Anda mendapatkan komisi sebesar 5% - 15% untuk setiap sekolah, kampus, atau pesantren yang berhasil mendaftar rujukan Anda.
          </p>
        </div>
        {availableBalance > 0 && (
          <button
            id="withdraw-btn"
            onClick={() => setShowWithdrawModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-lg shadow-lg shadow-emerald-500/20 transition cursor-pointer"
          >
            <ArrowUpRight size={16} />
            <span>Cairkan Komisi</span>
          </button>
        )}
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Total Rujukan Mitra</p>
          <h3 className="text-2xl font-black text-slate-800 mt-1">{totalReferralsCount}</h3>
          <p className="text-[10px] text-indigo-600 font-semibold mt-1">{closedWonCount} Deal / Selesai</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Akumulasi Komisi</p>
          <h3 className="text-2xl font-black text-slate-800 mt-1">{formatIDR(totalCommissionEarned)}</h3>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1">Lunas terekam</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Sedang Diproses</p>
          <h3 className="text-2xl font-black text-amber-600 mt-1">{formatIDR(pendingCashouts)}</h3>
          <p className="text-[10px] text-slate-400 mt-1">Menunggu persetujuan admin</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-inner bg-indigo-50/20">
          <p className="text-[10px] text-indigo-500 font-extrabold uppercase tracking-widest">Saldo Siap Cair</p>
          <h3 className="text-2xl font-black text-indigo-700 mt-1">{formatIDR(availableBalance)}</h3>
          <p className="text-[10px] text-indigo-600 font-bold mt-1">Kode Anda: <span className="underline">{currentUser?.referral_code || 'BELUM SET'}</span></p>
        </div>
      </div>

      {/* Main logs & withdrawal management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referral Logs List */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Log Rujukan Mitra</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 font-bold text-slate-400 bg-slate-50 uppercase tracking-wider">
                  <th className="p-3 text-[10px]">Nama Instansi</th>
                  <th className="p-3 text-[10px]">Afiliator</th>
                  <th className="p-3 text-[10px] text-right">Status Deal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {userReferrals.map(ref => (
                  <tr key={ref.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-3">
                      <p className="font-bold text-slate-800">{ref.referred_client}</p>
                      <p className="text-[9px] text-slate-400">{ref.id}</p>
                    </td>
                    <td className="p-3 text-slate-500 font-semibold">{ref.referrer_name}</td>
                    <td className="p-3 text-right">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                        ref.status === 'Closed Won' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {ref.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {userReferrals.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-400">Belum ada rujukan mitra terekam.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cashouts List & Approvals */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Log Pencairan Dana Komisi</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 font-bold text-slate-400 bg-slate-50 uppercase tracking-wider">
                  <th className="p-3 text-[10px]">Penerima / Rincian</th>
                  <th className="p-3 text-[10px]">Nominal</th>
                  <th className="p-3 text-[10px] text-right">Persetujuan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {userCashouts.map(cash => (
                  <tr key={cash.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-3">
                      <p className="font-bold text-slate-800">{cash.user_name}</p>
                      <p className="text-[10px] text-slate-400 max-w-[200px] truncate">{cash.account_info}</p>
                    </td>
                    <td className="p-3 font-black text-slate-800">{formatIDR(cash.amount)}</td>
                    <td className="p-3 text-right">
                      {cash.status === 'Pending' ? (
                        role === 'Super Admin' ? (
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => handleApproveCashout(cash.id)}
                              className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded"
                            >
                              Setujui
                            </button>
                            <button
                              onClick={() => handleRejectCashout(cash.id)}
                              className="px-2 py-1 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold rounded"
                            >
                              Tolak
                            </button>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-bold">Pending</span>
                        )
                      ) : (
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                          cash.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {cash.status === 'Approved' ? 'Cair' : 'Ditolak'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {userCashouts.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-400">Belum ada aktivitas pencairan komisi.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-sm w-full overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-sm text-slate-800">Ajukan Pencairan Dana Komisi</h3>
              <button onClick={() => setShowWithdrawModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>
            
            <form onSubmit={handleWithdrawSubmit} className="p-6 space-y-4 text-left">
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl space-y-1">
                <span className="text-[10px] text-indigo-500 font-bold uppercase">Saldo Tersedia</span>
                <p className="text-base font-black text-indigo-800">{formatIDR(availableBalance)}</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Metode Penerimaan *</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                >
                  <option value="Bank">Bank Transfer ({currentUser.bank || 'BCA'})</option>
                  <option value="E-Wallet">E-Wallet ({currentUser.ewallet || 'OVO'})</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nominal Pencarian (IDR) *</label>
                <input
                  type="number"
                  required
                  max={availableBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  placeholder="Contoh: 500000"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                />
              </div>

              <div className="p-3 bg-amber-50 text-amber-800 text-[10px] rounded-xl leading-normal flex items-start gap-1.5 font-medium">
                <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-600" />
                <p>Pencairan bonus akan langsung diproses oleh Super Admin ke nomor rekening / dompet digital terdaftar Anda.</p>
              </div>

              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition flex items-center space-x-1"
                >
                  {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                  <span>Kirim Pengajuan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
