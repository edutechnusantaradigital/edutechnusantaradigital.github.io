import { User, Client, Service, Order, ProjectProgress, Invoice, Payment, Document, CRMSetting, ChatMessage } from '../types/crm';

export const initialUsers: User[] = [
  {
    id: 'u-1',
    name: 'Rizki Handika',
    username: 'rizkihandika',
    password: 'Dikalaela127',
    role: 'SUPER_ADMIN',
    status: 'Aktif',
    email: 'rizki@edutechnusantara.com',
    whatsapp: '081234567890',
    createdAt: '2026-01-10',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    id: 'u-2',
    name: 'Badrul',
    username: 'badrul',
    password: '17April1960*',
    role: 'IT',
    status: 'Aktif',
    email: 'badrul@edutechnusantara.com',
    whatsapp: '082345678901',
    createdAt: '2026-01-15',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    id: 'u-3',
    name: 'Mustakim',
    username: 'mustakim',
    password: '17April1960*',
    role: 'IT',
    status: 'Aktif',
    email: 'mustakim@edutechnusantara.com',
    whatsapp: '083456789012',
    createdAt: '2026-02-01',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    id: 'u-4',
    name: 'Abdul Hakim',
    username: 'abdulhakim',
    password: '17April1960*',
    role: 'MARKETING',
    status: 'Aktif',
    email: 'abdulhakim@edutechnusantara.com',
    whatsapp: '084567890123',
    createdAt: '2026-02-10',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80'
  }
];

export const initialClients: Client[] = [
  {
    id: 'c-2',
    name: 'Prof. Dr. Irwan',
    company: 'Jurnal Ilmiah Teknologi Indonesia',
    email: 'irwan@jurnalilmiah.or.id',
    whatsapp: '081298765432',
    username: 'prof_irwan',
    status: 'Aktif',
    projectCount: 1,
    createdAt: '2026-03-15'
  },
  {
    id: 'c-3',
    name: 'Hendra Wijaya',
    company: 'PT Global Tech Solusi',
    email: 'hendra@globaltech.com',
    whatsapp: '081387654321',
    username: 'hendrawijaya',
    status: 'Aktif',
    projectCount: 1,
    createdAt: '2026-04-01'
  },
  {
    id: 'c-4',
    name: 'Siska Lestari',
    company: 'Yayasan Literasi Bangsa',
    email: 'siska@literasibangsa.org',
    whatsapp: '081976543210',
    username: 'siskalestari',
    status: 'Nonaktif',
    projectCount: 1,
    createdAt: '2026-04-20'
  }
];

export const initialServices: Service[] = [
  {
    id: 's-1',
    name: 'Pembuatan Website OJS (Open Journal System)',
    category: 'OJS',
    price: 15000000,
    estimate: '30 Hari',
    status: 'Aktif',
    description: 'Instalasi, kustomisasi tema, setup jurnal, registrasi DOI, sinta indexing support, dan pelatihan pengelola jurnal.'
  },
  {
    id: 's-2',
    name: 'Paket Landing Page Premium',
    category: 'Landing Page',
    price: 3500000,
    estimate: '7 Hari',
    status: 'Aktif',
    description: 'Desain responsif modern, copywriting persuasif, integrasi WA & email, integrasi analytics, gratis hosting & domain 1 tahun.'
  },
  {
    id: 's-3',
    name: 'Website Company Profile Sekolah / Kampus',
    category: 'Company Profile',
    price: 8500000,
    estimate: '14 Hari',
    status: 'Aktif',
    description: 'Pusat informasi instansi pendidikan, pengumuman, modul PPDB, integrasi galeri dan video, serta SEO dasar.'
  },
  {
    id: 's-4',
    name: 'Pendaftaran HKI (Hak Cipta)',
    category: 'HKI',
    price: 1200000,
    estimate: '5 Hari',
    status: 'Aktif',
    description: 'Penyusunan dokumen, pengajuan ke DJKI, monitoring sertifikat, garansi revisi dokumen.'
  },
  {
    id: 's-5',
    name: 'Pengurusan ISBN Buku',
    category: 'ISBN',
    price: 950000,
    estimate: '7 Hari',
    status: 'Aktif',
    description: 'Pendaftaran ISBN resmi Perpusnas, pembuatan barcode, penyerahan buku wajib simpan (legal deposit).'
  },
  {
    id: 's-6',
    name: 'Hosting & Domain Bisnis High Performance',
    category: 'Hosting',
    price: 1800000,
    estimate: '1 Hari',
    status: 'Aktif',
    description: 'Hosting SSD NVMe 10GB, Gratis Domain .com/.co.id, SSL Let\'s Encrypt, backup harian.'
  },
  {
    id: 's-7',
    name: 'Layanan Optimasi SEO Bulanan',
    category: 'SEO',
    price: 4500000,
    estimate: '30 Hari',
    status: 'Aktif',
    description: 'Riset keyword, on-page optimization, content writing 10 artikel, off-page backlink authority, laporan performa bulanan.'
  },
  {
    id: 's-8',
    name: 'AI Automation workflow & Chatbot Integration',
    category: 'AI Automation',
    price: 12500000,
    estimate: '21 Hari',
    status: 'Aktif',
    description: 'Integrasi WhatsApp API dengan AI (Gemini), otomatisasi data ke Google Spreadsheet, custom dashboard analytics.'
  }
];

