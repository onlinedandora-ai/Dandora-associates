-- Dandora.online Associate Platform - Relational SQLite Schema
-- Implements complete 15-entity schema for Associates, Leads, Commissions, KYC, Payouts, and Training.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role_id TEXT REFERENCES roles(id),
  designation TEXT,
  active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS users_associate (
  id TEXT PRIMARY KEY,
  associate_code TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  mobile_number TEXT UNIQUE NOT NULL,
  email TEXT,
  date_of_birth TEXT,
  gender TEXT,
  status TEXT DEFAULT 'ACTIVE',
  profile_completion_percentage INTEGER DEFAULT 0,
  current_tier TEXT DEFAULT 'Scout',
  referred_by_associate_id TEXT,
  referral_code TEXT,
  mobile_verified_at TEXT,
  email_verified_at TEXT,
  last_login_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS profiles (
  associate_id TEXT PRIMARY KEY REFERENCES users_associate(id) ON DELETE CASCADE,
  address_line TEXT,
  locality TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  highest_education TEXT,
  degree_specialization TEXT,
  institution_name TEXT,
  profile_segment TEXT,
  weekly_availability TEXT,
  portfolio_url TEXT
);

CREATE TABLE IF NOT EXISTS associate_skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  associate_id TEXT NOT NULL REFERENCES users_associate(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL REFERENCES skills(id),
  experience_level TEXT DEFAULT 'Intermediate',
  verified INTEGER DEFAULT 0,
  UNIQUE(associate_id, skill_id)
);

CREATE TABLE IF NOT EXISTS kyc_payout (
  associate_id TEXT PRIMARY KEY REFERENCES users_associate(id) ON DELETE CASCADE,
  pan_last_four TEXT,
  pan_masked TEXT,
  aadhaar_last_four TEXT,
  aadhaar_document_url TEXT,
  pan_document_url TEXT,
  account_holder_name TEXT,
  bank_name TEXT,
  bank_account_masked TEXT,
  ifsc_code TEXT,
  upi_id TEXT,
  kyc_status TEXT DEFAULT 'NOT_SUBMITTED',
  reviewed_by TEXT,
  reviewed_at TEXT,
  rejection_reason TEXT
);

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  associate_id TEXT NOT NULL REFERENCES users_associate(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  contact_person TEXT,
  contact_phone TEXT NOT NULL,
  business_category TEXT,
  service_required TEXT,
  notes TEXT,
  location TEXT,
  photo_url TEXT,
  lead_status TEXT DEFAULT 'SUBMITTED',
  assigned_to TEXT,
  estimated_value REAL DEFAULT 0,
  commission_amount REAL DEFAULT 0,
  submitted_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lead_history (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by TEXT,
  notes TEXT,
  timestamp TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS commission_ledger (
  id TEXT PRIMARY KEY,
  associate_id TEXT NOT NULL REFERENCES users_associate(id) ON DELETE CASCADE,
  lead_id TEXT REFERENCES leads(id) ON DELETE SET NULL,
  deal_value REAL NOT NULL,
  tier_at_close TEXT,
  base_percentage REAL NOT NULL,
  bonus_percentage REAL DEFAULT 0,
  commission_amount REAL NOT NULL,
  status TEXT DEFAULT 'PENDING',
  authorized_by TEXT,
  payout_id TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payouts (
  id TEXT PRIMARY KEY,
  associate_id TEXT NOT NULL REFERENCES users_associate(id) ON DELETE CASCADE,
  commission_ledger_ids TEXT,
  total_amount REAL NOT NULL,
  tds_deducted REAL DEFAULT 0,
  net_payout REAL NOT NULL,
  payment_method TEXT,
  bank_reference_utr TEXT,
  status TEXT DEFAULT 'PENDING',
  disbursed_at TEXT,
  receipt_voucher_no TEXT
);

CREATE TABLE IF NOT EXISTS broadcasts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'NORMAL',
  author TEXT,
  publish_date TEXT NOT NULL,
  active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS training_modules (
  id TEXT PRIMARY KEY,
  track TEXT NOT NULL,
  title TEXT NOT NULL,
  duration TEXT,
  format TEXT,
  url TEXT,
  questions_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT,
  actor_name TEXT,
  actor_role TEXT,
  action TEXT NOT NULL,
  target_entity TEXT,
  target_id TEXT,
  details TEXT,
  ip_address TEXT,
  timestamp TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS otp_requests (
  id TEXT PRIMARY KEY,
  mobile_number TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  attempts INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);

-- Indices for rapid querying
CREATE INDEX IF NOT EXISTS idx_leads_assoc ON leads(associate_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_comm_assoc ON commission_ledger(associate_id);
CREATE INDEX IF NOT EXISTS idx_payouts_assoc ON payouts(associate_id);
