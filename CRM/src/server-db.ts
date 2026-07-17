/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'crypto';

// Headers for each table in the Google Sheets database
export const SHEET_HEADERS: Record<string, string[]> = {
  SETTING: ['key', 'value', 'description'],
  USER: ['id', 'name', 'username', 'email', 'whatsapp', 'address', 'avatar', 'role', 'status', 'bank', 'account_number', 'account_name', 'ewallet', 'ewallet_number', 'join_date', 'last_login', 'referral_code', 'commission_rate', 'password', 'created_at'],
  ROLE: ['name', 'description', 'permissions'],
  CLIENT: ['id', 'name', 'email', 'whatsapp', 'address', 'npwp', 'nik', 'pic', 'website', 'status', 'created_at', 'avatar'],
  LEADS: ['id', 'name', 'email', 'whatsapp', 'source', 'status', 'notes', 'assigned_to', 'created_at'],
  ORDER: ['id', 'client_id', 'service_category', 'service_package', 'amount', 'notes', 'status', 'assigned_marketing', 'referral_code', 'created_at', 'completed_at'],
  PROJECT: ['id', 'order_id', 'name', 'description', 'status', 'progress', 'start_date', 'end_date', 'assigned_to', 'created_at'],
  PROJECT_TASK: ['id', 'project_id', 'name', 'status', 'priority', 'due_date', 'assigned_to'],
  PROJECT_TIMELINE: ['id', 'project_id', 'title', 'description', 'date'],
  SERVICE: ['id', 'category', 'sub_category', 'package_name', 'price', 'discount', 'status', 'icon', 'color', 'banner', 'thumbnail', 'description', 'features', 'estimation'],
  CATEGORY: ['id', 'name'],
  PACKAGE: ['id', 'name', 'price', 'features'],
  INVOICE: ['id', 'order_id', 'client_id', 'subtotal', 'tax', 'discount', 'grand_total', 'status', 'due_date', 'created_at'],
  PAYMENT: ['id', 'invoice_id', 'amount', 'bank_id', 'proof_url', 'status', 'created_at', 'verified_by', 'notes'],
  BANK: ['id', 'bank_name', 'account_number', 'account_name'],
  TICKET: ['id', 'client_id', 'title', 'category', 'priority', 'status', 'description', 'created_at', 'updated_at'],
  CHAT: ['id', 'ticket_id', 'sender_id', 'sender_name', 'sender_role', 'message', 'timestamp'],
  DOCUMENT: ['id', 'client_id', 'name', 'type', 'drive_url', 'created_at'],
  FINANCE: ['id', 'type', 'category', 'description', 'amount', 'date', 'notes', 'created_at'],
  EXPENSE: ['id', 'amount', 'category', 'description', 'date'],
  REFERRAL: ['id', 'user_id', 'code', 'clicks', 'leads_converted', 'created_at'],
  COMMISSION: ['id', 'referral_id', 'order_id', 'project_id', 'amount', 'status', 'notes', 'created_at'],
  CASHOUT: ['id', 'user_id', 'payment_method', 'account_details', 'amount', 'status', 'transfer_proof', 'notes', 'created_at'],
  DASHBOARD_WIDGET: ['id', 'title', 'role', 'visible', 'color', 'icon', 'order_index'],
  ACTIVITY_LOG: ['id', 'user_name', 'action', 'details', 'timestamp'],
  LOGIN_LOG: ['id', 'user_id', 'ip', 'user_agent', 'timestamp'],
  EMAIL_LOG: ['id', 'to', 'subject', 'status', 'timestamp'],
  WHATSAPP_LOG: ['id', 'to', 'message', 'status', 'timestamp'],
  HOSTING: ['id', 'client_id', 'provider', 'package', 'price', 'expiry_date', 'status'],
  DOMAIN: ['id', 'client_id', 'domain_name', 'registrar', 'expiry_date', 'status'],
  SERVER: ['id', 'client_id', 'ip_address', 'provider', 'expiry_date', 'status'],
  NOTIFICATION: ['id', 'title', 'message', 'is_read', 'timestamp'],
  FAQ: ['id', 'question', 'answer', 'category']
};

const DB_FILENAME = 'CRM_EduTech_Nusantara_DB';

