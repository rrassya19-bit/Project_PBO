# SIPERU UMY - Sistem Informasi Peminjaman Ruangan Terintegrasi Universitas Muhammadiyah Yogyakarta

**SIPERU UMY** adalah platform web Single Page Application (SPA) modern yang dirancang untuk mendigitalkan, mempercepat, dan memberikan transparansi penuh pada proses birokrasi pengajuan izin peminjaman ruangan di lingkungan kampus terpadu **Universitas Muhammadiyah Yogyakarta (UMY)**.

---

## 🎨 Keunggulan Desain & Visual (Premium UX)
- **Identitas Brand UMY**: Desain antarmuka dirancang dengan dominasi warna khas UMY, yaitu **Hijau UMY (#0F6B40)** dan **Emas UMY (#E2A926)** untuk menjaga keselarasan identitas almamater.
- **Glassmorphic Aesthetic**: Penerapan efek kartu kaca (*glassmorphic card*) transparan modern dengan blur latar belakang (*backdrop-filter*) dan bayangan lembut (*soft shadows*).
- **Responsive Layout**: Antarmuka adaptif yang sangat rapi saat diakses melalui ponsel cerdas (mobile-first layout), tablet, maupun PC desktop.
- **Micro-Animations & Transitions**: Transisi navigasi antar halaman, melayangnya tombol/elemen (*floating elements*), serta interaksi hover didesain halus guna meningkatkan kenyamanan pengalaman pengguna.

---

## ⚙️ Fitur Utama & Mekanisme Kerja
1. **Single Page Application (SPA) Router**: Seluruh perpindahan halaman berjalan secara dinamis tanpa memicu pemuatan ulang halaman (*no-reload*), memberikan performa responsif layaknya aplikasi mobile native.
2. **Local Storage Database Persistence**: Menggunakan `localStorage` sebagai media penyimpanan state database lokal klien secara persisten. Data akun pengguna, ketersediaan ruangan, riwayat peminjaman, serta status persetujuan tetap aman tersimpan meskipun browser ditutup.
3. **Mekanisme Anti Double-Booking (Conflict Validation)**: Algoritma validasi yang mencegah peminjaman ganda pada ruangan, tanggal, dan sesi waktu yang sama. Jika ada bentrok jadwal, sistem otomatis memunculkan toast notifikasi penolakan instan.
4. **Validasi Kapasitas Ruang**: Sistem otomatis memeriksa kesesuaian estimasi jumlah peserta dengan kapasitas maksimal daya tampung ruangan untuk menghindari pemesanan yang melebihi kapasitas fisik ruangan.
5. **Interactive Admin Analytics (Chart.js)**: Menyajikan data statistik peminjaman dalam bentuk grafik interaktif secara realtime (grafik kepadatan pemesanan per gedung dan grafik donat proporsi status).
6. **Manajemen Ruangan (CRUD)**: Staf Sarpras (Admin) dapat mengelola ketersediaan ruangan (Tambah, Ubah Status/Maintenance, Edit, Hapus).
7. **Slip Izin Print-Ready**: Slip digital perizinan yang diformat dengan CSS `@media print` agar layout menjadi super bersih, menghilangkan navbar/sidebar browser, serta menyertakan **QR Code verifikasi** dan tanda tangan digital kepala Biro Aset.

---

## 🛠️ Cara Menjalankan Project Secara Lokal

Aplikasi ini adalah static site, namun untuk memastikan fitur **LocalStorage**, dynamic routing, dan pemuatan CDN eksternal (Chart.js & Lucide Icons) berjalan dengan aman tanpa kendala kebijakan keamanan CORS browser (`file://`), **sangat direkomendasikan** untuk dijalankan menggunakan local server:

### Opsi 1: Menggunakan Python (Direkomendasikan & Paling Mudah)
Jika Anda memiliki Python terinstal di komputer Anda, jalankan perintah ini di dalam direktori project:
```bash
python -m http.server 8000
```
Setelah itu, buka browser Anda dan akses:
👉 **[http://localhost:8000](http://localhost:8000)**

### Opsi 2: Menggunakan Node.js (`http-server`)
Jika Anda menggunakan Node.js, Anda bisa menjalankan server statik dengan perintah:
```bash
npx http-server -p 8000
```
Setelah itu, buka browser Anda dan akses:
👉 **[http://localhost:8000](http://localhost:8000)**

### Opsi 3: Membuka Langsung `index.html` (Tanpa Server)
Anda bisa langsung melakukan klik ganda (double-click) pada file `index.html` untuk membukanya di browser. Namun, pastikan browser Anda mengizinkan fitur `localStorage` untuk berjalan pada protokol `file://`.

---

## 🔑 Akun Uji Coba (Quick Fill)
Untuk mempermudah pengujian, terdapat tombol **Quick Fill** di menu Login untuk mengisi kredensial secara otomatis:

| Role | Username | Password | Deskripsi / Organisasi |
| :--- | :--- | :--- | :--- |
| **Mahasiswa** | `mhs` | `mhs` | BEM Fakultas Teknik UMY |
| **Dosen** | `dosen` | `dosen` | Prodi Teknologi Informasi UMY |
| **Admin Sarpras** | `admin` | `admin` | Biro Aset & Sarpras UMY |

---

## 📂 Struktur Direktori Project
```
umy-room-booking/
├── assets/                     # Gambar dan aset photorealistic ruangan (PNG)
│   ├── umy_campus_hero.png
│   ├── amphitheater.png
│   ├── ruang_sidang.png
│   ├── sportorium.png
│   ├── ruang_seminar.png
│   ├── lab_komputer.png
│   └── meeting_room.png
├── index.html                  # Struktur utama aplikasi (SPA Shell & Modals)
├── style.css                   # Desain antarmuka premium (Responsif & Cetak)
├── app.js                      # Router, controller, dan logika validasi booking
├── mockData.js                 # Seeding awal dan wrapper database LocalStorage
├── uml_diagrams.md             # Kode Mermaid.js untuk diagram UML lengkap
└── README.md                   # Panduan instalasi dan penggunaan
```

---

## 📊 Dokumentasi Diagram UML
Seluruh file diagram UML (Use Case, Activity, Class, Sequence, dan Communication Diagram) ditulis menggunakan format diagram modern **Mermaid.js**. Kode diagram tersebut dapat dilihat dan dibaca pada file:
👉 **`uml_diagrams.md`**
