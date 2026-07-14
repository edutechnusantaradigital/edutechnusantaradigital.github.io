import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { User, Client, Service, Order, ProjectProgress, Invoice, Payment, Document, ChatMessage } from '../types/crm';

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Google Auth Provider setup with Sheets & Drive scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/drive');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Auth State Listener
export const initAuth = (
  onAuthSuccess?: (user: FirebaseUser, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Try to fetch token if user is signed in but we lost the cache (e.g. reload)
        // Note: For in-memory safety, it is better to ask for a reconnection if cache is empty
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Google Sign-In Trigger
export const googleSignIn = async (): Promise<{ user: FirebaseUser; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign-In Google error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Get current Access Token
export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

// Sign-Out Trigger
export const googleSignOut = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// --------------------------------------------------------------------------
// GOOGLE SHEETS & DRIVE DIRECT REST API OPERATIONS
// --------------------------------------------------------------------------

export interface GoogleDriveFile {
  id: string;
  name: string;
}

/**
 * List spreadsheet files from Google Drive
 */
export const listSpreadsheets = async (token: string): Promise<GoogleDriveFile[]> => {
  const url = `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'+and+trashed=false&orderBy=name&fields=files(id,name)`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Gagal mengambil daftar Spreadsheet dari Google Drive.');
  }
  const data = await res.json();
  return data.files || [];
};

/**
 * Create a fresh CRM Google Spreadsheet with all required tabs
 */
export const createCRMSpreadsheet = async (token: string): Promise<string> => {
  const url = 'https://sheets.googleapis.com/v4/spreadsheets';
  const body = {
    properties: {
      title: 'EduTech Nusantara CRM Database'
    },
    sheets: [
      { properties: { title: 'Users' } },
      { properties: { title: 'Clients' } },
      { properties: { title: 'Services' } },
      { properties: { title: 'Orders' } },
      { properties: { title: 'Progress' } },
      { properties: { title: 'Invoices' } },
      { properties: { title: 'Payments' } },
      { properties: { title: 'Documents' } },
      { properties: { title: 'Chats' } }
    ]
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Gagal membuat Google Spreadsheet baru.');
  }

  const data = await res.json();
  return data.spreadsheetId;
};

/**
 * Export Local CRM Database to Google Spreadsheet
 */
export const exportCRMDataToSpreadsheet = async (token: string, spreadsheetId: string): Promise<void> => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`;

  // Get data from localStorage or fallback
  const getTable = <T>(key: string): T[] => {
    const val = localStorage.getItem(`edutech_crm_${key}`);
    return val ? JSON.parse(val) : [];
  };

  const users = getTable<User>('users');
  const clients = getTable<Client>('clients');
  const services = getTable<Service>('services');
  const orders = getTable<Order>('orders');
  const progressList = getTable<ProjectProgress>('progress');
  const invoices = getTable<Invoice>('invoices');
  const payments = getTable<Payment>('payments');
  const documents = getTable<Document>('documents');
  const chats = getTable<ChatMessage>('chats');

  // Convert to values array
  const usersValues = [
    ['id', 'name', 'username', 'email', 'whatsapp', 'role', 'status', 'company', 'avatarUrl', 'createdAt'],
    ...users.map(u => [u.id || '', u.name || '', u.username || '', u.email || '', u.whatsapp || '', u.role || '', u.status || '', u.company || '', u.avatarUrl || '', u.createdAt || ''])
  ];

  const clientsValues = [
    ['id', 'name', 'company', 'email', 'whatsapp', 'username', 'status', 'projectCount', 'createdAt'],
    ...clients.map(c => [c.id || '', c.name || '', c.company || '', c.email || '', c.whatsapp || '', c.username || '', c.status || '', String(c.projectCount || 0), c.createdAt || ''])
  ];

  const servicesValues = [
    ['id', 'name', 'category', 'price', 'estimate', 'status', 'description'],
    ...services.map(s => [s.id || '', s.name || '', s.category || '', String(s.price || 0), s.estimate || '', s.status || '', s.description || ''])
  ];

  const ordersValues = [
    ['id', 'orderNumber', 'date', 'clientId', 'clientName', 'serviceId', 'serviceName', 'picId', 'picName', 'deadline', 'priority', 'status', 'notes'],
    ...orders.map(o => [o.id || '', o.orderNumber || '', o.date || '', o.clientId || '', o.clientName || '', o.serviceId || '', o.serviceName || '', o.picId || '', o.picName || '', o.deadline || '', o.priority || '', o.status || '', o.notes || ''])
  ];

  const progressValues = [
    ['id', 'orderNumber', 'clientName', 'projectName', 'percentage', 'timeline', 'checklistsJson', 'commentsJson', 'attachmentsJson', 'activitiesJson'],
    ...progressList.map(p => [
      p.id || '',
      p.orderNumber || '',
      p.clientName || '',
      p.projectName || '',
      String(p.percentage || 0),
      p.timeline || '',
      JSON.stringify(p.checklists || []),
      JSON.stringify(p.comments || []),
      JSON.stringify(p.attachments || []),
      JSON.stringify(p.activities || [])
    ])
  ];

  const invoicesValues = [
    ['id', 'invoiceNumber', 'orderId', 'date', 'clientId', 'clientName', 'clientCompany', 'clientAddress', 'serviceName', 'subtotal', 'tax', 'total', 'status', 'paymentQr'],
    ...invoices.map(i => [i.id || '', i.invoiceNumber || '', i.orderId || '', i.date || '', i.clientId || '', i.clientName || '', i.clientCompany || '', i.clientAddress || '', i.serviceName || '', String(i.subtotal || 0), String(i.tax || 0), String(i.total || 0), i.status || '', i.paymentQr || ''])
  ];

  const paymentsValues = [
    ['id', 'paymentNumber', 'invoiceNumber', 'clientName', 'amount', 'paymentDate', 'method', 'receiptUrl', 'status'],
    ...payments.map(p => [p.id || '', p.paymentNumber || '', p.invoiceNumber || '', p.clientName || '', String(p.amount || 0), p.paymentDate || '', p.method || '', p.receiptUrl || '', p.status || ''])
  ];

  const documentsValues = [
    ['id', 'name', 'category', 'size', 'uploadedAt', 'url'],
    ...documents.map(d => [d.id || '', d.name || '', d.category || '', d.size || '', d.uploadedAt || '', d.url || ''])
  ];

  const chatsValues = [
    ['id', 'senderId', 'senderName', 'senderRole', 'content', 'timestamp', 'isRead'],
    ...chats.map(c => [c.id || '', c.senderId || '', c.senderName || '', c.senderRole || '', c.content || '', c.timestamp || '', String(c.isRead)])
  ];

  const body = {
    valueInputOption: 'RAW',
    data: [
      { range: 'Users!A1', values: usersValues },
      { range: 'Clients!A1', values: clientsValues },
      { range: 'Services!A1', values: servicesValues },
      { range: 'Orders!A1', values: ordersValues },
      { range: 'Progress!A1', values: progressValues },
      { range: 'Invoices!A1', values: invoicesValues },
      { range: 'Payments!A1', values: paymentsValues },
      { range: 'Documents!A1', values: documentsValues },
      { range: 'Chats!A1', values: chatsValues }
    ]
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Gagal mengekspor data ke Google Spreadsheet.');
  }
};

/**
 * Helper to turn rows into key-value objects matching headers
 */
const parseRowsToObjects = (rows: string[][]): any[] => {
  if (!rows || rows.length <= 1) return [];
  const headers = rows[0];
  const results: any[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] !== undefined ? row[index] : '';
    });
    results.push(obj);
  }
  return results;
};

/**
 * Import Data from Google Spreadsheet to Local CRM Database
 */
export const importCRMDataFromSpreadsheet = async (token: string, spreadsheetId: string): Promise<void> => {
  const ranges = [
    'Users!A1:Z1000',
    'Clients!A1:Z1000',
    'Services!A1:Z1000',
    'Orders!A1:Z1000',
    'Progress!A1:Z1000',
    'Invoices!A1:Z1000',
    'Payments!A1:Z1000',
    'Documents!A1:Z1000',
    'Chats!A1:Z1000'
  ];
  
  const queryRanges = ranges.map(r => `ranges=${encodeURIComponent(r)}`).join('&');
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${queryRanges}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Gagal mengimpor data dari Google Spreadsheet.');
  }

  const data = await res.json();
  const valueRanges = data.valueRanges || [];

  const tables: { [key: string]: any[] } = {
    users: [],
    clients: [],
    services: [],
    orders: [],
    progress: [],
    invoices: [],
    payments: [],
    documents: [],
    chats: []
  };

  valueRanges.forEach((rangeObj: any) => {
    const rangeName = rangeObj.range;
    const rows = rangeObj.values || [];
    const parsed = parseRowsToObjects(rows);

    if (rangeName.startsWith('Users')) {
      tables.users = parsed.map(item => ({
        ...item,
        status: item.status || 'Aktif'
      }));
    } else if (rangeName.startsWith('Clients')) {
      tables.clients = parsed.map(item => ({
        ...item,
        projectCount: Number(item.projectCount || 0),
        status: item.status || 'Aktif'
      }));
    } else if (rangeName.startsWith('Services')) {
      tables.services = parsed.map(item => ({
        ...item,
        price: Number(item.price || 0),
        status: item.status || 'Aktif'
      }));
    } else if (rangeName.startsWith('Orders')) {
      tables.orders = parsed.map(item => ({
        ...item,
        priority: item.priority || 'Sedang',
        status: item.status || 'Menunggu'
      }));
    } else if (rangeName.startsWith('Progress')) {
      tables.progress = parsed.map(item => {
        let checklists = [];
        let comments = [];
        let attachments = [];
        let activities = [];
        try { checklists = JSON.parse(item.checklistsJson || '[]'); } catch(e){}
        try { comments = JSON.parse(item.commentsJson || '[]'); } catch(e){}
        try { attachments = JSON.parse(item.attachmentsJson || '[]'); } catch(e){}
        try { activities = JSON.parse(item.activitiesJson || '[]'); } catch(e){}

        return {
          id: item.id,
          orderNumber: item.orderNumber,
          clientName: item.clientName,
          projectName: item.projectName,
          percentage: Number(item.percentage || 0),
          timeline: item.timeline,
          checklists,
          comments,
          attachments,
          activities
        };
      });
    } else if (rangeName.startsWith('Invoices')) {
      tables.invoices = parsed.map(item => ({
        ...item,
        subtotal: Number(item.subtotal || 0),
        tax: Number(item.tax || 0),
        total: Number(item.total || 0),
        status: item.status || 'Belum Dibayar'
      }));
    } else if (rangeName.startsWith('Payments')) {
      tables.payments = parsed.map(item => ({
        ...item,
        amount: Number(item.amount || 0),
        status: item.status || 'Verifikasi'
      }));
    } else if (rangeName.startsWith('Documents')) {
      tables.documents = parsed.map(item => ({
        ...item,
        category: item.category || 'Kontrak'
      }));
    } else if (rangeName.startsWith('Chats')) {
      tables.chats = parsed.map(item => ({
        ...item,
        isRead: item.isRead === 'true'
      }));
    }
  });

  // Verify and write to localStorage
  if (tables.users.length > 0) localStorage.setItem('edutech_crm_users', JSON.stringify(tables.users));
  if (tables.clients.length > 0) localStorage.setItem('edutech_crm_clients', JSON.stringify(tables.clients));
  if (tables.services.length > 0) localStorage.setItem('edutech_crm_services', JSON.stringify(tables.services));
  if (tables.orders.length > 0) localStorage.setItem('edutech_crm_orders', JSON.stringify(tables.orders));
  if (tables.progress.length > 0) localStorage.setItem('edutech_crm_progress', JSON.stringify(tables.progress));
  if (tables.invoices.length > 0) localStorage.setItem('edutech_crm_invoices', JSON.stringify(tables.invoices));
  if (tables.payments.length > 0) localStorage.setItem('edutech_crm_payments', JSON.stringify(tables.payments));
  if (tables.documents.length > 0) localStorage.setItem('edutech_crm_documents', JSON.stringify(tables.documents));
  if (tables.chats.length > 0) localStorage.setItem('edutech_crm_chats', JSON.stringify(tables.chats));
};
