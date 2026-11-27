<template>
  <div class="space-y-6">
    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-[#14234B]">Ny. Siti Rahmawati</h1>
        <p class="text-xs text-slate-500 flex items-center gap-2">
          <router-link to="/bidan/antrean" class="text-xs font-medium text-slate-500 hover:text-[#14234B] inline-flex items-center gap-1">
            <ArrowLeft class="w-3.5 h-3.5" /> Kembali ke Daftar Antrean
          </router-link>
          · Data lengkap pemeriksaan pasien
        </p>
      </div>
      <span class="bg-rose-100/80 text-[#6B1D2F] text-xs font-semibold px-3.5 py-1.5 rounded-lg inline-flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-[#6B1D2F]"></span> Hari ini, 24 Okt 2024
      </span>
    </div>

    <!-- Data Pasien -->
    <div class="bg-white rounded-xl border border-slate-200/80 p-6 mb-5">
      <div class="flex items-center gap-2 mb-4">
        <User class="w-4 h-4 text-blue-600" />
        <h2 class="text-sm font-bold text-[#14234B]">Data Pasien</h2>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div v-for="item in patientData" :key="item.label" class="bg-[#F4F7FC] rounded-lg p-3">
          <p class="text-[10px] font-normal uppercase tracking-wider text-slate-400 mb-1">{{ item.label }}</p>
          <div class="flex items-center gap-1.5">
            <component :is="item.icon" class="w-3.5 h-3.5 text-slate-400" />
            <p class="text-xs font-normal text-[#14234B]">{{ item.value }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Kunjungan -->
    <div class="bg-white rounded-xl border border-slate-200/80 p-6 mb-5">
      <div class="flex items-center gap-2 mb-4">
        <Calendar class="w-4 h-4 text-blue-600" />
        <h2 class="text-sm font-bold text-[#14234B]">Kunjungan</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div v-for="item in visitData" :key="item.label" class="bg-[#F4F7FC] rounded-lg p-3.5">
          <p class="text-[10px] font-normal uppercase tracking-wider text-slate-400 mb-1">{{ item.label }}</p>
          <div class="flex items-center gap-1.5">
            <component :is="item.icon" class="w-3.5 h-3.5" :class="item.color" />
            <p class="text-xs font-normal" :class="item.color">{{ item.value }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Pemeriksaan -->
    <div class="bg-white rounded-xl border border-slate-200/80 p-6 mb-5">
      <div class="flex items-center gap-2 mb-5">
        <ClipboardList class="w-4 h-4 text-blue-600" />
        <h2 class="text-sm font-bold text-[#14234B]">Pemeriksaan</h2>
      </div>

      <!-- Keluhan Utama -->
      <div>
        <div class="flex items-center gap-2 mb-2">
          <MessageSquare class="w-3.5 h-3.5 text-[#6B1D2F]" />
          <p class="text-xs font-normal text-[#14234B]">Keluhan Utama</p>
        </div>
        <div class="bg-rose-50/70 border border-rose-100 rounded-lg p-3.5 text-xs text-slate-700 leading-relaxed">
          "Pasien mengeluh mual muntah sejak 2 minggu terakhir, nafsu makan menurun."
        </div>
      </div>

      <!-- Catatan Khusus & Tanda Vital -->
      <div class="mt-5">
        <div class="flex justify-between items-center mb-2.5">
          <div class="flex items-center gap-2">
            <Activity class="w-3.5 h-3.5 text-blue-600" />
            <p class="text-xs font-normal text-[#14234B]">Catatan Khusus Layanan & Tanda Vital</p>
          </div>
          <span class="text-[11px] text-slate-400">Pemeriksaan Fisik Kebidanan</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <div v-for="v in vitals" :key="v.label" class="bg-[#F4F7FC] rounded-lg p-3">
            <p class="text-[10px] font-normal uppercase tracking-wider text-slate-400 mb-1">{{ v.label }}</p>
            <p class="text-xs font-normal" :class="v.color || 'text-[#14234B]'">{{ v.value }}</p>
          </div>
        </div>
      </div>

      <!-- Diagnosa -->
      <div class="mt-5">
        <div class="flex items-center gap-2 mb-2">
          <Stethoscope class="w-3.5 h-3.5 text-blue-600" />
          <p class="text-xs font-normal text-[#14234B]">Diagnosa Asuhan (Assessment)</p>
        </div>
        <div class="bg-[#F4F7FC] rounded-lg p-3.5 text-xs font-normal text-[#14234B]">
          G1P0A0 Hamil 10-11 Minggu dengan Emesis Gravidarum Ringan
        </div>
      </div>

      <!-- Obat -->
      <div class="mt-6">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <Pill class="w-3.5 h-3.5 text-blue-600" />
            <p class="text-xs font-normal text-[#14234B]">Tindakan: Pemberian Obat & Vitamin Kebidanan</p>
          </div>
          <button class="bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5">
            <Plus class="w-3.5 h-3.5" /> Tambah Obat / Vitamin
          </button>
        </div>
        <div class="border border-slate-100 rounded-lg overflow-hidden">
          <table class="w-full text-left">
            <thead class="bg-[#F4F6FB] text-[10px] font-normal uppercase tracking-wider text-slate-500">
              <tr>
                <th class="px-3 py-2.5">NAMA OBAT / VITAMIN</th>
                <th class="px-3 py-2.5">DOSIS & FREKUENSI</th>
                <th class="px-3 py-2.5">JUMLAH</th>
                <th class="px-3 py-2.5">ATURAN PAKAI</th>
                <th class="px-3 py-2.5">CATATAN PASIEN</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in meds" :key="m.name" class="border-t border-slate-100">
                <td class="px-3 py-2.5">
                  <p class="text-xs font-normal text-[#14234B]">{{ m.name }}</p>
                  <p class="text-[10px] text-slate-400">{{ m.sub }}</p>
                </td>
                <td class="px-3 py-2.5 text-xs text-slate-700">{{ m.dose }}</td>
                <td class="px-3 py-2.5 text-xs font-normal text-[#14234B]">{{ m.qty }}</td>
                <td class="px-3 py-2.5">
                  <span :class="m.badge">{{ m.rule }}</span>
                </td>
                <td class="px-3 py-2.5 text-xs text-slate-500">{{ m.note }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pesan untuk Pasien -->
      <div class="mt-5">
        <div class="flex items-center gap-2 mb-2">
          <BookOpen class="w-3.5 h-3.5 text-blue-600" />
          <p class="text-xs font-normal text-[#14234B]">Pesan untuk Pasien</p>
        </div>
        <div class="bg-[#F4F7FC] rounded-lg p-3.5 text-xs font-semibold text-[#14234B]">
          Edukasi pola makan porsi kecil sering, perbanyak hidrasi air hangat, evaluasi USG trimester 1.
        </div>
      </div>
    </div>

    <div class="flex justify-end mt-6 pb-8">
      <button class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-3 rounded-xl inline-flex items-center gap-2 transition-colors">
        <CheckCircle class="w-4 h-4" /> Simpan & Selesai Kunjungan
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, User, Calendar, ClipboardList, MessageSquare, Activity, Stethoscope, Pill, Plus, CheckCircle, BookOpen, FileText, CreditCard, Cake, Venus, Users, Phone, MapPin, Clock, HeartPulse } from 'lucide-vue-next'

const patientData = [
  { label: 'NO. REKAM MEDIS (RM)', value: 'RM-2024-1042', icon: FileText },
  { label: 'NIK PASIEN', value: '3201124508980004', icon: CreditCard },
  { label: 'NAMA LENGKAP', value: 'Ny. Siti Rahmawati', icon: User },
  { label: 'TANGGAL LAHIR & USIA', value: '14 Mei 1999 (25 Tahun)', icon: Cake },
  { label: 'JENIS KELAMIN', value: 'Perempuan', icon: Venus },
  { label: 'NAMA PENANGGUNG JAWAB', value: 'Bpk. Ahmad Dahlan (Suami)', icon: Users },
  { label: 'NO. HP (WHATSAPP)', value: '0812-8934-1102', icon: Phone },
  { label: 'ALAMAT DOMISILI', value: 'Jl. Melati No. 12, RT 03/RW 05, Kel. Sukamaju', icon: MapPin },
]

const visitData = [
  { label: 'NO. REKAM MEDIS (RM)', value: 'RM-2024-1042', icon: FileText, color: 'text-[#14234B]' },
  { label: 'TANGGAL & WAKTU', value: '24 Okt 2024, 09:30 WIB', icon: Clock, color: 'text-[#14234B]' },
  { label: 'PILIHAN LAYANAN', value: 'ANC Trimester 1', icon: HeartPulse, color: 'text-[#6B1D2F]' },
]

const vitals = [
  { label: 'Tekanan Darah (TD)', value: '110/70 mmHg' },
  { label: 'Berat Badan (BB)', value: '54 kg' },
  { label: 'Tinggi Badan (TB)', value: '158 cm' },
  { label: 'Lingkar Lengan (LILA)', value: '24.5 cm' },
  { label: 'Tinggi Fundus Uteri', value: 'Belum Teraba' },
  { label: 'DJJ & Usia Gestasi', value: 'DJJ (+) / 10-11 Mgg', color: 'text-blue-600' },
]

const meds = [
  { name: 'Vitamin Asam Folat (Folic Acid) 400 mcg', sub: 'Nutrisi Pembentukan Tabung Saraf Janin', dose: '1 x 1 tablet', qty: '30 Tablet', rule: 'Sesudah Makan Pagi', badge: 'bg-blue-100/80 text-blue-700 text-[10px] font-semibold px-2 py-1 rounded-md', note: 'Rutin setiap hari' },
  { name: 'Tablet Tambah Darah (Fe / Zat Besi)', sub: 'Pencegahan Anemia Ibu Hamil', dose: '1 x 1 tablet', qty: '30 Tablet', rule: 'Malam Hari Sebelum Tidur', badge: 'bg-blue-100/80 text-blue-700 text-[10px] font-semibold px-2 py-1 rounded-md', note: 'Minum dengan air putih/jeruk, hindari teh/kopi' },
  { name: 'Vitamin B6 (Pyridoxine) 10 mg', sub: 'Meredakan Mual Muntah (Nausea)', dose: '2 x 1 tablet', qty: '10 Tablet', rule: 'Saat Perut Terasa Mual', badge: 'bg-rose-100/90 text-[#6B1D2F] text-[10px] font-semibold px-2 py-1 rounded-md', note: 'Bila mual sudah mereda boleh dihentikan' },
]
</script>