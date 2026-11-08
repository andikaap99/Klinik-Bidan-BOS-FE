# Kontrak API: DSS Klinik Bersalin (BidanCare)

**Versi:** 1.0 (disepakati tim teknis, 2026-11-07)
**Untuk:** PM / tim produk dan frontend
**Stack backend:** FastAPI + PostgreSQL

Dokumen ini menjelaskan setiap endpoint: siapa yang boleh memakai, data yang dikirim, data yang dikembalikan, dan aturan bisnisnya. Bagian **Hal yang Perlu Keputusan PM** ada di akhir.

---

## 1. Ketentuan Umum

| Hal | Aturan |
|---|---|
| Base URL | `/api/v1` (semua path di bawah ditulis tanpa prefix ini) |
| Autentikasi | Header `Authorization: Bearer <access_token>` dari `/login`. Token punya masa berlaku, **tanpa refresh token**. Setelah kedaluwarsa, pengguna login ulang |
| Role | `pasien`, `bidan`, `admin`. Role diambil dari token, bukan dari data yang dikirim klien |
| Format response | **Selalu JSON object.** Tidak ada array polos dan tidak ada body kosong |
| Format tanggal | `YYYY-MM-DD` (contoh `2026-11-08`) |
| Format waktu | ISO 8601 dengan zona waktu (contoh `2026-11-08T09:45:00+07:00`) |
| Zona waktu | "Hari ini" dihitung dengan zona Asia/Jakarta |
| Nilai `sesi` | `pagi_siang`, `sore_malam` |
| Nilai `status` kunjungan | `antre`, `diperiksa`, `selesai`, `batal` |
| Nilai `jenis_kelamin` | `L`, `P` |
| Penghapusan | **Tidak ada endpoint DELETE.** Akun, pasien, dan rekam medis permanen |

### Response list (paginasi)

Semua endpoint list memakai bentuk berikut. Parameter `limit` (default 20, maksimal 100) dan `offset` (default 0).

```json
{ "items": [ ... ], "total": 42, "limit": 20, "offset": 0 }
```

### Response aksi tanpa data

```json
{ "message": "Password berhasil diubah" }
```

### Response error

```json
{ "code": "VISIT_DUPLICATE", "message": "Pasien sudah terdaftar pada layanan ini di tanggal tersebut" }
```

| HTTP | Arti |
|---|---|
| 401 | Belum login atau token kedaluwarsa |
| 403 | Role tidak diizinkan |
| 404 | Data tidak ada **atau milik orang lain** (sengaja sama, agar data orang lain tidak bisa dicek) |
| 409 | Konflik aturan bisnis (duplikat, status tidak valid, sudah ada) |
| 422 | Isi request tidak valid |

