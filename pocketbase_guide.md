# Panduan Instalasi PocketBase (Database)

Aplikasi ini menggunakan **PocketBase** sebagai backend. Ikuti langkah-langkah di bawah ini untuk menyiapkan database sebelum menjalankan aplikasi Next.js.

## 1. Persiapan PocketBase
1.  Unduh [PocketBase](https://pocketbase.io/docs/) sesuai sistem operasi Anda (Mac, Windows, Linux).
2.  Letakkan file executable `pocketbase` di folder proyek atau folder khusus.
3.  Jalankan server melalui terminal:
    ```bash
    ./pocketbase serve
    ```
4.  Buka Admin Panel di browser: [http://127.0.0.1:8090/_/](http://127.0.0.1:8090/_/)
5.  Buat akun admin pertama Anda.

## 2. Struktur Koleksi (Collections)

Harap buat dua koleksi (Base Collection) dengan nama dan field berikut di Admin Panel:

### A. Koleksi `barang` (Data Inventaris)
Gunakan koleksi ini untuk menyimpan data aset fisik sekolah.

| Nama Field | Tipe | Keterangan |
| :--- | :--- | :--- |
| `kode_barang` | Plain text | Kode unit unik (Generated otomatis) |
| `nama_barang` | Plain text | Nama aset |
| `tanggal_perolehan` | Date | Tanggal barang masuk/dibuat |
| `harga` | Number | Harga perolehan aset |
| `lokasi` | Plain text | Lokasi fisik barang (misal: R. Kelas 1) |
| `kondisi` | Select | Option: `baik`, `rusak ringan`, `rusak berat` |
| `status` | Plain text | Status aktif/non-aktif |
| `sumber_dana` | Plain text | Asal dana (misal: BOS, ARKAS) |
| `tahun_anggaran` | Plain text | Tahun dana tersebut |
| `penanggung_jawab` | Plain text | Nama guru/staf penanggung jawab |
| `merk` | Plain text | Merk atau Brand barang |
| `spesifikasi` | Plain text | Deskripsi detail teknis |
| `qr_link` | URL / Text | Link ke QR Code/Barcode |
| `keterangan` | Plain text | Catatan tambahan |

### B. Koleksi `arkas` (Data Anggaran)
Gunakan koleksi ini untuk data transaksi belanja sekolah.

| Nama Field | Tipe | Keterangan |
| :--- | :--- | :--- |
| `tanggal` | Date | Tanggal transaksi / nota |
| `kode_kegiatan` | Plain text | Kode program kegiatan |
| `kode_rekening` | Plain text | Kode rekening belanja |
| `no_bukti` | Plain text | Nomor kuitansi / bukti pembayaran |
| `id_barang` | Plain text | ID referensi barang di ARKAS |
| `uraian` | Plain text | Deskripsi belanja |
| `jumlah_barang` | Number | Kuantitas unit yang dibeli |
| `harga_satuan` | Number | Harga per unit |
| `realisasi` | Number | Total Biaya (Jumlah x Harga) |
| `status_generate` | Bool | Penanda apakah sudah masuk ke inventaris |

## 3. Pengaturan Hak Akses (API Rules)
Agar aplikasi dapat membaca dan menulis data tanpa login yang rumit (untuk testing lokal), buka tab **API Rules** pada masing-masing koleksi dan atur menjadi **Public** (kosongkan isian rule atau set ke `All Users` / `Admin Only` sesuai kebutuhan produksi):

*   **List/Search Action**: `(kosong)` (Public)
*   **View Action**: `(kosong)` (Public)
*   **Create Action**: `(kosong)` (Public)
*   **Update Action**: `(kosong)` (Public)
*   **Delete Action**: `(kosong)` (Public)

---
**Tip**: Setelah koleksi di atas siap, Anda bisa mulai menggunakan fitur **Import CSV/Excel** pada menu ARKAS untuk mengisi data awal!
