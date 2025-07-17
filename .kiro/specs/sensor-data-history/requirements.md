# Requirements Document

## Introduction

Modul riwayat data sensor menyediakan antarmuka komprehensif untuk pengguna melihat dan menganalisis data historis sensor dari perangkat IoT akuarium mereka. Fitur ini memungkinkan pengguna untuk memilih perangkat, melihat data sensor dalam format tabel yang dapat difilter, menggunakan rentang tanggal untuk analisis periode tertentu, dan menerima pembaruan real-time. Modul ini terintegrasi dengan API backend yang ada dan mempertahankan konsistensi dengan pola desain dashboard saat ini.

## Requirements

### Requirement 1

**User Story:** Sebagai pemilik akuarium, saya ingin memilih perangkat dari dropdown, sehingga saya dapat melihat data historis sensor dari perangkat tertentu.

#### Acceptance Criteria

1. WHEN pengguna membuka halaman riwayat sensor THEN sistem SHALL menampilkan dropdown pemilihan perangkat
2. WHEN dropdown dibuka THEN sistem SHALL menampilkan semua perangkat yang dapat diakses pengguna saat ini
3. WHEN pengguna memilih perangkat THEN sistem SHALL mengambil data historis sensor untuk perangkat tersebut
4. WHEN perangkat dipilih THEN sistem SHALL menampilkan nama perangkat dan device_id yang dipilih
5. WHEN tidak ada perangkat yang dipilih THEN sistem SHALL menampilkan pesan untuk memilih perangkat
6. WHEN perangkat berubah THEN sistem SHALL memperbarui semua tabel dengan data perangkat baru

### Requirement 2

**User Story:** Sebagai pemilik akuarium, saya ingin melihat data sensor dalam tabel terpisah untuk pH, TDS, DO, dan suhu, sehingga saya dapat menganalisis setiap parameter dengan mudah.

#### Acceptance Criteria

1. WHEN data sensor dimuat THEN sistem SHALL menampilkan empat tabel terpisah untuk pH, TDS, DO Level, dan Temperature
2. WHEN menampilkan tabel pH THEN sistem SHALL menyediakan kolom untuk raw, voltage, calibrated, dan status
3. WHEN menampilkan tabel TDS THEN sistem SHALL menyediakan kolom untuk raw, voltage, calibrated, dan status
4. WHEN menampilkan tabel DO Level THEN sistem SHALL menyediakan kolom untuk raw, voltage, calibrated, dan status
5. WHEN menampilkan tabel Temperature THEN sistem SHALL hanya menampilkan kolom value dan status
6. WHEN menampilkan semua tabel THEN sistem SHALL menyertakan kolom timestamp dan waktu
7. WHEN data tidak tersedia THEN sistem SHALL menampilkan pesan "Tidak ada data" dalam bahasa Indonesia

### Requirement 3

**User Story:** Sebagai pemilik akuarium, saya ingin memfilter data berdasarkan jenis nilai (raw, voltage, calibrated), sehingga saya dapat fokus pada data yang relevan.

#### Acceptance Criteria

1. WHEN tabel pH, TDS, atau DO ditampilkan THEN sistem SHALL menyediakan dropdown filter untuk memilih raw, voltage, atau calibrated
2. WHEN filter dipilih THEN sistem SHALL hanya menampilkan kolom yang dipilih beserta timestamp dan status
3. WHEN filter berubah THEN sistem SHALL memperbarui tampilan tabel secara real-time
4. WHEN tabel Temperature ditampilkan THEN sistem SHALL tidak menampilkan filter karena hanya ada kolom value
5. WHEN filter diterapkan THEN sistem SHALL mempertahankan pengaturan filter saat pagination atau pencarian
6. WHEN halaman dimuat ulang THEN sistem SHALL mengingat pengaturan filter terakhir

### Requirement 4

**User Story:** Sebagai pemilik akuarium, saya ingin menggunakan date range picker untuk memfilter data berdasarkan periode waktu, sehingga saya dapat menganalisis tren dalam rentang waktu tertentu.

#### Acceptance Criteria