Kode error yang diusulkan: `USERNAME_TAKEN`, `INVALID_CREDENTIALS`, `TOKEN_EXPIRED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `PATIENT_EXISTS`, `CLAIM_FAILED`, `VISIT_DUPLICATE`, `INVALID_STATUS_TRANSITION`, `VISIT_NOT_CANCELLABLE`, `RECORD_EXISTS`, `VISIT_NOT_EXAMINABLE`, `MERGE_CONFLICT`.

### Matriks akses ringkas

| Area | pasien | bidan | admin |
|---|---|---|---|
| Register / login / akun sendiri | Ya | Ya (login, akun sendiri) | Ya (login, akun sendiri) |
| Kelola profil pasien | Ya (miliknya) | Hanya baca | - |
| Daftar kunjungan | Ya (miliknya) | **Tidak** | - |
| Batalkan kunjungan | Ya (saat `antre`) | Ya (saat `antre`/`diperiksa`) | - |
| Antrian aktif, ubah status | Tidak | Ya | - |
| Isi rekam medis | Tidak | Ya (sekali simpan) | - |
| Lihat rekam medis / riwayat | Terbatas (miliknya) | Penuh | - |
| Prediksi dan analitik | Tidak | Ya | - |
| Kelola akun, reset password, gabung pasien | Tidak | Tidak | Ya (endpoint ada, role belum diimplementasikan) |

---

## 2. Bentuk Objek yang Dipakai Bersama

**Pasien (lengkap)**
```json
{
  "id": "3f2c9a52-...-uuid",
  "no_rm": "RM-000001",
  "nik": "3174012345678901",
  "nama_lengkap": "Siti Aminah",
  "tanggal_lahir": "1995-04-12",
  "jenis_kelamin": "P",
  "nama_penanggung_jawab": "Budi Santoso",
  "nomor_wa": "081234567890",
  "alamat": "Jl. Melati No. 5, Jakarta"
}
```

**Pasien (ringkas)**
```json
{ "id": "uuid", "no_rm": "RM-000001", "nama_lengkap": "Siti Aminah" }
```

**Layanan**
```json
{ "id": 1, "kode": "IBU_HAMIL", "nama": "Pemeriksaan Ibu Hamil" }
```

**Kunjungan (ringkas)**
```json
{
  "id": "uuid",
  "patient": { "id": "uuid", "no_rm": "RM-000001", "nama_lengkap": "Siti Aminah" },
  "service": { "id": 1, "nama": "Pemeriksaan Ibu Hamil" },
  "visit_date": "2026-11-08",
  "sesi": "pagi_siang",
  "queue_number": 3,
  "status": "antre"
}
```

**Kunjungan (detail)** = Kunjungan (ringkas) ditambah:
```json
{ "keluhan": "Mual berlebihan", "registered_at": "2026-11-07T20:10:00+07:00", "started_at": null, "finished_at": null }
```

**Akun**
```json
{ "id": "uuid", "username": "siti95", "nama_lengkap": "Siti Aminah", "nomor_wa": "081234567890", "role": "pasien" }
```

---

## 3. Auth dan Akun

### 3.1 Register akun
`POST /register` · Publik

Membuat akun pasien. Hanya data akun. Alamat dan data klinis ada di profil pasien. Ini satu-satunya cara akun pasien dibuat.

Request:
```json
{ "nama_lengkap": "Siti Aminah", "nomor_wa": "081234567890", "username": "siti95", "password": "rahasia123" }
```
Response 201:
```json
{ "id": "uuid", "username": "siti95", "nama_lengkap": "Siti Aminah", "role": "pasien" }
```
Aturan: username 3 sampai 50 karakter dan unik (tidak peka huruf besar/kecil). `nomor_wa` berformat Indonesia (`08...`, `62...`, `+62...`). Error: 409 `USERNAME_TAKEN`, 422.

### 3.2 Login
`POST /login` · Publik

Request:
```json
{ "username": "siti95", "password": "rahasia123" }
```
Response 200:
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": { "id": "uuid", "username": "siti95", "nama_lengkap": "Siti Aminah", "role": "pasien" }
}
```
Error: 401 `INVALID_CREDENTIALS`. Pesan error tidak membedakan username salah atau password salah.

### 3.3 Lihat akun sendiri
`GET /me` · Semua role. Response 200: objek Akun.

### 3.4 Ubah akun sendiri
`PATCH /me` · Semua role

Request (semua opsional): `{ "nama_lengkap": "...", "nomor_wa": "..." }`. Response 200: objek Akun. Hanya akun sendiri. Username dan role tidak bisa diubah di sini.

### 3.5 Ganti password sendiri
`POST /me/password` · Semua role

Request: `{ "password_lama": "...", "password_baru": "..." }`. Response 200: `{ "message": "Password berhasil diubah" }`. Error: 403/422 jika password lama salah.

Ini satu-satunya cara pengguna mengganti password. **Bidan tidak bisa mereset password pasien.**

---

## 4. Profil Pasien

