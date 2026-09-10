/**
 * Dandora.online Associate Portal - Client-side Business Logic
 * Reference: DANDORA-OPS-ASSOC-V2
 */

const PORTAL_STATE = {
  currentView: 'dashboardView',
  isTableView: false,
  associate: null,
  leads: [
    {
      id: 'TKT-101',
      bizName: 'Meenakshi Jewellers (Abids)',
      contact: 'Ramesh Reddy',
      phone: '9848022334',
      category: 'Retail / Boutique',
      need: 'E-Commerce & Catalog',
      status: 'meeting',
      statusText: 'Meeting Scheduled',
      amount: 45000,
      payout: 6750
    },
    {
      id: 'TKT-102',
      bizName: 'Dr. Ananya Dental Speciality',
      contact: 'Dr. Ananya Rao',
      phone: '9989012345',
      category: 'Healthcare / Clinic',
      need: 'Custom Web App / ERP',
      status: 'won',
      statusText: 'Deal Won',
      amount: 65000,
      payout: 9750
    },
    {
      id: 'TKT-103',
      bizName: 'Urban Craft Brewery (Jubilee Hills)',
      contact: 'Sandeep V.',
      phone: '9700112233',
      category: 'Restaurant / Cafe',
      need: 'Website & Branding',
      status: 'paid',
      statusText: 'Paid to Bank',
      amount: 120000,
      payout: 18000
    },
    {
      id: 'TKT-104',
      bizName: 'Sri Balaji Coaching Institute',
      contact: 'Balaji K.',
      phone: '9849123456',
      category: 'Corporate / Enterprise',
      need: 'Website & Branding',
      status: 'assigned',
      statusText: 'Strategist Assigned',
      amount: 55000,
      payout: 8250
    }
  ],
  quizCurrentQ: 0,
  quizScore: 0
};

const PORTAL_LESSONS = [
  {
    title: 'Spotting Unserved Local Businesses in Hyderabad',
    duration: '3:15 mins',
    desc: 'Target commercial clusters in Kukatpally, Madhapur, and Dilsukhnagar lacking Google profiles or online order portals.'
  },
  {
    title: 'Pitching Dandora Smart QR Menus to Restaurants',
    duration: '2:50 mins',
    desc: 'How to show restaurant managers how they save ₹30,000+ every month by bypassing food delivery app fees.'
  },
  {
    title: 'Clinic Appointment & Patient WhatsApp Automation',
    duration: '4:00 mins',
    desc: 'Why doctors love automated reminder bots and how Dandora deploys clinic booking systems in 48 hours.'
  },
  {
    title: 'Handling Technical Objections with Confidence',
    duration: '3:40 mins',
    desc: 'Assuring business owners that Dandora handles 100% of hosting, security, and updates.'
  }
];

const PORTAL_QUIZ = [
  {
    q: "When approaching a local business owner who has no website, what is your primary objective as an Associate?",
    options: [
      "Quote prices and try to sign a contract immediately on the spot.",
      "Discover their digital pain point, gather contact info, and log a ticket for Dandora strategists.",
      "Promise them #1 ranking on Google within 24 hours."
    ],
    correct: 1
  },
  {
    q: "When and how are Dandora Associate commissions disbursed?",
    options: [
      "Within 48 to 72 hours of client milestone receipt directly via UPI or NEFT.",
      "Only once at the end of every financial quarter.",
      "In physical coupons and voucher credits."
    ],
    correct: 0
  },
  {
    q: "What unlocks the Associate Consultant tier (15% commission + 5% monthly recurring retainer)?",
    options: [
      "Paying a ₹5,000 upgrade registration deposit.",
      "Successfully closing 3 deals with Dandora.",
      "Having a Master's degree in Computer Science."
    ],
    correct: 1
  }
];

document.addEventListener('DOMContentLoaded', () => {
  loadPortalAssociate();
  renderCrmKanban();
  renderCrmTable();
  renderDashboardMetrics();
  renderPortalLessons();
  renderPortalQuiz();
  loadPortalSettings();
});

