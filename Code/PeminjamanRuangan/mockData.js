// Mock Data and LocalStorage Database Initializer for UMY Room Booking System

const STORAGE_KEYS = {
  USERS: 'umy_booking_users',
  ROOMS: 'umy_booking_rooms',
  BOOKINGS: 'umy_booking_bookings',
  SESSION: 'umy_booking_session'
};

const DEFAULT_USERS = [
  {
    username: 'mhs',
    password: 'mhs', // Simple password for demo
    name: 'Ahmad Dahlan',
    identityNo: '20210140023',
    role: 'mahasiswa',
    organization: 'BEM Fakultas Teknik UMY',
    email: 'ahmad.dahlan.ft21@mail.umy.ac.id',
    phone: '081234567890'
  },
  {
    username: 'dosen',
    password: 'dosen',
    name: 'Dr. Siti Walidah, M.T.',
    identityNo: '197508122003122001',
    role: 'dosen',
    organization: 'Prodi Teknologi Informasi UMY',
    email: 'siti.walidah@umy.ac.id',
    phone: '089876543210'
  },
  {
    username: 'admin',
    password: 'admin',
    name: 'Budi Santoso, S.Kom. (Sarpras)',
    identityNo: '198204152010121003',
    role: 'admin',
    organization: 'Biro Aset dan Sarana Prasarana UMY',
    email: 'budi.sarpras@umy.ac.id',
    phone: '082211443355'
  }
];

const DEFAULT_ROOMS = [
  {
    id: 'room-1',
    name: 'Amphitheater K.H. Ibrahim',
    building: 'Gedung K.H. Ibrahim (E6) Lt. 5',
    capacity: 200,
    type: 'Amphitheater',
    features: ['AC', 'Proyektor Dual', 'Sound System Pro', 'Wi-Fi UMY Premium', 'Panggung & Podium'],
    image: 'assets/amphitheater.png',
    description: 'Ruang amphitheater modern dengan kursi bertingkat, sangat cocok untuk kuliah umum, seminar nasional, dan pemutaran film/media.',
    status: 'tersedia' // tersedia, maintance
  },
  {
    id: 'room-2',
    name: 'Ruang Sidang Utama A.R. Fachruddin',
    building: 'Gedung A.R. Fachruddin B Lt. 2',
    capacity: 75,
    type: 'Conference Room',
    features: ['AC', 'Proyektor HD', 'Mic Meja Delegate', 'Video Conference System', 'Wi-Fi UMY Premium'],
    image: 'assets/ruang_sidang.png',
    description: 'Ruang sidang formal dengan meja berbentuk U, dilengkapi mic delegasi di setiap meja. Ideal untuk rapat dinas, audiensi Rektorat, dan yudisium.',
    status: 'tersedia'
  },
  {
    id: 'room-3',
    name: 'Main Hall Sportorium UMY',
    building: 'Sportorium UMY (Sayap Selatan)',
    capacity: 4000,
    type: 'Auditorium',
    features: ['Sound System Lapangan', 'Panggung Utama (12x8m)', 'Backdrop Frame', 'Pendingin Udara AC & Fan', 'Lobby & Ruang Transit VIP', 'Wi-Fi UMY Premium'],
    image: 'assets/sportorium.png',
    description: 'Gedung serbaguna termegah di UMY. Tempat penyelenggaraan wisuda, seminar internasional, konser, kegiatan olahraga, dan MATAF UMY.',
    status: 'tersedia'
  },
  {
    id: 'room-4',
    name: 'Ruang Seminar F6.102',
    building: 'Gedung Siti Walidah (F6) Lt. 1',
    capacity: 80,
    type: 'Seminar Room',
    features: ['AC', 'Proyektor', 'Whiteboard', 'Sound System Standar', 'Wi-Fi UMY Premium'],
    image: 'assets/ruang_seminar.png',
    description: 'Ruang seminar modular yang dapat ditata dengan model Class-room maupun U-Shape. Sering digunakan untuk rapat HMJ dan diskusi publik.',
    status: 'tersedia'
  },
  {
    id: 'room-5',
    name: 'Laboratorium Rekayasa Perangkat Lunak',
    building: 'Gedung Ki Bagus Hadikusumo (E1) Lt. 3',
    capacity: 40,
    type: 'Computer Lab',
    features: ['AC', '40 unit PC Intel Core i7', 'Smart TV 75 inch', 'High Speed LAN', 'Proyektor HD'],
    image: 'assets/lab_komputer.png',
    description: 'Laboratorium komputer dengan spesifikasi tinggi untuk pemrograman, desain grafis, dan simulasi jaringan. Mendukung kegiatan praktikum dan sertifikasi.',
    status: 'tersedia'
  },
  {
    id: 'room-6',
    name: 'Meeting Room Lt. 1 AR. Fachruddin A',
    building: 'Gedung A.R. Fachruddin A Lt. 1',
    capacity: 15,
    type: 'Meeting Room',
    features: ['AC', 'TV Monitor 65 inch', 'Glass Whiteboard', 'Wi-Fi UMY Premium', 'Meja Oval Executive'],
    image: 'assets/meeting_room.png',
    description: 'Ruang diskusi kecil bernuansa premium untuk rapat pimpinan, konsultasi dosen, dan bimbingan tim mahasiswa berprestasi.',
    status: 'tersedia'
  }
];

// Helper to calculate relative dates so the bookings look recent
function getRelativeDate(offsetDays) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
}

