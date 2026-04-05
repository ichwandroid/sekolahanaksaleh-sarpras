# Dashboard Sarpras SD Anak Saleh

Aplikasi Manajemen Sarana dan Prasarana (Sarpras) untuk SD Anak Saleh Malang, dirancang untuk mengintegrasikan data anggaran sekolah (ARKAS) dengan pengelolaan inventaris fisik secara otomatis dan efisien.

## 🚀 Fitur Utama

### 📊 Manajemen ARKAS (Anggaran Realisasi)
- **Import Data**: Mendukung unggahan data anggaran dari file CSV/Excel dengan pratinjau sebelum disimpan.
- **Kalkulasi Otomatis**: Menghitung realisasi dana secara real-time berdasarkan jumlah unit dan harga satuan.
- **Status Pelacakan**: Mengetahui item anggaran mana yang sudah diproses menjadi barang inventaris.

### 📦 Pengelolaan Inventaris Pintar
- **Smart Generation**: Membuat data inventaris otomatis dari nota belanja ARKAS dengan satu klik.
- **Format Kode Unit**: Penomoran aset otomatis dengan format cerdas `[TAHUN]-[ABBR]-[NOBUKTI]/[ANGGARAN]-[URUT]`.
- **Barcode Labelling**: Generasi Barcode (Code 128) dinamis untuk setiap item barang guna memudahkan pelabelan fisik.
- **Reporting**: Ekspor seluruh daftar inventaris ke format Excel (.xlsx) untuk kebutuhan audit dan pelaporan bulanan.

### 🎨 User Experience (UX)
- **Modern UI**: Menggunakan Next.js 16, Tailwind CSS, dan Shadcn UI untuk antarmuka yang bersih dan responsif.
- **Dark/Light Mode**: Mendukung tema gelap dan terang untuk kenyamanan operasional.
- **Integrasi Backend**: Menggunakan PocketBase sebagai database realtime yang ringan dan cepat.

## 🛠️ Persyaratan Sistem

- **Node.js**: Versi 18 atau lebih tinggi.
- **PocketBase**: Server database aktif dengan koleksi `barang` dan `arkas`.

## 📦 Instalasi & Menjalankan

1. Clone repositori ini.
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Jalankan server pengembangan:
   ```bash
   npm run dev
   ```
4. Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 📝 Konfigurasi Database (PocketBase)

Pastikan koleksi berikut tersedia di PocketBase Anda:
- **barang**: Untuk menyimpan data inventaris (Kode Barang, Nama, Lokasi, Harga, dll).
- **arkas**: Untuk menyimpan data anggaran (Tanggal, Uraian, Jumlah, Harga Satuan, status_generate, dll).

---
© 2026 Sarpras SD Anak Saleh - Built with ❤️ for Education.