Satu akun pasien bisa punya banyak profil pasien (diri sendiri, bayi, dst.). Satu profil pasien hanya dimiliki satu akun.

### 4.1 Daftar pasien milik akun
`GET /patients` · pasien

Parameter: `limit`, `offset`. Response 200:
```json
{
  "items": [
    { "id": "uuid", "no_rm": "RM-000001", "nama_lengkap": "Siti Aminah", "tanggal_lahir": "1995-04-12", "jenis_kelamin": "P", "nama_penanggung_jawab": "Budi Santoso" }
  ],
  "total": 1, "limit": 20, "offset": 0
}
```

### 4.2 Tambah pasien
`POST /patients` · pasien

Request:
```json
{
  "nik": "3174012345678901",
  "nama_lengkap": "Siti Aminah",
  "tanggal_lahir": "1995-04-12",
  "jenis_kelamin": "P",
  "nama_penanggung_jawab": "Budi Santoso",
  "nomor_wa": "081234567890",
  "alamat": "Jl. Melati No. 5, Jakarta"
}
```
Wajib: `nama_lengkap`, `tanggal_lahir`, `jenis_kelamin`. Lainnya opsional. NIK (jika ada) 16 digit angka.

Response 201: objek Pasien (lengkap), termasuk `no_rm` yang dibuat otomatis.

Aturan:
- Backend **mencari dulu** sebelum membuat baru: NIK untuk dewasa, kombinasi nama + tanggal lahir + penanggung jawab untuk bayi.
- Jika ditemukan, response 409 `PATIENT_EXISTS` dengan pesan umum ("Data sudah terdaftar, hubungi klinik"). Sistem **tidak** memberi tahu siapa pemiliknya.
- Rekomendasi UI: NIK wajib untuk dewasa, opsional untuk bayi (basis data sengaja longgar).

### 4.3 Klaim pasien yang sudah ada
`POST /patients/claim` · pasien

Request: `{ "nik": "3174012345678901", "tanggal_lahir": "1995-04-12" }`. Response 200: objek Pasien. Verifikasi: NIK + tanggal lahir harus cocok. Jika gagal atau pasien sudah dimiliki akun lain: 409 `CLAIM_FAILED` dengan pesan umum.

> Catatan: karena walk-in dihapus, pasien tanpa akun hampir tidak ada. Endpoint ini dipertahankan sementara (lihat bagian 12, butir 7).

### 4.4 Detail pasien
`GET /patients/{id}` · pasien (pemilik), bidan (hanya baca)

Response 200: objek Pasien (lengkap). Pasien yang bukan pemilik: 404.

### 4.5 Ubah profil pasien
`PATCH /patients/{id}` · pasien (pemilik)

Request (semua opsional): `nama_lengkap`, `tanggal_lahir`, `jenis_kelamin`, `nama_penanggung_jawab`, `nomor_wa`, `alamat`. Response 200: objek Pasien.

Aturan: **NIK tidak bisa diubah** lewat endpoint ini. **Bidan tidak bisa mengubah profil pasien** (403). Konsekuensi: salah ketik NIK hanya bisa dibantu tim dev.

---

## 5. Layanan

### 5.1 Daftar layanan
`GET /services` · semua yang login

Response 200:
```json
{
  "items": [
    { "id": 1, "kode": "IBU_HAMIL", "nama": "Pemeriksaan Ibu Hamil" },
    { "id": 2, "kode": "IMUNISASI", "nama": "Imunisasi" }
  ],
  "total": 5, "limit": 20, "offset": 0
}
```
Untuk bidan, tiap item ditambah `avg_duration_minutes` (durasi untuk estimasi antrian). Layanan awal: Ibu Hamil, Imunisasi, KB, Pijat Bayi, USG. **Tambah dan ubah layanan tidak tersedia saat ini** (pengembangan lanjutan jika role admin berjalan).

---

## 6. Kunjungan dan Antrian

