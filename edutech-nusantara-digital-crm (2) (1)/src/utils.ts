/**
 * Helper utilities for EduTech Nusantara Digital CRM
 */

// Format currency to Rupiah
export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Formats dates to standard Indonesian format
export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// Export to CSV helper
export const exportToCSV = (filename: string, headers: string[], rows: any[][]) => {
  const csvContent = "data:text/csv;charset=utf-8," 
    + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Import CSV parser helper (mimicking PapaParse briefly for ease of setup)
export const parseCSV = (text: string): string[][] => {
  const lines = text.split('\n');
  return lines.map(line => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  });
};

// Status badge helper colors
export const getStatusColor = (status: string): { bg: string; text: string; dot: string } => {
  const s = status.toLowerCase();
  if (s === 'selesai' || s === 'lunas' || s === 'aktif' || s === 'disetujui') {
    return { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-400 border border-emerald-200/30', dot: 'bg-emerald-500' };
  }
  if (s === 'diproses' || s === 'dp' || s === 'verifikasi') {
    return { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-400 border border-blue-200/30', dot: 'bg-blue-500' };
  }
  if (s === 'revisi' || s === 'sedang') {
    return { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-400 border border-amber-200/30', dot: 'bg-amber-500' };
  }
  if (s === 'tinggi') {
    return { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-700 dark:text-rose-400 border border-rose-200/30', dot: 'bg-rose-500' };
  }
  if (s === 'rendah') {
    return { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400 border border-slate-200/30', dot: 'bg-slate-400' };
  }
  if (s === 'dibatalkan' || s === 'nonaktif' || s === 'ditolak' || s === 'belum dibayar') {
    return { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-700 dark:text-rose-400 border border-rose-200/30', dot: 'bg-rose-500' };
  }
  return { bg: 'bg-slate-50 dark:bg-slate-900', text: 'text-slate-700 dark:text-slate-300 border border-slate-200/30', dot: 'bg-slate-500' };
};
