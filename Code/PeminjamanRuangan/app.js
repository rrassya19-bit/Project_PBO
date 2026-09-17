// ==========================================================================
// SIPERU UMY - WEB APPLICATION CONTROLLER (SINGLE PAGE APP)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Ensure DB is loaded from window
  const database = window.db;
  
  // App State variables
  let currentSession = null;
  let activeCharts = {
    density: null,
    status: null
  };

  // ==========================================================================
  // UTILITY FUNCTIONS: TOAST NOTIFICATIONS
  // ==========================================================================
  
  function showToast(title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Choose Lucide icon based on type
    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle-2';
    if (type === 'warning') iconName = 'alert-triangle';
    if (type === 'danger') iconName = 'x-circle';
    
    toast.innerHTML = `
      <i data-lucide="${iconName}" class="toast-icon"></i>
      <div class="toast-content">
        <span class="toast-title">${title}</span>
        <span class="toast-message">${message}</span>
      </div>
      <button class="toast-close"><i data-lucide="x" style="width: 14px; height: 14px;"></i></button>
    `;
    
    container.appendChild(toast);
    lucide.createIcons({ attrs: { class: 'toast-icon-svg' } });
    
    // Auto-remove toast
    const timeoutId = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
    
    // Manual close toast
    toast.querySelector('.toast-close').addEventListener('click', () => {
      clearTimeout(timeoutId);
      toast.remove();
    });
  }

  // Helper: Format Date to Indo Locale (e.g. 19 Agustus 2026)
  function formatIndoDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', options);
  }

  // Helper: Format relative timestamp
  function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    return `${diffDays} hari lalu`;
  }

  // ==========================================================================
  // ROUTING & VIEW CONTROLLERS (SPA NAVIGATION)
  // ==========================================================================

  const views = {
    landing: document.getElementById('view-landing'),
    student: document.getElementById('view-student-dashboard'),
    admin: document.getElementById('view-admin-dashboard')
  };

  function switchView(viewName) {
    // Hide all views
    Object.values(views).forEach(v => v.classList.remove('active'));
    // Show selected view
    views[viewName].classList.add('active');
    
    // Trigger specific page-load configurations
    if (viewName === 'landing') {
      currentSession = database.getCurrentSession();
      updateLandingUI();
    } else if (viewName === 'student') {
      currentSession = database.getCurrentSession();
      updateStudentDashboardUI();
      switchStudentSubView('student-home');
    } else if (viewName === 'admin') {
      currentSession = database.getCurrentSession();
      updateAdminDashboardUI();
      switchAdminSubView('admin-home');
    }
    
    // Close mobile menus/sidebars if switching views
    document.getElementById('mobile-menu').classList.remove('active');
    document.querySelector('.sidebar').classList.remove('mobile-active');
    
    // Rerender Lucide icons
    lucide.createIcons();
  }

  // Initialize View Router on page load
  function initRouter() {
    currentSession = database.getCurrentSession();
    if (currentSession) {
      if (currentSession.role === 'admin') {
        switchView('admin');
      } else {
        switchView('student');
      }
    } else {
      switchView('landing');
    }
  }

  // ==========================================================================
  // LANDING PAGE CONTROLLER
  // ==========================================================================
  
  let landingActiveFilter = 'all';

  function updateLandingUI() {
    // Render Stats
    const stats = database.getStats();
    document.getElementById('stat-total-rooms').textContent = stats.totalRooms;
    document.getElementById('stat-available-rooms').textContent = stats.availableRooms;
    document.getElementById('stat-approved-bookings').textContent = stats.approvedBookings;
    document.getElementById('hero-stat-rooms-count').textContent = `${stats.totalRooms} Ruangan`;
    
    // Number of organizations (unique users registered in mock DB)
    const users = database.getUsers();
    const orgCount = users.filter(u => u.role !== 'admin').length;
    document.getElementById('stat-total-users').textContent = orgCount;
    
    // Set Login button based on state
    const loginBtn = document.getElementById('btn-login-modal');
    const loginBtnMobile = document.getElementById('btn-login-modal-mobile');
    if (currentSession) {
      const text = currentSession.role === 'admin' ? 'Buka Admin Portal' : 'Buka Dashboard';
      loginBtn.innerHTML = `<i data-lucide="layout-dashboard"></i> ${text}`;
      loginBtnMobile.innerHTML = `<i data-lucide="layout-dashboard"></i> ${text}`;
    } else {
      loginBtn.innerHTML = `<i data-lucide="log-in"></i> Login Portal`;
      loginBtnMobile.innerHTML = `<i data-lucide="log-in"></i> Login Portal`;
    }
    
    renderLandingRooms();
    lucide.createIcons();
  }

  function renderLandingRooms() {
    const searchVal = document.getElementById('landing-search-input').value.toLowerCase();
    const rooms = database.getRooms();
    const grid = document.getElementById('landing-rooms-grid');
    grid.innerHTML = '';

    const filteredRooms = rooms.filter(room => {
      // Category filter
      if (landingActiveFilter !== 'all' && room.type !== landingActiveFilter) {
        return false;
      }
      // Text Search filter
      if (searchVal) {
        const matchesName = room.name.toLowerCase().includes(searchVal);
        const matchesBuilding = room.building.toLowerCase().includes(searchVal);
        const matchesType = room.type.toLowerCase().includes(searchVal);
        const matchesFeatures = room.features.some(f => f.toLowerCase().includes(searchVal));
        return matchesName || matchesBuilding || matchesType || matchesFeatures;
      }
      return true;
    });

    if (filteredRooms.length === 0) {
      grid.innerHTML = `
        <div class="col-12 text-center py-8 text-slate-400">
          <i data-lucide="info" style="width: 48px; height: 48px; margin: 0 auto 1rem; color: var(--slate-300);"></i>
          <p>Tidak ada ruangan yang cocok dengan kriteria pencarian Anda.</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    filteredRooms.forEach(room => {
      const card = document.createElement('div');
      card.className = 'room-card';
      
      const featuresStr = room.features.slice(0, 3).map(f => `<span class="feature-badge">${f}</span>`).join('');
      const plusFeature = room.features.length > 3 ? `<span class="feature-badge">+${room.features.length - 3}</span>` : '';
      
      card.innerHTML = `
        <div class="room-card-image">
          <img src="${room.image}" alt="${room.name}">
          <span class="room-card-badge">${room.type}</span>
          <span class="room-card-status ${room.status === 'tersedia' ? 'tersedia' : 'maintenance'}">
            ${room.status === 'tersedia' ? 'Tersedia' : 'Pemeliharaan'}
          </span>
        </div>
        <div class="room-card-body">
          <div class="room-card-building">${room.building}</div>
          <h3>${room.name}</h3>
          <p class="room-card-desc">${room.description}</p>
          <div class="room-card-info">
            <span><i data-lucide="users"></i> Kapasitas: ${room.capacity}</span>
            <span><i data-lucide="tag"></i> Harian / Sesi</span>
          </div>
          <div class="room-features-badges" style="margin-top: 0.75rem;">
            ${featuresStr}
            ${plusFeature}
          </div>
        </div>
        <div class="room-card-footer">
          <button class="btn btn-secondary btn-full btn-sm btn-view-detail" data-id="${room.id}">Detail</button>
          <button class="btn btn-primary btn-full btn-sm btn-book-now" data-id="${room.id}" ${room.status !== 'tersedia' ? 'disabled' : ''}>
            Pinjam Ruang
          </button>
        </div>
      `;
      grid.appendChild(card);
    });

    // Attach Event Listeners on newly rendered buttons
    grid.querySelectorAll('.btn-view-detail').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const roomId = e.target.getAttribute('data-id');
        openRoomDetailModal(roomId);
      });
    });

    grid.querySelectorAll('.btn-book-now').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const roomId = e.target.getAttribute('data-id');
        handleDirectBooking(roomId);
      });
    });
  }

  // Filter Chips logic
  document.getElementById('landing-filter-chips').addEventListener('click', (e) => {
    if (e.target.classList.contains('chip')) {
      document.querySelectorAll('#landing-filter-chips .chip').forEach(c => c.classList.remove('active'));
      e.target.classList.add('active');
      landingActiveFilter = e.target.getAttribute('data-type');
      renderLandingRooms();
    }
  });

  // Search Input logic
  document.getElementById('landing-search-input').addEventListener('input', renderLandingRooms);

  // Hero check room button triggers scroll to rooms
  document.getElementById('hero-btn-check').addEventListener('click', () => {
    document.getElementById('section-rooms').scrollIntoView({ behavior: 'smooth' });
  });
  
  // Hero alur button triggers scroll to workflow
  document.getElementById('hero-btn-guide').addEventListener('click', () => {
    document.getElementById('section-workflow').scrollIntoView({ behavior: 'smooth' });
  });

  // Logo home navigation
  document.getElementById('logo-to-home').addEventListener('click', (e) => {
    e.preventDefault();
    if (views.landing.classList.contains('active')) {
      document.getElementById('section-hero').scrollIntoView({ behavior: 'smooth' });
    } else {
      switchView('landing');
    }
  });

  // Landing page links scroll action
  document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // If we are in dashboard views, we need to head back to landing first
      if (!views.landing.classList.contains('active')) {
        switchView('landing');
      }

      // Remove active classes
      document.querySelectorAll('.nav-link, .mobile-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      const targetId = link.getAttribute('data-target');
      const element = document.getElementById(targetId);
      if (element) {
        // Offset for sticky header
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
      
      // Close mobile overlay menu
      document.getElementById('mobile-menu').classList.remove('active');
    });
  });

  // Responsive Navbar toggle
  const navToggleBtn = document.getElementById('nav-toggle-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  navToggleBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
  });

  // Handle direct booking from landing
  function handleDirectBooking(roomId) {
    if (!currentSession) {
      showToast('Akses Dibatasi', 'Harap login terlebih dahulu untuk melakukan peminjaman ruangan!', 'warning');
      openLoginModal();
    } else if (currentSession.role === 'admin') {
      showToast('Admin Portal', 'Akun Administrator tidak dapat meminjam ruangan. Gunakan akun mahasiswa/dosen.', 'warning');
    } else {
      switchView('student');
      switchStudentSubView('student-book');
      selectRoomForBooking(roomId);
    }
  }

  // ==========================================================================
  // AUTHENTICATION CONTROLLER (LOGIN MODAL)
  // ==========================================================================

  let loginActiveRole = 'mahasiswa'; // mahasiswa, admin

  const modalLogin = document.getElementById('modal-login');
  const formLogin = document.getElementById('form-login');
  const loginUsernameInput = document.getElementById('login-username');
  const loginPasswordInput = document.getElementById('login-password');
  const loginLabelUsername = document.getElementById('login-label-username');
  const loginErrorMsg = document.getElementById('login-error-msg');

  function openLoginModal() {
    if (currentSession) {
      // If already logged in, skip modal and go straight to their dashboard
      if (currentSession.role === 'admin') {
        switchView('admin');
      } else {
        switchView('student');
      }
      return;
    }
    
    // Clear forms
    formLogin.reset();
    loginErrorMsg.classList.add('hidden');
    
    // Set active tab default
    setLoginRole('mahasiswa');
    
    modalLogin.classList.add('active');
    loginUsernameInput.focus();
    lucide.createIcons();
  }

  function setLoginRole(role) {
    loginActiveRole = role;
    const tabMhs = document.getElementById('tab-login-mhs');
    const tabAdmin = document.getElementById('tab-login-admin');
    
    if (role === 'mahasiswa') {
      tabMhs.classList.add('active');
      tabAdmin.classList.remove('active');
      loginLabelUsername.textContent = 'Username / NIM / NIP';
      loginUsernameInput.placeholder = 'Contoh: mhs atau 20210140023';
    } else {
      tabMhs.classList.remove('active');
      tabAdmin.classList.add('active');
      loginLabelUsername.textContent = 'Admin Username';
      loginUsernameInput.placeholder = 'Contoh: admin';
    }
  }

  // Tab trigger events
  document.getElementById('tab-login-mhs').addEventListener('click', () => setLoginRole('mahasiswa'));
  document.getElementById('tab-login-admin').addEventListener('click', () => setLoginRole('admin'));

  // Open triggers
  document.getElementById('btn-login-modal').addEventListener('click', openLoginModal);
  document.getElementById('btn-login-modal-mobile').addEventListener('click', openLoginModal);

  // Close triggers
  document.getElementById('modal-login-close').addEventListener('click', () => {
    modalLogin.classList.remove('active');
  });

  // Click outside to close modal
  modalLogin.addEventListener('click', (e) => {
    if (e.target === modalLogin) {
      modalLogin.classList.remove('active');
    }
  });

  // Quick fill triggers
  document.getElementById('quick-fill-mhs').addEventListener('click', () => {
    setLoginRole('mahasiswa');
    loginUsernameInput.value = 'mhs';
    loginPasswordInput.value = 'mhs';
    formLogin.dispatchEvent(new Event('submit'));
  });
  
  document.getElementById('quick-fill-dosen').addEventListener('click', () => {
    setLoginRole('mahasiswa');
    loginUsernameInput.value = 'dosen';
    loginPasswordInput.value = 'dosen';
    formLogin.dispatchEvent(new Event('submit'));
  });

  document.getElementById('quick-fill-admin').addEventListener('click', () => {
    setLoginRole('admin');
    loginUsernameInput.value = 'admin';
    loginPasswordInput.value = 'admin';
    formLogin.dispatchEvent(new Event('submit'));
  });

  // Login Submit Event
  formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    loginErrorMsg.classList.add('hidden');
    
    const username = loginUsernameInput.value.trim();
    const password = loginPasswordInput.value;
    
    const user = database.authenticate(username, password);
    
    if (user) {
      // Validate roles matching tab expectations for cleaner user UX
      if (loginActiveRole === 'admin' && user.role !== 'admin') {
        loginErrorMsg.textContent = 'Akun ini bukan administrator!';
        loginErrorMsg.classList.remove('hidden');
        return;
      }
      if (loginActiveRole === 'mahasiswa' && user.role === 'admin') {
        loginErrorMsg.textContent = 'Gunakan portal staf untuk akun Admin!';
        loginErrorMsg.classList.remove('hidden');
        return;
      }

      showToast('Login Berhasil', `Selamat datang kembali, ${user.name}!`, 'success');
      modalLogin.classList.remove('active');
      
      if (user.role === 'admin') {
        switchView('admin');
      } else {
        switchView('student');
      }
    } else {
      loginErrorMsg.innerHTML = '<i data-lucide="alert-triangle"></i> Username atau password salah!';
      loginErrorMsg.classList.remove('hidden');
      loginPasswordInput.value = '';
      loginPasswordInput.focus();
      lucide.createIcons();
      
      // shake animation
      const modalCont = modalLogin.querySelector('.modal-content');
      modalCont.style.animation = 'none';
      setTimeout(() => {
        modalCont.style.animation = 'fadeIn 0.3s ease, shake 0.3s ease';
      }, 10);
    }
  });

  // Logout Trigger helper
  function performLogout() {
    database.logout();
    currentSession = null;
    showToast('Logout Berhasil', 'Anda telah keluar dari sesi portal SIPERU UMY.', 'success');
    switchView('landing');
  }

  document.getElementById('btn-student-logout').addEventListener('click', performLogout);
  document.getElementById('btn-admin-logout').addEventListener('click', performLogout);

  // Responsive Sidebar toggle events
  document.getElementById('student-sidebar-toggle').addEventListener('click', () => {
    document.querySelector('#view-student-dashboard .sidebar').classList.toggle('mobile-active');
  });
  document.getElementById('admin-sidebar-toggle').addEventListener('click', () => {
    document.querySelector('#view-admin-dashboard .sidebar').classList.toggle('mobile-active');
  });

  // Close sidebar clicking overlay content (when active in mobile)
  document.querySelector('#view-student-dashboard .dashboard-main').addEventListener('click', () => {
    document.querySelector('#view-student-dashboard .sidebar').classList.remove('mobile-active');
  });
  document.querySelector('#view-admin-dashboard .dashboard-main').addEventListener('click', () => {
    document.querySelector('#view-admin-dashboard .sidebar').classList.remove('mobile-active');
  });

  // ==========================================================================
  // STUDENT DASHBOARD CONTROLLER
  // ==========================================================================

  function updateStudentDashboardUI() {
    // Profil Info in Sidebar
    document.getElementById('student-profile-name').textContent = currentSession.name;
    document.getElementById('student-profile-nim').textContent = currentSession.identityNo;
    document.getElementById('student-profile-org').textContent = currentSession.organization;
    document.getElementById('student-avatar-letter').textContent = currentSession.name.charAt(0);
    
    // Welcome Banner Name
    document.getElementById('student-welcome-name').textContent = currentSession.name;

    // Date
    const todayStr = formatIndoDate(new Date());
    document.getElementById('student-current-date').textContent = todayStr;

    // Fetch personal bookings
    const bookings = database.getBookings().filter(b => b.userId === currentSession.identityNo);
    
    // Render Stats
    document.getElementById('mhs-stat-total').textContent = bookings.length;
    document.getElementById('mhs-stat-pending').textContent = bookings.filter(b => b.status === 'pending').length;
    document.getElementById('mhs-stat-approved').textContent = bookings.filter(b => b.status === 'approved').length;
    document.getElementById('mhs-stat-rejected').textContent = bookings.filter(b => b.status === 'rejected').length;

    // Render Recent Table (max 4 rows)
    const recentTableBody = document.querySelector('#table-student-recent-bookings tbody');
    recentTableBody.innerHTML = '';
    const recentBookings = [...bookings].reverse().slice(0, 4);

    if (recentBookings.length === 0) {
      recentTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-6 text-slate-400">
            Belum ada aktivitas peminjaman terdaftar. Silakan ajukan peminjaman pertama Anda!
          </td>
        </tr>
      `;
    } else {
      recentBookings.forEach(b => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="font-semibold">${b.id}</td>
          <td class="font-semibold">${b.roomName}</td>
          <td>
            <div class="font-semibold">${formatIndoDate(b.date)}</div>
            <div style="font-size: 0.75rem; color: var(--slate-500);">${b.timeSlot}</div>
          </td>
          <td><div style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${b.purpose}</div></td>
          <td><span class="badge-status ${b.status}">${b.status === 'approved' ? 'Disetujui' : b.status === 'rejected' ? 'Ditolak' : 'Menunggu'}</span></td>
          <td>
            ${b.status === 'approved' ? `
              <button class="btn btn-secondary btn-sm btn-view-slip" data-id="${b.id}">
                <i data-lucide="printer"></i> Cetak Slip
              </button>
            ` : b.status === 'rejected' ? `
              <button class="btn btn-danger btn-sm btn-view-reject-note" data-id="${b.id}" data-reason="${b.rejectionReason}">
                <i data-lucide="help-circle"></i> Info Tolak
              </button>
            ` : `
              <span class="text-slate-400 font-semibold" style="font-size: 0.8125rem;">Menunggu Review</span>
            `}
          </td>
        `;
        recentTableBody.appendChild(tr);
      });
    }

    // Render History Table
    renderStudentFullHistory();
    
    // Setup booking page components
    initStudentBookingForm();
    
    lucide.createIcons();
  }

  // Student Subview Switcher
  function switchStudentSubView(subviewId) {
    const navLinks = document.querySelectorAll('#view-student-dashboard .sidebar-link');
    const subViews = document.querySelectorAll('#view-student-dashboard .sub-view');
    
    navLinks.forEach(link => {
      if (link.getAttribute('id') === `nav-${subviewId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    subViews.forEach(v => {
      if (v.getAttribute('id') === `subview-${subviewId}`) {
        v.classList.add('active');
      } else {
        v.classList.remove('active');
      }
    });

    // Update section title header
    let title = 'Ringkasan Dashboard';
    if (subviewId === 'student-book') title = 'Cari & Pinjam Ruangan';
    if (subviewId === 'student-bookings') title = 'Riwayat Peminjaman Ruangan';
    document.getElementById('student-section-title').textContent = title;
    
    lucide.createIcons();
  }

  // Subview Nav triggers
  document.getElementById('nav-student-home').addEventListener('click', (e) => {
    e.preventDefault();
    switchStudentSubView('student-home');
  });
  document.getElementById('nav-student-book').addEventListener('click', (e) => {
    e.preventDefault();
    switchStudentSubView('student-book');
  });
  document.getElementById('nav-student-bookings').addEventListener('click', (e) => {
    e.preventDefault();
    switchStudentSubView('student-bookings');
  });
  document.getElementById('btn-quick-book').addEventListener('click', () => {
    switchStudentSubView('student-book');
  });
  document.getElementById('link-view-all-bookings').addEventListener('click', (e) => {
    e.preventDefault();
    switchStudentSubView('student-bookings');
  });

  // Table events delegation (slip print and reject tooltips)
  document.addEventListener('click', (e) => {
    const targetSlip = e.target.closest('.btn-view-slip');
    if (targetSlip) {
      const bId = targetSlip.getAttribute('data-id');
      openSlipModal(bId);
    }
    
    const targetReject = e.target.closest('.btn-view-reject-note');
    if (targetReject) {
      const bId = targetReject.getAttribute('data-id');
      const reason = targetReject.getAttribute('data-reason');
      alert(`PENGATURAN PENOLAKAN (ID: ${bId})\n\nAlasan Penolakan:\n"${reason}"\n\nSilakan ajukan proposal baru dengan perbaikan yang disarankan.`);
    }
  });

  // Student Full History search and rendering
  function renderStudentFullHistory() {
    const searchVal = document.getElementById('my-bookings-search').value.toLowerCase();
    const bookings = database.getBookings().filter(b => b.userId === currentSession.identityNo);
    const tbody = document.querySelector('#table-student-full-bookings tbody');
    tbody.innerHTML = '';

    const filtered = bookings.filter(b => {
      if (searchVal) {
        return b.roomName.toLowerCase().includes(searchVal) || 
               b.purpose.toLowerCase().includes(searchVal) ||
               b.id.toLowerCase().includes(searchVal) ||
               b.date.toLowerCase().includes(searchVal);
      }
      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="text-center py-6 text-slate-400">
            Tidak ada riwayat peminjaman yang cocok.
          </td>
        </tr>
      `;
      return;
    }

    [...filtered].reverse().forEach(b => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="font-semibold">${b.id}</td>
        <td class="font-semibold">${b.roomName}</td>
        <td>${formatIndoDate(b.date)}</td>
        <td><span class="badge badge-secondary-subtle" style="text-transform: none;">${b.timeSlot}</span></td>
        <td>${b.participants} orang</td>
        <td><div style="max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${b.purpose}">${b.purpose}</div></td>
        <td><span class="badge-status ${b.status}">${b.status === 'approved' ? 'Disetujui' : b.status === 'rejected' ? 'Ditolak' : 'Menunggu'}</span></td>
        <td style="font-size: 0.75rem; color: var(--slate-500);">${formatIndoDate(b.createdAt.split('T')[0])}</td>
        <td>
          ${b.status === 'approved' ? `
            <button class="btn btn-secondary btn-sm btn-view-slip" data-id="${b.id}">
              <i data-lucide="printer"></i> Slip
            </button>
          ` : b.status === 'rejected' ? `
            <button class="btn btn-danger btn-sm btn-view-reject-note" data-id="${b.id}" data-reason="${b.rejectionReason}" title="Klik untuk info alasan detail">
              <i data-lucide="info"></i> Alasan
            </button>
          ` : `
            <span class="text-slate-400" style="font-size: 0.75rem;">Menunggu Review</span>
          `}
        </td>
      `;
      tbody.appendChild(tr);
    });
    lucide.createIcons();
  }

  document.getElementById('my-bookings-search').addEventListener('input', renderStudentFullHistory);

  // ==========================================================================
  // STUDENT BOOKING PROCESS LOGIC
  // ==========================================================================

  let bookingSelectedRoomId = null;

  function initStudentBookingForm() {
    const listContainer = document.getElementById('booking-picker-rooms-list');
    listContainer.innerHTML = '';
    const rooms = database.getRooms().filter(r => r.status === 'tersedia');
    const searchVal = document.getElementById('booking-search-input').value.toLowerCase();

    const filteredRooms = rooms.filter(r => {
      if (searchVal) {
        return r.name.toLowerCase().includes(searchVal) || r.building.toLowerCase().includes(searchVal);
      }
      return true;
    });

    if (filteredRooms.length === 0) {
      listContainer.innerHTML = `
        <p class="text-center text-slate-400 py-4" style="font-size: 0.8125rem;">Tidak ada ruangan tersedia.</p>
      `;
    } else {
      filteredRooms.forEach(r => {
        const item = document.createElement('div');
        item.className = `picker-room-item ${bookingSelectedRoomId === r.id ? 'active' : ''}`;
        item.setAttribute('data-id', r.id);
        
        item.innerHTML = `
          <img src="${r.image}" alt="${r.name}" class="picker-room-thumb">
          <div class="picker-room-details">
            <span class="picker-room-name" title="${r.name}">${r.name}</span>
            <span class="picker-room-info"><i data-lucide="users"></i> Cap: ${r.capacity} orang</span>
            <span class="picker-room-info" style="font-size: 0.6875rem; color: var(--primary-color); font-weight: 600;">${r.building.split('Lt')[0]}</span>
          </div>
        `;
        listContainer.appendChild(item);
        
        item.addEventListener('click', () => {
          selectRoomForBooking(r.id);
        });
      });
    }

    // Set minimal date picker to today
    const dateInput = document.getElementById('booking-field-date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;

    // File input selection event listener
    const fileInput = document.getElementById('booking-field-document');
    const fileUploadText = document.getElementById('uploaded-filename-text');
    const fileUploadBadge = document.getElementById('file-upload-name');
    
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) {
        fileUploadText.textContent = fileInput.files[0].name;
        fileUploadBadge.classList.remove('hidden');
      } else {
        fileUploadBadge.classList.add('hidden');
      }
    });

    lucide.createIcons();
  }

  document.getElementById('booking-search-input').addEventListener('input', initStudentBookingForm);

  function selectRoomForBooking(roomId) {
    bookingSelectedRoomId = roomId;
    
    // Highlight list item
    document.querySelectorAll('.picker-room-item').forEach(item => {
      if (item.getAttribute('data-id') === roomId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    const room = database.getRooms().find(r => r.id === roomId);
    if (!room) return;

    // Set preview details
    document.getElementById('booking-room-preview-container').classList.remove('hidden');
    document.getElementById('booking-room-img').src = room.image;
    document.getElementById('booking-room-type').textContent = room.type;
    document.getElementById('booking-room-name').textContent = room.name;
    document.getElementById('booking-room-building').innerHTML = `<i data-lucide="map-pin"></i> ${room.building}`;
    document.getElementById('booking-room-capacity').innerHTML = `<i data-lucide="users"></i> Kapasitas Maksimal: <strong>${room.capacity} orang</strong>`;
    
    const featuresContainer = document.getElementById('booking-room-features');
    featuresContainer.innerHTML = room.features.map(f => `<span class="feature-badge">${f}</span>`).join('');

    // Update hidden field and enable submission button
    document.getElementById('booking-field-room-id').value = room.id;
    document.getElementById('btn-submit-booking-form').disabled = false;
    
    lucide.createIcons();
  }

  // Reset/Cancel Form
  document.getElementById('btn-cancel-booking-form').addEventListener('click', () => {
    document.getElementById('form-create-booking').reset();
    document.getElementById('booking-room-preview-container').classList.add('hidden');
    document.getElementById('file-upload-name').classList.add('hidden');
    document.getElementById('booking-field-room-id').value = '';
    document.getElementById('btn-submit-booking-form').disabled = true;
    bookingSelectedRoomId = null;
    
    // Remove active highlight in picker
    document.querySelectorAll('.picker-room-item').forEach(item => item.classList.remove('active'));
  });

  // Create Booking Submission
  document.getElementById('form-create-booking').addEventListener('submit', (e) => {
    e.preventDefault();

    const roomId = document.getElementById('booking-field-room-id').value;
    const bookingDate = document.getElementById('booking-field-date').value;
    const timeSlot = document.getElementById('booking-field-timeslot').value;
    const participants = parseInt(document.getElementById('booking-field-participants').value);
    const purpose = document.getElementById('booking-field-purpose').value.trim();
    
    // File simulation
    const fileInput = document.getElementById('booking-field-document');
    const documentName = fileInput.files.length > 0 ? fileInput.files[0].name : 'proposal.pdf';

    const room = database.getRooms().find(r => r.id === roomId);

    // 1. Validation: Capacity check
    if (participants > room.capacity) {
      showToast('Gagal Mengajukan', `Jumlah peserta (${participants} orang) melebihi kapasitas maksimal ruangan (${room.capacity} orang)!`, 'danger');
      return;
    }

    // 2. Validation: Time Conflict Check (Double Booking Check)
    const bookings = database.getBookings();
    const conflict = bookings.find(b => 
      b.roomId === roomId && 
      b.date === bookingDate && 
      b.status === 'approved' && // Only approved bookings lock the slot
      (b.timeSlot === timeSlot || b.timeSlot.includes('Seharian') || timeSlot.includes('Seharian'))
    );

    if (conflict) {
      showToast(
        'Jadwal Bentrok', 
        `Gagal! Ruangan ${room.name} sudah disewa untuk acara: "${conflict.purpose}" pada tanggal ${formatIndoDate(bookingDate)} pada sesi ${conflict.timeSlot}.`, 
        'danger'
      );
      return;
    }

    // Proceed to create
    const bookingData = {
      userId: currentSession.identityNo,
      userFullName: currentSession.name,
      userOrg: currentSession.organization,
      userRole: currentSession.role,
      roomId: room.id,
      roomName: room.name,
      date: bookingDate,
      timeSlot,
      participants,
      purpose,
      documentName
    };

    database.createBooking(bookingData);
    showToast('Pengajuan Terkirim', `Peminjaman ruangan ${room.name} berhasil diajukan dan sedang menunggu persetujuan Biro Aset UMY.`, 'success');
    
    // Reset Form
    document.getElementById('form-create-booking').reset();
    document.getElementById('booking-room-preview-container').classList.add('hidden');
    document.getElementById('file-upload-name').classList.add('hidden');
    document.getElementById('btn-submit-booking-form').disabled = true;
    bookingSelectedRoomId = null;

    // Refresh dashboard UI & Switch tab to history
    updateStudentDashboardUI();
    switchStudentSubView('student-bookings');
  });


  // ==========================================================================
  // ADMIN DASHBOARD CONTROLLER
  // ==========================================================================

  let adminActiveApprovalTab = 'all';

  function updateAdminDashboardUI() {
    // Admin Info in Sidebar
    document.getElementById('admin-profile-name').textContent = currentSession.name.split(' (')[0];
    document.getElementById('admin-avatar-letter').textContent = currentSession.name.charAt(0);

    // Current Date
    const todayStr = formatIndoDate(new Date());
    document.getElementById('admin-current-date').textContent = todayStr;

    // Stats
    const stats = database.getStats();
    document.getElementById('admin-stat-rooms').textContent = stats.totalRooms;
    document.getElementById('admin-stat-pending').textContent = stats.pendingBookings;
    document.getElementById('admin-stat-approved').textContent = stats.approvedBookings;
    document.getElementById('admin-stat-total').textContent = stats.totalBookings;

    // Sync notification badge next to menu item
    const badge = document.getElementById('badge-pending-count');
    if (stats.pendingBookings > 0) {
      badge.textContent = stats.pendingBookings;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }

    // Analytical Charts
    initAdminCharts();

    // Render Recent Table (max 5 rows)
    const bookings = database.getBookings();
    const recentTableBody = document.querySelector('#table-admin-recent-bookings tbody');
    recentTableBody.innerHTML = '';
    const recentAdminBookings = [...bookings].reverse().slice(0, 5);

    if (recentAdminBookings.length === 0) {
      recentTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-6 text-slate-400">Belum ada aktivitas peminjaman terdaftar.</td>
        </tr>
      `;
    } else {
      recentAdminBookings.forEach(b => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="font-semibold">${b.id}</td>
          <td>
            <div class="font-semibold">${b.userFullName}</div>
            <div style="font-size: 0.75rem; color: var(--slate-500);">${b.userId}</div>
          </td>
          <td><span class="badge badge-primary-subtle" style="font-size: 0.6875rem;">${b.userOrg}</span></td>
          <td class="font-semibold">${b.roomName}</td>
          <td>
            <div class="font-semibold">${formatIndoDate(b.date)}</div>
            <div style="font-size: 0.75rem; color: var(--slate-500);">${b.timeSlot}</div>
          </td>
          <td><span class="badge-status ${b.status}">${b.status === 'approved' ? 'Disetujui' : b.status === 'rejected' ? 'Ditolak' : 'Menunggu'}</span></td>
          <td>
            ${b.status === 'pending' ? `
              <div style="display: flex; gap: 0.25rem;">
                <button class="btn btn-primary btn-sm btn-admin-approve" data-id="${b.id}" title="Setujui"><i data-lucide="check"></i></button>
                <button class="btn btn-danger btn-sm btn-admin-reject" data-id="${b.id}" title="Tolak"><i data-lucide="x"></i></button>
              </div>
            ` : `
              <span class="text-slate-400 font-semibold" style="font-size: 0.8125rem;">Tinjauan Selesai</span>
            `}
          </td>
        `;
        recentTableBody.appendChild(tr);
      });
    }

    // Render Full Approvals list
    renderAdminFullApprovals();

    // Render Manage Rooms grid
    renderAdminManageRooms();

    lucide.createIcons();
  }

  // Admin Subview Switcher
  function switchAdminSubView(subviewId) {
    const navLinks = document.querySelectorAll('#view-admin-dashboard .sidebar-link');
    const subViews = document.querySelectorAll('#view-admin-dashboard .sub-view');
    
    navLinks.forEach(link => {
      if (link.getAttribute('id') === `nav-${subviewId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    subViews.forEach(v => {
      if (v.getAttribute('id') === `subview-${subviewId}`) {
        v.classList.add('active');
      } else {
        v.classList.remove('active');
      }
    });

    // Update section title header
    let title = 'Ringkasan Analitik Biro Aset';
    if (subviewId === 'admin-approvals') title = 'Persetujuan Peminjaman Ruangan';
    if (subviewId === 'admin-rooms') title = 'Kelola Ruangan Kampus UMY';
    document.getElementById('admin-section-title').textContent = title;
    
    lucide.createIcons();
  }

  // Subview Nav triggers
  document.getElementById('nav-admin-home').addEventListener('click', (e) => {
    e.preventDefault();
    switchAdminSubView('admin-home');
  });
  document.getElementById('nav-admin-approvals').addEventListener('click', (e) => {
    e.preventDefault();
    switchAdminSubView('admin-approvals');
  });
  document.getElementById('nav-admin-rooms').addEventListener('click', (e) => {
    e.preventDefault();
    switchAdminSubView('admin-rooms');
  });
  document.getElementById('link-admin-view-all').addEventListener('click', (e) => {
    e.preventDefault();
    switchAdminSubView('admin-approvals');
  });

  // Admin Chart.js Generation
  function initAdminCharts() {
    const bookings = database.getBookings();
    const rooms = database.getRooms();

    // 1. Group Bookings count by building/room
    const buildingCounts = {};
    bookings.forEach(b => {
      const room = rooms.find(r => r.id === b.roomId);
      const buildingName = room ? room.building.split(' Lt')[0].split('(')[0].trim() : 'Gedung Lain';
      buildingCounts[buildingName] = (buildingCounts[buildingName] || 0) + 1;
    });

    const densityLabels = Object.keys(buildingCounts);
    const densityData = Object.values(buildingCounts);

    // 2. Group Bookings count by status
    const statusCounts = { pending: 0, approved: 0, rejected: 0 };
    bookings.forEach(b => {
      if (statusCounts[b.status] !== undefined) {
        statusCounts[b.status]++;
      }
    });

    // Destroy existing instances to prevent layout memory leak or hover bugs
    if (activeCharts.density) activeCharts.density.destroy();
    if (activeCharts.status) activeCharts.status.destroy();

    // Draw Bar Chart for density
    const ctxDensity = document.getElementById('chart-room-density').getContext('2d');
    activeCharts.density = new Chart(ctxDensity, {
      type: 'bar',
      data: {
        labels: densityLabels.length > 0 ? densityLabels : ['AR Fachruddin', 'KH Ibrahim', 'Siti Walidah', 'Sportorium'],
        datasets: [{
          label: 'Frekuensi Peminjaman (Acara)',
          data: densityData.length > 0 ? densityData : [4, 6, 2, 3],
          backgroundColor: '#0F6B40',
          borderColor: '#0A4D2E',
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        }
      }
    });

    // Draw Doughnut Chart for status breakdown
    const ctxStatus = document.getElementById('chart-booking-status').getContext('2d');
    activeCharts.status = new Chart(ctxStatus, {
      type: 'doughnut',
      data: {
        labels: ['Disetujui', 'Menunggu', 'Ditolak'],
        datasets: [{
          data: [statusCounts.approved, statusCounts.pending, statusCounts.rejected],
          backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
          borderWidth: 2,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, font: { family: 'Plus Jakarta Sans', weight: 600 } }
          }
        }
      }
    });
  }

  // ==========================================================================
  // ADMINpersetujuan / APPROVALS TIMELINE LOGIC
  // ==========================================================================

  function renderAdminFullApprovals() {
    const bookings = database.getBookings();
    const tbody = document.querySelector('#table-admin-full-approvals tbody');
    tbody.innerHTML = '';

    const filtered = bookings.filter(b => {
      if (adminActiveApprovalTab === 'all') return true;
      return b.status === adminActiveApprovalTab;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="text-center py-6 text-slate-400">
            Tidak ada pengajuan dengan status "${adminActiveApprovalTab}".
          </td>
        </tr>
      `;
      return;
    }

    [...filtered].reverse().forEach(b => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="font-semibold">${b.id}</td>
        <td>
          <div class="font-semibold">${b.userFullName}</div>
          <div style="font-size: 0.75rem; color: var(--slate-500);">${b.userId} (${b.userRole})</div>
          <span class="badge badge-primary-subtle" style="font-size: 0.625rem; text-transform:none; margin-top:0.25rem;">${b.userOrg}</span>
        </td>
        <td>
          <div class="font-semibold">${b.roomName}</div>
        </td>
        <td>
          <div class="font-semibold">${formatIndoDate(b.date)}</div>
          <div style="font-size: 0.75rem; color: var(--slate-500);">${b.timeSlot}</div>
        </td>
        <td>${b.participants} orang</td>
        <td><div style="max-width: 180px; font-size: 0.8125rem; max-height: 80px; overflow-y: auto;">${b.purpose}</div></td>
        <td>
          <button class="btn btn-secondary btn-sm btn-admin-download-file" data-filename="${b.documentName}">
            <i data-lucide="file-text"></i> ${b.documentName}
          </button>
        </td>
        <td><span class="badge-status ${b.status}">${b.status === 'approved' ? 'Disetujui' : b.status === 'rejected' ? 'Ditolak' : 'Menunggu'}</span></td>
        <td>
          ${b.status === 'pending' ? `
            <div style="display: flex; gap: 0.25rem;">
              <button class="btn btn-primary btn-sm btn-admin-approve" data-id="${b.id}" style="padding: 0.375rem 0.5rem;"><i data-lucide="check"></i> Setuju</button>
              <button class="btn btn-danger btn-sm btn-admin-reject" data-id="${b.id}" style="padding: 0.375rem 0.5rem;"><i data-lucide="x"></i> Tolak</button>
            </div>
          ` : b.status === 'rejected' ? `
            <div style="max-width: 150px; font-size: 0.75rem; color: var(--danger-color); font-weight: 500;">
              <strong>Alasan Tolak:</strong> ${b.rejectionReason}
            </div>
          ` : `
            <button class="btn btn-secondary btn-sm btn-view-slip" data-id="${b.id}">
              <i data-lucide="printer"></i> Cetak Slip
            </button>
          `}
        </td>
      `;
      tbody.appendChild(tr);
    });
    lucide.createIcons();
  }

  // Handle Tab switcher in approvals panel
  document.getElementById('approval-tab-filters').addEventListener('click', (e) => {
    if (e.target.classList.contains('tab-btn')) {
      document.querySelectorAll('#approval-tab-filters .tab-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      adminActiveApprovalTab = e.target.getAttribute('data-status');
      renderAdminFullApprovals();
    }
  });

  // Action Buttons Listeners (Approve & Reject Triggers)
  document.addEventListener('click', (e) => {
    // 1. Approve Trigger
    const btnApprove = e.target.closest('.btn-admin-approve');
    if (btnApprove) {
      const bId = btnApprove.getAttribute('data-id');
      database.updateBookingStatus(bId, 'approved');
      showToast('Peminjaman Disetujui', `Booking ${bId} berhasil diverifikasi dan disetujui.`, 'success');
      updateAdminDashboardUI();
    }

    // 2. Reject Trigger (Opens modal to request reason)
    const btnReject = e.target.closest('.btn-admin-reject');
    if (btnReject) {
      const bId = btnReject.getAttribute('data-id');
      openRejectReasonModal(bId);
    }

    // 3. Document download simulation
    const btnDownload = e.target.closest('.btn-admin-download-file');
    if (btnDownload) {
      const filename = btnDownload.getAttribute('data-filename');
      showToast('Mengunduh Berkas', `Simulasi download file: "${filename}" sedang berlangsung...`, 'info');
    }
  });

  // Rejection Reason Modal Controllers
  const modalReject = document.getElementById('modal-reject-reason');
  const formReject = document.getElementById('form-reject-booking');
  const rejectBookingIdInput = document.getElementById('reject-booking-id');
  const rejectReasonInput = document.getElementById('reject-reason-text');

  function openRejectReasonModal(bookingId) {
    formReject.reset();
    rejectBookingIdInput.value = bookingId;
    modalReject.classList.add('active');
    rejectReasonInput.focus();
  }

  document.getElementById('modal-reject-close').addEventListener('click', () => modalReject.classList.remove('active'));
  document.getElementById('btn-cancel-reject').addEventListener('click', () => modalReject.classList.remove('active'));
  modalReject.addEventListener('click', (e) => {
    if (e.target === modalReject) modalReject.classList.remove('active');
  });

  formReject.addEventListener('submit', (e) => {
    e.preventDefault();
    const bId = rejectBookingIdInput.value;
    const reason = rejectReasonInput.value.trim();

    database.updateBookingStatus(bId, 'rejected', reason);
    showToast('Peminjaman Ditolak', `Peminjaman ${bId} telah ditolak dengan alasan tertulis.`, 'success');
    modalReject.classList.remove('active');
    updateAdminDashboardUI();
  });


  // ==========================================================================
  // ADMIN ROOMS MANAGEMENT CONTROLLERS (CRUD ROOMS)
  // ==========================================================================

  function renderAdminManageRooms() {
    const searchVal = document.getElementById('admin-rooms-search').value.toLowerCase();
    const rooms = database.getRooms();
    const grid = document.getElementById('admin-rooms-grid');
    grid.innerHTML = '';

    const filtered = rooms.filter(r => {
      if (searchVal) {
        return r.name.toLowerCase().includes(searchVal) || 
               r.building.toLowerCase().includes(searchVal) || 
               r.type.toLowerCase().includes(searchVal);
      }
      return true;
    });

    filtered.forEach(room => {
      const card = document.createElement('div');
      card.className = 'room-card';
      
      const featuresStr = room.features.slice(0, 3).map(f => `<span class="feature-badge">${f}</span>`).join('');
      const plusFeature = room.features.length > 3 ? `<span class="feature-badge">+${room.features.length - 3}</span>` : '';
      
      card.innerHTML = `
        <div class="room-card-image">
          <img src="${room.image}" alt="${room.name}">
          <span class="room-card-badge">${room.type}</span>
          <span class="room-card-status ${room.status === 'tersedia' ? 'tersedia' : 'maintenance'}">
            ${room.status === 'tersedia' ? 'Tersedia' : 'Maintance'}
          </span>
        </div>
        <div class="room-card-body">
          <div class="room-card-building">${room.building}</div>
          <h3>${room.name}</h3>
          <p class="room-card-desc">${room.description}</p>
          <div class="room-card-info">
            <span><i data-lucide="users"></i> Cap: ${room.capacity} orang</span>
            <span><i data-lucide="settings"></i> Status: ${room.status}</span>
          </div>
          <div class="room-features-badges" style="margin-top: 0.75rem;">
            ${featuresStr}
            ${plusFeature}
          </div>
        </div>
        <div class="room-card-footer">
          <div class="room-card-controls">
            <button class="btn btn-secondary btn-icon btn-sm btn-admin-edit-room" data-id="${room.id}" style="flex-grow:1;">
              <i data-lucide="edit-3"></i> Edit Info
            </button>
            <button class="btn btn-secondary btn-icon-only btn-delete btn-admin-delete-room" data-id="${room.id}" title="Hapus Ruangan">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    // Attach Event Listeners on CRUD buttons
    grid.querySelectorAll('.btn-admin-edit-room').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const rId = e.currentTarget.getAttribute('data-id');
        openManageRoomModal(rId);
      });
    });
    
    grid.querySelectorAll('.btn-admin-delete-room').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const rId = e.currentTarget.getAttribute('data-id');
        handleDeleteRoom(rId);
      });
    });

    lucide.createIcons();
  }

  document.getElementById('admin-rooms-search').addEventListener('input', renderAdminManageRooms);

  // Manage Room Modal (Add/Edit)
  const modalManageRoom = document.getElementById('modal-manage-room');
  const formManageRoom = document.getElementById('form-manage-room');
  const manageRoomTitle = document.getElementById('manage-room-modal-title');
  const manageRoomSubmitBtn = document.getElementById('btn-manage-room-submit');
  
  // Fields inputs
  const mRoomIdInput = document.getElementById('manage-room-id');
  const mRoomNameInput = document.getElementById('manage-room-name');
  const mRoomBuildingInput = document.getElementById('manage-room-building');
  const mRoomTypeInput = document.getElementById('manage-room-type');
  const mRoomCapacityInput = document.getElementById('manage-room-capacity');
  const mRoomStatusInput = document.getElementById('manage-room-status');
  const mRoomDescInput = document.getElementById('manage-room-desc');
  const mRoomImageInput = document.getElementById('manage-room-image');

  function openManageRoomModal(roomId = null) {
    formManageRoom.reset();
    mRoomIdInput.value = '';
    
    if (roomId) {
      // Edit Mode
      const room = database.getRooms().find(r => r.id === roomId);
      if (!room) return;

      mRoomIdInput.value = room.id;
      mRoomNameInput.value = room.name;
      mRoomBuildingInput.value = room.building;
      mRoomTypeInput.value = room.type;
      mRoomCapacityInput.value = room.capacity;
      mRoomStatusInput.value = room.status;
      mRoomDescInput.value = room.description;
      mRoomImageInput.value = room.image;

      // Check the checkboxes according to features array
      const checkboxes = document.querySelectorAll('input[name="room-features"]');
      checkboxes.forEach(cb => {
        cb.checked = room.features.includes(cb.value);
      });

      manageRoomTitle.textContent = 'Edit Informasi Ruangan';
      manageRoomSubmitBtn.textContent = 'Simpan Perubahan';
    } else {
      // Add Mode
      manageRoomTitle.textContent = 'Tambah Ruangan Baru';
      manageRoomSubmitBtn.textContent = 'Tambah Ruangan';
    }

    modalManageRoom.classList.add('active');
  }

  // Open triggers
  document.getElementById('btn-admin-add-room').addEventListener('click', () => openManageRoomModal());

  // Close triggers
  document.getElementById('modal-manage-room-close').addEventListener('click', () => modalManageRoom.classList.remove('active'));
  document.getElementById('btn-manage-room-cancel').addEventListener('click', () => modalManageRoom.classList.remove('active'));
  modalManageRoom.addEventListener('click', (e) => {
    if (e.target === modalManageRoom) modalManageRoom.classList.remove('active');
  });

  // Manage Room Submission (Add & Update logic)
  formManageRoom.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = mRoomIdInput.value;
    const name = mRoomNameInput.value.trim();
    const building = mRoomBuildingInput.value.trim();
    const type = mRoomTypeInput.value;
    const capacity = parseInt(mRoomCapacityInput.value);
    const status = mRoomStatusInput.value;
    const description = mRoomDescInput.value.trim();
    const image = mRoomImageInput.value;

    // Collect features from checked checkboxes
    const checkboxes = document.querySelectorAll('input[name="room-features"]:checked');
    const features = Array.from(checkboxes).map(cb => cb.value);

    if (features.length === 0) {
      showToast('Validasi Gagal', 'Harap pilih minimal satu fasilitas ruangan!', 'warning');
      return;
    }

    const roomData = {
      id: id || 'room-' + Date.now(),
      name,
      building,
      type,
      capacity,
      status,
      description,
      image,
      features
    };

    if (id) {
      // Update
      database.updateRoom(roomData);
      showToast('Ruangan Diupdate', `Informasi ruangan "${name}" berhasil diperbarui.`, 'success');
    } else {
      // Add
      database.addRoom(roomData);
      showToast('Ruangan Ditambahkan', `Ruangan baru "${name}" berhasil ditambahkan ke database.`, 'success');
    }

    modalManageRoom.classList.remove('active');
    updateAdminDashboardUI();
  });

  // Delete Room Logic
  function handleDeleteRoom(roomId) {
    const room = database.getRooms().find(r => r.id === roomId);
    if (!room) return;

    const confirmDelete = confirm(`Apakah Anda yakin ingin menghapus ruangan "${room.name}"?\n\nTindakan ini bersifat permanen.`);
    if (confirmDelete) {
      database.deleteRoom(roomId);
      showToast('Ruangan Dihapus', `Ruangan "${room.name}" berhasil dihapus dari sistem.`, 'success');
      updateAdminDashboardUI();
    }
  }


  // ==========================================================================
  // ROOM DETAIL MODAL (General Public View)
  // ==========================================================================

  const modalRoomDetail = document.getElementById('modal-room-detail');

  function openRoomDetailModal(roomId) {
    const room = database.getRooms().find(r => r.id === roomId);
    if (!room) return;

    document.getElementById('room-detail-title').textContent = room.name;
    document.getElementById('room-detail-img').src = room.image;
    document.getElementById('room-detail-type').textContent = room.type;
    document.getElementById('room-detail-name').textContent = room.name;
    document.getElementById('room-detail-building').innerHTML = `<i data-lucide="map-pin"></i> ${room.building}`;
    document.getElementById('room-detail-capacity').textContent = room.capacity;
    
    const statusLabel = document.getElementById('room-detail-status');
    statusLabel.textContent = room.status === 'tersedia' ? 'Tersedia' : 'Dalam Pemeliharaan';
    if (room.status === 'tersedia') {
      statusLabel.className = 'num text-green';
    } else {
      statusLabel.className = 'num text-red';
    }

    document.getElementById('room-detail-desc').textContent = room.description;

    const featuresList = document.getElementById('room-detail-features');
    featuresList.innerHTML = room.features.map(f => `<li>${f}</li>`).join('');

    const btnBookInDetail = document.getElementById('room-detail-btn-book');
    if (room.status !== 'tersedia') {
      btnBookInDetail.disabled = true;
      btnBookInDetail.innerHTML = `<i data-lucide="calendar"></i> Tidak Tersedia untuk Dipinjam`;
    } else {
      btnBookInDetail.disabled = false;
      btnBookInDetail.innerHTML = `<i data-lucide="calendar-plus"></i> Ajukan Peminjaman Sekarang`;
      
      // Detach and attach fresh listener
      btnBookInDetail.onclick = () => {
        modalRoomDetail.classList.remove('active');
        handleDirectBooking(room.id);
      };
    }

    modalRoomDetail.classList.add('active');
    lucide.createIcons();
  }

  document.getElementById('modal-room-detail-close').addEventListener('click', () => modalRoomDetail.classList.remove('active'));
  modalRoomDetail.addEventListener('click', (e) => {
    if (e.target === modalRoomDetail) modalRoomDetail.classList.remove('active');
  });


  // ==========================================================================
  // SLIP PREVIEW & PDF PRINTING CONTROLLERS
  // ==========================================================================

  const modalSlip = document.getElementById('modal-slip-preview');

  function openSlipModal(bookingId) {
    const booking = database.getBookings().find(b => b.id === bookingId);
    if (!booking) return;

    // Generate slip values
    document.getElementById('slip-booking-id').textContent = booking.id;
    document.getElementById('slip-no').textContent = `SIP/SARPRAS/UMY/2026/${booking.id.split('-')[1]}`;
    document.getElementById('slip-user-name').textContent = booking.userFullName;
    document.getElementById('slip-user-id').textContent = booking.userId;
    document.getElementById('slip-user-org').textContent = booking.userOrg;
    document.getElementById('slip-room-name').textContent = booking.roomName;
    document.getElementById('slip-booking-date').textContent = formatIndoDate(booking.date);
    document.getElementById('slip-booking-timeslot').textContent = booking.timeSlot;
    document.getElementById('slip-booking-participants').textContent = `${booking.participants} Orang`;
    document.getElementById('slip-booking-purpose').textContent = booking.purpose;
    document.getElementById('slip-booking-document').textContent = booking.documentName;

    // Signatures timestamps
    const createdDate = booking.createdAt.split('T')[0];
    document.getElementById('slip-date-created').textContent = formatIndoDate(createdDate).replace(/Kamis,|Jumat,|Sabtu,|Minggu,|Senin,|Selasa,|Rabu,/g, '').trim();
    
    document.getElementById('slip-sig-user-name').textContent = booking.userFullName;
    document.getElementById('slip-sig-user-id').textContent = `ID No. ${booking.userId}`;

    // Admin signing name
    const adminUser = database.getUsers().find(u => u.role === 'admin');
    document.getElementById('slip-sig-admin-name').textContent = adminUser.name;

    modalSlip.classList.add('active');
    lucide.createIcons();
  }

  document.getElementById('modal-slip-close').addEventListener('click', () => modalSlip.classList.remove('active'));
  modalSlip.addEventListener('click', (e) => {
    if (e.target === modalSlip) modalSlip.classList.remove('active');
  });

  // Window Print trigger
  document.getElementById('btn-print-slip').addEventListener('click', () => {
    window.print();
  });


  // ==========================================================================
  // INITIALIZATION HANDLER
  // ==========================================================================
  
  initRouter();
});
