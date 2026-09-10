/**
 * Dandora.online Associate Platform - SQLite Database Seeder
 * Populates realistic initial records for Hyderabad chapter
 */

const db = require('./db');

function seed() {
  console.log('🌱 Starting Dandora SQLite database seeding...');

  // 1. Roles
  const roles = [
    { id: 'role_super_admin', name: 'Super Admin', description: 'Unrestricted system control, role assignment, audit logs, and settings' },
    { id: 'role_ops_exec', name: 'Operations Executive', description: 'Lead validation, duplicate screening, strategist assignment, and status transitions' },
    { id: 'role_kyc_reviewer', name: 'KYC Reviewer', description: 'PAN, bank account, UPI, and identity document verification' },
    { id: 'role_finance_mgr', name: 'Finance Manager', description: 'Commission approval, ledger governance, and payout disbursement recording' },
    { id: 'role_content_mgr', name: 'Content Manager', description: 'Broadcast announcements and training academy curriculum management' },
    { id: 'role_associate', name: 'Associate Partner', description: 'Recruited field partner who submits leads, trains, and tracks commissions' }
  ];

  for (const r of roles) {
    db.run(
      `INSERT OR REPLACE INTO roles (id, name, description) VALUES (?, ?, ?)`,
      [r.id, r.name, r.description]
    );
  }

  // 2. Admin Users
  const adminUsers = [
    { id: 'adm_01', name: 'Arjun Reddy', email: 'arjun.reddy@dandora.online', role_id: 'role_super_admin', designation: 'Head of Operations & Strategy', active: 1 },
    { id: 'adm_02', name: 'Kavita Rao', email: 'kavita.rao@dandora.online', role_id: 'role_ops_exec', designation: 'Lead Verification Specialist', active: 1 },
    { id: 'adm_03', name: 'Srinivas Murthy', email: 'srinivas.m@dandora.online', role_id: 'role_kyc_reviewer', designation: 'Compliance & KYC Officer', active: 1 },
    { id: 'adm_04', name: 'Lakshmi V.', email: 'lakshmi.v@dandora.online', role_id: 'role_finance_mgr', designation: 'Treasury & Disbursements Lead', active: 1 },
    { id: 'adm_05', name: 'Nikhil Verma', email: 'nikhil.v@dandora.online', role_id: 'role_content_mgr', designation: 'Academy & Communications Manager', active: 1 }
  ];

  for (const u of adminUsers) {
    db.run(
      `INSERT OR REPLACE INTO admin_users (id, name, email, role_id, designation, active) VALUES (?, ?, ?, ?, ?, ?)`,
      [u.id, u.name, u.email, u.role_id, u.designation, u.active]
    );
  }

  // 3. Skills
  const skills = [
    { id: 'sk_bd_01', name: 'B2B Merchant Acquisition', category: 'Business Development', is_active: 1 },
    { id: 'sk_bd_02', name: 'Field Sales & Cold Calling', category: 'Business Development', is_active: 1 },
    { id: 'sk_bd_03', name: 'Client Account Management', category: 'Business Development', is_active: 1 },
    { id: 'sk_dm_01', name: 'Meta & Google Ads Optimization', category: 'Digital Marketing', is_active: 1 },
    { id: 'sk_dm_02', name: 'Local SEO & Google Business Profile', category: 'Digital Marketing', is_active: 1 },
    { id: 'sk_dm_03', name: 'WhatsApp & SMS Marketing Funnels', category: 'Digital Marketing', is_active: 1 },
    { id: 'sk_cr_01', name: 'Short-Form Reel & Video Production', category: 'Creative & Content', is_active: 1 },
    { id: 'sk_cr_02', name: 'Commercial Graphic Design & Banners', category: 'Creative & Content', is_active: 1 },
    { id: 'sk_cr_03', name: 'Content & Copywriting in Telugu/English', category: 'Creative & Content', is_active: 1 },
    { id: 'sk_tc_01', name: 'Shopify & WooCommerce Setup', category: 'Tech & Integration', is_active: 1 },
    { id: 'sk_tc_02', name: 'Payment Gateway Integration', category: 'Tech & Integration', is_active: 1 },
    { id: 'sk_tc_03', name: 'CRM & Automation Webhooks', category: 'Tech & Integration', is_active: 1 }
  ];

  for (const s of skills) {
    db.run(
      `INSERT OR REPLACE INTO skills (id, name, category, is_active) VALUES (?, ?, ?, ?)`,
      [s.id, s.name, s.category, s.is_active]
    );
  }

  // 4. Associates
  const associates = [
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

  for (const a of associates) {
    db.run(
      `INSERT OR REPLACE INTO users_associate (
        id, associate_code, full_name, mobile_number, email, date_of_birth, gender,
        status, profile_completion_percentage, current_tier, referred_by_associate_id,
        referral_code, mobile_verified_at, email_verified_at, last_login_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        a.id, a.associate_code, a.full_name, a.mobile_number, a.email, a.date_of_birth, a.gender,
        a.status, a.profile_completion_percentage, a.current_tier, a.referred_by_associate_id,
        a.referral_code, a.mobile_verified_at, a.email_verified_at, a.last_login_at, a.created_at, a.updated_at
      ]
    );
  }

  // 5. Profiles
  const profiles = [
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

  for (const p of profiles) {
    db.run(
      `INSERT OR REPLACE INTO profiles (
        associate_id, address_line, locality, city, state, pincode,
        highest_education, degree_specialization, institution_name, profile_segment,
        weekly_availability, portfolio_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.associate_id, p.address_line, p.locality, p.city, p.state, p.pincode,
        p.highest_education, p.degree_specialization, p.institution_name, p.profile_segment,
        p.weekly_availability, p.portfolio_url
      ]
    );
  }

  // 6. KYC & Payout
  const kycRecords = [
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

  for (const k of kycRecords) {
    db.run(
      `INSERT OR REPLACE INTO kyc_payout (
        associate_id, pan_last_four, pan_masked, aadhaar_last_four, aadhaar_document_url,
        pan_document_url, account_holder_name, bank_name, bank_account_masked, ifsc_code,
        upi_id, kyc_status, reviewed_by, reviewed_at, rejection_reason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        k.associate_id, k.pan_last_four, k.pan_masked, k.aadhaar_last_four, k.aadhaar_document_url,
        k.pan_document_url, k.account_holder_name, k.bank_name, k.bank_account_masked, k.ifsc_code,
        k.upi_id, k.kyc_status, k.reviewed_by, k.reviewed_at, k.rejection_reason
      ]
    );
  }

  // 7. Leads
  const leads = [
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

  for (const l of leads) {
    db.run(
      `INSERT OR REPLACE INTO leads (
        id, associate_id, business_name, contact_person, contact_phone,
        business_category, service_required, notes, location, photo_url,
        lead_status, assigned_to, estimated_value, commission_amount,
        submitted_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        l.id, l.associate_id, l.business_name, l.contact_person, l.contact_phone,
        l.business_category, l.service_required, l.notes, l.location, l.photo_url,
        l.lead_status, l.assigned_to, l.estimated_value, l.commission_amount,
        l.submitted_at, l.updated_at
      ]
    );
  }

  // 8. Commission Ledger & Payouts
  const ledgerEntries = [
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

  for (const c of ledgerEntries) {
    db.run(
      `INSERT OR REPLACE INTO commission_ledger (
        id, associate_id, lead_id, deal_value, tier_at_close,
        base_percentage, bonus_percentage, commission_amount,
        status, authorized_by, payout_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        c.id, c.associate_id, c.lead_id, c.deal_value, c.tier_at_close,
        c.base_percentage, c.bonus_percentage, c.commission_amount,
        c.status, c.authorized_by, c.payout_id, c.created_at
      ]
    );
  }

  const payouts = [
    {
      id: 'pay_01',
      associate_id: 'usr_assoc_1042',
      commission_ledger_ids: JSON.stringify(['comm_entry_01']),
      total_amount: 9750,
      tds_deducted: 487.50,
      net_payout: 9262.50,
      payment_method: 'IMPS_BANK_TRANSFER',
      bank_reference_utr: 'HDFC99210411',
      status: 'SUCCESS',
      disbursed_at: '2026-08-28T17:30:00Z',
      receipt_voucher_no: 'RCP-2026-7712'
    }
  ];

  for (const p of payouts) {
    db.run(
      `INSERT OR REPLACE INTO payouts (
        id, associate_id, commission_ledger_ids, total_amount,
        tds_deducted, net_payout, payment_method, bank_reference_utr,
        status, disbursed_at, receipt_voucher_no
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id, p.associate_id, p.commission_ledger_ids, p.total_amount,
        p.tds_deducted, p.net_payout, p.payment_method, p.bank_reference_utr,
        p.status, p.disbursed_at, p.receipt_voucher_no
      ]
    );
  }

  // 9. Broadcasts & Training
  const broadcasts = [
    {
      id: 'bc_01',
      title: '🚀 Q3 2026 High-Incentive Drive: Diagnostic Centers & Labs',
      content: 'Hyderabad chapter is offering an extra 2.5% incentive for all verified clinic or diagnostic center onboardings closed this month. Access the specialized healthcare pitch deck in the Academy tab.',
      priority: 'HIGH',
      author: 'Arjun Reddy',
      publish_date: '2026-09-08T09:00:00Z',
      active: 1
    },
    {
      id: 'bc_02',
      title: '⚡ Instant UPI Payout Testing Window',
      content: 'All associates with KYC_VERIFIED status can now experience 24-48 hr milestone clearance via direct UPI. Ensure your UPI VPA is verified in the Profile & Payout tab.',
      priority: 'NORMAL',
      author: 'Lakshmi V.',
      publish_date: '2026-09-05T14:30:00Z',
      active: 1
    }
  ];

  for (const b of broadcasts) {
    db.run(
      `INSERT OR REPLACE INTO broadcasts (id, title, content, priority, author, publish_date, active) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [b.id, b.title, b.content, b.priority, b.author, b.publish_date, b.active]
    );
  }

  const training = [
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

  for (const t of training) {
    db.run(
      `INSERT OR REPLACE INTO training_modules (id, track, title, duration, format, url, questions_count) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [t.id, t.track, t.title, t.duration, t.format, t.url, t.questions_count]
    );
  }

  console.log('✅ Dandora SQLite database seeded successfully!');
}

if (require.main === module) {
  seed();
}

module.exports = seed;
