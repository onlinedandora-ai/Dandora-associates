/**
 * Dandora.online Associate Platform - Onboarding Wizard Logic (register.js)
 * Implements 4-step progressive onboarding, OTP verification, skills matrix, and KYC setup.
 */

(function (window) {
  'use strict';

  const DRAFT_KEY = 'dandora_onboarding_draft_v2';

  const WizardApp = {
    currentStep: 1,
    selectedSkills: new Set(['sk_bd_01']), // Default 1 selected
    otpTimer: null,
    otpSecondsLeft: 60,
    createdAssociate: null,

    init: () => {
      WizardApp.renderMasterSkills();
      WizardApp.loadDraft();
      WizardApp.updateProgressUI();
    },

    // ----------------------------------------------------
    // UI & Step Transitions
    // ----------------------------------------------------
    goToStep: (step) => {
      // Guard: Cannot skip step 1 without an account
      if (step > 1 && !WizardApp.createdAssociate) {
        alert('Please complete Step 1 (Account creation & mobile verification) first.');
        return;
      }

      WizardApp.currentStep = step;
      WizardApp.updateProgressUI();

      // Show panel
      document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
      const activePanel = document.getElementById(`stepPanel${step}`);
      if (activePanel) activePanel.classList.add('active');

      window.scrollTo({ top: 120, behavior: 'smooth' });
    },

    updateProgressUI: () => {
      const percentage = WizardApp.currentStep * 25;
      const progressFill = document.getElementById('progressFill');
      if (progressFill) progressFill.style.width = `${percentage}%`;

      for (let i = 1; i <= 4; i++) {
        const item = document.getElementById(`stepIndicator${i}`);
        if (!item) continue;
        item.classList.remove('active', 'completed');
        if (i < WizardApp.currentStep) {
          item.classList.add('completed');
        } else if (i === WizardApp.currentStep) {
          item.classList.add('active');
        }
      }
    },

    indicateAutosave: (msg = 'Draft saved locally') => {
      const text = document.getElementById('autosaveText');
      if (text) {
        text.innerText = msg;
        setTimeout(() => {
          text.innerText = 'Draft saved locally';
        }, 3000);
      }
    },

    saveDraft: () => {
      const draft = {
        fullName: document.getElementById('fullName')?.value || '',
        mobileNumber: document.getElementById('mobileNumber')?.value || '',
        email: document.getElementById('email')?.value || '',
        referralCode: document.getElementById('referralCode')?.value || '',
        dob: document.getElementById('dob')?.value || '',
        gender: document.getElementById('gender')?.value || '',
        addressLine: document.getElementById('addressLine')?.value || '',
        locality: document.getElementById('locality')?.value || '',
        city: document.getElementById('city')?.value || 'Hyderabad',
        state: document.getElementById('state')?.value || 'Telangana',
        pincode: document.getElementById('pincode')?.value || '',
        highestEducation: document.getElementById('highestEducation')?.value || '',
        degreeSpecialization: document.getElementById('degreeSpecialization')?.value || '',
        institutionName: document.getElementById('institutionName')?.value || '',
        profileSegment: document.getElementById('profileSegment')?.value || 'Student',
        weeklyAvailability: document.getElementById('weeklyAvailability')?.value || '10-15 hours/week',
        portfolioUrl: document.getElementById('portfolioUrl')?.value || '',
        skills: Array.from(WizardApp.selectedSkills),
        panNumber: document.getElementById('panNumber')?.value || '',
        upiId: document.getElementById('upiId')?.value || '',
        accountHolderName: document.getElementById('accountHolderName')?.value || '',
        ifscCode: document.getElementById('ifscCode')?.value || ''
      };

      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        WizardApp.indicateAutosave('Autosaved draft');
      } catch (e) {}
    },

    loadDraft: () => {
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (!raw) return;
        const d = JSON.parse(raw);
        if (d.fullName) document.getElementById('fullName').value = d.fullName;
        if (d.mobileNumber) document.getElementById('mobileNumber').value = d.mobileNumber;
        if (d.email) document.getElementById('email').value = d.email;
        if (d.referralCode) document.getElementById('referralCode').value = d.referralCode;
        if (d.dob) document.getElementById('dob').value = d.dob;
        if (d.gender) document.getElementById('gender').value = d.gender;
        if (d.addressLine) document.getElementById('addressLine').value = d.addressLine;
        if (d.locality) document.getElementById('locality').value = d.locality;
        if (d.pincode) document.getElementById('pincode').value = d.pincode;
        if (d.highestEducation) document.getElementById('highestEducation').value = d.highestEducation;
        if (d.degreeSpecialization) document.getElementById('degreeSpecialization').value = d.degreeSpecialization;
        if (d.institutionName) document.getElementById('institutionName').value = d.institutionName;
        if (d.profileSegment) document.getElementById('profileSegment').value = d.profileSegment;
        if (d.weeklyAvailability) document.getElementById('weeklyAvailability').value = d.weeklyAvailability;
        if (d.portfolioUrl) document.getElementById('portfolioUrl').value = d.portfolioUrl;
        if (d.panNumber) document.getElementById('panNumber').value = d.panNumber;
        if (d.upiId) document.getElementById('upiId').value = d.upiId;
        if (d.accountHolderName) document.getElementById('accountHolderName').value = d.accountHolderName;
        if (d.ifscCode) document.getElementById('ifscCode').value = d.ifscCode;
        if (d.skills && Array.isArray(d.skills)) {
          WizardApp.selectedSkills = new Set(d.skills);
        }
      } catch (e) {}
    },

    // ----------------------------------------------------
    // Skills Matrix Renderer
    // ----------------------------------------------------
    renderMasterSkills: () => {
      const skills = window.DandoraDB.getTable('skills');
      const containers = {
        'Business Development': document.getElementById('bdSkillsContainer'),
        'Digital Marketing': document.getElementById('dmSkillsContainer'),
        'Creative & Content': document.getElementById('crSkillsContainer'),
        'Tech & Integration': document.getElementById('tcSkillsContainer')
      };

      Object.values(containers).forEach(c => { if (c) c.innerHTML = ''; });

      skills.forEach(skill => {
        const container = containers[skill.category];
        if (!container) return;

        const isSelected = WizardApp.selectedSkills.has(skill.id);
        const chip = document.createElement('div');
        chip.className = `skill-chip ${isSelected ? 'selected' : ''}`;
        chip.innerText = skill.name;
        chip.onclick = () => WizardApp.toggleSkill(skill.id, chip);
        container.appendChild(chip);
      });
    },

    toggleSkill: (skillId, chipEl) => {
      if (WizardApp.selectedSkills.has(skillId)) {
        // Enforce at least 1 skill
        if (WizardApp.selectedSkills.size === 1) {
          alert('At least one primary skill is required for partner onboarding.');
          return;
        }
        WizardApp.selectedSkills.delete(skillId);
        chipEl.classList.remove('selected');
      } else {
        WizardApp.selectedSkills.add(skillId);
        chipEl.classList.add('selected');
      }
      WizardApp.saveDraft();
    },

    // ----------------------------------------------------
    // Step 1: Account Creation & OTP
    // ----------------------------------------------------
    handleStep1Submit: async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('fullName').value.trim();
      const mobileNumber = document.getElementById('mobileNumber').value.trim();
      const email = document.getElementById('email').value.trim();

      if (!fullName || !mobileNumber || !email) {
        alert('Please fill out all required fields.');
        return;
      }

      const sendBtn = document.getElementById('sendOtpBtn');
      sendBtn.innerText = 'Sending OTP...';
      sendBtn.disabled = true;

      try {
        const res = await window.DandoraAPI.auth.sendOtp(mobileNumber);
        document.getElementById('otpMobileDisplay').innerText = res.data.mobile;
        WizardApp.openOtpModal();
      } catch (err) {
        alert(err.message || 'Error sending OTP');
      } finally {
        sendBtn.innerText = 'Verify Mobile via OTP →';
        sendBtn.disabled = false;
      }
    },

    openOtpModal: () => {
      const modal = document.getElementById('otpModal');
      modal.classList.add('active');
      WizardApp.startOtpTimer();
      const firstInput = document.querySelector('.otp-digit');
      if (firstInput) firstInput.focus();
    },

    closeOtpModal: () => {
      document.getElementById('otpModal').classList.remove('active');
      clearInterval(WizardApp.otpTimer);
    },

    startOtpTimer: () => {
      clearInterval(WizardApp.otpTimer);
      WizardApp.otpSecondsLeft = 55;
      const display = document.getElementById('otpCountdown');
      const resendBtn = document.getElementById('resendOtpBtn');
      resendBtn.disabled = true;

      WizardApp.otpTimer = setInterval(() => {
        WizardApp.otpSecondsLeft--;
        if (display) display.innerText = WizardApp.otpSecondsLeft;
        if (WizardApp.otpSecondsLeft <= 0) {
          clearInterval(WizardApp.otpTimer);
          resendBtn.disabled = false;
        }
      }, 1000);
    },

    focusNextOtp: (el, index) => {
      if (el.value.length === 1) {
        const next = document.querySelectorAll('.otp-digit')[index + 1];
        if (next) next.focus();
      }
    },

    autoFillDemoOtp: () => {
      const digits = ['1', '2', '3', '4', '5', '6'];
      document.querySelectorAll('.otp-digit').forEach((input, idx) => {
        input.value = digits[idx];
      });
    },

    resendOtp: async () => {
      const mobile = document.getElementById('mobileNumber').value;
      await window.DandoraAPI.auth.sendOtp(mobile);
      WizardApp.startOtpTimer();
    },

    submitOtpVerification: async () => {
      let code = '';
      document.querySelectorAll('.otp-digit').forEach(input => code += input.value);

      if (code.length < 6) {
        alert('Please enter all 6 digits of the OTP.');
        return;
      }

      const mobile = document.getElementById('mobileNumber').value;
      try {
        await window.DandoraAPI.auth.verifyOtp(mobile, code);
        WizardApp.closeOtpModal();

        // Create Associate Record via API
        const regData = {
          fullName: document.getElementById('fullName').value.trim(),
          mobileNumber: mobile,
          email: document.getElementById('email').value.trim(),
          referralCode: document.getElementById('referralCode').value.trim()
        };

        const res = await window.DandoraAPI.associates.registerStep1(regData);
        WizardApp.createdAssociate = res.data;
        WizardApp.saveDraft();

        alert(`✓ Mobile verified! Your Associate ID is ${res.data.associate_code}`);
        WizardApp.goToStep(2);
      } catch (err) {
        alert(err.message || 'OTP verification failed. Please check code.');
      }
    },

    // ----------------------------------------------------
    // Step 2: Demographics & Education
    // ----------------------------------------------------
    handleStep2Submit: async (e) => {
      e.preventDefault();
      const profileData = {
        address_line: document.getElementById('addressLine').value.trim(),
        locality: document.getElementById('locality').value.trim(),
        city: document.getElementById('city').value.trim(),
        state: document.getElementById('state').value.trim(),
        pincode: document.getElementById('pincode').value.trim(),
        highest_education: document.getElementById('highestEducation').value,
        degree_specialization: document.getElementById('degreeSpecialization').value.trim(),
        institution_name: document.getElementById('institutionName').value.trim(),
        profile_segment: document.getElementById('profileSegment').value
      };

      const assocId = WizardApp.createdAssociate ? WizardApp.createdAssociate.id : null;
      await window.DandoraAPI.associates.updateProfile(profileData, assocId);

      // Also update DOB/Gender on user record
      const dob = document.getElementById('dob').value;
      const gender = document.getElementById('gender').value;
      if (assocId) {
        window.DandoraDB.update('users_associate', assocId, { date_of_birth: dob, gender: gender });
      }

      WizardApp.saveDraft();
      WizardApp.goToStep(3);
    },

    // ----------------------------------------------------
    // Step 3: Skills & Availability
    // ----------------------------------------------------
    handleStep3Submit: async (e) => {
      e.preventDefault();
      if (WizardApp.selectedSkills.size === 0) {
        alert('Please select at least 1 skill.');
        return;
      }

      const assocId = WizardApp.createdAssociate ? WizardApp.createdAssociate.id : null;
      const skillItems = Array.from(WizardApp.selectedSkills).map(skId => ({
        skill_id: skId,
        experience_level: 'Intermediate'
      }));

      await window.DandoraAPI.associates.updateSkills(skillItems, assocId);

      // Update availability & portfolio
      const profileData = {
        weekly_availability: document.getElementById('weeklyAvailability').value,
        portfolio_url: document.getElementById('portfolioUrl').value.trim()
      };
      await window.DandoraAPI.associates.updateProfile(profileData, assocId);

      WizardApp.saveDraft();
      WizardApp.goToStep(4);
    },

    // ----------------------------------------------------
    // Step 4: KYC & Payout
    // ----------------------------------------------------
    lookupIfsc: (code) => {
      const clean = (code || '').toUpperCase().trim();
      const output = document.getElementById('ifscBranchOutput');
      if (!output) return;

      if (clean.startsWith('HDFC')) {
        output.innerText = '✓ HDFC Bank - Madhapur Branch, Hyderabad';
        output.style.display = 'inline-block';
      } else if (clean.startsWith('SBIN')) {
        output.innerText = '✓ State Bank of India - Hyderabad Main Branch';
        output.style.display = 'inline-block';
      } else if (clean.startsWith('ICIC')) {
        output.innerText = '✓ ICICI Bank - Banjara Hills Branch, Hyderabad';
        output.style.display = 'inline-block';
      } else if (clean.length >= 11) {
        output.innerText = '✓ Verified Nationalized Indian Banking Branch';
        output.style.display = 'inline-block';
      } else {
        output.style.display = 'none';
      }
    },

    handleFileUpload: (input) => {
      if (input.files && input.files[0]) {
        const file = input.files[0];
        const dropzone = document.getElementById('dropzoneContent');
        dropzone.innerHTML = `
          <span class="upload-icon">✅</span>
          <span class="upload-text" style="color:#10b981;">${file.name} (${(file.size / 1024).toFixed(1)} KB)</span>
          <span class="upload-sub">File attached for compliance inspection. Click to change.</span>
        `;
      }
    },

    handleStep4Submit: async (e) => {
      e.preventDefault();
      const pan = document.getElementById('panNumber').value.trim();
      const upi = document.getElementById('upiId').value.trim();

      // PAN Regex: 5 letters, 4 digits, 1 letter
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
      if (pan && !panRegex.test(pan)) {
        alert('Invalid PAN format. Example: ABCDE1234F');
        return;
      }

      const kycPayload = {
        pan: pan,
        upiId: upi,
        accountHolderName: document.getElementById('accountHolderName').value.trim(),
        accountNumber: document.getElementById('bankAccountNumber').value.trim(),
        ifscCode: document.getElementById('ifscCode').value.trim(),
        bankName: document.getElementById('ifscBranchOutput')?.innerText.replace('✓ ', '') || 'Primary Bank',
        panDocUrl: 'docs/pan_submitted_' + Date.now() + '.pdf'
      };

      const assocId = WizardApp.createdAssociate ? WizardApp.createdAssociate.id : null;
      await window.DandoraAPI.associates.updateKYC(kycPayload, assocId);

      WizardApp.showSuccessLaunchpad();
    },

    skipKYCAndFinish: () => {
      if (confirm('KYC and payout details can be submitted anytime before your first commission disbursement. Proceed to dashboard now?')) {
        WizardApp.showSuccessLaunchpad();
      }
    },

    showSuccessLaunchpad: () => {
      const modal = document.getElementById('successModal');
      const assoc = WizardApp.createdAssociate || window.DandoraAPI.auth.getCurrentSession();

      document.getElementById('issuedAssociateId').innerText = assoc.associate_code || 'DAN-HYD-1043';
      document.getElementById('issuedHolderName').innerText = assoc.full_name || document.getElementById('fullName').value;

      modal.classList.add('active');
      localStorage.removeItem(DRAFT_KEY);
    }
  };

  window.WizardApp = WizardApp;
  document.addEventListener('DOMContentLoaded', WizardApp.init);
})(window);
