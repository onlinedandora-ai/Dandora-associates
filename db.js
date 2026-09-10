/**
 * Dandora.online Associate Platform - Relational Data Store (db.js)
 * Implements persistent schema, seed records, and relational query helpers.
 */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'dandora_relational_db_v2';

  // Master Skills List (Section 5.1)
  const DEFAULT_SKILLS = [
    { id: 'sk_bd_01', name: 'B2B Merchant Acquisition', category: 'Business Development', is_active: true },
    { id: 'sk_bd_02', name: 'Field Sales & Cold Calling', category: 'Business Development', is_active: true },
    { id: 'sk_bd_03', name: 'Client Account Management', category: 'Business Development', is_active: true },
    { id: 'sk_dm_01', name: 'Meta & Google Ads Optimization', category: 'Digital Marketing', is_active: true },
    { id: 'sk_dm_02', name: 'Local SEO & Google Business Profile', category: 'Digital Marketing', is_active: true },
    { id: 'sk_dm_03', name: 'WhatsApp & SMS Marketing Funnels', category: 'Digital Marketing', is_active: true },
    { id: 'sk_cr_01', name: 'Short-Form Reel & Video Production', category: 'Creative & Content', is_active: true },
    { id: 'sk_cr_02', name: 'Commercial Graphic Design & Banners', category: 'Creative & Content', is_active: true },
    { id: 'sk_cr_03', name: 'Content & Copywriting in Telugu/English', category: 'Creative & Content', is_active: true },
    { id: 'sk_tc_01', name: 'Shopify & WooCommerce Setup', category: 'Tech & Integration', is_active: true },
    { id: 'sk_tc_02', name: 'Payment Gateway Integration', category: 'Tech & Integration', is_active: true },
    { id: 'sk_tc_03', name: 'CRM & Automation Webhooks', category: 'Tech & Integration', is_active: true }
  ];

  // System Roles (Section 4)
  const DEFAULT_ROLES = [
    { id: 'role_super_admin', name: 'Super Admin', description: 'Unrestricted system control, role assignment, audit logs, and settings' },
    { id: 'role_ops_exec', name: 'Operations Executive', description: 'Lead validation, duplicate screening, strategist assignment, and status transitions' },
    { id: 'role_kyc_reviewer', name: 'KYC Reviewer', description: 'PAN, bank account, UPI, and identity document verification' },
    { id: 'role_finance_mgr', name: 'Finance Manager', description: 'Commission approval, ledger governance, and payout disbursement recording' },
    { id: 'role_content_mgr', name: 'Content Manager', description: 'Broadcast announcements and training academy curriculum management' },
    { id: 'role_associate', name: 'Associate Partner', description: 'Recruited field partner who submits leads, trains, and tracks commissions' }
  ];

  // Admin Users
  const DEFAULT_ADMIN_USERS = [
    { id: 'adm_01', name: 'Arjun Reddy', email: 'arjun.reddy@dandora.online', role_id: 'role_super_admin', designation: 'Head of Operations & Strategy', active: true },
    { id: 'adm_02', name: 'Kavita Rao', email: 'kavita.rao@dandora.online', role_id: 'role_ops_exec', designation: 'Lead Verification Specialist', active: true },
    { id: 'adm_03', name: 'Srinivas Murthy', email: 'srinivas.m@dandora.online', role_id: 'role_kyc_reviewer', designation: 'Compliance & KYC Officer', active: true },
    { id: 'adm_04', name: 'Lakshmi V.', email: 'lakshmi.v@dandora.online', role_id: 'role_finance_mgr', designation: 'Treasury & Disbursements Lead', active: true },
    { id: 'adm_05', name: 'Nikhil Verma', email: 'nikhil.v@dandora.online', role_id: 'role_content_mgr', designation: 'Academy & Communications Manager', active: true }
  ];

  // Seed Associates (Section 5.1 & 6)
  const DEFAULT_USERS_ASSOCIATE = [
    {
      id: 'usr_assoc_1042',
      associate_code: 'DAN-HYD-1042',
      full_name: 'Vikram Sharma',
      mobile_number: '+919849012345',
      email: 'vikram.sharma@example.com',
      date_of_birth: '1999-06-14',
      gender: 'Male',
      status: 'ACTIVE',
      profile_completion_percentage: 100,
      current_tier: 'Consultant',
      referred_by_associate_id: null,
      referral_code: 'VIKRAM1042',
      mobile_verified_at: '2026-08-01T10:15:00Z',
      email_verified_at: '2026-08-01T10:20:00Z',
      last_login_at: '2026-09-10T09:00:00Z',
      created_at: '2026-08-01T10:15:00Z',
      updated_at: '2026-09-08T14:30:00Z'
    },
    {
      id: 'usr_assoc_1088',
      associate_code: 'DAN-HYD-1088',
      full_name: 'Ananya Deshmukh',
      mobile_number: '+919701122334',
      email: 'ananya.d@example.com',
      date_of_birth: '2001-09-22',
      gender: 'Female',
      status: 'KYC_PENDING',
      profile_completion_percentage: 85,
      current_tier: 'Scout',
      referred_by_associate_id: 'usr_assoc_1042',
      referral_code: 'ANANYA1088',
      mobile_verified_at: '2026-08-25T11:00:00Z',
      email_verified_at: '2026-08-25T11:05:00Z',
      last_login_at: '2026-09-09T16:00:00Z',
      created_at: '2026-08-25T11:00:00Z',
      updated_at: '2026-09-09T16:00:00Z'
    },
    {
      id: 'usr_assoc_1105',
      associate_code: 'DAN-HYD-1105',
      full_name: 'Mohammed Riaz',
      mobile_number: '+919988776655',
      email: 'riaz.m@example.com',
      date_of_birth: '1996-03-10',
      gender: 'Male',
      status: 'PROFILE_INCOMPLETE',
      profile_completion_percentage: 45,
      current_tier: 'Scout',
      referred_by_associate_id: null,
      referral_code: 'RIAZ1105',
      mobile_verified_at: '2026-09-05T08:30:00Z',
      email_verified_at: null,
      last_login_at: '2026-09-05T08:30:00Z',
      created_at: '2026-09-05T08:30:00Z',
      updated_at: '2026-09-05T08:30:00Z'
    }
  ];

  const DEFAULT_PROFILES = [
    {
      associate_id: 'usr_assoc_1042',
      address_line: 'Plot 42, Hitech City Road',
      locality: 'Madhapur',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500081',
      highest_education: "Bachelor's Degree",
      degree_specialization: 'B.Tech in Computer Science',
      institution_name: 'JNTU Hyderabad',
      profile_segment: 'Working Professional',
      weekly_availability: '15-20 hours/week',
      portfolio_url: 'https://linkedin.com/in/vikram-sharma-demo'
    },
    {
      associate_id: 'usr_assoc_1088',
      address_line: 'Flat 302, Green View Apts',
      locality: 'Ameerpet',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500016',
      highest_education: 'Undergraduate Student',
      degree_specialization: 'B.Com Business Analytics',
      institution_name: 'Osmania University',
      profile_segment: 'Student',
      weekly_availability: '10-15 hours/week',
      portfolio_url: 'https://github.com/ananya-portfolio'
    },
    {
      associate_id: 'usr_assoc_1105',
      address_line: 'House 12-4-88',
      locality: 'Mehdipatnam',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500028',
      highest_education: 'Diploma',
      degree_specialization: 'Digital Design',
      institution_name: 'State Board of Technical Education',
      profile_segment: 'Freelancer',
      weekly_availability: '20+ hours/week',
      portfolio_url: ''
    }
  ];

  const DEFAULT_ASSOCIATE_SKILLS = [
    { associate_id: 'usr_assoc_1042', skill_id: 'sk_bd_01', experience_level: 'Advanced', verified: true },
    { associate_id: 'usr_assoc_1042', skill_id: 'sk_dm_01', experience_level: 'Intermediate', verified: true },
    { associate_id: 'usr_assoc_1042', skill_id: 'sk_tc_01', experience_level: 'Advanced', verified: true },
    { associate_id: 'usr_assoc_1088', skill_id: 'sk_cr_01', experience_level: 'Intermediate', verified: false },
    { associate_id: 'usr_assoc_1088', skill_id: 'sk_dm_03', experience_level: 'Beginner', verified: false },
    { associate_id: 'usr_assoc_1105', skill_id: 'sk_cr_02', experience_level: 'Intermediate', verified: false }
  ];

  const DEFAULT_KYC_PAYOUT = [
    {
      associate_id: 'usr_assoc_1042',
      pan_last_four: '9211',
      pan_masked: 'ABCDE9211F',
      aadhaar_last_four: '4589',
      aadhaar_document_url: 'docs/aadhaar_1042_verified.pdf',
      pan_document_url: 'docs/pan_1042_verified.pdf',
      account_holder_name: 'Vikram Sharma',
      bank_name: 'HDFC Bank',
      bank_account_masked: '•••• •••• 4412',
      ifsc_code: 'HDFC0001627',
      upi_id: 'vikram.sharma@okhdfcbank',
      kyc_status: 'KYC_VERIFIED',
      reviewed_by: 'adm_03',
      reviewed_at: '2026-08-02T16:00:00Z',
      rejection_reason: null
    },
    {
      associate_id: 'usr_assoc_1088',
      pan_last_four: '3418',
      pan_masked: 'BLAPD3418K',
      aadhaar_last_four: '7821',
      aadhaar_document_url: 'docs/aadhaar_1088_sample.jpg',
      pan_document_url: 'docs/pan_1088_sample.jpg',
      account_holder_name: 'Ananya Deshmukh',
      bank_name: 'State Bank of India',
      bank_account_masked: '•••• •••• 9012',
      ifsc_code: 'SBIN0004122',
      upi_id: 'ananya.deshmukh@oksbi',
      kyc_status: 'KYC_PENDING',
      reviewed_by: null,
      reviewed_at: null,
      rejection_reason: null
    },
    {
      associate_id: 'usr_assoc_1105',
      pan_last_four: '',
      pan_masked: '',
      aadhaar_last_four: '',
      aadhaar_document_url: '',
      pan_document_url: '',
      account_holder_name: '',
      bank_name: '',
      bank_account_masked: '',
      ifsc_code: '',
      upi_id: '',
      kyc_status: 'NOT_SUBMITTED',
      reviewed_by: null,
      reviewed_at: null,
      rejection_reason: null
    }
  ];

  // 12-Stage Leads Submitted (Section 5.1)
  const DEFAULT_LEADS = [
    {
      id: 'lead_hyd_901',
      associate_id: 'usr_assoc_1042',
      business_name: 'Banjara Spice Multi-Cuisine',
      contact_person: 'Rajesh Goud',
      contact_phone: '+919848123456',
      business_category: 'Restaurant & Dining',
      service_required: 'Online Ordering & Dine-In QR Ordering',
      notes: 'Busy restaurant with 40 tables, wants to eliminate third-party 30% aggregator commissions.',
      location: 'Road No. 12, Banjara Hills, Hyderabad',
      photo_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
      lead_status: 'PAID',
      assigned_to: 'Kavita Rao (Senior Strategist)',
      estimated_value: 65000,
      commission_amount: 9750,
      submitted_at: '2026-08-10T11:20:00Z',
      updated_at: '2026-08-28T17:30:00Z'
    },
    {
      id: 'lead_hyd_902',
      associate_id: 'usr_assoc_1042',
      business_name: 'Apollo Diagnostics Franchise',
      contact_person: 'Dr. Sailaja K.',
      contact_phone: '+919949887766',
      business_category: 'Healthcare & Wellness',
      service_required: 'Home Sample Booking Portal & WhatsApp Bot',
      notes: 'Looking for integrated test catalog and automated PDF report delivery on WhatsApp.',
      location: 'Kukatpally Phase 2, Hyderabad',
      photo_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600',
      lead_status: 'COMMISSION_APPROVED',
      assigned_to: 'Arjun Reddy',
      estimated_value: 85000,
      commission_amount: 12750,
      submitted_at: '2026-08-22T09:40:00Z',
      updated_at: '2026-09-08T12:15:00Z'
    },
    {
      id: 'lead_hyd_903',
      associate_id: 'usr_assoc_1042',
      business_name: 'Sri Laxmi Jewellers',
      contact_person: 'Venkatesh Rao',
      contact_phone: '+919440112233',
      business_category: 'Retail & Jewellery',
      service_required: 'Digital Gold Scheme & Catalog Showcase',
      notes: 'Customer base wants to pay monthly gold chit schemes online via UPI.',
      location: 'Pot Market, Secunderabad',
      photo_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600',
      lead_status: 'MEETING_SCHEDULED',
      assigned_to: 'Kavita Rao',
      estimated_value: 50000,
      commission_amount: 7500,
      submitted_at: '2026-09-04T15:00:00Z',
      updated_at: '2026-09-09T10:00:00Z'
    },
    {
      id: 'lead_hyd_904',
      associate_id: 'usr_assoc_1088',
      business_name: 'Urban Crust Artisanal Bakery',
      contact_person: 'Neha Saxena',
      contact_phone: '+919876543210',
      business_category: 'Bakery & Confectionery',
      service_required: 'E-commerce Pre-Order & Delivery System',
      notes: 'Custom birthday cake booking engine with calendar slot booking.',
      location: 'Jubilee Hills Check Post, Hyderabad',
      photo_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600',
      lead_status: 'CONTACT_VERIFIED',
      assigned_to: 'Kavita Rao',
      estimated_value: 35000,
      commission_amount: 3500,
      submitted_at: '2026-09-07T14:10:00Z',
      updated_at: '2026-09-08T16:00:00Z'
    },
    {
      id: 'lead_hyd_905',
      associate_id: 'usr_assoc_1088',
      business_name: 'Urban Crust Bakery Branch 2',
      contact_person: 'Neha Saxena',
      contact_phone: '+919876543210',
      business_category: 'Bakery & Confectionery',
      service_required: 'Duplicate Test Entry',
      notes: 'Submitted again by mistake with same mobile number.',
      location: 'Gachibowli, Hyderabad',
      photo_url: '',
      lead_status: 'DUPLICATE',
      assigned_to: 'Kavita Rao',
      estimated_value: 0,
      commission_amount: 0,
      submitted_at: '2026-09-07T14:20:00Z',
      updated_at: '2026-09-07T15:00:00Z'
    },
    {
      id: 'lead_hyd_906',
      associate_id: 'usr_assoc_1105',
      business_name: 'FitPulse Crossfit Studio',
      contact_person: 'Farhan Khan',
      contact_phone: '+919888123123',
      business_category: 'Fitness & Sports',
      service_required: 'Member Mobile App & QR Attendance',
      notes: 'Gym studio with 180 members looking to track monthly renewals.',
      location: 'Tolichowki Main Road, Hyderabad',
      photo_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',
      lead_status: 'SUBMITTED',
      assigned_to: 'Unassigned',
      estimated_value: 40000,
      commission_amount: 4000,
      submitted_at: '2026-09-09T18:00:00Z',
      updated_at: '2026-09-09T18:00:00Z'
    }
  ];

  // Lead Status History
  const DEFAULT_LEAD_HISTORY = [
    { id: 'lh_01', lead_id: 'lead_hyd_901', old_status: null, new_status: 'SUBMITTED', changed_by: 'usr_assoc_1042', notes: 'Lead initiated by Associate Vikram Sharma', timestamp: '2026-08-10T11:20:00Z' },
    { id: 'lh_02', lead_id: 'lead_hyd_901', old_status: 'SUBMITTED', new_status: 'CONTACT_VERIFIED', changed_by: 'adm_02', notes: 'Spoke with Mr. Rajesh Goud, confirmed interest', timestamp: '2026-08-11T14:00:00Z' },
    { id: 'lh_03', lead_id: 'lead_hyd_901', old_status: 'CONTACT_VERIFIED', new_status: 'MEETING_SCHEDULED', changed_by: 'adm_02', notes: 'In-person demo scheduled at Banjara Hills', timestamp: '2026-08-14T16:30:00Z' },
    { id: 'lh_04', lead_id: 'lead_hyd_901', old_status: 'MEETING_SCHEDULED', new_status: 'PROPOSAL_SENT', changed_by: 'adm_02', notes: 'Sent custom quotation for QR ordering suite', timestamp: '2026-08-18T10:00:00Z' },
    { id: 'lh_05', lead_id: 'lead_hyd_901', old_status: 'PROPOSAL_SENT', new_status: 'WON', changed_by: 'adm_02', notes: 'Contract signed. Advance payment of ₹65,000 received.', timestamp: '2026-08-23T11:00:00Z' },
    { id: 'lh_06', lead_id: 'lead_hyd_901', old_status: 'WON', new_status: 'COMMISSION_APPROVED', changed_by: 'adm_04', notes: '15% Consultant tier commission (₹9,750) approved by Finance', timestamp: '2026-08-25T12:00:00Z' },
    { id: 'lh_07', lead_id: 'lead_hyd_901', old_status: 'COMMISSION_APPROVED', new_status: 'PAID', changed_by: 'adm_04', notes: 'Disbursed via IMPS to HDFC Bank (UTR: #HDFC99210411)', timestamp: '2026-08-28T17:30:00Z' }
  ];

  // Commission Ledger & Payouts (Section 11)
  const DEFAULT_COMMISSION_LEDGER = [
    {
      id: 'comm_entry_01',
      associate_id: 'usr_assoc_1042',
      lead_id: 'lead_hyd_901',
      deal_value: 65000,
      tier_at_close: 'Consultant',
      base_percentage: 15,
      bonus_percentage: 0,
      commission_amount: 9750,
      status: 'PAID',
      authorized_by: 'adm_04',
      payout_id: 'pay_01',
      created_at: '2026-08-25T12:00:00Z'
    },
    {
      id: 'comm_entry_02',
      associate_id: 'usr_assoc_1042',
      lead_id: 'lead_hyd_902',
      deal_value: 85000,
      tier_at_close: 'Consultant',
      base_percentage: 15,
      bonus_percentage: 0,
      commission_amount: 12750,
      status: 'APPROVED',
      authorized_by: 'adm_04',
      payout_id: null,
      created_at: '2026-09-08T12:15:00Z'
    }
  ];

  const DEFAULT_PAYOUTS = [
    {
      id: 'pay_01',
      associate_id: 'usr_assoc_1042',
      commission_ledger_ids: ['comm_entry_01'],
      total_amount: 9750,
      tds_deducted: 487.50, // 5% Section 194H
      net_payout: 9262.50,
      payment_method: 'IMPS_BANK_TRANSFER',
      bank_reference_utr: 'HDFC99210411',
      status: 'SUCCESS',
      disbursed_at: '2026-08-28T17:30:00Z',
      receipt_voucher_no: 'RCP-2026-7712'
    }
  ];

  // Broadcasts (Section 5.1 & 9)
  const DEFAULT_BROADCASTS = [
    {
      id: 'bc_01',
      title: '🚀 Q3 2026 High-Incentive Drive: Diagnostic Centers & Labs',
      content: 'Hyderabad chapter is offering an extra 2.5% incentive for all verified clinic or diagnostic center onboardings closed this month. Access the specialized healthcare pitch deck in the Academy tab.',
      priority: 'HIGH',
      author: 'Arjun Reddy',
      publish_date: '2026-09-08T09:00:00Z',
      active: true
    },
    {
      id: 'bc_02',
      title: '⚡ Instant UPI Payout Testing Window',
      content: 'All associates with KYC_VERIFIED status can now experience 24-48 hr milestone clearance via direct UPI. Ensure your UPI VPA is verified in the Profile & Payout tab.',
      priority: 'NORMAL',
      author: 'Lakshmi V.',
      publish_date: '2026-09-05T14:30:00Z',
      active: true
    }
  ];

  // Training Modules
  const DEFAULT_TRAINING = [
    {
      id: 'tr_01',
      track: 'foundations',
      title: '3-Minute Elevator Pitch Mastery',
      duration: '4 mins',
      format: 'Video & Script Guide',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      questions_count: 3
    },
    {
      id: 'tr_02',
      track: 'restaurant',
      title: 'Overcoming Merchant Objections on 30% Swiggy/Zomato Cuts',
      duration: '6 mins',
      format: 'Interactive Case Study',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      questions_count: 4
    },
    {
      id: 'tr_03',
      track: 'healthcare',
      title: 'HIPAA & NABH Ready Clinic Appointment Workflows',
      duration: '5 mins',
      format: 'Technical Overview',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      questions_count: 4
    }
  ];

  // Audit Logs (Section 5.1 & 12)
  const DEFAULT_AUDIT_LOGS = [
    {
      id: 'audit_01',
      actor_id: 'adm_03',
      actor_name: 'Srinivas Murthy',
      actor_role: 'KYC Reviewer',
      action: 'KYC_APPROVED',
      target_entity: 'users_associate',
      target_id: 'usr_assoc_1042',
      details: 'Verified PAN ABCDE9211F and HDFC Bank account credentials',
      ip_address: '103.211.55.12',
      timestamp: '2026-08-02T16:00:00Z'
    },
    {
      id: 'audit_02',
      actor_id: 'adm_04',
      actor_name: 'Lakshmi V.',
      actor_role: 'Finance Manager',
      action: 'PAYOUT_DISBURSED',
      target_entity: 'payouts',
      target_id: 'pay_01',
      details: 'Authorized net payout of ₹9,262.50 to Vikram Sharma (UTR: HDFC99210411)',
      ip_address: '103.211.55.19',
      timestamp: '2026-08-28T17:30:00Z'
    },
    {
      id: 'audit_03',
      actor_id: 'adm_02',
      actor_name: 'Kavita Rao',
      actor_role: 'Operations Executive',
      action: 'LEAD_STATUS_TRANSITION',
      target_entity: 'leads_submitted',
      target_id: 'lead_hyd_902',
      details: 'Advanced Apollo Diagnostics Franchise to COMMISSION_APPROVED',
      ip_address: '103.211.55.14',
      timestamp: '2026-09-08T12:15:00Z'
    }
  ];

  class RelationalDB {
    constructor() {
      this.init();
    }

    init() {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        this.resetToDefaults();
      } else {
        try {
          this.data = JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse database, resetting...', e);
          this.resetToDefaults();
        }
      }
    }

    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      } catch (e) {
        console.error('Failed to save relational database to localStorage:', e);
      }
    }

    resetToDefaults() {
      this.data = {
        skills: JSON.parse(JSON.stringify(DEFAULT_SKILLS)),
        roles: JSON.parse(JSON.stringify(DEFAULT_ROLES)),
        admin_users: JSON.parse(JSON.stringify(DEFAULT_ADMIN_USERS)),
        users_associate: JSON.parse(JSON.stringify(DEFAULT_USERS_ASSOCIATE)),
        associate_profiles: JSON.parse(JSON.stringify(DEFAULT_PROFILES)),
        associate_skills: JSON.parse(JSON.stringify(DEFAULT_ASSOCIATE_SKILLS)),
        associate_kyc_payout: JSON.parse(JSON.stringify(DEFAULT_KYC_PAYOUT)),
        leads_submitted: JSON.parse(JSON.stringify(DEFAULT_LEADS)),
        lead_status_history: JSON.parse(JSON.stringify(DEFAULT_LEAD_HISTORY)),
        commission_ledger: JSON.parse(JSON.stringify(DEFAULT_COMMISSION_LEDGER)),
        payouts: JSON.parse(JSON.stringify(DEFAULT_PAYOUTS)),
        broadcasts: JSON.parse(JSON.stringify(DEFAULT_BROADCASTS)),
        training_modules: JSON.parse(JSON.stringify(DEFAULT_TRAINING)),
        audit_logs: JSON.parse(JSON.stringify(DEFAULT_AUDIT_LOGS)),
        otp_requests: []
      };
      this.save();
      console.log('Dandora Relational DB initialized with default seed records.');
    }

    getTable(tableName) {
      if (!this.data[tableName]) {
        this.data[tableName] = [];
      }
      return this.data[tableName];
    }

    findById(tableName, id, idField = 'id') {
      const table = this.getTable(tableName);
      return table.find(record => record[idField] === id) || null;
    }

    insert(tableName, record) {
      const table = this.getTable(tableName);
      table.push(record);
      this.save();
      return record;
    }

    update(tableName, id, updates, idField = 'id') {
      const table = this.getTable(tableName);
      const index = table.findIndex(record => record[idField] === id);
      if (index !== -1) {
        table[index] = { ...table[index], ...updates, updated_at: new Date().toISOString() };
        this.save();
        return table[index];
      }
      return null;
    }

    delete(tableName, id, idField = 'id') {
      const table = this.getTable(tableName);
      const index = table.findIndex(record => record[idField] === id);
      if (index !== -1) {
        const removed = table.splice(index, 1);
        this.save();
        return removed[0];
      }
      return null;
    }

    logAudit(actorId, actorName, actorRole, action, targetEntity, targetId, details) {
      const entry = {
        id: 'audit_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        actor_id: actorId,
        actor_name: actorName,
        actor_role: actorRole,
        action: action,
        target_entity: targetEntity,
        target_id: targetId,
        details: details,
        ip_address: '103.211.55.20',
        timestamp: new Date().toISOString()
      };
      this.getTable('audit_logs').unshift(entry);
      this.save();
      return entry;
    }

    // Helper: Calculate Profile Completion Percentage
    calculateCompletionPercentage(associateId) {
      let score = 25; // Step 1 (Account creation) is completed

      const profile = this.findById('associate_profiles', associateId, 'associate_id');
      if (profile && profile.city && profile.highest_education) {
        score += 25; // Step 2 (Profile & Location)
      }

      const skills = this.getTable('associate_skills').filter(s => s.associate_id === associateId);
      if (skills.length > 0) {
        score += 25; // Step 3 (Skills)
      }

      const kyc = this.findById('associate_kyc_payout', associateId, 'associate_id');
      if (kyc && (kyc.pan_last_four || kyc.upi_id)) {
        score += 25; // Step 4 (KYC & Payout)
      }

      return Math.min(100, score);
    }
  }

  window.DandoraDB = new RelationalDB();
})(window);
