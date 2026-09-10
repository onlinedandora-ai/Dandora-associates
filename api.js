/**
 * Dandora.online Associate Platform - RESTful Mock API Client (api.js)
 * Implements Section 7 API contracts, input validation, role permissions, and audit logging.
 */

(function (window) {
  'use strict';

  const DB = () => window.DandoraDB;

  // Active session keys
  const AUTH_KEY = 'dandora_active_session_v2';
  const ADMIN_ROLE_KEY = 'dandora_active_admin_role_v2';

  // Helper response wrapper
  const ok = (data, message = 'Success') => Promise.resolve({ success: true, status: 200, message, data });
  const error = (message = 'Bad Request', status = 400, details = null) => Promise.reject({ success: false, status, message, details });

  const DandoraAPI = {
    // ----------------------------------------------------
    // 1. Authentication Endpoints (Section 7.1)
    // ----------------------------------------------------
    auth: {
      sendOtp: async (mobileNumber) => {
        if (!mobileNumber || mobileNumber.length < 10) {
          return error('Please provide a valid 10-digit mobile number (+91).', 400);
        }

        // Clean number
        const cleanMobile = mobileNumber.startsWith('+91') ? mobileNumber : `+91${mobileNumber.replace(/\D/g, '').slice(-10)}`;
        const simulatedOtp = '123456';

        // Record OTP request
        const requestRecord = {
          id: 'otp_' + Date.now(),
          mobile_number: cleanMobile,
          otp_code: simulatedOtp,
          expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          attempts: 0,
          created_at: new Date().toISOString()
        };
        DB().insert('otp_requests', requestRecord);

        return ok({
          mobile: cleanMobile,
          expires_in_seconds: 300,
          simulated_otp_hint: '123456'
        }, `OTP sent successfully to ${cleanMobile}. (Demo code: 123456)`);
      },

      verifyOtp: async (mobileNumber, otpCode) => {
        if (!otpCode || otpCode.trim() !== '123456') {
          return error('Invalid verification code. Please enter 123456 for demo test.', 400);
        }

        const cleanMobile = mobileNumber.startsWith('+91') ? mobileNumber : `+91${mobileNumber.replace(/\D/g, '').slice(-10)}`;
        return ok({
          verified: true,
          mobile: cleanMobile,
          verified_at: new Date().toISOString()
        }, 'Mobile number verified successfully.');
      },

      login: async (identifier, password) => {
        // Find associate by mobile, email, or code
        const associates = DB().getTable('users_associate');
        const user = associates.find(a => 
          a.mobile_number === identifier || 
          a.email.toLowerCase() === identifier.toLowerCase() || 
          a.associate_code.toLowerCase() === identifier.toLowerCase()
        );

        if (!user) {
          return error('No associate found matching this identifier.', 404);
        }

        const session = {
          user_id: user.id,
          associate_code: user.associate_code,
          full_name: user.full_name,
          role: 'role_associate',
          logged_in_at: new Date().toISOString()
        };

        localStorage.setItem(AUTH_KEY, JSON.stringify(session));
        DB().update('users_associate', user.id, { last_login_at: new Date().toISOString() });

        return ok(session, `Welcome back, ${user.full_name}!`);
      },

      logout: async () => {
        localStorage.removeItem(AUTH_KEY);
        return ok(null, 'Logged out successfully.');
      },

      getCurrentSession: () => {
        try {
          const raw = localStorage.getItem(AUTH_KEY);
          if (raw) return JSON.parse(raw);
        } catch (e) {}
        // Default to Demo user Vikram Sharma (DAN-HYD-1042)
        return {
          user_id: 'usr_assoc_1042',
          associate_code: 'DAN-HYD-1042',
          full_name: 'Vikram Sharma',
          role: 'role_associate'
        };
      },

      setAdminRole: (roleId) => {
        localStorage.setItem(ADMIN_ROLE_KEY, roleId);
      },

      getCurrentAdminRole: () => {
        return localStorage.getItem(ADMIN_ROLE_KEY) || 'role_super_admin';
      }
    },

    // ----------------------------------------------------
    // 2. Associate Profile & Onboarding Endpoints (Section 7.2)
    // ----------------------------------------------------
    associates: {
      registerStep1: async (data) => {
        const { fullName, mobileNumber, email, referralCode } = data;
        if (!fullName || !mobileNumber || !email) {
          return error('Full name, mobile number, and email are required.', 400);
        }

        const cleanMobile = mobileNumber.startsWith('+91') ? mobileNumber : `+91${mobileNumber.replace(/\D/g, '').slice(-10)}`;

        // Generate unique Associate ID (e.g. DAN-HYD-1043)
        const allAssocs = DB().getTable('users_associate');
        const nextNum = 1040 + allAssocs.length + 1;
        const associateCode = `DAN-HYD-${nextNum}`;
        const newId = 'usr_assoc_' + nextNum;
        const refCode = fullName.split(' ')[0].toUpperCase() + nextNum;

        const newAssociate = {
          id: newId,
          associate_code: associateCode,
          full_name: fullName,
          mobile_number: cleanMobile,
          email: email,
          date_of_birth: '',
          gender: '',
          status: 'REGISTERED_LEAD',
          profile_completion_percentage: 25,
          current_tier: 'Scout',
          referred_by_associate_id: referralCode ? 'usr_assoc_1042' : null,
          referral_code: refCode,
          mobile_verified_at: new Date().toISOString(),
          email_verified_at: null,
          last_login_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        DB().insert('users_associate', newAssociate);

        // Initialize empty profile & kyc
        DB().insert('associate_profiles', {
          associate_id: newId,
          address_line: '',
          locality: '',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '',
          highest_education: '',
          degree_specialization: '',
          institution_name: '',
          profile_segment: 'Student',
          weekly_availability: '10-15 hours/week',
          portfolio_url: ''
        });

        DB().insert('associate_kyc_payout', {
          associate_id: newId,
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
        });

        // Auto login to active session
        localStorage.setItem(AUTH_KEY, JSON.stringify({
          user_id: newId,
          associate_code: associateCode,
          full_name: fullName,
          role: 'role_associate'
        }));

        DB().logAudit(newId, fullName, 'Associate', 'ASSOCIATE_REGISTERED', 'users_associate', newId, `Registered with code ${associateCode}`);

        return ok(newAssociate, `Account created! Your unique Associate ID is ${associateCode}.`);
      },

      getProfile: async (associateId = null) => {
        const id = associateId || DandoraAPI.auth.getCurrentSession().user_id;
        const user = DB().findById('users_associate', id);
        if (!user) return error('Associate not found', 404);

        const profile = DB().findById('associate_profiles', id, 'associate_id') || {};
        const kyc = DB().findById('associate_kyc_payout', id, 'associate_id') || {};
        const skills = DB().getTable('associate_skills').filter(s => s.associate_id === id);
        const masterSkills = DB().getTable('skills');

        const populatedSkills = skills.map(s => {
          const master = masterSkills.find(m => m.id === s.skill_id) || {};
          return { ...s, name: master.name, category: master.category };
        });

        return ok({
          user,
          profile,
          kyc,
          skills: populatedSkills,
          completion_percentage: DB().calculateCompletionPercentage(id)
        });
      },

      updateProfile: async (profileData, associateId = null) => {
        const id = associateId || DandoraAPI.auth.getCurrentSession().user_id;
        const updated = DB().update('associate_profiles', id, profileData, 'associate_id');
        
        // Recalculate status & completion
        const completion = DB().calculateCompletionPercentage(id);
        const userUpdates = { profile_completion_percentage: completion };
        if (completion >= 50) {
          userUpdates.status = 'PROFILE_INCOMPLETE';
        }
        if (completion >= 75) {
          userUpdates.status = 'PROFILE_COMPLETE';
        }
        DB().update('users_associate', id, userUpdates);

        return ok(updated, 'Profile details saved successfully.');
      },

      updateSkills: async (skillItems, associateId = null) => {
        const id = associateId || DandoraAPI.auth.getCurrentSession().user_id;
        
        // Remove existing
        const allAssocSkills = DB().getTable('associate_skills');
        const remaining = allAssocSkills.filter(s => s.associate_id !== id);
        DB().data.associate_skills = remaining;

        // Insert new ones
        skillItems.forEach(item => {
          DB().insert('associate_skills', {
            associate_id: id,
            skill_id: item.skill_id,
            experience_level: item.experience_level || 'Intermediate',
            verified: false,
            created_at: new Date().toISOString()
          });
        });

        const completion = DB().calculateCompletionPercentage(id);
        DB().update('users_associate', id, { profile_completion_percentage: completion });

        return ok(skillItems, 'Skills updated successfully.');
      },

      updateKYC: async (kycData, associateId = null) => {
        const id = associateId || DandoraAPI.auth.getCurrentSession().user_id;
        const { pan, upiId, accountHolderName, bankName, accountNumber, ifscCode, panDocUrl, aadhaarDocUrl } = kycData;

        const panClean = pan ? pan.toUpperCase().trim() : '';
        const panLastFour = panClean.slice(-4);
        const panMasked = panClean.length >= 10 ? `${panClean.slice(0, 5)}•••${panClean.slice(-1)}` : panClean;

        const accNumClean = accountNumber ? accountNumber.replace(/\D/g, '') : '';
        const accMasked = accNumClean ? `•••• •••• ${accNumClean.slice(-4)}` : '';

        const updates = {
          pan_last_four: panLastFour,
          pan_masked: panMasked,
          account_holder_name: accountHolderName || '',
          bank_name: bankName || 'Primary Bank',
          bank_account_masked: accMasked,
          ifsc_code: ifscCode ? ifscCode.toUpperCase().trim() : '',
          upi_id: upiId || '',
          pan_document_url: panDocUrl || 'docs/pan_sample_preview.pdf',
          aadhaar_document_url: aadhaarDocUrl || '',
          kyc_status: 'KYC_PENDING'
        };

        const updatedKYC = DB().update('associate_kyc_payout', id, updates, 'associate_id');
        
        // Update user status
        const completion = DB().calculateCompletionPercentage(id);
        DB().update('users_associate', id, {
          status: 'KYC_PENDING',
          profile_completion_percentage: completion
        });

        DB().logAudit(id, DandoraAPI.auth.getCurrentSession().full_name, 'Associate', 'KYC_SUBMITTED', 'associate_kyc_payout', id, `Submitted KYC for PAN ${panMasked}`);

        return ok(updatedKYC, 'KYC & Payout details submitted for administrative review.');
      },

      getDashboard: async (associateId = null) => {
        const id = associateId || DandoraAPI.auth.getCurrentSession().user_id;
        const user = DB().findById('users_associate', id);
        if (!user) return error('Associate not found', 404);

        const profile = DB().findById('associate_profiles', id, 'associate_id') || {};
        const kyc = DB().findById('associate_kyc_payout', id, 'associate_id') || {};
        const leads = DB().getTable('leads_submitted').filter(l => l.associate_id === id);
        const broadcasts = DB().getTable('broadcasts').filter(b => b.active);
        const commissionEntries = DB().getTable('commission_ledger').filter(c => c.associate_id === id);
        const payouts = DB().getTable('payouts').filter(p => p.associate_id === id);

        const totalLeads = leads.length;
        const wonLeads = leads.filter(l => l.lead_status === 'WON' || l.lead_status === 'COMMISSION_APPROVED' || l.lead_status === 'PAID').length;
        const activeLeads = leads.filter(l => !['WON', 'LOST', 'DUPLICATE', 'PAID'].includes(l.lead_status)).length;

        // Financials (adhering to Section 17 rules: no guaranteed income, distinct statuses)
        const pendingCommission = commissionEntries.filter(c => c.status === 'PENDING').reduce((acc, c) => acc + c.commission_amount, 0);
        const approvedCommission = commissionEntries.filter(c => c.status === 'APPROVED').reduce((acc, c) => acc + c.commission_amount, 0);
        const paidCommission = commissionEntries.filter(c => c.status === 'PAID').reduce((acc, c) => acc + c.commission_amount, 0);

        return ok({
          associate_id: user.associate_code,
          full_name: user.full_name,
          current_tier: user.current_tier,
          status: user.status,
          profile_completion_percentage: user.profile_completion_percentage,
          kyc_status: kyc.kyc_status || 'NOT_SUBMITTED',
          work_sharing_ready: user.status === 'ACTIVE' || (kyc.kyc_status === 'KYC_VERIFIED' && user.profile_completion_percentage >= 75),
          stats: {
            total_leads: totalLeads,
            active_leads: activeLeads,
            won_leads: wonLeads,
            pending_commission: pendingCommission,
            approved_commission: approvedCommission,
            paid_commission: paidCommission,
            total_earned: paidCommission
          },
          broadcasts: broadcasts.slice(0, 3),
          recent_leads: leads.slice(-5).reverse()
        });
      }
    },

    // ----------------------------------------------------
    // 3. Leads CRM Endpoints (Section 7.4)
    // ----------------------------------------------------
    leads: {
      submit: async (leadData, associateId = null) => {
        const id = associateId || DandoraAPI.auth.getCurrentSession().user_id;
        const { businessName, contactPerson, contactPhone, businessCategory, serviceRequired, notes, location, photoUrl } = leadData;

        if (!businessName || !contactPerson || !contactPhone) {
          return error('Business name, contact person, and phone number are required.', 400);
        }

        const cleanPhone = contactPhone.replace(/\D/g, '').slice(-10);

        // Section 10: Duplicate Detection Algorithm
        const existingLeads = DB().getTable('leads_submitted');
        const duplicateMatch = existingLeads.find(l => {
          const lPhone = l.contact_phone.replace(/\D/g, '').slice(-10);
          const lName = l.business_name.toLowerCase().trim();
          return (lPhone === cleanPhone || lName === businessName.toLowerCase().trim()) && l.lead_status !== 'LOST';
        });

        const initialStatus = duplicateMatch ? 'DUPLICATE' : 'SUBMITTED';
        const nextId = 'lead_hyd_' + (900 + existingLeads.length + 1);

        const newLead = {
          id: nextId,
          associate_id: id,
          business_name: businessName.trim(),
          contact_person: contactPerson.trim(),
          contact_phone: contactPhone.startsWith('+91') ? contactPhone : `+91${cleanPhone}`,
          business_category: businessCategory || 'Retail & Merchant',
          service_required: serviceRequired || 'Digital Showcase & Online Ordering',
          notes: notes || '',
          location: location || 'Hyderabad, Telangana',
          photo_url: photoUrl || '',
          lead_status: initialStatus,
          assigned_to: 'Unassigned',
          estimated_value: 40000,
          commission_amount: 4000, // Scout default 10%
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        DB().insert('leads_submitted', newLead);

        // Record history
        DB().insert('lead_status_history', {
          id: 'lh_' + Date.now(),
          lead_id: nextId,
          old_status: null,
          new_status: initialStatus,
          changed_by: id,
          notes: duplicateMatch ? `Flagged as duplicate of ${duplicateMatch.id} (${duplicateMatch.business_name})` : 'Lead submitted by partner',
          timestamp: new Date().toISOString()
        });

        if (duplicateMatch) {
          return ok(newLead, `Lead recorded, but flagged as POTENTIAL DUPLICATE of existing record #${duplicateMatch.id}. Our ops team will verify.`);
        }

        return ok(newLead, 'Lead submitted successfully! Verification call will be placed within 24 hours.');
      },

      getMyLeads: async (associateId = null) => {
        const id = associateId || DandoraAPI.auth.getCurrentSession().user_id;
        const leads = DB().getTable('leads_submitted').filter(l => l.associate_id === id);
        return ok(leads.reverse());
      },

      getLead: async (leadId) => {
        const lead = DB().findById('leads_submitted', leadId);
        if (!lead) return error('Lead not found', 404);
        const history = DB().getTable('lead_status_history').filter(h => h.lead_id === leadId);
        return ok({ lead, history });
      }
    },

    // ----------------------------------------------------
    // 4. Admin Console Endpoints (Section 7.5 & 10)
    // ----------------------------------------------------
    admin: {
      getAssociates: async (filters = {}) => {
        const associates = DB().getTable('users_associate');
        const profiles = DB().getTable('associate_profiles');
        const kycRecords = DB().getTable('associate_kyc_payout');
        const allSkills = DB().getTable('associate_skills');
        const masterSkills = DB().getTable('skills');

        let result = associates.map(a => {
          const prof = profiles.find(p => p.associate_id === a.id) || {};
          const kyc = kycRecords.find(k => k.associate_id === a.id) || {};
          const mySkills = allSkills.filter(s => s.associate_id === a.id).map(s => {
            const m = masterSkills.find(item => item.id === s.skill_id);
            return m ? m.name : '';
          }).filter(Boolean);

          return {
            ...a,
            locality: prof.locality,
            city: prof.city,
            profile_segment: prof.profile_segment,
            highest_education: prof.highest_education,
            weekly_availability: prof.weekly_availability,
            kyc_status: kyc.kyc_status || 'NOT_SUBMITTED',
            skills: mySkills
          };
        });

        // Apply filters
        if (filters.status) {
          result = result.filter(a => a.status === filters.status);
        }
        if (filters.kyc_status) {
          result = result.filter(a => a.kyc_status === filters.kyc_status);
        }
        if (filters.segment) {
          result = result.filter(a => a.profile_segment === filters.segment);
        }
        if (filters.query) {
          const q = filters.query.toLowerCase();
          result = result.filter(a => 
            a.full_name.toLowerCase().includes(q) || 
            a.associate_code.toLowerCase().includes(q) || 
            a.mobile_number.includes(q)
          );
        }

        return ok(result.reverse());
      },

      updateAssociateStatus: async (associateId, newStatus, adminUser = 'Arjun Reddy') => {
        const updated = DB().update('users_associate', associateId, { status: newStatus });
        DB().logAudit('adm_01', adminUser, 'Super Admin', 'ASSOCIATE_STATUS_UPDATE', 'users_associate', associateId, `Changed status to ${newStatus}`);
        return ok(updated, `Associate status updated to ${newStatus}.`);
      },

      getLeads: async (filters = {}) => {
        const leads = DB().getTable('leads_submitted');
        const associates = DB().getTable('users_associate');

        let result = leads.map(l => {
          const assoc = associates.find(a => a.id === l.associate_id);
          return {
            ...l,
            associate_code: assoc ? assoc.associate_code : 'N/A',
            associate_name: assoc ? assoc.full_name : 'N/A'
          };
        });

        if (filters.status) {
          result = result.filter(l => l.lead_status === filters.status);
        }
        if (filters.query) {
          const q = filters.query.toLowerCase();
          result = result.filter(l => 
            l.business_name.toLowerCase().includes(q) || 
            l.contact_phone.includes(q) || 
            l.contact_person.toLowerCase().includes(q)
          );
        }

        return ok(result.reverse());
      },

      updateLeadStatus: async (leadId, newStatus, strategist = null, dealValue = null, notes = '', adminName = 'Kavita Rao') => {
        const lead = DB().findById('leads_submitted', leadId);
        if (!lead) return error('Lead not found', 404);

        const oldStatus = lead.lead_status;
        const updates = { lead_status: newStatus };
        if (strategist) updates.assigned_to = strategist;
        if (dealValue !== null && dealValue !== undefined) {
          updates.estimated_value = Number(dealValue);
          // Calculate commission based on tier
          const assoc = DB().findById('users_associate', lead.associate_id);
          const tier = assoc ? assoc.current_tier : 'Scout';
          const rate = tier === 'Growth Partner' ? 0.20 : (tier === 'Consultant' ? 0.15 : 0.10);
          updates.commission_amount = Math.round(Number(dealValue) * rate);
        }

        const updatedLead = DB().update('leads_submitted', leadId, updates);

        // Record history
        DB().insert('lead_status_history', {
          id: 'lh_' + Date.now(),
          lead_id: leadId,
          old_status: oldStatus,
          new_status: newStatus,
          changed_by: 'admin',
          notes: notes || `Status updated to ${newStatus} by ${adminName}`,
          timestamp: new Date().toISOString()
        });

        // Trigger Commission Ledger if status advances to WON or COMMISSION_APPROVED
        if (newStatus === 'COMMISSION_APPROVED') {
          const existingComm = DB().getTable('commission_ledger').find(c => c.lead_id === leadId);
          if (!existingComm) {
            DB().insert('commission_ledger', {
              id: 'comm_entry_' + Date.now(),
              associate_id: lead.associate_id,
              lead_id: leadId,
              deal_value: updatedLead.estimated_value,
              tier_at_close: 'Consultant',
              base_percentage: 15,
              bonus_percentage: 0,
              commission_amount: updatedLead.commission_amount,
              status: 'APPROVED',
              authorized_by: adminName,
              payout_id: null,
              created_at: new Date().toISOString()
            });
          }
        }

        DB().logAudit('adm_ops', adminName, 'Operations Executive', 'LEAD_STATUS_UPDATE', 'leads_submitted', leadId, `Changed lead ${leadId} status from ${oldStatus} to ${newStatus}`);

        return ok(updatedLead, `Lead status advanced to ${newStatus}.`);
      },

      getKYCQueue: async () => {
        const kycList = DB().getTable('associate_kyc_payout');
        const associates = DB().getTable('users_associate');
        const profiles = DB().getTable('associate_profiles');

        const result = kycList.map(k => {
          const assoc = associates.find(a => a.id === k.associate_id);
          const prof = profiles.find(p => p.associate_id === k.associate_id);
          return {
            ...k,
            associate_code: assoc ? assoc.associate_code : 'N/A',
            full_name: assoc ? assoc.full_name : 'N/A',
            mobile_number: assoc ? assoc.mobile_number : 'N/A',
            city: prof ? prof.city : 'Hyderabad'
          };
        });

        return ok(result.reverse());
      },

      reviewKYC: async (associateId, decision, rejectionReason = null, reviewerNotes = '', adminName = 'Srinivas Murthy') => {
        const kycStatus = decision === 'APPROVE' ? 'KYC_VERIFIED' : (decision === 'REJECT' ? 'REJECTED' : 'RESUBMISSION_REQUESTED');
        
        const updates = {
          kyc_status: kycStatus,
          reviewed_by: 'adm_03',
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason
        };

        const updatedKYC = DB().update('associate_kyc_payout', associateId, updates, 'associate_id');
        
        // Update user status
        const userStatus = decision === 'APPROVE' ? 'ACTIVE' : (decision === 'REJECT' ? 'SUSPENDED' : 'KYC_PENDING');
        DB().update('users_associate', associateId, { status: userStatus });

        DB().logAudit('adm_03', adminName, 'KYC Reviewer', `KYC_${decision}`, 'associate_kyc_payout', associateId, `Decision: ${kycStatus}. Notes: ${reviewerNotes || 'Standard check passed'}`);

        return ok(updatedKYC, `KYC submission marked as ${kycStatus}.`);
      },

      getCommissionLedger: async () => {
        const ledger = DB().getTable('commission_ledger');
        const associates = DB().getTable('users_associate');
        const leads = DB().getTable('leads_submitted');

        const result = ledger.map(item => {
          const assoc = associates.find(a => a.id === item.associate_id);
          const lead = leads.find(l => l.id === item.lead_id);
          return {
            ...item,
            associate_code: assoc ? assoc.associate_code : 'N/A',
            associate_name: assoc ? assoc.full_name : 'N/A',
            business_name: lead ? lead.business_name : 'N/A'
          };
        });

        return ok(result.reverse());
      },

      recordPayout: async (commissionLedgerId, bankReferenceUtr, adminName = 'Lakshmi V.') => {
        const entry = DB().findById('commission_ledger', commissionLedgerId);
        if (!entry) return error('Commission entry not found', 404);

        const payoutId = 'pay_' + Date.now();
        const tds = entry.commission_amount * 0.05;
        const net = entry.commission_amount - tds;
        const voucherNo = `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

        const payoutRecord = {
          id: payoutId,
          associate_id: entry.associate_id,
          commission_ledger_ids: [commissionLedgerId],
          total_amount: entry.commission_amount,
          tds_deducted: tds,
          net_payout: net,
          payment_method: 'IMPS_BANK_TRANSFER',
          bank_reference_utr: bankReferenceUtr,
          status: 'SUCCESS',
          disbursed_at: new Date().toISOString(),
          receipt_voucher_no: voucherNo
        };

        DB().insert('payouts', payoutRecord);
        DB().update('commission_ledger', commissionLedgerId, { status: 'PAID', payout_id: payoutId });
        
        // Also update lead status to PAID
        if (entry.lead_id) {
          DB().update('leads_submitted', entry.lead_id, { lead_status: 'PAID' });
          DB().insert('lead_status_history', {
            id: 'lh_' + Date.now(),
            lead_id: entry.lead_id,
            old_status: 'COMMISSION_APPROVED',
            new_status: 'PAID',
            changed_by: adminName,
            notes: `Disbursed ₹${net} (UTR: ${bankReferenceUtr}, Voucher: ${voucherNo})`,
            timestamp: new Date().toISOString()
          });
        }

        DB().logAudit('adm_04', adminName, 'Finance Manager', 'PAYOUT_DISBURSED', 'payouts', payoutId, `Disbursed ₹${net} to associate (UTR: ${bankReferenceUtr})`);

        return ok(payoutRecord, `Payout disbursed successfully! Voucher #${voucherNo} generated.`);
      },

      createBroadcast: async (data, adminName = 'Nikhil Verma') => {
        const { title, content, priority } = data;
        const newBc = {
          id: 'bc_' + Date.now(),
          title,
          content,
          priority: priority || 'NORMAL',
          author: adminName,
          publish_date: new Date().toISOString(),
          active: true
        };
        DB().insert('broadcasts', newBc);
        DB().logAudit('adm_05', adminName, 'Content Manager', 'BROADCAST_CREATED', 'broadcasts', newBc.id, `Published announcement: ${title}`);
        return ok(newBc, 'Broadcast published to all associates.');
      },

      getAuditLogs: async () => {
        return ok(DB().getTable('audit_logs'));
      }
    }
  };

  window.DandoraAPI = DandoraAPI;
})(window);