export const initialOrders: Order[] = [
  {
    id: 'ord-1',
    orderNumber: 'ORD-2026-001',
    date: '2026-03-05',
    clientId: 'c-1',
    clientName: 'Diana Putri',
    serviceId: 's-3',
    serviceName: 'Website Company Profile Sekolah / Kampus',
    picId: 'u-4',
    picName: 'Budi Santoso',
    deadline: '2026-03-19',
    priority: 'Tinggi',
    status: 'Selesai',
    notes: 'Klien meminta nuansa biru tua dan kuning untuk website Nusantara Learn.'
  },
  {
    id: 'ord-2',
    orderNumber: 'ORD-2026-002',
    date: '2026-03-16',
    clientId: 'c-2',
    clientName: 'Prof. Dr. Irwan',
    serviceId: 's-1',
    serviceName: 'Pembuatan Website OJS (Open Journal System)',
    picId: 'u-4',
    picName: 'Budi Santoso',
    deadline: '2026-04-15',
    priority: 'Sedang',
    status: 'Diproses',
    notes: 'Integrasi dengan Crossref dan Akreditasi SINTA.'
  },
  {
    id: 'ord-3',
    orderNumber: 'ORD-2026-003',
    date: '2026-04-05',
    clientId: 'c-3',
    clientName: 'Hendra Wijaya',
    serviceId: 's-8',
    serviceName: 'AI Automation workflow & Chatbot Integration',
    picId: 'u-4',
    picName: 'Budi Santoso',
    deadline: '2026-04-26',
    priority: 'Tinggi',
    status: 'Revisi',
    notes: 'Klien meminta penyesuaian alur webhook WhatsApp API.'
  },
  {
    id: 'ord-4',
    orderNumber: 'ORD-2026-004',
    date: '2026-04-22',
    clientId: 'c-4',
    clientName: 'Siska Lestari',
    serviceId: 's-5',
    serviceName: 'Pengurusan ISBN Buku',
    picId: 'u-2',
    picName: 'Rian Hidayat',
    deadline: '2026-04-29',
    priority: 'Rendah',
    status: 'Menunggu',
    notes: 'Draft buku "Literasi untuk Indonesia Pintar" sudah diterima.'
  },
  {
    id: 'ord-5',
    orderNumber: 'ORD-2026-005',
    date: '2026-05-10',
    clientId: 'c-1',
    clientName: 'Diana Putri',
    serviceId: 's-4',
    serviceName: 'Pendaftaran HKI (Hak Cipta)',
    picId: 'u-2',
    picName: 'Rian Hidayat',
    deadline: '2026-05-15',
    priority: 'Sedang',
    status: 'Diproses',
    notes: 'Pendaftaran HKI Logo Nusantara Learn.'
  }
];

