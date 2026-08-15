/**
 * admin.js - Developer & Landlord Dashboard Management
 * Enables developer to add, edit, toggle availability, and remove vacant house listings.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const adminLink = document.getElementById('admin-link');
  const navDevBtn = document.getElementById('nav-dev-btn');
  const adminSection = document.getElementById('admin-section');
  const adminLoginModal = document.getElementById('admin-login-modal');
  const adminLoginBtn = document.getElementById('admin-login-btn');
  const adminPasswordInput = document.getElementById('admin-password-input');
  const adminLoginError = document.getElementById('admin-login-error');
  const adminLoginClose = document.getElementById('admin-login-close');
  const adminLogoutBtn = document.getElementById('admin-logout-btn');

  const addHouseBtn = document.getElementById('add-house-btn');
  const houseFormModal = document.getElementById('house-form-modal');
  const houseFormClose = document.getElementById('house-form-close');
  const houseForm = document.getElementById('house-form');
  const houseFormTitle = document.getElementById('house-form-title');

  const deleteConfirmModal = document.getElementById('delete-confirm-modal');
  const deleteConfirmBtn = document.getElementById('delete-confirm-btn');
  const deleteCancelBtn = document.getElementById('delete-cancel-btn');
  const deleteHouseIdInput = document.getElementById('delete-house-id');

  const adminHousesList = document.getElementById('admin-houses-list');

  // Form Fields
  const formHouseId = document.getElementById('form-house-id');
  const formTitle = document.getElementById('form-title');
  const formDescription = document.getElementById('form-description');
  const formPrice = document.getElementById('form-price');
  const formRooms = document.getElementById('form-rooms');
  const formLocation = document.getElementById('form-location');
  const formMapLink = document.getElementById('form-map-link');
  const formLandlordName = document.getElementById('form-landlord-name');
  const formLandlordPhone = document.getElementById('form-landlord-phone');
  const formAvailable = document.getElementById('form-available');
  const formImagesUpload = document.getElementById('form-images-upload');
  const formImagesPreview = document.getElementById('form-images-preview');

  // State for uploaded images in form
  let uploadedImages = [];

  // Default Developer Password
  const DEV_PASSWORD = 'admin';

  // Check auth state on load
  checkAuthState();

  function checkAuthState() {
    if (DataStore.isDeveloperAuthenticated()) {
      if (adminSection) adminSection.classList.remove('hidden');
      renderAdminDashboard();
    } else {
      if (adminSection) adminSection.classList.add('hidden');
    }
  }

  function openDeveloperPortal() {
    if (DataStore.isDeveloperAuthenticated()) {
      adminSection.scrollIntoView({ behavior: 'smooth' });
      showToast('You are logged in as Developer', 'info');
    } else {
      openModal('admin-login-modal');
      if (adminPasswordInput) {
        adminPasswordInput.value = '';
        adminPasswordInput.focus();
      }
      if (adminLoginError) adminLoginError.classList.add('hidden');
    }
  }

  if (adminLink) adminLink.addEventListener('click', openDeveloperPortal);
  if (navDevBtn) navDevBtn.addEventListener('click', openDeveloperPortal);

  // Close Login Modal
  if (adminLoginClose) {
    adminLoginClose.addEventListener('click', () => {
      closeModal('admin-login-modal');
    });
  }

  // Developer Login Action
  if (adminLoginBtn) {
    adminLoginBtn.addEventListener('click', performLogin);
  }

  if (adminPasswordInput) {
    adminPasswordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') performLogin();
    });
  }

  function performLogin() {
    const password = adminPasswordInput ? adminPasswordInput.value.trim() : '';
    // Allow 'admin' or 'admin123' or 'developer'
    if (password === 'admin' || password === 'admin123' || password === 'developer' || password === '1234') {
      DataStore.setDeveloperAuthenticated(true);
      closeModal('admin-login-modal');
      checkAuthState();
      showToast('Welcome back, Developer! You can now add & manage vacant houses.', 'success');
      setTimeout(() => {
        adminSection.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      if (adminLoginError) {
        adminLoginError.textContent = 'Incorrect password. (Try "admin" or "admin123")';
        adminLoginError.classList.remove('hidden');
      }
    }
  }

  // Logout Action
  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
      DataStore.setDeveloperAuthenticated(false);
      checkAuthState();
      showToast('Logged out of Developer Dashboard', 'info');
    });
  }

  // Render Admin Dashboard Content
  function renderAdminDashboard() {
    const houses = DataStore.getAllHouses();

    // Stats
    const totalHousesEl = document.getElementById('stat-total-houses');
    const availableEl = document.getElementById('stat-available');
    const occupiedEl = document.getElementById('stat-occupied');
    const totalViewsEl = document.getElementById('stat-total-views');

    const availableCount = houses.filter(h => h.available).length;
    const occupiedCount = houses.length - availableCount;
    const viewsSum = houses.reduce((acc, h) => acc + (h.views || 0), 0);

    if (totalHousesEl) totalHousesEl.textContent = houses.length;
    if (availableEl) availableEl.textContent = availableCount;
    if (occupiedEl) occupiedEl.textContent = occupiedCount;
    if (totalViewsEl) totalViewsEl.textContent = viewsSum;

    // Houses List
    if (!adminHousesList) return;
    adminHousesList.innerHTML = '';

    if (houses.length === 0) {
      adminHousesList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🏠</div>
          <h3 class="empty-title">No house listings</h3>
          <p class="empty-desc">Click "➕ Add New House" above to add your first vacant house.</p>
        </div>
      `;
      return;
    }

    houses.forEach(house => {
      const row = document.createElement('div');
      row.className = 'admin-house-row';
      row.id = `admin-row-${house.id}`;

      const primaryImg = (house.images && house.images.length > 0) ? house.images[0] : '';
      const statusBadge = house.available 
        ? `<span class="badge badge-available"><span class="status-dot"></span> Available</span>`
        : `<span class="badge badge-occupied"><span class="status-dot"></span> Occupied</span>`;

      row.innerHTML = `
        <div class="admin-house-image">
          ${primaryImg 
            ? `<img src="${primaryImg}" alt="${escapeHtml(house.title)}">` 
            : `<div class="no-image" style="font-size:0.8rem;">No Photo</div>`}
        </div>
        <div class="admin-house-info">
          <h4>${escapeHtml(house.title)} ${statusBadge}</h4>
          <p>KES ${Number(house.price).toLocaleString()} / mo • ${escapeHtml(house.rooms)} • 📍 ${escapeHtml(house.location)}</p>
          <div class="admin-house-meta">
            <span>👤 Landlord: ${escapeHtml(house.landlordName)} (${escapeHtml(house.landlordPhone)})</span>
            <span>👁️ ${house.views || 0} views</span>
          </div>
        </div>
        <div class="admin-house-actions">
          <button class="btn ${house.available ? 'btn-secondary' : 'btn-outline'} btn-sm" onclick="toggleAvailability('${house.id}')">
            ${house.available ? 'Mark Occupied' : 'Mark Available'}
          </button>
          <button class="btn btn-primary btn-sm" onclick="openEditHouseModal('${house.id}')">✏️ Edit</button>
          <button class="btn btn-danger btn-sm" onclick="openDeleteConfirmModal('${house.id}')">🗑️</button>
        </div>
      `;

      adminHousesList.appendChild(row);
    });
  }

  // Toggle Availability
  window.toggleAvailability = function(houseId) {
    const updated = DataStore.toggleHouseAvailability(houseId);
    if (updated) {
      renderAdminDashboard();
      showToast(`House status updated to ${updated.available ? 'Available' : 'Occupied'}`, 'success');
    }
  };

  // Add / Edit House Modal logic
  if (addHouseBtn) {
    addHouseBtn.addEventListener('click', () => {
      openAddHouseModal();
    });
  }

  if (houseFormClose) {
    houseFormClose.addEventListener('click', () => {
      closeModal('house-form-modal');
    });
  }

  function openAddHouseModal() {
    formHouseId.value = '';
    houseForm.reset();
    formHouseTitle.textContent = '➕ Add New House Listing';
    uploadedImages = [];
    renderImagePreviews();
    openModal('house-form-modal');
  }

  window.openEditHouseModal = function(houseId) {
    const houses = DataStore.getAllHouses();
    const house = houses.find(h => h.id === houseId);
    if (!house) return;

    formHouseId.value = house.id;
    formTitle.value = house.title || '';
    formDescription.value = house.description || '';
    formPrice.value = house.price || '';
    formRooms.value = house.rooms || '';
    formLocation.value = house.location || '';
    formMapLink.value = house.mapLink || '';
    formLandlordName.value = house.landlordName || '';
    formLandlordPhone.value = house.landlordPhone || '';
    formAvailable.checked = !!house.available;

    uploadedImages = [...(house.images || [])];
    renderImagePreviews();

    houseFormTitle.textContent = '✏️ Edit House Listing';
    openModal('house-form-modal');
  };

  // Image Upload Handling (Data URLs)
  if (formImagesUpload) {
    formImagesUpload.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      if (uploadedImages.length + files.length > 5) {
        showToast('Maximum 5 images allowed per house listing', 'error');
        return;
      }

      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          uploadedImages.push(event.target.result);
          renderImagePreviews();
        };
        reader.readAsDataURL(file);
      });
    });
  }

  function renderImagePreviews() {
    if (!formImagesPreview) return;
    formImagesPreview.innerHTML = '';

    uploadedImages.forEach((imgUrl, index) => {
      const item = document.createElement('div');
      item.className = 'image-preview-item';
      item.innerHTML = `
        <img src="${imgUrl}" alt="Preview ${index + 1}">
        <button type="button" class="image-preview-remove" onclick="removeUploadedImage(${index})">&times;</button>
      `;
      formImagesPreview.appendChild(item);
    });
  }

  window.removeUploadedImage = function(index) {
    uploadedImages.splice(index, 1);
    renderImagePreviews();
  };

  // House Form Submit (Save / Edit)
  if (houseForm) {
    houseForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const houseId = formHouseId.value;
      const houseData = {
        title: formTitle.value.trim(),
        description: formDescription.value.trim(),
        price: Number(formPrice.value),
        rooms: formRooms.value,
        location: formLocation.value.trim(),
        mapLink: formMapLink.value.trim(),
        landlordName: formLandlordName.value.trim(),
        landlordPhone: formLandlordPhone.value.trim(),
        available: formAvailable.checked,
        images: uploadedImages
      };

      if (houseId) {
        // Edit existing
        DataStore.updateHouse(houseId, houseData);
        showToast('House listing updated successfully!', 'success');
      } else {
        // Add new
        DataStore.addHouse(houseData);
        showToast('New house listing added successfully!', 'success');
      }

      closeModal('house-form-modal');
      renderAdminDashboard();
    });
  }

  // Delete Confirmation Modal Logic
  window.openDeleteConfirmModal = function(houseId) {
    if (deleteHouseIdInput) deleteHouseIdInput.value = houseId;
    openModal('delete-confirm-modal');
  };

  if (deleteCancelBtn) {
    deleteCancelBtn.addEventListener('click', () => {
      closeModal('delete-confirm-modal');
    });
  }

  if (deleteConfirmBtn) {
    deleteConfirmBtn.addEventListener('click', () => {
      const houseId = deleteHouseIdInput ? deleteHouseIdInput.value : null;
      if (houseId) {
        DataStore.deleteHouse(houseId);
        showToast('House listing deleted', 'info');
        renderAdminDashboard();
      }
      closeModal('delete-confirm-modal');
    });
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
});