Pendaftaran hanya lewat aplikasi oleh pasien. Bidan tidak bisa mendaftarkan pasien.

### 6.1 Daftar kunjungan (booking)
`POST /visits` · pasien

Request:
```json
{ "patient_id": "uuid", "service_id": 1, "visit_date": "2026-11-08", "sesi": "pagi_siang", "keluhan": "Kontrol kehamilan" }
```
`keluhan` opsional. Response 201:
```json
{
  "id": "uuid",
  "patient_id": "uuid",
  "service": { "id": 1, "nama": "Pemeriksaan Ibu Hamil" },
  "visit_date": "2026-11-08",
  "sesi": "pagi_siang",
  "queue_number": 3,
  "status": "antre"
}
```
Aturan:
- `patient_id` harus milik akun yang login (selain itu 404).
- **Nomor antrian** mengulang dari 1 di setiap kombinasi tanggal + sesi, ditentukan saat tombol kirim ditekan (bukan saat form dibuka).
- Satu pasien tidak bisa mendaftar layanan yang sama dua kali di hari yang sama (409 `VISIT_DUPLICATE`), kecuali yang sebelumnya dibatalkan.
- Nomor antrian dari kunjungan yang dibatalkan **tidak dipakai ulang**, jadi antrian bisa melompat (1, 2, 4).
- Batas tanggal pemesanan **belum ditentukan** (bagian 12).

### 6.2 Daftar kunjungan
`GET /visits` · pasien (miliknya), bidan (semua)

Parameter (semua opsional): `patient_id`, `status`, `visit_date`, `date_from`, `date_to`, `limit`, `offset`. Response 200: `{ "items": [Kunjungan ringkas], "total", "limit", "offset" }`.

### 6.3 Detail kunjungan
`GET /visits/{id}` · pasien (pemilik), bidan. Response 200: Kunjungan (detail).

### 6.4 Nomor antrian dan estimasi tunggu
`GET /estimation?visit_id={id}` · pasien (pemilik), bidan

Response 200:
```json
{
  "visit_id": "uuid",
  "queue_number": 3,
  "sesi": "pagi_siang",
  "status": "antre",
  "antrean_di_depan": 2,
  "estimasi_menit": 45,
  "perkiraan_dipanggil": "2026-11-08T09:45:00+07:00"
}
```
Aturan:
- `estimasi_menit` = jumlah durasi layanan semua antrian di depan pasien (tanggal dan sesi sama, status `antre`/`diperiksa`). Durasi per layanan adalah nilai tetap yang ditentukan klinik, bukan hasil model.
- `perkiraan_dipanggil` = waktu sekarang + `estimasi_menit`.
- Pasien yang sedang diperiksa dihitung penuh durasinya, sehingga estimasi cenderung sedikit lebih panjang.
- Jika kunjungan sudah `selesai` atau `batal`: 404.

### 6.5 Batalkan kunjungan
`POST /visits/{id}/cancel` · pasien (pemilik), bidan

Tanpa body. Response 200: Kunjungan (detail) dengan `"status": "batal"`.

Aturan: pasien hanya bisa membatalkan saat `antre`. Bidan bisa membatalkan saat `antre` atau `diperiksa`. Selain itu 409 `VISIT_NOT_CANCELLABLE`.

### 6.6 Ubah status kunjungan
`PATCH /visits/{id}/status` · bidan

Request: `{ "status": "diperiksa" }` atau `{ "status": "selesai" }`. Response 200: Kunjungan (detail).

Aturan: alur `antre → diperiksa → selesai`. `diperiksa` mengisi `started_at`, `selesai` mengisi `finished_at`. Selain alur ini 409 `INVALID_STATUS_TRANSITION`. Pembatalan lewat `/cancel`.

### 6.7 Antrian aktif
`GET /queue` · bidan

