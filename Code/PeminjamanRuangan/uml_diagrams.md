# Dokumentasi Analisis Sistem & Diagram UML: SIPERU UMY

Dokumen ini berisi analisis kebutuhan sistem beserta spesifikasi diagram UML dalam format **Mermaid.js** untuk **SIPERU UMY (Sistem Peminjaman Ruangan Kampus UMY)**.

---

## 1. Analisis Kebutuhan Sistem (System Requirements Analysis)

### A. Kebutuhan Fungsional (Functional Requirements)
1. **Portal Login & Autentikasi**: Pengguna (Mahasiswa, Dosen, Admin Sarpras) dapat melakukan login secara aman untuk mengakses menu dashboard sesuai dengan role masing-masing.
2. **Lihat Ketersediaan Ruangan**: Pemohon dapat mencari, memfilter, dan melihat detail spesifikasi ruangan (kapasitas, fasilitas, lokasi gedung) secara realtime.
3. **Pengajuan Peminjaman (Booking)**: Pemohon dapat mengajukan permohonan sewa ruangan dengan menentukan tanggal, sesi waktu, jumlah peserta, tujuan kegiatan, serta mengunggah mock berkas proposal dalam format PDF.
4. **Validasi Bentrok Jadwal**: Sistem secara otomatis memblokir pengajuan baru jika ruangan, tanggal, dan sesi waktu yang diminta telah disewa atau sedang dalam status pending/approved oleh pemohon lain.
5. **Validasi Kapasitas Ruang**: Sistem memastikan jumlah estimasi peserta yang diinput tidak melebihi kapasitas maksimal daya tampung ruangan.
6. **Dashboard & Visualisasi Staf**: Staf Sarpras (Admin) dapat melihat visualisasi kepadatan peminjaman per gedung dan diagram status peminjaman menggunakan Chart.js.
7. **Persetujuan & Penolakan**: Admin Sarpras dapat mengubah status peminjaman menjadi disetujui (Approved) atau ditolak (Rejected) dengan menyertakan alasan penolakan tertulis.
8. **Cetak Slip Izin**: Pemohon dapat mencetak slip digital resmi yang dilengkapi barcode QR Code sebagai bukti verifikasi sah di lapangan.

### B. Kebutuhan Non-Fungsional (Non-functional Requirements)
1. **Local State Persistence**: Menggunakan `localStorage` browser untuk menyimpan data users, rooms, dan bookings secara lokal tanpa database eksternal.
2. **Kecepatan SPA**: Navigasi perpindahan menu cepat tanpa memicu reload halaman secara penuh (Single Page Application).
3. **Antarmuka Responsive**: Desain premium berbasis mobile-first yang rapi saat diakses melalui smartphone maupun PC.
4. **Printability**: Slip digital dioptimalkan khusus menggunakan CSS `@media print` agar rapi saat dicetak ke format kertas fisik atau disimpan sebagai PDF.

---

## 2. Use Case Diagram

```mermaid
graph LR
    subgraph Aktor
        M["Mahasiswa"]
        D["Dosen"]
        A["Admin Sarpras (Staf Aset)"]
    end
    
    subgraph "Sistem Peminjaman Ruangan (SIPERU UMY)"
        UC1("(UC1) Login Portal")
        UC2("(UC2) Cari & Lihat Detail Ruangan")
        UC3("(UC3) Ajukan Peminjaman Ruangan")
        UC4("(UC4) Unggah Proposal/Surat")
        UC5("(UC5) Lihat Riwayat & Status Booking")
        UC6("(UC6) Cetak Slip Izin Peminjaman")
        UC7("(UC7) Lihat Analisis Dashboard")
        UC8("(UC8) Setujui/Tolak Peminjaman")
        UC9("(UC9) Kelola Data Ruangan - CRUD")
    end
    
    M --> UC1
    M --> UC2
    M --> UC3
    M --> UC5
    
    D --> UC1
    D --> UC2
    D --> UC3
    D --> UC5
    
    UC3 -.->|include| UC4
    UC5 -.->|extend| UC6
    
    A --> UC1
    A --> UC7
    A --> UC8
    A --> UC9
```

---

## 3. Activity Diagram

```mermaid
graph TD
    Start([Mulai]) --> Login[Login Akun Mahasiswa/Dosen]
    Login --> SelectRoom[Pilih Ruangan & Isi Form Detail Booking]
    SelectRoom --> UploadDoc[Unggah File Proposal/Surat Rekomendasi]
    UploadDoc --> CheckConflict{Ada Bentrok Jadwal?}
    
    CheckConflict -- Ya --> AlertConflict[Tampilkan Peringatan Jadwal Bentrok]
    AlertConflict --> SelectRoom
    
    CheckConflict -- Tidak --> CheckCapacity{Peserta > Kapasitas Ruang?}
    CheckCapacity -- Ya --> AlertCapacity[Tampilkan Peringatan Over-Capacity]
    AlertCapacity --> SelectRoom
    
    CheckCapacity -- Tidak --> Submit[Kirim Pengajuan Peminjaman]
    Submit --> AdminView[Admin Sarpras Menerima Notifikasi Pengajuan]
    
    AdminView --> ReviewDoc{Verifikasi Dokumen & Jadwal}
    ReviewDoc -- Setujui --> Approve[Ubah Status: DISETUJUI]
    Approve --> PrintSlip[Unduh & Cetak Slip Izin Peminjaman]
    PrintSlip --> End([Selesai])
    
    ReviewDoc -- Tolak --> Reject[Masukkan Alasan & Ubah Status: DITOLAK]
    Reject --> End
```

