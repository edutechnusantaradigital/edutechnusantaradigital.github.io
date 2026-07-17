/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';
import {
  findSpreadsheet,
  createSpreadsheet,
  readSheet,
  appendRow,
  updateRow,
  generateSerialId,
  SHEET_HEADERS
} from './src/server-db';

// Initialize Gemini API
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

// Global system token tracking to allow credential login database read/write
let systemAccessToken: string | null = null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  // Helper to extract access token from headers with global fallback
  const getAuthToken = (req: express.Request): string | null => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token && token !== 'null' && token !== 'undefined' && !token.startsWith('session_token_')) {
        systemAccessToken = token; // Cache it globally
        return token;
      }
    }
    return systemAccessToken;
  };

  // Middleware to ensure token is present
  const checkToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = getAuthToken(req);
    if (!token) {
      return res.status(401).json({ error: 'OAuth Access Token or active system token is required. Please have Super Admin sign in with Google first.' });
    }
    next();
  };

  // --- API ROUTES ---

  // 1.0 DYNAMIC USER AUTHENTICATION & SESSIONS
  app.post('/api/auth/login', async (req, res) => {
    const { credential, password } = req.body;
    if (!credential || !password) {
      return res.status(400).json({ error: 'Username/Email/WhatsApp dan password harus diisi.' });
    }

    const token = systemAccessToken;
    if (!token) {
      return res.status(503).json({ error: 'Spreadsheet connection is not active. Silakan hubungi Super Admin untuk Login Google terlebih dahulu.' });
    }

    try {
      const spreadsheetId = await findSpreadsheet(token);
      if (!spreadsheetId) {
        return res.status(500).json({ error: 'Database spreadsheet tidak ditemukan.' });
      }

      const users = await readSheet(token, spreadsheetId, 'USER');
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

      // Find user matching credentials first (ignoring password to track failed logins)
      const potentialUser = users.find(u => 
        u.username?.toLowerCase() === credential.toLowerCase() ||
        u.email?.toLowerCase() === credential.toLowerCase() ||
        u.whatsapp === credential
      );

      if (potentialUser) {
        const failedCount = parseInt(potentialUser.failed_login || '0', 10);
        
        // Check if locked out
        if (potentialUser.status === 'Blokir' || potentialUser.status === 'Diblokir' || failedCount >= 5) {
          // Force update status to Blocked in sheets if failed count reached 5
          if (failedCount >= 5 && potentialUser.status !== 'Blokir') {
            await updateRow(token, spreadsheetId, 'USER', potentialUser.id, { status: 'Blokir' });
          }
          return res.status(403).json({ 
            error: 'Akun Anda saat ini tidak dapat digunakan.\n\nSilakan hubungi Admin EduTech Nusantara Digital.\n\nWhatsApp:\n087850934303' 
          });
        }

        // Verify password
        if (potentialUser.password !== hashedPassword) {
          const nextFailed = failedCount + 1;
          const updateFields: any = { failed_login: nextFailed.toString() };
          
          if (nextFailed >= 5) {
            updateFields.status = 'Blokir';
            // Audit Log
            await appendRow(token, spreadsheetId, 'ACTIVITY_LOG', {
              id: generateSerialId('ACT', await readSheet(token, spreadsheetId, 'ACTIVITY_LOG')),
              user_name: potentialUser.name,
              action: 'ACCOUNT_LOCKED',
              details: `Akun dikunci otomatis karena 5 kali gagal login.`,
              timestamp: new Date().toISOString()
            });
          }
          
          await updateRow(token, spreadsheetId, 'USER', potentialUser.id, updateFields);
          
          if (nextFailed >= 5) {
            return res.status(403).json({ 
              error: 'Akun Anda saat ini tidak dapat digunakan.\n\nSilakan hubungi Admin EduTech Nusantara Digital.\n\nWhatsApp:\n087850934303' 
            });
          }
          return res.status(401).json({ error: `Kredensial atau password salah. Sisa percobaan: ${5 - nextFailed}` });
        }
      } else {
        return res.status(401).json({ error: 'Kredensial atau password salah.' });
      }

      const user = potentialUser;

      // Check user statuses
      const sLower = (user.status || '').toLowerCase();
      if (sLower !== 'active' && sLower !== 'aktif') {
        return res.status(403).json({ 
          error: 'Akun Anda saat ini tidak dapat digunakan.\n\nSilakan hubungi Admin EduTech Nusantara Digital.\n\nWhatsApp:\n087850934303' 
        });
      }

      // Reset failed login count on successful login
      await updateRow(token, spreadsheetId, 'USER', user.id, { failed_login: '0' });

      // Device detection
      const ua = req.headers['user-agent'] || '';
      let device = 'Desktop';
      if (/mobile/i.test(ua)) device = 'Mobile';
      else if (/tablet/i.test(ua)) device = 'Tablet';

      // Log Login
      const loginLog = {
        id: generateSerialId('LGL', await readSheet(token, spreadsheetId, 'LOGIN_LOG')),
        user_id: user.id,
        ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
        user_agent: `${device} (${ua.substring(0, 50)})`,
        timestamp: new Date().toISOString()
      };
      await appendRow(token, spreadsheetId, 'LOGIN_LOG', loginLog);

      // Record Activity Log
      await appendRow(token, spreadsheetId, 'ACTIVITY_LOG', {
        id: generateSerialId('ACT', await readSheet(token, spreadsheetId, 'ACTIVITY_LOG')),
        user_name: user.name,
        action: 'LOGIN',
        details: `Login berhasil menggunakan perangkat: ${device}`,
        timestamp: new Date().toISOString()
      });

      // Update user last login
      await updateRow(token, spreadsheetId, 'USER', user.id, {
        last_login: new Date().toISOString()
      });

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          whatsapp: user.whatsapp,
          role: user.role,
          status: user.status,
          avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          join_date: user.join_date,
          last_login: user.last_login,
          referral_code: user.referral_code,
          commission_rate: user.commission_rate,
          address: user.address,
          bank: user.bank,
          account_number: user.account_number,
          account_name: user.account_name,
          ewallet: user.ewallet,
          ewallet_number: user.ewallet_number
        },
        token: `session_token_${user.id}_${Date.now()}`
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 1.1 CLIENT REGISTRATION SIGNUP
  app.post('/api/auth/register', async (req, res) => {
    const { name, companyName, email, whatsapp, username, password, marketingId, referralCode } = req.body;
    
    if (!name || !email || !whatsapp || !username || !password) {
      return res.status(400).json({ error: 'Nama, Email, WhatsApp, Username, dan Password wajib diisi.' });
    }

    const token = systemAccessToken;
    if (!token) {
      return res.status(503).json({ error: 'Spreadsheet connection is not active.' });
    }

    try {
      const spreadsheetId = await findSpreadsheet(token);
      if (!spreadsheetId) {
        return res.status(500).json({ error: 'Database spreadsheet tidak ditemukan.' });
      }

      // Check duplicates
      const users = await readSheet(token, spreadsheetId, 'USER');
      const isDup = users.some(u => u.username?.toLowerCase() === username.toLowerCase() || u.email?.toLowerCase() === email.toLowerCase());
      if (isDup) {
        return res.status(400).json({ error: 'Username atau Email sudah terdaftar.' });
      }

      const id = generateSerialId('USR', users);
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

      const newUser = {
        id,
        name,
        username,
        email,
        whatsapp,
        address: companyName || '',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        role: 'Client',
        status: 'Active',
        join_date: new Date().toISOString().split('T')[0],
        password: hashedPassword,
        failed_login: '0',
        created_at: new Date().toISOString()
      };

      // Add to USER table
      await appendRow(token, spreadsheetId, 'USER', newUser);

      // Add to CLIENT table
      const clients = await readSheet(token, spreadsheetId, 'CLIENT');
      const cliId = generateSerialId('CLI', clients);
      const newClient = {
        id: cliId,
        name: companyName || name,
        email,
        whatsapp,
        address: companyName || 'Alamat Umum',
        pic: name,
        status: 'Active',
        created_at: new Date().toISOString(),
        avatar: newUser.avatar
      };
      await appendRow(token, spreadsheetId, 'CLIENT', newClient);

      // Trigger automatic folder structure on Google Drive simulation
      try {
        const folderUrl = `https://drive.google.com/drive/folders/mock_${cliId}`;
        const existingDocs = await readSheet(token, spreadsheetId, 'DOCUMENT');
        const docId = generateSerialId('DOC', existingDocs);
        
        await appendRow(token, spreadsheetId, 'DOCUMENT', {
          id: docId,
          client_id: cliId,
          name: `Folder Utama Client - ${name}`,
          type: 'FOLDER',
          drive_url: folderUrl,
          created_at: new Date().toISOString()
        });
      } catch (driveErr) {
        console.error('Drive simulation folder error:', driveErr);
      }

      // Record Activity Log
      await appendRow(token, spreadsheetId, 'ACTIVITY_LOG', {
        id: generateSerialId('ACT', await readSheet(token, spreadsheetId, 'ACTIVITY_LOG')),
        user_name: name,
        action: 'CLIENT_SIGNUP',
        details: `Pendaftaran mandiri client baru berhasil. ID: ${cliId}, Marketing Rujukan: ${marketingId || 'Umum'}`,
        timestamp: new Date().toISOString()
      });

      res.json({ success: true, message: 'Pendaftaran berhasil. Silakan login ke Dashboard.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    const { email } = req.body;
    const token = systemAccessToken;
    if (!token) {
      return res.status(503).json({ error: 'Spreadsheet connection is not active.' });
    }

    try {
      const spreadsheetId = await findSpreadsheet(token);
      if (!spreadsheetId) return res.status(500).json({ error: 'Database spreadsheet not found.' });

      const users = await readSheet(token, spreadsheetId, 'USER');
      const user = users.find(u => u.email?.toLowerCase() === email?.toLowerCase());
      if (!user) {
        return res.status(404).json({ error: 'Alamat email tidak terdaftar.' });
      }

      // Log email reset request
      await appendRow(token, spreadsheetId, 'EMAIL_LOG', {
        id: generateSerialId('EML', await readSheet(token, spreadsheetId, 'EMAIL_LOG')),
        to: email,
        subject: 'Reset Password - CRM EduTech Nusantara',
        status: 'Sent',
        timestamp: new Date().toISOString()
      });

      res.json({ success: true, message: `Tautan instruksi reset password berhasil dikirim ke ${email}.` });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 1.1 DYNAMIC SERVICES CRUD (DASHBOARD LAYANAN)
  app.get('/api/services', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const data = await readSheet(token, spreadsheetId, 'SERVICE');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/services', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const existing = await readSheet(token, spreadsheetId, 'SERVICE');
      const id = generateSerialId('SVC', existing);
      const service = { id, ...req.body };
      await appendRow(token, spreadsheetId, 'SERVICE', service);
      res.json(service);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/services/:id', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const success = await updateRow(token, spreadsheetId, 'SERVICE', req.params.id, req.body);
      res.json({ success, id: req.params.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/services/:id', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      // Set status to Inactive instead of hard delete to preserve sheet integrity
      const success = await updateRow(token, spreadsheetId, 'SERVICE', req.params.id, { status: 'Inactive' });
      res.json({ success, id: req.params.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 1.2 USER / STAFF CRUD
  app.get('/api/staff', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const data = await readSheet(token, spreadsheetId, 'USER');
      // Strip passwords for safety before returning
      const safeData = data.map(u => {
        const { password, ...safeUser } = u;
        return safeUser;
      });
      res.json(safeData);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/staff', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const existing = await readSheet(token, spreadsheetId, 'USER');
      const id = generateSerialId('USR', existing);
      
      const userPayload = { ...req.body };
      if (userPayload.password) {
        userPayload.password = crypto.createHash('sha256').update(userPayload.password).digest('hex');
      } else {
        // Fallback default password
        userPayload.password = crypto.createHash('sha256').update('17April1960*').digest('hex');
      }

      const user = { id, ...userPayload, created_at: new Date().toISOString() };
      await appendRow(token, spreadsheetId, 'USER', user);
      
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/staff/:id', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const payload = { ...req.body };
      if (payload.password) {
        payload.password = crypto.createHash('sha256').update(payload.password).digest('hex');
      }
      const success = await updateRow(token, spreadsheetId, 'USER', req.params.id, payload);
      res.json({ success, id: req.params.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 1.3 DYNAMIC DASHBOARD WIDGETS LAYOUT CONFIGURATION
  app.get('/api/dashboard/widgets', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const data = await readSheet(token, spreadsheetId, 'DASHBOARD_WIDGET');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/dashboard/widgets/layout', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    const { widgets } = req.body; // Array of widgets to update
    if (!Array.isArray(widgets)) {
      return res.status(400).json({ error: 'Widgets array is required.' });
    }

    try {
      for (const w of widgets) {
        await updateRow(token, spreadsheetId, 'DASHBOARD_WIDGET', w.id, w);
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 1.4 CASHOUTS AND COMMISSIONS
  app.get('/api/commissions/cashouts', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const cashouts = await readSheet(token, spreadsheetId, 'CASHOUT');
      res.json(cashouts);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/commissions/cashouts', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const existing = await readSheet(token, spreadsheetId, 'CASHOUT');
      const id = generateSerialId('CSH', existing);
      const cashout = { id, ...req.body, created_at: new Date().toISOString() };
      await appendRow(token, spreadsheetId, 'CASHOUT', cashout);
      res.json(cashout);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/commissions/cashouts/:id', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const success = await updateRow(token, spreadsheetId, 'CASHOUT', req.params.id, req.body);
      res.json({ success, id: req.params.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 1. DATABASE INITIALIZATION
  app.get('/api/init', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    try {
      let spreadsheetId = await findSpreadsheet(token);
      let isNew = false;
      if (!spreadsheetId) {
        spreadsheetId = await createSpreadsheet(token);
        isNew = true;
      }

      // Read current Settings
      const settings = await readSheet(token, spreadsheetId, 'SETTING');
      res.json({
        spreadsheetId,
        isNew,
        settings: settings.length > 0 ? settings[0] : null
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Initialization failed' });
    }
  });

  // 2. SETTINGS
  app.get('/api/settings', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const data = await readSheet(token, spreadsheetId, 'SETTING');
      res.json(data.length > 0 ? data[0] : {});
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/settings', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      await updateRow(token, spreadsheetId, 'SETTING', req.body.company_name, req.body);
      res.json({ success: true, settings: req.body });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2.5 GOOGLE APPS SCRIPT PROXY
  app.post('/api/apps-script/proxy', checkToken, async (req, res) => {
    const { webAppUrl, action, payload } = req.body;
    if (!webAppUrl) {
      return res.status(400).json({ error: 'Web App URL Google Apps Script belum dikonfigurasi.' });
    }

    try {
      const response = await fetch(webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, payload })
      });

      const responseText = await response.text();
      try {
        const responseData = JSON.parse(responseText);
        res.json(responseData);
      } catch (jsonErr) {
        res.json({ status: response.ok ? 'success' : 'error', message: responseText });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Gagal berkomunikasi dengan Apps Script Engine.' });
    }
  });

  // 3. CLIENTS
  app.get('/api/clients', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const data = await readSheet(token, spreadsheetId, 'CLIENT');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/clients', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const existing = await readSheet(token, spreadsheetId, 'CLIENT');
      const id = generateSerialId('CLI', existing);
      const client = { id, ...req.body, created_at: new Date().toISOString() };
      await appendRow(token, spreadsheetId, 'CLIENT', client);
      res.json(client);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/clients/:id', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const success = await updateRow(token, spreadsheetId, 'CLIENT', req.params.id, req.body);
      res.json({ success, id: req.params.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. LEADS
  app.get('/api/leads', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const data = await readSheet(token, spreadsheetId, 'LEADS');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/leads', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const existing = await readSheet(token, spreadsheetId, 'LEADS');
      const id = generateSerialId('LEA', existing);
      const lead = { id, ...req.body, created_at: new Date().toISOString() };
      await appendRow(token, spreadsheetId, 'LEADS', lead);
      res.json(lead);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/leads/:id', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const success = await updateRow(token, spreadsheetId, 'LEADS', req.params.id, req.body);
      res.json({ success, id: req.params.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. ORDERS
  app.get('/api/orders', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const data = await readSheet(token, spreadsheetId, 'ORDER');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/orders', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const existing = await readSheet(token, spreadsheetId, 'ORDER');
      const id = generateSerialId('ORD', existing);
      const order = { id, ...req.body, created_at: new Date().toISOString() };
      await appendRow(token, spreadsheetId, 'ORDER', order);
      res.json(order);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/orders/:id', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const success = await updateRow(token, spreadsheetId, 'ORDER', req.params.id, req.body);
      res.json({ success, id: req.params.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. PROJECTS
  app.get('/api/projects', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const projects = await readSheet(token, spreadsheetId, 'PROJECT');
      const tasks = await readSheet(token, spreadsheetId, 'PROJECT_TASK');
      const timelines = await readSheet(token, spreadsheetId, 'PROJECT_TIMELINE');
      res.json({ projects, tasks, timelines });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/projects', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const existing = await readSheet(token, spreadsheetId, 'PROJECT');
      const id = generateSerialId('PRJ', existing);
      const project = { id, ...req.body, created_at: new Date().toISOString() };
      await appendRow(token, spreadsheetId, 'PROJECT', project);
      res.json(project);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/projects/:id', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const success = await updateRow(token, spreadsheetId, 'PROJECT', req.params.id, req.body);
      res.json({ success, id: req.params.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // PROJECT TASKS
  app.post('/api/projects/:id/tasks', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const existing = await readSheet(token, spreadsheetId, 'PROJECT_TASK');
      const taskId = generateSerialId('TSK', existing);
      const task = { id: taskId, project_id: req.params.id, ...req.body };
      await appendRow(token, spreadsheetId, 'PROJECT_TASK', task);
      res.json(task);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/projects/tasks/:taskId', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const success = await updateRow(token, spreadsheetId, 'PROJECT_TASK', req.params.taskId, req.body);
      res.json({ success, id: req.params.taskId });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 7. INVOICES
  app.get('/api/invoices', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const data = await readSheet(token, spreadsheetId, 'INVOICE');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/invoices', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const existing = await readSheet(token, spreadsheetId, 'INVOICE');
      const id = generateSerialId('INV', existing);
      const invoice = { id, ...req.body, created_at: new Date().toISOString() };
      await appendRow(token, spreadsheetId, 'INVOICE', invoice);
      res.json(invoice);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/invoices/:id', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const success = await updateRow(token, spreadsheetId, 'INVOICE', req.params.id, req.body);
      res.json({ success, id: req.params.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 8. PAYMENTS
  app.get('/api/payments', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const data = await readSheet(token, spreadsheetId, 'PAYMENT');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/payments', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const existing = await readSheet(token, spreadsheetId, 'PAYMENT');
      const id = generateSerialId('PAY', existing);
      const payment = { id, ...req.body, created_at: new Date().toISOString() };
      await appendRow(token, spreadsheetId, 'PAYMENT', payment);
      res.json(payment);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/payments/:id', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const success = await updateRow(token, spreadsheetId, 'PAYMENT', req.params.id, req.body);
      res.json({ success, id: req.params.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 9. TICKETS
  app.get('/api/tickets', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const data = await readSheet(token, spreadsheetId, 'TICKET');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/tickets', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const existing = await readSheet(token, spreadsheetId, 'TICKET');
      const id = generateSerialId('TKT', existing);
      const ticket = {
        id,
        ...req.body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await appendRow(token, spreadsheetId, 'TICKET', ticket);
      res.json(ticket);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/tickets/:id', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const success = await updateRow(token, spreadsheetId, 'TICKET', req.params.id, {
        ...req.body,
        updated_at: new Date().toISOString()
      });
      res.json({ success, id: req.params.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // TICKET CHATS
  app.get('/api/tickets/:id/chats', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const chats = await readSheet(token, spreadsheetId, 'CHAT');
      const ticketChats = chats.filter(c => c.ticket_id === req.params.id);
      res.json(ticketChats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/tickets/:id/chats', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const existing = await readSheet(token, spreadsheetId, 'CHAT');
      const id = generateSerialId('CHT', existing);
      const chat = {
        id,
        ticket_id: req.params.id,
        ...req.body,
        timestamp: new Date().toISOString()
      };
      await appendRow(token, spreadsheetId, 'CHAT', chat);
      res.json(chat);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 10. HOSTING & DOMAIN & SERVERS
  app.get('/api/infrastructure', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const hosting = await readSheet(token, spreadsheetId, 'HOSTING');
      const domain = await readSheet(token, spreadsheetId, 'DOMAIN');
      const server = await readSheet(token, spreadsheetId, 'SERVER');
      res.json({ hosting, domain, server });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 11. FINANCE & CASHFLOW
  app.get('/api/finance', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const data = await readSheet(token, spreadsheetId, 'FINANCE');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/finance', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const existing = await readSheet(token, spreadsheetId, 'FINANCE');
      const id = generateSerialId('FIN', existing);
      const log = { id, ...req.body, created_at: new Date().toISOString() };
      await appendRow(token, spreadsheetId, 'FINANCE', log);
      res.json(log);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 12. REFERRAL & COMMISSION
  app.get('/api/referrals', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const referrals = await readSheet(token, spreadsheetId, 'REFERRAL');
      const commissions = await readSheet(token, spreadsheetId, 'COMMISSION');
      res.json({ referrals, commissions });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 13. FAQ
  app.get('/api/faqs', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const faqs = await readSheet(token, spreadsheetId, 'FAQ');
      res.json(faqs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 14. DOCUMENT CENTER & DMS
  app.get('/api/documents', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const data = await readSheet(token, spreadsheetId, 'DOCUMENT');
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/documents', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const existing = await readSheet(token, spreadsheetId, 'DOCUMENT');
      const id = generateSerialId('DOC', existing);
      const document = { id, ...req.body, created_at: new Date().toISOString() };
      await appendRow(token, spreadsheetId, 'DOCUMENT', document);
      
      // Log Action
      await appendRow(token, spreadsheetId, 'ACTIVITY_LOG', {
        id: generateSerialId('ACT', await readSheet(token, spreadsheetId, 'ACTIVITY_LOG')),
        user_name: req.body.uploaded_by || 'Staff',
        action: 'UPLOAD_DOCUMENT',
        details: `Dokumen "${req.body.name}" berhasil diunggah.`,
        timestamp: new Date().toISOString()
      });

      res.json(document);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/documents/:id', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const success = await updateRow(token, spreadsheetId, 'DOCUMENT', req.params.id, req.body);
      
      // Log Action
      await appendRow(token, spreadsheetId, 'ACTIVITY_LOG', {
        id: generateSerialId('ACT', await readSheet(token, spreadsheetId, 'ACTIVITY_LOG')),
        user_name: 'Admin',
        action: 'UPDATE_DOCUMENT',
        details: `Metadata dokumen ID ${req.params.id} diperbarui.`,
        timestamp: new Date().toISOString()
      });

      res.json({ success, id: req.params.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/documents/:id', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    try {
      const success = await updateRow(token, spreadsheetId, 'DOCUMENT', req.params.id, {
        access: 'Archived',
        name: '[ARCHIVED] Deleted Document'
      });
      
      // Log Action
      await appendRow(token, spreadsheetId, 'ACTIVITY_LOG', {
        id: generateSerialId('ACT', await readSheet(token, spreadsheetId, 'ACTIVITY_LOG')),
        user_name: 'Admin',
        action: 'DELETE_DOCUMENT',
        details: `Dokumen ID ${req.params.id} dipindahkan ke Arsip Keamanan.`,
        timestamp: new Date().toISOString()
      });

      res.json({ success, id: req.params.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Mock document PDF generation and logging activity
  app.post('/api/documents/generate-pdf', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const spreadsheetId = req.headers['spreadsheet-id'] as string;
    if (!spreadsheetId) return res.status(400).json({ error: 'Spreadsheet ID missing' });

    const { clientId, templateType, name, uploadedBy } = req.body;
    try {
      const existing = await readSheet(token, spreadsheetId, 'DOCUMENT');
      const docId = generateSerialId('DOC', existing);
      
      // Simulate creating a Drive File URL for the generated PDF
      const mockDriveFileId = `gdrive_file_${Math.random().toString(36).substring(2, 12)}`;
      const driveUrl = `https://docs.google.com/viewer?srcid=${mockDriveFileId}&pid=explorer&efh=false&a=v&chrome=false&embedded=true`;
      
      const newDoc = {
        id: docId,
        client_id: clientId || 'CLI00001',
        name: name || `PDF_${templateType || 'Invoice'}_AutoGenerated.pdf`,
        type: 'PDF',
        drive_url: driveUrl,
        created_at: new Date().toISOString()
      };
      
      await appendRow(token, spreadsheetId, 'DOCUMENT', newDoc);

      // Audit Log
      await appendRow(token, spreadsheetId, 'ACTIVITY_LOG', {
        id: generateSerialId('ACT', await readSheet(token, spreadsheetId, 'ACTIVITY_LOG')),
        user_name: uploadedBy || 'System PDF Generator',
        action: 'CREATE_DOCUMENT',
        details: `PDF ${templateType || 'Dokumen'} berhasil dibuat secara otomatis untuk Client: ${clientId || 'Umum'}`,
        timestamp: new Date().toISOString()
      });

      res.json(newDoc);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- GOOGLE WORKSPACE API INTEG (GMAIL, CALENDAR, DRIVE) ---

  // Gmail Inbox
  app.get('/api/gmail/inbox', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    try {
      const url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10';
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) {
        throw new Error('Gmail integration failed or scopes not granted');
      }
      const data = await response.json() as any;
      const messages = data.messages || [];

      // Fetch detailed threads/headers
      const detailedMessages = await Promise.all(
        messages.map(async (msg: any) => {
          const detailUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`;
          const dRes = await fetch(detailUrl, { headers: { Authorization: `Bearer ${token}` } });
          const dData = await dRes.json() as any;
          const headers = dData.payload?.headers || [];
          const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
          const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || 'Unknown';
          const date = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || '';
          return {
            id: msg.id,
            snippet: dData.snippet || '',
            subject,
            from,
            date
          };
        })
      );
      res.json(detailedMessages);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Send Email
  app.post('/api/gmail/send', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const { to, subject, body } = req.body;

    try {
      const rawMessage = [
        `To: ${to}`,
        `Subject: ${subject}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        '',
        body
      ].join('\n');

      const encodedEmail = Buffer.from(rawMessage)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: encodedEmail })
      });

      if (!response.ok) {
        throw new Error('Failed to send email via Google APIs');
      }

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Calendar List Events
  app.get('/api/calendar/events', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    try {
      const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=20&orderBy=startTime&singleEvents=true';
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json() as any;
      res.json(data.items || []);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Calendar Create Event
  app.post('/api/calendar/events', checkToken, async (req, res) => {
    const token = getAuthToken(req)!;
    const { summary, description, start, end } = req.body;
    try {
      const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          summary,
          description,
          start: { dateTime: start, timeZone: 'Asia/Jakarta' },
          end: { dateTime: end, timeZone: 'Asia/Jakarta' }
        })
      });
      const data = await response.json() as any;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- GEMINI AI SERVICES ---

  // Project Report Generator
  app.post('/api/gemini/summarize-project', checkToken, async (req, res) => {
    if (!ai) {
      return res.status(500).json({ error: 'Gemini API key is not configured' });
    }
    const { project, tasks } = req.body;
    const taskSummary = tasks.map((t: any) => `- [${t.status}] ${t.name} (Priority: ${t.priority})`).join('\n');

    const prompt = `You are the Expert System Analyst and Project Manager at EduTech Nusantara Digital.
Based on the following active client project details, generate a highly professional, polite, and reassuring status report in Bahasa Indonesia that the Account Manager can directly send to the client. Keep the tone enterprise, neat, and highly polished.

Project: ${project.name}
Description: ${project.description}
Current Progress: ${project.progress}%
Timeline: ${project.start_date} to ${project.end_date}
Status: ${project.status}

Tasks:
${taskSummary}

Generate the response in beautiful HTML tags so we can display it elegantly in the CRM UI dashboard. Include sections for:
1. "Ringkasan Eksekutif"
2. "Pekerjaan yang Telah Selesai"
3. "Langkah Selanjutnya & Target"
4. "Catatan Penting / Mitigasi Risiko"`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      res.json({ summary: response.text });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Ticket Assistant Reply Suggestion
  app.post('/api/gemini/reply-suggestion', checkToken, async (req, res) => {
    if (!ai) {
      return res.status(500).json({ error: 'Gemini API key is not configured' });
    }
    const { ticket } = req.body;
    const prompt = `You are a Senior Customer Support Executive at EduTech Nusantara Digital CRM.
We have an open support ticket from our client. Analyze the ticket details below and draft an exceptionally helpful, polite, and accurate response in Bahasa Indonesia that resolves or acknowledges their concern professionally.

Ticket ID: ${ticket.id}
Category: ${ticket.category}
Priority: ${ticket.priority}
Title: ${ticket.title}
Issue Description: ${ticket.description}

Provide the reply draft with high clarity, proper spacing, and include a friendly closing from "EduTech Nusantara Digital Support Team".`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      res.json({ reply: response.text });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });


  // --- VITE AND STATIC ASSETS SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduTech CRM Backend running on http://localhost:${PORT}`);
  });
}

startServer();
