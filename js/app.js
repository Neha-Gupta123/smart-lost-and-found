/**
 * Smart Missing Items Finder AI - Main Application Controller
 * Day 1: Navigation & Layout Interactions
 * Day 2: Intake Forms, Validation, LocalStorage Persistence & List Display
 * Day 3: Rule-Based Matching Engine UI, Scoring & Explanation Displays
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. Navigation & UI Controls (Preserved from Day 1)
  // =========================================================================
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = navLinks.classList.toggle('is-open');
      mobileToggle.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    });

    navLinks.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  });

  // Close mobile drawer when clicking outside
  document.addEventListener('click', (e) => {
    if (navLinks && navLinks.classList.contains('is-open')) {
      if (!navLinks.contains(e.target) && mobileToggle && !mobileToggle.contains(e.target)) {
        navLinks.classList.remove('is-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // Active section scroll highlighter
  const trackedSections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links .nav-link');
  if ('IntersectionObserver' in window && trackedSections.length > 0) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navAnchors.forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });

    trackedSections.forEach(sec => navObserver.observe(sec));
  }

  // =========================================================================
  // 2. Day 2: Tab Switching (Missing vs. Found Forms)
  // =========================================================================
  const tabMissing = document.getElementById('tabMissing');
  const tabFound = document.getElementById('tabFound');
  const panelMissing = document.getElementById('panelMissing');
  const panelFound = document.getElementById('panelFound');

  function switchFormTab(activeTab) {
    if (activeTab === 'missing') {
      tabMissing.classList.add('active');
      tabMissing.setAttribute('aria-selected', 'true');
      tabFound.classList.remove('active');
      tabFound.setAttribute('aria-selected', 'false');

      panelMissing.classList.remove('hidden');
      panelFound.classList.add('hidden');
    } else {
      tabFound.classList.add('active');
      tabFound.setAttribute('aria-selected', 'true');
      tabMissing.classList.remove('active');
      tabMissing.setAttribute('aria-selected', 'false');

      panelFound.classList.remove('hidden');
      panelMissing.classList.add('hidden');
    }
  }

  if (tabMissing && tabFound) {
    tabMissing.addEventListener('click', () => switchFormTab('missing'));
    tabFound.addEventListener('click', () => switchFormTab('found'));
  }

  // Hero CTA Buttons
  const heroReportMissingBtn = document.getElementById('heroReportMissingBtn');
  const heroReportFoundBtn = document.getElementById('heroReportFoundBtn');
  const heroViewMatchesBtn = document.getElementById('heroViewMatchesBtn');

  if (heroReportMissingBtn) {
    heroReportMissingBtn.addEventListener('click', () => {
      switchFormTab('missing');
    });
  }
  if (heroReportFoundBtn) {
    heroReportFoundBtn.addEventListener('click', () => {
      switchFormTab('found');
    });
  }

  // Set default dates to today for convenience
  const todayStr = new Date().toISOString().split('T')[0];
  const missingDateInput = document.getElementById('missingDate');
  const foundDateInput = document.getElementById('foundDate');
  if (missingDateInput && !missingDateInput.value) missingDateInput.value = todayStr;
  if (foundDateInput && !foundDateInput.value) foundDateInput.value = todayStr;

  // =========================================================================
  // 3. Image Upload & Preview Processing
  // =========================================================================
  let missingImageData = null;
  let foundImageData = null;

  function handlePhotoUpload(inputElement, previewWrap, previewImg, removeBtn, onDataReady) {
    inputElement.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) {
        onDataReady(null);
        previewWrap.style.display = 'none';
        removeBtn.style.display = 'none';
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (PNG, JPG, WebP).');
        inputElement.value = '';
        onDataReady(null);
        previewWrap.style.display = 'none';
        removeBtn.style.display = 'none';
        return;
      }

      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const img = new Image();
        img.onload = () => {
          // Scale to max dimension 500px to keep localStorage payload compact
          const maxDim = 500;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          onDataReady(compressedDataUrl);

          previewImg.src = compressedDataUrl;
          previewWrap.style.display = 'flex';
          removeBtn.style.display = 'inline-flex';
        };
        img.src = loadEvt.target.result;
      };
      reader.readAsDataURL(file);
    });

    removeBtn.addEventListener('click', () => {
      inputElement.value = '';
      onDataReady(null);
      previewImg.src = '';
      previewWrap.style.display = 'none';
      removeBtn.style.display = 'none';
    });
  }

  // Setup photo handlers
  const missingPhotoInput = document.getElementById('missingPhoto');
  const missingPhotoPreviewWrap = document.getElementById('missingPhotoPreviewWrap');
  const missingPhotoPreview = document.getElementById('missingPhotoPreview');
  const missingRemovePhotoBtn = document.getElementById('missingRemovePhotoBtn');

  if (missingPhotoInput && missingPhotoPreviewWrap) {
    handlePhotoUpload(
      missingPhotoInput,
      missingPhotoPreviewWrap,
      missingPhotoPreview,
      missingRemovePhotoBtn,
      (data) => { missingImageData = data; }
    );
  }

  const foundPhotoInput = document.getElementById('foundPhoto');
  const foundPhotoPreviewWrap = document.getElementById('foundPhotoPreviewWrap');
  const foundPhotoPreview = document.getElementById('foundPhotoPreview');
  const foundRemovePhotoBtn = document.getElementById('foundRemovePhotoBtn');

  if (foundPhotoInput && foundPhotoPreviewWrap) {
    handlePhotoUpload(
      foundPhotoInput,
      foundPhotoPreviewWrap,
      foundPhotoPreview,
      foundRemovePhotoBtn,
      (data) => { foundImageData = data; }
    );
  }

  // =========================================================================
  // 4. Form Alerts & Validation Helpers
  // =========================================================================
  function showAlert(alertEl, type, message) {
    alertEl.className = 'form-alert ' + (type === 'success' ? 'alert-success' : 'alert-error') + ' is-visible';
    const icon = alertEl.querySelector('.alert-icon');
    const msg = alertEl.querySelector('.alert-message');
    if (icon) icon.textContent = type === 'success' ? '✅' : '⚠️';
    if (msg) msg.textContent = message;
    alertEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideAlert(alertEl) {
    alertEl.className = 'form-alert';
    const msg = alertEl.querySelector('.alert-message');
    if (msg) msg.textContent = '';
  }

  function clearFieldValidation(form) {
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  }

  // =========================================================================
  // 5. Missing Item Form Submission
  // =========================================================================
  const formMissing = document.getElementById('formMissing');
  const missingAlert = document.getElementById('missingAlert');
  const missingClearBtn = document.getElementById('missingClearBtn');

  if (formMissing) {
    formMissing.addEventListener('submit', (e) => {
      e.preventDefault();
      clearFieldValidation(formMissing);
      hideAlert(missingAlert);

      const name = document.getElementById('missingName');
      const category = document.getElementById('missingCategory');
      const date = document.getElementById('missingDate');
      const org = document.getElementById('missingOrg');
      const location = document.getElementById('missingLocation');
      const colour = document.getElementById('missingColour');
      const brand = document.getElementById('missingBrand');
      const desc = document.getElementById('missingDesc');

      const errors = [];

      if (!name.value.trim()) {
        errors.push('Item Name is required.');
        name.classList.add('is-invalid');
      }
      if (!category.value) {
        errors.push('Category selection is required.');
        category.classList.add('is-invalid');
      }
      if (!date.value) {
        errors.push('Date Lost is required.');
        date.classList.add('is-invalid');
      }
      if (!org.value.trim()) {
        errors.push('Organization / Facility is required.');
        org.classList.add('is-invalid');
      }
      if (!location.value.trim()) {
        errors.push('Location is required.');
        location.classList.add('is-invalid');
      }
      if (!desc.value.trim()) {
        errors.push('Description is required.');
        desc.classList.add('is-invalid');
      }

      if (errors.length > 0) {
        showAlert(missingAlert, 'error', 'Please fill in all required fields marked with * (' + errors.join(' ') + ')');
        const firstInvalid = formMissing.querySelector('.is-invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const reportData = {
        type: 'missing',
        name: name.value.trim(),
        category: category.value,
        date: date.value,
        organization: org.value.trim(),
        location: location.value.trim(),
        colour: colour.value.trim() || 'Not specified',
        brand: brand.value.trim() || 'Not specified',
        description: desc.value.trim(),
        photo: missingImageData || null
      };

      try {
        window.ReportStore.add(reportData);
        showAlert(missingAlert, 'success', `Success! Missing report for "${reportData.name}" has been recorded and saved in localStorage.`);

        formMissing.reset();
        if (missingDateInput) missingDateInput.value = todayStr;
        missingImageData = null;
        if (missingPhotoPreviewWrap) missingPhotoPreviewWrap.style.display = 'none';
        if (missingRemovePhotoBtn) missingRemovePhotoBtn.style.display = 'none';

        // Refresh views in real-time
        renderReports();
        renderMatches();
      } catch (err) {
        showAlert(missingAlert, 'error', 'Failed to save report: ' + err.message);
      }
    });

    if (missingClearBtn) {
      missingClearBtn.addEventListener('click', () => {
        formMissing.reset();
        if (missingDateInput) missingDateInput.value = todayStr;
        clearFieldValidation(formMissing);
        hideAlert(missingAlert);
        missingImageData = null;
        if (missingPhotoPreview) missingPhotoPreview.src = '';
        if (missingPhotoInput) missingPhotoInput.value = '';
        if (missingPhotoPreviewWrap) missingPhotoPreviewWrap.style.display = 'none';
        if (missingRemovePhotoBtn) missingRemovePhotoBtn.style.display = 'none';
      });
    }
  }

  // =========================================================================
  // 6. Found Item Form Submission
  // =========================================================================
  const formFound = document.getElementById('formFound');
  const foundAlert = document.getElementById('foundAlert');
  const foundClearBtn = document.getElementById('foundClearBtn');

  if (formFound) {
    formFound.addEventListener('submit', (e) => {
      e.preventDefault();
      clearFieldValidation(formFound);
      hideAlert(foundAlert);

      const name = document.getElementById('foundName');
      const category = document.getElementById('foundCategory');
      const date = document.getElementById('foundDate');
      const org = document.getElementById('foundOrg');
      const location = document.getElementById('foundLocation');
      const colour = document.getElementById('foundColour');
      const brand = document.getElementById('foundBrand');
      const desc = document.getElementById('foundDesc');

      const errors = [];

      if (!name.value.trim()) {
        errors.push('Item Name is required.');
        name.classList.add('is-invalid');
      }
      if (!category.value) {
        errors.push('Category selection is required.');
        category.classList.add('is-invalid');
      }
      if (!date.value) {
        errors.push('Date Found is required.');
        date.classList.add('is-invalid');
      }
      if (!org.value.trim()) {
        errors.push('Organization / Facility is required.');
        org.classList.add('is-invalid');
      }
      if (!location.value.trim()) {
        errors.push('Location is required.');
        location.classList.add('is-invalid');
      }
      if (!desc.value.trim()) {
        errors.push('Description is required.');
        desc.classList.add('is-invalid');
      }

      if (errors.length > 0) {
        showAlert(foundAlert, 'error', 'Please fill in all required fields marked with * (' + errors.join(' ') + ')');
        const firstInvalid = formFound.querySelector('.is-invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const reportData = {
        type: 'found',
        name: name.value.trim(),
        category: category.value,
        date: date.value,
        organization: org.value.trim(),
        location: location.value.trim(),
        colour: colour.value.trim() || 'Not specified',
        brand: brand.value.trim() || 'Not specified',
        description: desc.value.trim(),
        photo: foundImageData || null
      };

      try {
        window.ReportStore.add(reportData);
        showAlert(foundAlert, 'success', `Success! Found report for "${reportData.name}" has been recorded and saved in localStorage.`);

        formFound.reset();
        if (foundDateInput) foundDateInput.value = todayStr;
        foundImageData = null;
        if (foundPhotoPreviewWrap) foundPhotoPreviewWrap.style.display = 'none';
        if (foundRemovePhotoBtn) foundRemovePhotoBtn.style.display = 'none';

        // Refresh views in real-time
        renderReports();
        renderMatches();
      } catch (err) {
        showAlert(foundAlert, 'error', 'Failed to save report: ' + err.message);
      }
    });

    if (foundClearBtn) {
      foundClearBtn.addEventListener('click', () => {
        formFound.reset();
        if (foundDateInput) foundDateInput.value = todayStr;
        clearFieldValidation(formFound);
        hideAlert(foundAlert);
        foundImageData = null;
        if (foundPhotoPreview) foundPhotoPreview.src = '';
        if (foundPhotoInput) foundPhotoInput.value = '';
        if (foundPhotoPreviewWrap) foundPhotoPreviewWrap.style.display = 'none';
        if (foundRemovePhotoBtn) foundRemovePhotoBtn.style.display = 'none';
      });
    }
  }

  // =========================================================================
  // 7. Submitted Reports Display, Filter & Actions
  // =========================================================================
  let currentFilter = 'all';
  const reportsGrid = document.getElementById('reportsGrid');
  const countAll = document.getElementById('countAll');
  const countMissing = document.getElementById('countMissing');
  const countFound = document.getElementById('countFound');
  const btnClearAll = document.getElementById('btnClearAll');

  // Utility to prevent XSS in rendered cards
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderReports() {
    if (!reportsGrid || !window.ReportStore) return;

    const allReports = window.ReportStore.getAll();
    const missingReports = allReports.filter(item => item && item.type === 'missing');
    const foundReports = allReports.filter(item => item && item.type === 'found');

    if (countAll) countAll.textContent = allReports.length;
    if (countMissing) countMissing.textContent = missingReports.length;
    if (countFound) countFound.textContent = foundReports.length;

    let displayedReports = allReports;
    if (currentFilter === 'missing') displayedReports = missingReports;
    if (currentFilter === 'found') displayedReports = foundReports;

    reportsGrid.innerHTML = '';

    if (displayedReports.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'empty-state';
      emptyDiv.innerHTML = `
        <div class="empty-state-icon">📭</div>
        <h3 class="empty-state-title">No Reports Found</h3>
        <p class="empty-state-text">
          ${allReports.length === 0 
            ? 'No missing or found items have been reported yet. Fill in one of the forms above to create your first report.' 
            : 'No records found matching the current filter.'}
        </p>
      `;
      reportsGrid.appendChild(emptyDiv);
      return;
    }

    displayedReports.forEach(item => {
      const card = document.createElement('article');
      card.className = 'report-item-card';

      const isMissing = item.type === 'missing';
      const typeBadgeClass = isMissing ? 'type-missing' : 'type-found';
      const typeLabel = isMissing ? '🚨 Missing' : '🎁 Found';
      const dateLabel = isMissing ? 'Lost On' : 'Found On';

      let formattedCreated = '';
      if (item.createdAt) {
        const d = new Date(item.createdAt);
        formattedCreated = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      card.innerHTML = `
        <div class="report-card-top">
          <span class="item-type-badge ${typeBadgeClass}">${typeLabel}</span>
          <span class="item-category-tag">${escapeHtml(item.category)}</span>
        </div>
        <h3 class="report-item-title">${escapeHtml(item.name)}</h3>
        
        <div class="report-item-meta">
          <div class="meta-row">
            <span class="meta-label">📅 ${dateLabel}</span>
            <span class="meta-val">${escapeHtml(item.date || 'Not specified')}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">🏢 Organization</span>
            <span class="meta-val">${escapeHtml(item.organization || 'Not specified')}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">📍 Location</span>
            <span class="meta-val">${escapeHtml(item.location || 'Not specified')}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">🎨 Colour</span>
            <span class="meta-val">${escapeHtml(item.colour || 'Not specified')}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">🏷️ Brand</span>
            <span class="meta-val">${escapeHtml(item.brand || 'Not specified')}</span>
          </div>
        </div>

        <p class="report-item-desc">${escapeHtml(item.description || 'No description provided.')}</p>

        ${item.photo ? `
          <div class="report-item-photo">
            <img src="${item.photo}" alt="${escapeHtml(item.name)} photo thumbnail" loading="lazy">
          </div>
        ` : ''}

        <div class="report-card-footer">
          <span>Submitted: ${escapeHtml(formattedCreated || item.date)}</span>
          <button type="button" class="btn-delete-report" data-id="${item.id}" title="Delete this report">
            ✕ Delete
          </button>
        </div>
      `;

      const deleteBtn = card.querySelector('.btn-delete-report');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          if (confirm(`Are you sure you want to delete the report for "${item.name}"?`)) {
            window.ReportStore.remove(item.id);
            renderReports();
            renderMatches();
          }
        });
      }

      reportsGrid.appendChild(card);
    });
  }

  // Filter Pill Listeners
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', function () {
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      this.classList.add('active');
      currentFilter = this.getAttribute('data-filter') || 'all';
      renderReports();
    });
  });

  // Clear All Handler
  if (btnClearAll) {
    btnClearAll.addEventListener('click', () => {
      const total = window.ReportStore ? window.ReportStore.getAll().length : 0;
      if (total === 0) {
        alert('There are no submitted reports to clear.');
        return;
      }
      if (confirm(`Warning: This will permanently remove all ${total} saved reports from browser localStorage. Do you want to proceed?`)) {
        window.ReportStore.clearAll();
        renderReports();
        renderMatches();
      }
    });
  }

  // =========================================================================
  // 8. Day 3: Rule-Based Matching Engine UI & Display
  // =========================================================================
  const matchesGrid = document.getElementById('matchesGrid');
  const matchesTotalCount = document.getElementById('matchesTotalCount');
  let currentMinMatchScore = 25;

  function renderMatches() {
    if (!matchesGrid || !window.MatchingEngine || !window.ReportStore) return;

    const allReports = window.ReportStore.getAll();
    const missingReports = allReports.filter(item => item && item.type === 'missing');
    const foundReports = allReports.filter(item => item && item.type === 'found');

    // Auto-generate notifications for all detected matches (>= 25%) without duplicates
    if (window.NotificationStore && missingReports.length > 0 && foundReports.length > 0) {
      const allDetectedMatches = window.MatchingEngine.findAllMatches(allReports, 25);
      allDetectedMatches.forEach(match => {
        const m = match.missingItem;
        const f = match.foundItem;
        if (m && f && m.id && f.id) {
          const pairKey = `${m.id}_${f.id}`;
          if (!window.NotificationStore.hasPair(pairKey)) {
            window.NotificationStore.add({
              pairKey: pairKey,
              missingId: m.id,
              foundId: f.id,
              missingName: m.name,
              foundName: f.name,
              category: m.category || f.category || 'General',
              score: match.score,
              confidenceLabel: match.confidenceLabel,
              confidenceClass: match.confidenceClass,
              summary: `Possible match detected between Missing "${m.name}" and Found "${f.name}" (${match.score}% estimated similarity).`,
              reasons: Array.isArray(match.reasons) ? match.reasons.slice(0, 3) : [],
              createdAt: new Date().toISOString()
            });
          }
        }
      });
    }

    // Retrieve all possible matches at current threshold for display
    const matches = window.MatchingEngine.findAllMatches(allReports, currentMinMatchScore);

    if (matchesTotalCount) {
      matchesTotalCount.textContent = matches.length;
    }

    matchesGrid.innerHTML = '';

    // Handle "No possible matches found" appropriately
    if (matches.length === 0) {
      const emptyCard = document.createElement('div');
      emptyCard.className = 'matches-empty-card';

      if (missingReports.length === 0 || foundReports.length === 0) {
        emptyCard.innerHTML = `
          <div class="matches-empty-icon">📭</div>
          <h3 class="matches-empty-title">Insufficient Reports to Evaluate</h3>
          <p class="matches-empty-text">
            To find possible matches, the engine requires at least <strong>one Missing Item</strong> and <strong>one Found Item</strong>.
            Currently registered: ${missingReports.length} missing, ${foundReports.length} found.
          </p>
        `;
      } else {
        emptyCard.innerHTML = `
          <div class="matches-empty-icon">🔍</div>
          <h3 class="matches-empty-title">No Possible Matches Found</h3>
          <p class="matches-empty-text">
            Evaluated ${missingReports.length} missing report(s) against ${foundReports.length} found report(s).
            None of the current reports share enough matching attributes (category, name, colour, brand, or location) to meet the selected confidence threshold (${currentMinMatchScore}%).
          </p>
        `;
      }
      matchesGrid.appendChild(emptyCard);
      renderNotifications();
      renderDashboard();
      return;
    }

    // Render each matched pair
    matches.forEach(match => {
      const card = document.createElement('article');
      card.className = 'match-card';

      const m = match.missingItem;
      const f = match.foundItem;

      card.innerHTML = `
        <div class="match-card-header">
          <div class="match-score-pill ${escapeHtml(match.confidenceClass)}">
            <span class="score-number">${match.score}%</span>
            <div class="score-text">
              <strong>${escapeHtml(match.confidenceLabel)}</strong>
              <span>Heuristic Estimate</span>
            </div>
          </div>
          <div class="match-estimate-disclaimer">
            *Rule-based similarity score. Verify physical evidence before recovery.
          </div>
        </div>

        <div class="match-comparison-layout">
          <!-- Missing Item Column -->
          <div class="match-side-card match-side-missing">
            <div class="match-side-heading">
              <span class="item-type-badge type-missing">🚨 Missing Item</span>
              <span class="item-category-tag">${escapeHtml(m.category)}</span>
            </div>
            <h4 class="match-side-title">${escapeHtml(m.name)}</h4>
            <div class="match-side-meta">
              <div><strong>Lost On:</strong> ${escapeHtml(m.date || 'Not specified')}</div>
              <div><strong>Org:</strong> ${escapeHtml(m.organization || 'Not specified')}</div>
              <div><strong>Location:</strong> ${escapeHtml(m.location || 'Not specified')}</div>
              <div><strong>Colour:</strong> ${escapeHtml(m.colour || 'Not specified')}</div>
              <div><strong>Brand:</strong> ${escapeHtml(m.brand || 'Not specified')}</div>
            </div>
            <p class="match-side-desc">${escapeHtml(m.description || 'No description provided.')}</p>
            ${m.photo ? `
              <div class="match-side-thumb">
                <img src="${m.photo}" alt="${escapeHtml(m.name)} photo thumbnail" loading="lazy">
              </div>
            ` : ''}
          </div>

          <!-- Central Connector -->
          <div class="match-connector">
            <div class="match-connector-icon">⇄</div>
            <span>VS</span>
          </div>

          <!-- Found Item Column -->
          <div class="match-side-card match-side-found">
            <div class="match-side-heading">
              <span class="item-type-badge type-found">🎁 Found Item</span>
              <span class="item-category-tag">${escapeHtml(f.category)}</span>
            </div>
            <h4 class="match-side-title">${escapeHtml(f.name)}</h4>
            <div class="match-side-meta">
              <div><strong>Found On:</strong> ${escapeHtml(f.date || 'Not specified')}</div>
              <div><strong>Org:</strong> ${escapeHtml(f.organization || 'Not specified')}</div>
              <div><strong>Location:</strong> ${escapeHtml(f.location || 'Not specified')}</div>
              <div><strong>Colour:</strong> ${escapeHtml(f.colour || 'Not specified')}</div>
              <div><strong>Brand:</strong> ${escapeHtml(f.brand || 'Not specified')}</div>
            </div>
            <p class="match-side-desc">${escapeHtml(f.description || 'No description provided.')}</p>
            ${f.photo ? `
              <div class="match-side-thumb">
                <img src="${f.photo}" alt="${escapeHtml(f.name)} photo thumbnail" loading="lazy">
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Match Reasons & Attribution Box -->
        <div class="match-reasons-box">
          <div class="match-reasons-title">
            <span>💡 Why this match was suggested (${match.reasons.length} matching attributes):</span>
          </div>
          <ul class="match-reasons-list">
            ${match.reasons.map(r => `<li class="match-reason-item">✔ ${escapeHtml(r)}</li>`).join('')}
          </ul>
        </div>
      `;

      matchesGrid.appendChild(card);
    });

    renderNotifications();
    renderDashboard();
  }

  // Filter Match Buttons Listeners
  document.querySelectorAll('.match-filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.match-filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentMinMatchScore = parseInt(this.getAttribute('data-min'), 10) || 25;
      renderMatches();
    });
  });

  // =========================================================================
  // 9. Day 4: Dashboard Statistics Controller
  // =========================================================================
  const dashMissingCount = document.getElementById('dashMissingCount');
  const dashFoundCount = document.getElementById('dashFoundCount');
  const dashMatchesCount = document.getElementById('dashMatchesCount');
  const dashUnreadAlertsCount = document.getElementById('dashUnreadAlertsCount');
  const navNotifBadge = document.getElementById('navNotifBadge');
  const heroNotifBadge = document.getElementById('heroNotifBadge');

  function renderDashboard() {
    if (!window.ReportStore) return;

    const allReports = window.ReportStore.getAll();
    const missingCount = allReports.filter(item => item && item.type === 'missing').length;
    const foundCount = allReports.filter(item => item && item.type === 'found').length;
    const matchesCount = (window.MatchingEngine && allReports.length >= 2)
      ? window.MatchingEngine.findAllMatches(allReports, 25).length
      : 0;
    const unreadCount = window.NotificationStore ? window.NotificationStore.getUnreadCount() : 0;

    if (dashMissingCount) dashMissingCount.textContent = missingCount;
    if (dashFoundCount) dashFoundCount.textContent = foundCount;
    if (dashMatchesCount) dashMatchesCount.textContent = matchesCount;
    if (dashUnreadAlertsCount) dashUnreadAlertsCount.textContent = unreadCount;

    // Update nav and hero badges
    if (navNotifBadge) {
      navNotifBadge.textContent = unreadCount;
      navNotifBadge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    }
    if (heroNotifBadge) {
      heroNotifBadge.textContent = unreadCount;
      heroNotifBadge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    }
  }

  // =========================================================================
  // 10. Day 4: In-App Match Notifications Controller
  // =========================================================================
  const notificationsList = document.getElementById('notificationsList');
  const notifUnreadBadge = document.getElementById('notifUnreadBadge');
  const notifCountAll = document.getElementById('notifCountAll');
  const notifCountUnread = document.getElementById('notifCountUnread');
  const btnMarkAllRead = document.getElementById('btnMarkAllRead');
  const btnClearNotifs = document.getElementById('btnClearNotifs');
  let currentNotifFilter = 'all';

  function formatTime(isoStr) {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  }

  function renderNotifications() {
    if (!notificationsList || !window.NotificationStore) return;

    const allNotifs = window.NotificationStore.getAll();
    const unreadCount = window.NotificationStore.getUnreadCount();

    if (notifUnreadBadge) {
      notifUnreadBadge.textContent = `${unreadCount} Unread`;
      notifUnreadBadge.className = unreadCount > 0 ? 'badge badge-warning' : 'badge badge-success';
    }
    if (notifCountAll) notifCountAll.textContent = allNotifs.length;
    if (notifCountUnread) notifCountUnread.textContent = unreadCount;

    let displayedNotifs = allNotifs;
    if (currentNotifFilter === 'unread') {
      displayedNotifs = allNotifs.filter(item => item && !item.isRead);
    }

    notificationsList.innerHTML = '';

    if (displayedNotifs.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'empty-state';
      if (allNotifs.length === 0) {
        emptyDiv.innerHTML = `
          <div class="empty-state-icon">🔕</div>
          <h3 class="empty-state-title">No Match Notifications Yet</h3>
          <p class="empty-state-text">
            When you submit missing and found reports that share matching attributes (such as category, name, or location), potential match alerts will automatically appear here.
          </p>
        `;
      } else {
        emptyDiv.innerHTML = `
          <div class="empty-state-icon">✅</div>
          <h3 class="empty-state-title">All Caught Up!</h3>
          <p class="empty-state-text">
            You have marked all match notifications as read. Switch filter to "All Alerts" to view previous match suggestions.
          </p>
        `;
      }
      notificationsList.appendChild(emptyDiv);
      return;
    }

    displayedNotifs.forEach(notif => {
      const card = document.createElement('article');
      card.className = `notif-card ${notif.isRead ? 'is-read' : 'is-unread'}`;

      const reasonTags = Array.isArray(notif.reasons) && notif.reasons.length > 0
        ? notif.reasons.map(r => `<span class="notif-reason-tag">✔ ${escapeHtml(r)}</span>`).join('')
        : '<span class="notif-reason-tag">✔ Attribute Correlation</span>';

      card.innerHTML = `
        <div class="notif-header">
          <div class="notif-title-wrap">
            ${!notif.isRead ? '<span class="notif-unread-dot" title="Unread Alert"></span>' : ''}
            <h4 class="notif-title">Match Suggestion: "${escapeHtml(notif.missingName)}" &amp; "${escapeHtml(notif.foundName)}"</h4>
          </div>
          <span class="item-type-badge ${escapeHtml(notif.confidenceClass || 'match-medium')}">
            ${notif.score}% ${escapeHtml(notif.confidenceLabel || 'Estimate')}
          </span>
        </div>

        <p class="notif-desc">${escapeHtml(notif.summary)}</p>
        <span class="notif-disclaimer-note">ℹ️ Rule-based similarity estimate. Always verify physical proof or security questions before handover.</span>

        <div class="notif-reasons">
          ${reasonTags}
        </div>

        <div class="notif-footer">
          <span>Alert Date: ${escapeHtml(formatTime(notif.createdAt) || 'Recent')}</span>
          <div class="notif-actions">
            ${!notif.isRead ? `
              <button type="button" class="btn btn-outline btn-sm btn-mark-read" data-id="${notif.id}">
                ✓ Mark as Read
              </button>
            ` : `
              <span class="notif-read-status">✓ Read</span>
            `}
            <a href="#matches-section" class="btn btn-primary btn-sm btn-view-match">
              🔍 View Match
            </a>
            <button type="button" class="btn-dismiss-notif" data-id="${notif.id}" title="Dismiss this alert">
              ✕ Dismiss
            </button>
          </div>
        </div>
      `;

      // Event listeners for actions on this card
      const markReadBtn = card.querySelector('.btn-mark-read');
      if (markReadBtn) {
        markReadBtn.addEventListener('click', () => {
          window.NotificationStore.markAsRead(notif.id);
          renderNotifications();
          renderDashboard();
        });
      }

      const dismissBtn = card.querySelector('.btn-dismiss-notif');
      if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
          window.NotificationStore.remove(notif.id);
          renderNotifications();
          renderDashboard();
        });
      }

      const viewMatchBtn = card.querySelector('.btn-view-match');
      if (viewMatchBtn) {
        viewMatchBtn.addEventListener('click', (e) => {
          e.preventDefault();
          // If match score is below active filter, automatically adjust filter to All Estimates (>= 25%)
          if (notif.score < currentMinMatchScore) {
            currentMinMatchScore = 25;
            document.querySelectorAll('.match-filter-btn').forEach(b => {
              if (b.getAttribute('data-min') === '25') {
                b.classList.add('active');
              } else {
                b.classList.remove('active');
              }
            });
            renderMatches();
          }
          const matchesSec = document.getElementById('matches-section');
          if (matchesSec) {
            matchesSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      }

      notificationsList.appendChild(card);
    });
  }

  // Filter Pill Listeners for Notifications
  document.querySelectorAll('[data-notif-filter]').forEach(pill => {
    pill.addEventListener('click', function () {
      document.querySelectorAll('[data-notif-filter]').forEach(p => p.classList.remove('active'));
      this.classList.add('active');
      currentNotifFilter = this.getAttribute('data-notif-filter') || 'all';
      renderNotifications();
    });
  });

  // Mark All Read Button
  if (btnMarkAllRead) {
    btnMarkAllRead.addEventListener('click', () => {
      const unread = window.NotificationStore ? window.NotificationStore.getUnreadCount() : 0;
      if (unread === 0) {
        alert('All notifications are already marked as read.');
        return;
      }
      window.NotificationStore.markAllAsRead();
      renderNotifications();
      renderDashboard();
    });
  }

  // Clear Notifications Button
  if (btnClearNotifs) {
    btnClearNotifs.addEventListener('click', () => {
      const total = window.NotificationStore ? window.NotificationStore.getAll().length : 0;
      if (total === 0) {
        alert('There are no notifications to clear.');
        return;
      }
      if (confirm(`Are you sure you want to clear all ${total} match notifications?`)) {
        window.NotificationStore.clearAll();
        renderNotifications();
        renderDashboard();
      }
    });
  }

  // Clean orphan notifications on load if any
  if (window.NotificationStore && window.ReportStore && typeof window.NotificationStore.cleanOrphans === 'function') {
    const validIds = window.ReportStore.getAll().map(r => r.id);
    window.NotificationStore.cleanOrphans(validIds);
  }

  // Initial renders on page load
  renderReports();
  renderMatches();
  renderNotifications();
  renderDashboard();

  console.log('✅ Smart Missing Items Finder AI - Day 5 Complete Prototype Initialized.');
});