Parameter: `visit_date` (default hari ini), `sesi` (opsional). Response 200:
```json
{
  "visit_date": "2026-11-08",
  "sesi": "pagi_siang",
  "sedang_diperiksa": {
    "visit_id": "uuid", "queue_number": 2,
    "patient": { "id": "uuid", "no_rm": "RM-000004", "nama_lengkap": "Dewi" },
    "service": { "id": 1, "nama": "Pemeriksaan Ibu Hamil" }
  },
  "items": [
    {
      "visit_id": "uuid", "queue_number": 3,
      "patient": { "id": "uuid", "no_rm": "RM-000001", "nama_lengkap": "Siti Aminah" },
      "service": { "id": 2, "nama": "Imunisasi" },
      "status": "antre", "keluhan": "Demam ringan", "estimasi_menit": 30
    }
  ]
}
```
`sedang_diperiksa` bernilai `null` jika tidak ada yang sedang diperiksa.

---

## 7. Rekam Medis dan Riwayat

Rekam medis memakai format SOAP: Subjective, Objective, Assessment, Plan. Bidan mengisinya setelah pemeriksaan.

### 7.1 Riwayat kedatangan
`GET /medical_record` · pasien (miliknya), bidan (semua)

Parameter (opsional): `patient_id`, `date_from`, `date_to`, `limit`, `offset`. Response 200:
```json
{
  "items": [
    {
      "patient": { "id": "uuid", "no_rm": "RM-000001", "nama_lengkap": "Siti Aminah" },
      "records": [
        {
          "visit_id": "uuid",
          "visit_date": "2026-10-20",
          "service": { "id": 1, "nama": "Pemeriksaan Ibu Hamil" },
          "keluhan": "Mual berlebihan",
          "patient_note": "Perbanyak minum dan istirahat",
          "next_control_date": "2026-11-20"
        }
      ]
    }
  ],
  "total": 1, "limit": 20, "offset": 0
}
```
Dikelompokkan per pasien. `patient_note` adalah catatan bidan yang ditampilkan ke pasien ("feedback").

### 7.2 Detail rekam medis satu kunjungan
`GET /visits/{id}/medical_record` · bidan (penuh), pasien pemilik (terbatas)

Response 200 untuk **bidan**:
```json
{
  "visit_id": "uuid",
  "subjective": "Mual sejak 3 hari",
  "objective": { "tekanan_darah": "110/70", "berat_badan": 58, "djj": 140 },
  "assessment": "Hamil 12 minggu, emesis gravidarum",
  "plan": "Edukasi nutrisi, vitamin B6",
  "service_details": { "hpht": "2026-08-01", "usia_kehamilan_minggu": 12 },
  "patient_note": "Perbanyak minum dan istirahat",
  "next_control_date": "2026-11-20",
  "examined_by": "uuid-bidan",
  "created_at": "2026-10-20T10:30:00+07:00"
}
```
Response 200 untuk **pasien** (hanya dua field):
```json
{ "visit_id": "uuid", "patient_note": "Perbanyak minum dan istirahat", "next_control_date": "2026-11-20" }
```
404 jika rekam medis belum dibuat. `objective` dan `service_details` berupa objek fleksibel agar tiap layanan bisa mencatat data berbeda.

### 7.3 Isi rekam medis
`POST /visits/{id}/medical_record` · bidan

Request (semua opsional kecuali bentuk objek):
```json
{
  "subjective": "...",
  "objective": { },
  "assessment": "...",
  "plan": "...",
  "service_details": { },
  "patient_note": "...",
  "next_control_date": "2026-11-20"
}
```
Response 201: sama dengan tampilan bidan di 7.2.

Aturan penting:
- **Hanya bisa disimpan sekali.** Jika rekam medis sudah ada: 409 `RECORD_EXISTS`.
- **Tidak ada edit (tidak ada PUT/PATCH).** Rekam medis yang sudah tersimpan bersifat final. Mekanisme koreksi belum ada (bagian 12).
- Ditolak (409 `VISIT_NOT_EXAMINABLE`) jika kunjungan `batal` atau masih `antre`.
- Bidan pemeriksa (`examined_by`) diambil dari akun yang login.

