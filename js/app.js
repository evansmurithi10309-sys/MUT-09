/**
 * app.js - Public UI, Search/Filter, House Cards & Detail Modal
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global modal closing helper
  window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  };

  window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
    }
  };

  // Toast notification system
  window.showToast = function(message, type = 'info') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `
      <span style="font-size: 1.2rem;">${icon}</span>
      <span style="flex: 1; font-size: 0.9rem; font-weight: 500;">${message}</span>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  };

  // UI Elements
  const listingsGrid = document.getElementById('listings-grid');
  const listingsCount = document.getElementById('listings-count');
  const noResults = document.getElementById('no-results');

  const filterRooms = document.getElementById('filter-rooms');
  const filterPriceMin = document.getElementById('filter-price-min');
  const filterPriceMax = document.getElementById('filter-price-max');
  const filterBtn = document.getElementById('filter-btn');
  const clearFilterBtn = document.getElementById('clear-filter-btn');
  const heroSearchInput = document.getElementById('hero-search');

  // Navigation Links Active State & Smooth Scroll
  const navLinks = document.querySelectorAll('.navbar-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Mobile menu button
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navbarLinks = document.getElementById('navbar-links');
  if (mobileMenuBtn && navbarLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navbarLinks.classList.toggle('mobile-open');
    });
  }

  // Render Hero Statistics
  function updateHeroStats(houses) {
    const totalHousesEl = document.getElementById('stat-houses');
    const totalLandlordsEl = document.getElementById('stat-landlords');
    const totalLocationsEl = document.getElementById('stat-locations');

    if (!totalHousesEl) return;

    const availableHouses = houses.filter(h => h.available);
    totalHousesEl.textContent = availableHouses.length;

    // Unique landlords count
    const landlords = new Set(houses.map(h => h.landlordPhone).filter(Boolean));
    totalLandlordsEl.textContent = landlords.size;

    // Unique locations count
    const locations = new Set(houses.map(h => h.location).filter(Boolean));
    totalLocationsEl.textContent = locations.size;
  }

  // Render House Grid Cards
  function renderListings(housesToRender) {
    if (!listingsGrid) return;

    listingsGrid.innerHTML = '';

    if (!housesToRender || housesToRender.length === 0) {
      noResults.classList.remove('hidden');
      if (listingsCount) listingsCount.textContent = 'No house listings match your criteria.';
      return;
    }

    noResults.classList.add('hidden');
    if (listingsCount) {
      listingsCount.textContent = `Showing ${housesToRender.length} house listing${housesToRender.length > 1 ? 's' : ''}`;
    }

    housesToRender.forEach(house => {
      const card = document.createElement('div');
      card.className = 'house-card fade-in';
      card.id = `card-${house.id}`;

      const primaryImg = (house.images && house.images.length > 0) ? house.images[0] : '';
      const badgeClass = house.available ? 'badge-available' : 'badge-occupied';
      const badgeText = house.available ? 'Available' : 'Occupied';

      card.innerHTML = `
        <div class="house-card-image">
          ${primaryImg 
            ? `<img src="${primaryImg}" alt="${escapeHtml(house.title)}" loading="lazy">` 
            : `<div class="no-image">🏠 No Image</div>`}
          <div class="house-card-badge">
            <span class="badge ${badgeClass}"><span class="status-dot"></span> ${badgeText}</span>
          </div>
          ${house.images && house.images.length > 1 ? `
            <div class="image-count">📷 ${house.images.length} photos</div>
          ` : ''}
        </div>
        <div class="house-card-body">
          <h3 class="house-card-title" title="${escapeHtml(house.title)}">${escapeHtml(house.title)}</h3>
          <div class="house-card-price">
            KES ${Number(house.price).toLocaleString()} <span class="period">/ month</span>
          </div>
          <div class="house-card-meta">
            <div class="meta-item"><span class="meta-icon">🛏️</span> ${escapeHtml(house.rooms)}</div>
            <div class="meta-item"><span class="meta-icon">📍</span> ${escapeHtml(house.location)}</div>
          </div>
          <div class="house-card-actions">
            <button class="btn btn-primary btn-sm" onclick="viewHouseDetails('${house.id}')">View Details & Book Visit</button>
          </div>
        </div>
      `;

      listingsGrid.appendChild(card);
    });
  }

  // Filter Logic
  function applyFilters() {
    const allHouses = DataStore.getAllHouses();
    const searchTerm = heroSearchInput ? heroSearchInput.value.trim().toLowerCase() : '';
    const selectedRoom = filterRooms ? filterRooms.value : '';
    const minPrice = filterPriceMin && filterPriceMin.value ? Number(filterPriceMin.value) : 0;
    const maxPrice = filterPriceMax && filterPriceMax.value ? Number(filterPriceMax.value) : Infinity;

    const filtered = allHouses.filter(house => {
      // Search term check
      const matchesSearch = !searchTerm || 
        house.title.toLowerCase().includes(searchTerm) ||
        house.location.toLowerCase().includes(searchTerm) ||
        house.description.toLowerCase().includes(searchTerm);

      // Room type check
      const matchesRoom = !selectedRoom || house.rooms === selectedRoom;

      // Price range check
      const matchesPrice = house.price >= minPrice && house.price <= maxPrice;

      return matchesSearch && matchesRoom && matchesPrice;
    });

    renderListings(filtered);
    updateHeroStats(allHouses);
  }

  // Event Listeners for Filters
  if (filterBtn) filterBtn.addEventListener('click', applyFilters);
  if (filterRooms) filterRooms.addEventListener('change', applyFilters);
  if (filterPriceMin) filterPriceMin.addEventListener('input', applyFilters);
  if (filterPriceMax) filterPriceMax.addEventListener('input', applyFilters);

  if (heroSearchInput) {
    heroSearchInput.addEventListener('input', applyFilters);
  }

  if (clearFilterBtn) {
    clearFilterBtn.addEventListener('click', () => {
      if (filterRooms) filterRooms.value = '';
      if (filterPriceMin) filterPriceMin.value = '';
      if (filterPriceMax) filterPriceMax.value = '';
      if (heroSearchInput) heroSearchInput.value = '';
      applyFilters();
    });
  }

  // View House Details Modal Logic & Visiting Fee Handling
  let currentCarouselIndex = 0;
  let currentCarouselImages = [];
  let currentDetailHouseId = null;

  window.viewHouseDetails = function(houseId) {
    const houses = DataStore.getAllHouses();
    const house = houses.find(h => h.id === houseId);
    if (!house) return;

    currentDetailHouseId = houseId;

    // Increment views
    DataStore.incrementHouseViews(houseId);

    // Populate Modal Elements
    document.getElementById('modal-title').textContent = house.title;
    document.getElementById('modal-price').innerHTML = `KES ${Number(house.price).toLocaleString()} <span style="font-size: 0.9rem; color: var(--text-muted); font-weight: normal;">/ month</span>`;
    document.getElementById('modal-rooms').textContent = house.rooms;
    document.getElementById('modal-location').textContent = house.location;
    document.getElementById('modal-description').textContent = house.description || 'No description provided.';
    
    // Visiting Fee Check & Lock/Unlock state
    const isPaid = DataStore.isVisitingFeePaid(houseId);
    const lockedBox = document.getElementById('contact-locked-box');
    const unlockedBox = document.getElementById('contact-unlocked-box');
    const feeBadge = document.getElementById('visiting-fee-badge');

    if (isPaid) {
      if (lockedBox) lockedBox.classList.add('hidden');
      if (unlockedBox) unlockedBox.classList.remove('hidden');
      if (feeBadge) {
        feeBadge.textContent = '✅ Visiting Fee Paid (KES 100)';
        feeBadge.className = 'badge badge-available';
      }

      document.getElementById('modal-landlord-name').textContent = house.landlordName;
      document.getElementById('modal-landlord-phone').innerHTML = `
        <a href="tel:${house.landlordPhone}" class="contact-link" style="margin-right: 0.75rem;">📞 ${house.landlordPhone}</a>
        <a href="https://wa.me/254${formatPhoneForWhatsApp(house.landlordPhone)}" target="_blank" class="btn btn-whatsapp btn-sm" style="text-decoration: none;">💬 WhatsApp Landlord</a>
      `;

      const mapLinkEl = document.getElementById('modal-map-link');
      if (house.mapLink) {
        mapLinkEl.href = house.mapLink;
        mapLinkEl.style.display = 'inline-flex';
      } else {
        mapLinkEl.style.display = 'none';
      }
    } else {
      if (lockedBox) lockedBox.classList.remove('hidden');
      if (unlockedBox) unlockedBox.classList.add('hidden');
      if (feeBadge) {
        feeBadge.textContent = '🏷️ Visiting Fee: KES 100';
        feeBadge.className = 'badge badge-available';
      }
    }

    // Populate Image Carousel
    currentCarouselImages = house.images || [];
    currentCarouselIndex = 0;
    renderCarousel();

    openModal('house-modal');
  };

  // Trigger M-PESA Payment Modal
  const unlockContactBtn = document.getElementById('unlock-contact-btn');
  const visitingFeeModal = document.getElementById('visiting-fee-modal');
  const feeHouseTitle = document.getElementById('fee-house-title');

  if (unlockContactBtn) {
    unlockContactBtn.addEventListener('click', () => {
      if (!currentDetailHouseId) return;
      const houses = DataStore.getAllHouses();
      const house = houses.find(h => h.id === currentDetailHouseId);
      
      if (feeHouseTitle && house) {
        feeHouseTitle.textContent = `${house.title} (${house.rooms})`;
      }

      // Reset STK Push Form States
      document.getElementById('stk-push-form').classList.remove('hidden');
      document.getElementById('stk-processing-state').classList.add('hidden');
      document.getElementById('stk-success-state').classList.add('hidden');
      
      openModal('visiting-fee-modal');
    });
  }

  // M-PESA STK Push Form Submit
  const payStkBtn = document.getElementById('pay-stk-btn');
  const mpesaPhoneInput = document.getElementById('mpesa-phone-input');

  if (payStkBtn) {
    payStkBtn.addEventListener('click', () => {
      const phone = mpesaPhoneInput ? mpesaPhoneInput.value.trim() : '';

      if (!phone || phone.length < 9) {
        showToast('Please enter a valid M-PESA phone number (e.g. 0712345678)', 'error');
        return;
      }

      // Show processing STK push state
      document.getElementById('stk-push-form').classList.add('hidden');
      const processingState = document.getElementById('stk-processing-state');
      processingState.classList.remove('hidden');
      document.getElementById('stk-phone-display').textContent = phone;

      // Simulate STK Push Prompt & PIN Confirmation after 2.5 seconds
      setTimeout(() => {
        const receiptCode = 'RKB' + Math.floor(100000 + Math.random() * 900000) + 'X';
        
        // Save payment to localStorage
        DataStore.recordVisitingFeePayment(currentDetailHouseId, phone, receiptCode);

        processingState.classList.add('hidden');
        const successState = document.getElementById('stk-success-state');
        document.getElementById('mpesa-receipt-code').textContent = receiptCode;
        successState.classList.remove('hidden');

        // Show toast & auto close modal to reveal unlocked details
        setTimeout(() => {
          closeModal('visiting-fee-modal');
          showToast(`🎉 Payment of KES 100 to 0715450987 Confirmed (${receiptCode})! Contact unlocked!`, 'success');
          // Re-render house details in unlocked state
          if (currentDetailHouseId) {
            viewHouseDetails(currentDetailHouseId);
          }
        }, 1800);
      }, 2500);
    });
  }

  function renderCarousel() {
    const modalImagesContainer = document.getElementById('modal-images');
    if (!modalImagesContainer) return;

    if (!currentCarouselImages || currentCarouselImages.length === 0) {
      modalImagesContainer.innerHTML = `<div class="carousel-placeholder">🏠</div>`;
      return;
    }

    let slidesHtml = '';
    currentCarouselImages.forEach((imgUrl, idx) => {
      slidesHtml += `
        <div class="carousel-image ${idx === currentCarouselIndex ? 'active' : ''}">
          <img src="${imgUrl}" alt="House photo ${idx + 1}" loading="lazy">
        </div>
      `;
    });

    let controlsHtml = '';
    if (currentCarouselImages.length > 1) {
      controlsHtml = `
        <div class="carousel-controls">
          <button class="carousel-btn" onclick="prevCarouselSlide()">&lt;</button>
          <div class="carousel-counter">${currentCarouselIndex + 1} / ${currentCarouselImages.length}</div>
          <button class="carousel-btn" onclick="nextCarouselSlide()">&gt;</button>
        </div>
      `;
    }

    modalImagesContainer.innerHTML = `
      <div class="image-carousel">
        ${slidesHtml}
        ${controlsHtml}
      </div>
    `;
  }

  window.prevCarouselSlide = function() {
    if (currentCarouselImages.length <= 1) return;
    currentCarouselIndex = (currentCarouselIndex - 1 + currentCarouselImages.length) % currentCarouselImages.length;
    renderCarousel();
  };

  window.nextCarouselSlide = function() {
    if (currentCarouselImages.length <= 1) return;
    currentCarouselIndex = (currentCarouselIndex + 1) % currentCarouselImages.length;
    renderCarousel();
  };

  function formatPhoneForWhatsApp(phone) {
    if (!phone) return '';
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    return cleaned;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initial Load
  const initialHouses = DataStore.getAllHouses();
  renderListings(initialHouses);
  updateHeroStats(initialHouses);

  // Listen for storage updates
  window.addEventListener('housesUpdated', () => {
    applyFilters();
  });
});