export const initialProgress: ProjectProgress[] = [
  {
    id: 'ord-1',
    orderNumber: 'ORD-2026-001',
    clientName: 'Diana Putri',
    projectName: 'Website Company Profile Sekolah / Kampus',
    percentage: 100,
    timeline: '5 Mar 2026 - 19 Mar 2026',
    checklists: [
      { id: 'ch-1', title: 'Setup Server & Setup WordPress', isCompleted: true },
      { id: 'ch-2', title: 'Desain Kustom Mockup UI/UX', isCompleted: true },
      { id: 'ch-3', title: 'Penyusunan Konten & Media', isCompleted: true },
      { id: 'ch-4', title: 'Review Klien & Go Live', isCompleted: true }
    ],
    comments: [
      { id: 'co-1', authorName: 'Andi Pratama', authorRole: 'Admin', content: 'Proyek website company profile telah diselesaikan dengan sangat baik. Klien sangat puas.', timestamp: '2026-03-18 15:30' },
      { id: 'co-2', authorName: 'Diana Putri', authorRole: 'Client', content: 'Terima kasih banyak tim EduTech Nusantara! Websitenya sangat responsif dan cantik.', timestamp: '2026-03-19 10:00' }
    ],
    attachments: [
      { id: 'at-1', name: 'Sertifikat_Serah_Terima.pdf', size: '1.2 MB', url: '#' }
    ],
    activities: [
      { id: 'ac-1', user: 'Andi Pratama', action: 'Mengubah status proyek menjadi Selesai', timestamp: '2026-03-18 15:28' },
      { id: 'ac-2', user: 'Budi Santoso', action: 'Mengupload file penyerahan proyek', timestamp: '2026-03-18 14:00' }
    ]
  },
  {
    id: 'ord-2',
    orderNumber: 'ORD-2026-002',
    clientName: 'Prof. Dr. Irwan',
    projectName: 'Pembuatan Website OJS (Open Journal System)',
    percentage: 60,
    timeline: '16 Mar 2026 - 15 Apr 2026',
    checklists: [
      { id: 'ch-5', title: 'Instalasi OJS v3.3 di VPS Klien', isCompleted: true },
      { id: 'ch-6', title: 'Desain & Custom CSS Header Footer', isCompleted: true },
      { id: 'ch-7', title: 'Setup Google Scholar & Crossref Metadata', isCompleted: false },
      { id: 'ch-8', title: 'Pelatihan Editor & Reviewer', isCompleted: false }
    ],
    comments: [
      { id: 'co-3', authorName: 'Budi Santoso', authorRole: 'Developer', content: 'Instalasi OJS di server sudah selesai. CSS custom juga siap di-review.', timestamp: '2026-03-25 11:20' },
      { id: 'co-4', authorName: 'Prof. Dr. Irwan', authorRole: 'Client', content: 'Bagus sekali. Bisakah logo jurnal ditaruh persis di pojok kiri atas dengan background transparan?', timestamp: '2026-03-26 09:15' }
    ],
    attachments: [
      { id: 'at-2', name: 'Panduan_OJS_Nusantara.pdf', size: '2.4 MB', url: '#' }
    ],
    activities: [
      { id: 'ac-3', user: 'Budi Santoso', action: 'Menandai checklist Desain & Custom CSS sebagai Selesai', timestamp: '2026-03-24 16:30' }
    ]
  },
  {
    id: 'ord-3',
    orderNumber: 'ORD-2026-003',
    clientName: 'Hendra Wijaya',
    projectName: 'AI Automation workflow & Chatbot Integration',
    percentage: 80,
    timeline: '5 Apr 2026 - 26 Apr 2026',
    checklists: [
      { id: 'ch-9', title: 'Desain Diagram Alur Webhook WhatsApp', isCompleted: true },
      { id: 'ch-10', title: 'Integrasi LLM (Gemini API)', isCompleted: true },
      { id: 'ch-11', title: 'Sinkronisasi Spreadsheet Otomatis', isCompleted: true },
      { id: 'ch-12', title: 'Uji Coba WhatsApp Gateway', isCompleted: false }
    ],
    comments: [
      { id: 'co-5', authorName: 'Budi Santoso', authorRole: 'Developer', content: 'Sinkronisasi database ke Spreadsheet sudah lancar. Tinggal uji coba performa chatbot.', timestamp: '2026-04-12 14:00' }
    ],
    attachments: [],
    activities: [
      { id: 'ac-4', user: 'Budi Santoso', action: 'Mengubah progress proyek menjadi 80%', timestamp: '2026-04-12 13:58' }
    ]
  },
  {
    id: 'ord-5',
    orderNumber: 'ORD-2026-005',
    clientName: 'Diana Putri',
    projectName: 'Pendaftaran HKI (Hak Cipta)',
    percentage: 20,
    timeline: '10 Mei 2026 - 15 Mei 2026',
    checklists: [
      { id: 'ch-13', title: 'Penyusunan Formulir & Surat Pernyataan', isCompleted: true },
      { id: 'ch-14', title: 'Pembayaran PNBP HKI', isCompleted: false },
      { id: 'ch-15', title: 'Pengajuan via Sistem DJKI', isCompleted: false },
      { id: 'ch-16', title: 'Penerbitan Sertifikat HKI', isCompleted: false }
    ],
    comments: [],
    attachments: [],
    activities: [
      { id: 'ac-5', user: 'Rian Hidayat', action: 'Membuat timeline pendaftaran HKI', timestamp: '2026-05-11 09:30' }
    ]
  }
];

