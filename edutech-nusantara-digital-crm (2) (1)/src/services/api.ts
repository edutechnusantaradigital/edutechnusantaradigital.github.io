import { User, Client, Service, Order, ProjectProgress, Invoice, Payment, Document, CRMSetting, ChatMessage } from '../types/crm';
import {
  initialUsers,
  initialClients,
  initialServices,
  initialOrders,
  initialProgress,
  initialInvoices,
  initialPayments,
  initialDocuments,
  initialSettings,
  initialChats
} from '../data/initialData';

/**
 * ============================================================================
 * GOOGLE APPS SCRIPT & SPREADSHEET ARCHITECTURE DOCUMENTATION
 * ============================================================================
 * 
 * To migrate this client-side CRM database to Google Spreadsheet & Google Apps Script:
 * 
 * 1. Create a Google Spreadsheet with the following sheets:
 *    - Users (id, name, username, email, whatsapp, role, status, company, avatarUrl, createdAt)
 *    - Clients (id, name, company, email, whatsapp, username, status, projectCount, createdAt)
 *    - Services (id, name, category, price, estimate, status, description)
 *    - Orders (id, orderNumber, date, clientId, clientName, serviceId, serviceName, picId, picName, deadline, priority, status, notes)
 *    - Progress (id, orderNumber, clientName, projectName, percentage, timeline, checklistsJson, commentsJson, attachmentsJson, activitiesJson)
 *    - Invoices (id, invoiceNumber, orderId, date, clientId, clientName, clientCompany, clientAddress, serviceName, subtotal, tax, total, status)
 *    - Payments (id, paymentNumber, invoiceNumber, clientName, amount, paymentDate, method, receiptUrl, status)
 *    - Documents (id, name, category, size, uploadedAt, url)
 *    - Chats (id, senderId, senderName, senderRole, content, timestamp, isRead)
 *    - Settings (id, companyName, logoUrl, address, email, whatsapp, website, instagram, facebook, linkedin, youtube, themeColor, darkMode)
 * 
 * 2. Deploy a Google Apps Script Web App with the following doGet/doPost handler template:
 * 
 * ```javascript
 * function doGet(e) {
 *   const action = e.parameter.action;
 *   const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
 *   
 *   if (action === 'getData') {
 *     const sheetName = e.parameter.sheet;
 *     const sheet = spreadsheet.getSheetByName(sheetName);
 *     const data = getSheetData(sheet);
 *     return ContentService.createTextOutput(JSON.stringify(data))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   }
 *   // ... handle other read actions
 * }
 * 
 * function doPost(e) {
 *   const payload = JSON.parse(e.postData.contents);
 *   const action = payload.action;
 *   const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
 *   
 *   if (action === 'saveRecord') {
 *     const sheetName = payload.sheet;
 *     const record = payload.data;
 *     const sheet = spreadsheet.getSheetByName(sheetName);
 *     saveToSheet(sheet, record);
 *     return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Data saved' }))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   }
 *   // ... handle edits/deletes
 * }
 * 
 * function getSheetData(sheet) {
 *   const rows = sheet.getDataRange().getValues();
 *   const headers = rows[0];
 *   const data = [];
 *   for (let i = 1; i < rows.length; i++) {
 *     const row = rows[i];
 *     const obj = {};
 *     headers.forEach((header, index) => {
 *       obj[header] = row[index];
 *     });
 *     data.push(obj);
 *   }
 *   return data;
 * }
 * ```
 * 
 * 3. Change `USE_APPS_SCRIPT` to true and provide your deployed GAS Web App Executable URL in `.env`.
 */

// Toggle this when you're ready to connect to Google Apps Script
const USE_APPS_SCRIPT = false;
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/.../exec'; // Input from user secrets / env later