const DEFAULT_BOOKINGS = [
  {
    id: 'BKG-001',
    userId: '20210140023',
    userFullName: 'Ahmad Dahlan',
    userOrg: 'BEM Fakultas Teknik UMY',
    userRole: 'mahasiswa',
    roomId: 'room-1',
    roomName: 'Amphitheater K.H. Ibrahim',
    date: getRelativeDate(2), // 2 days in the future
    timeSlot: 'Pagi (08:00 - 12:00)',
    participants: 120,
    purpose: 'Seminar Nasional Teknologi "Muda Mendunia Tech-Fest 2026"',
    documentName: 'proposal_seminar_bem_ft.pdf',
    status: 'approved',
    rejectionReason: '',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() // 3 days ago
  },
  {
    id: 'BKG-002',
    userId: '20210140023',
    userFullName: 'Ahmad Dahlan',
    userOrg: 'BEM Fakultas Teknik UMY',
    userRole: 'mahasiswa',
    roomId: 'room-3',
    roomName: 'Main Hall Sportorium UMY',
    date: getRelativeDate(10), // 10 days in the future
    timeSlot: 'Seharian (07:00 - 18:00)',
    participants: 3000,
    purpose: 'Masa Ta\'aruf Mahasiswa Baru Fakultas Teknik 2026',
    documentName: 'proposal_mataf_ft_2026.pdf',
    status: 'pending',
    rejectionReason: '',
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString() // 1 day ago
  },
  {
    id: 'BKG-003',
    userId: '197508122003122001',
    userFullName: 'Dr. Siti Walidah, M.T.',
    userOrg: 'Prodi Teknologi Informasi UMY',
    userRole: 'dosen',
    roomId: 'room-5',
    roomName: 'Laboratorium Rekayasa Perangkat Lunak',
    date: getRelativeDate(-1), // yesterday
    timeSlot: 'Siang (13:00 - 17:00)',
    participants: 35,
    purpose: 'Ujian Sertifikasi Internasional RedHat System Administrator',
    documentName: 'surat_tugas_sertifikasi_ti.pdf',
    status: 'approved',
    rejectionReason: '',
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'BKG-004',
    userId: '20210140023',
    userFullName: 'Ahmad Dahlan',
    userOrg: 'BEM Fakultas Teknik UMY',
    userRole: 'mahasiswa',
    roomId: 'room-2',
    roomName: 'Ruang Sidang Utama A.R. Fachruddin',
    date: getRelativeDate(1), // tomorrow
    timeSlot: 'Malam (18:30 - 21:30)',
    participants: 50,
    purpose: 'Rapat Koordinasi Bulanan BEM Universitas',
    documentName: 'surat_peminjaman_ruang_sidang.pdf',
    status: 'rejected',
    rejectionReason: 'Ruang Sidang Utama A.R. Fachruddin tidak diizinkan untuk rapat organisasi mahasiswa di malam hari. Harap menggunakan Ruang Seminar F6 atau Ruang Rapat Fakultas.',
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  }
];

// Database Class definition
class RoomBookingDatabase {
  constructor() {
    this.initDatabase();
  }

  initDatabase() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ROOMS)) {
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(DEFAULT_ROOMS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(DEFAULT_BOOKINGS));
    }
  }

  // Users
  getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS));
  }

  authenticate(username, password) {
    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (user) {
      const sessionUser = { ...user };
      delete sessionUser.password; // Do not store password in active session
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionUser));
      return sessionUser;
    }
    return null;
  }

  getCurrentSession() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION));
  }

  logout() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }

  // Rooms
  getRooms() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ROOMS));
  }

  saveRooms(rooms) {
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
  }

  addRoom(room) {
    const rooms = this.getRooms();
    rooms.push(room);
    this.saveRooms(rooms);
    return room;
  }

  updateRoom(updatedRoom) {
    let rooms = this.getRooms();
    rooms = rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r);
    this.saveRooms(rooms);
    return updatedRoom;
  }

  deleteRoom(roomId) {
    let rooms = this.getRooms();
    rooms = rooms.filter(r => r.id !== roomId);
    this.saveRooms(rooms);
  }

  // Bookings
  getBookings() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS));
  }

  saveBookings(bookings) {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  }

  createBooking(bookingData) {
    const bookings = this.getBookings();
    const newBooking = {
      id: 'BKG-' + String(bookings.length + 101).padStart(3, '0'),
      createdAt: new Date().toISOString(),
      status: 'pending',
      rejectionReason: '',
      ...bookingData
    };
    bookings.push(newBooking);
    this.saveBookings(bookings);
    return newBooking;
  }

  updateBookingStatus(bookingId, status, rejectionReason = '') {
    let bookings = this.getBookings();
    bookings = bookings.map(b => {
      if (b.id === bookingId) {
        return { ...b, status, rejectionReason };
      }
      return b;
    });
    this.saveBookings(bookings);
  }

  // Dashboard Stats
  getStats() {
    const bookings = this.getBookings();
    const rooms = this.getRooms();
    
    return {
      totalRooms: rooms.length,
      availableRooms: rooms.filter(r => r.status === 'tersedia').length,
      maintenanceRooms: rooms.filter(r => r.status === 'maintenance').length,
      totalBookings: bookings.length,
      pendingBookings: bookings.filter(b => b.status === 'pending').length,
      approvedBookings: bookings.filter(b => b.status === 'approved').length,
      rejectedBookings: bookings.filter(b => b.status === 'rejected').length
    };
  }
}

// Make globally accessible
window.db = new RoomBookingDatabase();