export const initialInvoices: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-001',
    orderId: 'ord-1',
    date: '2026-03-05',
    clientId: 'c-1',
    clientName: 'Diana Putri',
    clientCompany: 'Nusantara Learn',
    clientAddress: 'Jl. Merdeka No. 45, Bandung, Jawa Barat',
    serviceName: 'Website Company Profile Sekolah / Kampus',
    subtotal: 8500000,
    tax: 935000, // 11%
    total: 9435000,
    status: 'Lunas'
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-002',
    orderId: 'ord-2',
    date: '2026-03-16',
    clientId: 'c-2',
    clientName: 'Prof. Dr. Irwan',
    clientCompany: 'Jurnal Ilmiah Teknologi Indonesia',
    clientAddress: 'Kampus UI Depok, Gd. Dekanat Lt. 2, Depok, Jawa Barat',
    serviceName: 'Pembuatan Website OJS (Open Journal System)',
    subtotal: 15000000,
    tax: 1650000,
    total: 16650000,
    status: 'DP'
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2026-003',
    orderId: 'ord-3',
    date: '2026-04-05',
    clientId: 'c-3',
    clientName: 'Hendra Wijaya',
    clientCompany: 'PT Global Tech Solusi',
    clientAddress: 'Sudirman Central Business District (SCBD) Lot 18, Jakarta Selatan',
    serviceName: 'AI Automation workflow & Chatbot Integration',
    subtotal: 12500000,
    tax: 1375000,
    total: 13875000,
    status: 'Belum Dibayar'
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-2026-004',
    orderId: 'ord-4',
    date: '2026-04-22',
    clientId: 'c-4',
    clientName: 'Siska Lestari',
    clientCompany: 'Yayasan Literasi Bangsa',
    clientAddress: 'Jl. Pemuda No. 12, Yogyakarta, DIY',
    serviceName: 'Pengurusan ISBN Buku',
    subtotal: 950000,
    tax: 104500,
    total: 1054500,
    status: 'Belum Dibayar'
  }
];