1. WHEN halaman dimuat THEN sistem SHALL menampilkan date range picker menggunakan komponen shadcn
2. WHEN pengguna memilih rentang tanggal THEN sistem SHALL memperbarui semua tabel dengan data dalam rentang tersebut
3. WHEN rentang tanggal tidak dipilih THEN sistem SHALL menampilkan data 7 hari terakhir sebagai default
4. WHEN rentang tanggal dipilih THEN sistem SHALL menggunakan format ISO 8601 untuk API call
5. WHEN rentang tanggal tidak valid THEN sistem SHALL menampilkan pesan error dalam bahasa Indonesia
6. WHEN data dimuat THEN sistem SHALL menampilkan rentang tanggal yang sedang aktif

### Requirement 5

**User Story:** Sebagai pemilik akuarium, saya ingin mengatur ukuran halaman dan navigasi pagination, sehingga saya dapat mengontrol jumlah data yang ditampilkan.

#### Acceptance Criteria

1. WHEN tabel ditampilkan THEN sistem SHALL menyediakan dropdown untuk memilih ukuran halaman (10, 25, 50, 100)
2. WHEN ukuran halaman berubah THEN sistem SHALL memperbarui tabel dan reset ke halaman pertama
3. WHEN ada lebih banyak data THEN sistem SHALL menampilkan kontrol pagination di bawah setiap tabel
4. WHEN pengguna navigasi pagination THEN sistem SHALL memuat data halaman yang sesuai
5. WHEN pagination digunakan THEN sistem SHALL menampilkan informasi "Menampilkan X dari Y total data"
6. WHEN tidak ada data THEN sistem SHALL menyembunyikan kontrol pagination

### Requirement 6

**User Story:** Sebagai pemilik akuarium, saya ingin menerima pembaruan data real-time, sehingga saya dapat melihat data sensor terbaru tanpa perlu refresh manual.

#### Acceptance Criteria

1. WHEN halaman terbuka THEN sistem SHALL mengatur polling otomatis setiap 30 detik untuk data terbaru
2. WHEN data baru tersedia THEN sistem SHALL memperbarui tabel secara otomatis
3. WHEN pembaruan real-time aktif THEN sistem SHALL menampilkan indikator status koneksi
4. WHEN koneksi terputus THEN sistem SHALL menampilkan peringatan dan mencoba reconnect
5. WHEN pengguna tidak aktif THEN sistem SHALL mengurangi frekuensi polling untuk menghemat bandwidth
6. WHEN halaman ditutup THEN sistem SHALL membersihkan semua timer dan koneksi

### Requirement 7

**User Story:** Sebagai pemilik akuarium, saya ingin antarmuka yang user-centered dengan UI/UX yang baik, sehingga saya dapat menggunakan aplikasi dengan mudah dan nyaman.

#### Acceptance Criteria

1. WHEN halaman dimuat THEN sistem SHALL menggunakan ikon yang relevan untuk setiap jenis sensor
2. WHEN menampilkan status sensor THEN sistem SHALL menggunakan indikator warna (hijau untuk GOOD, merah untuk BAD)
3. WHEN data dimuat THEN sistem SHALL menampilkan loading state yang informatif
4. WHEN terjadi error THEN sistem SHALL menampilkan pesan error yang jelas dalam bahasa Indonesia
5. WHEN antarmuka ditampilkan THEN sistem SHALL responsif dan dapat digunakan di perangkat mobile
6. WHEN pengguna berinteraksi THEN sistem SHALL memberikan feedback visual yang jelas
7. WHEN tabel kosong THEN sistem SHALL menampilkan ilustrasi atau pesan yang ramah pengguna

### Requirement 8

**User Story:** Sebagai developer, saya ingin kode sensor data history mengikuti prinsip separation of concerns, sehingga codebase mudah dipelihara dan dapat ditest.

#### Acceptance Criteria

1. WHEN mengimplementasikan fitur THEN sistem SHALL memisahkan API calls ke dalam file service yang dedicated
2. WHEN mendefinisikan struktur data THEN sistem SHALL menggunakan TypeScript interfaces dalam file type yang dedicated
3. WHEN membuat komponen UI THEN sistem SHALL memisahkan presentation logic dari business logic
4. WHEN menangani state management THEN sistem SHALL menggunakan TanStack Query untuk data fetching dan caching
5. WHEN mengorganisir file THEN sistem SHALL mengikuti struktur folder feature yang sudah ada
6. WHEN mengimplementasikan error handling THEN sistem SHALL menggunakan pola error handling yang konsisten