---

## 4. Class Diagram

```mermaid
classDiagram
    class RoomBookingDatabase {
        -localStorageKeys STORAGE_KEYS
        +initDatabase()
        +getUsers() Array~User~
        +authenticate(username, password) User
        +getCurrentSession() User
        +logout()
        +getRooms() Array~Room~
        +addRoom(room Room) Room
        +updateRoom(room Room) Room
        +deleteRoom(roomId String)
        +getBookings() Array~Booking~
        +createBooking(bookingData Object) Booking
        +updateBookingStatus(id String, status String, reason String)
        +getStats() Object
    }
    
    class User {
        +String username
        +String password
        +String name
        +String identityNo
        +String role
        +String organization
        +String email
        +String phone
    }
    
    class Room {
        +String id
        +String name
        +String building
        +int capacity
        +String type
        +String[] features
        +String image
        +String description
        +String status
    }
    
    class Booking {
        +String id
        +String userId
        +String userFullName
        +String userOrg
        +String userRole
        +String roomId
        +String roomName
        +String date
        +String timeSlot
        +int participants
        +String purpose
        +String documentName
        +String status
        +String rejectionReason
        +DateTime createdAt
    }
    
    RoomBookingDatabase "1" --> "*" User : Mengelola data
    RoomBookingDatabase "1" --> "*" Room : Mengelola data
    RoomBookingDatabase "1" --> "*" Booking : Mengelola data
    Booking "*" --> "1" User : Diajukan oleh
    Booking "*" --> "1" Room : Memesan
```

---

## 5. Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor M as Mahasiswa / Dosen
    participant UI as Frontend UI (SPA)
    participant DB as RoomBookingDatabase
    actor A as Admin Sarpras
    
    M->>UI: Isi Form Booking (Tanggal, Sesi, Peserta)
    UI->>DB: getBookings() & getRooms()
    DB-->>UI: Kembalikan Data Booking & Kapasitas Ruang
    UI->>UI: Validasi Bentrok Jadwal & Batas Kapasitas
    
    alt Validasi Gagal (Bentrok / Overcapacity)
        UI-->>M: Tampilkan Toast Error Peringatan
    else Validasi Sukses
        M->>UI: Unggah Proposal & Klik Submit Form
        UI->>DB: createBooking(bookingData)
        DB-->>UI: Sukses & generate ID Booking (e.g. BKG-105)
        UI-->>M: Tampilkan Notifikasi Sukses & Buka Menu Riwayat
    end
    
    note over A, DB: Proses Verifikasi Administrasi oleh Sarpras
    A->>UI: Buka Menu Persetujuan Peminjaman
    UI->>DB: getBookings()
    DB-->>UI: Data Seluruh Pengajuan
    UI-->>A: Tampilkan Daftar Pengajuan (Menunggu Persetujuan)
    
    alt Admin Menolak Pengajuan
        A->>UI: Klik Tolak & Input Alasan Penolakan
        UI->>DB: updateBookingStatus(id, "rejected", "Alasan")
        DB-->>UI: Perbarui Data Booking di LocalStorage
        UI-->>A: Refresh Halaman & Perbarui Statistik Dashboard
    else Admin Menyetujui Pengajuan
        A->>UI: Klik Setuju
        UI->>DB: updateBookingStatus(id, "approved")
        DB-->>UI: Perbarui Data Booking di LocalStorage
        UI-->>A: Refresh Halaman & Perbarui Statistik Dashboard
    end
    
    note over M, UI: Pemohon memeriksa hasil approval
    M->>UI: Buka Menu Riwayat Peminjaman
    UI->>DB: getBookings()
    DB-->>UI: Data Booking Terkini
    UI-->>M: Tampilkan Status "DISETUJUI" & Tombol Cetak Slip
    M->>UI: Klik Tombol Cetak Slip
    UI-->>M: Tampilkan Slip Preview Modal & Buka Dialog Cetak PDF Browser
```

---

## 6. Communication Diagram

```mermaid
graph LR
    M[":Mahasiswa"] -- "1: submitBooking()<br/>8: getApprovedStatus()" --> UI[":FrontendUI"]
    UI -- "2: checkConflict()<br/>3: saveBooking()<br/>6: updateStatus()" --> DB[":RoomBookingDatabase"]
    A[":AdminSarpras"] -- "4: getPendingBookings()<br/>5: setBookingApproved()" --> UI
```