// View Switching
function switchPortalView(viewId, btnElem) {
  PORTAL_STATE.currentView = viewId;
  document.querySelectorAll('.portal-view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item-btn').forEach(b => b.classList.remove('active'));

  const targetView = document.getElementById(viewId);
  if (targetView) targetView.classList.add('active');
  if (btnElem) btnElem.classList.add('active');

  // Close sidebar on mobile
  const sidebar = document.getElementById('appSidebar');
  if (sidebar && window.innerWidth <= 1024) {
    sidebar.classList.remove('open');
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById('appSidebar');
  if (sidebar) sidebar.classList.toggle('open');
}

// Associate State
async function loadPortalAssociate() {
  try {
    let name = 'Vikram Sharma';
    let code = 'DAN-HYD-1042';
    let tier = 'Consultant Tier (15%)';
    let kycStatus = 'KYC_VERIFIED';
    let completion = 100;

    if (window.DandoraAPI) {
      const session = window.DandoraAPI.auth.getCurrentSession();
      const profileRes = await window.DandoraAPI.associates.getProfile(session.user_id);
      if (profileRes && profileRes.data) {
        const u = profileRes.data.user;
        const k = profileRes.data.kyc;
        name = u.full_name;
        code = u.associate_code;
        tier = `${u.current_tier} Tier`;
        kycStatus = k.kyc_status || 'NOT_SUBMITTED';
        completion = profileRes.data.completion_percentage || 75;
      }
    } else {
      const saved = localStorage.getItem('dandora_associate_profile');
      if (saved) {
        PORTAL_STATE.associate = JSON.parse(saved);
        name = PORTAL_STATE.associate.fullName || name;
        code = PORTAL_STATE.associate.associateId || code;
      }
    }

    const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

    if (document.getElementById('portalUserName')) document.getElementById('portalUserName').innerText = name;
    if (document.getElementById('portalUserCode')) document.getElementById('portalUserCode').innerText = code;
    if (document.getElementById('portalAvatar')) document.getElementById('portalAvatar').innerText = initials;
    if (document.getElementById('portalUserTier')) document.getElementById('portalUserTier').innerText = tier;
    if (document.getElementById('credCardName')) document.getElementById('credCardName').innerText = name;
    if (document.getElementById('credCardCode')) document.getElementById('credCardCode').innerText = code;
    if (document.getElementById('dashAssociateCodeDisplay')) document.getElementById('dashAssociateCodeDisplay').innerText = code;
    if (document.getElementById('dashCompletionScore')) document.getElementById('dashCompletionScore').innerText = `${completion}%`;
    
    const kycBadge = document.getElementById('dashKycBadge');
    if (kycBadge) {
      kycBadge.innerText = kycStatus.replace('_', ' ');
      kycBadge.className = `badge ${kycStatus === 'KYC_VERIFIED' ? 'badge-emerald' : 'badge-amber'}`;
    }

    const waSample = document.getElementById('waSampleLink');
    if (waSample) {
      waSample.innerText = `https://dandora.online/associates?ref=${code}`;
    }
  } catch (e) {
    console.error('Error loading associate profile in portal:', e);
  }
}

// Metrics
async function renderDashboardMetrics() {
  let totalPaid = 48500;
  let totalPending = 18000;
  let activeCount = 3;

  if (window.DandoraAPI) {
    try {
      const dash = await window.DandoraAPI.associates.getDashboard();
      if (dash && dash.data && dash.data.stats) {
        const s = dash.data.stats;
        totalPaid = s.paid_commission || totalPaid;
        totalPending = s.pending_commission || s.approved_commission || totalPending;
        activeCount = s.active_leads || activeCount;
      }
    } catch (e) {}
  } else {
    totalPaid = 0;
    totalPending = 0;
    activeCount = 0;
    PORTAL_STATE.leads.forEach(l => {
      if (l.status === 'paid') totalPaid += l.payout;
      else if (l.status === 'won' || l.status === 'meeting') totalPending += l.payout;
      if (l.status !== 'paid') activeCount++;
    });
  }

  if (document.getElementById('dashTotalPayout')) document.getElementById('dashTotalPayout').innerText = formatInr(totalPaid);
  if (document.getElementById('dashPendingPayout')) document.getElementById('dashPendingPayout').innerText = formatInr(totalPending);
  if (document.getElementById('dashActiveLeadsCount')) document.getElementById('dashActiveLeadsCount').innerText = `${activeCount} Leads`;
  if (document.getElementById('sidebarLeadCount')) document.getElementById('sidebarLeadCount').innerText = PORTAL_STATE.leads.length;

  // Funnel Stream
  const funnel = document.getElementById('dashboardFunnelStream');
  if (funnel) {
    funnel.innerHTML = '';
    PORTAL_STATE.leads.slice(0, 4).forEach(l => {
      const item = document.createElement('div');
      item.style.padding = '0.75rem';
      item.style.background = 'rgba(255,255,255,0.02)';
      item.style.borderRadius = '8px';
      item.style.display = 'flex';
      item.style.justifyContent = 'space-between';
      item.style.alignItems = 'center';
      item.innerHTML = `
        <div>
          <div style="font-weight:700; font-size: 0.9rem;">${escapeHtml(l.bizName)}</div>
          <div style="font-size:0.75rem; color: var(--text-secondary);">${escapeHtml(l.category)} • ${escapeHtml(l.contact)}</div>
        </div>
        <div style="text-align:right;">
          <span class="badge badge-cyan">${escapeHtml(l.statusText)}</span>
          <div style="font-size:0.75rem; color: var(--emerald); font-weight:700; margin-top:2px;">${formatInr(l.payout)}</div>
        </div>
      `;
      funnel.appendChild(item);
    });
  }
}

// Kanban CRM
function renderCrmKanban() {
  const stages = ['submitted', 'assigned', 'meeting', 'won', 'paid'];
  stages.forEach(st => {
    const stream = document.getElementById(`cards-${st}`);
    const badge = document.getElementById(`count-${st}`);
    if (stream) stream.innerHTML = '';

    const matching = PORTAL_STATE.leads.filter(l => l.status === st);
    if (badge) badge.innerText = matching.length;

    matching.forEach(lead => {
      const card = document.createElement('div');
      card.className = 'kanban-card';
      card.innerHTML = `
        <div class="kcard-title">${escapeHtml(lead.bizName)}</div>
        <div class="kcard-meta">${escapeHtml(lead.contact)} • 📞 ${escapeHtml(lead.phone)}</div>
        <div style="font-size:0.75rem; color: var(--text-muted);">${escapeHtml(lead.need)}</div>
        <div class="kcard-footer">
          <span class="kcard-amount">Est: ${formatInr(lead.payout)}</span>
          <button class="btn btn-secondary btn-sm" style="font-size:0.7rem; padding: 2px 6px;" onclick="advanceLeadStage('${lead.id}')">
            Advance →
          </button>
        </div>
      `;
      stream.appendChild(card);
    });
  });
}

// Table CRM
function renderCrmTable() {
  const tbody = document.getElementById('crmTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  PORTAL_STATE.leads.forEach(lead => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${escapeHtml(lead.id)}</strong></td>
      <td style="color:#fff; font-weight:600;">${escapeHtml(lead.bizName)}</td>
      <td>${escapeHtml(lead.contact)} (${escapeHtml(lead.phone)})</td>
      <td>${escapeHtml(lead.category)}</td>
      <td>${escapeHtml(lead.need)}</td>
      <td><span class="badge badge-cyan">${escapeHtml(lead.statusText)}</span></td>
      <td style="color: var(--emerald); font-weight:700;">${formatInr(lead.payout)}</td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="advanceLeadStage('${lead.id}')">Advance Stage</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function toggleCrmViewMode() {
  PORTAL_STATE.isTableView = !PORTAL_STATE.isTableView;
  const kanban = document.getElementById('crmKanbanView');
  const table = document.getElementById('crmTableView');

  if (PORTAL_STATE.isTableView) {
    kanban.style.display = 'none';
    table.style.display = 'block';
  } else {
    kanban.style.display = 'grid';
    table.style.display = 'none';
  }
}

function advanceLeadStage(leadId) {
  const stages = ['submitted', 'assigned', 'meeting', 'won', 'paid'];
  const stageLabels = {
    submitted: 'Submitted',
    assigned: 'Strategist Assigned',
    meeting: 'Meeting Scheduled',
    won: 'Deal Won',
    paid: 'Paid to Bank'
  };

  const lead = PORTAL_STATE.leads.find(l => l.id === leadId);
  if (!lead) return;

  const currentIdx = stages.indexOf(lead.status);
  if (currentIdx < stages.length - 1) {
    lead.status = stages[currentIdx + 1];
    lead.statusText = stageLabels[lead.status];
    renderCrmKanban();
    renderCrmTable();
    renderDashboardMetrics();
    showPortalToast(`Ticket ${lead.id} advanced to: ${lead.statusText}!`);
  } else {
    showPortalToast(`Ticket ${lead.id} is already in final paid status.`);
  }
}

function filterPortalLeads(query) {
  const q = query.toLowerCase().trim();
  const rows = document.querySelectorAll('#crmTableBody tr');
  rows.forEach(r => {
    r.style.display = r.innerText.toLowerCase().includes(q) ? '' : 'none';
  });

  const cards = document.querySelectorAll('.kanban-card');
  cards.forEach(c => {
    c.style.display = c.innerText.toLowerCase().includes(q) ? '' : 'none';
  });
}

// Modal Lead Submit
function openNewLeadModal() {
  document.getElementById('portalLeadModal').style.display = 'flex';
}

function closeNewLeadModal() {
  document.getElementById('portalLeadModal').style.display = 'none';
}

async function handlePortalLeadSubmit(e) {
  e.preventDefault();
  const bizName = document.getElementById('pLeadBiz').value.trim();
  const contact = document.getElementById('pLeadContact').value.trim();
  const phone = document.getElementById('pLeadPhone').value.trim();
  const category = document.getElementById('pLeadCat').value;
  const need = document.getElementById('pLeadNeed').value;
  const notes = document.getElementById('pLeadNotes').value.trim();

  let toastMessage = `Lead for "${bizName}" logged into Dandora pipeline!`;
  let isDup = false;

  if (window.DandoraAPI) {
    try {
      const res = await window.DandoraAPI.leads.submit({
        businessName: bizName,
        contactPerson: contact,
        contactPhone: phone,
        businessCategory: category,
        serviceRequired: need,
        notes: notes,
        location: 'Hyderabad, Telangana'
      });
      if (res && res.data && res.data.lead_status === 'DUPLICATE') {
        isDup = true;
        toastMessage = `⚠️ Notice: Lead logged but flagged as POTENTIAL DUPLICATE of an existing record. Ops will review.`;
      }
    } catch (err) {
      console.error('API lead submit error:', err);
    }
  }

  const newTicket = {
    id: `TKT-${Math.floor(100 + Math.random() * 900)}`,
    bizName,
    contact,
    phone,
    category,
    need,
    notes,
    status: isDup ? 'submitted' : 'submitted',
    statusText: isDup ? 'Flagged Duplicate (In Review)' : 'Submitted (Pre-Sales Desk)',
    amount: 50000,
    payout: 7500
  };

  PORTAL_STATE.leads.unshift(newTicket);
  renderCrmKanban();
  renderCrmTable();
  renderDashboardMetrics();
  closeNewLeadModal();
  document.getElementById('portalNewLeadForm').reset();
  showPortalToast(toastMessage);

  // Cloud sync if available
  try {
    const config = JSON.parse(localStorage.getItem('dandora_cloud_sync_config') || '{}');
    if (config.webhookUrl && config.autoSync) {
      fetch(config.webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'lead', ...newTicket })
      }).catch(() => {});
    }
  } catch (err) {}
}

