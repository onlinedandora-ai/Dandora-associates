/**
 * Dandora.online Associate Ecosystem - Advanced Application Logic
 * Reference: DANDORA-OPS-ASSOC-V2
 * Features:
 *   1. Multi-Track Quiz Academy & Verifiable Badging Engine
 *   2. Configurable Commission Tiers, Campus Overrides & Progression Roadmap
 *   3. Live Remote API & Google Sheets Webhook Connector (Auto-Sync & Offline Queue)
 */

// ==========================================
// 1. Application State & Storage
// ==========================================
const APP_STATE = {
  activeTier: 'consultant', // 'scout', 'consultant', 'growth'
  dealsCount: 3,
  avgDealValue: 45000,
  campusBonusActive: false,
  streakBonusActive: false,
  customRateActive: false,
  currentWizardStep: 1,
  associateData: null,
  activeQuizTrack: 'foundations',
  quizTrackState: {
    foundations: { currentQ: 0, score: 0, unlocked: true },
    healthcare: { currentQ: 0, score: 0, unlocked: false },
    restaurant: { currentQ: 0, score: 0, unlocked: false },
    enterprise: { currentQ: 0, score: 0, unlocked: false }
  },
  cloudSync: {
    webhookUrl: '',
    autoSync: true,
    pendingQueue: []
  },
  leads: [
    {
      id: 'TKT-101',
      bizName: 'Meenakshi Jewellers (Abids)',
      contact: 'Ramesh Reddy',
      phone: '9848022334',
      category: 'Retail / Boutique',
      need: 'E-Commerce & Catalog',
      status: 'meeting',
      statusText: 'Client Meeting Scheduled',
      amount: 45000,
      payout: 6750,
      timestamp: '2 hours ago'
    },
    {
      id: 'TKT-102',
      bizName: 'Dr. Ananya Dental Speciality',
      contact: 'Dr. Ananya Rao',
      phone: '9989012345',
      category: 'Healthcare / Clinic',
      need: 'Custom Web App / ERP',
      status: 'won',
      statusText: 'Won / Commission Pending',
      amount: 65000,
      payout: 9750,
      timestamp: 'Yesterday'
    },
    {
      id: 'TKT-103',
      bizName: 'Urban Craft Brewery (Jubilee Hills)',
      contact: 'Sandeep V.',
      phone: '9700112233',
      category: 'Restaurant / Cafe',
      need: 'Website & Branding',
      status: 'paid',
      statusText: 'Paid (Receipt #DND-771)',
      amount: 120000,
      payout: 18000,
      timestamp: '3 days ago'
    }
  ]
};

// Rates by Partner Tier
const TIER_RATES = {
  scout: { name: 'Associate Scout', comm: 0.10, retainer: 0.00, badge: 'Tier 01' },
  consultant: { name: 'Associate Consultant', comm: 0.15, retainer: 0.05, badge: 'Tier 02' },
  growth: { name: 'Growth Partner', comm: 0.20, retainer: 0.10, badge: 'Tier 03' }
};