---

## 8. Prediksi dan Analitik

Semua endpoint di bagian ini hanya untuk **bidan**.

### 8.1 Prediksi kedatangan 7 hari
`GET /predict` · bidan

Parameter: `service_id` (opsional, untuk memfilter satu layanan). Response 200:
```json
{
  "generated_at": "2026-11-07T02:00:00+07:00",
  "data": [
    {
      "target_date": "2026-11-08",
      "total": 12.5,
      "layanan": [
        { "service_id": 1, "kode": "IBU_HAMIL", "nama": "Pemeriksaan Ibu Hamil", "predicted_count": 6.2 },
        { "service_id": 2, "kode": "IMUNISASI", "nama": "Imunisasi", "predicted_count": 3.1 }
      ]
    }
  ]
}
```
Aturan: prediksi per hari per layanan untuk 7 hari ke depan, dihasilkan oleh job terjadwal (bukan dipicu dari aplikasi) dan dilatih ulang berkala (sekitar sebulan sekali atau lebih). Jika job belum pernah berjalan: `{ "generated_at": null, "data": [] }`. `predicted_count` bisa berupa desimal. Prediksi ini hanya untuk kedatangan mingguan, berbeda dari estimasi waktu tunggu.

### 8.2 Ringkasan dashboard
`GET /analytics/summary` · bidan

Parameter: `date_from`, `date_to` (default 30 hari terakhir). Response 200:
```json
{
  "periode": { "dari": "2026-10-08", "sampai": "2026-11-07" },
  "total_kunjungan": 120,
  "selesai": 100,
  "batal": 10,
  "pasien_unik": 80,
  "pasien_baru": 15,
  "rata_kunjungan_per_hari": 4.0
}
```

### 8.3 Tren kunjungan
`GET /analytics/trend` · bidan

Parameter: `date_from`, `date_to`, `interval` (`day`/`week`/`month`), `service_id` (opsional), `sesi` (opsional). Response 200:
```json
{ "interval": "day", "points": [ { "tanggal": "2026-11-01", "total": 5 }, { "tanggal": "2026-11-02", "total": 0 } ] }
```
Hari tanpa kunjungan tetap muncul dengan `total: 0`.

### 8.4 Sebaran kunjungan
`GET /analytics/breakdown` · bidan

Parameter: `date_from`, `date_to`. Response 200:
```json
{
  "per_layanan": [ { "service_id": 1, "nama": "Pemeriksaan Ibu Hamil", "total": 40 } ],
  "per_sesi": [ { "sesi": "pagi_siang", "total": 70 }, { "sesi": "sore_malam", "total": 50 } ],
  "per_hari_minggu": [ { "hari": "senin", "total": 20 } ]
}
```

### 8.5 Insight Explainer
`GET /analytics/insight` · bidan

Parameter: `date_from`, `date_to`, `refresh` (default `false`). Response 200:
```json
{
  "periode": { "dari": "2026-10-08", "sampai": "2026-11-07" },
  "narasi": "Kunjungan meningkat 15% pada minggu ketiga, terutama imunisasi...",
  "generated_at": "2026-11-07T20:00:00+07:00",
  "dari_cache": true
}
```
Aturan: ini satu-satunya fitur yang memakai AI (LLM). Sistem menghitung angka dan grafik dari database, lalu LLM hanya menjelaskannya dalam narasi singkat. **Hanya data agregat yang dikirim ke LLM, tanpa nama, NIK, atau keluhan pasien.** Hasil disimpan sementara (cache) agar tidak memanggil LLM di setiap muat ulang halaman. `refresh=true` memaksa narasi dibuat ulang.

