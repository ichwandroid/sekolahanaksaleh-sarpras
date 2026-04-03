import PocketBase from 'pocketbase';

// URL PocketBase, default diarahkan ke localhost port 8090 (port standar bawaan PocketBase)
const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

// Buat instance PocketBase tunggal
const pb = new PocketBase(POCKETBASE_URL);

// Konfigurasi opsional: Nonaktifkan pembatalan otomatis untuk permintaan ganda yang terjadi secara cepat
pb.autoCancellation(false);

export default pb;