// Search Google Drive for spreadsheet by name, prioritizing the user's provided sheet ID
export async function findSpreadsheet(accessToken: string): Promise<string | null> {
  const PREFERRED_SPREADSHEET_ID = '1P06Rsr8FvgPSa6sKJoT_DSyT3hiQZCY_vWdA6r9uPOs';

  // First verify if we can access the user's preferred spreadsheet
  try {
    const checkUrl = `https://www.googleapis.com/drive/v3/files/${PREFERRED_SPREADSHEET_ID}?fields=id,name`;
    const checkRes = await fetch(checkUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (checkRes.ok) {
      console.log('Successfully connected to preferred user spreadsheet:', PREFERRED_SPREADSHEET_ID);
      return PREFERRED_SPREADSHEET_ID;
    }
  } catch (err) {
    console.warn('Unable to access preferred spreadsheet, checking other options...', err);
  }

  const query = `name='${DB_FILENAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`;
  
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await res.json() as any;
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
    // Fall back to the preferred ID as last resort
    return PREFERRED_SPREADSHEET_ID;
  } catch (error) {
    console.error('Error finding spreadsheet:', error);
    return PREFERRED_SPREADSHEET_ID;
  }
}

// Create the Google Spreadsheet with all sheets and seed them
export async function createSpreadsheet(accessToken: string): Promise<string> {
  const url = 'https://sheets.googleapis.com/v4/spreadsheets';
  
  // Prepare sheets layout
  const sheets = Object.keys(SHEET_HEADERS).map(title => ({
    properties: { title }
  }));

  const body = {
    properties: { title: DB_FILENAME },
    sheets
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to create spreadsheet: ${errText}`);
    }

    const data = await res.json() as any;
    const spreadsheetId = data.spreadsheetId;
    console.log('Created Google Sheet database with ID:', spreadsheetId);

    // Now populate headers for each sheet
    await populateHeadersAndSeed(accessToken, spreadsheetId);

    return spreadsheetId;
  } catch (error) {
    console.error('Error creating spreadsheet:', error);
    throw error;
  }
}

// Populate header row for each sheet and write seed values
async function populateHeadersAndSeed(accessToken: string, spreadsheetId: string) {
  // Batch write headers
  const data = Object.entries(SHEET_HEADERS).map(([sheetName, headers]) => ({
    range: `${sheetName}!A1`,
    values: [headers]
  }));

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`;
  
  await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data
    })
  });

  console.log('Headers populated successfully. Seeding initial data...');

  // Seed default Settings
  await appendRow(accessToken, spreadsheetId, 'SETTING', {
    company_name: 'EduTech Nusantara Digital',
    logo: 'https://edutechnusantaradigital.github.io/assets/images/logo.png',
    website: 'https://edutechnusantaradigital.com/',
    whatsapp: '087850934303',
    address: 'Jl. Nusantara Raya No. 45, Malang, Jawa Timur',
    email: 'info@edutechnusantaradigital.com',
    bank_name: 'Bank Mandiri',
    bank_account: '1440029341103',
    bank_recipient: 'EduTech Nusantara Digital',
    qris_url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021126570022ID.CO.EDUTECHNUSANTARA.WWW01189360001234567890125204000053033605802ID5924EduTech%20Nusantara%20Digi6006Malang61056512362070703A0163041A2D',
    timezone: 'Asia/Jakarta',
    language: 'Indonesia'
  });

  // Seed initial Clients
  const initialClients = [
    {
      id: 'CLI00001',
      name: 'Universitas Nusantara Malang',
      email: 'unm@ac.id',
      whatsapp: '08123456789',
      address: 'Malang',
      pic: 'Dr. Ahmad Sutrisno',
      status: 'Active',
      created_at: new Date().toISOString()
    },
    {
      id: 'CLI00002',
      name: 'SMK Merdeka Surabaya',
      email: 'smkmerdeka@sch.id',
      whatsapp: '08567890123',
      address: 'Surabaya',
      pic: 'Budi Hartono, S.Pd.',
      status: 'Active',
      created_at: new Date().toISOString()
    },
    {
      id: 'CLI00003',
      name: 'Pondok Pesantren Al-Hidayah',
      email: 'alhidayah@ponpes.id',
      whatsapp: '087850934303',
      address: 'Gresik',
      pic: 'KH. Mustofa',
      status: 'Active',
      created_at: new Date().toISOString()
    }
  ];

  for (const client of initialClients) {
    await appendRow(accessToken, spreadsheetId, 'CLIENT', client);
  }

  // Seed default Categories, Packages, and Services
  const defaultFAQ = [
    { id: 'FAQ00001', question: 'Bagaimana cara konfirmasi pembayaran?', answer: 'Anda dapat mengunggah bukti transfer melalui halaman Invoice pada akun Client Anda atau menghubungi admin via WhatsApp.', category: 'Pembayaran' },
    { id: 'FAQ00002', question: 'Berapa lama pengerjaan website sekolah?', answer: 'Pengerjaan berkisar antara 7-14 hari kerja tergantung kompleksitas fitur (SIAKAD, PPDB, dll).', category: 'Project' }
  ];
  for (const faq of defaultFAQ) {
    await appendRow(accessToken, spreadsheetId, 'FAQ', faq);
  }

  // Seed Banks
  await appendRow(accessToken, spreadsheetId, 'BANK', {
    id: 'BNK00001',
    bank_name: 'Bank Mandiri',
    account_number: '1440029341103',
    account_name: 'EduTech Nusantara Digital'
  });

  // Seed some Orders
  const initialOrders = [
    { id: 'ORD00001', client_id: 'CLI00001', service_category: 'EduTech', service_package: 'SIAKAD', amount: '15000000', notes: 'Sistem Informasi Akademik Lengkap', status: 'DP', created_at: new Date().toISOString() },
    { id: 'ORD00002', client_id: 'CLI00002', service_category: 'Website', service_package: 'Website Sekolah', amount: '4500000', notes: 'Website profil dengan PPDB online', status: 'Progress', created_at: new Date().toISOString() }
  ];
  for (const order of initialOrders) {
    await appendRow(accessToken, spreadsheetId, 'ORDER', order);
  }

  // Seed Projects
  const initialProjects = [
    { id: 'PRJ00001', order_id: 'ORD00001', name: 'SIAKAD Universitas Nusantara', description: 'Development modul akademik, nilai, dan portal mahasiswa', status: 'On Progress', progress: '35', start_date: '2026-07-01', end_date: '2026-08-30', assigned_to: 'IT Developer', created_at: new Date().toISOString() },
    { id: 'PRJ00002', order_id: 'ORD00002', name: 'Website Profil SMK Merdeka', description: 'Slicing design, integration of PPDB', status: 'Testing', progress: '85', start_date: '2026-07-10', end_date: '2026-07-28', assigned_to: 'IT Developer', created_at: new Date().toISOString() }
  ];
  for (const prj of initialProjects) {
    await appendRow(accessToken, spreadsheetId, 'PROJECT', prj);
  }

  // Seed Invoices
  const initialInvoices = [
    { id: 'INV00001', order_id: 'ORD00001', client_id: 'CLI00001', subtotal: '15000000', tax: '0', discount: '0', grand_total: '15000000', status: 'Partial', due_date: '2026-08-01', created_at: new Date().toISOString() },
    { id: 'INV00002', order_id: 'ORD00002', client_id: 'CLI00002', subtotal: '4500000', tax: '0', discount: '0', grand_total: '4500000', status: 'Unpaid', due_date: '2026-07-25', created_at: new Date().toISOString() }
  ];
  for (const inv of initialInvoices) {
    await appendRow(accessToken, spreadsheetId, 'INVOICE', inv);
  }

  // Seed Tickets
  const initialTickets = [
    { id: 'TKT00001', client_id: 'CLI00003', title: 'Pertanyaan migrasi hosting', category: 'Hosting', priority: 'Medium', status: 'Open', description: 'Bagaimana cara memindahkan domain pesantren dari cPanel lama ke portal EduTech Nusantara?', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ];
  for (const tkt of initialTickets) {
    await appendRow(accessToken, spreadsheetId, 'TICKET', tkt);
  }

  // Seed Default Users (Staff) with Hashed Passwords
  const defaultPasswordHash = crypto.createHash('sha256').update('17April1960*').digest('hex');
  const initialUsers = [
    {
      id: 'USR00001',
      name: 'Rizki Handika',
      username: 'Rizkihandika',
      email: 'rizki.handika@edutechnusantaradigital.com',
      whatsapp: '087850934303',
      address: 'Malang',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      role: 'Super Admin',
      status: 'Active',
      join_date: '2026-01-01',
      referral_code: 'RIZKI25',
      commission_rate: '10',
      password: defaultPasswordHash,
      created_at: new Date().toISOString()
    },
    {
      id: 'USR00002',
      name: 'Badrul Muhayyat',
      username: 'Badrul',
      email: 'badrul.muhayyat@edutechnusantaradigital.com',
      whatsapp: '08123456788',
      address: 'Surabaya',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      role: 'IT Developer',
      status: 'Active',
      join_date: '2026-01-05',
      referral_code: 'BADRUL25',
      commission_rate: '10',
      password: defaultPasswordHash,
      created_at: new Date().toISOString()
    },
    {
      id: 'USR00003',
      name: 'Akim',
      username: 'Akim',
      email: 'akim@edutechnusantaradigital.com',
      whatsapp: '08123456787',
      address: 'Gresik',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      role: 'Marketing',
      status: 'Active',
      join_date: '2026-01-10',
      referral_code: 'AKIM25',
      commission_rate: '5',
      password: defaultPasswordHash,
      created_at: new Date().toISOString()
    }
  ];
  for (const usr of initialUsers) {
    await appendRow(accessToken, spreadsheetId, 'USER', usr);
  }

  // Seed default Services (Layanan Default EduTech Nusantara Digital)
  const initialServices = [
    {
      id: 'SVC00001',
      category: 'Website',
      sub_category: 'Website Sekolah',
      package_name: 'Paket Edu-Web Standard',
      price: '4500000',
      discount: '500000',
      status: 'Active',
      icon: 'Globe',
      color: 'indigo',
      banner: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
      thumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=200',
      description: 'Pembuatan website profil sekolah, PPDB Online terintegrasi, galeri, berita, dan pengelolaan guru/siswa standar.',
      features: 'Hosting 10GB, Domain .SCH.ID, Custom Themes, Responsive, Whatsapp Notification',
      estimation: '7-14 Hari'
    },
    {
      id: 'SVC00002',
      category: 'Pendidikan',
      sub_category: 'SIAKAD',
      package_name: 'SIAKAD Enterprise',
      price: '15000000',
      discount: '1500000',
      status: 'Active',
      icon: 'GraduationCap',
      color: 'emerald',
      banner: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=800',
      thumbnail: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=200',
      description: 'Sistem Informasi Akademik lengkap untuk pengelolaan nilai, e-rapor, KHS/KRS, jadwal kuliah/sekolah, keuangan sekolah, dan portal wali murid.',
      features: 'SIAKAD Core Modules, E-Rapor, Portal Siswa & Wali, Multi-Role, Dedicated Server 1 Year',
      estimation: '30 Hari'
    },
    {
      id: 'SVC00003',
      category: 'Enterprise',
      sub_category: 'ERP',
      package_name: 'ERP Suite Standard',
      price: '25000000',
      discount: '2000000',
      status: 'Active',
      icon: 'Briefcase',
      color: 'blue',
      banner: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=200',
      description: 'Sistem enterprise resource planning terintegrasi untuk HRIS, inventory barang, asset tracking, accounting, dan penjualan POS.',
      features: 'HRIS & Payroll, Inventory, Asset Management, POS, Financial Statements, Multi-branch',
      estimation: '45-60 Hari'
    },
    {
      id: 'SVC00004',
      category: 'Cloud',
      sub_category: 'Hosting',
      package_name: 'Cloud VPS Pro',
      price: '3500000',
      discount: '0',
      status: 'Active',
      icon: 'Server',
      color: 'rose',
      banner: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&q=80&w=800',
      thumbnail: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&q=80&w=200',
      description: 'Sewa cloud server VPS kecepatan tinggi dengan setup SSL, CPanel / CyberPanel, optimasi database, dan backup mingguan otomatis.',
      features: '4 vCPU, 8GB RAM, 160GB NVMe, Unlimited Bandwidth, Dedicated IP, Auto-SSL',
      estimation: '2 Hari'
    },
    {
      id: 'SVC00005',
      category: 'Digital Marketing',
      sub_category: 'SEO',
      package_name: 'SEO & Backlink Booster',
      price: '5000000',
      discount: '500000',
      status: 'Active',
      icon: 'TrendingUp',
      color: 'amber',
      banner: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&q=80&w=800',
      thumbnail: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&q=80&w=200',
      description: 'Optimasi on-page dan off-page SEO instansi, registrasi ke Google Search Console & Analytics, pendampingan indeks Google News, dan backlink PBN berkualitas.',
      features: 'On-Page Audit, Keyword Research, 50 High-DA Backlinks, Google News Registration, Monthly Progress Report',
      estimation: '30 Hari'
    }
  ];
  for (const svc of initialServices) {
    await appendRow(accessToken, spreadsheetId, 'SERVICE', svc);
  }

  // Seed default dashboard Widgets layout configs
  const defaultWidgets = [
    { id: 'WIDG00001', title: 'Total Pendapatan', role: 'Super Admin', visible: 'true', color: 'indigo', icon: 'DollarSign', order_index: '1' },
    { id: 'WIDG00002', title: 'Total Pengeluaran', role: 'Super Admin', visible: 'true', color: 'rose', icon: 'TrendingDown', order_index: '2' },
    { id: 'WIDG00003', title: 'Laba Bersih', role: 'Super Admin', visible: 'true', color: 'emerald', icon: 'Percent', order_index: '3' },
    { id: 'WIDG00004', title: 'Jumlah Client', role: 'Super Admin', visible: 'true', color: 'sky', icon: 'Users', order_index: '4' },
    { id: 'WIDG00005', title: 'Statistik Progres Projek', role: 'Super Admin', visible: 'true', color: 'violet', icon: 'Briefcase', order_index: '5' },
    { id: 'WIDG00006', title: 'Kas & Arus Tunai', role: 'Super Admin', visible: 'true', color: 'blue', icon: 'DollarSign', order_index: '6' },
    // Marketing Widgets
    { id: 'WIDG00007', title: 'Total Komisi Saya', role: 'Marketing', visible: 'true', color: 'emerald', icon: 'DollarSign', order_index: '1' },
    { id: 'WIDG00008', title: 'Referral Code & Link', role: 'Marketing', visible: 'true', color: 'sky', icon: 'GitBranch', order_index: '2' },
    { id: 'WIDG00009', title: 'Jumlah Lead Dikonversi', role: 'Marketing', visible: 'true', color: 'indigo', icon: 'UserCheck', order_index: '3' },
    // IT Widgets
    { id: 'WIDG00010', title: 'Projek Aktif', role: 'IT Developer', visible: 'true', color: 'indigo', icon: 'Briefcase', order_index: '1' },
    { id: 'WIDG00011', title: 'Penyelesaian Tugas (Tasks)', role: 'IT Developer', visible: 'true', color: 'emerald', icon: 'CheckSquare', order_index: '2' },
    // Finance Widgets
    { id: 'WIDG00012', title: 'Modal Awal & Cashflow', role: 'Super Admin', visible: 'true', color: 'purple', icon: 'TrendingUp', order_index: '7' }
  ];
  for (const widget of defaultWidgets) {
    await appendRow(accessToken, spreadsheetId, 'DASHBOARD_WIDGET', widget);
  }

  // Seed default financial transaction entries
  const initialFinance = [
    { id: 'FIN00001', type: 'INCOME', category: 'Invoice', description: 'Pembayaran DP SIAKAD CLI00001', amount: '15000000', date: new Date().toISOString().substring(0, 10), notes: 'SIAKAD Universitas Nusantara', created_at: new Date().toISOString() },
    { id: 'FIN00002', type: 'EXPENSE', category: 'Hosting', description: 'Pembelian Cloud Server VPS Singapore', amount: '1500000', date: new Date().toISOString().substring(0, 10), notes: 'Server VPS EduTech', created_at: new Date().toISOString() },
    { id: 'FIN00003', type: 'EXPENSE', category: 'Operasional', description: 'Pembayaran Gaji Staff Developer', amount: '5000000', date: new Date().toISOString().substring(0, 10), notes: 'Gaji Bulanan Staff IT Badrul', created_at: new Date().toISOString() }
  ];
  for (const fin of initialFinance) {
    await appendRow(accessToken, spreadsheetId, 'FINANCE', fin);
  }

  console.log('Database seed finished successfully!');
}