// ==========================================
// 2. Multi-Track Quiz Bank (Feature 1)
// ==========================================
const QUIZ_TRACKS = {
  foundations: {
    name: "Scout Foundations",
    badgeTitle: "Certified Scout",
    badgeEmoji: "🏅",
    badgeTarget: "🏅 Certified Scout Badge",
    lessonsCount: 3,
    questions: [
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
    ]
  },
  healthcare: {
    name: "Healthcare & Clinics Specialist",
    badgeTitle: "Healthcare Specialist",
    badgeEmoji: "🩺",
    badgeTarget: "🩺 Healthcare Specialist Badge",
    lessonsCount: 4,
    questions: [
      {
        q: "What is the biggest operational pain point for single-doctor clinics in Hyderabad?",
        options: [
          "Having too many social media influencers visiting.",
          "Manual appointment scheduling, missed patient follow-ups, and lack of automated WhatsApp reminders.",
          "Purchasing high-end 3D printer hardware."
        ],
        correct: 1
      },
      {
        q: "How does Dandora's Clinic Booking Portal directly benefit a diagnostic lab or dental clinic?",
        options: [
          "It forces patients to pay in cryptocurrency.",
          "It automates slots, collects advance UPI consultation deposits, and sends instant confirmation SMS.",
          "It replaces the doctor with an automated robot."
        ],
        correct: 1
      },
      {
        q: "Why is patient data confidentiality and WhatsApp encryption important when pitching doctors?",
        options: [
          "Doctors strictly require secure, compliant patient record storage before agreeing to online booking.",
          "It is not important at all.",
          "It reduces the clinic's electricity bill."
        ],
        correct: 0
      }
    ]
  },
  restaurant: {
    name: "Restaurant & F&B Smart QR",
    badgeTitle: "F&B QR Advisor",
    badgeEmoji: "🍽️",
    badgeTarget: "🍽️ F&B Tech Advisor Badge",
    lessonsCount: 3,
    questions: [
      {
        q: "Why do restaurant owners want Dandora Smart QR table ordering instead of third-party food delivery apps?",
        options: [
          "They want to pay 30% aggregator commission on every dine-in customer.",
          "Zero aggregator commissions on direct dine-in orders and instant table-side UPI settlement.",
          "They dislike having customers in their restaurant."
        ],
        correct: 1
      },
      {
        q: "What recurring income does an Associate Consultant earn from onboarding a restaurant to Dandora QR?",
        options: [
          "Zero recurring income.",
          "Flat ₹6,000 one-time setup commission + 5% monthly SaaS software retainer.",
          "Free dessert coupons only."
        ],
        correct: 1
      },
      {
        q: "How quickly can Dandora digitize an existing printed restaurant menu into a multi-lingual Smart QR portal?",
        options: [
          "Under 24 to 48 hours with instant QR standee graphics.",
          "6 to 9 months.",
          "Never."
        ],
        correct: 0
      }
    ]
  },
  enterprise: {
    name: "Master Objection Closer",
    badgeTitle: "Master Closer",
    badgeEmoji: "💼",
    badgeTarget: "💼 Master Closer Badge",
    lessonsCount: 4,
    questions: [
      {
        q: "How do you respond when a business owner says: 'My niece can build a website for ₹2,000'?",
        options: [
          "Argue with them and storm out.",
          "Explain that Dandora provides enterprise speed, SEO indexing, payment gateways, and guaranteed SLA support that free templates lack.",
          "Match the ₹2,000 price and code it yourself."
        ],
        correct: 1
      },
      {
        q: "What is Dandora's pre-sales desk commitment after an Associate logs a qualified lead?",
        options: [
          "Validation within 2 hours, pre-sales discovery call, and transparent deal status tracker updates.",
          "Wait 30 days before calling.",
          "Share the lead with other competitor agencies."
        ],
        correct: 0
      },
      {
        q: "As a Growth Partner leading a chapter, what extra override bonus do you earn on your team's volume?",
        options: [
          "0%",
          "2% to 3% overriding bonus on total sub-associate contract pipeline.",
          "50% penalty."
        ],
        correct: 1
      }
    ]
  }
};

// Document Lifecycle Initializer
document.addEventListener('DOMContentLoaded', () => {
  initSegmentTabs();
  loadCloudSyncConfig();
  loadSavedAssociate();
  calculateEarnings();
  initMobileMenu();
  renderQuizQuestion();
  updateBadgesShowcase();
});

// ==========================================
// 3. Segment Motivation Tabs
// ==========================================
function initSegmentTabs() {
  const tabButtons = document.querySelectorAll('.segment-tab-btn');
  const cards = document.querySelectorAll('.segment-card');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      cards.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-target');
      const targetCard = document.getElementById(targetId);
      if (targetCard) {
        targetCard.classList.add('active');
      }
    });
  });
}

// ==========================================
// 4. Advanced Commission Calculator (Feature 2)
// ==========================================
function setCalcTier(tierKey, btnElem) {
  APP_STATE.activeTier = tierKey;
  document.querySelectorAll('.tier-btn').forEach(btn => btn.classList.remove('active'));
  if (btnElem) btnElem.classList.add('active');
  calculateEarnings();
}

function toggleCustomRateControls() {
  const chk = document.getElementById('toggleCustomRate');
  const controls = document.getElementById('customRateControls');
  APP_STATE.customRateActive = chk.checked;
  if (controls) {
    controls.style.display = chk.checked ? 'block' : 'none';
  }
  calculateEarnings();
}

