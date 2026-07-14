export type UserRole = 'SUPER_ADMIN' | 'IT' | 'MARKETING' | 'CLIENT';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  whatsapp: string;
  role: UserRole;
  status: 'Aktif' | 'Nonaktif';
  company?: string;
  avatarUrl?: string;
  password?: string;
  loginTime?: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  whatsapp: string;
  username: string;
  status: 'Aktif' | 'Nonaktif';
  projectCount: number;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  category: 'Website' | 'Landing Page' | 'Company Profile' | 'OJS' | 'Jurnal' | 'ISBN' | 'HKI' | 'Hosting' | 'Domain' | 'Email Bisnis' | 'SEO' | 'Digital Marketing' | 'AI Automation' | 'Maintenance' | 'Google Workspace' | 'Pelatihan';
  price: number;
  estimate: string; // e.g. "7 Hari", "14 Hari"
  status: 'Aktif' | 'Nonaktif';
  description: string;
}

export interface Order {
  id: string; // e.g. "ORD-001"
  orderNumber: string;
  date: string;
  clientId: string;
  clientName: string;
  serviceId: string;
  serviceName: string;
  picId: string;
  picName: string;
  deadline: string;
  priority: 'Rendah' | 'Sedang' | 'Tinggi';
  status: 'Menunggu' | 'Diproses' | 'Revisi' | 'Selesai' | 'Dibatalkan';
  notes: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Comment {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  timestamp: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  url: string;
}

export interface ProjectProgress {
  id: string; // matches orderId or projectId
  orderNumber: string;
  clientName: string;
  projectName: string;
  percentage: number;
  timeline: string;
  checklists: ChecklistItem[];
  comments: Comment[];
  attachments: Attachment[];
  activities: {
    id: string;
    user: string;
    action: string;
    timestamp: string;
  }[];
}

export interface Invoice {
  id: string; // e.g. "INV-2026-001"
  invoiceNumber: string;
  orderId: string;
  date: string;
  clientId: string;
  clientName: string;
  clientCompany: string;
  clientAddress?: string;
  serviceName: string;
  subtotal: number;
  tax: number; // PPN 11% or other
  total: number;
  status: 'Belum Dibayar' | 'DP' | 'Lunas';
  paymentQr?: string;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  paymentDate: string;
  method: string;
  receiptUrl?: string; // proof image URL or base64
  status: 'Verifikasi' | 'Disetujui' | 'Ditolak';
}

export interface Document {
  id: string;
  name: string;
  category: 'Website' | 'Hosting' | 'Domain' | 'OJS' | 'HKI' | 'ISBN' | 'Kontrak' | 'Invoice';
  size: string;
  uploadedAt: string;
  url: string;
}

export interface ReportData {
  revenueByMonth: { month: string; amount: number }[];
  ordersByCategory: { category: string; value: number }[];
  clientGrowth: { month: string; count: number }[];
  projectSuccessRate: { name: string; value: number }[];
}

export interface CRMSetting {
  id: string;
  companyName: string;
  logoUrl: string;
  address: string;
  email: string;
  whatsapp: string;
  website: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  youtube: string;
  themeColor: string; // HEX code
  darkMode: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}