// Academy Lessons & Quiz
function renderPortalLessons() {
  const container = document.getElementById('portalLessonsList');
  if (!container) return;

  container.innerHTML = '';
  PORTAL_LESSONS.forEach((les, idx) => {
    const div = document.createElement('div');
    div.style.padding = '0.9rem';
    div.style.background = 'rgba(255,255,255,0.03)';
    div.style.borderRadius = '8px';
    div.style.border = '1px solid var(--border-color)';
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.3rem;">
        <span style="font-weight:700; font-size:0.92rem; color:#fff;">Module ${idx+1}: ${escapeHtml(les.title)}</span>
        <span class="badge badge-cyan" style="font-size:0.7rem;">⏱ ${les.duration}</span>
      </div>
      <p style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:0.5rem;">${escapeHtml(les.desc)}</p>
      <button class="btn btn-secondary btn-sm" style="font-size:0.75rem;" onclick="showPortalToast('Playing video lesson: ${escapeHtml(les.title)}')">
        ▶ Watch 3-Min Lesson
      </button>
    `;
    container.appendChild(div);
  });
}

function renderPortalQuiz() {
  const qObj = PORTAL_QUIZ[PORTAL_STATE.quizCurrentQ];
  document.getElementById('portalQuizProg').innerText = `Question ${PORTAL_STATE.quizCurrentQ + 1} of ${PORTAL_QUIZ.length}`;
  document.getElementById('portalQuizQ').innerText = qObj.q;

  const opts = document.getElementById('portalQuizOpts');
  opts.innerHTML = '';
  qObj.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-secondary btn-sm';
    btn.style.textAlign = 'left';
    btn.style.justifyContent = 'flex-start';
    btn.innerText = opt;
    btn.onclick = () => {
      if (idx === qObj.correct) {
        btn.style.background = 'rgba(16,185,129,0.2)';
        btn.style.borderColor = 'var(--emerald)';
        PORTAL_STATE.quizScore++;
        showPortalToast('Correct! Moving to next question...');
      } else {
        btn.style.background = 'rgba(239,68,68,0.2)';
        showPortalToast('Incorrect concept review needed.');
      }
      setTimeout(() => {
        PORTAL_STATE.quizCurrentQ = (PORTAL_STATE.quizCurrentQ + 1) % PORTAL_QUIZ.length;
        renderPortalQuiz();
      }, 1000);
    };
    opts.appendChild(btn);
  });
}

// Payout Receipt Modal
function openPayoutReceiptModal() {
  document.getElementById('receiptModal').style.display = 'flex';
}

function closePayoutReceiptModal() {
  document.getElementById('receiptModal').style.display = 'none';
}

// Settings & Webhook
function loadPortalSettings() {
  try {
    const config = JSON.parse(localStorage.getItem('dandora_cloud_sync_config') || '{}');
    if (config.webhookUrl) {
      document.getElementById('portalWebhookInput').value = config.webhookUrl;
    }
  } catch (e) {}
}

function savePortalSettings() {
  const url = document.getElementById('portalWebhookInput').value.trim();
  const auto = document.getElementById('portalAutoSyncToggle').checked;
  try {
    localStorage.setItem('dandora_cloud_sync_config', JSON.stringify({
      webhookUrl: url,
      autoSync: auto,
      pendingQueue: []
    }));
    showPortalToast('Portal settings saved!');
  } catch (e) {}
}

function testCloudConnectionPortal() {
  const url = document.getElementById('portalWebhookInput').value.trim();
  if (!url) {
    showPortalToast('Please enter an endpoint URL first.');
    return;
  }
  showPortalToast('Pinging endpoint...');
  fetch(url, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ ping: true }) })
    .then(() => showPortalToast('⚡ Ping successful! Webhook connected.'))
    .catch(err => showPortalToast(`Error: ${err.message}`));
}

function downloadKit(kit) {
  showPortalToast(`Downloading: ${kit} (PDF)`);
}

function shareToWhatsApp(pitchTitle, ref) {
  const code = PORTAL_STATE.associate ? PORTAL_STATE.associate.associateId : ref;
  const text = `Hi! Dandora.online helps local Hyderabad businesses build modern websites and automated systems. Explore here: https://dandora.online/associates?ref=${code}`;
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
}

function exportData(type) {
  const headers = ['ID', 'Business', 'Contact', 'Category', 'Status', 'Payout'];
  const rows = PORTAL_STATE.leads.map(l => [l.id, `"${l.bizName}"`, `"${l.contact}"`, `"${l.category}"`, l.status, l.payout]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'dandora_pipeline.csv';
  a.click();
}

function formatInr(val) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showPortalToast(msg) {
  const container = document.getElementById('portalToastContainer');
  if (!container) return;
  const t = document.createElement('div');
  t.style.background = '#0f172a';
  t.style.color = '#fff';
  t.style.border = '1px solid var(--border-glow)';
  t.style.borderRadius = '8px';
  t.style.padding = '0.75rem 1.2rem';
  t.style.fontSize = '0.85rem';
  t.style.boxShadow = '0 6px 20px rgba(0,0,0,0.5)';
  t.innerHTML = `⚡ ${escapeHtml(msg)}`;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

function showNotificationToast() {
  showPortalToast('No new unread alerts. You are fully caught up!');
}