function calculateEarnings() {
  const dealsSlider = document.getElementById('dealsSlider');
  const valueSlider = document.getElementById('valueSlider');

  if (!dealsSlider || !valueSlider) return;

  const deals = parseInt(dealsSlider.value, 10);
  const avgVal = parseInt(valueSlider.value, 10);

  APP_STATE.dealsCount = deals;
  APP_STATE.avgDealValue = avgVal;

  document.getElementById('dealsDisplay').innerText = `${deals} Deal${deals > 1 ? 's' : ''}`;
  document.getElementById('valueDisplay').innerText = formatCurrency(avgVal);

  // Bonus checks
  const campusChk = document.getElementById('toggleCampusBonus');
  const streakChk = document.getElementById('toggleStreakBonus');
  APP_STATE.campusBonusActive = campusChk ? campusChk.checked : false;
  APP_STATE.streakBonusActive = streakChk ? streakChk.checked : false;

  let baseCommRate = TIER_RATES[APP_STATE.activeTier].comm;
  let baseRetainerRate = TIER_RATES[APP_STATE.activeTier].retainer;

  // Custom rate override
  if (APP_STATE.customRateActive) {
    const customComm = parseInt(document.getElementById('customCommSlider').value, 10) / 100;
    const customRetainer = parseInt(document.getElementById('customRetainerSlider').value, 10) / 100;
    document.getElementById('customCommDisplay').innerText = `${Math.round(customComm * 100)}%`;
    document.getElementById('customRetainerDisplay').innerText = `${Math.round(customRetainer * 100)}%`;
    baseCommRate = customComm;
    baseRetainerRate = customRetainer;
  }

  // Calculate Bonus Multipliers
  let totalBonusRate = 0;
  if (APP_STATE.campusBonusActive) totalBonusRate += 0.03; // +3%
  if (APP_STATE.streakBonusActive && deals >= 5) totalBonusRate += 0.025; // +2.5% for 5+ deals

  // Active bonus badge
  const bonusBadge = document.getElementById('activeBonusBadge');
  if (bonusBadge) {
    if (totalBonusRate > 0) {
      bonusBadge.style.display = 'inline-flex';
      bonusBadge.innerText = `+${(totalBonusRate * 100).toFixed(1)}% Active Bonus`;
    } else {
      bonusBadge.style.display = 'none';
    }
  }

  const effectiveCommRate = baseCommRate + totalBonusRate;
  const totalVolume = deals * avgVal;
  const oneTimeSum = totalVolume * effectiveCommRate;
  const retainerSum = totalVolume * baseRetainerRate;
  const monthlyTotal = oneTimeSum + retainerSum;
  const annualTotal = monthlyTotal * 12;

  // Update Result Panel
  document.getElementById('monthlyTotalDisplay').innerText = formatCurrency(monthlyTotal);
  document.getElementById('calcCommRate').innerText = `${(effectiveCommRate * 100).toFixed(1)}%`;
  document.getElementById('calcRetainerRate').innerText = `${Math.round(baseRetainerRate * 100)}%`;
  document.getElementById('calcOneTimeSum').innerText = formatCurrency(oneTimeSum);
  document.getElementById('calcRetainerSum').innerText = baseRetainerRate > 0 ? `${formatCurrency(retainerSum)} /mo` : '—';
  document.getElementById('calcPipelineTotal').innerText = formatCurrency(totalVolume);
  document.getElementById('annualProjectionDisplay').innerText = `🌟 Projected Annual Income: ${formatCurrency(annualTotal)} / year`;

  // Update Career Tier Milestone Path
  updateMilestoneBar(deals);
}

