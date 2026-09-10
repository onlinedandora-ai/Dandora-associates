/**
 * Dandora Associate Mobile Application Logic
 * Reference: DANDORA-OPS-ASSOC-V2
 */

const MOBILE_STATE = {
  activeTab: 'feed',
  capturedPhotoData: null,
  associate: null,
  leads: [
    {
      id: 'TKT-101',
      bizName: 'Meenakshi Jewellers',
      contact: 'Ramesh Reddy',
      phone: '9848022334',
      category: 'Retail',
      status: 'meeting',
      statusText: 'Meeting Today',
      payout: 6750
    },
    {
      id: 'TKT-102',
      bizName: 'Dr. Ananya Dental',
      contact: 'Dr. Ananya',
      phone: '9989012345',
      category: 'Clinic',
      status: 'won',
      statusText: 'Deal Won',
      payout: 9750
    },
    {
      id: 'TKT-103',
      bizName: 'Urban Craft Brewery',
      contact: 'Sandeep V.',
      phone: '9700112233',
      category: 'Restaurant',
      status: 'paid',
      statusText: 'Paid (UPI)',
      payout: 18000
    }
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  initClock();
  registerServiceWorker();
  loadAssociateProfile();
  renderPipelineCards();
  fetchDatabaseLeads();
});

// Sync from SQLite Database
function fetchDatabaseLeads() {
  fetch('/api/leads')
    .then(r => r.json())
    .then(res => {
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        // Map SQLite fields to mobile schema
        const mapped = res.data.map(d => ({
          id: d.id,
          bizName: d.business_name,
          contact: d.contact_person || 'Store Owner',
          phone: d.contact_phone,
          category: d.business_category,
          status: (d.lead_status || 'submitted').toLowerCase(),
          statusText: (d.lead_status || 'Submitted').replace(/_/g, ' '),
          payout: d.commission_amount || Math.round((d.estimated_value || 50000) * 0.15)
        }));
        MOBILE_STATE.leads = mapped;
        renderPipelineCards();
      }
    })
    .catch(() => {
      // Graceful offline fallback to default seed
    });
}

// Update top status bar clock
function initClock() {
  const clockElem = document.getElementById('mobileClock');
  if (!clockElem) return;
  const update = () => {
    const d = new Date();
    clockElem.innerText = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };
  update();
  setInterval(update, 30000);
}

// Tab Switching
function switchMobileTab(tabKey, btnElem) {
  MOBILE_STATE.activeTab = tabKey;
  document.querySelectorAll('.tab-screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-tab-btn').forEach(b => b.classList.remove('active'));

  const targetScreen = document.getElementById(`screen-${tabKey}`);
  if (targetScreen) {
    targetScreen.classList.add('active');
    if (typeof window.animateMobileScreenTransition === 'function') {
      window.animateMobileScreenTransition(targetScreen);
    }
  }
  if (btnElem) btnElem.classList.add('active');

  // Scroll viewport to top
  const viewport = document.getElementById('mobileViewport');
  if (viewport) viewport.scrollTop = 0;
}