// Helper to check and initialize local storage
const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(`edutech_crm_${key}`);
  if (!data) {
    localStorage.setItem(`edutech_crm_${key}`, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(data);
};

const setLocalStorage = <T>(key: string, value: T): void => {
  localStorage.setItem(`edutech_crm_${key}`, JSON.stringify(value));
};

// Seed Local Database
export const initializeDatabase = () => {
  getLocalStorage('users', initialUsers);
  getLocalStorage('clients', initialClients);
  getLocalStorage('services', initialServices);
  getLocalStorage('orders', initialOrders);
  getLocalStorage('progress', initialProgress);
  getLocalStorage('invoices', initialInvoices);
  getLocalStorage('payments', initialPayments);
  getLocalStorage('documents', initialDocuments);
  getLocalStorage('settings', initialSettings);
  getLocalStorage('chats', initialChats);
};

// Simulated network delay (ms) to demonstrate skeleton animations
const API_DELAY = 600;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const normalizePhone = (phone: string): string => {
  if (!phone) return '';
  // Remove all non-numeric characters
  const numbersOnly = phone.replace(/\D/g, '');
  // Convert 08xxx to 628xxx
  if (numbersOnly.startsWith('08')) {
    return '62' + numbersOnly.slice(1);
  }
  return numbersOnly;
};

export const CRM_API = {
  // --------------------------------------------------------------------------
  // AUTHENTICATION & SESSIONS
  // --------------------------------------------------------------------------
  getCurrentUser: (): User | null => {
    const data = localStorage.getItem('edutech_crm_current_user');
    return data ? JSON.parse(data) : null;
  },

  logout: (): void => {
    localStorage.removeItem('edutech_crm_current_user');
  },

  login: async (usernameOrWa: string, passwordSecret: string): Promise<{ success: boolean; user?: User; message: string }> => {
    await delay(API_DELAY);
    const users = getLocalStorage<User[]>('users', initialUsers);
    
    const cleanInput = usernameOrWa.trim();
    const isPhone = /^[0-9\s\-\+\(\)]+$/.test(cleanInput) && cleanInput.replace(/\D/g, '').length >= 6;
    const normalizedInput = isPhone ? normalizePhone(cleanInput) : cleanInput.toLowerCase();

    const user = users.find(u => {
      if (isPhone) {
        return normalizePhone(u.whatsapp) === normalizedInput;
      } else {
        return (u.username && u.username.toLowerCase() === normalizedInput) || 
               (u.email && u.email.toLowerCase() === normalizedInput);
      }
    });

    if (user) {
      if (user.password === passwordSecret) {
        // Strip password for security and add loginTime
        const { password, ...userSession } = user;
        const sessionWithTime = {
          ...userSession,
          loginTime: new Date().toISOString()
        };
        localStorage.setItem('edutech_crm_current_user', JSON.stringify(sessionWithTime));
        return { success: true, user: sessionWithTime as any, message: 'Login Berhasil!' };
      } else {
        return { success: false, message: 'Password yang Anda masukkan salah.' };
      }
    }
    return { success: false, message: 'Akun dengan username atau WhatsApp tersebut tidak ditemukan.' };
  },

  register: async (payload: { name: string; company: string; email: string; whatsapp: string; username: string; password?: string }): Promise<{ success: boolean; user?: User; message: string }> => {
    await delay(API_DELAY);
    const users = getLocalStorage<User[]>('users', initialUsers);
    const clients = getLocalStorage<Client[]>('clients', initialClients);

    const cleanUsername = payload.username.trim();
    const cleanEmail = payload.email.trim();
    const normalizedWhatsapp = normalizePhone(payload.whatsapp);

    // Validation
    if (users.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
      return { success: false, message: 'Username sudah digunakan.' };
    }
    if (users.some(u => u.email.toLowerCase() === cleanEmail.toLowerCase())) {
      return { success: false, message: 'Email sudah terdaftar.' };
    }
    if (users.some(u => normalizePhone(u.whatsapp) === normalizedWhatsapp)) {
      return { success: false, message: 'Nomor WhatsApp sudah terdaftar.' };
    }

    // Create User (Role Client)
    const newUser: User = {
      id: `u-${Date.now()}`,
      name: payload.name,
      username: cleanUsername,
      password: payload.password || '12345678',
      email: cleanEmail,
      whatsapp: payload.whatsapp,
      role: 'CLIENT',
      status: 'Aktif',
      company: payload.company,
      createdAt: new Date().toISOString().split('T')[0],
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${cleanUsername}`
    };

    // Create Client Record
    const newClient: Client = {
      id: `c-${Date.now()}`,
      name: payload.name,
      company: payload.company,
      email: cleanEmail,
      whatsapp: payload.whatsapp,
      username: cleanUsername,
      status: 'Aktif',
      projectCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    users.push(newUser);
    clients.push(newClient);

    setLocalStorage('users', users);
    setLocalStorage('clients', clients);

    localStorage.setItem('edutech_crm_current_user', JSON.stringify(newUser));
    return { success: true, user: newUser, message: 'Registrasi berhasil! Akun Anda aktif.' };
  },

  // --------------------------------------------------------------------------
  // USERS (CRUD)
  // --------------------------------------------------------------------------
  getUsers: async (): Promise<User[]> => {
    await delay(API_DELAY);
    if (USE_APPS_SCRIPT) {
      const res = await fetch(`${APPS_SCRIPT_URL}?action=getData&sheet=Users`);
      return res.json();
    }
    return getLocalStorage<User[]>('users', initialUsers);
  },

  saveUser: async (user: User): Promise<User> => {
    await delay(200);
    const users = getLocalStorage<User[]>('users', initialUsers);
    const index = users.findIndex(u => u.id === user.id);

    if (index >= 0) {
      const existingUser = users[index];
      users[index] = {
        ...existingUser,
        ...user,
        password: user.password || existingUser.password
      };
    } else {
      user.id = `u-${Date.now()}`;
      user.createdAt = new Date().toISOString().split('T')[0];
      if (!user.password) {
        user.password = '12345678'; // Default password for newly created accounts
      }
      if (!user.avatarUrl) {
        user.avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`;
      }
      users.push(user);
    }
    setLocalStorage('users', users);
    return user;
  },

  deleteUser: async (id: string): Promise<boolean> => {
    await delay(200);
    const users = getLocalStorage<User[]>('users', initialUsers);
    const filtered = users.filter(u => u.id !== id);
    setLocalStorage('users', filtered);
    return true;
  },

  // --------------------------------------------------------------------------
  // CLIENTS (CRUD)
  // --------------------------------------------------------------------------
  getClients: async (): Promise<Client[]> => {
    await delay(API_DELAY);
    return getLocalStorage<Client[]>('clients', initialClients);
  },

  saveClient: async (client: Client): Promise<Client> => {
    await delay(200);
    const clients = getLocalStorage<Client[]>('clients', initialClients);
    const index = clients.findIndex(c => c.id === client.id);

    if (index >= 0) {
      clients[index] = client;
    } else {
      client.id = `c-${Date.now()}`;
      client.createdAt = new Date().toISOString().split('T')[0];
      client.projectCount = 0;
      clients.push(client);

      // Create a companion user credentials
      const users = getLocalStorage<User[]>('users', initialUsers);
      users.push({
        id: `u-${Date.now()}`,
        name: client.name,
        username: client.username || client.email.split('@')[0],
        email: client.email,
        whatsapp: client.whatsapp,
        role: 'CLIENT',
        status: client.status,
        company: client.company,
        createdAt: client.createdAt
      });
      setLocalStorage('users', users);
    }
    setLocalStorage('clients', clients);
    return client;
  },

  deleteClient: async (id: string): Promise<boolean> => {
    await delay(200);
    const clients = getLocalStorage<Client[]>('clients', initialClients);
    const filtered = clients.filter(c => c.id !== id);
    setLocalStorage('clients', filtered);
    return true;
  },

  // --------------------------------------------------------------------------
  // SERVICES (CRUD)
  // --------------------------------------------------------------------------
  getServices: async (): Promise<Service[]> => {
    await delay(API_DELAY);
    return getLocalStorage<Service[]>('services', initialServices);
  },

  saveService: async (service: Service): Promise<Service> => {
    await delay(200);
    const services = getLocalStorage<Service[]>('services', initialServices);
    const index = services.findIndex(s => s.id === service.id);

    if (index >= 0) {
      services[index] = service;
    } else {
      service.id = `s-${Date.now()}`;
      services.push(service);
    }
    setLocalStorage('services', services);
    return service;
  },

  deleteService: async (id: string): Promise<boolean> => {
    await delay(200);
    const services = getLocalStorage<Service[]>('services', initialServices);
    const filtered = services.filter(s => s.id !== id);
    setLocalStorage('services', filtered);
    return true;
  },

  // --------------------------------------------------------------------------
  // ORDERS (CRUD)
  // --------------------------------------------------------------------------
  getOrders: async (): Promise<Order[]> => {
    await delay(API_DELAY);
    return getLocalStorage<Order[]>('orders', initialOrders);
  },

  saveOrder: async (order: Order): Promise<Order> => {
    await delay(200);
    const orders = getLocalStorage<Order[]>('orders', initialOrders);
    const index = orders.findIndex(o => o.id === order.id);

    // Get helper data
    const clients = getLocalStorage<Client[]>('clients', initialClients);
    const services = getLocalStorage<Service[]>('services', initialServices);
    const users = getLocalStorage<User[]>('users', initialUsers);

    const client = clients.find(c => c.id === order.clientId);
    const service = services.find(s => s.id === order.serviceId);
    const pic = users.find(u => u.id === order.picId);

    if (client) order.clientName = client.name;
    if (service) order.serviceName = service.name;
    if (pic) order.picName = pic.name;

    if (index >= 0) {
      orders[index] = order;
    } else {
      order.id = `ord-${Date.now()}`;
      order.orderNumber = `ORD-2026-${String(orders.length + 1).padStart(3, '0')}`;
      order.date = new Date().toISOString().split('T')[0];
      orders.push(order);

      // Create initial progress entry
      const progressList = getLocalStorage<ProjectProgress[]>('progress', initialProgress);
      progressList.push({
        id: order.id,
        orderNumber: order.orderNumber,
        clientName: order.clientName,
        projectName: order.serviceName,
        percentage: 0,
        timeline: `${order.date} - ${order.deadline}`,
        checklists: [
          { id: `ch-${Date.now()}-1`, title: 'Kickoff meeting & Pengumpulan Kebutuhan', isCompleted: false },
          { id: `ch-${Date.now()}-2`, title: 'Proses Desain & Prototype', isCompleted: false },
          { id: `ch-${Date.now()}-3`, title: 'Tahap Development / Implementasi', isCompleted: false },
          { id: `ch-${Date.now()}-4`, title: 'Testing & Delivery', isCompleted: false }
        ],
        comments: [],
        attachments: [],
        activities: [
          { id: `ac-${Date.now()}`, user: order.picName, action: 'Membuat alur proyek & inisialisasi', timestamp: new Date().toLocaleString() }
        ]
      });
      setLocalStorage('progress', progressList);

      // Generate invoice
      const invoices = getLocalStorage<Invoice[]>('invoices', initialInvoices);
      const subtotal = service ? service.price : 5000000;
      const tax = Math.round(subtotal * 0.11);
      invoices.push({
        id: `inv-${Date.now()}`,
        invoiceNumber: `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`,
        orderId: order.id,
        date: order.date,
        clientId: order.clientId,
        clientName: order.clientName,
        clientCompany: client ? client.company : 'Perorangan',
        clientAddress: 'Jl. Raya Pendidikan Nusantara, Bandung',
        serviceName: order.serviceName,
        subtotal,
        tax,
        total: subtotal + tax,
        status: 'Belum Dibayar'
      });
      setLocalStorage('invoices', invoices);

      // Increment projectCount on Client
      if (client) {
        client.projectCount += 1;
        setLocalStorage('clients', clients);
      }
    }
    setLocalStorage('orders', orders);
    return order;
  },

  deleteOrder: async (id: string): Promise<boolean> => {
    await delay(200);
    const orders = getLocalStorage<Order[]>('orders', initialOrders);
    const filtered = orders.filter(o => o.id !== id);
    setLocalStorage('orders', filtered);
    return true;
  },

  // --------------------------------------------------------------------------
  // PROJECT PROGRESS
  // --------------------------------------------------------------------------
  getProgress: async (): Promise<ProjectProgress[]> => {
    await delay(API_DELAY);
    return getLocalStorage<ProjectProgress[]>('progress', initialProgress);
  },

  saveProgress: async (progress: ProjectProgress): Promise<ProjectProgress> => {
    await delay(200);
    const progressList = getLocalStorage<ProjectProgress[]>('progress', initialProgress);
    const index = progressList.findIndex(p => p.id === progress.id);
    if (index >= 0) {
      progressList[index] = progress;
      setLocalStorage('progress', progressList);
    }
    return progress;
  },

  // --------------------------------------------------------------------------
  // INVOICES
  // --------------------------------------------------------------------------
  getInvoices: async (): Promise<Invoice[]> => {
    await delay(API_DELAY);
    return getLocalStorage<Invoice[]>('invoices', initialInvoices);
  },

  saveInvoice: async (invoice: Invoice): Promise<Invoice> => {
    await delay(200);
    const invoices = getLocalStorage<Invoice[]>('invoices', initialInvoices);
    const index = invoices.findIndex(i => i.id === invoice.id);
    if (index >= 0) {
      invoices[index] = invoice;
      setLocalStorage('invoices', invoices);
    }
    return invoice;
  },

  // --------------------------------------------------------------------------
  // PAYMENTS
  // --------------------------------------------------------------------------
  getPayments: async (): Promise<Payment[]> => {
    await delay(API_DELAY);
    return getLocalStorage<Payment[]>('payments', initialPayments);
  },

  submitPayment: async (payment: Payment): Promise<Payment> => {
    await delay(API_DELAY);
    const payments = getLocalStorage<Payment[]>('payments', initialPayments);
    payment.id = `pay-${Date.now()}`;
    payment.paymentNumber = `PAY-2026-${String(payments.length + 1).padStart(3, '0')}`;
    payment.status = 'Verifikasi';
    payments.push(payment);
    setLocalStorage('payments', payments);
    return payment;
  },

  verifyPayment: async (paymentId: string, status: 'Disetujui' | 'Ditolak'): Promise<boolean> => {
    await delay(200);
    const payments = getLocalStorage<Payment[]>('payments', initialPayments);
    const payment = payments.find(p => p.id === paymentId);
    if (payment) {
      payment.status = status;
      setLocalStorage('payments', payments);

      // If approved, update invoice status
      if (status === 'Disetujui') {
        const invoices = getLocalStorage<Invoice[]>('invoices', initialInvoices);
        const invoice = invoices.find(i => i.invoiceNumber === payment.invoiceNumber);
        if (invoice) {
          // If transfer is equal to total, make it Lunas, otherwise DP
          if (payment.amount >= invoice.total) {
            invoice.status = 'Lunas';
          } else {
            invoice.status = 'DP';
          }
          setLocalStorage('invoices', invoices);
        }
      }
      return true;
    }
    return false;
  },

  // --------------------------------------------------------------------------
  // DOCUMENTS
  // --------------------------------------------------------------------------
  getDocuments: async (): Promise<Document[]> => {
    await delay(API_DELAY);
    return getLocalStorage<Document[]>('documents', initialDocuments);
  },

  saveDocument: async (doc: Document): Promise<Document> => {
    await delay(200);
    const docs = getLocalStorage<Document[]>('documents', initialDocuments);
    doc.id = `doc-${Date.now()}`;
    doc.uploadedAt = new Date().toISOString().split('T')[0];
    docs.push(doc);
    setLocalStorage('documents', docs);
    return doc;
  },

  deleteDocument: async (id: string): Promise<boolean> => {
    await delay(200);
    const docs = getLocalStorage<Document[]>('documents', initialDocuments);
    const filtered = docs.filter(d => d.id !== id);
    setLocalStorage('documents', filtered);
    return true;
  },

  // --------------------------------------------------------------------------
  // CHATS
  // --------------------------------------------------------------------------
  getChats: async (): Promise<ChatMessage[]> => {
    await delay(API_DELAY);
    return getLocalStorage<ChatMessage[]>('chats', initialChats);
  },

  sendChatMessage: async (msg: ChatMessage): Promise<ChatMessage> => {
    const chats = getLocalStorage<ChatMessage[]>('chats', initialChats);
    msg.id = `ch-m-${Date.now()}`;
    chats.push(msg);
    setLocalStorage('chats', chats);
    return msg;
  },

  // --------------------------------------------------------------------------
  // SETTINGS
  // --------------------------------------------------------------------------
  getSettings: async (): Promise<CRMSetting> => {
    await delay(API_DELAY);
    return getLocalStorage<CRMSetting>('settings', initialSettings);
  },

  saveSettings: async (settings: CRMSetting): Promise<CRMSetting> => {
    await delay(200);
    setLocalStorage('settings', settings);
    return settings;
  },

  // --------------------------------------------------------------------------
  // ANALYTICS & REPORTS
  // --------------------------------------------------------------------------
  getReports: async (): Promise<any> => {
    await delay(API_DELAY);
    const invoices = getLocalStorage<Invoice[]>('invoices', initialInvoices);
    const orders = getLocalStorage<Order[]>('orders', initialOrders);
    const clients = getLocalStorage<Client[]>('clients', initialClients);

    // Calculate dynamic stats
    const totalRevenue = invoices
      .filter(i => i.status === 'Lunas' || i.status === 'DP')
      .reduce((sum, i) => sum + (i.status === 'Lunas' ? i.total : i.total * 0.5), 0);

    const pendingRevenue = invoices
      .filter(i => i.status === 'Belum Dibayar')
      .reduce((sum, i) => sum + i.total, 0);

    return {
      totalClients: clients.length,
      activeProjects: orders.filter(o => o.status === 'Diproses' || o.status === 'Revisi').length,
      completedProjects: orders.filter(o => o.status === 'Selesai').length,
      pendingInvoicesCount: invoices.filter(i => i.status === 'Belum Dibayar').length,
      totalRevenue,
      pendingRevenue,
      revenueByMonth: [
        { month: 'Jan', amount: 12000000 },
        { month: 'Feb', amount: 18500000 },
        { month: 'Mar', amount: 26100000 },
        { month: 'Apr', amount: 32400000 },
        { month: 'Mei', amount: totalRevenue > 40000000 ? totalRevenue : 45200000 },
        { month: 'Jun', amount: 52000000 }
      ],
      ordersByCategory: [
        { category: 'OJS/Jurnal', value: orders.filter(o => o.serviceName.includes('OJS') || o.serviceName.includes('ISBN')).length },
        { category: 'Web Dev', value: orders.filter(o => o.serviceName.includes('Website') || o.serviceName.includes('Landing')).length },
        { category: 'AI Automation', value: orders.filter(o => o.serviceName.includes('AI')).length },
        { category: 'Lainnya', value: orders.filter(o => !o.serviceName.includes('Website') && !o.serviceName.includes('OJS') && !o.serviceName.includes('AI')).length }
      ]
    };
  }
};
