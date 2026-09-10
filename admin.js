/**
 * Dandora.online Associate Platform - Multi-Role Admin Console (admin.js)
 * Implements RBAC, Associate Directory, 12-Stage Lead CRM, KYC Desk, Commission Ledger & Audit Logs.
 */

(function (window) {
  'use strict';

  const DB = () => window.DandoraDB;
  const API = () => window.DandoraAPI;

  const AdminApp = {
    currentTab: 'overview',
    currentRole: 'role_super_admin',
    selectedLeadId: null,
    selectedKycAssocId: null,
    pendingPayoutEntryId: null,

    init: () => {
      // Load saved role or default
      AdminApp.currentRole = API().auth.getCurrentAdminRole();
      const roleSelect = document.getElementById('adminRoleSelect');
      if (roleSelect) roleSelect.value = AdminApp.currentRole;

      AdminApp.updateRoleProfile();
      AdminApp.refreshAllData();
    },

    // ----------------------------------------------------
    // RBAC & Role Switching (Section 4)
    // ----------------------------------------------------
    switchRole: (roleId) => {
      AdminApp.currentRole = roleId;
      API().auth.setAdminRole(roleId);
      AdminApp.updateRoleProfile();

      // Route to most relevant tab for this role
      if (roleId === 'role_ops_exec') AdminApp.switchTab('leads');
      else if (roleId === 'role_kyc_reviewer') AdminApp.switchTab('kyc');
      else if (roleId === 'role_finance_mgr') AdminApp.switchTab('commissions');
      else if (roleId === 'role_content_mgr') AdminApp.switchTab('cms');
      else AdminApp.switchTab('overview');

      DB().logAudit('admin_session', AdminApp.getActorName(), AdminApp.getActorTitle(), 'ROLE_SWITCH', 'admin_users', roleId, `Switched active RBAC context to ${roleId}`);
    },

    getActorName: () => {
      switch (AdminApp.currentRole) {
        case 'role_ops_exec': return 'Kavita Rao';
        case 'role_kyc_reviewer': return 'Srinivas Murthy';
        case 'role_finance_mgr': return 'Lakshmi V.';
        case 'role_content_mgr': return 'Nikhil Verma';
        default: return 'Arjun Reddy';
      }
    },

    getActorTitle: () => {
      switch (AdminApp.currentRole) {
        case 'role_ops_exec': return 'Operations Executive';
        case 'role_kyc_reviewer': return 'KYC Reviewer';
        case 'role_finance_mgr': return 'Finance Manager';
        case 'role_content_mgr': return 'Content Manager';
        default: return 'Super Admin';
      }
    },

    updateRoleProfile: () => {
      const nameEl = document.getElementById('adminUserName');
      const roleEl = document.getElementById('adminUserRole');
      const pill = document.getElementById('adminUserPill');

      if (nameEl) nameEl.innerText = AdminApp.getActorName();
      if (roleEl) roleEl.innerText = AdminApp.getActorTitle();

      const initials = AdminApp.getActorName().split(' ').map(n => n[0]).join('');
      const avatar = pill?.querySelector('.avatar-sm');
      if (avatar) avatar.innerText = initials;
    },

    // ----------------------------------------------------
    // Navigation Tabs
    // ----------------------------------------------------
    switchTab: (tabName) => {
      AdminApp.currentTab = tabName;
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.sidebar-nav .nav-btn').forEach(b => b.classList.remove('active'));

      const targetPanel = document.getElementById(`tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
      if (targetPanel) targetPanel.classList.add('active');

      const targetBtn = document.querySelector(`.sidebar-nav .nav-btn[data-tab="${tabName}"]`);
      if (targetBtn) targetBtn.classList.add('active');

      // Refresh specific tab
      if (tabName === 'overview') AdminApp.renderOverview();
      else if (tabName === 'associates') AdminApp.renderAssociatesTable();
      else if (tabName === 'leads') AdminApp.renderLeadsTable();
      else if (tabName === 'kyc') AdminApp.renderKycQueue();
      else if (tabName === 'commissions') AdminApp.renderCommissionsTable();
      else if (tabName === 'cms') AdminApp.renderBulletins();
      else if (tabName === 'audit') AdminApp.renderAuditLogs();
    },

    refreshAllData: () => {
      AdminApp.renderOverview();
      AdminApp.renderAssociatesTable();
      AdminApp.renderLeadsTable();
      AdminApp.renderKycQueue();
      AdminApp.renderCommissionsTable();
      AdminApp.renderBulletins();
      AdminApp.renderAuditLogs();
      AdminApp.updateSidebarBadges();
    },

    updateSidebarBadges: () => {
      const assocs = DB().getTable('users_associate');
      const leads = DB().getTable('leads_submitted');
      const kycPending = DB().getTable('associate_kyc_payout').filter(k => k.kyc_status === 'KYC_PENDING');

      const bAssoc = document.getElementById('badgeAssocCount');
      if (bAssoc) bAssoc.innerText = assocs.length;

      const bLeads = document.getElementById('badgeLeadsCount');
      if (bLeads) bLeads.innerText = leads.length;

      const bKyc = document.getElementById('badgeKycCount');
      if (bKyc) bKyc.innerText = kycPending.length;
    },

    // ----------------------------------------------------
    // Tab 1: Overview Dashboard
    // ----------------------------------------------------
    renderOverview: () => {
      const assocs = DB().getTable('users_associate');
      const leads = DB().getTable('leads_submitted');
      const kycList = DB().getTable('associate_kyc_payout');
      const payouts = DB().getTable('payouts');

      const totalAssocs = assocs.length;
      const activeLeads = leads.filter(l => !['WON', 'LOST', 'DUPLICATE', 'PAID'].includes(l.lead_status)).length;
      const pendingKyc = kycList.filter(k => k.kyc_status === 'KYC_PENDING').length;
      const totalDisbursed = payouts.reduce((acc, p) => acc + (p.net_payout || 0), 0);

      document.getElementById('kpiTotalAssociates').innerText = totalAssocs;
      document.getElementById('kpiActiveLeads').innerText = activeLeads;
      document.getElementById('kpiPendingKyc').innerText = pendingKyc;
      document.getElementById('kpiDisbursedCommissions').innerText = '₹' + totalDisbursed.toLocaleString('en-IN');

      // 12-Stage Funnel bars
      const funnelContainer = document.getElementById('overviewFunnelBars');
      if (funnelContainer) {
        const stages = [
          'SUBMITTED', 'CONTACT_VERIFIED', 'ASSIGNED', 
          'MEETING_SCHEDULED', 'PROPOSAL_SENT', 'WON', 'PAID'
        ];
        funnelContainer.innerHTML = '';
        stages.forEach(stg => {
          const count = leads.filter(l => l.lead_status === stg).length;
          const pct = leads.length ? Math.round((count / leads.length) * 100) : 0;
          const bar = document.createElement('div');
          bar.className = 'funnel-bar-item';
          bar.innerHTML = `
            <span class="funnel-bar-label">${stg.replace('_', ' ')}</span>
            <div class="funnel-bar-track"><div class="funnel-bar-val" style="width:${Math.max(8, pct)}%"></div></div>
            <span class="funnel-bar-count">${count}</span>
          `;
          funnelContainer.appendChild(bar);
        });
      }

      // Recent audit stream
      const streamContainer = document.getElementById('overviewAuditStream');
      if (streamContainer) {
        const logs = DB().getTable('audit_logs').slice(0, 4);
        streamContainer.innerHTML = logs.map(l => `
          <div class="timeline-entry mb-2">
            <span class="time">${new Date(l.timestamp).toLocaleTimeString()} • ${l.actor_name} (${l.actor_role})</span>
            <span class="note"><strong>${l.action}:</strong> ${l.details}</span>
          </div>
        `).join('');
      }
    },

    // ----------------------------------------------------
    // Tab 2: Associate Directory
    // ----------------------------------------------------
    renderAssociatesTable: async () => {
      const filters = {
        query: document.getElementById('assocSearchInput')?.value || '',
        status: document.getElementById('assocStatusFilter')?.value || '',
        kyc_status: document.getElementById('assocKycFilter')?.value || '',
        segment: document.getElementById('assocSegmentFilter')?.value || ''
      };

      const res = await API().admin.getAssociates(filters);
      const associates = res.data;
      const tbody = document.getElementById('associatesTableBody');
      if (!tbody) return;

      tbody.innerHTML = associates.map(a => {
        let statusClass = 'status-incomplete';
        if (a.status === 'ACTIVE') statusClass = 'status-active';
        else if (a.status === 'KYC_PENDING') statusClass = 'status-pending';

        let kycClass = 'status-incomplete';
        if (a.kyc_status === 'KYC_VERIFIED') kycClass = 'status-active';
        else if (a.kyc_status === 'KYC_PENDING') kycClass = 'status-pending';

        return `
          <tr>
            <td><strong style="color:#00e5ff;">${a.associate_code}</strong></td>
            <td>
              <strong>${a.full_name}</strong>
              <br><small style="color:#64748b;">${a.email}</small>
            </td>
            <td>${a.mobile_number}</td>
            <td>${a.locality || 'N/A'}, ${a.city || 'Hyderabad'}</td>
            <td><span class="badge-tag">${a.profile_segment || 'Partner'}</span></td>
            <td><strong>${a.current_tier}</strong></td>
            <td><span class="status-pill ${kycClass}">${a.kyc_status}</span></td>
            <td><span class="status-pill ${statusClass}">${a.status}</span></td>
            <td>
              <button class="btn btn-sm btn-outline" onclick="AdminApp.toggleAssociateStatus('${a.id}', '${a.status}')">
                ${a.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
              </button>
            </td>
          </tr>
        `;
      }).join('');
    },

    filterAssociates: () => {
      AdminApp.renderAssociatesTable();
    },

    toggleAssociateStatus: async (assocId, currentStatus) => {
      const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      if (confirm(`Change status of associate to ${newStatus}?`)) {
        await API().admin.updateAssociateStatus(assocId, newStatus, AdminApp.getActorName());
        AdminApp.renderAssociatesTable();
      }
    },

    // ----------------------------------------------------
    // Tab 3: Lead CRM & 12-Stage Pipeline (Section 10.2)
    // ----------------------------------------------------
    renderLeadsTable: async () => {
      const filters = {
        query: document.getElementById('leadSearchInput')?.value || '',
        status: document.getElementById('leadStatusFilter')?.value || ''
      };

      const res = await API().admin.getLeads(filters);
      const leads = res.data;
      const tbody = document.getElementById('leadsTableBody');
      if (!tbody) return;

      tbody.innerHTML = leads.map(l => {
        let pillClass = 'status-submitted';
        if (l.lead_status === 'DUPLICATE') pillClass = 'status-duplicate';
        else if (l.lead_status === 'CONTACT_VERIFIED') pillClass = 'status-verified';
        else if (l.lead_status === 'MEETING_SCHEDULED') pillClass = 'status-meeting';
        else if (l.lead_status === 'WON') pillClass = 'status-won';
        else if (l.lead_status === 'COMMISSION_APPROVED') pillClass = 'status-approved';
        else if (l.lead_status === 'PAID') pillClass = 'status-paid';
        else if (l.lead_status === 'LOST') pillClass = 'status-lost';

        const isDuplicate = l.lead_status === 'DUPLICATE';

        return `
          <tr style="${isDuplicate ? 'background: rgba(239, 68, 68, 0.05);' : ''}">
            <td><strong style="color:#00e5ff;">#${l.id}</strong></td>
            <td>
              <strong>${l.business_name}</strong>
              ${isDuplicate ? '<span class="status-pill status-duplicate" style="font-size:0.65rem; margin-left:0.4rem;">FLAGGED DUPLICATE</span>' : ''}
              <br><small style="color:#64748b;">${l.business_category}</small>
            </td>
            <td>
              ${l.contact_person}
              <br><small style="color:#94a3b8;">${l.contact_phone}</small>
            </td>
            <td><span class="badge-tag">${l.associate_code}</span></td>
            <td><span class="status-pill ${pillClass}">${l.lead_status}</span></td>
            <td><small>${l.assigned_to || 'Unassigned'}</small></td>
            <td>₹${(l.estimated_value || 0).toLocaleString('en-IN')}</td>
            <td><strong style="color:#10b981;">₹${(l.commission_amount || 0).toLocaleString('en-IN')}</strong></td>
            <td>
              <button class="btn btn-sm btn-primary" onclick="AdminApp.openLeadDrawer('${l.id}')">
                Inspect / Action &rarr;
              </button>
            </td>
          </tr>
        `;
      }).join('');
    },

    filterLeads: () => {
      AdminApp.renderLeadsTable();
    },

    openLeadDrawer: async (leadId) => {
      AdminApp.selectedLeadId = leadId;
      const res = await API().leads.getLead(leadId);
      const { lead, history } = res.data;

      document.getElementById('drawerLeadId').innerText = `LEAD #${lead.id}`;
      document.getElementById('drawerLeadTitle').innerText = lead.business_name;
      document.getElementById('drawerLeadStatus').value = lead.lead_status;
      document.getElementById('drawerLeadStrategist').value = lead.assigned_to || 'Unassigned';
      document.getElementById('drawerDealValue').value = lead.estimated_value || 40000;
      document.getElementById('drawerNotes').value = '';

      AdminApp.recalcDrawerCommission();

      // Render timeline
      const timelineBox = document.getElementById('drawerTimeline');
      if (timelineBox) {
        timelineBox.innerHTML = history.map(h => `
          <div class="timeline-entry">
            <span class="time">${new Date(h.timestamp).toLocaleString()} • ${h.changed_by}</span>
            <span class="note"><strong>${h.new_status}:</strong> ${h.notes}</span>
          </div>
        `).join('');
      }

      document.getElementById('leadDrawer').classList.add('active');
    },

    closeLeadDrawer: () => {
      document.getElementById('leadDrawer').classList.remove('active');
      AdminApp.selectedLeadId = null;
    },

    recalcDrawerCommission: () => {
      const val = Number(document.getElementById('drawerDealValue').value) || 0;
      // Default 15% consultant rate for demo
      const comm = Math.round(val * 0.15);
      document.getElementById('drawerCommissionPreview').innerText = `₹${comm.toLocaleString('en-IN')} (15% Consultant Tier)`;
    },

    handleDrawerStatusChange: (status) => {
      // Helpful suggestion if advancing to WON
      if (status === 'WON' || status === 'COMMISSION_APPROVED') {
        const notes = document.getElementById('drawerNotes');
        if (!notes.value) {
          notes.value = 'Client agreement executed. Client payment received. Advancing to commission approval.';
        }
      }
    },

    saveLeadDrawer: async () => {
      if (!AdminApp.selectedLeadId) return;

      const newStatus = document.getElementById('drawerLeadStatus').value;
      const strategist = document.getElementById('drawerLeadStrategist').value;
      const dealValue = document.getElementById('drawerDealValue').value;
      const notes = document.getElementById('drawerNotes').value.trim();

      await API().admin.updateLeadStatus(
        AdminApp.selectedLeadId,
        newStatus,
        strategist,
        dealValue,
        notes,
        AdminApp.getActorName()
      );

      AdminApp.closeLeadDrawer();
      AdminApp.refreshAllData();
      alert(`✓ Lead #${AdminApp.selectedLeadId} updated to ${newStatus}`);
    },

    // ----------------------------------------------------
    // Tab 4: KYC Verification Desk (Section 10.3)
    // ----------------------------------------------------
    renderKycQueue: async () => {
      const res = await API().admin.getKYCQueue();
      const list = res.data;
      const container = document.getElementById('kycQueueList');
      if (!container) return;

      const pending = list.filter(k => k.kyc_status === 'KYC_PENDING');
      document.getElementById('kycQueueCount').innerText = `${pending.length} Pending Review`;

      container.innerHTML = list.map(item => `
        <div class="kyc-item ${AdminApp.selectedKycAssocId === item.associate_id ? 'selected' : ''}" onclick="AdminApp.inspectKyc('${item.associate_id}')">
          <div class="kyc-item-head">
            <strong>${item.full_name}</strong>
            <span class="kyc-item-code">${item.associate_code}</span>
          </div>
          <div class="kyc-item-details">
            PAN: <strong>${item.pan_masked || 'Not provided'}</strong> • ${item.city}
          </div>
          <div class="mt-1">
            <span class="status-pill ${item.kyc_status === 'KYC_VERIFIED' ? 'status-active' : (item.kyc_status === 'KYC_PENDING' ? 'status-pending' : 'status-lost')}">${item.kyc_status}</span>
          </div>
        </div>
      `).join('');

      // Auto inspect first pending if none selected
      if (!AdminApp.selectedKycAssocId && pending.length > 0) {
        AdminApp.inspectKyc(pending[0].associate_id);
      }
    },

    inspectKyc: (assocId) => {
      AdminApp.selectedKycAssocId = assocId;
      document.querySelectorAll('.kyc-item').forEach(i => i.classList.remove('selected'));

      const kyc = DB().findById('associate_kyc_payout', assocId, 'associate_id');
      const assoc = DB().findById('users_associate', assocId);
      const prof = DB().findById('associate_profiles', assocId, 'associate_id');
      const badge = document.getElementById('inspectKycBadge');
      const body = document.getElementById('inspectionBody');

      if (!kyc || !assoc) return;

      badge.innerText = `${assoc.associate_code} • ${kyc.kyc_status}`;
      badge.className = `status-pill ${kyc.kyc_status === 'KYC_VERIFIED' ? 'status-active' : (kyc.kyc_status === 'KYC_PENDING' ? 'status-pending' : 'status-lost')}`;

      body.innerHTML = `
        <div class="inspection-doc-box">
          <span class="doc-preview-badge">🔍 PAN & Banking Verification Dossier</span>
          <div class="doc-info-grid">
            <div class="doc-item">
              <span>Legal Name (as on PAN):</span>
              <strong>${assoc.full_name}</strong>
            </div>
            <div class="doc-item">
              <span>Permanent Account Number (PAN):</span>
              <strong style="color:#00e5ff; font-family:'Space Grotesk', monospace;">${kyc.pan_masked || 'NOT SUBMITTED'}</strong>
            </div>
            <div class="doc-item">
              <span>Primary UPI VPA:</span>
              <strong>${kyc.upi_id || 'Not set'}</strong>
            </div>
            <div class="doc-item">
              <span>Bank Name & Branch:</span>
              <strong>${kyc.bank_name || 'HDFC Bank'}</strong>
            </div>
            <div class="doc-item">
              <span>Masked Account Number:</span>
              <strong>${kyc.bank_account_masked || '•••• •••• 4412'}</strong>
            </div>
            <div class="doc-item">
              <span>Bank IFSC Code:</span>
              <strong style="font-family:monospace;">${kyc.ifsc_code || 'HDFC0001627'}</strong>
            </div>
          </div>
        </div>

        <div class="uploaded-doc-preview p-3 mb-3" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px;">
          <div class="flex items-center gap-3">
            <span style="font-size:1.5rem;">📄</span>
            <div>
              <strong style="display:block; color:#ffffff;">PAN_Card_Encrypted_Copy.pdf</strong>
              <small style="color:#64748b;">Uploaded by partner on registration • SHA-256 verified</small>
            </div>
            <button class="btn btn-sm btn-outline ml-auto" onclick="alert('Viewing decrypted document preview.')">View Document</button>
          </div>
        </div>

        <div class="form-group mb-3">
          <label>Reviewer Verification Notes:</label>
          <textarea id="kycReviewerNotes" rows="2" placeholder="Record verification remarks (e.g. Verified against NSDL PAN registry)"></textarea>
        </div>

        <div class="inspection-actions">
          <button class="btn btn-sm btn-approve" onclick="AdminApp.submitKycDecision('APPROVE')">
            ✓ Approve KYC (Verify Partner)
          </button>
          <button class="btn btn-sm btn-resubmit" onclick="AdminApp.submitKycDecision('RESUBMIT')">
            ⚠️ Request Resubmission
          </button>
          <button class="btn btn-sm btn-reject" onclick="AdminApp.submitKycDecision('REJECT')">
            ✕ Reject Submission
          </button>
        </div>
      `;
    },

    submitKycDecision: async (decision) => {
      if (!AdminApp.selectedKycAssocId) return;

      const notes = document.getElementById('kycReviewerNotes')?.value.trim() || 'Verified by compliance reviewer';
      let reason = null;

      if (decision === 'REJECT') {
        reason = prompt('Enter rejection reason for partner notification:', 'PAN name does not match legal name');
        if (!reason) return;
      } else if (decision === 'RESUBMIT') {
        reason = prompt('Enter resubmission instructions:', 'Uploaded image is blurry, please re-upload clear photo of PAN card');
        if (!reason) return;
      }

      await API().admin.reviewKYC(
        AdminApp.selectedKycAssocId,
        decision,
        reason,
        notes,
        AdminApp.getActorName()
      );

      AdminApp.refreshAllData();
      alert(`✓ KYC decision recorded: ${decision}`);
    },

    // ----------------------------------------------------
    // Tab 5: Commissions & Financial Ledger (Section 11)
    // ----------------------------------------------------
    renderCommissionsTable: async () => {
      const res = await API().admin.getCommissionLedger();
      const entries = res.data;
      const tbody = document.getElementById('commissionsTableBody');
      if (!tbody) return;

      const approvedPending = entries.filter(e => e.status === 'APPROVED');
      const totalPending = approvedPending.reduce((a, b) => a + b.commission_amount, 0);
      const paid = entries.filter(e => e.status === 'PAID');
      const totalPaid = paid.reduce((a, b) => a + b.commission_amount, 0);

      document.getElementById('commPendingPayoutTotal').innerText = '₹' + totalPending.toLocaleString('en-IN');
      document.getElementById('commTotalPaid').innerText = '₹' + totalPaid.toLocaleString('en-IN');

      tbody.innerHTML = entries.map(e => `
        <tr>
          <td><strong style="color:#00e5ff;">#${e.id}</strong></td>
          <td>
            <strong>${e.associate_name}</strong>
            <br><small style="color:#94a3b8;">${e.associate_code}</small>
          </td>
          <td>
            <strong>${e.business_name}</strong>
            <br><small style="color:#64748b;">Deal #${e.lead_id}</small>
          </td>
          <td>₹${e.deal_value.toLocaleString('en-IN')}</td>
          <td><span class="badge-tag">${e.base_percentage}% (${e.tier_at_close})</span></td>
          <td><strong style="color:#10b981;">₹${e.commission_amount.toLocaleString('en-IN')}</strong></td>
          <td>
            <span class="status-pill ${e.status === 'PAID' ? 'status-paid' : 'status-approved'}">${e.status}</span>
          </td>
          <td><small>${e.authorized_by || 'Finance Lead'}</small></td>
          <td>
            ${e.status === 'APPROVED' ? `
              <button class="btn btn-sm btn-primary" onclick="AdminApp.openPayoutModal('${e.id}', ${e.commission_amount})">
                Disburse Payout &rarr;
              </button>
            ` : `
              <span style="color:#22d3ee; font-size:0.8rem; font-weight:700;">✓ Disbursed</span>
            `}
          </td>
        </tr>
      `).join('');
    },

    openPayoutModal: (entryId, grossAmount) => {
      AdminApp.pendingPayoutEntryId = entryId;
      const tds = grossAmount * 0.05;
      const net = grossAmount - tds;

      document.getElementById('payoutGross').innerText = `₹${grossAmount.toLocaleString('en-IN')}`;
      document.getElementById('payoutTds').innerText = `-₹${tds.toLocaleString('en-IN')}`;
      document.getElementById('payoutNet').innerText = `₹${net.toLocaleString('en-IN')}`;
      document.getElementById('bankUtrInput').value = `HDFC${Math.floor(10000000 + Math.random() * 90000000)}`;

      document.getElementById('payoutModal').classList.add('active');
    },

    submitPayoutRecord: async () => {
      if (!AdminApp.pendingPayoutEntryId) return;

      const utr = document.getElementById('bankUtrInput').value.trim();
      if (!utr) {
        alert('Please enter Bank UTR / Reference number.');
        return;
      }

      await API().admin.recordPayout(
        AdminApp.pendingPayoutEntryId,
        utr,
        AdminApp.getActorName()
      );

      document.getElementById('payoutModal').classList.remove('active');
      AdminApp.refreshAllData();
      alert(`✓ Milestone payout disbursed! UTR: ${utr}`);
    },

    // ----------------------------------------------------
    // Tab 6: Broadcasts CMS
    // ----------------------------------------------------
    renderBulletins: () => {
      const broadcasts = DB().getTable('broadcasts');
      const container = document.getElementById('bulletinsContainer');
      if (!container) return;

      container.innerHTML = broadcasts.map(b => `
        <div class="bulletin-item p-3 mb-2" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:10px;">
          <div class="flex justify-between items-center mb-1">
            <strong>${b.title}</strong>
            <span class="status-pill ${b.priority === 'HIGH' ? 'status-duplicate' : 'status-submitted'}">${b.priority}</span>
          </div>
          <p style="font-size:0.85rem; color:#cbd5e1; margin:0 0 0.5rem;">${b.content}</p>
          <small style="color:#64748b;">Published by ${b.author} on ${new Date(b.publish_date).toLocaleDateString()}</small>
        </div>
      `).join('');
    },

    handlePublishBroadcast: async (e) => {
      e.preventDefault();
      const title = document.getElementById('bcTitle').value.trim();
      const priority = document.getElementById('bcPriority').value;
      const content = document.getElementById('bcContent').value.trim();

      await API().admin.createBroadcast({ title, priority, content }, AdminApp.getActorName());
      document.getElementById('bcTitle').value = '';
      document.getElementById('bcContent').value = '';

      AdminApp.renderBulletins();
      alert('✓ Chapter announcement published.');
    },

    // ----------------------------------------------------
    // Tab 7: Audit Logs (Section 12)
    // ----------------------------------------------------
    renderAuditLogs: async () => {
      const res = await API().admin.getAuditLogs();
      const logs = res.data;
      const tbody = document.getElementById('auditLogsTableBody');
      if (!tbody) return;

      tbody.innerHTML = logs.map(l => `
        <tr>
          <td><small style="color:#94a3b8;">${new Date(l.timestamp).toLocaleString()}</small></td>
          <td><strong>${l.actor_name}</strong></td>
          <td><span class="badge-tag">${l.actor_role}</span></td>
          <td><strong style="color:#00e5ff;">${l.action}</strong></td>
          <td>${l.target_entity}</td>
          <td><code>${l.target_id}</code></td>
          <td><small>${l.details}</small></td>
        </tr>
      `).join('');
    },

    exportAuditCSV: () => {
      const logs = DB().getTable('audit_logs');
      let csv = 'Timestamp,Actor,Role,Action,Entity,TargetId,Details\n';
      logs.forEach(l => {
        csv += `"${l.timestamp}","${l.actor_name}","${l.actor_role}","${l.action}","${l.target_entity}","${l.target_id}","${l.details.replace(/"/g, '""')}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dandora_audit_logs_${Date.now()}.csv`;
      a.click();
    }
  };

  window.AdminApp = AdminApp;
  document.addEventListener('DOMContentLoaded', AdminApp.init);
})(window);