function updateMilestoneBar(deals) {
  const label = document.getElementById('milestoneProgressLabel');
  const fill = document.getElementById('milestoneFill');
  const n1 = document.getElementById('msNode1');
  const n2 = document.getElementById('msNode2');
  const n3 = document.getElementById('msNode3');

  if (!fill || !n1 || !n2 || !n3) return;

  if (deals < 3) {
    label.innerText = `Scout Tier (${deals}/3 Deals)`;
    fill.style.width = '15%';
    n1.classList.add('achieved');
    n2.classList.remove('achieved');
    n3.classList.remove('achieved');
  } else if (deals < 10) {
    label.innerText = `Consultant Tier (${deals}/10 Deals to Growth Partner)`;
    fill.style.width = '55%';
    n1.classList.add('achieved');
    n2.classList.add('achieved');
    n3.classList.remove('achieved');
  } else {
    label.innerText = `Growth Partner Achieved! (${deals} Deals Closed)`;
    fill.style.width = '100%';
    n1.classList.add('achieved');
    n2.classList.add('achieved');
    n3.classList.add('achieved');
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

// ==========================================
// 5. Multi-Track Quiz Academy (Feature 1)
// ==========================================
function selectQuizTrack(trackKey, btnElem) {
  if (!QUIZ_TRACKS[trackKey]) return;

  APP_STATE.activeQuizTrack = trackKey;
  document.querySelectorAll('.track-pill-btn').forEach(b => b.classList.remove('active'));
  if (btnElem) btnElem.classList.add('active');

  const track = QUIZ_TRACKS[trackKey];
  document.getElementById('quizTrackTitle').innerText = `${track.name} Quiz`;
  document.getElementById('quizTrackBadgeTarget').innerText = track.badgeTarget;

  resetQuiz();
}

function checkQuizAnswer(selectedIdx) {
  const trackKey = APP_STATE.activeQuizTrack;
  const track = QUIZ_TRACKS[trackKey];
  const state = APP_STATE.quizTrackState[trackKey];
  const current = track.questions[state.currentQ];
  const optionButtons = document.querySelectorAll('.quiz-opt-btn');

  if (selectedIdx === current.correct) {
    optionButtons[selectedIdx].classList.add('correct');
    state.score++;
    showToast(`Correct! Great answer in ${track.name}.`);
  } else {
    optionButtons[selectedIdx].classList.add('wrong');
    optionButtons[current.correct].classList.add('correct');
    showToast('Review this concept to master client discussions!');
  }

  optionButtons.forEach(b => b.disabled = true);

  setTimeout(() => {
    state.currentQ++;
    if (state.currentQ < track.questions.length) {
      renderQuizQuestion();
    } else {
      showQuizResult();
    }
  }, 1200);
}

function renderQuizQuestion() {
  const trackKey = APP_STATE.activeQuizTrack;
  const track = QUIZ_TRACKS[trackKey];
  const state = APP_STATE.quizTrackState[trackKey];
  const current = track.questions[state.currentQ];

  document.getElementById('quizProgressNum').innerText = `Question ${state.currentQ + 1} of ${track.questions.length}`;
  document.getElementById('quizQuestionText').innerText = current.q;

  const optionsContainer = document.getElementById('quizOptionsArea');
  optionsContainer.innerHTML = '';

  current.options.forEach((optText, index) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-opt-btn';
    btn.innerText = optText;
    btn.onclick = () => checkQuizAnswer(index);
    optionsContainer.appendChild(btn);
  });
}

function showQuizResult() {
  const trackKey = APP_STATE.activeQuizTrack;
  const track = QUIZ_TRACKS[trackKey];
  const state = APP_STATE.quizTrackState[trackKey];

  document.getElementById('quizQuestionArea').style.display = 'none';
  document.getElementById('quizResultArea').style.display = 'block';

  state.unlocked = true;
  saveBadges();
  updateBadgesShowcase();

  document.getElementById('quizResultIcon').innerText = track.badgeEmoji;
  document.getElementById('quizResultTitle').innerText = `${track.badgeTitle} Unlocked!`;
  document.getElementById('quizResultDesc').innerHTML = `
    You passed with 100% score in <strong>${track.name}</strong>. Your Associate ID Card now features the <strong>"${track.badgeEmoji} ${track.badgeTitle}"</strong> certification!
  `;
  showToast(`🏅 Badge Unlocked: ${track.badgeTitle}!`);
}

function resetQuiz() {
  const trackKey = APP_STATE.activeQuizTrack;
  APP_STATE.quizTrackState[trackKey].currentQ = 0;
  APP_STATE.quizTrackState[trackKey].score = 0;
  document.getElementById('quizQuestionArea').style.display = 'block';
  document.getElementById('quizResultArea').style.display = 'none';
  renderQuizQuestion();
}

function advanceNextTrack() {
  const trackKeys = Object.keys(QUIZ_TRACKS);
  const currentIdx = trackKeys.indexOf(APP_STATE.activeQuizTrack);
  const nextIdx = (currentIdx + 1) % trackKeys.length;
  const nextKey = trackKeys[nextIdx];

  const pill = document.querySelector(`.track-pill-btn[data-track="${nextKey}"]`);
  selectQuizTrack(nextKey, pill);
}

function saveBadges() {
  try {
    const badges = {};
    for (const k in APP_STATE.quizTrackState) {
      badges[k] = APP_STATE.quizTrackState[k].unlocked;
    }
    localStorage.setItem('dandora_associate_badges', JSON.stringify(badges));
  } catch (e) {}
}

function updateBadgesShowcase() {
  // Load saved
  try {
    const saved = localStorage.getItem('dandora_associate_badges');
    if (saved) {
      const parsed = JSON.parse(saved);
      for (const k in parsed) {
        if (APP_STATE.quizTrackState[k]) APP_STATE.quizTrackState[k].unlocked = parsed[k];
      }
    }
  } catch (e) {}

  let unlockedCount = 0;
  const total = Object.keys(QUIZ_TRACKS).length;

  for (const k in QUIZ_TRACKS) {
    const isUnlocked = APP_STATE.quizTrackState[k].unlocked;
    if (isUnlocked) unlockedCount++;

    const card = document.getElementById(`badgeCard-${k}`);
    if (card) {
      if (isUnlocked) {
        card.classList.add('unlocked');
        card.querySelector('.badge-status-lbl').innerText = '● VERIFIED';
      } else {
        card.classList.remove('unlocked');
        card.querySelector('.badge-status-lbl').innerText = 'LOCKED';
      }
    }
  }

  const counter = document.getElementById('unlockedBadgesCounter');
  if (counter) counter.innerText = `${unlockedCount} of ${total} Unlocked`;

  // Update Digital ID Card badges row
  const idBadgesContainer = document.getElementById('idCardBadgesContainer');
  if (idBadgesContainer) {
    idBadgesContainer.innerHTML = '';
    for (const k in QUIZ_TRACKS) {
      if (APP_STATE.quizTrackState[k].unlocked) {
        const pill = document.createElement('span');
        pill.className = 'id-skill-pill';
        pill.style.borderColor = 'var(--amber)';
        pill.style.color = 'var(--amber)';
        pill.innerText = `${QUIZ_TRACKS[k].badgeEmoji} ${QUIZ_TRACKS[k].badgeTitle}`;
        idBadgesContainer.appendChild(pill);
      }
    }
  }
}

// ==========================================
// 6. Simulator Views & Sharing
// ==========================================
function switchSimTab(tabName, btnElem) {
  document.querySelectorAll('.sim-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.sim-view').forEach(v => v.classList.remove('active'));

  if (btnElem) btnElem.classList.add('active');

  const viewId = `simView${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`;
  const viewElem = document.getElementById(viewId);
  if (viewElem) viewElem.classList.add('active');
}

function openAppSimulator(tabName) {
  const simElem = document.getElementById('simulator');
  if (simElem) {
    simElem.scrollIntoView({ behavior: 'smooth' });
    const navBtnMap = {
      broadcast: 'simNavBroadcast',
      academy: 'simNavAcademy',
      crm: 'simNavCrm'
    };
    const btn = document.getElementById(navBtnMap[tabName]);
    if (btn) switchSimTab(tabName, btn);
  }
}

function shareToWhatsApp(title, refId) {
  const associateId = APP_STATE.associateData ? APP_STATE.associateData.associateId : refId;
  const text = `Hey! Check out this new digital platform update from Dandora.online: "${title}". Launch your website, booking system, or online store with Hyderabad's top engineering team. Explore: https://dandora.online/associates?ref=${associateId}`;
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
  showToast(`WhatsApp referral link generated for ID: ${associateId}`);
}

function copyReferralLink() {
  const associateId = APP_STATE.associateData ? APP_STATE.associateData.associateId : 'DAN-HYD-8821';
  const fullUrl = `https://dandora.online/associates?ref=${associateId}`;
  navigator.clipboard.writeText(fullUrl).then(() => {
    showToast(`Referral link copied to clipboard: ${fullUrl}`);
  }).catch(() => {
    showToast(`Your referral link: ${fullUrl}`);
  });
}

function playLesson(title, duration, desc) {
  document.getElementById('lessonModalTitle').innerText = title;
  document.getElementById('lessonModalDuration').innerText = duration;
  document.getElementById('lessonModalDesc').innerText = desc;
  document.getElementById('lessonModal').classList.add('active');
}

function closeLessonModal() {
  document.getElementById('lessonModal').classList.remove('active');
  showToast('Lesson marked as completed! Progress updated.');
}

function downloadKit(kitName) {
  showToast(`Downloading: ${kitName} (PDF & Assets)`);
}

// ==========================================
// 7. Lead Pipeline CRM & Intake Form
// ==========================================
function handleLeadSubmit(event) {
  event.preventDefault();

  const bizName = document.getElementById('leadBizName').value.trim();
  const contact = document.getElementById('leadContactName').value.trim();
  const phone = document.getElementById('leadPhone').value.trim();
  const category = document.getElementById('leadCategory').value;
  const need = document.getElementById('leadNeed').value;
  const notes = document.getElementById('leadNotes').value.trim();

  if (!bizName || !phone) {
    showToast('Please fill in required business details.');
    return;
  }

  const newTicket = {
    id: `TKT-${Math.floor(100 + Math.random() * 900)}`,
    bizName,
    contact,
    phone,
    category,
    need,
    notes,
    status: 'submitted',
    statusText: 'Submitted (Pre-Sales Verification)',
    amount: 50000,
    payout: 7500,
    timestamp: 'Just now'
  };

  APP_STATE.leads.unshift(newTicket);
  renderTickets();
  document.getElementById('leadIntakeForm').reset();
  showToast(`Lead for "${bizName}" logged! Assigned ticket ${newTicket.id}.`);

  // Cloud Sync Dispatch (Feature 3)
  dispatchCloudPayload({
    type: 'lead',
    ...newTicket,
    associateId: APP_STATE.associateData ? APP_STATE.associateData.associateId : 'DAN-HYD-8821'
  });

  // Automated progression simulation
  setTimeout(() => {
    newTicket.status = 'assigned';
    newTicket.statusText = 'Assigned to Strategist (Rahul S.)';
    renderTickets();
    showToast(`Update on ${newTicket.id}: Assigned to Senior Strategist.`);
  }, 4000);
}

function renderTickets() {
  const container = document.getElementById('ticketsList');
  if (!container) return;

  container.innerHTML = '';
  APP_STATE.leads.forEach(lead => {
    const card = document.createElement('div');
    card.className = 'lead-ticket-card';
    card.innerHTML = `
      <div class="ticket-header">
        <span class="ticket-biz">${escapeHtml(lead.bizName)}</span>
        <span class="ticket-status-badge status-${lead.status}">${escapeHtml(lead.statusText)}</span>
      </div>
      <div style="font-size: 0.8rem; color: var(--text-secondary); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 0.4rem;">
        <span>Contact: ${escapeHtml(lead.contact)} • ${escapeHtml(lead.category)}</span>
        <span style="color: var(--cyan); font-weight: 600;">Est. Comm: ${formatCurrency(lead.payout)}</span>
      </div>
    `;
    container.appendChild(card);
  });

  const liveCounter = document.getElementById('crmLiveCount');
  if (liveCounter) {
    liveCounter.innerText = `${APP_STATE.leads.length} Active`;
  }
}

// ==========================================
// 8. Pre-Registration & Profiling Wizard (3.1)
// ==========================================
function openRegistrationWizard(trackPreference) {
  APP_STATE.currentWizardStep = 1;
  updateWizardDisplay();

  if (trackPreference) {
    const statusSelect = document.getElementById('regCurrentStatus');
    if (statusSelect) {
      if (trackPreference === 'Student') statusSelect.value = 'Student';
      if (trackPreference === 'Homemaker') statusSelect.value = 'Homemaker';
      if (trackPreference === 'Freelancer') statusSelect.value = 'Freelancer';
      if (trackPreference === 'JobSeeker') statusSelect.value = 'Actively Seeking Job';
    }
  }

  document.getElementById('registrationModal').classList.add('active');
}

function closeRegistrationWizard() {
  document.getElementById('registrationModal').classList.remove('active');
}

function wizardNextStep() {
  if (APP_STATE.currentWizardStep === 1) {
    const name = document.getElementById('regFullName').value.trim();
    const phone = document.getElementById('regMobile').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    if (!name || !phone || !email) {
      showToast('Please complete all required identity fields.');
      return;
    }
  } else if (APP_STATE.currentWizardStep === 4) {
    const upi = document.getElementById('regUpi').value.trim();
    const pan = document.getElementById('regPan').value.trim();
    if (!upi || !pan) {
      showToast('Please provide your UPI ID and PAN for compliant payouts.');
      return;
    }
    generateDigitalId();
  }

  if (APP_STATE.currentWizardStep < 5) {
    APP_STATE.currentWizardStep++;
    updateWizardDisplay();
  } else {
    closeRegistrationWizard();
    showToast('Registration complete! Launching Partner Portal...');
    setTimeout(() => {
      window.location.href = 'portal.html';
    }, 800);
  }
}

function wizardPrevStep() {
  if (APP_STATE.currentWizardStep > 1) {
    APP_STATE.currentWizardStep--;
    updateWizardDisplay();
  }
}

function updateWizardDisplay() {
  for (let i = 1; i <= 5; i++) {
    const prog = document.getElementById(`progStep${i}`);
    const panel = document.getElementById(`wizardStep${i}`);

    if (prog) {
      prog.classList.remove('active', 'completed');
      if (i < APP_STATE.currentWizardStep) prog.classList.add('completed');
      if (i === APP_STATE.currentWizardStep) prog.classList.add('active');
    }

    if (panel) {
      panel.classList.remove('active');
      if (i === APP_STATE.currentWizardStep) panel.classList.add('active');
    }
  }

  const backBtn = document.getElementById('wizardBackBtn');
  const nextBtn = document.getElementById('wizardNextBtn');

  if (backBtn) {
    backBtn.style.visibility = (APP_STATE.currentWizardStep === 1 || APP_STATE.currentWizardStep === 5) ? 'hidden' : 'visible';
  }

  if (nextBtn) {
    if (APP_STATE.currentWizardStep === 4) {
      nextBtn.innerText = 'Verify & Issue Associate ID →';
    } else if (APP_STATE.currentWizardStep === 5) {
      nextBtn.innerText = 'Go to Dashboard';
    } else {
      nextBtn.innerText = 'Continue →';
    }
  }
}

function generateDigitalId() {
  const fullName = document.getElementById('regFullName').value.trim() || 'Dandora Partner';
  const phone = document.getElementById('regMobile').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const status = document.getElementById('regCurrentStatus').value;
  const city = document.getElementById('regCity').value.trim() || 'Hyderabad';
  const upi = document.getElementById('regUpi').value.trim();
  const pan = document.getElementById('regPan').value.trim();

  const selectedSkills = [];
  document.querySelectorAll('.skill-tag-check:checked').forEach(chk => {
    selectedSkills.push(chk.value.split(' ')[0]);
  });

  const randId = Math.floor(1000 + Math.random() * 9000);
  const associateId = `DAN-${city.substring(0, 3).toUpperCase()}-2026-${randId}`;
  const initials = fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  APP_STATE.associateData = {
    fullName,
    phone,
    email,
    status,
    city,
    upi,
    pan,
    associateId,
    skills: selectedSkills
  };

  // Save to localStorage
  try {
    localStorage.setItem('dandora_associate_profile', JSON.stringify(APP_STATE.associateData));
  } catch (e) {}

  // Update UI Elements
  document.getElementById('idCardName').innerText = fullName;
  document.getElementById('idCardNumber').innerText = associateId;
  document.getElementById('idAvatarPreview').innerText = initials;
  document.getElementById('idCardTrack').innerText = `Track: ${status} • ${city} Chapter`;

  const skillsContainer = document.getElementById('idCardSkillsContainer');
  skillsContainer.innerHTML = '';
  selectedSkills.forEach(sk => {
    const pill = document.createElement('span');
    pill.className = 'id-skill-pill';
    pill.innerText = sk;
    skillsContainer.appendChild(pill);
  });

  updateBadgesShowcase();

  // Cloud Sync Dispatch (Feature 3)
  dispatchCloudPayload({
    type: 'associate',
    ...APP_STATE.associateData
  });
}

function loadSavedAssociate() {
  try {
    const saved = localStorage.getItem('dandora_associate_profile');
    if (saved) {
      APP_STATE.associateData = JSON.parse(saved);
      const chip = document.querySelector('.associate-id-chip');
      if (chip) chip.innerHTML = `<span style="color:#ffffff;">ID:</span> ${APP_STATE.associateData.associateId}`;
    }
  } catch (e) {}
}

function printOrCopyId() {
  const idStr = APP_STATE.associateData ? APP_STATE.associateData.associateId : 'DAN-HYD-2026-8942';
  navigator.clipboard.writeText(idStr).then(() => {
    showToast(`Associate ID "${idStr}" copied to clipboard!`);
  }).catch(() => {
    showToast(`Your Associate ID is: ${idStr}`);
  });
}

// ==========================================
// 9. Remote API & Google Sheets Connector (Feature 3)
// ==========================================
function openCloudSyncModal() {
  const input = document.getElementById('webhookUrlInput');
  const autoSync = document.getElementById('toggleAutoSync');
  const queueLabel = document.getElementById('modalQueueCount');

  if (input) input.value = APP_STATE.cloudSync.webhookUrl || '';
  if (autoSync) autoSync.checked = APP_STATE.cloudSync.autoSync;
  if (queueLabel) queueLabel.innerText = `${APP_STATE.cloudSync.pendingQueue.length} items`;

  document.getElementById('cloudSyncModal').classList.add('active');
}

function closeCloudSyncModal() {
  document.getElementById('cloudSyncModal').classList.remove('active');
}

function saveCloudSyncConfig(showNotification) {
  const input = document.getElementById('webhookUrlInput');
  const autoSync = document.getElementById('toggleAutoSync');

  if (input) APP_STATE.cloudSync.webhookUrl = input.value.trim();
  if (autoSync) APP_STATE.cloudSync.autoSync = autoSync.checked;

  try {
    localStorage.setItem('dandora_cloud_sync_config', JSON.stringify({
      webhookUrl: APP_STATE.cloudSync.webhookUrl,
      autoSync: APP_STATE.cloudSync.autoSync,
      pendingQueue: APP_STATE.cloudSync.pendingQueue
    }));
  } catch (e) {}

  updateSyncPillDisplay();
  if (showNotification) {
    showToast('Cloud Sync configuration saved successfully!');
    closeCloudSyncModal();
  }
}

function loadCloudSyncConfig() {
  try {
    const saved = localStorage.getItem('dandora_cloud_sync_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      APP_STATE.cloudSync.webhookUrl = parsed.webhookUrl || '';
      APP_STATE.cloudSync.autoSync = parsed.autoSync !== undefined ? parsed.autoSync : true;
      APP_STATE.cloudSync.pendingQueue = parsed.pendingQueue || [];
    }
  } catch (e) {}
  updateSyncPillDisplay();
}

function updateSyncPillDisplay() {
  const pill = document.getElementById('globalSyncPill');
  const statusText = document.getElementById('syncStatusText');
  const badge = document.getElementById('syncQueueBadge');

  if (!pill) return;

  const queueLen = APP_STATE.cloudSync.pendingQueue.length;
  if (badge) {
    if (queueLen > 0) {
      badge.style.display = 'inline-block';
      badge.innerText = queueLen;
    } else {
      badge.style.display = 'none';
    }
  }

  if (APP_STATE.cloudSync.webhookUrl) {
    pill.className = 'sync-status-pill online';
    if (statusText) statusText.innerText = 'Google Sheets Connected';
  } else {
    pill.className = 'sync-status-pill offline';
    if (statusText) statusText.innerText = 'Local Only';
  }
}

function testCloudConnection() {
  const input = document.getElementById('webhookUrlInput');
  const url = input ? input.value.trim() : APP_STATE.cloudSync.webhookUrl;

  if (!url) {
    showToast('Please enter a Google Apps Script or Webhook URL first.');
    return;
  }

  showToast('Pinging endpoint...');
  const testPayload = {
    type: 'test_ping',
    timestamp: new Date().toISOString(),
    message: 'Test ping from Dandora Associate Portal'
  };

  fetch(url, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testPayload)
  }).then(() => {
    showToast('⚡ Ping successful! Webhook endpoint received payload.');
    APP_STATE.cloudSync.webhookUrl = url;
    saveCloudSyncConfig(false);
  }).catch(err => {
    showToast(`Webhook ping error: ${err.message}`);
  });
}

