/**
 * Dandora.online Associate Platform - Backend Server
 * Serves Express REST API and static client bundles (Portal, Admin, Mobile App)
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./server/db');
const seed = require('./server/seed');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger for API calls
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// ==========================================
// 1. Health & Database Status
// ==========================================
app.get('/api/health', (req, res) => {
  try {
    const row = db.get('SELECT COUNT(*) as count FROM users_associate');
    res.json({
      status: 'ok',
      database: 'connected',
      engine: 'SQLite (node:sqlite)',
      associates_count: row ? row.count : 0,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ==========================================
// 2. Metrics & Dashboard Stats
// ==========================================
app.get('/api/stats', (req, res) => {
  try {
    const associates = db.get('SELECT COUNT(*) as count FROM users_associate').count;
    const leadsCount = db.get('SELECT COUNT(*) as count FROM leads').count;
    const wonLeads = db.get("SELECT COUNT(*) as count FROM leads WHERE lead_status IN ('WON', 'COMMISSION_APPROVED', 'PAID')").count;
    const totalPipeline = db.get('SELECT COALESCE(SUM(estimated_value), 0) as total FROM leads').total;
    const totalCommissions = db.get('SELECT COALESCE(SUM(commission_amount), 0) as total FROM commission_ledger').total;
    const totalDisbursed = db.get("SELECT COALESCE(SUM(net_payout), 0) as total FROM payouts WHERE status = 'SUCCESS'").total;

    res.json({
      success: true,
      data: {
        total_associates: associates,
        total_leads: leadsCount,
        deals_won: wonLeads,
        total_pipeline_value: totalPipeline,
        total_commissions_earned: totalCommissions,
        total_payouts_disbursed: totalDisbursed
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. Authentication & OTP
// ==========================================
app.post('/api/auth/otp/send', (req, res) => {
  const { mobileNumber } = req.body;
  if (!mobileNumber || mobileNumber.length < 10) {
    return res.status(400).json({ success: false, message: 'Valid 10-digit mobile required.' });
  }

  const cleanMobile = mobileNumber.startsWith('+91') 
    ? mobileNumber 
    : `+91${mobileNumber.replace(/\D/g, '').slice(-10)}`;
  const otpCode = '123456';
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  const id = `otp_${Date.now()}`;

  db.run(
    `INSERT INTO otp_requests (id, mobile_number, otp_code, expires_at, created_at) VALUES (?, ?, ?, ?, ?)`,
    [id, cleanMobile, otpCode, expiresAt, new Date().toISOString()]
  );

  res.json({
    success: true,
    data: {
      mobile: cleanMobile,
      expires_in_seconds: 300,
      simulated_otp_hint: '123456'
    },
    message: `OTP sent successfully to ${cleanMobile}. (Demo test code: 123456)`
  });
});

app.post('/api/auth/otp/verify', (req, res) => {
  const { mobileNumber, otpCode } = req.body;
  if (!otpCode || otpCode.trim() !== '123456') {
    return res.status(400).json({ success: false, message: 'Invalid verification code. Enter 123456 for demo test.' });
  }

  const cleanMobile = mobileNumber.startsWith('+91') 
    ? mobileNumber 
    : `+91${mobileNumber.replace(/\D/g, '').slice(-10)}`;

  res.json({
    success: true,
    data: {
      verified: true,
      mobile: cleanMobile,
      verified_at: new Date().toISOString()
    },
    message: 'Mobile number verified successfully.'
  });
});

app.post('/api/auth/login', (req, res) => {
  const { identifier } = req.body;
  if (!identifier) {
    return res.status(400).json({ success: false, message: 'Mobile number or associate code required.' });
  }

  const clean = identifier.trim();
  const associate = db.get(
    `SELECT * FROM users_associate WHERE mobile_number = ? OR associate_code = ? OR LOWER(email) = LOWER(?)`,
    [clean, clean, clean]
  );

  if (!associate) {
    return res.status(404).json({ success: false, message: 'No registered associate found matching this identifier.' });
  }

  db.run(`UPDATE users_associate SET last_login_at = ? WHERE id = ?`, [new Date().toISOString(), associate.id]);

  res.json({
    success: true,
    data: {
      user_id: associate.id,
      associate_code: associate.associate_code,
      full_name: associate.full_name,
      current_tier: associate.current_tier,
      status: associate.status,
      role: 'role_associate',
      logged_in_at: new Date().toISOString()
    },
    message: `Welcome back, ${associate.full_name}!`
  });
});

// ==========================================
// 4. Leads Management
// ==========================================
app.get('/api/leads', (req, res) => {
  try {
    const { associate_id, status } = req.query;
    let sql = 'SELECT * FROM leads';
    const params = [];
    const conditions = [];

    if (associate_id) {
      conditions.push('associate_id = ?');
      params.push(associate_id);
    }
    if (status) {
      conditions.push('lead_status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY submitted_at DESC';

    const leads = db.all(sql, params);
    res.json({ success: true, data: leads });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/leads/:id', (req, res) => {
  try {
    const lead = db.get('SELECT * FROM leads WHERE id = ?', [req.params.id]);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found.' });

    const history = db.all('SELECT * FROM lead_history WHERE lead_id = ? ORDER BY timestamp ASC', [req.params.id]);
    res.json({ success: true, data: { ...lead, history } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/leads', (req, res) => {
  try {
    const {
      associate_id = 'usr_assoc_1042',
      business_name,
      contact_person = 'Store Owner',
      contact_phone,
      business_category = 'General Retail',
      service_required = 'Digital Transformation',
      notes = '',
      location = 'Hyderabad',
      photo_url = '',
      estimated_value = 50000
    } = req.body;

    if (!business_name || !contact_phone) {
      return res.status(400).json({ success: false, message: 'Business name and contact phone are required.' });
    }

    const id = `lead_hyd_${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();
    const estVal = Number(estimated_value) || 50000;
    const estCommission = Math.round(estVal * 0.15);

    db.run(
      `INSERT INTO leads (
        id, associate_id, business_name, contact_person, contact_phone,
        business_category, service_required, notes, location, photo_url,
        lead_status, assigned_to, estimated_value, commission_amount,
        submitted_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SUBMITTED', 'Unassigned (Ops Queue)', ?, ?, ?, ?)`,
      [
        id, associate_id, business_name, contact_person, contact_phone,
        business_category, service_required, notes, location, photo_url,
        estVal, estCommission, now, now
      ]
    );

    // Record initial history
    db.run(
      `INSERT INTO lead_history (id, lead_id, old_status, new_status, changed_by, notes, timestamp)
       VALUES (?, ?, NULL, 'SUBMITTED', ?, 'Lead logged via Dandora Partner Application', ?)`,
      [`lh_${Date.now()}`, id, associate_id, now]
    );

    res.status(201).json({
      success: true,
      data: { id, business_name, lead_status: 'SUBMITTED', commission_amount: estCommission },
      message: `Lead for "${business_name}" registered successfully with ticket ID ${id}!`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/leads/:id/status', (req, res) => {
  try {
    const { status, actor_id = 'adm_02', notes = '' } = req.body;
    const lead = db.get('SELECT * FROM leads WHERE id = ?', [req.params.id]);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found.' });

    const now = new Date().toISOString();
    db.run(`UPDATE leads SET lead_status = ?, updated_at = ? WHERE id = ?`, [status, now, req.params.id]);

    db.run(
      `INSERT INTO lead_history (id, lead_id, old_status, new_status, changed_by, notes, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [`lh_${Date.now()}`, req.params.id, lead.lead_status, status, actor_id, notes, now]
    );

    res.json({ success: true, message: `Lead status updated to ${status}.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 5. Associates & Profiles
// ==========================================
app.get('/api/associates', (req, res) => {
  try {
    const associates = db.all(`
      SELECT a.*, p.city, p.locality, p.highest_education, k.kyc_status
      FROM users_associate a
      LEFT JOIN profiles p ON a.id = p.associate_id
      LEFT JOIN kyc_payout k ON a.id = k.associate_id
      ORDER BY a.created_at DESC
    `);
    res.json({ success: true, data: associates });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/associates/:id', (req, res) => {
  try {
    const associate = db.get('SELECT * FROM users_associate WHERE id = ?', [req.params.id]);
    if (!associate) return res.status(404).json({ success: false, message: 'Associate not found.' });

    const profile = db.get('SELECT * FROM profiles WHERE associate_id = ?', [req.params.id]) || {};
    const kyc = db.get('SELECT * FROM kyc_payout WHERE associate_id = ?', [req.params.id]) || {};
    const skills = db.all(`
      SELECT s.id, s.name, s.category, ask.experience_level, ask.verified
      FROM associate_skills ask
      JOIN skills s ON ask.skill_id = s.id
      WHERE ask.associate_id = ?
    `, [req.params.id]);

    res.json({
      success: true,
      data: {
        ...associate,
        profile,
        kyc,
        skills
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/associates', (req, res) => {
  try {
    const { full_name, mobile_number, email, date_of_birth, gender, referral_code } = req.body;
    if (!full_name || !mobile_number) {
      return res.status(400).json({ success: false, message: 'Name and mobile are required.' });
    }

    const nextIdNum = Math.floor(1000 + Math.random() * 9000);
    const id = `usr_assoc_${nextIdNum}`;
    const associateCode = `DAN-HYD-${nextIdNum}`;
    const now = new Date().toISOString();

    db.run(
      `INSERT INTO users_associate (
        id, associate_code, full_name, mobile_number, email, date_of_birth,
        gender, status, profile_completion_percentage, current_tier, referral_code,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE', 30, 'Scout', ?, ?, ?)`,
      [
        id, associateCode, full_name, mobile_number, email || '', date_of_birth || '',
        gender || 'Not Specified', referral_code || `DAN${nextIdNum}`, now, now
      ]
    );

    // Initialize blank KYC record
    db.run(
      `INSERT INTO kyc_payout (associate_id, kyc_status) VALUES (?, 'NOT_SUBMITTED')`,
      [id]
    );

    res.status(201).json({
      success: true,
      data: { id, associate_code: associateCode, full_name },
      message: `Associate ${full_name} successfully registered!`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 6. Broadcasts, Academy & Commissions
// ==========================================
app.get('/api/broadcasts', (req, res) => {
  try {
    const broadcasts = db.all('SELECT * FROM broadcasts WHERE active = 1 ORDER BY publish_date DESC');
    res.json({ success: true, data: broadcasts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/training', (req, res) => {
  try {
    const training = db.all('SELECT * FROM training_modules');
    res.json({ success: true, data: training });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/commissions', (req, res) => {
  try {
    const { associate_id } = req.query;
    let sql = 'SELECT * FROM commission_ledger';
    const params = [];
    if (associate_id) {
      sql += ' WHERE associate_id = ?';
      params.push(associate_id);
    }
    sql += ' ORDER BY created_at DESC';
    const rows = db.all(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/payouts', (req, res) => {
  try {
    const { associate_id } = req.query;
    let sql = 'SELECT * FROM payouts';
    const params = [];
    if (associate_id) {
      sql += ' WHERE associate_id = ?';
      params.push(associate_id);
    }
    sql += ' ORDER BY disbursed_at DESC';
    const rows = db.all(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 7. Cloud Sync Webhook (for Google Sheets / Integrations)
// ==========================================
app.post('/api/sync/webhook', (req, res) => {
  try {
    const payload = req.body;
    console.log('⚡ Received sync webhook payload:', payload);

    if (payload.type === 'lead') {
      const id = payload.id || `lead_hyd_${Date.now().toString().slice(-4)}`;
      const now = new Date().toISOString();
      db.run(
        `INSERT OR REPLACE INTO leads (
          id, associate_id, business_name, contact_person, contact_phone,
          business_category, service_required, notes, location, photo_url,
          lead_status, assigned_to, estimated_value, commission_amount,
          submitted_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, payload.associate_id || 'usr_assoc_1042', payload.bizName || payload.business_name || 'Store Lead',
          payload.contact || payload.contact_person || 'Owner', payload.phone || payload.contact_phone || '9876543210',
          payload.category || 'Retail', payload.need || 'Digital Services', payload.notes || '',
          payload.location || 'Hyderabad', payload.photo_url || '', payload.status || 'SUBMITTED',
          'Cloud Ingest Queue', payload.deal_value || 50000, payload.payout || 7500, now, now
        ]
      );
    }

    res.json({ success: true, message: 'Payload ingested into SQLite database.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 8. Static Web App Serving
// ==========================================
// Serve mobile application directly on /mobile
app.use('/mobile', express.static(path.join(__dirname, 'mobile')));

// Serve node_modules if needed for client libs like gsap
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// Serve main web directory
app.use(express.static(path.join(__dirname)));

// Route shortcuts
app.get('/portal', (req, res) => res.sendFile(path.join(__dirname, 'portal.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'register.html')));

// Fallback for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Auto-seed database if empty
try {
  const row = db.get('SELECT COUNT(*) as count FROM users_associate');
  if (!row || row.count === 0) {
    console.log('⚡ Initial empty database detected. Seeding defaults...');
    seed();
  }
} catch (e) {
  console.warn('DB initialization notice:', e.message);
}

// Start Server with automatic fallback if port is in use
function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`====================================================`);
    console.log(`🚀 Dandora Partner Platform is live!`);
    console.log(`🌐 Marketing Portal:  http://localhost:${port}`);
    console.log(`💼 Partner Portal:    http://localhost:${port}/portal.html`);
    console.log(`👑 Admin Console:     http://localhost:${port}/admin.html`);
    console.log(`📱 Mobile Web App:    http://localhost:${port}/mobile/`);
    console.log(`🗄️ Database API:      http://localhost:${port}/api/health`);
    console.log(`====================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = Number(port) + 1;
      console.warn(`⚠️ Port ${port} is already in use. Automatically switching to http://localhost:${nextPort}...`);
      startServer(nextPort);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(PORT);