Fitur yang tidak ada: durasi aktual vs rencana (dihapus karena tidak ada sumber data durasi aktual yang andal).

---

## 9. Admin dan Sistem

Endpoint di bagian ini **disediakan**, tetapi role `admin` belum diimplementasikan di aplikasi. Reset password ditujukan untuk tim developer jika lupa password.

### 9.1 Daftar akun
`GET /users` · admin. Parameter: `role`, `q` (cari nama/username), `limit`, `offset`. Response 200:
```json
{
  "items": [ { "id": "uuid", "username": "bidan1", "nama_lengkap": "Bidan Rina", "role": "bidan", "nomor_wa": "081234567890", "created_at": "2026-11-01T08:00:00+07:00" } ],
  "total": 1, "limit": 20, "offset": 0
}
```

### 9.2 Buat akun bidan/admin
`POST /users` · admin

Request: `{ "username": "bidan1", "password": "...", "nama_lengkap": "Bidan Rina", "role": "bidan", "nomor_wa": "081234567890" }`. Response 201: objek akun (seperti item di 9.1). Bidan tidak bisa membuat akun.

### 9.3 Ubah akun
`PATCH /users/{id}` · admin

Request (opsional): `nama_lengkap`, `nomor_wa`, `role`. Response 200: objek akun. Tidak ada field password di sini.

### 9.4 Reset password
`POST /users/{id}/reset-password` · admin

Request: `{ "password_baru": "..." }`. Response 200: `{ "message": "Password berhasil direset" }`. Hanya untuk tim dev. Bidan tidak bisa mereset password.

### 9.5 Gabung pasien duplikat
`POST /patients/{id}/merge` · admin

Request: `{ "survivor_id": "uuid" }` (`id` di path adalah profil duplikat). Response 200:
```json
{ "survivor_id": "uuid", "merged_id": "uuid", "kunjungan_dipindah": 3 }
```
Aturan: semua kunjungan dipindah ke profil utama. Profil duplikat tidak dihapus, no. RM lama tetap bisa dilacak. Jika kedua profil punya kunjungan layanan sama di hari sama: 409 `MERGE_CONFLICT` dan harus diselesaikan manual.

### 9.6 Health check
`GET /health` · Publik. Response 200: `{ "status": "ok", "db": "ok" }`. Untuk pemantauan server.

---

## 10. Aturan Bisnis Ringkas

1. Semua pendaftaran kunjungan lewat aplikasi oleh pasien. **Tidak ada pendaftaran di tempat (walk-in).**
2. Nomor antrian mengulang dari 1 per tanggal + sesi, tidak dipakai ulang saat batal.
3. Satu pasien tidak bisa mendaftar layanan yang sama dua kali di hari yang sama.
4. Estimasi waktu tunggu = penjumlahan durasi layanan antrian di depan (nilai tetap, bukan model).
5. Prediksi kedatangan 7 hari dihasilkan model terjadwal, per hari per layanan.
6. Rekam medis sekali simpan, tidak bisa diedit atau dihapus.
7. Bidan: tidak bisa membuat akun, mengubah akun atau profil pasien, mereset password, atau mendaftarkan pasien.
8. Akun tidak bisa dihapus dan tidak ada status nonaktif.
9. Data yang dikirim ke AI hanya agregat tanpa identitas pasien.

---

## 11. Ringkasan Seluruh Endpoint