function dispatchCloudPayload(payload) {
  if (!APP_STATE.cloudSync.autoSync || !APP_STATE.cloudSync.webhookUrl) {
    // Queue offline
    APP_STATE.cloudSync.pendingQueue.push(payload);
    saveCloudSyncConfig(false);
    return;
  }

  fetch(APP_STATE.cloudSync.webhookUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(() => {
    showToast(`Cloud Sync: Sent ${payload.type} to Google Sheets!`);
  }).catch(() => {
    APP_STATE.cloudSync.pendingQueue.push(payload);
    saveCloudSyncConfig(false);
    showToast('Offline: Item queued for sync.');
  });
}

function syncPendingQueue() {
  if (!APP_STATE.cloudSync.webhookUrl) {
    showToast('Please configure a Webhook URL before syncing.');
    return;
  }

  const queue = APP_STATE.cloudSync.pendingQueue;
  if (queue.length === 0) {
    showToast('Queue is empty. Everything is up-to-date!');
    return;
  }

  showToast(`Syncing ${queue.length} items to Google Sheets...`);
  const promises = queue.map(item => {
    return fetch(APP_STATE.cloudSync.webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
  });

  Promise.all(promises).then(() => {
    APP_STATE.cloudSync.pendingQueue = [];
    saveCloudSyncConfig(false);
    showToast('All queued records successfully synced to Google Sheets!');
    closeCloudSyncModal();
  }).catch(() => {
    showToast('Some items failed to sync. Kept in queue.');
  });
}

function copyGoogleScriptCode() {
  const code = `// Google Apps Script - Paste in Extensions > Apps Script
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var sheetName = 'Leads';
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (data.type === 'associate') {
      sheetName = 'Associates';
    }
    
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      if (data.type === 'associate') {
        sheet.appendRow(['Timestamp', 'Associate ID', 'Name', 'Phone', 'Email', 'Status', 'City', 'Skills', 'UPI', 'PAN']);
      } else {
        sheet.appendRow(['Timestamp', 'Lead ID', 'Business Name', 'Contact', 'Phone', 'Category', 'Need', 'Status', 'Est Amount', 'Payout']);
      }
    }
    
    if (data.type === 'associate') {
      sheet.appendRow([new Date(), data.associateId, data.fullName, data.phone, data.email, data.status, data.city, (data.skills || []).join(', '), data.upi, data.pan]);
    } else {
      sheet.appendRow([new Date(), data.id, data.bizName, data.contact, data.phone, data.category, data.need, data.statusText, data.amount, data.payout]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({result: 'success'})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({result: 'error', error: err.toString()})).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}`;

  navigator.clipboard.writeText(code).then(() => {
    showToast('Google Apps Script code copied to clipboard!');
  }).catch(() => {
    showToast('Please copy code manually from the box.');
  });
}

// ==========================================
// 10. FAQ Accordion Logic
// ==========================================
function toggleFaq(btnElem) {
  const item = btnElem.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  const answer = item.querySelector('.faq-answer');

  document.querySelectorAll('.faq-item').forEach(other => {
    if (other !== item) {
      other.classList.remove('open');
      const otherAns = other.querySelector('.faq-answer');
      if (otherAns) otherAns.style.maxHeight = null;
    }
  });

  if (isOpen) {
    item.classList.remove('open');
    answer.style.maxHeight = null;
  } else {
    item.classList.add('open');
    answer.style.maxHeight = `${answer.scrollHeight + 30}px`;
  }
}

// ==========================================
// 11. Data Export Utility (CSV / JSON)
// ==========================================
function exportData(type) {
  let content = '';
  let filename = '';

  if (type === 'leads') {
    const headers = ['ID', 'Business Name', 'Contact', 'Phone', 'Category', 'Need', 'Status', 'Estimated Value', 'Payout'];
    const rows = APP_STATE.leads.map(l => [
      l.id, `"${l.bizName}"`, `"${l.contact}"`, l.phone, `"${l.category}"`, `"${l.need}"`, `"${l.statusText}"`, l.amount, l.payout
    ]);
    content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    filename = 'dandora_associate_leads.csv';
  } else if (type === 'associate') {
    const data = APP_STATE.associateData || {
      associateId: 'DAN-HYD-2026-8942',
      status: 'Associate Scout',
      chapter: 'Hyderabad',
      badges: APP_STATE.quizTrackState,
      issuedDate: new Date().toLocaleDateString()
    };
    content = JSON.stringify(data, null, 2);
    filename = 'dandora_partner_pass.json';
  }

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast(`Exported ${filename} successfully!`);
}

// Modal Utilities & App Download
function openAppModal() {
  document.getElementById('appDownloadModal').classList.add('active');
}

function closeAppModal() {
  document.getElementById('appDownloadModal').classList.remove('active');
}

function simulateDownload(channel) {
  showToast(`Initiating download via ${channel}... Ready in 5 seconds!`);
  setTimeout(() => {
    closeAppModal();
  }, 1500);
}

// Mobile Menu Toggle
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.querySelector('.nav-links');

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      const isVisible = navLinks.style.display === 'flex';
      navLinks.style.display = isVisible ? 'none' : 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '74px';
      navLinks.style.left = '0';
      navLinks.style.right = '0';
      navLinks.style.background = '#0d1527';
      navLinks.style.padding = '1.5rem';
      navLinks.style.borderBottom = '1px solid var(--border-subtle)';
    });
  }
}

// Toast Notifications
function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span style="color: var(--cyan); font-size: 1.1rem;">⚡</span>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// HTML Escaping Helper
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
