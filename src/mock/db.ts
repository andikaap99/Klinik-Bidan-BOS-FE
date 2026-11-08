export const db: any = {
  users: [
    { id: 'u-bidan', username: 'bidan1', nama_lengkap: 'Bidan Rina', nomor_wa: '081234567890', role: 'bidan', password: 'bidan123', created_at: '2026-11-01T08:00:00+07:00' },
    { id: 'u-admin', username: 'admin', nama_lengkap: 'Admin', nomor_wa: '081234567890', role: 'admin', password: 'admin123', created_at: '2026-11-01T08:00:00+07:00' },
    { id: 'u-pasien', username: 'siti95', nama_lengkap: 'Siti Aminah', nomor_wa: '081234567890', role: 'pasien', password: 'rahasia123', created_at: '2026-11-01T08:00:00+07:00' },
  ],
  patients: [
    { id: 'p1', account_id: 'u-pasien', no_rm: 'RM-000001', nik: '3174012345678901', nama_lengkap: 'Siti Aminah', tanggal_lahir: '1995-04-12', jenis_kelamin: 'P', nama_penanggung_jawab: 'Budi Santoso', nomor_wa: '081234567890', alamat: 'Jl. Melati No. 5, Jakarta' },
  ],
  services: [
    { id: 1, kode: 'IBU_HAMIL', nama: 'Pemeriksaan Ibu Hamil', avg_duration_minutes: 30 },
    { id: 2, kode: 'IMUNISASI', nama: 'Imunisasi', avg_duration_minutes: 15 },
    { id: 3, kode: 'KB', nama: 'KB', avg_duration_minutes: 15 },
    { id: 4, kode: 'PIJAT_BAYI', nama: 'Pijat Bayi', avg_duration_minutes: 45 },
    { id: 5, kode: 'USG', nama: 'USG', avg_duration_minutes: 20 },
  ],
  visits: [] as any[],
  records: {} as Record<string, any>,
  queueCounter: {} as Record<string, number>,
}
export const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36)