| Fitur | Method | Endpoint | Role |
|---|---|---|---|
| Register | POST | `/register` | Publik |
| Login | POST | `/login` | Publik |
| Akun sendiri | GET / PATCH | `/me` | Semua login |
| Ganti password sendiri | POST | `/me/password` | Semua login |
| Daftar pasien | GET | `/patients` | pasien |
| Tambah pasien | POST | `/patients` | pasien |
| Klaim pasien | POST | `/patients/claim` | pasien |
| Detail pasien | GET | `/patients/{id}` | pasien, bidan |
| Ubah pasien | PATCH | `/patients/{id}` | pasien |
| Daftar layanan | GET | `/services` | Semua login |
| Booking kunjungan | POST | `/visits` | pasien |
| Daftar kunjungan | GET | `/visits` | pasien, bidan |
| Detail kunjungan | GET | `/visits/{id}` | pasien, bidan |
| Estimasi antrian | GET | `/estimation` | pasien, bidan |
| Batalkan kunjungan | POST | `/visits/{id}/cancel` | pasien, bidan |
| Ubah status | PATCH | `/visits/{id}/status` | bidan |
| Antrian aktif | GET | `/queue` | bidan |
| Riwayat kedatangan | GET | `/medical_record` | pasien, bidan |
| Detail rekam medis | GET | `/visits/{id}/medical_record` | pasien (terbatas), bidan |
| Isi rekam medis | POST | `/visits/{id}/medical_record` | bidan |
| Prediksi 7 hari | GET | `/predict` | bidan |
| Ringkasan dashboard | GET | `/analytics/summary` | bidan |
| Tren kunjungan | GET | `/analytics/trend` | bidan |
| Sebaran kunjungan | GET | `/analytics/breakdown` | bidan |
| Insight Explainer | GET | `/analytics/insight` | bidan |
| Daftar akun | GET | `/users` | admin |
| Buat akun | POST | `/users` | admin |
| Ubah akun | PATCH | `/users/{id}` | admin |
| Reset password | POST | `/users/{id}/reset-password` | admin |
| Gabung pasien | POST | `/patients/{id}/merge` | admin |
| Health check | GET | `/health` | Publik |

---

## 12. Hal yang Perlu Keputusan PM

| # | Topik | Penjelasan |
|---|---|---|
| 1 | **Pasien tanpa reservasi** | Dengan walk-in dihapus, pasien yang datang tanpa booking atau tanpa HP/akun tidak bisa diperiksa dan tidak tercatat di sistem. Mohon konfirmasi ini bisa diterima klinik |
| 2 | **Jendela pemesanan** | Berapa hari ke depan pasien boleh memesan, dan apakah tanggal lampau ditolak. Usulan awal: hari ini sampai 14 hari ke depan |
| 3 | **Pasien lupa password** | Tidak ada kanal WhatsApp/email. Pengguna yang lupa password hanya bisa dibantu tim dev lewat reset admin. Perlu solusi operasional |
| 4 | **Koreksi rekam medis** | Rekam medis tidak bisa diedit. Apakah perlu mekanisme koreksi (misalnya catatan tambahan/addendum) nanti? |
| 5 | **Salah ketik data pasien** | Bidan tidak bisa mengubah profil, dan NIK tidak bisa diubah pasien. Koreksi hanya lewat tim dev. Apakah ini bisa diterima? |
| 6 | **Persalinan** | Belum jadi layanan khusus. Usulan: layanan biasa dengan durasi besar, dikeluarkan dari data prediksi |
| 7 | **Endpoint klaim pasien** | Hampir tidak terpakai tanpa walk-in. Dipertahankan atau dihapus? |
| 8 | **Hari tutup / bidan absen** | Perlu pencatatan agar hari tutup tidak dianggap hari sepi dan pendaftaran di hari tutup bisa diblokir |
| 9 | **Jam sesi** | Jam pasti `pagi_siang` dan `sore_malam`, dan apakah nomor antrian benar-benar mengulang per sesi |
| 10 | **Bidan paralel** | Apakah beberapa bidan melayani bersamaan? Jika ya, rumus estimasi tunggu perlu disesuaikan |
| 11 | **Durasi layanan** | Nilai durasi per layanan masih placeholder (Ibu Hamil 30, Imunisasi 15, KB 15, Pijat Bayi 45, USG 20 menit). Mohon nilai sebenarnya dari klinik |