// Render Pipeline
function renderPipelineCards() {
  const container = document.getElementById('mobilePipelineList');
  if (!container) return;

  container.innerHTML = '';
  MOBILE_STATE.leads.forEach(l => {
    const card = document.createElement('div');
    card.className = 'm-card';
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
        <div>
          <div style="font-weight:700; font-size:0.95rem; color:#fff;">${escapeHtml(l.bizName)}</div>
          <div style="font-size:0.75rem; color:var(--text-secondary);">${escapeHtml(l.contact)} • ${escapeHtml(l.category)}</div>
        </div>
        <span class="m-badge badge-${l.status}">${escapeHtml(l.statusText)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.05); padding-top:0.6rem; margin-top:0.4rem;">
        <span style="font-size:0.8rem; color:var(--cyan); font-weight:700;">Est: ₹${l.payout.toLocaleString('en-IN')}</span>
        <a href="tel:${l.phone}" style="display:inline-flex; align-items:center; gap:0.3rem; background:rgba(0,229,255,0.1); color:var(--cyan); padding:0.3rem 0.6rem; border-radius:6px; font-size:0.75rem; text-decoration:none; font-weight:600;">
          📞 Call Owner
        </a>
      </div>
    `;
    container.appendChild(card);
  });
}

// Photo Attachment Simulation
function triggerPhotoCapture() {
  const input = document.getElementById('storePhotoInput');
  if (input) input.click();
}

function handlePhotoSelected(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    MOBILE_STATE.capturedPhotoData = e.target.result;
    const preview = document.getElementById('photoPreviewBox');
    preview.innerHTML = `
      <img src="${e.target.result}" style="width:100%; max-height:140px; object-fit:cover; border-radius:8px;" alt="Storefront" />
      <div style="font-size:0.75rem; color:var(--emerald); margin-top:0.4rem; font-weight:600;">✓ Storefront Photo Attached</div>
    `;
  };
  reader.readAsDataURL(file);
}

// Handle Quick Lead Log
function handleQuickLeadSubmit(e) {
  e.preventDefault();
  const bizName = document.getElementById('mBizName').value.trim();
  const contact = document.getElementById('mContactName').value.trim();
  const phone = document.getElementById('mPhone').value.trim();
  const category = document.getElementById('mCategory').value;
  const need = document.getElementById('mNeed').value;

  if (!bizName || !phone) {
    showMobileToast('Please fill in business name & mobile.');
    return;
  }

  const newLead = {
    id: `TKT-${Math.floor(100 + Math.random() * 900)}`,
    bizName,
    contact: contact || 'Store Owner',
    phone,
    category,
    need,
    status: 'submitted',
    statusText: 'Submitted',
    payout: 7500
  };

  MOBILE_STATE.leads.unshift(newLead);
  renderPipelineCards();

  // GSAP animation on top lead card
  const container = document.getElementById('mobilePipelineList');
  if (container && container.firstElementChild && typeof window.animateLeadSuccess === 'function') {
    window.animateLeadSuccess(container.firstElementChild);
  }

  // Reset form
  document.getElementById('quickLeadForm').reset();
  const preview = document.getElementById('photoPreviewBox');
  preview.innerHTML = `
    <div style="font-size: 1.6rem; margin-bottom: 0.3rem;">📸</div>
    <div style="font-size: 0.8rem; font-weight: 600; color: var(--cyan);">Tap to take or attach shop photo</div>
    <div style="font-size: 0.72rem; color: var(--text-muted);">(Optional - Storefront & Signboard)</div>
  `;

  showMobileToast(`Lead for "${bizName}" submitted! Assigned ${newLead.id}.`);

  // Direct SQLite API Synchronization
  fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      business_name: bizName,
      contact_person: contact || 'Store Owner',
      contact_phone: phone,
      business_category: category,
      service_required: need,
      notes: 'Submitted via Dandora Mobile App'
    })
  }).then(r => r.json()).then(res => {
    if (res.success) {
      console.log('⚡ Lead successfully persisted to SQLite database:', res.data.id);
    }
  }).catch(err => {
    console.warn('Working offline or server unreachable; lead queued locally.');
  });

  // Cloud Sync Dispatch (Google Sheets / Webhook if configured)
  try {
    const config = JSON.parse(localStorage.getItem('dandora_cloud_sync_config') || '{}');
    if (config.webhookUrl && config.autoSync) {
      fetch(config.webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'lead', source: 'mobile_app', ...newLead })
      }).catch(() => {});
    }
  } catch (err) {}

  // Switch to pipeline tab to show new card
  setTimeout(() => {
    const pipeBtn = document.querySelector('.nav-tab-btn[data-tab="pipeline"]');
    switchMobileTab('pipeline', pipeBtn);
  }, 1000);
}

// Load Associate Profile
function loadAssociateProfile() {
  try {
    const saved = localStorage.getItem('dandora_associate_profile');
    if (saved) {
      MOBILE_STATE.associate = JSON.parse(saved);
      const name = MOBILE_STATE.associate.fullName;
      const code = MOBILE_STATE.associate.associateId;
      document.getElementById('mProfileName').innerText = name;
      document.getElementById('mProfileId').innerText = code;
    }
  } catch (e) {}
}

// Share to WhatsApp
function shareFromMobile(pitchTitle) {
  const code = MOBILE_STATE.associate ? MOBILE_STATE.associate.associateId : 'DAN-HYD-8821';
  const text = `Hey! Need a modern website or ordering app for your business? Dandora.online deploys custom platforms with zero hassle: https://dandora.online/associates?ref=${code}`;
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

// PWA Service Worker Registration
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(() => {
      console.log('Dandora Mobile App SW registered.');
    }).catch(err => {
      console.log('SW registration error:', err);
    });
  }
}

// Toast
function showMobileToast(msg) {
  const toast = document.createElement('div');
  toast.style.position = 'absolute';
  toast.style.top = '70px';
  toast.style.left = '16px';
  toast.style.right = '16px';
  toast.style.background = '#0f172a';
  toast.style.border = '1px solid var(--cyan)';
  toast.style.borderRadius = '10px';
  toast.style.padding = '0.75rem 1rem';
  toast.style.fontSize = '0.8rem';
  toast.style.color = '#fff';
  toast.style.boxShadow = '0 6px 20px rgba(0,0,0,0.7)';
  toast.style.zIndex = '999';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '0.5rem';
  toast.innerHTML = `<span>⚡</span> <span>${escapeHtml(msg)}</span>`;

  const shell = document.querySelector('.mobile-device-shell');
  if (shell) {
    shell.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