// Read all rows from a sheet and parse them as JSON objects
export async function readSheet(accessToken: string, spreadsheetId: string, sheetName: string): Promise<any[]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1:Z5000`;
  
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (!res.ok) {
      console.warn(`Sheet ${sheetName} could not be read. Creating headers...`);
      return [];
    }

    const data = await res.json() as any;
    if (!data.values || data.values.length === 0) {
      return [];
    }

    const headers = data.values[0] as string[];
    const rows: any[] = [];

    for (let i = 1; i < data.values.length; i++) {
      const rowVal = data.values[i];
      const rowObj: Record<string, any> = {};
      
      headers.forEach((header, index) => {
        rowObj[header] = rowVal[index] !== undefined ? rowVal[index] : '';
      });
      
      rows.push(rowObj);
    }

    return rows;
  } catch (error) {
    console.error(`Error reading sheet ${sheetName}:`, error);
    return [];
  }
}

// Append a single row to a sheet
export async function appendRow(accessToken: string, spreadsheetId: string, sheetName: string, record: Record<string, any>): Promise<any> {
  const headers = SHEET_HEADERS[sheetName];
  if (!headers) {
    throw new Error(`Unknown sheet: ${sheetName}`);
  }

  // Map record values to header columns
  const valuesRow = headers.map(header => {
    const val = record[header];
    return val !== undefined && val !== null ? String(val) : '';
  });

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1:append?valueInputOption=USER_ENTERED`;
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [valuesRow]
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to append to ${sheetName}: ${errText}`);
    }

    return record;
  } catch (error) {
    console.error(`Error appending row to ${sheetName}:`, error);
    throw error;
  }
}

// Update a specific row in a sheet (matching row by the ID column, which must be column index 0)
export async function updateRow(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  idValue: string,
  record: Record<string, any>
): Promise<boolean> {
  const headers = SHEET_HEADERS[sheetName];
  if (!headers) {
    throw new Error(`Unknown sheet: ${sheetName}`);
  }

  // Get current rows to find matching index
  const urlGet = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1:Z5000`;
  const resGet = await fetch(urlGet, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  
  if (!resGet.ok) return false;
  const dataGet = await resGet.json() as any;
  if (!dataGet.values || dataGet.values.length <= 1) return false;

  // Find row index (0-indexed spreadsheet, row A1 is 1, so row 2 is index 1)
  let foundRowIdx = -1;
  const idColIndex = headers.indexOf('id') === -1 ? 0 : headers.indexOf('id');
  
  for (let i = 1; i < dataGet.values.length; i++) {
    if (dataGet.values[i][idColIndex] === idValue) {
      foundRowIdx = i + 1; // Convert back to 1-indexed Sheets row number
      break;
    }
  }

  if (foundRowIdx === -1) {
    console.warn(`Row with ID ${idValue} not found in ${sheetName}. Appending instead...`);
    await appendRow(accessToken, spreadsheetId, sheetName, record);
    return true;
  }

  // Merge with existing row values
  const existingRow = dataGet.values[foundRowIdx - 1];
  const updatedRowValues = headers.map((header, index) => {
    if (record[header] !== undefined) {
      return String(record[header]);
    }
    return existingRow[index] !== undefined ? String(existingRow[index]) : '';
  });

  const urlUpdate = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A${foundRowIdx}:Z${foundRowIdx}?valueInputOption=USER_ENTERED`;
  
  const resUpdate = await fetch(urlUpdate, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: [updatedRowValues]
    })
  });

  return resUpdate.ok;
}

// Generate serial formatted ID like CLI00001, INV00010
export function generateSerialId(prefix: string, existingList: { id: string }[]): string {
  let maxNum = 0;
  existingList.forEach(item => {
    if (item.id && item.id.startsWith(prefix)) {
      const numPart = item.id.substring(prefix.length);
      const parsedNum = parseInt(numPart, 10);
      if (!isNaN(parsedNum) && parsedNum > maxNum) {
        maxNum = parsedNum;
      }
    }
  });

  const nextNum = maxNum + 1;
  const paddedNum = String(nextNum).padStart(5, '0');
  return `${prefix}${paddedNum}`;
}