export const initialPayments: Payment[] = [
  {
    id: 'pay-1',
    paymentNumber: 'PAY-2026-001',
    invoiceNumber: 'INV-2026-001',
    clientName: 'Diana Putri',
    amount: 9435000,
    paymentDate: '2026-03-05',
    method: 'Transfer Bank Mandiri',
    receiptUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=400&h=300&q=80',
    status: 'Disetujui'
  },
  {
    id: 'pay-2',
    paymentNumber: 'PAY-2026-002',
    invoiceNumber: 'INV-2026-002',
    clientName: 'Prof. Dr. Irwan',
    amount: 8325000, // 50% DP
    paymentDate: '2026-03-17',
    method: 'Transfer Bank BCA',
    receiptUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=400&h=300&q=80',
    status: 'Disetujui'
  },
  {
    id: 'pay-3',
    paymentNumber: 'PAY-2026-003',
    invoiceNumber: 'INV-2026-003',
    clientName: 'Hendra Wijaya',
    amount: 13875000,
    paymentDate: '2026-04-06',
    method: 'Transfer Bank BNI',
    receiptUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=400&h=300&q=80',
    status: 'Verifikasi'
  }
];

export const initialDocuments: Document[] = [
  {
    id: 'doc-1',
    name: 'Sertifikat_Serah_Terima_NusantaraLearn.pdf',
    category: 'Kontrak',
    size: '1.2 MB',
    uploadedAt: '2026-03-19',
    url: '#'
  },
  {
    id: 'doc-2',
    name: 'Kontrak_Kerjasama_OJS_Irwan.pdf',
    category: 'Kontrak',
    size: '3.4 MB',
    uploadedAt: '2026-03-16',
    url: '#'
  },
  {
    id: 'doc-3',
    name: 'Invoice_INV-2026-001_Lunas.pdf',
    category: 'Invoice',
    size: '480 KB',
    uploadedAt: '2026-03-05',
    url: '#'
  },
  {
    id: 'doc-4',
    name: 'Sertifikat_DJKI_Merek_Nusantara.pdf',
    category: 'HKI',
    size: '1.8 MB',
    uploadedAt: '2026-05-11',
    url: '#'
  }
];

export const initialSettings: CRMSetting = {
  id: 'set-1',
  companyName: 'EduTech Nusantara Digital',
  logoUrl: 'https://edutechnusantaradigital.com/logo.png',
  address: 'Jl. Ganesha No. 15, Siliwangi, Coblong, Kota Bandung, Jawa Barat 40132',
  email: 'info@edutechnusantaradigital.com',
  whatsapp: '+6281234567890',
  website: 'https://edutechnusantaradigital.com',
  instagram: 'https://instagram.com/edutech_nusantara',
  facebook: 'https://facebook.com/edutechnusantaradigital',
  linkedin: 'https://linkedin.com/company/edutech-nusantara-digital',
  youtube: 'https://youtube.com/c/EduTechNusantara',
  themeColor: '#2563EB',
  darkMode: false
};

export const initialChats: ChatMessage[] = [
  {
    id: 'ch-m1',
    senderId: 'u-4',
    senderName: 'Budi Santoso',
    senderRole: 'Developer',
    content: 'Halo Ibu Diana, website company profile Nusantara Learn sudah selesai disetup dan dionline-kan. Silakan dicek di domain belajar.nusantaralearn.com.',
    timestamp: '2026-03-18 13:45',
    isRead: true
  },
  {
    id: 'ch-m2',
    senderId: 'u-5',
    senderName: 'Diana Putri',
    senderRole: 'Client',
    content: 'Wah cepat sekali mas Budi! Saya cek dulu ya untuk bagian galeri sekolah dan form pendaftaran siswanya.',
    timestamp: '2026-03-18 14:05',
    isRead: true
  },
  {
    id: 'ch-m3',
    senderId: 'u-5',
    senderName: 'Diana Putri',
    senderRole: 'Client',
    content: 'Semuanya sudah sangat bagus dan lancar jaya mas. Tidak ada revisi lagi. Terima kasih banyak ya atas bantuannya!',
    timestamp: '2026-03-19 09:55',
    isRead: true
  },
  {
    id: 'ch-m4',
    senderId: 'u-4',
    senderName: 'Budi Santoso',
    senderRole: 'Developer',
    content: 'Sama-sama Ibu Diana. Senang bisa membantu menyukseskan platform Nusantara Learn. Sertifikat serah terima pekerjaan sudah saya upload ya.',
    timestamp: '2026-03-19 10:05',
    isRead: true
  }
];
